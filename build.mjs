/* eslint-disable */
import { build } from 'esbuild'
import eslint from 'esbuild-plugin-eslint'
import { glob } from 'glob'

const files = await glob('src/appsync/**/*.ts')

await build({
  sourcemap: 'inline',
  sourcesContent: false,
  format: 'esm',
  target: 'esnext',
  platform: 'node',
  external: ['@aws-appsync/utils'],
  outdir: 'dist/appsync',
  entryPoints: files,
  bundle: true,
  plugins: [eslint({ useEslintrc: true })],
})
