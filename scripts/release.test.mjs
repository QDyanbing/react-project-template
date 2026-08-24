import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  bumpPackageVersion,
  createAndPushReleaseTag,
  createReleaseArtifacts,
  createReleaseTag,
  getNextVersion,
  getReleaseContext,
  getReleaseImage,
  getReleasePlatform,
  getReleaseTag,
  getTagPrefix,
  parseVersion,
  pushReleaseTag,
  validateReleaseTag,
  validateReleaseVersion,
} from './release.mjs';

const git = (cwd, args) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const writePackage = (cwd, version) => {
  writeFileSync(
    join(cwd, 'package.json'),
    `${JSON.stringify({ name: 'release-test', version }, null, 2)}\n`,
  );
};

const createRepository = (t, version = '1.0.0') => {
  const directory = mkdtempSync(join(tmpdir(), 'release-test-'));
  const remote = join(directory, 'remote.git');
  const repository = join(directory, 'repository');
  t.after(() => rmSync(directory, { force: true, recursive: true }));

  git(directory, ['init', '--bare', '--initial-branch=master', remote]);
  git(directory, ['init', '--initial-branch=master', repository]);
  git(repository, ['config', 'user.email', 'release@example.com']);
  git(repository, ['config', 'user.name', 'Release Test']);
  git(repository, ['remote', 'add', 'origin', remote]);
  writePackage(repository, version);
  writeFileSync(join(repository, '.gitignore'), 'artifacts/\ndist/\ntest-bin/\n');
  git(repository, ['add', '.gitignore', 'package.json']);
  git(repository, ['commit', '--message', 'chore: initialize release test']);
  git(repository, ['push', '--set-upstream', 'origin', 'master']);
  git(repository, ['remote', 'set-head', 'origin', '--auto']);

  return repository;
};

const writeExecutable = (file, source) => {
  writeFileSync(file, source);
  chmodSync(file, 0o755);
};

const createReleaseEnvironment = (repository) => {
  const bin = join(repository, 'test-bin');
  mkdirSync(bin);
  writeExecutable(
    join(bin, 'docker'),
    `#!/usr/bin/env node
import { appendFileSync, mkdirSync, writeFileSync } from 'node:fs';
appendFileSync(process.env.RELEASE_COMMAND_LOG, JSON.stringify(process.argv.slice(2)) + '\\n');
const command = process.argv[2];
if ((command === 'buildx' && process.argv[3] === 'build') || command === 'rm') process.exit(0);
if (command === 'create') {
  console.log('mock-container');
  process.exit(0);
}
if (command === 'cp') {
  const target = process.argv.at(-1);
  mkdirSync(target, { recursive: true });
  writeFileSync(target + '/index.html', '<div id="root"></div>\\n');
  process.exit(0);
}
if (command === 'save') {
  const outputIndex = process.argv.indexOf('--output');
  if (outputIndex === -1) process.exit(1);
  writeFileSync(process.argv[outputIndex + 1], 'mock nginx image archive\\n');
  process.exit(0);
}
process.exit(1);
`,
  );

  return {
    ...process.env,
    PATH: `${bin}:${process.env.PATH}`,
    RELEASE_COMMAND_LOG: join(bin, 'commands.log'),
  };
};

const getSha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');

test('accepts stable and rc release versions', () => {
  assert.deepEqual(parseVersion('1.2.3'), { major: 1, minor: 2, patch: 3, rc: undefined });
  assert.deepEqual(parseVersion('1.2.3-rc.4'), { major: 1, minor: 2, patch: 3, rc: 4 });
});

test('rejects unsupported release versions', () => {
  for (const version of ['v1.2.3', '01.2.3', '1.2', '1.2.3-beta.1', '1.2.3+build']) {
    assert.throws(() => parseVersion(version), /Invalid release version/);
  }
});

test('increments major, minor, and patch versions', () => {
  assert.equal(getNextVersion('1.4.0', 'major'), '2.0.0');
  assert.equal(getNextVersion('1.4.0', 'minor'), '1.5.0');
  assert.equal(getNextVersion('1.4.0', 'patch'), '1.4.1');
});

test('creates, increments, and promotes release candidates', () => {
  assert.equal(getNextVersion('1.4.0', 'minor', true), '1.5.0-rc.1');
  for (const releaseType of ['major', 'minor', 'patch']) {
    assert.equal(getNextVersion('1.5.0-rc.1', releaseType, true), '1.5.0-rc.2');
    assert.equal(getNextVersion('1.5.0-rc.2', releaseType), '1.5.0');
  }
});

test('rejects the placeholder version during release checks', (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'release-version-'));
  t.after(() => rmSync(directory, { force: true, recursive: true }));
  writePackage(directory, '0.0.0');

  assert.throws(() => validateReleaseVersion(directory), /Run major, minor, or patch/);
});

