import { defineConfig, mergeConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config.js'
import { fileURLToPath } from 'node:url'

// For example merging vite config defined as a function, see: https://github.com/vitest-dev/vitest/pull/3978
export default defineConfig(configEnv => mergeConfig(
  viteConfig(configEnv),
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/*'],
      root: fileURLToPath(new URL('./', import.meta.url)),
      globals: true,
      // isolate: false, // dangerous
      benchmark: {
        reporters: ['verbose']
      }
    }
  }) as any
))