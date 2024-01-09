import { defineConfig, mergeConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.js'
import { fileURLToPath } from 'node:url'

export default mergeConfig(viteConfig as any, defineConfig({
  test: {
    environment: 'jsdom',
    exclude: [...configDefaults.exclude, 'e2e/*'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    transformMode: {
      web: [/\.[jt]sx$/] as RegExp[],
    },
    globals: true,
  } as any
}))