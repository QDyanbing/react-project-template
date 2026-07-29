# 代码格式化与检查选型

## 职责边界

代码格式化与代码检查解决不同的问题：

- 格式化工具统一缩进、换行、引号和空格等代码外观。
- 代码检查工具发现潜在错误、无效代码以及不符合 React 和 TypeScript 约束的写法。

格式规则不在代码检查工具中重复维护，代码检查规则也不交给格式化工具处理。

## 格式化方案

### Prettier 3

维护主体：Prettier 团队和社区。

定位：面向前端生态的专用代码格式化工具，通过固定输出减少代码样式差异。

优点：

- 原生支持 JavaScript、TypeScript、JSX、JSON、Less 和 Markdown，可以覆盖当前仓库的主要文件。
- 编辑器、命令行和 CI 集成成熟。
- 默认规则完整，项目只需保留少量必要配置。
- 生态稳定，格式行为和升级路径容易预期。

局限：

- 执行性能低于基于 Rust 的新一代格式化工具。
- 不负责检查代码正确性。
- 不内置 import 排序，相关能力需要单独选择。

### Oxfmt

维护主体：Oxc 团队和社区。

定位：基于 Rust 的高性能格式化工具，目标是兼容 Prettier 的格式结果和使用方式。

优点：

- 原生支持 JavaScript、TypeScript、JSX、JSON、CSS、Less 和 SCSS。
- Markdown 等暂未原生实现的格式由内置 Prettier 处理，不需要单独安装 Prettier。
- 内置 import 和 `package.json` 排序等扩展能力。
- JavaScript 和 TypeScript 格式结果以兼容 Prettier 为目标，迁移成本较低。

局限：

- 当前仍处于 Beta，稳定性和长期兼容性尚未经过与 Prettier 相同规模的验证。
- 不支持 Prettier 插件，依赖插件的文件类型或格式行为无法直接迁移。
- 部分文件仍委托内置 Prettier 处理，尚未完全使用统一的原生实现。

### Biome Formatter

维护主体：Biome 团队和社区。

定位：Biome 工具链中的格式化能力，与自身代码检查功能使用同一套解析基础设施。

优点：

- JavaScript、TypeScript、JSX、TSX 和 JSON 的格式化速度快。
- 格式化与代码检查可以使用同一个命令和配置文件。
- 默认规则接近 Prettier，迁移常见前端代码的成本较低。

局限：

- 当前不能覆盖项目使用的 Less 和 Markdown。
- 如果为缺失的文件类型保留其他格式化工具，会形成两套配置和编辑器行为。
- 统一工具链的优势无法覆盖整个仓库。

## 格式化结论

选择 Prettier 3。

当前仓库同时包含 TypeScript、TSX、JSON、Less 和 Markdown，Prettier 可以使用一套稳定方案覆盖全部文件。Oxfmt 已具备较完整的语言支持和更高性能，但仍处于 Beta；Biome 无法覆盖 Less 和 Markdown，不适合作为唯一格式化工具。

格式配置尽量沿用 Prettier 默认值，只保留项目明确需要的差异。Prettier 使用精确版本，不使用版本范围。仓库不提交依赖锁文件，固定格式化工具版本可以避免不同时间安装依赖后产生无意义的全量格式变化；升级由独立提交完成。

## 代码检查方案

### ESLint 10

维护主体：ESLint 团队，隶属于 OpenJS Foundation。

定位：可扩展的 JavaScript 代码检查工具，通过语言解析器、共享配置和插件覆盖 TypeScript、React 等生态。

优点：

- JavaScript 和 React 生态采用范围广，规则、插件和编辑器集成成熟。
- 通过 typescript-eslint 检查 TypeScript，并支持需要类型信息的规则。
- React 官方使用 `eslint-plugin-react-hooks` 提供 Hooks 规则和 React Compiler 诊断。
- Flat Config 可以直接组合 JavaScript、TypeScript 和 React 的官方推荐配置。
- 支持按文件类型和目录调整规则，适合模板后续扩展测试、Node.js 脚本和其他运行环境。

局限：

- 解析和执行速度低于 Oxlint、Biome 等原生工具。
- TypeScript、React 和其他能力需要组合多个依赖。
- 规则生态范围大，需要控制默认规则边界，避免引入大量与项目无关的约束。

### Oxlint

维护主体：Oxc 团队和社区。

定位：基于 Rust 的 JavaScript 和 TypeScript 代码检查工具，内置大量 ESLint 生态规则，并提供类型感知检查。

优点：

- 执行速度快，适合大型仓库和高频检查。
- 内置 JavaScript、TypeScript、React、import 和可访问性等常用规则。
- 支持类型感知检查，并提供从 ESLint 迁移的工具。
- 可以与 ESLint 并行运行，由 Oxlint 承担已经覆盖的规则。

局限：

- React Compiler 规则仍为实验能力，并且默认不启用。
- JavaScript 插件兼容层仍处于 Alpha，第三方 ESLint 插件不能保证全部兼容。
- 与 ESLint 并行使用会增加配置、规则去重和问题定位成本。

### Biome Linter

维护主体：Biome 团队和社区。

定位：Biome 工具链中的代码检查能力，强调高性能和开箱即用的规则集合。

优点：

- JavaScript、TypeScript、JSX 和 TSX 检查速度快。
- 格式化、代码检查和部分自动修复使用统一配置。
- 内置常见正确性、复杂度和代码风格规则。

局限：

- 第三方规则与共享配置生态小于 ESLint。
- 无法直接替代 React 官方通过 ESLint 插件提供的完整 Hooks 和 React Compiler 诊断。
- 当前项目若同时保留 ESLint，会形成重叠的规则和命令。

## 代码检查结论

选择 ESLint 10，并使用 Flat Config。

当前项目启用了 React Compiler，需要接入 React 官方维护的 Hooks 和 Compiler 检查规则；同时项目使用 TypeScript，需要稳定的 TypeScript 规则和类型感知扩展能力。ESLint 在这两项能力上的官方支持和生态完整度更适合作为模板默认方案。

ESLint 只负责代码正确性和框架约束，不启用与 Prettier 重叠的格式规则。Oxlint 保留为后续大型仓库的性能优化选项，不与 ESLint 同时作为模板默认依赖。

## 选型结论

- 使用 Prettier 3 格式化 TypeScript、TSX、JSON、Less 和 Markdown。
- Prettier 使用精确版本，配置以默认值为主。
- 使用 ESLint 10 检查 JavaScript、TypeScript 和 React 代码。
- ESLint 使用 Flat Config，并接入 TypeScript、React Hooks 和 React Compiler 的正式规则。
- Prettier 与 ESLint 分工，不维护重复的格式规则。
- import 排序、CSS 检查、命名规范、Git hooks 和提交信息规范不在本文中确定。

## 参考

- [Prettier 支持的语言](https://prettier.io/docs/)
- [Prettier 3 发布记录](https://prettier.io/blog/)
- [Oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- [Oxfmt 语言支持](https://oxc.rs/docs/guide/usage/formatter/language-support)
- [Oxfmt 暂不支持的能力](https://oxc.rs/docs/guide/usage/formatter/unsupported-features)
- [Biome 语言支持](https://biomejs.dev/internals/language-support/)
- [ESLint 10](https://eslint.org/blog/2026/02/eslint-v10.0.0-released/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [typescript-eslint](https://typescript-eslint.io/getting-started/)
- [React Hooks ESLint 插件](https://react.dev/reference/eslint-plugin-react-hooks)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)
- [Oxlint 插件支持](https://oxc.rs/docs/guide/usage/linter/plugins)
