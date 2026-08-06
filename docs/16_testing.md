# 测试方案选型

## 测试层级

项目保留三个测试层级：

- 单元测试：验证工具函数、请求处理、Store 和不依赖浏览器渲染的业务逻辑。
- 组件测试：在真实浏览器中验证 React 页面和组件的渲染、交互、状态变化以及 Ant Design 组件行为。
- E2E 测试：从用户入口验证登录、路由和核心业务流程，不重复覆盖组件测试已经验证的所有分支。

不单独增加“集成测试”目录。页面中多个组件、Store 和 Hook 的协同行为归入组件测试；跨页面和完整应用流程归入 E2E 测试。

## 单元测试框架

### Vitest 4

维护主体：Vitest 团队和社区，核心维护者参与 VoidZero 的 Vite 工具链建设。

定位：基于 Vite 转换管线的测试框架，覆盖测试运行、断言、Mock、Snapshot 和覆盖率。

优点：

- 与 Vite 共用模块解析、路径别名、TypeScript、JSX 和插件转换能力。
- 原生支持 ESM，并提供与 Jest 接近的断言和 Mock API。
- 可以通过 Projects 将 Node 单元测试和 Browser Mode 组件测试放在同一套测试配置中。
- Watch、并行执行、过滤和覆盖率能力完整。

局限：

- Browser Mode、Node 环境和不同 Project 的边界需要明确配置。
- 与 Jest API 高度兼容，但不是所有 Jest 插件都能直接复用。

### Jest 30

维护主体：Jest 团队和社区，隶属于 OpenJS Foundation。

定位：成熟的 JavaScript 测试框架，拥有独立的模块转换、测试环境、Mock 和 Snapshot 体系。

优点：

- 使用范围广，文档、插件和问题排查资料丰富。
- Mock、Fake Timer、Snapshot 和测试隔离能力成熟。
- 适合已有 Jest 资产或不依赖 Vite 的多运行时项目。

局限：

- 当前工程需要额外维护 Jest 与 Vite 两套转换、路径别名和插件配置。
- TypeScript 和 ESM 通常需要组合 Babel、ts-jest 或其他转换方案。
- React Compiler、Vite 插件和构建期行为需要单独保持一致。

### Node.js Test Runner

维护主体：Node.js 项目。

定位：Node.js 内置测试运行器，提供基础测试、Mock、Watch 和覆盖率能力。

优点：

- 无需增加独立测试框架依赖。
- 适合 Node.js 工具函数和服务端模块测试。
- 与 Node.js 运行时同步维护。

局限：

- 不直接复用 Vite 的模块转换、路径别名和 React 插件。
- React 组件测试、浏览器环境和相关生态需要自行组合。
- 当前项目同时使用它和其他组件测试工具会形成两套测试 API。

## 单元测试结论

选择 Vitest 4。

项目已经使用 Vite、TypeScript、路径别名和 React Compiler，Vitest 可以直接复用相同转换链路，不需要再维护 Jest 的独立编译配置。单元测试使用 Node 环境，只负责不需要真实浏览器渲染的逻辑。

## React 组件测试

### Vitest Browser Mode + vitest-browser-react

维护主体：Browser Mode 由 Vitest 团队维护；`vitest-browser-react` 由 Vitest Community 维护，并被 Vitest 官方文档作为 React Browser Mode 渲染方案。

定位：通过 Playwright Provider 在真实浏览器中运行 Vitest，由 `vitest-browser-react` 渲染 React 组件，使用 Vitest Locator、交互和可重试断言。

优点：

- 使用真实 DOM、CSS、事件、焦点和浏览器 API，不依赖 jsdom 模拟。
- 更适合验证 Ant Design 的 Portal、弹层、表单、焦点和交互行为。
- 组件测试继续使用 Vitest 的断言、Mock、过滤和 Projects，不增加第二个组件测试运行器。
- 可以与 E2E 共用 Playwright 浏览器安装和调试经验。

局限：

- 启动真实浏览器比 Node + jsdom 更慢。
- `vitest-browser-react` 由社区维护，稳定性和生态规模小于 React Testing Library。
- Browser Mode 不能替代完整 E2E 测试。

### React Testing Library + jsdom

维护主体：Testing Library 团队和社区；jsdom 由开源社区维护。

定位：在 Node.js 中模拟 DOM，通过接近用户使用方式的查询和交互验证 React 组件。

优点：

- React 生态使用广泛，API、示例和辅助库成熟。
- Node 环境启动快，适合高频运行大量组件测试。
- 强调从可访问角色、文案和表单标签查询元素，避免测试组件内部实现。

局限：

- jsdom 只模拟浏览器，不执行真实布局、绘制和完整浏览器 API。
- Portal、焦点、尺寸、滚动和部分复杂事件可能与真实浏览器存在差异。
- 项目仍需通过 E2E 补充真实浏览器验证。

### Cypress Component Testing

维护主体：Cypress.io。

定位：在 Cypress 浏览器运行器中独立挂载和测试 React 组件。

优点：

- 真实浏览器运行，交互式界面和调试体验完整。
- 同时提供组件测试和 E2E 测试能力。
- 对组件状态和失败过程的可视化较直观。

局限：

