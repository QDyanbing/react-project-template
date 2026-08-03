# 国际化方案选型

## react-i18next + i18next

维护主体：i18next 团队和社区。

定位：i18next 提供框架无关的国际化核心能力，react-i18next 提供 React Hook、组件和 Context 集成。

优点：

- React 生态使用广泛，文档、示例和问题排查资料丰富。
- 支持运行时切换语言、语言回退、复数、插值和格式化。
- 支持通过 Namespace 按业务模块拆分文案，并按需加载语言资源。
- React 组件可以通过 `useTranslation` 使用，组件外也可以调用同一个 i18next 实例。
- 语言识别、资源加载、缓存和 ICU MessageFormat 等能力可以通过插件扩展。
- 支持使用 TypeScript 约束语言资源和文案 Key。

局限：

- 完整方案由 i18next、react-i18next 和可选插件组成，配置入口较多。
- 文案 Key 的类型检查需要额外维护类型声明或生成流程。
- 默认消息格式不是完整的 ICU MessageFormat，复杂 ICU 语法需要接入对应插件。
- 能力边界较宽，需要项目统一文案 Key、Namespace 和资源加载方式。

## React Intl / FormatJS

维护主体：FormatJS 团队和社区。

定位：基于浏览器 `Intl` 和 ICU MessageFormat，为 React 提供文案、数字、日期、复数和相对时间格式化能力。

优点：

- 直接使用 ICU MessageFormat，复杂复数、变量和地区语言规则表达完整。
- 日期、数字、货币和相对时间等国际化格式能力完善。
- 使用 TypeScript 编写，类型支持成熟。
- 提供文案提取和编译工具，适合连接专业翻译流程。
- 以标准化消息描述为核心，不依赖特定语言包加载服务。

局限：

- ICU MessageFormat 和 Message Descriptor 具有一定学习成本。
- 常规文案的组件和 API 写法比简单的 Key 查询更繁琐。
- 语言识别、资源拆分和动态加载需要项目自行组织。
- 对以中英文切换为主的管理后台，部分高级格式能力使用频率较低。

## Lingui

维护主体：Lingui 团队和 Crowdin。

定位：通过宏、文案提取和目录编译建立完整国际化工作流，运行时使用 ICU MessageFormat。

优点：

- 文案可以保留在 JSX 附近，再通过工具自动提取到语言目录。
- 支持 ICU MessageFormat、复数、变量和包含 React 组件的富文本。
- 提供 CLI、Vite 插件和 ESLint 插件，覆盖提取、编译和检查流程。
- 编译阶段会移除非必要信息，减少国际化运行时代码。
- 默认支持 PO 格式，便于与翻译平台协作。

局限：

- 需要增加文案提取、编译和语言目录同步流程。
- 宏和 Vite 插件会增加构建配置及升级边界。
- 开发者需要理解源文案、Message ID、语言目录和编译产物之间的关系。
- 生态规模和问题排查资料少于 i18next。

## 选型结论

选择 react-i18next + i18next。

当前项目是基于 Vite 的 React SPA，需要覆盖页面文案、菜单、全局提示和请求错误等组件内外场景。i18next 可以提供统一的运行时实例，react-i18next 负责 React 组件集成，二者能够在不引入额外编译流程的情况下支持语言切换、文案拆分和按需加载。

页面和公共组件可以分别维护自己的语言资源，并通过 Namespace 建立独立边界，不要求将所有业务文案集中在同一份语言文件中。动态数据通过插值和复数规则传递；包含样式或交互的文案通过 `Trans` 组件插入原生 DOM 节点或 Ant Design 组件。

相比之下，React Intl 更适合大量使用 ICU MessageFormat 和地区格式的产品；Lingui 更适合已经建立文案提取、翻译和编译工作流的团队。

业务语言切换需要同时驱动 Ant Design 和 Day.js 的 Locale，使组件库、日期时间和业务文案保持相同语言。

## 参考

- [i18next](https://www.i18next.com/)
- [react-i18next](https://react.i18next.com/)
- [react-i18next TypeScript](https://react.i18next.com/latest/typescript)
- [React Intl](https://formatjs.github.io/docs/react-intl/)
- [Lingui](https://lingui.dev/introduction)
- [Lingui React](https://lingui.dev/tutorials/react)
