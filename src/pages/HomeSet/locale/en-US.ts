export default {
  language: 'en-US',
  namespace: 'homeSet',
  resources: {
    name: {
      label: 'Project name',
      placeholder: 'Enter the project name',
      required: 'Please enter the project name',
      max: 'Project name cannot exceed {{count}} characters',
    },
    description: {
      label: 'Description',
      placeholder: 'Enter a project description',
      max: 'Description cannot exceed {{count}} characters',
    },
    cancel: 'Cancel',
    save: 'Save',
    createSuccess: 'Project created',
    modifySuccess: 'Project updated',
  },
} satisfies I18n.Locale;
