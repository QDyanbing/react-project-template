# 测试方案选型

## 测试层级

项目保留两个测试层级：

- 单元测试：验证与页面无关的工具函数和底层逻辑。
- 浏览器功能测试：通过完整应用验证页面渲染、用户交互、路由、接口请求和最终业务结果。

不单独增加“组件测试”和“集成测试”层级。页面、组件、Store、Hook 和 Service 的协同行为统一由浏览器功能测试覆盖，避免测试绕过真实运行链路后只能验证局部实现。

## 单元测试框架

### Vitest 4

维护主体：Vitest 团队和社区，核心维护者参与 VoidZero 的 Vite 工具链建设。

定位：基于 Vite 转换管线的测试框架，覆盖测试运行、断言、Mock、Snapshot 和覆盖率。

优点：

- 与 Vite 共用模块解析、路径别名、TypeScript、JSX 和插件转换能力。
- 原生支持 ESM，并提供与 Jest 接近的断言和 Mock API。
- 支持通过 Projects 组织不同运行环境的测试配置。
- Watch、并行执行、过滤和覆盖率能力完整。

局限：

- 不负责启动完整应用和验证跨页面业务流程。
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
- 浏览器环境和完整应用测试能力需要自行组合。
- 当前项目同时使用它和 Vitest 会形成两套单元测试 API。

## 单元测试结论

选择 Vitest 4。

项目已经使用 Vite、TypeScript、路径别名和 React Compiler，Vitest 可以直接复用相同转换链路，不需要再维护 Jest 的独立编译配置。单元测试使用 Node 环境，只负责纯工具和底层逻辑，不直接渲染页面或业务组件。

## 浏览器功能测试

### Playwright

维护主体：Microsoft Playwright 团队。

定位：面向 Chromium、Firefox 和 WebKit 的浏览器自动化测试框架，用于从真实入口验证完整应用功能。

优点：

- 原生支持多浏览器、并行执行、隔离上下文、自动等待和失败重试。
- 提供 Trace、截图、视频、HTML Report 和 UI Mode，便于定位 CI 中的失败。
- 可以通过 `webServer` 管理应用启动，并验证真实路由和完整页面流程。

局限：

- 需要安装和缓存浏览器二进制文件。
- 完整流程测试执行时间和维护成本高于单元测试。
- 测试数据和外部依赖没有隔离好时仍可能产生不稳定测试。

### Cypress

维护主体：Cypress.io。

定位：提供可视化开发体验的组件与 E2E 测试平台。

优点：

- 浏览器内命令日志、时间旅行式调试和交互界面成熟。
- 对前端开发者编写和调试单浏览器流程较友好。
- 组件测试和 E2E 使用统一的 Cypress API。

局限：

- 当前项目选择 Playwright 后再使用 Cypress 会增加另一套浏览器测试体系。
- 多浏览器执行、Trace 和跨页面自动化方式与 Playwright 不同，迁移和复用成本更高。
- 部分团队协作和测试分析能力依赖 Cypress Cloud。

## 浏览器功能测试结论

选择 Playwright。

模板默认只使用 Chromium 执行核心流程，控制本地和 CI 成本。Firefox、WebKit 和系统浏览器矩阵在项目明确提出兼容范围后增加，不默认让每次检查重复执行全部浏览器。

浏览器功能测试覆盖页面渲染、查询、分页、详情、新增、修改、删除、登录、退出、权限和路由等业务行为。测试必须通过浏览器执行跳转、点击、输入和选择，并断言可见内容、控件状态、URL 与最终业务结果。

测试运行时使用项目已有的 Vite 服务端 Mock 作为正常接口服务，不增加 MSW、Mock.js 或测试文件内的接口替身。测试代码禁止 Mock 页面、路由、Store、Hook、Service、Request 和 Fetch，也不得手写业务实体注入页面。测试数据通过真实 HTTP 接口准备和清理；当前 Case 要验证的行为只能由浏览器交互触发。

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
- 完全不依赖路由、Store、Service 和业务接口的纯展示组件可以使用同目录 `<name>.test.tsx`；页面和业务组件不得使用该测试形式。
- 浏览器功能测试统一放在根目录 `e2e`，命名为 `<flow>.spec.ts`。
- 测试专用 Fixture、Helper 和 Setup 按所属测试层级放置，不建立同时服务所有层级的笼统 `test-utils` 目录。
- 测试名称描述用户行为和可观察结果，不描述内部方法调用过程。

## 选型结论

- 单元测试：Vitest 4，Node 环境。
- 浏览器功能测试：Playwright，运行完整应用，默认 Chromium。
- 覆盖率：Vitest V8 Coverage，全局 Statements、Branches、Functions 和 Lines 不低于 80%。
- 接口服务：继续使用现有 Vite 服务端 Mock；测试代码内部禁止 Mock 被测链路。
- 测试位置：纯单元测试贴近源码，浏览器功能测试独立放在根目录 `e2e`。

## 参考

- [Vitest 4](https://vitest.dev/blog/vitest-4)
- [Vitest 为什么基于 Vite](https://vitest.dev/guide/why)
- [Vitest Coverage](https://vitest.dev/guide/coverage)
- [Jest 30](https://jestjs.io/blog/2025/06/04/jest-30)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
- [Playwright](https://playwright.dev/docs/intro)
- [Playwright 运行与调试](https://playwright.dev/docs/running-tests)
- [Cypress 测试类型](https://docs.cypress.io/app/core-concepts/testing-types)
