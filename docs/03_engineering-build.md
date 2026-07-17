# 工程构建选型

## 构建工具对比

候选范围限定为 Webpack、Vite、Rspack 和 `@utoo/pack`，均可直接承担浏览器端 React 应用的开发与生产构建。

### Webpack 5

维护主体：无单一公司，由 Webpack 团队和社区治理。

市场采用：约 3,910 万次/周。

维护情况：持续维护，已经规划 Webpack 6；主要依靠志愿者，没有全职工程团队。

优点：Loader、Plugin、Module Federation 和历史工程生态最完整；配置能力强，长期兼容性好。

局限：React、TypeScript、HTML、样式和开发服务器需要自行组合；配置量和维护成本最高。

### Vite 8

维护主体：Vite Team 独立治理；Cloudflare 聘用部分核心成员并提供资金支持。

市场采用：约 1.17 亿次/周。

维护情况：活跃维护；Vite 8 已使用 Rolldown 统一开发与生产构建。

优点：采用规模最大；开发体验、插件生态和文档成熟；提供 JavaScript API、Plugin API 和面向框架的 Environment API。

局限：React Compiler 需要额外接入；Environment API 仍处于 RC 阶段；深度使用 Vite API 后会形成 Vite 生态绑定。

### Rspack 2

维护主体：字节跳动。

市场采用：约 714 万次/周。

维护情况：活跃维护；2026 年发布 2.0，采用规模持续增长。

优点：Rust 实现，增量构建快；兼容 Webpack 的配置、Loader 和多数 Plugin；API 层级适合被框架封装。

局限：延续 Webpack 的配置模型，仍需自行组合 React、HTML 和开发服务约定；维护力量集中在字节跳动团队。

### `@utoo/pack`

维护主体：蚂蚁集团。

市场采用：约 10.5 万次/周。

维护情况：1.x 活跃开发，稳定版本持续发布。

优点：基于 Turbopack 和 Rust；提供 CLI 与 JavaScript API；内置 HMR、持久化缓存、React Compiler、HTML、样式和开发代理；与 Utoo 工具链一致。

局限：采用规模和第三方生态最小；Webpack 仅部分兼容；部分高级能力仍在完善，文档可能落后于实现。

## 结论

选择 Vite 最新稳定版本，当前主版本为 Vite 8。

选择依据：

- Vite 的采用规模、插件生态、文档和问题解决路径最完整，长期维护风险相对较低。
- Vite 8 使用 Rolldown 统一开发与生产构建，减少两套构建核心之间的行为差异。
- Vite 同时提供 CLI、JavaScript API 和 Plugin API，既能直接构建应用，也能由模板封装统一入口。
- Vite 官方 React 插件提供 React Fast Refresh，并支持接入 React Compiler。

Vite 8 满足已经确定的 Node.js 24、React 19、TypeScript 7 和 React Compiler 方案。依赖使用稳定版本和 `^` 版本范围，具体安装版本以 `package.json` 为准，不使用 Alpha、Beta、RC 或 Nightly。

## 参考

- [Webpack](https://webpack.js.org/concepts/)
- [Webpack 2026 Roadmap](https://webpack.js.org/blog/2026-02-04-roadmap-2026/)
- [Webpack npm 下载量](https://api.npmjs.org/downloads/point/2026-07-09:2026-07-15/webpack)
- [Vite 8](https://vite.dev/blog/announcing-vite8)
- [Vite Team](https://vite.dev/team)
- [Cloudflare 支持 Vite](https://vite.dev/blog/cloudflare-supports-vite)
- [Vite Environment API for Frameworks](https://vite.dev/guide/api-environment-frameworks)
- [Vite React Plugin](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-react)
- [Vite npm 下载量](https://api.npmjs.org/downloads/point/2026-07-09:2026-07-15/vite)
- [Rspack](https://www.rspack.dev/)
- [Rspack 2](https://www.rspack.dev/blog/announcing-2-0)
- [Rspack npm 下载量](https://api.npmjs.org/downloads/point/2026-07-09:2026-07-15/%40rspack%2Fcore)
- [Utoo](https://utoo.land/en/docs)
- [Utoopack](https://github.com/utooland/utoo/tree/next/packages/pack)
- [Utoopack Feature List](https://github.com/utooland/utoo/blob/next/packages/pack/docs/features-list.md)
- [Utoopack Releases](https://github.com/utooland/utoo/releases)
- [Utoopack npm 下载量](https://api.npmjs.org/downloads/point/2026-07-09:2026-07-15/%40utoo%2Fpack)
