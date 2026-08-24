import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  createReadStream,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ARTIFACTS_DIRECTORY = 'artifacts';
const DEFAULT_RELEASE_PLATFORM = 'linux/amd64';
const DOCKER_TAG_PATTERN = /^[\w][\w.-]{0,127}$/;
const PACKAGE_FILE = 'package.json';
const REMOTE = 'origin';
const RELEASE_TAG_CONFIG_KEY = 'react-project-template.release-tag';
const RELEASE_TAG_MARKER = 'Created-By: react-project-template release command';
const RELEASE_TYPES = ['major', 'minor', 'patch'];
const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-rc\.(0|[1-9]\d*))?$/;
const USAGE = `Usage:
  ut run major [--rc]
  ut run minor [--rc]
  ut run patch [--rc]
  ut run tag [--<prefix>]
  ut run release`;

const toSafeInteger = (value, version) => {
  const number = Number(value);
  if (!Number.isSafeInteger(number)) throw new Error(`Invalid release version: ${version}`);

  return number;
};

export const parseVersion = (version) => {
  const match = VERSION_PATTERN.exec(version);
  if (!match) throw new Error(`Invalid release version: ${version}`);

  return {
    major: toSafeInteger(match[1], version),
    minor: toSafeInteger(match[2], version),
    patch: toSafeInteger(match[3], version),
    rc: match[4] === undefined ? undefined : toSafeInteger(match[4], version),
  };
};

export const getNextVersion = (version, releaseType, isRc = false) => {
  if (!RELEASE_TYPES.includes(releaseType)) throw new Error(`Invalid release type: ${releaseType}`);

  const current = parseVersion(version);
  if (current.rc !== undefined) {
    const stableVersion = `${current.major}.${current.minor}.${current.patch}`;

    return isRc ? `${stableVersion}-rc.${current.rc + 1}` : stableVersion;
  }

  const next = { major: current.major, minor: current.minor, patch: current.patch };
  if (releaseType === 'major') {
    next.major += 1;
    next.minor = 0;
    next.patch = 0;
  } else if (releaseType === 'minor') {
    next.minor += 1;
    next.patch = 0;
  } else {
    next.patch += 1;
  }

  const nextVersion = `${next.major}.${next.minor}.${next.patch}`;

  return isRc ? `${nextVersion}-rc.1` : nextVersion;
};

const getPackagePath = (cwd) => resolve(cwd, PACKAGE_FILE);

const getPackage = (cwd) => JSON.parse(readFileSync(getPackagePath(cwd), 'utf8'));

export const getPackageVersion = (cwd) => {
  const version = getPackage(cwd).version;
  if (typeof version !== 'string') throw new Error('package.json must define a version.');

  parseVersion(version);

  return version;
};

const setPackageVersion = (cwd, targetVersion) => {
  const packageJson = getPackage(cwd);
  const currentVersion = getPackageVersion(cwd);

  packageJson.version = targetVersion;
  writeFileSync(getPackagePath(cwd), `${JSON.stringify(packageJson, null, 2)}\n`);

  return { currentVersion, targetVersion };
};

const runGit = (cwd, args) =>
  execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();

