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

## 5. 服务层规范

### 5.1 文件职责

`src/services/<domain>.ts` 只能包含：

- Request 引入。
- 同一业务领域的接口方法。
- URL、Path 参数、Query 参数、Body 参数的组装。
- Request 入参和返回值泛型。

禁止包含：

- React Hook、Zustand、`useRequest`。
- Ant Design、`message`、`notification`、Modal。
- 页面跳转、成功提示、分页组件状态。
- Form 数据转换和视图展示逻辑。
- 接口响应的页面级二次缓存。

### 5.2 方法命名与顺序

- 向服务端提交数据或改变服务端数据时，方法名必须以 `set` 开头，包括新增、修改、删除和其他写操作。
- 从服务端获取数据且不改变服务端数据时，方法名必须以 `get` 开头，包括列表、详情、选项和其他读操作。
- Service 文件名已经表达业务模块，`set`、`get` 后只能追加当前接口要执行的动作，不得重复模块名称。
- 正确命名：`setCreate`、`setModify`、`setDelete`、`getSearch`、`getDetail`、`getOptions`。
- 禁止命名：`setHomeCreate`、`getHomeSearch`、`createHome`、`getHomeList`、`fetchData`、`loadData`、`submit`、`handleSave`。

一个 Service 文件的接口顺序固定为：

1. `setCreate`
2. `setModify`
3. `setDelete`
4. 其他 `setXxx`
5. `getSearch`
6. `getDetail`
7. `getOptions`
8. 其他 `getXxx`

同一组内按业务操作顺序排列，不得把 `get` 和 `set` 交错。

### 5.3 RESTful 与 URL

- 创建资源使用 `POST /resource`。
- 修改资源使用 `PUT /resource/${uuid}`。
- 删除资源使用 `DELETE /resource/${uuid}`。
- 列表查询使用 `GET /resource`。
- 详情查询使用 `GET /resource/${uuid}`。
- 接口需要通过主键、父级主键或其他标识定位具体数据时，定位参数必须作为独立参数传递，不得合并到 Query 或 Body 数据对象中。
- 定位参数必须排在业务数据参数之前；存在多个定位参数时，参数顺序必须与 URL Path 中的出现顺序一致。
- Query 或 Body 数据统一放在 `data` 参数中，只包含查询条件或需要提交的业务字段。
- 正确写法：`setModify(uuid: string, data: API.HomeSetParams)`、`getChild(uuid: string, data: API.HomeChildParams)`、`getDetail(uuid: string)`。
- 禁止把 `uuid` 合并进 `HomeSetParams`、`HomeChildParams`，也不得为了传递单个标识创建 `<Domain>UuidParams`。
- 所有接口地址必须使用模板字符串，包括没有变量的地址： `` `/api/home` ``。
- 页面和 Model 不得拼接接口 URL。
- HTTP 方法语义必须与资源操作一致，不得把所有接口统一写成 POST。

### 5.4 Service 类型

类型固定放在 `src/services/typing.<domain>.d.ts` 的 `API` Namespace 中。

- 类型名必须以大驼峰模块名开头，再追加具体用途，避免 `API` Namespace 中出现重名。
- 方法名中省略的模块名必须在类型名中补全，例如 `setCreate` 使用 `HomeSetParams`，`getSearch` 使用 `HomeParams`。
- 禁止使用 `SetParams`、`Params`、`Data`、`Detail` 等缺少模块名的短类型名。

同一领域类型顺序固定为：

1. 新增和修改参数：`<Domain>SetParams`
2. 列表查询参数：`<Domain>Params`
3. 实体类型：`<Domain>`，不追加含义空泛的 `Data`
4. 其他选项或详情专用类型

字段顺序固定为：

1. 主键和标识字段
2. 核心必填业务字段
3. 可选业务字段
4. 状态字段
5. 创建和修改信息

- 可选字段必须使用 `?` 表达，不得用必填的 `string | undefined` 代替。
- 不得重复定义 `SuccessResult`、`PageResult` 等全局响应结构。
- 不得创建 `HomeResult extends Result<...>` 这类只包一层的接口。
- Service 的参数和返回类型必须使用业务真实类型，不得使用 `any`、`object`、`Record<string, unknown>` 逃避建模。

### 6.1 Zustand 固定写法

- 页面共享状态必须使用 Zustand `create<Store>`。
- 不增加 Provider，不在页面根节点包裹页面 Store。
- Store 内不得调用 React Hook。
- Store 之间协作使用 `getState()` 和 `subscribe()`，不得在 Store 创建函数中调用另一个 Store Hook。
- 组件读取同一 Store 时一次调用并解构所需字段，不得连续写多次同一 Store Selector。
- 只有依赖旧 State 计算新 State 时使用函数式 `set`；只修改单个字段时直接 `set({ field: value })`。
- Zustand 的局部更新不会覆盖未传入字段，不得为了“保留其他字段”手动展开完整 State。

### 6.2 usePage

列表页 `usePage` 的 State 顺序固定为：

1. `ready`
2. `params`
3. 查询条件 Action
4. 分页 Action
5. `mount`
6. `unmount`

详情页和设置页 `usePage` 的 State 顺序固定为：

1. `ready`，仅确实需要区分挂载状态时存在
2. `uuid` 或其他页面初始化参数
3. `mount`
4. `unmount`

- `uuid` 已经能表达是否可查询时，不得额外保存 `ready`。
- 搜索条件发生变化时必须把 `pageNum` 重置为 1。
- 分页变化只更新 `pageNum`、`pageSize`。
- 列表页离开时默认只把 `ready` 改为 `false`，保留查询条件和分页，以便再次进入恢复上次条件。
- 详情页离开时清空 `uuid`。
- 默认分页数量必须来自 `src/utils/pageSize.ts`。

### 6.3 useData 与 useDetail

- `useData` 只能负责列表请求。
- `useDetail` 只能负责详情请求。
- 一个查询 Store 默认只能有一个主接口。
- 查询 Store 直接调用 Service，不使用 `useRequest`。
- 查询由 `usePage` 的 `ready`、`params` 或 `uuid` 变化驱动，不在页面中手动重复触发。
- 查询 Store 必须暴露 `loading`；列表额外暴露 `data`、`total`、`onRefresh`。
- `loading` 必须排在 `data`、`total` 之前。
- 列表初始值固定为 `data: []`、`total: 0`。
- 详情无数据使用 `undefined`，不得伪造空实体。
- 请求返回前页面参数可能变化时，写入前必须检查当前 `uuid` 或请求条件，避免旧响应覆盖新页面。
- `finally` 只负责与当前请求对应的 Loading 收尾，不得清空有效数据。
- 页面卸载时应重置当前查询 Store 的 Loading；是否清空数据根据页面语义决定。
- 私有请求方法使用 `getData`，对外刷新方法使用 `onRefresh`。

### 6.4 Store 内部顺序

Store 文件固定按以下顺序书写：

1. Imports
2. `Store` 接口
3. `create<Store>`
4. 初始 State 常量，顺序与 `Store` 接口一致
5. 私有查询方法
6. 对外 Action
7. 其他 Store 的订阅
8. Return，字段顺序与 `Store` 接口一致

不得在 State 常量之间穿插 Action，不得在订阅之后继续声明主要方法。

## 7. 行为层规范
