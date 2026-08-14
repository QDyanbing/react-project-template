export default {
  language: 'zh-CN',
  namespace: 'common',
  resources: {
    pagination: {
      total: '共 {{count}} 条',
    },
    request: {
      unauthorized: '登录状态已失效，请重新登录',
      forbidden: '暂无访问权限',
      notFound: '请求的资源不存在',
      serverError: '服务异常，请稍后重试',
      failed: '请求失败（{{status}}）',
      unfinished: '请求未完成',
      systemError: '系统异常，请稍后重试',
      invalidResponse: '响应数据格式错误',
      networkError: '网络异常，请稍后重试',
    },
  },
} satisfies I18n.Locale;
