# React 基础方案选型

## React 版本对比

| 方案 | 优点 | 问题 |
| --- | --- | --- |
| React 18 | 生态成熟，旧项目和旧依赖兼容范围广 | 缺少 React 19 的新能力和内置 Compiler 运行时 API |
| React 19.2 | 稳定版本；包含 Actions、`use`、`useOptimistic`、`useEffectEvent` 等能力；内置 React Compiler 所需的运行时 API | 部分长期未维护的依赖可能尚未适配 React 19 |
| React Canary | 可以提前使用尚未进入稳定版的能力 | API 和行为可能变化，不适合作为通用模板的默认版本 |

项目使用 React 19 及以上的稳定版本，当前基线为 React 19.2。`react` 和 `react-dom` 保持相同的版本范围，依赖版本使用 `^`，每次重新解析依赖时安装范围内最新的兼容版本。

```json
{
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  }
}
```

`^19.2.7` 可以接收 React 19 范围内兼容的 Minor 和 Patch 更新，不会自动升级到新的 Major 版本。React Major 版本单独升级，并完成依赖兼容性和行为变化验证。Canary 不进入模板依赖。

## TypeScript

项目必须使用 TypeScript，不提供纯 JavaScript 方案。组件 Props、接口数据、状态和公共模块都需要明确的类型边界，以保证编辑器提示、跨模块重构和公共能力复用的可靠性。

TypeScript 使用 7.0 稳定版本线，版本范围为 `^7.0.2`，允许自动获取兼容的 Minor 和 Patch 更新。

React 类型依赖使用 `@types/react@^19.2.17` 和 `@types/react-dom@^19.2.3`，与 React 19 保持相同的 Major 版本。TypeScript 和类型依赖均不使用 Beta、RC 或 Nightly。

## TypeScript 严格程度

TypeScript 启用 `strict`，并额外启用 `noUncheckedIndexedAccess` 和 `exactOptionalPropertyTypes`：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

| 配置 | 作用 |
| --- | --- |
| `strict` | 启用 TypeScript 的严格类型检查集合 |
| `noUncheckedIndexedAccess` | 数组索引和对象索引访问需要处理值不存在的情况 |
| `exactOptionalPropertyTypes` | 区分属性缺失与显式传入 `undefined` |

严格规则从项目创建时启用，避免代码增长后再开启产生集中迁移成本。未使用变量、导入顺序和代码风格由代码规范工具处理。

## React Compiler

| 方案 | 优点 | 问题 |
| --- | --- | --- |
| 启用 | 自动完成组件和 Hook 的记忆化优化，减少手写 `useMemo`、`useCallback` 和 `React.memo` | 增加编译步骤；代码需要遵守 Rules of React；具体接入方式受构建工具影响 |
| 不启用 | 构建链更简单，不增加编译器相关配置 | 性能优化仍依赖人工判断和手动记忆化 |

项目启用 React Compiler。React Compiler 1.0 已进入稳定状态并支持 React 19，可以在构建阶段自动完成组件和 Hook 的记忆化优化。

React Compiler 的接入方式跟随构建工具确定，不在 React 基础方案中绑定 Babel、SWC 或其他转换链。业务代码仍需遵守 Rules of React。

## 选型结论

| 项目 | 结论 |
| --- | --- |
| React | React 19 及以上稳定版本，当前基线为 19.2 |
| React 版本范围 | 使用 `^`；Minor 和 Patch 自动进入依赖范围，Major 单独升级 |
| 开发语言 | 必须使用 TypeScript |
| TypeScript | TypeScript 7.0 稳定版本线，使用 `^` 接收 Minor 和 Patch 更新 |
| React 类型 | `@types/react` 和 `@types/react-dom` 使用 `^`，与 React 保持相同 Major 版本 |
| TypeScript 严格程度 | `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` |
| React Compiler | 启用，具体接入方式跟随构建工具 |
| 实验版本 | 不使用 Canary、Beta、RC 或 Nightly |

## 参考

- [React 版本](https://react.dev/versions)
- [React 19.2](https://react.dev/blog/2025/10/01/react-19-2)
- [React Compiler](https://react.dev/learn/react-compiler)
- [React Compiler 1.0](https://react.dev/blog/2025/10/07/react-compiler-1)
- [TypeScript TSConfig：strict](https://www.typescriptlang.org/tsconfig/strict.html)
- [TypeScript TSConfig：noUncheckedIndexedAccess](https://www.typescriptlang.org/tsconfig/noUncheckedIndexedAccess.html)
- [TypeScript TSConfig：exactOptionalPropertyTypes](https://www.typescriptlang.org/tsconfig/exactOptionalPropertyTypes.html)
