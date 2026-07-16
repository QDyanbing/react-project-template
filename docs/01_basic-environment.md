# 基础环境选型

## Node.js 版本对比

| 方案 | 优点 | 问题 |
| --- | --- | --- |
| Node 22 LTS | 生态稳定，兼容范围广 | 支持周期短于 Node 24，不作为新项目首选 |
| Node 24 LTS | 当前 LTS，生命周期和现代工具兼容性合适 | 部分旧工具可能需要升级 |
| Node 26 Current | 新特性最多 | 尚未进入 LTS，不适合作为生产模板默认基线 |

我选择 Node 24 LTS。Volta 固定经过验证的精确补丁版本，`engines` 只声明最低版本为 Node 24，不限制更高版本。`engines` 用于声明兼容下限，开发和 CI 环境以 Volta 固定的版本为准。

## 包管理器对比

| 方案 | 优点 | 问题 | 结论 |
| --- | --- | --- | --- |
| Utoo（`ut`） | 安装快；兼容 npm 命令和 `package-lock.json` v3；可以直接联系作者反馈问题 | 工具较新；生态、CI 案例和项目级版本锁定能力不如 pnpm 成熟 | 首选 |
| pnpm | 安装快；磁盘复用好；依赖边界严格；生态和 CI 支持成熟 | Volta 对 pnpm 的支持仍是实验性，通常需要使用 Corepack 管理版本 | 稳定回退方案 |
| npm | Node 自带；兼容范围最广；Volta 支持完整 | 安装性能和磁盘复用一般，相比 Utoo 和 pnpm 缺少明显收益 | 不选 |
| Yarn | Workspace 和约束能力完整 | 单应用模板收益有限，额外配置较多 | 不选 |
| Bun | 安装快，并提供运行时和测试工具 | 与 Node + Volta 路线重叠，增加运行环境差异 | 不选 |

我选择 Utoo（`ut`）作为默认包管理器。它的安装性能和 npm 兼容性符合模板需求；同时，我可以直接联系作者反馈问题，有助于控制新工具的采用风险。

稳定性风险通过保留 pnpm 回退路径处理。项目不使用只有 Utoo 才支持的依赖声明和脚本写法，确保必要时可以迁移到 pnpm。

## Utoo 到 pnpm 的回退策略

- 日常开发和 CI 统一使用 `ut`，仓库不提交锁文件。
- 项目 scripts 保持标准 `package.json` 写法，不在脚本中依赖 `ut` 专属行为。
- 为保持 pnpm 回退能力，不使用 `.utoo.toml`、Utoo Catalog 等专属配置。
- 需要回退时，删除本地 `node_modules` 和 `package-lock.json`，再使用 pnpm 根据 `package.json` 安装依赖。
- pnpm 生成的 `pnpm-lock.yaml` 同样不提交，由 `.gitignore` 统一忽略。
- 同步将本地安装、CI 和文档命令切换为 `pnpm`，并重新执行完整验证。

## 依赖版本策略

工具链和项目依赖分开处理：

| 对象 | 策略 |
| --- | --- |
| Node.js | Volta 固定精确补丁版本；`engines` 只声明最低版本为 Node 24 |
| Utoo | CI 显式安装经过验证的精确版本；本地开发版本以 CI 基线为准 |
| 直接依赖 | 根据兼容风险使用 `^` 或 `~` |
| 完整依赖树 | 不锁定；干净环境安装时重新解析最新兼容版本 |
| CI 安装 | 使用 `ut install`；CI 环境会关闭 Utoo 自动更新 |

仓库不提交 `package-lock.json` 或其他包管理器锁文件。包管理器在本地生成的锁文件由 `.gitignore` 忽略；干净环境根据 `package.json` 重新解析依赖，因此同一提交在不同时间可能得到不同的完整依赖树。该策略以自动获得范围内的最新兼容版本为优先，不保证依赖安装结果完全可复现。

## 依赖升级策略

- 使用 `^` 的依赖允许兼容的 Minor 和 Patch 更新，使用 `~` 的依赖只允许 Patch 更新。
- 版本范围内的更新在重新解析依赖时自动获取，不单独维护升级任务。
- Major 更新需要显式修改依赖范围，并根据迁移文档完成验证。
- 超出当前版本范围的安全修复需要显式升级依赖。
- Node.js 只跟随 LTS，不跟随 Current。
- Utoo 升级后验证依赖安装结果；出现阻断问题时先恢复到上一个已验证版本，再决定修复或回退 pnpm。

## Node.js 版本管理方式

我使用 Volta 管理 Node.js，不额外增加 `.nvmrc` 或 `.node-version`。

选择依据：

- Volta 会把 Node.js 版本直接写入 `package.json`。
- `engines` 可以向未使用 Volta 的开发者声明兼容范围。
- 同时维护 Volta、`.nvmrc` 和 `.node-version` 会产生多个版本来源。
- 仅在明确需要兼容 nvm、fnm 或其他工具时补充对应文件。

## 选型结论

| 项目 | 结论 |
| --- | --- |
| Node.js | Node 24 LTS，Volta 固定精确补丁版本 |
| 默认包管理器 | Utoo（`ut`） |
| 稳定回退方案 | pnpm |
| 锁文件 | 不提交；本地生成的锁文件加入 `.gitignore` |
| CI 安装命令 | `ut install` |
| Node.js 版本管理 | Volta |
| `.nvmrc` / `.node-version` | 不配置 |
| 依赖版本 | 根据兼容风险使用 `^` 或 `~`，干净环境安装范围内最新版本 |

`package.json` 基础配置：

```json
{
  "engines": {
    "node": ">=24"
  },
  "volta": {
    "node": "24.18.0"
  }
}
```

## 参考

- [Node.js Releases](https://nodejs.org/en/about/previous-releases)
- [Volta：Managing your project](https://docs.volta.sh/guide/understanding)
- [Volta：pnpm Support](https://docs.volta.sh/advanced/pnpm)
- [Utoo 文档](https://utoo.land/en/docs/utoo)
- [Utoo 自动更新](https://utoo.land/en/docs/utoo/auto-update)
