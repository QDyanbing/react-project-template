---
name: commit-msg
description: Generate one English Conventional Commit message from this repository's staged changes and recent commit history. Use when the user asks for a commit message or wants staged changes summarized as a commit title; do not use to perform the commit itself.
---

# Commit Message

根据暂存区的真实内容生成一行可直接使用的 Commit Message。这个 Skill 只生成信息，不执行 Stage、Commit 或 Push。

## 收集依据

生成前必须读取：

```bash
git status --short
git diff --cached --stat
git diff --cached
git log --format='%s' -10
```

默认只分析暂存区，因为只有暂存内容会进入本次提交。用户明确要求覆盖全部工作区改动时，才额外读取未暂存 Diff，并说明生成结果不等于当前实际提交内容。

暂存区为空时停止，不根据文件名或未暂存内容编造 Commit Message。

## 格式

项目使用 Crucialy 校验以下格式：

```text
<type>(<scope>)!: <subject>
```

`scope` 和 `!` 可选。`subject` 必须：

- 使用英文和祈使语气。
- 首字母小写，专有名词除外。
- 结尾不加句号。
- 不超过 50 个字符。
- 概括提交目的，不逐文件罗列。

允许的 `type`：

| Type       | 用途                           |
| ---------- | ------------------------------ |
| `feat`     | 新增用户或开发者能力           |
| `fix`      | 修复可观察缺陷                 |
| `docs`     | 文档或说明                     |
| `style`    | 不改变逻辑的格式或视觉样式调整 |
| `refactor` | 不新增能力、不修复缺陷的重构   |
| `perf`     | 性能优化                       |
| `test`     | 测试新增或调整                 |
| `build`    | 构建系统或生产构建             |
| `ci`       | CI/CD 工作流                   |
| `chore`    | 依赖、脚本和其他维护           |
| `revert`   | 回滚提交                       |

只在改动明确集中于一个模块时使用 `scope`，例如 `e2e`、`i18n`、`layout` 或具体业务领域。不要把文件夹名机械地作为 `scope`。

破坏性变更使用 `!`，例如 `feat!: replace authentication contract`。

## 归纳规则

1. 从完整暂存 Diff 判断主要目的和用户可感知结果。
2. 对照近期 Commit 的语言、Type 和 Scope 习惯。
3. 一个完整目的跨多个文件时，用高层语义覆盖全部文件。
4. 暂存区包含明显不相关的改动时，先建议按可独立理解和回退的边界拆分，不生成掩盖问题的宽泛标题。
5. 不把测试或文档伴随修改误判为主类型；Type 由提交的主要目的决定。

## 输出

除非用户要求解释，只输出最终一行，不使用代码块、引号、项目符号或补充说明。
