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

字段顺序必须按业务语义和使用权重排列：

1. 主键和唯一标识字段
2. 核心业务字段，按业务重要性和实际操作顺序排列
3. 关联数据字段
4. 状态字段
5. 创建和修改信息

- 字段是否可选不得作为排序依据，不得为了把必填字段放在可选字段前而破坏业务字段的自然顺序。
- 同一业务概念的字段必须相邻，例如姓名、邮箱、手机号等用户资料字段应连续排列。
- 列表查询参数必须先写业务查询条件，最后依次写 `pageNum`、`pageSize`。
- 可选字段必须使用 `?` 表达，不得用必填的 `string | undefined` 代替。
- 不得重复定义 `SuccessResult`、`PageResult` 等全局响应结构。
- 不得创建 `HomeResult extends Result<...>` 这类只包一层的接口。
- Service 的参数和返回类型必须使用业务真实类型，不得使用 `any`、`object`、`Record<string, unknown>` 逃避建模。

### 5.5 关联数据交互

- 前端向后端提交数据时，引用其他业务模块的数据默认只能提交被关联实体的主键，不得提交完整关联对象。
- 单个关联主键使用 `<relation>Uuid`，多个关联主键使用 `<relation>Uuids`；例如用户关联角色时，`UserSetParams` 必须提交 `roleUuids: string[]`，不得提交 `roles: Role[]`。
- 后端向前端返回数据时，必须返回被关联实体的完整对象或完整对象数组，不得只返回关联主键。
- 返回类型必须直接复用被关联模块的实体类型；例如 `User.roles` 必须使用 `Role[]`，不得返回 `roleUuids`，也不得在用户模块重复定义角色类型。
- 请求参数与响应实体的关联字段结构不同，必须分别使用 `<Domain>SetParams` 和 `<Domain>` 建模，不得为了复用类型混合主键与完整对象。
- 后端接口文档只返回关联主键、要求前端提交完整关联对象，或重复定义关联实体结构时，必须先明确指出接口契约问题及其影响，停止按该契约直接实现。
- 接口契约问题未经确认前，不得通过照抄接口文档、放宽前端类型或在页面临时转换的方式掩盖问题。

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

### 7.1 职责

行为层位于页面 `hooks`，负责手动动作：

- 登录、退出。
- 新增、修改、删除。
- 保存、导入、导出、冻结、解绑等用户触发操作。
- 成功提示。
- 成功后的刷新、关闭或页面返回。

行为层不得：

- 管理搜索条件和分页。
- 查询列表或详情。
- 保存与动作无关的共享 State。
- 渲染 JSX。
- 执行 Form 校验。

### 7.2 固定规则

- 一个 Hook 只处理一个动作，文件名和触发方法一一对应。
- `useCreate` 只暴露 `loading`、`onCreate`。
- `useModify` 只暴露 `loading`、`onModify`。
- `useDelete` 只暴露 `loading`、`onDelete`。
- 行为 Hook 使用 `useRequest(serviceMethod, { manual: true })`。
- Hook 返回值依赖类型推导，不额外声明 `Store` 或返回接口。
- 修改动作需要的 `uuid` 从页面 Store 获取，不由视图层重复传递。
- 请求失败默认由 Request 全局处理，行为 Hook 不写空 `catch`，不重复 `message.error`。
- 请求成功后由行为 Hook完成成功提示和后续动作。
- 行为方法成功或失败都不得返回无业务含义的 `true`、`false`。
- 新增、修改成功以及取消操作优先使用 `onHistoryBack(defaultPath)` 返回来源页。

### 7.3 Hook 内部顺序

行为 Hook 固定按以下顺序书写：

1. 页面 Store 或 Store 静态访问准备
2. 国际化 Hook
3. Ant Design `App.useApp()` 上下文
4. `useRequest`
5. 对外 Action
6. Return

同组声明之间不空行，不同组之间空一行。

## 8. 视图层规范

### 8.1 页面职责

页面只能负责：

- 消费数据 Store 和行为 Hook。
- 定义 Table Columns、Descriptions Items 等视图配置。
- 组织 Header、SearchBar、Body、Footer。
- 绑定事件。
- Form 创建、字段校验和 `onFinish` 编排。
- 在 `useEffect` 中调用 `mount`，Cleanup 返回 `unmount`。

页面禁止：

