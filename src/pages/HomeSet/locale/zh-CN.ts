export default {
  language: 'zh-CN',
  namespace: 'homeSet',
  resources: {
    name: {
      label: '项目名称',
      placeholder: '请输入项目名称',
      required: '请输入项目名称',
      max: '项目名称不能超过 {{count}} 个字符',
    },
    description: {
      label: '项目描述',
      placeholder: '请输入项目描述',
      max: '项目描述不能超过 {{count}} 个字符',
    },
    cancel: '取消',
    save: '保存',
    createSuccess: '项目创建成功',
    modifySuccess: '项目修改成功',
  },
} satisfies I18n.Locale;
