export default {
  language: 'en-US',
  namespace: 'userSet',
  resources: {
    name: 'Name',
    namePlaceholder: 'Enter name',
    email: 'Email',
    emailPlaceholder: 'Enter email',
    phone: 'Phone',
    phonePlaceholder: 'Enter phone',
    roles: 'Roles',
    rolesPlaceholder: 'Select roles',
    save: 'Save',
    cancel: 'Cancel',
    required: 'This field is required',
    emailInvalid: 'Enter a valid email address',
    message: {
      createSuccess: 'User created. Initial password: {{password}}',
      modifySuccess: 'User updated',
    },
  },
} satisfies I18n.Locale;