- 导入 Service、Request 或直接调用 `fetch`。
- 在 JSX 文件中写列表和详情请求。
- 在视图层解包复杂接口响应。
- 重复维护 Store 已有的 `uuid`、`params`、`data`、`total`、`open`。
- 在页面中处理全局请求错误。

### 8.2 页面根节点

- 有页面级 Loading 的业务页面根节点必须是 Ant Design `Spin`。
- `spinning` 统一合并查询 Loading 和页面级行为 Loading。
- 删除等行级动作如果会影响整个列表，Loading 放到页面 `Spin`，不得让每一行删除按钮同时显示 Loading。
- `Spin.classNames.root` 使用页面模块语义，例如 `styles.home`、`styles.homeDetail`、`styles.homeSet`。
- `Spin.classNames.container` 固定使用 `styles.container`。
- Spin 内不得再增加只用于承载页面 Class 的无意义根节点。

### 8.3 页面结构

页面结构固定使用以下语义区域，按需存在：

1. `header`
2. `searchBar`
3. `body`
4. `footer`

- 没有实际内容的 Header 不得创建。
- 搜索区和操作区必须在 SearchBar 内分别使用一层 `Flex`，即使当前各只有一个控件，也要为后续扩展保留稳定结构。
- 列表主体使用 Table，Pagination 独立放在 Footer。
- Table 必须设置 `pagination={false}`，不得使用 Table 内置分页。
- 需要固定表头时由 Table 的 Sticky/Scroll 能力实现，不得复制两份 Table。
- 操作列的 `dataIndex` 使用实体主键，例如 `uuid`。
- 操作列设置够用的固定宽度，不得用超宽页面或横向溢出掩盖列宽问题。
- 危险操作必须使用 `Popconfirm` 或更明确的确认组件，不得点击后立即执行。

### 8.4 页面私有组件

- 强业务耦合的页面私有组件可以直接读取当前页面 Store 和行为 Hook，避免层层传递 Props。
- 公共组件和纯展示组件必须使用 Props，不得依赖具体页面 Store。
- SearchBar、DataSet、Detail 等组件只负责单一区域，不得复制页面级请求和状态。
- 不得为了“组件化”拆出只有一行 JSX、没有独立语义的组件。

### 8.5 Form

- 使用 Ant Design Form 管理字段、校验和提交。
- Form 类型能够从 `Form.useForm<T>()` 推导时，不在 `<Form<T>>` 上重复标注。
- 字段校验只能放在 `Form.Item.rules` 或明确的表单校验函数中。
- `onFinish` 只根据当前模式调用对应行为 Hook，不直接调用 Service。
- 修改态详情返回后使用 `form.setFieldsValue`；无详情时使用 `form.resetFields`。
- 取消按钮调用 `onHistoryBack(defaultPath)`，不得固定跳回某个与来源无关的页面。
- 提交按钮通过 `form.submit()` 触发表单流程，不绕过 Form 校验。

## 9. 页面目录契约

### 9.1 列表页

一个带查询、分页和操作的列表页按以下结构组织：

```text
pages/Home/
  components/
    SearchBar/
      index.tsx
      index.module.less       仅存在必要样式时创建
  hooks/
    useDelete.ts              每个提交动作一个 Hook
  locale/
    en-US.ts
    zh-CN.ts
  models/
    usePage.ts                ready、查询条件、分页条件
    useData.ts                列表数据和列表查询
  index.tsx                   页面组合、Table、Pagination、生命周期
  index.module.less           仅存在必要样式时创建
```

固定职责：

- `usePage` 管理 `ready`、搜索条件、分页条件、`mount`、`unmount`。
- `useData` 只负责一个列表查询，暴露 `loading`、`data`、`total`、`onRefresh`。
- `SearchBar` 管理搜索区和操作区，不直接发请求。
- `useDelete` 只负责删除动作。
- `index.tsx` 负责 Columns、页面结构、分页和挂载卸载。

### 9.2 详情页

```text
pages/HomeDetail/
  locale/
    en-US.ts
    zh-CN.ts
  models/
    usePage.ts                uuid 等页面初始化参数
    useDetail.ts              详情数据和详情查询
  index.tsx
  index.module.less           仅存在必要样式时创建
```

固定职责：

- `usePage` 保存当前页面的 `uuid`，提供 `mount`、`unmount`。
- `useDetail` 只负责详情接口和详情数据。
- 页面不得直接调用 `getDetail`。

### 9.3 新增与修改页

