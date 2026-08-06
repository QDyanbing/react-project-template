# React Project Template 开发规范

## 1. 约束级别

- 本文中的“必须”“禁止”“只能”是强制规则；“优先”表示没有明确反例时必须采用。
- 用户当前任务的明确要求高于本文；用户没有明确要求时严格执行本文。
- 现有代码与本文冲突时，不得在无关任务中顺手修改；只在当前任务覆盖对应文件时完成收敛。
- 开始修改前必须先确定本次需求涉及的层级，再检查同一模块和相邻模块的现有实现。
- 只修改当前任务需要的文件，不扩大范围，不补充用户未要求的功能。
- 不得覆盖、回退或格式化用户的无关改动。

## 2. 项目固定技术栈

- 运行时：Node.js 24，精确开发版本以 `package.json` 的 Volta 配置为准。
- 包管理器：默认使用 Utoo（`ut`），pnpm 仅作为回退方案。
- 前端框架：React 19、TypeScript、React Compiler。
- 构建工具：Vite。
- 路由：TanStack Router，手动配置路由。
- UI：Ant Design 和 `@ant-design/icons`。
- 样式：Less + CSS Modules + Ant Design CSS Variables。
- 状态管理：Zustand，不增加全局 Provider。
- 查询请求：由 Zustand 查询 Store 直接调用 Service，统一管理 `loading`、查询结果和刷新行为，不使用 `useRequest`。
- 操作请求：新增、修改、删除、登录等手动触发的请求，在行为 Hook 中使用 ahooks `useRequest`。
- 请求底层：原生 Fetch，通过 `src/utils/request.ts` 统一封装。
- 日期：Day.js。
- 国际化：i18next + react-i18next。
- Mock：Vite 服务端插件，不使用浏览器 Service Worker。
- 不得在未完成新选型前引入同类替代方案。

## 3. 业务代码分层

业务模块固定分为四层：服务层、数据层、行为层、视图层。

### 3.1 依赖方向

允许的依赖方向：

```text
视图层 -> 数据层
视图层 -> 行为层
视图层 -> 公共组件、公共 Hook、公共工具

行为层 -> 数据层
行为层 -> 服务层
行为层 -> 公共工具

数据层 -> 服务层
数据层 -> 公共工具

服务层 -> Request、API 类型
```

禁止的依赖方向：

- 服务层不得依赖数据层、行为层、视图层、React、Ant Design。
- 数据层不得依赖行为层和视图层。
- 行为层不得依赖视图组件。
- 视图层不得直接调用 Service、Request 或 `fetch`。
- 公共目录不得反向依赖任意具体页面。
- 一个页面不得导入另一个页面的 `models`、`hooks`、`components` 或样式。
- 两个页面确实需要共享的能力必须提升到 `src/components`、`src/hooks`、`src/utils` 或独立业务模块后再使用。

### 3.2 四层职责

- 服务层：只定义接口类型、接口地址、HTTP 方法、参数和返回类型。
- 数据层：只管理页面共享状态、查询条件、列表数据、详情数据和查询请求。
- 行为层：只处理新增、修改、删除、登录、保存等手动触发动作。
- 视图层：只负责组件组合、展示、事件绑定、表单校验和页面生命周期。

任何逻辑只能属于其中一层，不得为了少建文件把查询、提交和 JSX 混写在一起。

## 4. 目录结构

### 4.1 根目录

- `config`：路由等工程配置。
- `plugins`：Vite 插件，每个插件一个文件或一个独立目录。
- `mock`：Mock 接口，文件名与 Service 业务领域一致。
- `docs`：独立技术选型文档和项目任务清单。
- 工程配置不得放入 `src`。

### 4.2 src 目录

```text
src/
  components/        公共组件
  hooks/             公共 React Hook
  i18n/              国际化接入层和全局语言资源
  layouts/           公共布局
  pages/             页面模块
  services/          服务层
  theme/             Ant Design Token 和项目级 CSS Variables
  utils/             与 React 无关或弱相关的公共能力
  App.tsx             全局 Provider 组合
  AppRuntime.tsx      需要 Ant Design 运行时上下文的注册逻辑
  global.less         唯一的全局业务样式入口
  main.tsx            应用挂载入口
```

- 不得新增笼统的 `common`、`shared`、`helpers`、`misc`、`styles` 目录。
- 公共能力必须按真实职责进入 `components`、`hooks`、`services` 或 `utils`。
- `config`、`mock`、`plugins` 不得移动到 `src`。
