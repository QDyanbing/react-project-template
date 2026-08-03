export default {
  language: 'en-US',
  namespace: 'login',
  resources: {
    brand: 'React Project Template',
    introduction: {
      title: 'Start with a clear project structure',
      description:
        'A practical foundation with routing, state management, request handling, API mocks, and common pages.',
      feature: 'The access token is saved after sign-in and attached by the request client.',
    },
    form: {
      security: 'Secure access',
      title: 'Welcome back',
      description: 'Enter your account and password to continue.',
      account: {
        label: 'Account',
        placeholder: 'Enter your account',
        required: 'Please enter your account',
      },
      password: {
        label: 'Password',
        placeholder: 'Enter your password',
        required: 'Please enter your password',
      },
      submit: 'Sign in',
      demo: 'Demo account: admin / 123456',
    },
  },
} satisfies I18n.Locale;