新增和修改共用一个页面时按以下结构组织：

```text
pages/HomeSet/
  hooks/
    useCreate.ts
    useModify.ts
  locale/
    en-US.ts
    zh-CN.ts
  models/
    usePage.ts                ready、uuid
    useDetail.ts              修改态详情数据
  index.tsx                   Form、校验、模式编排
  index.module.less           仅存在必要样式时创建
```

固定职责：

- 是否为修改态直接通过 `uuid` 判断，不新增 `isModify` 等重复状态。
- `uuid` 由 `usePage` 保存；`useModify` 从 Store 读取，不要求页面再次传入。
- `useDetail` 只在存在 `uuid` 时查询详情。
- Form 校验和 `onFinish` 在视图层。
- 新增和修改分别使用 `useCreate`、`useModify`，不得合并成 `useSubmit`。

### 9.4 简单页面

- 403、404 等无共享状态、无请求页面可以只有 `index.tsx` 和 `locale`。
- Login 等有单一动作但无查询状态的页面可以只有 `hooks`、`locale`、`index.tsx` 和必要样式。
- 不得为了满足目录外观创建空的 `components`、`hooks` 或 `models`。

## 10. 命名规则

### 10.1 文件和目录

- 页面目录：`Home`、`HomeDetail`、`HomeSet`。
- 组件目录：`SearchBar`、`LocaleSwitch`。
- Hook 文件：`useCreate.ts`、`useModify.ts`、`useDelete.ts`。
- Store 文件：`usePage.ts`、`useData.ts`、`useDetail.ts`。
- Service 文件：业务领域小驼峰，例如 `home.ts`、`account.ts`。
- Service 类型文件：`typing.<domain>.d.ts`，例如 `typing.home.d.ts`。
- Locale 文件：固定为 `zh-CN.ts`、`en-US.ts`。
- CSS Module：页面入口使用 `index.module.less`，单文件组件使用与组件一致的 `*.module.less`。

### 10.2 标识符

- React 组件、TypeScript 类型和接口：大驼峰。
- 普通变量、方法、对象字段：小驼峰。
- React Hook：必须以 `use` 开头。
- 事件方法：必须以 `on` 开头，例如 `onSearch`、`onCreate`、`onDelete`。
- 页面生命周期 Action：固定使用 `mount`、`unmount`，不得新增 `init`、`destroy`、`onLoad` 等平行命名。
- 常量：全大写下划线，例如 `DATE_FORMAT`、`DEFAULT_PAGE_SIZE`。
- Zustand Store 类型：统一命名为 `Store`，不得使用 `IStore`、`PageStore` 等同义命名。
- 布尔值使用 `is`、`has`、`can`、`should` 前缀；不得使用含义不明的 `flag`。
- 数组使用复数名；不得使用 `listData`、`dataList` 等重复语义。

## 11. 导出与函数写法

- 页面、组件、Hook、Zustand Store 必须默认导出。
- 页面、组件和 Hook 优先使用匿名箭头函数：`export default () => {}`。
- Service 和公共工具使用具名箭头函数：`export const getSearch = (...) => {}`。
- 禁止在新业务代码中使用 `export default function Xxx()` 或 `export function getSearch()`。
- 只有函数重载、递归或确实依赖 Hoisting 时才允许函数声明，并必须能够说明原因。
- 一个文件只能有一个主要职责。
- 一个行为 Hook 只能处理一个动作。
- 不得为单个文件创建仅用于转发导出的 `index.ts`。
- 不得新增无意义的参数类型、返回类型或中间接口。
- TypeScript 可以可靠推导时不得手写重复类型。

## 12. Ant Design 组件优先级

### 12.1 禁止原生节点替代现有组件

存在 Ant Design 对应组件时必须使用 Ant Design：

