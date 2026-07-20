# 样式方案选型

## 对比范围

Less 和 SCSS 是 CSS 预处理器，CSS Modules 解决样式作用域问题，两者不是完全相同的维度。Vite 支持将它们组合为 `.module.less` 或 `.module.scss`。

本次对比关注它们作为模板默认业务样式方案时的依赖成本、作用域、主题能力和运行时开销。

## 样式方案对比

### Less

维护主体：Less Core Team 和开源社区。

定位：为 CSS 增加变量、Mixin、嵌套、运算和函数等编译期能力。

优点：

- 语法接近 CSS，变量、Mixin 和嵌套规则容易理解。
- 适合维护包含大量计算、公共规则和复用片段的样式工程。
- 编译结果是静态 CSS，不增加浏览器运行时。
- Vite 内置 Less 接入能力，只需要安装 Less 编译器。
- 可以与 CSS Modules 组合使用，获得局部作用域。

局限：

- Less 本身不提供局部作用域，仍需依靠命名规范或 CSS Modules。
- Less 变量在构建阶段计算，不能直接承担运行时主题切换。
- 需要增加 Less 编译依赖和一套额外语法。
- Ant Design 6 已默认使用 CSS Variables 和 Design Token，Less 不再是其主题系统的必要组成。
- 容易形成独立于 Ant Design Token 的第二套设计变量。

### SCSS

维护主体：Sass Team 和开源社区。

定位：Sass 的 CSS 兼容语法，为 CSS 增加变量、嵌套、Mixin、函数和模块系统。

优点：

- 语言能力和内置函数完整，适合复杂样式计算和工具函数。
- `@use` 与 `@forward` 提供明确的样式模块组织方式。
- 社区成熟，编辑器和第三方工具支持广泛。
- 编译结果仍是静态 CSS，不增加浏览器运行时。
- Vite 内置 SCSS 接入能力，只需要安装 Sass 编译器。
- 可以与 CSS Modules 组合使用，获得局部作用域。

局限：

- SCSS 本身不提供局部作用域，仍需依靠命名规范或 CSS Modules。
- SCSS 变量在构建阶段计算，不能直接承担运行时主题切换。
- 需要增加 Sass 编译依赖和一套额外语法。
- 常用的嵌套、变量和颜色能力已经可以由现代 CSS 与 CSS 自定义属性完成。
- 容易形成独立于 Ant Design Token 的第二套设计变量。

### CSS Modules

维护主体：CSS Modules 由开源社区维护，Vite 内置其构建支持。

定位：使用标准 CSS 编写样式，为类名和动画名称提供局部作用域。

优点：

- Vite 原生支持 `.module.css`，不需要增加依赖或构建插件。
- 类名默认局部化，可以避免页面和组件之间的样式冲突。
- 样式依赖通过模块导入显式关联，删除组件时容易定位对应样式。
- 组件结构与样式分文件维护，职责清晰，避免单个文件同时承载结构、逻辑和样式。
- 构建结果是静态 CSS，不增加浏览器运行时和 React 渲染成本。
- 保留标准 CSS 的调试方式，可以直接使用现代 CSS 和 CSS 自定义属性。

局限：

- 条件样式需要组合类名或使用 `data-*` 属性，动态能力弱于 CSS-in-JS。
- 跨组件复用的设计变量和基础规则需要建立明确边界。

### Tailwind CSS 4

维护主体：Tailwind Labs。

定位：通过原子类组合页面样式，并在构建阶段扫描源码生成静态 CSS。

优点：

- 原子类语义固定，适合快速组合布局和状态样式。
- 间距、颜色、断点和状态变体具有统一约束。
- Tailwind CSS 4 使用 CSS 优先配置，提供主题变量、容器查询和零运行时输出。
- 未使用的工具类不会进入最终样式。

局限：

- 复杂页面会在 JSX 中积累较长的类名，结构和视觉规则混合在一起。
- Tailwind Theme 与 Ant Design Token 会形成两套设计变量，需要额外同步。
- 默认引入的 Preflight 会重置元素基础样式，需要评估与组件库和业务全局样式的边界。
- 动态类名需要遵循源码扫描规则，抽象方式受到生成机制约束。

### CSS-in-JS

代表方案：Emotion、styled-components。

维护主体：各自的项目维护团队和开源社区。

定位：在 TypeScript 或 JavaScript 中声明样式，通过 React Props、Context 和运行时代码生成样式。

优点：

- 样式可以直接读取组件 Props 和主题上下文。
- 自动生成局部类名，适合构建高度动态的基础组件。

局限：

- 增加运行时代码、样式注入和缓存成本。
- 会在 Ant Design 自身样式体系之外再引入一套运行时和主题上下文。
- 服务端渲染、CSP、样式顺序和依赖重复需要额外处理。
- 业务页面样式与 React 运行时耦合，不利于迁移和直接使用浏览器 CSS 能力。

## 选型结论

选择 Less 与 CSS Modules 作为业务样式方案。

CSS Modules 为页面和组件提供局部作用域，Less 提供嵌套、Mixin、函数和编译期计算能力。两者构建后均输出静态 CSS，不增加浏览器运行时，也能保持组件结构、业务逻辑和样式之间的文件边界。

Vite 已内置 Less 和 CSS Modules 的接入能力，只需要安装 Less 编译器，不需要增加构建插件。模板不默认加入 Sass、Tailwind CSS、Emotion 或 styled-components。

## 样式边界

- 页面和业务组件的局部样式使用 `.module.less`。
- 全局样式只负责文档根节点、基础元素和跨应用通用规则，不存放页面或组件的局部样式。
- Less 负责嵌套、Mixin、函数和编译期计算，不使用 Less 变量建立颜色、间距等主题体系。
- Ant Design 的视觉调整优先使用全局 Token，再使用组件 Token。
- Design Token 无法覆盖的组件样式只使用官方 `classNames`、`styles` 或公开属性，不依赖内部 DOM 和 `.ant-*` 类名。
- 设计变量由 Ant Design Design Token 和 CSS Variables 统一管理，不再建立 Sass 变量或 Tailwind Theme 等平行体系。

## 参考

- [CSS Modules](https://github.com/css-modules/css-modules)
- [Vite CSS Modules 与预处理器](https://vite.dev/guide/features.html#css)
- [Less 文档](https://lesscss.org/)
- [Sass 文档](https://sass-lang.com/documentation/)
- [Tailwind CSS 4](https://tailwindcss.com/blog/tailwindcss-v4)
- [Tailwind CSS Preflight](https://tailwindcss.com/docs/preflight)
- [Emotion 介绍](https://emotion.sh/docs/introduction)
- [styled-components 基础](https://styled-components.com/docs/basics)
- [Ant Design 5 到 6 迁移说明](https://ant.design/docs/react/migration-v6/)
- [Ant Design 主题定制](https://ant.design/docs/react/customize-theme/)
