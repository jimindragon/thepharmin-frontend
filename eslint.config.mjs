import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

/*
 * eslint-config-next@15.5.x is still an eslintrc-style config (its package.json
 * exports only `index.js`; there is no `eslint-config-next/flat` entry point yet),
 * so it has to be bridged into flat config through FlatCompat.
 *
 * FlatCompat lives in @eslint/eslintrc, which is a dependency of eslint itself
 * but is not a direct dependency of this project, so under pnpm's strict
 * node_modules layout it is not resolvable from the repo root. Resolve it
 * through eslint's own install location instead of adding a new dependency.
 */
const { FlatCompat } = require(
  require.resolve('@eslint/eslintrc', {
    paths: [dirname(require.resolve('eslint/package.json'))],
  })
)

const compat = new FlatCompat({ baseDirectory: __dirname })

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'dist/**',
      'coverage/**',
      'public/**',
      // design-sync tooling and its generated vendor bundle — not our source.
      // Both are gitignored; ESLint 9 flat config does not read .gitignore.
      'ds-bundle/**',
      '.ds-sync/**',
    ],
  },
  // eslint-config-next defaults, unmodified.
  ...compat.extends('next/core-web-vitals'),
]

export default config
