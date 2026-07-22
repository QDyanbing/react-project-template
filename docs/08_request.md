# 请求方案选型

## 原生 Fetch

维护主体：WHATWG 负责维护 Fetch 标准，浏览器和 JavaScript 运行时负责实现。

定位：Web 平台原生网络请求 API，也是 Ky、ofetch 等请求库的底层基础。

市场采用：浏览器和 Node.js 已原生提供，不需要作为项目依赖安装。

维护情况：Web 标准持续演进，各主流浏览器和 Node.js 均在维护对应实现。

优点：

- 无需安装依赖，可以直接使用 `Request`、`Response`、`Headers` 和 `AbortSignal` 等标准对象。
- 浏览器、Node.js 和其他现代 JavaScript 运行时均提供原生实现。
- API 不受第三方请求库约束，长期兼容性由 Web 标准保证。

局限：

- 收到 4xx 或 5xx 响应时 Promise 仍会正常兑现，需要显式判断 `response.ok`。
- JSON 请求、查询参数和错误响应解析需要由调用方处理。
- 不提供请求实例、拦截器和自动重试等上层能力。

## Axios 1

维护主体：Axios 开源团队和社区。

定位：基于 Promise 的独立 HTTP 客户端，通过适配器支持浏览器和 Node.js。

市场采用：约 1.13 亿次/周，是本次候选中采用规模最大的第三方请求库。

维护情况：1.x 持续维护，稳定版本和安全修复保持更新。

优点：

- 使用范围广，文档、社区经验和第三方集成成熟。
- 内置请求实例、请求与响应拦截器、超时、请求取消和上传下载进度。
- 自动处理 JSON 请求和响应，并将非成功状态码转换为统一的 `AxiosError`。
- API 稳定，适合需要兼容不同运行环境和既有 Axios 代码的项目。

局限：

- 使用自有的配置、响应和错误对象，与原生 Fetch API 存在差异。
- 同时维护 XHR、Fetch 和 Node.js 等适配器，能力范围和内部实现相对复杂。
- 对只面向现代浏览器的项目，包含一部分当前并不需要的兼容能力。

## Ky 2

维护主体：Sindre Sorhus、核心维护者和开源社区。

定位：面向现代浏览器和 JavaScript 运行时的轻量 Fetch 客户端。

市场采用：约 663 万次/周。

维护情况：2.x 活跃维护，稳定版本持续发布。

优点：

- 基于 Fetch 标准，保留原生的请求、响应、Headers 和 AbortSignal 语义。
- 提供请求实例、默认配置、生命周期 Hooks、查询参数和 JSON 快捷方法。
- 默认将非成功状态码转换为 `HTTPError`，并内置超时和可配置重试。
- 无运行时依赖，TypeScript 类型以现代 Fetch API 为基础。

局限：

- 只支持最新的 Chrome、Firefox 和 Safari，不承担旧浏览器兼容。
- 社区规模和既有项目覆盖范围小于 Axios。
- 默认重试等行为需要明确理解，避免请求行为超出调用方预期。

## ofetch 1

维护主体：UnJS 团队和开源社区。

定位：同时面向浏览器、Node.js 和 Worker 环境的跨运行时 Fetch 客户端。

市场采用：约 2,543 万次/周，在 Nuxt 和 UnJS 生态中应用广泛。

维护情况：1.x 为当前稳定版本，2.x 正在开发。

优点：

- 基于 Fetch 标准，支持自动解析响应、JSON 请求体、查询参数和基础地址。
- 提供请求与响应拦截器、统一错误、超时和自动重试。
- API 简洁，TypeScript 支持完整，并能直接访问原始 Response。
- 与 Nuxt 和 UnJS 生态结合紧密。

局限：

- 在独立 React 应用中的采用范围和社区资料少于 Axios。
- 部分跨运行时能力主要服务于 Node.js、Nuxt 和服务端场景，当前浏览器模板不会使用。
- 2.x 尚未进入稳定版本，当前只能选择 1.x 稳定版本。

## 选型结论

选择原生 Fetch 作为默认请求方案。

当前模板面向现代浏览器，并使用 Node.js 24 作为开发环境，可以直接使用 `fetch`、`Request`、`Response`、`Headers` 和 `AbortSignal` 等标准能力，不需要额外引入请求客户端依赖。

业务接口统一由 Service 层定义。一个 Service 模块可以包含同一业务领域的多个接口，每个接口只声明请求地址、请求方法、入参和返回类型，不处理分页、筛选、错误提示等其他逻辑。

Fetch 由统一请求层封装，集中处理公共请求头、查询参数、JSON 请求与响应、身份凭证以及错误。登录 Token 由登录流程写入 `localStorage` 的 `token` 字段，请求层读取后通过 `Authorization: Bearer <token>` 携带；调用方显式传入 `Authorization` 时不覆盖。

接口响应使用统一的成功状态、错误码、错误类型、错误信息和业务数据结构。网络错误、HTTP 错误和普通业务错误由请求层统一处理：登录状态失效且接口返回登录地址时跳转到对应入口，没有返回登录地址时提示重新登录；权限不足、接口不存在和服务异常等错误保留当前页面并通过全局消息提示。页面级的 403、404 和 500 状态由权限与路由层处理，不与接口错误共用跳转逻辑。页面默认不重复捕获这些错误，只有需要处理表单字段等局部反馈的请求才关闭全局处理并自行捕获。

请求取消使用 `AbortSignal`。自动重试和刷新 Token 需要结合接口幂等性与认证协议确定，不作为默认行为。

## 参考

- [MDN Fetch API](https://developer.mozilla.org/docs/Web/API/Fetch_API)
- [MDN AbortSignal](https://developer.mozilla.org/docs/Web/API/AbortSignal)
- [Axios 文档](https://axios-http.com/docs/intro)
- [Axios GitHub](https://github.com/axios/axios)
- [Axios npm 下载量](https://api.npmjs.org/downloads/point/2026-07-13:2026-07-19/axios)
- [Ky GitHub](https://github.com/sindresorhus/ky)
- [Ky npm 下载量](https://api.npmjs.org/downloads/point/2026-07-13:2026-07-19/ky)
- [ofetch 文档](https://unjs.io/packages/ofetch/)
- [ofetch GitHub](https://github.com/unjs/ofetch)
- [ofetch npm 下载量](https://api.npmjs.org/downloads/point/2026-07-13:2026-07-19/ofetch)
