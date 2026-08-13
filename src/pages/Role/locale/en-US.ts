export default {
  language: 'en-US',
  namespace: 'role',
  resources: {
    search: {
      keyword: 'Enter role name',
    },
    column: {
      name: 'Role name',
      permissions: 'Permissions',
      users: 'Users',
      action: 'Actions',
    },
    action: {
      create: 'Create role',
      detail: 'Details',
      modify: 'Edit',
      delete: 'Delete',
      deleteConfirm: 'Delete this role?',
    },
    message: {
      deleteSuccess: 'Role deleted',
    },
    pagination: {
      total: '{{count}} roles',
    },
  },
} satisfies I18n.Locale;
