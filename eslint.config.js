import js from '@eslint/js'
import globals from 'globals'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/dist-ssr/**',
    '**/coverage/**',
    'artifacts/**',
    'public/**',
  ]),
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  },
  { files: ['src/**/*.js'], languageOptions: { globals: globals.browser } },
  { files: ['tests/**/*.js', '*.config.js'], languageOptions: { globals: globals.node } },
])
