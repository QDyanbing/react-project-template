export default {
  extends: ['stylelint-config-standard-less'],
  ignoreFiles: ['coverage/**/*', 'dist/**/*', 'playwright-report/**/*'],
  rules: {
    'color-hex-length': 'long',
    'selector-class-pattern': null,
  },
};