test('bumps and commits a version without depending on a branch or remote', (t) => {
  const repository = createRepository(t);
  git(repository, ['remote', 'remove', 'origin']);
  git(repository, ['switch', '--create', 'release-1-0-1']);
  const previousHead = git(repository, ['rev-parse', 'HEAD']);

  const result = bumpPackageVersion(repository, 'patch');

  assert.equal(result.currentVersion, '1.0.0');
  assert.equal(result.targetVersion, '1.0.1');
  assert.notEqual(result.commit, previousHead);
  assert.equal(JSON.parse(readFileSync(join(repository, 'package.json'), 'utf8')).version, '1.0.1');
  assert.equal(git(repository, ['log', '-1', '--pretty=%s']), 'chore: release 1.0.1');
  assert.equal(git(repository, ['status', '--porcelain']), '');
});

test('restores the package version when the version commit fails', (t) => {
  const repository = createRepository(t);
  const hook = join(repository, '.git', 'hooks', 'pre-commit');
  writeExecutable(hook, '#!/bin/sh\nexit 1\n');

  assert.throws(() => bumpPackageVersion(repository, 'patch'));
  assert.equal(JSON.parse(readFileSync(join(repository, 'package.json'), 'utf8')).version, '1.0.0');
  assert.equal(git(repository, ['status', '--porcelain']), '');

  rmSync(hook);
  assert.equal(bumpPackageVersion(repository, 'patch').targetVersion, '1.0.1');
});

test('uses the default or command tag prefix', (t) => {
  const repository = createRepository(t, '1.4.0');

  assert.equal(getTagPrefix(), 'v');
  assert.equal(getTagPrefix('--weilai'), 'weilai-');
  assert.equal(getReleaseTag(repository), 'v1.4.0');
  assert.equal(getReleaseTag(repository, '--weilai'), 'weilai-1.4.0');
  assert.equal(getReleaseImage(repository, 'weilai-1.4.0'), 'release-test:weilai-1.4.0');
  assert.throws(() => getTagPrefix('--weilai/release'), /Invalid tag prefix/);
  assert.throws(
    () => validateReleaseTag(repository, `--${'a'.repeat(130)}`),
    /cannot be used as a Docker image tag/,
  );
});

test('uses an explicit release image platform', () => {
  assert.equal(getReleasePlatform({}), 'linux/amd64');
  assert.equal(getReleasePlatform({ RELEASE_PLATFORM: 'linux/arm64' }), 'linux/arm64');
  assert.throws(
    () => getReleasePlatform({ RELEASE_PLATFORM: 'arm64' }),
    /Invalid release platform/,
  );
});

test('validates a release tag for the current clean commit on any branch', (t) => {
  const repository = createRepository(t, '1.1.0');

  git(repository, ['switch', '--create', 'release-1-1-0']);
  writeFileSync(join(repository, 'release-note.md'), 'Release note\n');
  git(repository, ['add', 'release-note.md']);
  git(repository, ['commit', '--message', 'docs: add release note']);

  assert.deepEqual(validateReleaseTag(repository, '--weilai'), {
    exists: false,
    head: git(repository, ['rev-parse', 'HEAD']),
    tag: 'weilai-1.1.0',
    version: '1.1.0',
  });

  writeFileSync(join(repository, 'work-in-progress.txt'), 'Uncommitted work\n');
  assert.throws(() => validateReleaseTag(repository), /clean working tree/);
});

test('creates an annotated custom tag without a remote', (t) => {
  const repository = createRepository(t, '1.1.0');
  git(repository, ['remote', 'remove', 'origin']);

  const result = createReleaseTag(repository, '--weilai');
  assert.equal(result.created, true);
  assert.equal(result.tag, 'weilai-1.1.0');
  assert.equal(git(repository, ['cat-file', '-t', 'weilai-1.1.0']), 'tag');
  assert.equal(createReleaseTag(repository, '--weilai').created, false);
});

test('creates and pushes different tag prefixes for the same version', (t) => {
  const repository = createRepository(t, '1.1.0');
  const head = git(repository, ['rev-parse', 'HEAD']);

  createAndPushReleaseTag(repository);
  createAndPushReleaseTag(repository, '--weilai');

  assert.equal(git(repository, ['rev-list', '--max-count=1', 'v1.1.0']), head);
  assert.equal(git(repository, ['rev-list', '--max-count=1', 'weilai-1.1.0']), head);
  assert.match(
    git(repository, ['ls-remote', '--tags', 'origin', 'refs/tags/v1.1.0']),
    /refs\/tags\/v1\.1\.0/,
  );
  assert.match(
    git(repository, ['ls-remote', '--tags', 'origin', 'refs/tags/weilai-1.1.0']),
    /refs\/tags\/weilai-1\.1\.0/,
  );
  assert.equal(
    git(repository, ['config', '--local', '--get', 'react-project-template.release-tag']),
    'weilai-1.1.0',
  );
});

test('only pushes a tag prepared by the tag command', (t) => {
  const repository = createRepository(t, '1.1.0');

  git(repository, ['tag', 'v1.1.0']);
  assert.throws(() => pushReleaseTag(repository, 'v1.1.0'), /not prepared by the tag command/);
});

