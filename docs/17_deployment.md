# 生产部署选型与接入

## 目标与边界

本项目是由 Vite 构建的浏览器端单页应用。生产部署只需要提供静态资源托管、前端路由回退和 API 转发，不需要常驻 Node.js 应用服务。

部署方案需要满足：

- 构建和运行环境隔离，生产镜像不包含源码、开发依赖和 Node.js 运行时。
- 直接访问或刷新任意前端路由时能够返回 `index.html`。
- 对带内容 Hash 的静态资源使用长期缓存，对 `index.html` 禁止强缓存。
- 支持将 `/api` 转发到真实后端，默认采用前后端同域部署。
- 产物能够部署到普通服务器、容器平台或静态托管平台，不绑定具体云厂商。
- 环境配置只包含可以公开给浏览器的值，不在前端产物中保存任何秘密。

本次不引入 SSR、Node.js 生产服务、运行时环境变量注入平台或云厂商专用部署能力。

## 方案对比

| 方案 | 优点 | 局限 | 结论 |
| --- | --- | --- | --- |
| 直接发布 `dist` 到静态托管平台 | 配置最少，通常自带 CDN 和 HTTPS | 路由回退、API 代理和缓存能力受平台限制，配置格式不统一 | 保留为可选部署方式 |
| 服务器直接安装 Nginx 并发布 `dist` | 性能稳定，路由、缓存和代理规则完整 | 服务器环境和配置需要单独维护，交付结果不够一致 | 可用于已有服务器环境 |
| Docker 多阶段构建 + Nginx | 构建和运行环境清晰，镜像可复用，部署和回滚一致 | 需要容器运行环境，镜像构建比直接上传文件多一步 | 选为默认生产交付方式 |
| 使用 Node.js 托管静态文件 | 可以复用 JavaScript 工具链 | 仅托管静态文件仍需常驻 Node.js，增加运行时和维护成本 | 不选择 |

## 选型结论

默认采用 **Docker 多阶段构建 + Nginx 静态托管**：

1. 构建阶段使用项目约定的 Node.js 24 和 Utoo 安装依赖并执行 `ut run build`。
2. 运行阶段只保留 Nginx、`dist` 产物和 Nginx 配置。
3. Nginx 提供静态资源、SPA 路由回退和同域 API 反向代理。
4. 镜像使用不可变版本号或提交 SHA 标记，部署失败时直接回滚到上一镜像。

`dist` 仍然是标准静态产物。没有 Docker 环境时，可以将同一产物发布到现有 Nginx、对象存储或静态托管平台，不要求业务项目只能使用容器部署。

## 部署结构

```text
浏览器
  │
  ▼
Nginx
  ├── /assets/*  ──> Vite 静态资源
  ├── /api/*     ──> 后端服务
  └── 其他路径   ──> index.html ──> TanStack Router
```

默认优先使用同域 `/api`。这样浏览器不需要额外的跨域配置，前端产物也不需要知道后端服务在容器网络或集群中的实际地址。

## API 地址

本地开发需要覆盖默认地址时，复制环境变量示例：

```bash
cp .env.example .env.local
```

`VITE_API_BASE_URL` 支持三种形式：

| 配置 | 请求结果 | 适用场景 |
| --- | --- | --- |
| 留空 | `/api/...` | 本地 Mock 或由 Nginx、网关代理的同域部署 |
| `https://api.example.com` | `https://api.example.com/api/...` | 前后端跨域部署 |
| `/backend` | `/backend/api/...` | 由网关使用路径前缀转发 |

Service 传给 Request 的接口地址统一以 `/` 开头。

`VITE_` 环境变量会在构建时写入浏览器代码，不能保存密钥、Token 或其他服务端秘密。修改构建时变量后必须重新构建产物或镜像，不提供在容器启动时替换前端配置的额外机制。

同域部署应保持 `VITE_API_BASE_URL` 为空。只有明确需要前后端跨域时才配置完整后端地址，并由后端允许前端站点的 Origin、HTTP 方法以及 `Authorization`、`Content-Type` 请求头。

本地 Mock 同样保持 `VITE_API_BASE_URL` 为空，然后执行：

```bash
ut run dev:mock
```

## 接口响应约定

成功响应：

```json
{
  "success": true,
  "data": {}
}
```

失败响应：

```json
{
  "success": false,
  "errorCode": "400",
  "errorType": "WARNING",
  "errorMessage": "请求未完成"
}
```

HTTP 401 可以在 `data` 中返回登录地址。请求层会清理本地登录状态，并跳转到该地址；未返回地址时使用项目默认登录页。

## 构建产物

默认镜像可以直接构建：

```bash
docker build --tag react-project-template:local .
```

同域部署不需要传入前端 API 地址。运行时通过 `API_UPSTREAM` 指向后端服务，值必须是包含协议和端口、末尾不带 `/` 的服务 Origin，不追加 `/api` 路径。

