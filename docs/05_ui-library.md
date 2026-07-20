# UI 组件库选型

## 组件库方案对比

### Ant Design 6

维护主体：蚂蚁集团 Ant Design 团队和社区。

定位：面向企业级产品的 React UI 组件库，覆盖数据录入、数据展示、导航、反馈和布局等常见场景。

优点：

- 组件覆盖完整，Form、Table、DatePicker、Upload、Modal 等复杂组件可以直接组成常见业务页面。
- Ant Design 6 要求 React 18 及以上版本，可以直接用于当前 React 19 项目。
- 主题系统提供全局 Token、组件 Token、暗色与紧凑模式，并以 CSS 变量作为基础，为后续主题设计提供统一入口。
- TypeScript 类型、文档、社区和配套工具成熟，常见问题容易定位。

局限：

- 默认视觉风格辨识度较高，品牌化项目需要重新设计主题。
- 组件数量和 API 范围较大，升级时需要关注行为、样式和废弃 API 的变化。
- 主题和组件样式属于完整体系，自定义样式需要遵循其 Token 边界，避免依赖内部 DOM 和类名。

### Material UI 9

维护主体：MUI 公司和社区。

定位：基于 Material Design 的通用 React UI 组件库。

优点：

- 全球使用范围广，文档、社区和第三方集成成熟。
- 组件重视可访问性和键盘交互，基础组件质量稳定。
- 支持 React 19，主题系统提供 CSS 变量、设计 Token 和多种定制方式。
- Material UI 核心组件采用 MIT 许可证。

局限：

- Material Design 的视觉语言较强，与非 Material 品牌体系结合时需要较多定制。
- 默认样式方案依赖 Emotion，会将组件库选择与运行时样式方案绑定。
- Data Grid 等部分高级能力位于 MUI X，其中部分功能采用商业许可证。

### Arco Design React 2

维护主体：由字节跳动发起，现由 Arco Design 团队和社区维护。

定位：面向企业级产品的 React UI 组件库。

优点：

- 覆盖 60 多种基础组件，可以满足常见中后台页面需求。
- 视觉风格简洁，提供设计 Token、主题配置和 Design Lab。
- 采用 MIT 许可证，当前仍在持续发布 React 组件版本。

局限：

- 社区规模、第三方集成和问题资料少于 Ant Design 与 Material UI。
- 复杂业务组件和上层解决方案的选择范围较小。

### shadcn/ui

维护主体：shadcn 和开源社区。

定位：通过 CLI 将组件源码加入项目的开放代码组件平台，不是传统的组件依赖库。

优点：

- 组件源码完全归项目所有，可以直接修改结构、行为和样式。
- 组件按需引入，不需要接受完整组件库的视觉和抽象边界。
- 支持 React 19 和 Tailwind CSS 4，并提供 Base UI 与 Radix 两种基础组件实现。

局限：

- 选择 shadcn/ui 会同时确定 Tailwind CSS，对尚未完成的样式方案选型形成约束。
- 组件源码进入项目后需要自行维护，上游更新无法完全通过依赖升级获得。
- 复杂表格、表单和企业级业务组件需要自行组合或引入其他方案。
- 不同项目会逐渐形成各自的组件副本，统一维护模板升级的成本较高。

## 选型结论

选择 Ant Design 6 稳定版本作为模板默认 UI 组件库。

Ant Design 的组件覆盖、React 19 兼容性、主题能力和维护成熟度能够满足通用 React 项目的基础需求。我长期参与其社区贡献，也能更及时地跟进版本变化和解决兼容问题。

## 选型边界

- 只选择 Ant Design 核心组件库，不默认加入 ProComponents 或 Ant Design X。
- 主题定制基于官方 Design Token 能力，不依赖组件内部 DOM 和私有类名。
- CSS 方案、主题内容、暗色模式和图标方案保持独立选型。

## 参考

- [Ant Design 介绍](https://ant.design/docs/spec/introduce)
- [Ant Design 5 到 6 迁移说明](https://ant.design/docs/react/migration-v6)
- [Ant Design 主题定制](https://ant.design/docs/react/customize-theme)
- [Material UI 版本](https://mui.com/material-ui/getting-started/versions/)
- [Material UI 安装说明](https://mui.com/material-ui/getting-started/installation/)
- [MUI X 许可说明](https://mui.com/x/introduction/licensing/)
- [Arco Design React](https://arco.design/react/docs/start)
- [Arco Design GitHub](https://github.com/arco-design/arco-design)
- [shadcn/ui 介绍](https://ui.shadcn.com/docs)
- [shadcn/ui 手动安装](https://ui.shadcn.com/docs/installation/manual)
