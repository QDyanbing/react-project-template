# React Project Template

面向中后台应用的 React 工程模板，内置登录认证、RBAC 权限、用户与角色管理、国际化、接口 Mock 和完整测试链路，可以直接作为新项目的工程基础。

## 内置能力

- React 19、TypeScript 6、Vite 8 和 React Compiler。
- Ant Design 6、Less、CSS Modules 和统一主题变量。
- TanStack Router 手动路由配置、懒加载、403、404 和 500 页面。
- Zustand 查询状态、ahooks 操作请求和原生 Fetch 请求封装。
- 登录、退出、登录失效处理和基于角色的菜单、路由、按钮权限。
- 用户管理、角色管理、个人中心、资料修改和密码修改。
- 中文、英文切换以及语言和侧边菜单状态持久化。
- Vite 服务端 Mock、Vitest 单元测试和 Playwright 浏览器功能测试。
- Prettier、ESLint、Stylelint、Git Hooks、Dependabot 和 GitHub Actions CI。

## 环境要求

- Node.js `>=24`，推荐使用 Volta 自动切换到 `24.18.0`。
- 默认包管理器为 Utoo `1.1.8`，命令行为 `ut`。
- 首次运行 E2E 或创建发布 Tag 前，需要执行 `ut execute playwright install --with-deps chromium` 安装浏览器及系统依赖。
- 生成发布产物需要系统提供 Tar、Docker CLI 和 Docker Buildx，并已启动 Docker daemon。

## 快速开始

```bash
git clone https://github.com/QDyanbing/react-project-template.git
cd react-project-template
ut install
cp .env.example .env.local
ut run dev:mock
```

访问 `http://localhost:8000`，使用本地 Mock 管理员账号登录：

```text
账号：admin
密码：123456
```

该账号和密码只存在于本地 Mock 数据中，不应复制到真实后端或生产环境。

## 开发命令

| 命令                     | 说明                           |
| ------------------------ | ------------------------------ |
| `ut run dev`             | 启动前端并连接配置的真实后端   |
| `ut run dev:mock`        | 启动前端和 Vite Mock 接口      |
| `ut run format`          | 格式化代码                     |
| `ut run format:check`    | 检查代码格式                   |
| `ut run lint`            | 执行 ESLint 和 Stylelint       |
| `ut run typecheck`       | 执行 TypeScript 类型检查       |
| `ut run test:unit`       | 执行 Vitest 单元测试           |
| `ut run test:coverage`   | 执行单元测试并检查覆盖率       |
| `ut run test:workflow`   | 执行 CI 工作流配置测试         |
| `ut run test:release`    | 执行版本发布脚本测试           |
| `ut run test:e2e`        | 执行 Playwright 浏览器功能测试 |
| `ut run test:e2e:headed` | 在可见浏览器中执行功能测试     |
| `ut run build`           | 类型检查并生成生产构建         |
| `ut run preview`         | 本地预览生产构建               |
| `ut run major [--rc]`    | 升级主版本号并创建版本提交     |
| `ut run minor [--rc]`    | 升级次版本号并创建版本提交     |
| `ut run patch [--rc]`    | 升级修订版本号并创建版本提交   |
| `ut run tag [--<前缀>]`  | 完整检查、创建并推送发布 Tag   |
| `ut run release`         | 构建静态资源和 Nginx 镜像产物  |

## 连接真实后端

通过 `VITE_API_BASE_URL` 配置后端地址：

```dotenv
# 前后端同域或由网关代理 /api 时留空
VITE_API_BASE_URL=

# 前后端独立部署
VITE_API_BASE_URL=https://api.example.com
```

Service 中继续使用 `/api/...` 地址，请求层会统一追加配置的 Base URL。后端响应需要遵守以下结构：

```ts
type Result<T> =
  | { success: true; data: T }
  | {
      success: false;
      errorCode?: string;
      errorType?: 'ERROR' | 'WARNING';
      errorMessage?: string;
      data?: unknown;
    };
```

完整部署选型和反向代理说明见[生产部署选型与接入](docs/17_deployment.md)。

默认生产镜像：

```bash
docker build --tag react-project-template:local .
docker run --rm --publish 8080:80 react-project-template:local
```

