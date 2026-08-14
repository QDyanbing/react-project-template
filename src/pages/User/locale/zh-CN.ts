export default {
  language: 'zh-CN',
  namespace: 'user',
  resources: {
    search: {
      keyword: '请输入用户账号或姓名',
      status: '请选择账号状态',
    },
    column: {
      account: '用户账号',
      name: '用户姓名',
      roles: '角色',
      status: '状态',
      gmtCreate: '创建时间',
      action: '操作',
    },
    status: {
      enabled: '启用',
      disabled: '禁用',
    },
    action: {
      create: '新增用户',
      detail: '详情',
      modify: '编辑',
      enable: '启用',
      disable: '禁用',
      delete: '删除',
      resetPassword: '重置密码',
      deleteConfirm: '确定删除该用户吗？',
      enableConfirm: '确定启用该用户吗？',
      disableConfirm: '确定禁用该用户吗？',
      resetPasswordConfirm: '确定重置该用户密码吗？',
    },
    message: {
      deleteSuccess: '用户删除成功',
      enableSuccess: '用户启用成功',
      disableSuccess: '用户禁用成功',
    },
    passwordView: {
      description: '用户密码已更新，请将新密码安全地交给用户。',
    },
  },
} satisfies I18n.Locale;
