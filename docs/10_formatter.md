# 代码格式化选型

## Prettier 3

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

## Oxfmt

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

## Biome Formatter

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

## 选型结论

选择 Prettier 3。

当前仓库同时包含 TypeScript、TSX、JSON、Less 和 Markdown，Prettier 可以使用一套稳定方案覆盖全部文件。Oxfmt 已具备较完整的语言支持和更高性能，但仍处于 Beta；Biome 无法覆盖 Less 和 Markdown，不适合作为唯一格式化工具。

格式配置尽量沿用 Prettier 默认值，只保留项目明确需要的差异。Prettier 使用精确版本，不使用版本范围。仓库不提交依赖锁文件，固定格式化工具版本可以避免不同时间安装依赖后产生无意义的全量格式变化；升级由独立提交完成。

代码格式化只统一代码外观，不承担代码检查、import 排序或样式检查。

## 参考

- [Prettier 支持的语言](https://prettier.io/docs/)
- [Prettier 3 发布记录](https://prettier.io/blog/)
- [Oxfmt](https://oxc.rs/docs/guide/usage/formatter)
- [Oxfmt 语言支持](https://oxc.rs/docs/guide/usage/formatter/language-support)
- [Oxfmt 暂不支持的能力](https://oxc.rs/docs/guide/usage/formatter/unsupported-features)
- [Biome 语言支持](https://biomejs.dev/internals/language-support/)
