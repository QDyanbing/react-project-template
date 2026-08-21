---
name: create-pr
description: Prepare and create pull requests for this repository from a non-master branch using the repository PR template. Use when the user asks to draft, open, or create a PR; the title must be English, the body Chinese, and creation requires confirmation of the final draft.
---

# Create Pull Request

基于当前分支相对 `master` 的全部提交准备 Pull Request，并使用 `.github/PULL_REQUEST_TEMPLATE.md`。不要只分析最后一个 Commit 或工作区未提交内容。

## 不可突破的边界

- 禁止直接从 `master` 创建改动或提交；当前分支是 `master` 时停止，并先创建符合 `aaa-bbb-ccc` 规则的独立分支。
- PR 的 Base 默认为 `master`；只有用户明确指定且仓库确实存在其他长期分支时才更改。
- PR 标题必须使用英文，正文必须使用中文。
- 不主动执行 `gh auth login`，不把 Token 或认证信息写入仓库。
- 不擅自 Stage 或 Commit 工作区内容。存在应进入 PR 的未提交改动时，先完成用户授权的提交工作。
- 真正 Push 和创建 PR 前，必须让用户确认最终 Base、Head、标题和正文。

## 分析分支

先确认仓库、认证和分支状态：

```bash
git status --short
git branch --show-current
git branch -vv
git remote -v
gh auth status
```

更新远端基线信息后，读取整个 PR 范围：

```bash
git fetch origin master
git log --oneline origin/master..HEAD
git diff --stat origin/master...HEAD
git diff origin/master...HEAD
```

确认当前分支包含实际 Commit、没有混入无关改动，并根据完整 Diff 归纳主要结果。若当前分支已经存在 PR，优先更新和返回现有 PR，不重复创建。

## 准备标题

标题使用以下格式之一：

```text
<type>: <subject>
<type>(<scope>): <subject>
```

Type 与 Commit Message 保持一致，常用 `feat`、`fix`、`docs`、`refactor`、`test`、`build`、`ci` 和 `chore`。标题用英文祈使语气概括整个分支的主要结果，不照搬最后一个 Commit，也不使用 `update files`、`fix issues` 等空泛描述。

## 填写正文

必须读取并保留 `.github/PULL_REQUEST_TEMPLATE.md` 的主结构：

- 变更类型：勾选最符合主要目的的一项，确实跨类型时最多勾选两项。
- 关联 Issue：使用 `close #123`、`fix #123` 或链接；没有时填写“无”，禁止编造编号。
- 背景与方案：先说明原有问题，再说明解决方式和外部可感知结果。
- Changelog：分别使用英文和中文概括用户可感知的变化；没有时填写“无”。

正文不是文件清单。信息无法从 Diff 和现有验证中确认时保留明确的待补充项，并在创建前提示用户。

## 确认与创建

创建前向用户展示：

- Base branch
- Head branch
- PR title
- 完整 PR body
- 需要补充的信息

用户明确确认后：

1. 从 `git remote -v` 和 `gh repo view` 确认目标仓库，不依赖模糊推断。
2. 将当前分支显式推送到确认过的 Remote：`git push --set-upstream <remote> HEAD`。
3. 使用 `gh pr create`、确认过的 Base、标题和正文创建 PR；只有用户明确要求时才创建 Draft PR。
4. 创建成功后返回 PR 链接，并报告远端分支和实际 Base。

任何认证、Remote、目标仓库或分支关系不明确时停止，不重新登录、不切换账号、不向猜测的仓库 Push。
