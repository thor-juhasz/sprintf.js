import { defineConfig } from 'tsup'

const common = {
    dts: true,
    target: ['node18', 'es2020'],
    clean: true,
    sourcemap: true,
}

export default defineConfig([
    {
        entry: ['src/index.ts'],
        format: ['cjs', 'esm'],
        ...common,
    },
    {
        entry: ['src/browser.ts'],
        format: 'iife',
        ...common,
    },
])
