# Git Hooks 管理选型

## 选型范围

Git Hooks 管理工具负责将项目约定的命令安装到本地 Git Hooks，并保证不同开发者使用一致的 Hook 配置。

Hook 中具体执行哪些格式化、代码检查和 Commit 信息检查命令由对应能力单独确定，不属于本次选型。

## Husky 9

维护主体：Typicode。

定位：基于 Git `core.hooksPath` 管理客户端 Hooks，每个 Hook 使用独立的 Shell 文件。

优点：

- 使用范围广，文档、问题排查资料和第三方工具示例丰富。
- Hook 文件直接保存在 `.husky` 目录，执行内容明确，可以使用 Shell 编排复杂逻辑。
- 支持 Git 的全部客户端 Hooks，并兼容主流操作系统、Git GUI、Node.js 版本管理工具和 Monorepo。
- 包体积小且没有运行时依赖。

局限：

- 每个 Hook 都会增加一个 Shell 文件，简单命令也需要维护独立目录和文件。
- 复杂 Hook 容易逐渐积累 Shell 逻辑，使项目命令与 Hook 行为分散在不同位置。
- 主要依赖 POSIX Shell，跨平台脚本仍需避免使用平台特有命令。

## simple-git-hooks 2

维护主体：Toplenboren 和社区。

定位：使用一份 JavaScript、JSON 或 `package.json` 配置，将命令写入 Git Hooks。

优点：

- 没有运行时依赖，配置和执行模型简单。
- Hook 与命令采用直接映射，不需要为每个 Hook 维护单独的 Shell 文件。
- 可以通过项目自身的 `prepare` 命令安装 Hooks，不依赖包管理器是否允许依赖的安装脚本。
- 可以与 lint-staged、Commitlint 或项目 scripts 独立组合，不绑定具体检查工具。

局限：

- 每个 Hook 只能配置一条命令，多项操作需要先组合成一个项目 script。
- 修改 Hook 配置后需要重新运行安装命令，配置不会自动同步到已经存在的 `.git/hooks`。
- 不提供并行执行、文件过滤、任务分组和本地覆盖等高级编排能力。

## Lefthook 2

维护主体：Evil Martians。

定位：使用 Go 编写的跨语言 Git Hooks 管理和任务编排工具。

优点：

- 支持并行执行、文件过滤、Glob、正则表达式、任务标签和本地配置覆盖。
- 可以直接获取暂存文件或指定范围内的文件，复杂 Hook 不必自行编写 Shell 脚本。
- 支持 Node.js、Go、Ruby、Python 等不同技术栈，适合 Monorepo 和多语言仓库。
- 提供配置校验和直接运行指定 Hook 的命令，复杂配置的可维护性较好。

局限：

- 对当前单一 React 工程而言，大部分任务编排能力暂时用不到。
- 引入独立二进制和 YAML 配置，工具模型比项目现阶段的需求更重。
- 文件筛选和任务编排会与后续暂存文件检查工具产生部分职责重叠。

## 选型结论

选择 Husky 9。

Husky 的使用范围和问题排查资料更丰富，独立 Hook 文件可以直接看出每个 Git 阶段执行的命令，也为后续增加 `pre-commit`、`commit-msg` 和 `pre-push` 等不同检查保留了清晰的扩展位置。

Hook 通过项目自身的 `prepare` 命令安装。每个 Hook 文件只负责调用对应的项目命令，不在其中维护复杂 Shell 逻辑。

## 参考

- [Husky](https://github.com/typicode/husky)
- [Husky 入门文档](https://typicode.github.io/husky/get-started.html)
- [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)
- [Lefthook](https://github.com/evilmartians/lefthook)
- [Lefthook 配置文档](https://lefthook.dev/configuration/)