- 布局：`Flex`，不得使用 `div` 实现 Flex/Grid 页面布局。
- 间距：优先 `Flex gap`；`Space` 仅用于小范围行内操作集合。
- 文本和标题：`Typography.Text`、`Typography.Title`、`Typography.Paragraph`，不得直接使用 `span`、`p`、`h1` 至 `h6`。
- 图片：`Image`，不得直接使用 `img`，除非必须绕过预览和加载行为且有明确原因。
- 操作：`Button`，不得使用原生 `button`、可点击 `div` 或可点击 `span`。
- 链接式操作：`Button type="link"`，不得用无路由语义的原生 `a`。
- 输入：`Input`、`Input.Search`、`Input.TextArea`，不得使用原生 `input`、`textarea`。
- 选择：`Select`、`TreeSelect`、`Cascader`，不得自行实现下拉层。
- 表单：`Form`、`Form.Item`，不得自行拼 Label、错误文案和校验状态。
- 加载：`Spin`、`Skeleton`，不得手写 Loading DOM。
- 空状态：`Empty`，不得手写空状态图标和文案布局。
- 结果页：`Result`，不得为 403、404、500 单独重写结构和样式。
- 提示：`App.useApp()` 提供的 Message、Notification、Modal。
- 危险确认：`Popconfirm` 或 Modal，不得使用 `window.confirm`。
- 分页：`Pagination`，不得自行计算和渲染页码。
- 数据展示：优先 `Table`、`Descriptions`、`List`、`Statistic`。
- 标签和状态：`Tag`、`Badge`，不得用带背景色的 `span` 模拟。
- 图标：优先 `@ant-design/icons`，不得使用 Emoji 或手写 SVG 代替已有图标。

### 12.2 允许原生节点的条件

只有以下情况允许原生节点：

- React 挂载点和浏览器必须的基础节点。
- Ant Design 没有对应语义组件。
- 第三方库明确要求传入原生节点。
- 使用原生语义元素能带来不可替代的可访问性，并且 Ant Design 组件无法通过 `component` 等 Props 实现。

使用前必须先查询当前 Ant Design 版本的组件 API，不得仅凭记忆认定“没有组件”。

### 12.3 Props 优先于样式

- 先使用组件自身 Props。
- 再使用 Component Token 和全局 Token。
- 再使用组件提供的 `className`、`classNames` 语义插槽。
- 最后才允许新增 CSS Module。
- 不得通过覆盖 `.ant-*` 内部类名修改组件。
- 不得使用 `!important` 对抗 Ant Design 样式。

## 13. 禁止内联样式

- TSX 中禁止使用 `style` Prop。
- TSX 中禁止使用 Ant Design 的 `styles` Prop。
- 禁止创建 `CSSProperties` 对象后传给组件。
- 禁止使用对象展开动态拼接内联样式。
- 禁止为了少写一个 Class 而写内联尺寸、颜色、间距和定位。
- 动态视觉状态优先使用组件 Props、`className` 条件切换、`classNames` 或 Token。
- 确实无法由 Class 和 Token 表达的动态值必须先调整组件设计，不得直接突破该规则。

## 14. Less 与主题变量

### 14.1 是否允许创建 Less

只有以下情况允许新增或修改 Less：

- 页面整体区域需要 Flex 占位、滚动或固定尺寸。
- Ant Design Props 和 Token 无法表达必要布局。
- 需要页面级背景、定位或复杂视觉设计。
- 需要使用组件 `classNames` 语义插槽调整必要样式。

以下情况不得创建 Less：

- 只为了给组件增加 Ant Design 已有的 Margin、Padding、Gap。
- 只为了修改 Button、Result、Empty、Form 等已有组件默认样式。
- 只为了增加一个无业务意义的 Wrapper。
- 403、404 等 Result 页面可以由公共 Layout 定位时，不得增加页面样式文件。

### 14.2 变量来源

CSS 属性值优先级固定为：

1. Ant Design CSS Variables，例如 `var(--ant-padding)`、`var(--ant-color-bg-container)`。
2. `src/theme/variables.ts` 中的项目级语义变量，例如 `--layout-header-height`。
3. CSS 语法控制值，例如 `0`、`auto`、`none`、`inherit`、`transparent`、`100%`、`1fr`。
4. 前三项无法覆盖的视觉值必须先加入 `src/theme/variables.ts`，再通过 CSS Variable 使用。

- 项目级变量必须按领域命名，例如 `--layout-*`、`--table-*`、`--login-*`。
- 不新增 `--size1`、`--space2`、`--value` 等无语义变量。
- Less 中禁止直接写入表达视觉规格的硬编码尺寸、间距、字号、圆角、颜色、阴影和定位偏移。
- 颜色优先使用 Ant Design Color Token。
- 项目级变量确需声明颜色值时使用八位完整十六进制格式，遵守 Stylelint `color-hex-length: long`。

### 14.3 Less 结构

