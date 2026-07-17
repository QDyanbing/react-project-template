# 路由选型

## 路由方案对比

### React Router 8

维护主体：React Router 团队，采用开放治理模式。

定位：提供 Declarative、Data 和 Framework 三种模式，可以作为基础路由库使用，也可以接管数据加载、类型生成和服务端渲染等应用框架能力。

优点：

- React 路由生态成熟，使用范围和第三方集成广。
- 可以根据项目复杂度选择不同模式。
- Data Mode 支持路由级数据加载、提交、导航状态、错误处理和懒加载。

局限：

- 多种模式增加了选择和理解成本。
- Library 和 Data Mode 的路径参数、搜索参数和导航目标类型能力弱于 TanStack Router。
- 完整类型生成和自动拆包主要依赖 Framework Mode，会引入另一层应用框架约定。

### TanStack Router 1

维护主体：TanStack 团队和社区。

定位：以 TypeScript 类型安全为核心的客户端路由，支持文件式和代码式路由。

优点：

- 路径参数、搜索参数、导航目标和路由上下文可以贯穿路由树完成类型推导。
- 搜索参数支持解析和校验，适合承载筛选、分页等页面状态。
- 代码式路由可以显式维护完整路由树，不依赖文件扫描和代码生成。
- 支持对代码式路由进行显式懒加载。

局限：

- 代码式路由需要手动声明父子关系，配置量高于文件式路由。
- 自定义配置数组经过动态转换后，无法完整保留原生代码式路由的路径字面量推导。
- 自动代码拆分只适用于文件式路由，代码式路由需要显式配置懒加载。
- 复杂路由树会增加 TypeScript 类型推导成本。
- 生态采用和既有项目迁移案例少于 React Router。

结论：选择 TanStack Router 1，通过项目维护的配置数组声明路由，并统一对页面组件进行懒加载。

## 路由声明方式

### 代码式路由

代码式路由通过配置数组显式声明路径、页面组件和子路由。顶层路由使用绝对路径，`children` 使用相对父路由的路径。路径、层级和页面入口均可直接查看、检索和调试，不依赖文件扫描或代码生成。

### 文件式路由

文件结构映射 URL 和路由层级，页面通过 `createFileRoute` 声明自身配置。它可以减少父子关系配置，但需要遵循文件命名约定，并依赖构建插件扫描文件和生成路由树。

结论：选择代码式路由，在 `config/routes.ts` 中手动维护配置数组，由 `config/router.ts` 转换为 TanStack Router 路由树。项目不接入 TanStack Router Vite 插件，也不生成路由配置文件。

## 路由模式

### History

URL 不包含 `#`，路径结构更自然。服务器需要将无法匹配的页面请求回退到 `index.html`，否则直接访问子路径会返回 404。

### Hash

路由路径保存在 URL 的 `#` 之后，不依赖服务器配置，可以部署到无法设置回退规则的静态托管环境，但 URL 可读性较差。

结论：默认使用 History，同时保留切换到 Hash 的能力。两种模式共用同一份路由树，仅在创建 Router 时选择对应的 History 实现，不在应用运行过程中动态切换。

## 路由懒加载

所有页面组件均使用动态导入，避免页面代码进入主包，不再为单个路由设置懒加载开关。项目适配层将动态导入转换为 TanStack Router 的懒加载组件。

## 选型结论

| 项目 | 结论 |
| --- | --- |
| 路由库 | TanStack Router 1 稳定版本 |
| 路由声明 | 代码式路由 |
| 路由树 | 在 `config/routes.ts` 中手动维护配置数组 |
| 路由模式 | 默认使用 History，可切换为 Hash |
| 页面拆包 | 所有页面组件均使用动态导入 |

## 参考

- [React Router 版本记录](https://reactrouter.com/start/start/changelog)
- [React Router 使用模式](https://reactrouter.com/start/modes)
- [TanStack Router 类型安全](https://tanstack.com/router/latest/docs/guide/type-safety)
- [TanStack Router 代码式路由](https://tanstack.com/router/latest/docs/framework/react/routing/code-based-routing)
- [TanStack Router 文件式路由](https://tanstack.com/router/latest/docs/routing/file-based-routing)
- [TanStack Router 代码拆分](https://tanstack.com/router/latest/docs/guide/code-splitting)
- [TanStack Router History 类型](https://tanstack.com/router/latest/docs/guide/history-types)
