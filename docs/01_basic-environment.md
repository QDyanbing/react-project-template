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
| pnpm | 安装快；磁盘复用好；依赖边界严格；生态和 CI 支持成熟；可以从 `package-lock.json` 导入 | Volta 对 pnpm 的支持仍是实验性，通常需要使用 Corepack 管理版本 | 稳定回退方案 |
| npm | Node 自带；兼容范围最广；Volta 支持完整 | 安装性能和磁盘复用一般，相比 Utoo 和 pnpm 缺少明显收益 | 不选 |
| Yarn | Workspace 和约束能力完整 | 单应用模板收益有限，额外配置较多 | 不选 |
| Bun | 安装快，并提供运行时和测试工具 | 与 Node + Volta 路线重叠，增加运行环境差异 | 不选 |

我选择 Utoo（`ut`）作为默认包管理器。它的安装性能和 npm 锁文件兼容性符合模板需求；同时，我可以直接联系作者反馈问题，有助于控制新工具的采用风险。

稳定性风险通过保留 pnpm 回退路径处理。项目不使用只有 Utoo 才支持的依赖声明和脚本写法，确保必要时可以迁移到 pnpm。

## Utoo 到 pnpm 的回退策略

- 日常开发和 CI 统一使用 `ut`，仓库只提交 `package-lock.json`。
- 项目 scripts 保持标准 `package.json` 写法，不在脚本中依赖 `ut` 专属行为。
- 为保持 pnpm 回退能力，不使用 `.utoo.toml`、Utoo Catalog 等专属配置。
- 需要回退时，使用 `pnpm import` 从 `package-lock.json` 生成 `pnpm-lock.yaml`。
- 回退完成后删除 `package-lock.json`，只保留 `pnpm-lock.yaml`，不长期维护两份锁文件。
- 同步将本地安装、CI 和文档命令切换为 `pnpm`，并重新执行完整验证。

## 版本锁定策略

工具链和项目依赖分开处理：

| 对象 | 策略 |
| --- | --- |
| Node.js | Volta 固定精确补丁版本；`engines` 只声明最低版本为 Node 24 |
| Utoo | CI 显式安装经过验证的精确版本；本地开发版本以 CI 基线为准 |
| 直接依赖 | 正常使用 SemVer 范围，默认允许兼容的 patch/minor 更新 |
| 完整依赖树 | 由 `package-lock.json` 精确锁定并提交仓库 |
| CI 安装 | 使用 `ut install`；CI 环境会关闭 Utoo 自动更新 |

直接依赖保留 SemVer 范围，完整安装结果由锁文件固定。该方式在保证可复现安装的同时，避免为每次兼容更新手动修改依赖声明。

## 依赖升级策略

- 安全修复立即处理。
- Patch 和 Minor 更新定期集中处理。
- Major 更新单独处理，并根据迁移文档完成验证。
- Node.js 只跟随 LTS，不跟随 Current。
- Utoo 升级后同时验证安装结果和锁文件差异；出现阻断问题时先恢复到上一个已验证版本，再决定修复或回退 pnpm。
- 依赖未发生变化时不主动刷新锁文件。

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
| 锁文件 | `package-lock.json` |
| 回退后的锁文件 | `pnpm-lock.yaml` |
| CI 安装命令 | `ut install` |
| Node.js 版本管理 | Volta |
| `.nvmrc` / `.node-version` | 不配置 |
| 依赖版本 | SemVer 范围 + 锁文件精确安装 |

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
- [pnpm import](https://pnpm.io/cli/import)
