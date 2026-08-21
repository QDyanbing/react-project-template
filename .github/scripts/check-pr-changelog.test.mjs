import assert from 'node:assert/strict';
import test from 'node:test';
import checkPullRequestChangelog, {
  hasRequiredChangelog,
  shouldSkipChangelog,
} from './check-pr-changelog.mjs';

const COMMENT_MARKER = '<!-- react-project-template:pr-changelog-check -->';

const createBody = ({ english = '', chinese = '' } = {}) => `### 📝 Changelog

| 语言       | 变更说明 |
| ---------- | -------- |
| 🇺🇸 English | ${english} |
| 🇨🇳 中文    | ${chinese} |`;

const createRuntime = ({
  title = 'feat: add feature',
  body = createBody(),
  comments = [],
} = {}) => {
  const calls = {
    create: [],
    update: [],
    delete: [],
    failures: [],
  };
  const github = {
    paginate: async () => comments,
    rest: {
      issues: {
        listComments: () => {},
        createComment: async (params) => calls.create.push(params),
        updateComment: async (params) => calls.update.push(params),
        deleteComment: async (params) => calls.delete.push(params),
      },
    },
  };
  const context = {
    repo: { owner: 'owner', repo: 'repo' },
    payload: { pull_request: { number: 1, title, body } },
  };
  const core = {
    setFailed: (message) => calls.failures.push(message),
  };

  return { calls, core, context, github };
};

test('requires both changelog languages', () => {
  assert.equal(hasRequiredChangelog(createBody()), false);
  assert.equal(hasRequiredChangelog(createBody({ english: 'Add feature' })), false);
  assert.equal(hasRequiredChangelog(createBody({ chinese: '新增功能' })), false);
  assert.equal(
    hasRequiredChangelog(createBody({ english: 'Add feature', chinese: '新增功能' })),
    true,
  );
});

test('only skips supported conventional commit titles', () => {
  assert.equal(shouldSkipChangelog('docs: update guide'), true);
  assert.equal(shouldSkipChangelog('chore(deps): update package'), true);
  assert.equal(shouldSkipChangelog('docs-feature: bypass check'), false);
  assert.equal(shouldSkipChangelog('feat: add feature'), false);
});

test('creates a reminder and fails when changelog is empty', async () => {
  const runtime = createRuntime();

  await checkPullRequestChangelog(runtime);

  assert.equal(runtime.calls.create.length, 1);
  assert.equal(runtime.calls.failures.length, 1);
});

test('updates an existing reminder and still fails', async () => {
  const runtime = createRuntime({
    comments: [
      {
        id: 1,
        body: COMMENT_MARKER,
        user: { login: 'github-actions[bot]' },
      },
    ],
  });

  await checkPullRequestChangelog(runtime);

  assert.equal(runtime.calls.update.length, 1);
  assert.equal(runtime.calls.failures.length, 1);
});

test('ignores a forged reminder marker from a contributor', async () => {
  const runtime = createRuntime({
    comments: [
      {
        id: 1,
        body: COMMENT_MARKER,
        user: { login: 'contributor' },
      },
    ],
  });

  await checkPullRequestChangelog(runtime);

  assert.equal(runtime.calls.create.length, 1);
  assert.equal(runtime.calls.update.length, 0);
  assert.equal(runtime.calls.failures.length, 1);
});

test('removes reminders after the changelog becomes valid', async () => {
  const runtime = createRuntime({
    body: createBody({ english: 'Add feature', chinese: '新增功能' }),
    comments: [
      {
        id: 1,
        body: COMMENT_MARKER,
        user: { login: 'github-actions[bot]' },
      },
    ],
  });

  await checkPullRequestChangelog(runtime);

  assert.equal(runtime.calls.delete.length, 1);
  assert.equal(runtime.calls.failures.length, 0);
});

test('skips documentation PRs and removes stale reminders', async () => {
  const runtime = createRuntime({
    title: 'docs: update guide',
    comments: [
      {
        id: 1,
        body: COMMENT_MARKER,
        user: { login: 'github-actions[bot]' },
      },
    ],
  });

  await checkPullRequestChangelog(runtime);

  assert.equal(runtime.calls.delete.length, 1);
  assert.equal(runtime.calls.failures.length, 0);
});
