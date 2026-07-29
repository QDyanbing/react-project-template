# 样式检查选型

## 检查范围

样式检查覆盖项目中的全局 Less、CSS Modules 和普通 CSS 文件，用于发现无效语法、未知属性、重复声明、选择器问题和不符合项目约定的写法。

Prettier 继续负责样式文件的格式化，Stylelint 不重复维护缩进、换行和空格等格式规则。ESLint 只检查 JavaScript、TypeScript 和 React 代码。

## 方案对比

### Stylelint 17

维护主体：Stylelint 志愿者团队和社区。

定位：面向 CSS 和 CSS-like 语言的可扩展代码检查工具。

优点：

- 内置一百余条 CSS 规则，可以发现语法、未知或废弃属性、重复声明和选择器问题。
- 支持共享配置、插件和自定义语法，可以扩展到 Less。
- 提供编辑器、命令行和 CI 集成，并支持安全自动修复。
- 规则可以按文件类型覆盖，能够同时处理普通 CSS 和 Less。
- 版本持续维护，Stylelint 17 与项目使用的 Node.js 24 兼容。

局限：

- Less 不是核心语法，需要依赖社区维护的解析器和共享配置。
- Less 变量、Mixin、嵌套和 CSS Modules 的特殊选择器可能需要调整部分标准 CSS 规则。
- 作为独立工具，会增加一份配置和一个检查命令。

### ESLint CSS

维护主体：ESLint 团队，隶属于 OpenJS Foundation。

定位：通过 `@eslint/css` 语言插件在 ESLint 中检查标准 CSS。

优点：

- 可以复用 ESLint 的 Flat Config、命令和问题输出。
- 由 ESLint 官方维护，适合只使用标准 CSS 的项目。
- 能够发现 CSS 语法和部分规则问题。

局限：

- 当前面向标准 CSS，不支持项目使用的 Less 语法。
- 为了继续使用 Less，仍需引入其他解析和检查方案。
- 复用 ESLint 不能减少当前项目实际需要的工具数量。

### Biome CSS Linter

维护主体：Biome 团队和社区。

定位：Biome 工具链中的 CSS 检查能力。

优点：

- CSS 解析和检查速度快。
- 可以与 Biome 的 JavaScript、TypeScript 检查和格式化能力共用配置。
- 内置常见 CSS 正确性和规范规则。

局限：

- 当前不支持 Less。
- 项目已经选择 Prettier 和 ESLint，额外引入 Biome 只处理部分 CSS 会形成三套代码质量工具。
- 无法独立覆盖当前仓库的样式文件。

### 不接入样式检查

优点：

- 不增加依赖和配置。
- Less 编译器仍能发现无法解析的语法错误。

局限：

- 编译器不会完整检查重复声明、未知属性、无效选择器和项目样式约定。
- 问题只能依赖人工 CR 或运行页面后发现。
- 随着样式文件增加，统一约束的成本会持续上升。

## 选型结论

选择 Stylelint 17 检查 CSS 和 Less。

Less 使用 `stylelint-config-standard-less` 提供的标准配置、Less 语法和对应规则。该配置在 Stylelint 标准规则的基础上处理 Less 变量、Mixin 和嵌套等语法，比直接对 Less 使用标准 CSS 配置更符合实际代码。

Stylelint 只负责样式正确性和项目约束，不接入已经由 Prettier 处理的纯格式规则。CSS 属性顺序、类名规则和复杂度限制根据后续规范单独确定，不在本文中预设。

## 参考

- [Stylelint](https://stylelint.io/)
- [Stylelint 17 更新记录](https://stylelint.io/changelog/)
- [Stylelint 规则](https://stylelint.io/user-guide/rules/)
- [Stylelint 自定义语法](https://stylelint.io/user-guide/options/#customsyntax)
- [Stylelint Less 相关资源](https://stylelint.io/awesome-stylelint/)
- [stylelint-config-standard-less](https://github.com/stylelint-less/stylelint-less)
- [ESLint CSS 支持](https://eslint.org/blog/2025/02/eslint-css-support/)
- [Biome 语言支持](https://biomejs.dev/internals/language-support/)
