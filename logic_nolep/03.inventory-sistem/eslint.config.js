import globals from 'globals';
import js from '@eslint/js';
import jest from 'eslint-plugin-jest';
import security from 'eslint-plugin-security';

export default [
  {
    ignores: ['node_modules/**', 'bin/**', 'generated/**', 'prisma/**', '**/*.min.js'],
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      jest,
      security,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...jest.configs.recommended.rules,
      ...security.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'security/detect-non-literal-fs-filename': 'off',
      'jest/expect-expect': 'off',
      'security/detect-object-injection': 'off',
    },
  },
];
