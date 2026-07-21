# 状态管理选型

## Zustand 5

维护主体：pmndrs 团队和社区。

定位：基于 Store、Action 和 Selector 管理 React 共享状态的轻量状态库。

优点：

- API 和样板代码较少，不要求在应用根节点增加 Provider。
- Store 与 Action 结构明确，状态读取和修改入口容易追踪。
- 组件可以通过 Selector 订阅所需状态，减少无关状态变化触发的渲染。
- 同时提供 React Hook 和独立于 React 的 Vanilla Store API。
- 官方中间件支持持久化和 Redux DevTools。
- Action 支持异步逻辑，可以调用请求服务并更新 Store。

局限：

- 默认约束较少，需要项目统一 Store、Action 和 Selector 的组织方式。
- Store 拆分不合理时容易聚合无关状态和业务逻辑。
- 不提供请求缓存、去重、失效和重试等完整的数据请求机制。

## Redux Toolkit 2

维护主体：Redux 团队和社区。

定位：Redux 官方推荐工具集，通过 Store、Slice、Action 和 Reducer 管理可预测的共享状态。

优点：

- 状态更新路径、调试记录和中间件机制明确，适合复杂状态流转。
- `configureStore`、`createSlice` 和 Immer 降低了传统 Redux 的配置和不可变更新成本。
- TypeScript、Redux DevTools 和生态工具成熟。

局限：

- 仍需要维护 Provider、Slice、Action 和统一 Store。
- 对共享状态较少的项目，架构和概念成本高于 Zustand。
- 模板需要提前确定较多状态组织约定。

## Jotai 2

维护主体：pmndrs 团队和社区。

定位：以 Atom 为基础的原子化状态库，通过组合 Atom 构建共享状态和派生关系。

优点：

- 核心 API 小，Atom 可以独立订阅，细粒度更新自然。
- 派生状态可以通过组合 Atom 表达，不需要集中式 Reducer。
- 提供持久化、重置、异步 Atom 和调试扩展。

局限：

- Atom 分散后不容易直接查看完整的共享状态结构。
- 大量 Atom 之间的依赖需要统一组织，否则状态来源和重置边界不清晰。
- 原子模型不符合以领域 Store 和显式 Action 组织状态的默认方向。

## Valtio 2

维护主体：pmndrs 团队和社区。

定位：使用 JavaScript Proxy 创建可变状态对象，通过 Snapshot 在 React 中订阅读取过的状态。

优点：

- 状态读取和修改接近普通 JavaScript 对象，嵌套对象的更新代码较少。
- Proxy 状态可以独立于 React 使用。
- React 组件通过 Snapshot 订阅访问过的属性，能够进行细粒度更新。

局限：

- 状态可以直接修改，写入边界不如显式 Action 清晰。
- 复杂项目中不容易追踪状态修改来源。
- Proxy、Snapshot 和普通对象具有不同的读取与引用语义。

## 选型结论

选择 Zustand 5 管理共享状态。

Zustand 在 API 成本、状态结构和扩展能力之间保持了合适的平衡。Store、Action 和 Selector 能够形成明确的数据流，同时不需要建立 Redux Toolkit 的集中式架构，也避免了 Jotai 的分散 Atom 和 Valtio 的直接可变写入。

模板使用 Zustand 提供默认状态管理能力，不预置具体业务 Store。持久化、异步请求和 Store 拆分根据实际业务需要接入。

## 参考

- [Zustand 文档](https://zustand.docs.pmnd.rs/)
- [Redux Toolkit 介绍](https://redux-toolkit.js.org/introduction/why-rtk-is-redux-today)
- [Jotai 文档](https://jotai.org/docs)
- [Valtio 文档](https://valtio.dev/)
