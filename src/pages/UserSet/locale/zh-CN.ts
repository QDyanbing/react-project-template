export default {
  language: 'zh-CN',
  namespace: 'userSet',
  resources: {
    name: '用户姓名',
    namePlaceholder: '请输入用户姓名',
    email: '邮箱',
    emailPlaceholder: '请输入邮箱',
    phone: '手机号',
    phonePlaceholder: '请输入手机号',
    roles: '角色',
    rolesPlaceholder: '请选择角色',
    save: '保存',
    cancel: '取消',
    required: '此项为必填项',
    emailInvalid: '请输入有效的邮箱地址',
    message: {
      modifySuccess: '用户修改成功',
    },
    passwordView: {
      description: '用户已创建，请将初始密码安全地交给用户。',
    },
  },
} satisfies I18n.Locale;
