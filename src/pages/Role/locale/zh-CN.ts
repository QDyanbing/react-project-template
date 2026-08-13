export default {
  language: 'zh-CN',
  namespace: 'role',
  resources: {
    search: {
      keyword: '请输入角色名称',
    },
    column: {
      name: '角色名称',
      permissions: '权限数量',
      users: '用户数量',
      action: '操作',
    },
    action: {
      create: '新增角色',
      detail: '详情',
      modify: '编辑',
      delete: '删除',
      deleteConfirm: '确定删除该角色吗？',
    },
    message: {
      deleteSuccess: '角色删除成功',
    },
    pagination: {
      total: '共 {{count}} 个角色',
    },
  },
} satisfies I18n.Locale;
