// See https://gitlab.com/gitlab-org/gitlab/-/issues/119194
module.exports = {
  roots: ['<rootDir>/dist'],
  transformIgnorePatterns: ['node_modules/(?!monaco-editor/)'],
  moduleNameMapper: {
    '^monaco-editor$': 'monaco-editor/esm/vs/editor/editor.main.js',
    '\\.(css|less)$': 'identity-obj-proxy',
  },
  testEnvironment: 'jsdom',
};