test('pushes the prepared tag to origin and can retry safely', (t) => {
  const repository = createRepository(t, '1.1.0');

  assert.deepEqual(createAndPushReleaseTag(repository, '--weilai'), {
    remote: 'origin',
    tag: 'weilai-1.1.0',
  });
  assert.match(
    git(repository, ['ls-remote', '--tags', 'origin', 'refs/tags/weilai-1.1.0']),
    /refs\/tags\/weilai-1\.1\.0/,
  );
  assert.deepEqual(createAndPushReleaseTag(repository, '--weilai'), {
    remote: 'origin',
    tag: 'weilai-1.1.0',
  });
});

test('clears the previous release selection when a new tag cannot be pushed', (t) => {
  const repository = createRepository(t, '1.1.0');

  createAndPushReleaseTag(repository);
  git(repository, ['remote', 'set-url', 'origin', join(repository, 'missing.git')]);
  assert.throws(() => createAndPushReleaseTag(repository, '--weilai'));
  assert.throws(() => getReleaseContext(repository), /No release tag selected/);
});

test('requires the selected pushed tag and its commit for release', (t) => {
  const repository = createRepository(t, '1.1.0');

  assert.throws(() => getReleaseContext(repository), /Run tag before release/);
  createAndPushReleaseTag(repository);
  assert.deepEqual(getReleaseContext(repository), {
    head: git(repository, ['rev-parse', 'HEAD']),
    name: 'release-test',
    tag: 'v1.1.0',
    version: '1.1.0',
  });

  git(repository, ['switch', '--create', 'next-version']);
  writePackage(repository, '1.2.0');
  git(repository, ['add', 'package.json']);
  git(repository, ['commit', '--message', 'chore: prepare next version']);
  assert.throws(() => getReleaseContext(repository), /Checkout the tagged commit/);
});

test('uses the selected tag for release without querying origin again', (t) => {
  const repository = createRepository(t, '1.1.0');

  createAndPushReleaseTag(repository);
  git(repository, ['remote', 'set-url', 'origin', join(repository, 'offline.git')]);

  assert.deepEqual(getReleaseContext(repository), {
    head: git(repository, ['rev-parse', 'HEAD']),
    name: 'release-test',
    tag: 'v1.1.0',
    version: '1.1.0',
  });
});

test('builds static and nginx image delivery artifacts for the selected tag', async (t) => {
  const repository = createRepository(t, '1.1.0');
  const env = {
    ...createReleaseEnvironment(repository),
    RELEASE_PLATFORM: 'linux/arm64',
    VITE_API_BASE_URL: 'https://api.example.com',
  };

  createAndPushReleaseTag(repository, '--weilai');
  const result = await createReleaseArtifacts(repository, env);
  const directory = join(repository, 'artifacts', 'weilai-1.1.0');

  assert.deepEqual(result, {
    directory,
    image: 'release-test:weilai-1.1.0',
    tag: 'weilai-1.1.0',
  });
  assert.equal(existsSync(join(directory, 'release-test-weilai-1.1.0-static.tar.gz')), true);
  assert.equal(existsSync(join(directory, 'release-test-weilai-1.1.0-nginx-image.tar')), true);
  assert.match(
    execFileSync(
      'tar',
      ['--list', '--gzip', '--file', join(directory, 'release-test-weilai-1.1.0-static.tar.gz')],
      { encoding: 'utf8' },
    ),
    /dist\/index\.html/,
  );

  const manifest = JSON.parse(readFileSync(join(directory, 'manifest.json'), 'utf8'));
  assert.deepEqual(manifest, {
    commit: git(repository, ['rev-parse', 'HEAD']),
    image: 'release-test:weilai-1.1.0',
    imageArchive: 'release-test-weilai-1.1.0-nginx-image.tar',
    platform: 'linux/arm64',
    staticArchive: 'release-test-weilai-1.1.0-static.tar.gz',
    tag: 'weilai-1.1.0',
    version: '1.1.0',
    viteApiBaseUrl: 'https://api.example.com',
  });

  const commands = readFileSync(env.RELEASE_COMMAND_LOG, 'utf8')
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.deepEqual(
    commands.map(([command]) => command),
    ['buildx', 'create', 'cp', 'rm', 'save'],
  );
  assert.deepEqual(commands[0].slice(0, 8), [
    'buildx',
    'build',
    '--load',
    '--platform',
    'linux/arm64',
    '--build-arg',
    'VITE_API_BASE_URL=https://api.example.com',
    '--tag',
  ]);
  assert.equal(commands[1][2], 'linux/arm64');
  assert.equal(commands[2][1], 'mock-container:/usr/share/nginx/html/.');

  const checksums = new Map(
    readFileSync(join(directory, 'SHA256SUMS'), 'utf8')
      .trim()
      .split('\n')
      .map((line) => line.split('  ').reverse()),
  );
  for (const file of [
    'release-test-weilai-1.1.0-nginx-image.tar',
    'release-test-weilai-1.1.0-static.tar.gz',
    'manifest.json',
  ]) {
    assert.equal(checksums.get(file), getSha256(join(directory, file)));
  }
});
