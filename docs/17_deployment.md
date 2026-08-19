# 生产环境接入与部署

## API 地址

本地开发需要覆盖默认地址时，复制环境变量示例：

```bash
cp .env.example .env.local
```

生产构建应通过 CI/CD 环境变量或 `.env.production` 注入配置，不依赖开发者本机的 `.env.local`。

`VITE_API_BASE_URL` 支持三种形式：

| 配置                      | 请求结果                          | 适用场景                   |
| ------------------------- | --------------------------------- | -------------------------- |
| 留空                      | `/api/...`                        | 本地 Mock 或前后端同域部署 |
| `https://api.example.com` | `https://api.example.com/api/...` | 前后端跨域部署             |
| `/backend`                | `/backend/api/...`                | 由网关使用路径前缀转发     |

Service 传给 Request 的接口地址统一以 `/` 开头。

配置只在构建时注入浏览器代码，不得在 `VITE_` 环境变量中保存密钥、Token 或其他服务端秘密。使用独立后端地址时，后端需要允许前端站点的 Origin，并允许 `Authorization` 和 `Content-Type` 请求头。

本地 Mock 必须使用空的 `VITE_API_BASE_URL`，然后执行：

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

## 构建

```bash
ut install
VITE_API_BASE_URL=https://api.example.com ut run build
ut run preview
```

同域部署时省略 `VITE_API_BASE_URL`。该配置在构建时写入前端产物，修改后必须重新构建。构建产物位于 `dist`。部署平台需要满足：

- 所有非静态资源路由回退到 `index.html`，保证前端路由刷新可用。
- 同域部署时将 `/api` 转发到真实后端。
- 使用 HTTPS，并避免缓存 `index.html` 的旧版本。

Nginx 的核心规则示例：

```nginx
location / {
  try_files $uri $uri/ /index.html;
}

location /api/ {
  proxy_pass http://backend-service;
}
```

## 发布前验证

```bash
ut run format:check
ut run lint
ut run typecheck
ut run test:coverage
ut run test:e2e
ut run build
```

首次接入真实后端后，还需要人工验证登录、退出、权限拦截、用户管理、角色管理和个人中心流程。
