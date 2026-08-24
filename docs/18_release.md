# 版本发布规范

## 目标

统一版本号、Git Tag、发布门禁和发布说明，确保版本可识别、变更可追溯、升级影响可判断。

## 版本号

版本号遵循 [Semantic Versioning 2.0.0](https://semver.org/)：

| 变更影响                     | 命令           | 示例              |
| ---------------------------- | -------------- | ----------------- |
| 存在不兼容改动               | `ut run major` | `1.4.0` → `2.0.0` |
| 新增向后兼容的功能           | `ut run minor` | `1.4.0` → `1.5.0` |
| 只有向后兼容的修复或文档调整 | `ut run patch` | `1.4.0` → `1.4.1` |

多个改动一起发布时，按其中影响最大的改动选择命令。版本升级命令会自动修改 `package.json` 并创建 `chore: release <版本号>` 提交，不需要手工计算版本号、编辑文件或提交版本变更。

预发布版本只使用 `-rc.N`。在版本命令后追加 `--rc` 即可生成或递增 RC：

```bash
ut run minor --rc
```

版本会按 `1.5.0-rc.1` → `1.5.0-rc.2` 演进。版本位在创建 `rc.1` 时已经确定；当前版本已经是 RC 后，三个版本命令不再重新计算版本位：追加 `--rc` 会递增当前 RC，不带 `--rc` 会将当前 RC 转为稳定版本。

尚未正式发布时可以使用 `0.0.0` 作为占位版本；占位版本不能创建发布 Tag。

## 发布命令

发布操作固定使用三个命令：

```bash
ut run patch
ut run tag
ut run release
```

三个命令分别负责：

| 命令                      | 作用                                        |
| ------------------------- | ------------------------------------------- |
| `major`、`minor`、`patch` | 自动升级对应版本位并创建本地版本提交        |
| `ut run tag [--<前缀>]`   | 完整检查、创建 Annotated Tag 并推送到远端   |
| `ut run release`          | 构建静态资源包和包含资源的 Nginx 镜像交付物 |

`ut run tag` 默认生成 `v1.4.0`。需要生成 `weilai-1.4.0` 时执行：

```bash
ut run tag --weilai
```

自定义前缀只影响本次 Tag 和交付产物名称，不会修改 `package.json` 或其他配置文件。同一版本允许使用不同前缀分别发布到多个环境。

## 命令保护

- 版本命令要求工作区干净，更新 `package.json` 后只提交该版本文件；不限制当前分支，也不推送分支提交。
- `tag` 针对当前 Commit 创建 Tag，不限制当前分支，也不要求当前分支与远端默认分支同步。
- `tag` 要求工作区干净，确保发布检查使用的内容与 Tag 指向的 Commit 一致。
- `tag` 自动执行格式、Lint、类型、单元测试、脚本测试、E2E 和生产构建检查。
- `tag` 创建 Annotated Tag 并立即推送到 `origin`；网络中断后可以重新执行相同命令继续推送同一个 Tag。
- 新的 `tag` 流程开始时会清理上一次发布选择；只有目标 Tag 推送成功后才记录新选择，失败后 `release` 不会沿用旧 Tag。
- Tag 在推送前同时校验 Git Ref 和 Docker 镜像 Tag，避免已经推送的 Tag 无法生成交付镜像。
- `release` 要求当前工作区仍位于该 Tag 对应的 Commit，防止交付物与已推送 Tag 不一致。
- `release` 只执行一次 Docker 构建，并从生成的 Nginx 镜像导出静态资源，保证两种交付物内容一致。
- 发布镜像默认使用 `linux/amd64`，可以通过 `RELEASE_PLATFORM` 指定其他 Linux 平台；实际平台写入发布清单。
- 跨域部署通过执行 `release` 时的 `VITE_API_BASE_URL` 注入，同一配置同时作用于静态资源和 Nginx 镜像。
- `release` 只在本地生成部署交付物，不向某个固定的镜像仓库或部署平台上传内容。
- 已推送的版本 Tag 不得删除后重建或强制移动。

## 发布流程

以从 `1.1.0` 发布向后兼容的新功能版本 `1.2.0` 为例。

1. 从最新默认分支创建发布分支：

   ```bash
   git switch master
   git pull --ff-only
   git switch -c release-1-2-0
   ```

2. 自动升级版本并创建本地版本提交：

   ```bash
   ut run minor
   ```

3. 推送发布分支并创建 PR，在 Changelog 中记录用户可见变更和迁移说明。
4. 版本 PR 合入且默认分支 CI 通过后，同步默认分支：

   ```bash
   git switch master
   git pull --ff-only
   ```

5. 自动检查、创建并推送 Tag，然后准备部署交付物：

   ```bash
   ut run tag
   ut run release
   ```

需要同时为默认环境和 `weilai` 环境准备交付物时，依次执行：

```bash
ut run tag
ut run release
ut run tag --weilai
ut run release
```

## 发布说明

每次发布都应提供面向使用者的发布说明，至少包含：

- 版本号和发布日期。
- 本次版本的变更摘要。
- 用户可感知的新增能力和重要修复。
- 配置、依赖或使用方式变化（如有）。
- 破坏性变更及迁移方式（如有）。
- 已知限制（如有）。

PR 中的 Changelog 是版本说明的原始输入。发布说明必须与目标版本、Tag 和 Commit SHA 一致。

## 发布产物

`ut run release` 在 `artifacts/<Tag>/` 中生成：

| 文件 | 用途 |
| --- | --- |
| `<项目名>-<Tag>-static.tar.gz` | 可解压到现有 Nginx、对象存储或静态托管平台的 `dist` 静态资源 |
| `<项目名>-<Tag>-nginx-image.tar` | 已包含静态资源和生产 Nginx 配置的镜像归档，可使用 `docker load --input <文件>` 导入 |
| `manifest.json` | 记录版本号、Tag、Commit SHA、镜像名称、目标平台、构建时 API 地址和产物文件名 |
| `SHA256SUMS` | 校验静态资源包、镜像归档和发布清单是否完整 |

交付目录以完整 Tag 隔离，因此 `v1.4.0` 与 `weilai-1.4.0` 可以同时保留。产物只负责准备部署输入，是否上传到对象存储、镜像仓库或具体服务器由使用该模板的项目决定。

首次发布前需要安装 Playwright Chromium，并确保 Tar、Docker CLI、Docker Buildx 和 Docker daemon 可用：

```bash
ut execute playwright install --with-deps chromium
docker info
docker buildx version
tar --version
```

任何发布产物必须满足：

- 标明对应版本、Git Tag 和 Commit SHA。
- 稳定版本与预发布版本能够明确区分。
- 已发布的版本产物不得被同名覆盖。
- 保留历史版本或等效回滚依据。
- 回滚不依赖移动或重建已有版本 Tag。

Tag 推送后发现问题时不得移动原 Tag。完成修复后重新执行对应版本命令，生成新的 PATCH、MINOR、MAJOR 或 RC 版本。

## 验收标准

- 版本号能够表达升级影响。
- 版本号由命令自动更新，无需手工编辑。
- 版本命令自动创建只包含版本文件的本地提交。
- `package.json`、Git Tag 和发布说明使用同一个版本。
- 发布 Tag 准确指向执行 `tag` 命令时的当前 Commit。
- Tag 创建前已经自动通过完整项目检查。
- Tag 由 `tag` 命令自动推送，无需再手工执行 `git push origin <Tag>`。
- `release` 同时生成静态资源包、Nginx 镜像归档、发布清单和 SHA-256 校验文件。
- 用户可见变更能够从发布说明追溯到 PR 和 Commit。
- 已推送的版本 Tag 不被覆盖。

## 参考

- [Semantic Versioning 2.0.0](https://semver.org/)