- 页面和组件的 `*.module.less` 必须使用嵌套结构，只能存在一个顶级根类。
- CSS Module 根类使用页面或组件名，例如 `.home`、`.homeSet`、`.searchBar`。
- 其他元素类、状态类、伪类和媒体查询必须按照实际 DOM 层级嵌套在根类中，不得写成与根类并列的顶级选择器。
- `Spin` 容器类固定命名为 `.container`，并嵌套在对应页面根类中。
- 页面内部类使用 `header`、`searchBar`、`body`、`footer`、`action`、`table` 等语义名。
- 禁止 `box1`、`content1`、`leftBox`、`wrapper2` 等弱语义命名。
- 禁止把 `.home`、`.container`、`.header`、`.body` 等同一页面选择器平铺为多个顶级规则块。
- 嵌套深度不超过三层；超过时优先拆组件。
- `src/global.less` 只允许为 `html`、`body`、`#root`、全局 Reset 和全局基础样式保留必要的顶级选择器，不得承载页面或组件样式。
- 禁止使用 `:global` 修改 Ant Design 内部结构，除非当前组件没有语义 `classNames` API，且修改范围被页面根类严格限制。

### 14.4 CSS 属性顺序

同一规则块属性按以下顺序书写：

1. 定位和层级：`position`、`inset`、`z-index`
2. 布局：`display`、`flex`、`grid`、`align-*`、`justify-*`
3. 尺寸：`width`、`height`、`min-*`、`max-*`
4. 间距：`margin`、`padding`、`gap`
5. 溢出：`overflow`
6. 字体：`font-*`、`line-height`、`text-*`
7. 边框和圆角：`border`、`border-radius`
8. 背景和颜色：`background`、`color`
9. 阴影、透明和变换：`box-shadow`、`opacity`、`transform`、`filter`

属性之间不插空行；嵌套子块前空一行。

## 15. Imports、空行和代码顺序

### 15.1 Import 分组

1. 第三方依赖。
2. 项目绝对路径：`@/`、`@config/`。
3. 当前目录相对路径。

- 不同组之间空一行。
- 同一组内部不空行。
- 类型 Import 使用 `import type`。
- Import 排序最终以 Prettier Organize Imports 结果为准，不手工制造与格式化器冲突的顺序。

### 15.2 页面内部顺序

页面和组件函数内部固定按以下顺序：

1. 数据 Store：`usePage`、`useData`、`useDetail`
2. 行为 Hook：`useCreate`、`useModify`、`useDelete`
3. 路由、URL、Form 等框架 Hook
4. 国际化、Ant Design App 上下文
5. 页面局部 State
6. 派生值：`columns`、`items`、`spinning` 等
7. 事件方法：`onFinish`、`onSubmit` 等
8. `useEffect`
9. Return JSX

- 同一组声明之间不得空行。
- 不同组之间必须空一行。
- 多个事件方法之间空一行。
- 多个 `useEffect` 之间空一行。
- `useEffect` 必须位于事件方法之后、Return 之前。
- 不得在 `useEffect` 之后继续声明 Columns、事件方法或派生值。
- 函数体开始后不空行；Return 前只保留一个空行。
- 不得出现连续两个以上空行。

### 15.3 对象与返回值顺序

- Interface、初始 State、Return Object 的字段顺序必须一致。
- State 字段在前，Action 字段在后。
- Loading 在数据之前，例如 `loading`、`data`、`total`。
- Props 类型字段按 JSX 使用顺序和业务权重排列；是否可选不得作为排序依据。
- 不得为了“看起来完整”返回内部方法和中间状态。

## 16. JSX Props 顺序

JSX Props 固定按以下优先级排列：

1. 无值布尔 Props，例如 `vertical`、`allowClear`、`sticky`
2. 静态短 Props，例如 `type="primary"`、`size="small"`、`mode="inline"`
3. 静态长 Props
4. 标识和数据 Props，例如 `rowKey`、`name`、`items`、`columns`、`dataSource`
5. 受控状态 Props，例如 `value`、`open`、`loading`、`disabled`
6. 展示配置 Props，例如 `icon`、`placeholder`、`rules`
7. `className`、`classNames`
8. Render Props 和复杂函数 Props
9. `onXxx` 事件 Props

同一优先级内：

- 静态值在动态值前。
- 短的在前，长的在后。
- 语义主属性在辅助属性前。

禁止：

- 动态 Props 全部放在静态 Props 前。
- `onClick` 穿插在数据 Props 中间。
- 为了消除 Promise 类型提示给事件增加无意义的 `void`。
- 在 JSX 中写多层业务判断或嵌套三目运算。