使用容器名称访问后端时，前后端必须加入同一个用户自定义网络。下面假设后端已经以 `backend-service` 名称接入 `application-network`：

```bash
docker run --rm \
  --network application-network \
  --publish 8080:80 \
  --env API_UPSTREAM=http://backend-service:8080 \
  react-project-template:local
```

Nginx 会保留浏览器请求中的 `/api/...` 路径并转发到该服务，并通过容器的本地 DNS 重新解析服务名；后端容器以相同服务名重建后不需要同步重启前端容器。容器没有显式配置 `API_UPSTREAM` 时默认指向 `http://127.0.0.1:3000`，容器可以独立启动，但 API 请求会在没有同容器后端时返回 502；实际部署应显式设置真实地址。

前后端必须跨域部署时，在构建阶段写入公开的后端地址：

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.example.com \
  --tag react-project-template:local .
```

这时浏览器会直接请求配置的后端地址，不经过镜像内的 `/api` 代理。

需要直接发布静态文件时，仍然使用：

```bash
ut install
VITE_API_BASE_URL= ut run build
```

构建产物位于 `dist`。`ut run preview` 只用于本地检查生产构建结果，不能作为生产服务器。

容器构建需要采用多阶段结构：

- Builder 阶段安装依赖并生成 `dist`。
- Runtime 阶段从 Builder 复制 `dist` 到 Nginx 静态目录。
- Runtime 阶段不复制 `node_modules`、源码、测试文件和开发配置。
- `.dockerignore` 排除 `node_modules`、`dist`、测试报告、本地环境变量和 Git 元数据。

## Nginx 规则

镜像使用官方 Nginx 镜像的配置模板能力，在容器启动时注入 `API_UPSTREAM`，并从容器的 `/etc/resolv.conf` 读取本地 DNS。模板替换只处理 `API_UPSTREAM` 和镜像生成的 `NGINX_LOCAL_RESOLVERS`，不会误改其他 Nginx 变量，也不会修改浏览器端环境变量。实际配置位于 `config/nginx.conf.template`，核心规则如下：

```nginx
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;
  index index.html;

  resolver ${NGINX_LOCAL_RESOLVERS} valid=10s;
  set $api_upstream "${API_UPSTREAM}";

  location = /index.html {
    add_header Cache-Control "no-cache";
  }

  location /assets/ {
    try_files $uri =404;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location /api/ {
    proxy_pass $api_upstream$request_uri;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

规则边界：

- `index.html` 每次重新验证，避免新版本发布后继续引用已删除的旧资源。
- `/assets` 文件名包含内容 Hash，可以长期缓存并标记为 `immutable`。
- 只有不存在的前端页面路径回退到 `index.html`；不存在的 `/assets` 直接返回 404。
- `/api` 必须使用独立的 `location` 代理，不能落入 SPA 回退规则，后端错误也不能被转换成前端页面。
- `API_UPSTREAM` 使用服务名时通过容器本地 DNS 动态解析，后端容器重建并更换 IP 后能够自动恢复代理。
- HTTPS、证书、HSTS 和公网入口限流由外层网关或部署环境负责，不在前端镜像中绑定实现。

## 发布流程

版本号、Tag 和发布前置条件见[版本发布规范](18_release.md)。

标准发布流程：

1. 执行格式、Lint、类型、单元测试、E2E 和构建检查。
2. 使用目标环境的公开配置构建镜像。
3. 使用版本号或提交 SHA 标记并推送镜像。
4. 部署镜像并检查静态页面、前端路由和 API 健康状态。
5. 对登录、退出、权限拦截、用户管理、角色管理和个人中心执行冒烟验证。
6. 验证失败时回滚到上一不可变镜像，不覆盖旧镜像标签。

发布前检查命令：

```bash
ut run format:check
ut run lint
ut run typecheck
ut run test:coverage
ut run test:e2e
ut run build
```

## 验收标准

- 直接打开和刷新登录页、角色页、用户页及个人中心不会返回 Nginx 404。
- `/assets` 返回长期缓存响应头，`index.html` 不使用长期强缓存。
- 同域 `/api` 能够访问真实后端，后端 401、403、404 和 500 不会回退到 `index.html`。
- 生产镜像内不包含 Node.js、源码、`node_modules`、本地环境变量和测试报告。
- 镜像能够使用明确版本回滚，不依赖重新构建旧提交。
- 未配置跨域 API 地址时，前端产物能够在不同的同域代理环境中复用。

## 参考

- [Vite：Building for Production](https://vite.dev/guide/build)
- [Vite：Deploying a Static Site](https://vite.dev/guide/static-deploy.html)
- [Docker：Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Nginx：Serving Static Content](https://docs.nginx.com/nginx/admin-guide/web-server/serving-static-content/)
- [Nginx：HTTP Proxy](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
