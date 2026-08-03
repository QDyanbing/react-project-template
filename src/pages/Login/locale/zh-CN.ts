export default {
  language: 'zh-CN',
  namespace: 'login',
  resources: {
    brand: 'React 项目模板',
    introduction: {
      title: '从清晰的工程结构开始',
      description: '提供路由、状态管理、请求封装、模拟接口和常用页面的基础实现。',
      feature: '登录成功后自动保存访问令牌，并由请求层统一携带。',
    },
    form: {
      security: '安全访问',
      title: '欢迎登录',
      description: '请输入账号和密码进入项目。',
      account: {
        label: '账号',
        placeholder: '请输入账号',
        required: '请输入账号',
      },
      password: {
        label: '密码',
        placeholder: '请输入密码',
        required: '请输入密码',
      },
      submit: '登录',
      demo: '演示账号：admin / 123456',
    },
  },
} satisfies I18n.Locale;