## 17. 条件、函数与抽象

- 禁止嵌套三目运算；简单二选一可以使用单层三目。
- 多状态处理使用 `if / else if / else` 或 `switch`。
- 能使用匿名箭头函数时优先使用匿名箭头函数。
- 不添加只被调用一次、且没有独立语义的包装函数。
- 不为了去掉三行重复代码创建几十行泛型或条件类型。
- 不使用 `continue use`、`first phase` 等依赖历史上下文的命名和注释。
- 不添加无意义的 `void`、`Boolean()`、双重取反、中间变量或类型断言。
- 异步 Action 没有业务返回值时不得返回 `true`、`false`。
- 空值行为必须明确区分 `undefined`、空字符串、`null`，不得擅自互相转换。

## 18. 路由与跳转

- 路由声明只能放在 `config/routes.ts`。
- Router 创建和 History 模式只能放在 `config/router.ts`。
- 路由使用手动配置，不引入文件式路由。
- 所有页面路由默认懒加载。
- Login 位于公共 Layout 外；业务页和 403、404 等状态页位于公共 Layout 下。
- 未匹配地址必须重定向 404。
- 业务层禁止直接使用 TanStack Router Navigate、`router.navigate`、`location`、`history`、`window.open`。
- 普通跳转使用 `onHistoryChange`。
- 替换当前记录使用 `onHistoryReplace`。
- 返回来源页并提供兜底地址使用 `onHistoryBack`。
- 新标签页使用 `onOpenTab`。
- 取消和提交成功优先返回来源页，不能无条件跳转到固定列表页。

## 19. Request、Token 与 Storage

- 业务接口只能通过 `src/utils/request.ts`。
- Request 统一处理 Headers、Authorization、Query、JSON、HTTP 错误和业务错误。
- 页面、组件、Hook 和 Model 禁止直接调用原生 `fetch`。
- 调用方显式传入 Authorization 时 Request 不得覆盖。
- Token 只能通过 `getToken`、`setToken`、`deleteToken` 访问。
- 业务代码不得知道 Token 的 Storage Key。
- 普通前端存储只能通过 `getStorage`、`setStorage`、`deleteStorage`。
- 业务代码不得直接调用 `localStorage`、`sessionStorage` 或操作 Cookie。
- Storage 底层错误必须在工具层消化，不向业务层抛出浏览器存储异常。
- 全局已处理的请求错误，页面和行为 Hook 不重复 Catch 和提示。
- 只有明确关闭全局错误处理的局部表单错误才允许调用方捕获。

## 20. 国际化

- 所有用户可见文案必须进入 Locale 文件。
- 页面 Namespace 使用页面目录对应的小驼峰，例如 `HomeSet -> homeSet`。
- 公共组件拥有自己的 Namespace，不复用某个页面 Namespace。
- `zh-CN.ts` 和 `en-US.ts` 的 Key 结构必须完全一致。
- 页面和组件只加载自己的 Namespace。
- 动态数值使用 i18next 插值。
- 文案中包含 DOM 或 Ant Design 组件时使用 `Trans`，不得拆成多个字符串手工拼接。
- Ant Design Locale、Day.js Locale 和业务语言必须由同一次语言切换驱动。
- 禁止在 JSX、Message、Placeholder、Form Rules、Popconfirm 中新增硬编码用户文案。

## 21. 公共能力

- 页面跳转统一使用 `src/utils/history.ts`。
- 日期和时间格式统一使用 `src/utils/format.ts` 以及导出的格式常量。
- 默认分页数量统一使用 `src/utils/pageSize.ts`。
- URL 查询状态统一使用 `src/hooks/useUrlState.ts`。
- 全局请求错误提示通过 `src/utils/message` 注册。
- 普通业务成功提示通过 `App.useApp()` 获取，不使用静态 Message API。
- 新增公共工具前必须至少满足一项：消除跨模块真实重复、隔离可替换底层、统一全局行为。
- 当前页面私有逻辑不得因为“以后可能复用”提前移入公共目录。

## 22. Mock

