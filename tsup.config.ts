import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/gatsby-node.ts'],
  minify: true,
  clean: true,
  // ttlive-client is ESM-only; bundling it keeps the CommonJS gatsby-node loadable
  noExternal: ['@rennitlb/ttlive-client', 'fast-xml-parser'],
})
