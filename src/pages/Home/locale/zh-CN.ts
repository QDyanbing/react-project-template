export default {
  language: 'zh-CN',
  namespace: 'home',
  resources: {
    columns: {
      name: '项目名称',
      description: '项目描述',
      action: '操作',
    },
    actions: {
      detail: '详情',
      modify: '编辑',
      delete: '删除',
      deleteConfirm: '确认删除该项目？',
      deleteSuccess: '项目删除成功',
    },
    search: {
      submit: '查询',
      placeholder: '请输入项目名称或描述',
      create: '新增项目',
    },
    pagination: {
      total: '共 <count>{{count}}</count> 条',
    },
  },
} satisfies I18n.Locale;
