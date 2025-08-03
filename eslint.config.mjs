import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '.log/**'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['gatsby-node.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        require: 'readonly',
        module: 'readonly',
        __dirname: 'readonly',
        process: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off', // disables "'require' is not defined"
    },
  },
  // Prettier
  eslintConfigPrettier,
)
