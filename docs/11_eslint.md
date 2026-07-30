# JavaScript 与 TypeScript 代码检查选型

## ESLint 10

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

## Oxlint

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

## Biome Linter

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

## 选型结论

选择 ESLint 10，并使用 Flat Config。

当前项目启用了 React Compiler，需要接入 React 官方维护的 Hooks 和 Compiler 检查规则；同时项目使用 TypeScript，需要稳定的 TypeScript 规则和类型感知扩展能力。ESLint 在这两项能力上的官方支持和生态完整度更适合作为模板默认方案。

默认组合 `@eslint/js`、typescript-eslint 和 `eslint-plugin-react-hooks` 的推荐规则。React Hooks 使用包含 React Compiler 诊断的 `recommended-latest` 配置。TypeScript 的完整类型检查继续由 `tsc` 负责，不默认启用会改变 Promise 使用方式的整套类型感知规则。

ESLint 只负责代码正确性和框架约束，不启用与 Prettier 重叠的格式规则。Oxlint 保留为后续大型仓库的性能优化选项，不与 ESLint 同时作为模板默认依赖。

## 参考

- [ESLint 10](https://eslint.org/blog/2026/02/eslint-v10.0.0-released/)
- [ESLint Flat Config](https://eslint.org/docs/latest/use/configure/configuration-files)
- [typescript-eslint](https://typescript-eslint.io/getting-started/)
- [React Hooks ESLint 插件](https://react.dev/reference/eslint-plugin-react-hooks)
- [Oxlint](https://oxc.rs/docs/guide/usage/linter.html)
- [Oxlint 插件支持](https://oxc.rs/docs/guide/usage/linter/plugins)
- [Biome 语言支持](https://biomejs.dev/internals/language-support/)