- 会在 Vitest 之外增加第二套组件测试 API、配置和运行器。
- 与 Vitest 单元测试、Playwright E2E 并存时工具边界重复。
- 当前项目没有需要 Cypress 独立运行界面的既有测试资产。

## 组件测试结论

选择 Vitest Browser Mode、Playwright Provider 和 `vitest-browser-react`，默认使用 Chromium。

组件测试关注用户可见行为，不检查组件内部 State、私有方法和 CSS Class。元素优先通过 Role、Label 和可见文案定位；`data-testid` 只作为缺少可访问语义时的补充。普通组件交互不默认使用 Snapshot 代替行为断言。

React Testing Library 保留为成熟的回退方案。如果 Browser Mode 或 `vitest-browser-react` 出现无法接受的兼容问题，可以切换为 React Testing Library + jsdom，而无需更换 Vitest 单元测试框架。

## E2E 测试

### Playwright

维护主体：Microsoft Playwright 团队。

定位：面向 Chromium、Firefox 和 WebKit 的浏览器自动化及 E2E 测试框架。

优点：

- 原生支持多浏览器、并行执行、隔离上下文、自动等待和失败重试。
- 提供 Trace、截图、视频、HTML Report 和 UI Mode，便于定位 CI 中的失败。
- 可以通过 `webServer` 管理应用启动，并验证真实路由和完整页面流程。
- 同时可以作为 Vitest Browser Mode 的浏览器 Provider。

局限：

- 需要安装和缓存浏览器二进制文件。
- 完整流程测试执行时间和维护成本高于单元测试与组件测试。
- 测试数据和外部依赖没有隔离好时仍可能产生不稳定测试。

### Cypress

维护主体：Cypress.io。

定位：提供可视化开发体验的组件与 E2E 测试平台。

优点：

- 浏览器内命令日志、时间旅行式调试和交互界面成熟。
- 对前端开发者编写和调试单浏览器流程较友好。
- 组件测试和 E2E 使用统一的 Cypress API。

局限：

- 当前项目已经选择 Vitest Browser Mode，使用 Cypress 会增加另一套浏览器测试体系。
- 多浏览器执行、Trace 和跨页面自动化方式与 Playwright 不同，迁移和复用成本更高。
- 部分团队协作和测试分析能力依赖 Cypress Cloud。

## E2E 结论

选择 Playwright。

模板默认只使用 Chromium 执行核心流程，控制本地和 CI 成本。Firefox、WebKit 和系统浏览器矩阵在项目明确提出兼容范围后增加，不默认让每次检查重复执行全部浏览器。

E2E 首先覆盖登录、未登录跳转、列表查询、详情、新增、修改、删除和 403/404 等核心流程。测试使用项目已有的 Vite 服务端 Mock，不增加 MSW、Mock.js 或另一套接口 Mock。

## 覆盖率

### V8

Vitest 原生支持 V8 和 Istanbul 两种覆盖率 Provider。V8 不需要预先插桩，执行开销较低；Vitest 已通过 AST Remapping 提供与 Istanbul 一致的源码映射精度。

选择 V8 Coverage，并统计 Statements、Branches、Functions 和 Lines。

全局最低覆盖率统一设置为 80%。以下内容不进入覆盖率：

- 类型声明。
- Locale 资源。
- Mock 数据与 Mock 路由。
- 工程配置和 Vite 插件。
- 只负责应用挂载的入口文件。

覆盖率只用于发现没有执行的代码路径，不允许为了达到数字编写没有行为价值的断言，也不使用大面积忽略注释绕过阈值。

## 测试文件位置与命名

- 单元测试与源码放在同一目录，命名为 `<name>.test.ts`。
- React 组件和页面测试与被测入口放在同一目录，命名为 `<name>.test.tsx`；页面入口使用 `index.test.tsx`。
- E2E 测试统一放在根目录 `e2e`，命名为 `<flow>.spec.ts`。
- 测试专用 Fixture、Helper 和 Setup 按所属测试层级放置，不建立同时服务所有层级的笼统 `test-utils` 目录。
- 测试名称描述用户行为和可观察结果，不描述内部方法调用过程。

## 选型结论

- 单元测试：Vitest 4，Node 环境。
- React 组件测试：Vitest Browser Mode + Playwright Provider + `vitest-browser-react`，Chromium。
- E2E 测试：Playwright，默认 Chromium。
- 覆盖率：Vitest V8 Coverage，全局 Statements、Branches、Functions 和 Lines 不低于 80%。
- 接口 Mock：继续使用现有 Vite 服务端 Mock。
- 测试位置：单元测试和组件测试贴近源码，E2E 测试独立放在根目录 `e2e`。

## 参考

- [Vitest 4](https://vitest.dev/blog/vitest-4)
- [Vitest 为什么基于 Vite](https://vitest.dev/guide/why)
- [Vitest Browser Mode](https://vitest.dev/guide/browser/)
- [Vitest 组件测试](https://vitest.dev/guide/browser/component-testing)
- [vitest-browser-react](https://vitest.dev/api/browser/react)
- [Vitest Coverage](https://vitest.dev/guide/coverage)
- [Jest 30](https://jestjs.io/blog/2025/06/04/jest-30)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright](https://playwright.dev/docs/intro)
- [Playwright 运行与调试](https://playwright.dev/docs/running-tests)
- [Cypress 测试类型](https://docs.cypress.io/app/core-concepts/testing-types)
