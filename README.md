# React Project Template

一个用于快速创建 React 应用的工程模板，提供统一的开发环境、工程配置、项目结构和常用基础能力。

## 基础环境

- Node.js 版本不低于 24，Volta 固定使用 `24.18.0`。
- 默认使用 Utoo（`ut`）管理依赖，pnpm 作为回退方案。
- 依赖优先使用最新稳定版本，版本范围默认使用 `^`；存在明确兼容风险时再使用 `~` 或精确版本。安装时解析范围内的最新版本，不提交锁文件。
- 使用 Vite 8 构建 React 19 应用，并启用 React Compiler。
- 使用 TypeScript 7，并启用严格类型检查。

## 开发命令

```bash
ut install
ut run dev
ut run typecheck
ut run build
ut run preview
```

## 文档

- [项目任务清单](docs/project-plan.md)
- [基础环境选型](docs/01_basic-environment.md)
- [React 基础方案选型](docs/02_react-base.md)
- [工程构建选型](docs/03_engineering-build.md)
- [路由选型](docs/04_routing.md)
- [UI 组件库选型](docs/05_ui-library.md)
- [样式方案选型](docs/06_styling.md)
- [状态管理选型](docs/07_state-management.md)
- [请求方案选型](docs/08_request.md)

## License

[MIT](LICENSE)
