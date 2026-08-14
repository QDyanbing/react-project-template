export default {
  language: 'en-US',
  namespace: 'user',
  resources: {
    search: {
      keyword: 'Enter account or name',
      status: 'Select account status',
    },
    column: {
      account: 'Account',
      name: 'Name',
      roles: 'Roles',
      status: 'Status',
      gmtCreate: 'Created at',
      action: 'Actions',
    },
    status: {
      enabled: 'Enabled',
      disabled: 'Disabled',
    },
    action: {
      create: 'Create user',
      detail: 'Details',
      modify: 'Edit',
      enable: 'Enable',
      disable: 'Disable',
      delete: 'Delete',
      resetPassword: 'Reset password',
      deleteConfirm: 'Delete this user?',
      enableConfirm: 'Enable this user?',
      disableConfirm: 'Disable this user?',
      resetPasswordConfirm: "Reset this user's password?",
    },
    message: {
      deleteSuccess: 'User deleted',
      enableSuccess: 'User enabled',
      disableSuccess: 'User disabled',
    },
    passwordView: {
      description: 'The password has been updated. Share the new password with the user securely.',
    },
  },
} satisfies I18n.Locale;
