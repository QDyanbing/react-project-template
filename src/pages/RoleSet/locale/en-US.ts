export default {
  language: 'en-US',
  namespace: 'roleSet',
  resources: {
    name: 'Role name',
    namePlaceholder: 'Enter role name',
    description: 'Description',
    descriptionPlaceholder: 'Enter role description',
    permissions: 'Permissions',
    permissionsPlaceholder: 'Select existing permissions',
    save: 'Save',
    cancel: 'Cancel',
    required: 'This field is required',
    message: {
      createSuccess: 'Role created',
      modifySuccess: 'Role updated',
    },
  },
} satisfies I18n.Locale;
