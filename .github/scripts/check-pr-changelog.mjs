const COMMENT_MARKER = '<!-- react-project-template:pr-changelog-check -->';
const BOT_LOGIN = 'github-actions[bot]';
const CHANGELOG_HEADING = /^###\s+📝\s+Changelog\s*$/m;
const NEXT_SECTION_HEADING = /^###\s+/m;
const SKIP_TITLE = /^(?:docs|chore|test|ci)(?:\([^()\r\n]+\))?!?:\s/;

const COMMENT_BODY = `- 🚨 Please fill in the changelog in the PR description.

  > - Read [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
  > - Describe the impact on users rather than implementation details.

- 🚨 请填写 PR 描述中的 Changelog。

  > - 请阅读[如何维护更新日志](https://keepachangelog.com/zh-CN/1.1.0/)。
  > - 描述改动对使用者的影响，而不是实现细节。

${COMMENT_MARKER}`;

export const shouldSkipChangelog = (title) => SKIP_TITLE.test(title);

const getChangelogSection = (body) => {
  const heading = body.match(CHANGELOG_HEADING);
  if (!heading || heading.index === undefined) return '';

  const content = body.slice(heading.index + heading[0].length);
  const nextHeadingIndex = content.search(NEXT_SECTION_HEADING);

  return nextHeadingIndex === -1 ? content : content.slice(0, nextHeadingIndex);
};

const getRowValue = (section, label) => {
  for (const line of section.split(/\r?\n/)) {
    const cells = line.split('|').map((cell) => cell.trim());
    const labelIndex = cells.indexOf(label);
    if (labelIndex !== -1) return cells[labelIndex + 1] ?? '';
  }

  return '';
};

export const hasRequiredChangelog = (body) => {
  const section = getChangelogSection(body);
  const english = getRowValue(section, '🇺🇸 English');
  const chinese = getRowValue(section, '🇨🇳 中文');

  return Boolean(english && chinese);
};

export default async ({ github, context, core }) => {
  const pullRequest = context.payload.pull_request;
  if (!pullRequest) {
    core.setFailed('The workflow must be triggered by a pull request.');
    return;
  }

  const { owner, repo } = context.repo;
  const issueNumber = pullRequest.number;
  const comments = await github.paginate(github.rest.issues.listComments, {
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  });
  const reminders = comments.filter(
    (comment) => comment.user?.login === BOT_LOGIN && comment.body?.includes(COMMENT_MARKER),
  );

  const deleteReminders = async () => {
    await Promise.all(
      reminders.map((comment) =>
        github.rest.issues.deleteComment({ owner, repo, comment_id: comment.id }),
      ),
    );
  };

  if (shouldSkipChangelog(pullRequest.title) || hasRequiredChangelog(pullRequest.body ?? '')) {
    await deleteReminders();
    return;
  }

  if (reminders.length > 0) {
    const [reminder, ...duplicates] = reminders;
    await github.rest.issues.updateComment({
      owner,
      repo,
      comment_id: reminder.id,
      body: COMMENT_BODY,
    });
    await Promise.all(
      duplicates.map((comment) =>
        github.rest.issues.deleteComment({ owner, repo, comment_id: comment.id }),
      ),
    );
  } else {
    await github.rest.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: COMMENT_BODY,
    });
  }

  core.setFailed('The PR changelog must include both English and Chinese descriptions.');
};