- Mock 文件位于根目录 `mock`，文件名与 Service 领域一致。
- Mock 路径和 HTTP 方法必须与 Service 完全一致。
- Mock 返回结构必须符合 `API.SuccessResult` 或错误响应结构。
- Mock 是 Vite 服务端行为，不得依赖浏览器刷新保存状态。
- Mock 数据在开发服务器生命周期内可以保持，浏览器刷新不得重置服务端内存数据。
- 不得引入 MSW、Mock.js 等第二套 Mock 机制。
- Mock 聚合由 Vite 插件自动完成，不手工维护模块列表。

## 23. 文档

- 每项技术选型一个独立文件，按 `docs/NN_xxx.md` 编号。
- 选型文档必须对外可读，包含候选方案、维护主体、优缺点、取舍和明确结论。
- 选型文档不得保留对话提示、讨论状态、推进计划、待确认列表。
- 不得使用“继续使用”“首期”“先这样”“后面再说”等缺少上下文的措辞。
- 选型文档记录稳定决策，不记录路径别名、目录名等纯实现细节，除非实现本身就是选型结论。
- `docs/project-plan.md` 只能维护任务，不写“产出某文件”。
- 已明确决定“不引入”的项目同样视为完成，必须更新任务清单。
- README 描述模板能力和使用方式，不把技术选型过程描述为模板目标。

## 24. CR 与修改范围

- CR 只检查用户指定文件或当前暂存范围。
- 其他页面尚未处理、其他层尚未开始，不得作为当前文件问题。
- 每个问题必须说明具体位置、触发条件、实际影响和建议方向。
- 不得只输出模糊标题而隐藏问题内容。
- 用户已明确接受的预期行为不得重复报告为问题。
- 修复只处理用户选择的问题；不得借机改动其他文件。
- 如果没有问题，明确说明没有发现问题，不制造低价值建议。

## 25. 验证与格式化

- 未明确要求时，不启动开发服务器，不运行测试，不操作外部服务。
- 可以按修改范围执行 TypeScript、ESLint、Stylelint 和 Prettier Check。
- 未明确要求时不得执行全项目自动格式化。
- 使用 `rg` 搜索文件和文本，不优先使用 `grep`、`find`。
- 验证失败时先说明失败属于代码问题、环境问题还是已有问题，不擅自扩大修复范围。

## 26. Git

- 未明确要求时，不 Stage、不 Commit、不 Push。
- Commit 使用 Conventional Commits：`feat:`、`fix:`、`refactor:`、`docs:`、`chore:`。
- 一个完整能力和其必要使用层迁移通常放在同一个 Commit。
- 只有能够独立理解、独立验证、独立回退的功能才拆成多个 Commit。
- 用户要求多个 Commit 时按功能边界拆分，不机械地一个文件一个 Commit。
- Commit 前只 Stage 当前 Commit 对应文件，禁止混入无关修改。
- 分支名使用 `aaa-bbb-ccc`，不带 `codex` 前缀，不包含 `/`。
- GitHub 操作使用 `gh`，不使用 Python 调用 GitHub。
- 不主动重新登录 GitHub。
- 不在仓库写入 Token、密码、OTP、密钥或个人环境配置。

## 27. 完成前自检

完成业务开发或重构前必须逐项确认：

- 是否正确识别了服务层、数据层、行为层、视图层。
- 是否存在视图层直接调用 Service、Request 或 Fetch。
- 是否存在数据层处理新增、修改、删除等行为。
- 是否存在行为 Hook 同时承担多个动作。
- 是否存在 Service 引入 React、Ant Design 或页面逻辑。
- 是否存在页面间导入私有 Model、Hook、组件。
- 是否存在可用 Ant Design 组件却使用原生节点。
- 是否存在 `style` 或 `styles` Prop。
- 是否存在不必要的 Less、未按根类嵌套的 CSS Module、硬编码视觉值、`.ant-*` 覆盖或 `!important`。
- 是否使用了正确的 Ant Design Token 或项目变量。
- 是否存在嵌套三目、无意义包装函数或无意义类型。
- Imports、空行、声明顺序、Props 顺序是否符合本文。
- Store Interface、初始值、Return 字段顺序是否一致。
- Loading 是否位于 Data 之前，行为 Hook 是否只返回必要内容。
- 所有文案是否进入当前模块 Locale，双语 Key 是否一致。
- 路由跳转、Token、Storage、Format 是否使用统一公共能力。
- 是否只修改了当前任务范围。
- 是否没有擅自 Stage、Commit、Push、启动服务或运行测试。

## 6. 数据层规范

页面目录使用大驼峰命名，页面入口固定为 `index.tsx`。Imports 固定分为三组：
