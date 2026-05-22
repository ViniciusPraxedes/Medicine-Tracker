import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  // Node files config block for scheduled functions and build files
  {
    // Apply this configuration to all js files in functions and vite config
    files: ['functions/**/*.js', 'vite.config.js'],
    // Define the language options override
    languageOptions: {
      // Define global variables mapping
      globals: {
        // Merge the standard Node.js global variables
        ...globals.node,
      // End of globals configuration mapping
      },
    // End of languageOptions configuration
    },
  // End of Node files configuration block object
  },
])
