export default {
  language: 'en-US',
  namespace: 'common',
  resources: {
    request: {
      unauthorized: 'Your session has expired. Please sign in again.',
      forbidden: 'You do not have permission to perform this action.',
      notFound: 'The requested resource does not exist.',
      serverError: 'The service is unavailable. Please try again later.',
      failed: 'Request failed ({{status}}).',
      unfinished: 'The request was not completed.',
      systemError: 'Something went wrong. Please try again later.',
      invalidResponse: 'The response data is invalid.',
      networkError: 'Network error. Please try again later.',
    },
  },
} satisfies I18n.Locale;
