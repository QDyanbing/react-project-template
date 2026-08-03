export default {
  language: 'en-US',
  namespace: 'home',
  resources: {
    columns: {
      name: 'Project name',
      description: 'Description',
      action: 'Actions',
    },
    actions: {
      detail: 'Details',
      modify: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Delete this project?',
      deleteSuccess: 'Project deleted',
    },
    search: {
      submit: 'Search',
      placeholder: 'Search by project name or description',
      create: 'Create project',
    },
    pagination: {
      total: '<count>{{count}}</count> items',
    },
  },
} satisfies I18n.Locale;