const tryGit = (cwd, args) => {
  const result = spawnSync('git', args, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  return {
    output: result.stdout.trim(),
    status: result.status,
  };
};

const assertCleanWorktree = (cwd) => {
  if (runGit(cwd, ['status', '--porcelain'])) {
    throw new Error('Version and tag commands require a clean working tree.');
  }
};

export const bumpPackageVersion = (cwd, releaseType, isRc = false) => {
  assertCleanWorktree(cwd);

  const packageFile = getPackagePath(cwd);
  const packageSource = readFileSync(packageFile, 'utf8');
  const currentVersion = getPackageVersion(cwd);
  const targetVersion = getNextVersion(currentVersion, releaseType, isRc);
  try {
    setPackageVersion(cwd, targetVersion);
    runGit(cwd, ['add', '--', PACKAGE_FILE]);
    runGit(cwd, ['commit', '--message', `chore: release ${targetVersion}`, '--', PACKAGE_FILE]);
  } catch (error) {
    tryGit(cwd, ['reset', '--quiet', 'HEAD', '--', PACKAGE_FILE]);
    writeFileSync(packageFile, packageSource);
    throw error;
  }

  return {
    commit: runGit(cwd, ['rev-parse', 'HEAD']),
    currentVersion,
    targetVersion,
  };
};

export const validateReleaseVersion = (cwd) => {
  const version = getPackageVersion(cwd);
  if (version === '0.0.0') throw new Error('Run major, minor, or patch before creating a tag.');

  return version;
};

export const getTagPrefix = (option) => {
  if (option === undefined) return 'v';

  const match = /^--([a-zA-Z0-9][a-zA-Z0-9._-]*)$/.exec(option);
  if (!match) throw new Error(`Invalid tag prefix option: ${option}`);

  return match[1].endsWith('-') ? match[1] : `${match[1]}-`;
};

export const getReleaseTag = (cwd, prefixOption) => {
  const tag = `${getTagPrefix(prefixOption)}${validateReleaseVersion(cwd)}`;
  if (tryGit(cwd, ['check-ref-format', `refs/tags/${tag}`]).status !== 0) {
    throw new Error(`Invalid release tag: ${tag}`);
  }

  return tag;
};

const getArtifactName = (name) => {
  if (typeof name !== 'string') throw new Error('package.json must define a name.');

  const artifactName = name
    .replace(/^@/, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  if (!artifactName) throw new Error('package.json must define a valid artifact name.');

  return artifactName;
};

export const getReleaseImage = (cwd, tag) => {
  if (!DOCKER_TAG_PATTERN.test(tag)) {
    throw new Error(`Tag cannot be used as a Docker image tag: ${tag}`);
  }

  return `${getArtifactName(getPackage(cwd).name)}:${tag}`;
};

export const getReleasePlatform = (env = process.env) => {
  const platform = env.RELEASE_PLATFORM ?? DEFAULT_RELEASE_PLATFORM;
  if (!/^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*(?:\/[a-z0-9][a-z0-9._-]*)?$/i.test(platform)) {
    throw new Error(`Invalid release platform: ${platform}`);
  }

  return platform;
};

const getReleaseTagMessage = (tag, version, head) =>
  [`Release ${tag}`, '', RELEASE_TAG_MARKER, `Version: ${version}`, `Commit: ${head}`].join('\n');

const getPreparedReleaseTags = (cwd) =>
  runGit(cwd, ['for-each-ref', '--format=%(refname:short)%09%(objecttype)', 'refs/tags'])
    .split('\n')
    .filter(Boolean)
    .map((line) => line.split('\t'))
    .filter(([, objectType]) => objectType === 'tag')
    .map(([tag]) => {
      const message = runGit(cwd, ['for-each-ref', '--format=%(contents)', `refs/tags/${tag}`]);
      const lines = message.split('\n');
      const version = lines[3]?.replace('Version: ', '');
      const head = lines[4]?.replace('Commit: ', '');
      if (!version || !head) return undefined;

      try {
        parseVersion(version);
      } catch {
        return undefined;
      }

      try {
        const tagHead = runGit(cwd, ['rev-parse', `${tag}^{commit}`]);
        if (tagHead !== head || message !== getReleaseTagMessage(tag, version, head)) {
          return undefined;
        }

        const packageJson = JSON.parse(runGit(cwd, ['show', `${head}:${PACKAGE_FILE}`]));
        if (packageJson.version !== version) return undefined;
      } catch {
        return undefined;
      }

      return { head, tag, version };
    })
    .filter(Boolean);

const getRemoteTagObject = (cwd, tag) => {
  const output = runGit(cwd, ['ls-remote', '--tags', REMOTE, `refs/tags/${tag}`]);

  return output ? output.split('\t')[0] : undefined;
};

const getPreparedReleaseTag = (cwd, tag) =>
  getPreparedReleaseTags(cwd).find((preparedTag) => preparedTag.tag === tag);

export const validateReleaseTag = (cwd, prefixOption) => {
  assertCleanWorktree(cwd);

  const head = runGit(cwd, ['rev-parse', 'HEAD']);
  const version = validateReleaseVersion(cwd);
  const tag = `${getTagPrefix(prefixOption)}${version}`;
  if (tryGit(cwd, ['check-ref-format', `refs/tags/${tag}`]).status !== 0) {
    throw new Error(`Invalid release tag: ${tag}`);
  }
  getReleaseImage(cwd, tag);

  const exists = tryGit(cwd, ['show-ref', '--verify', '--quiet', `refs/tags/${tag}`]).status === 0;
  if (exists) {
    const preparedTag = getPreparedReleaseTag(cwd, tag);
    if (!preparedTag || preparedTag.head !== head || preparedTag.version !== version) {
      throw new Error(`Tag already exists locally and does not match the current release: ${tag}`);
    }
  }

  return { exists, head, tag, version };
};

export const createReleaseTag = (cwd, prefixOption) => {
  const { exists, head, tag, version } = validateReleaseTag(cwd, prefixOption);

  if (!exists) {
    runGit(cwd, ['tag', '--annotate', tag, '--message', getReleaseTagMessage(tag, version, head)]);
  }

  return { created: !exists, head, tag, version };
};

export const pushReleaseTag = (cwd, tag) => {
  const preparedTag = getPreparedReleaseTag(cwd, tag);
  if (!preparedTag) throw new Error(`Tag was not prepared by the tag command: ${tag}`);

  const localTagObject = runGit(cwd, ['rev-parse', `refs/tags/${tag}`]);
  const remoteTagObject = getRemoteTagObject(cwd, tag);
  if (remoteTagObject && remoteTagObject !== localTagObject) {
    throw new Error(`Remote tag points to a different object: ${tag}`);
  }

  if (!remoteTagObject) runGit(cwd, ['push', REMOTE, `refs/tags/${tag}`]);
  runGit(cwd, ['config', '--local', RELEASE_TAG_CONFIG_KEY, tag]);

  return { remote: REMOTE, tag };
};

export const clearReleaseTagSelection = (cwd) => {
  tryGit(cwd, ['config', '--local', '--unset-all', RELEASE_TAG_CONFIG_KEY]);
};

export const createAndPushReleaseTag = (cwd, prefixOption) => {
  clearReleaseTagSelection(cwd);
  const { tag } = createReleaseTag(cwd, prefixOption);

  return pushReleaseTag(cwd, tag);
};

export const getReleaseContext = (cwd) => {
  const selectedTag = tryGit(cwd, ['config', '--local', '--get', RELEASE_TAG_CONFIG_KEY]);
  if (selectedTag.status !== 0 || !selectedTag.output) {
    throw new Error('No release tag selected. Run tag before release.');
  }

  const preparedTag = getPreparedReleaseTag(cwd, selectedTag.output);
  if (!preparedTag) {
    throw new Error(`Selected tag was not prepared by the tag command: ${selectedTag.output}`);
  }

  assertCleanWorktree(cwd);
  const currentHead = runGit(cwd, ['rev-parse', 'HEAD']);
  if (preparedTag.head !== currentHead) {
    throw new Error(`Checkout the tagged commit before releasing: ${preparedTag.tag}`);
  }

  const packageJson = getPackage(cwd);
  if (packageJson.version !== preparedTag.version) {
    throw new Error(`package.json version does not match ${preparedTag.tag}.`);
  }

  return { name: packageJson.name, ...preparedTag };
};

const getFileSha256 = (file) =>
  new Promise((resolveHash, rejectHash) => {
    const hash = createHash('sha256');
    const stream = createReadStream(file);
    stream.on('data', (data) => hash.update(data));
    stream.on('error', rejectHash);
    stream.on('end', () => resolveHash(hash.digest('hex')));
  });

const runCommand = (cwd, command, args, env) => {
  execFileSync(command, args, { cwd, env, stdio: 'inherit' });
};

const runCommandOutput = (cwd, command, args, env) =>
  execFileSync(command, args, {
    cwd,
    encoding: 'utf8',
    env,
    stdio: ['ignore', 'pipe', 'inherit'],
  }).trim();

const removeContainer = (cwd, container, env) => {
  spawnSync('docker', ['rm', '--force', container], {
    cwd,
    encoding: 'utf8',
    env,
    stdio: 'ignore',
  });
};

export const createReleaseArtifacts = async (cwd, env = process.env) => {
  const { head, name, tag, version } = getReleaseContext(cwd);
  const artifactName = getArtifactName(name);
  const image = getReleaseImage(cwd, tag);
  const platform = getReleasePlatform(env);
  const viteApiBaseUrl = env.VITE_API_BASE_URL ?? '';
  const artifactsRoot = resolve(cwd, ARTIFACTS_DIRECTORY);
  const targetDirectory = join(artifactsRoot, tag);
  if (existsSync(targetDirectory)) {
    throw new Error(`Release artifacts already exist: ${targetDirectory}`);
  }

  mkdirSync(artifactsRoot, { recursive: true });
  const temporaryDirectory = mkdtempSync(join(artifactsRoot, '.release-'));
  const staticArchiveName = `${artifactName}-${tag}-static.tar.gz`;
  const imageArchiveName = `${artifactName}-${tag}-nginx-image.tar`;
  const staticArchive = join(temporaryDirectory, staticArchiveName);
  const imageArchive = join(temporaryDirectory, imageArchiveName);
  const distDirectory = join(temporaryDirectory, 'dist');

  try {
    runCommand(
      cwd,
      'docker',
      [
        'buildx',
        'build',
        '--load',
        '--platform',
        platform,
        '--build-arg',
        `VITE_API_BASE_URL=${viteApiBaseUrl}`,
        '--tag',
        image,
        '--label',
        `org.opencontainers.image.version=${version}`,
        '--label',
        `org.opencontainers.image.revision=${head}`,
        '--label',
        `org.opencontainers.image.ref.name=${tag}`,
        '.',
      ],
      env,
    );

    const container = runCommandOutput(
      cwd,
      'docker',
      ['create', '--platform', platform, image],
      env,
    );
    mkdirSync(distDirectory);
    try {
      runCommand(cwd, 'docker', ['cp', `${container}:/usr/share/nginx/html/.`, distDirectory], env);
    } finally {
      removeContainer(cwd, container, env);
    }

    runCommand(
      cwd,
      'tar',
      ['--create', '--gzip', '--file', staticArchive, '--directory', temporaryDirectory, 'dist'],
      env,
    );
    runCommand(cwd, 'docker', ['save', '--output', imageArchive, image], env);

    const manifest = {
      commit: head,
      image,
      imageArchive: imageArchiveName,
      platform,
      staticArchive: staticArchiveName,
      tag,
      version,
      viteApiBaseUrl,
    };
    const manifestFile = join(temporaryDirectory, 'manifest.json');
    writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);

    const checksumFiles = [imageArchiveName, staticArchiveName, 'manifest.json'];
    const checksums = await Promise.all(
      checksumFiles.map(
        async (file) => `${await getFileSha256(join(temporaryDirectory, file))}  ${file}`,
      ),
    );
    writeFileSync(join(temporaryDirectory, 'SHA256SUMS'), `${checksums.join('\n')}\n`);
    renameSync(temporaryDirectory, targetDirectory);
  } catch (error) {
    rmSync(temporaryDirectory, { force: true, recursive: true });
    throw error;
  }

  return { directory: targetDirectory, image, tag };
};

const runReleaseChecks = (cwd) => {
  for (const script of [
    'format:check',
    'lint',
    'typecheck',
    'test:coverage',
    'test:workflow',
    'test:release',
    'test:e2e',
    'build',
  ]) {
    execFileSync('ut', ['run', script], { cwd, stdio: 'inherit' });
  }
};

const main = async () => {
  const [command, value, ...rest] = process.argv.slice(2);

  if (
    command === 'bump' &&
    RELEASE_TYPES.includes(value) &&
    (rest.length === 0 || (rest.length === 1 && rest[0] === '--rc'))
  ) {
    const result = bumpPackageVersion(process.cwd(), value, rest[0] === '--rc');
    console.log(
      `Version committed: ${result.currentVersion} -> ${result.targetVersion} (${result.commit})`,
    );
    return;
  }

  if (command === 'tag' && rest.length === 0) {
    clearReleaseTagSelection(process.cwd());
    validateReleaseTag(process.cwd(), value);
    runReleaseChecks(process.cwd());
    const { tag } = createReleaseTag(process.cwd(), value);
    const result = pushReleaseTag(process.cwd(), tag);
    console.log(`Created and pushed annotated tag: ${result.tag}`);
    return;
  }

  if (command === 'release' && value === undefined && rest.length === 0) {
    const result = await createReleaseArtifacts(process.cwd());
    console.log(`Created release artifacts for ${result.tag}: ${result.directory}`);
    return;
  }

  throw new Error(USAGE);
};

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