接入真实后端时，通过同一容器网络和 `API_UPSTREAM` 配置代理，具体命令见部署文档。

## 项目结构

```text
config/               路由等工程配置
docs/                 技术选型和使用文档
e2e/                  Playwright 浏览器功能测试
mock/                 Vite 服务端 Mock
plugins/              Vite 插件
src/
  components/         公共组件
  hooks/              公共 React Hook
  i18n/               国际化接入
  layouts/            公共布局
  models/             全局查询状态
  pages/              页面业务模块
  services/           接口服务与 API 类型
  theme/              主题 Token 和项目变量
  utils/              公共工具
```

新增业务模块时按以下顺序接入：

1. 在 `src/services` 定义接口和业务类型。
2. 在 `src/pages` 按数据层、行为层、视图层组织页面。
3. 在 `config/routes.ts` 配置路由及所需权限。
4. 在 `mock` 增加本地接口，并在 `e2e` 覆盖用户可观察流程。

详细代码分层和命名要求见 [AGENTS.md](AGENTS.md)。

## 权限模型

- 当前用户接口返回角色和权限对象。
- 路由通过 `permissions` 声明访问权限。
- 菜单和页面按钮复用相同权限编码。
- `*` 表示拥有当前和后续新增的全部权限。

新增权限时需要同步后端权限数据、路由配置、页面操作和对应功能测试。

## 测试与发布

单元测试负责公共工具和底层逻辑，覆盖率门禁为 80%；页面、Store、Hook、Service 和接口协同通过完整 Playwright 流程验证。推送到 `master` 或创建 Pull Request 时，GitHub Actions 会执行格式检查、Lint、类型检查、覆盖率、生产构建和浏览器功能测试。

根据变更影响执行一个版本升级命令。命令会更新 `package.json` 并自动创建版本提交：

```bash
ut run patch
```

版本提交通过 PR 合入后，在需要发布的 Commit 上依次执行：

```bash
ut run tag
ut run release
```

`tag` 会自动完成全部发布检查，创建 Annotated Tag 并推送到 `origin`。`release` 只在 Docker 中构建一次前端，从同一个 Nginx 镜像导出静态资源并生成镜像归档，最终在 `artifacts/<Tag>/` 输出发布清单和 SHA-256 校验文件。镜像平台默认是 `linux/amd64`，可以通过 `RELEASE_PLATFORM=linux/arm64` 等环境变量覆盖。

需要生成 `weilai-1.4.0` 格式的 Tag 时，将 Tag 命令改为 `ut run tag --weilai`。同一版本可以使用不同前缀分别生成多套环境交付产物。完整规则见[版本发布规范](docs/18_release.md)。

## 自定义模板

- 页面标题：`index.html`
- 登录页品牌文案：`src/pages/Login/locale`
- 顶部品牌文案：`src/layouts/locale`
- 登录页插图：`src/assets`
- Mock 用户、角色和权限：`mock/database.ts`
- 主题 Token：`src/theme`

## 文档

- [基础环境选型](docs/01_basic-environment.md)
- [React 基础方案选型](docs/02_react-base.md)
- [工程构建选型](docs/03_engineering-build.md)
- [路由选型](docs/04_routing.md)
- [UI 组件库选型](docs/05_ui-library.md)
- [样式方案选型](docs/06_styling.md)
- [状态管理选型](docs/07_state-management.md)
- [请求方案选型](docs/08_request.md)
- [接口 Mock 方案选型](docs/09_api-mock.md)
- [代码格式化选型](docs/10_formatter.md)
- [JavaScript 与 TypeScript 代码检查选型](docs/11_eslint.md)
- [样式检查选型](docs/12_stylelint.md)
- [Git Hooks 管理选型](docs/13_git-hooks.md)
- [日期时间方案选型](docs/14_date-time.md)
- [国际化方案选型](docs/15_internationalization.md)
- [测试方案选型](docs/16_testing.md)
- [生产部署选型与接入](docs/17_deployment.md)
- [版本发布规范](docs/18_release.md)
- [历史项目任务清单](docs/project-plan.md)

## License

[MIT](LICENSE)
