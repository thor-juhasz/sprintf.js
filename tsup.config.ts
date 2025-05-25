import { defineConfig } from 'tsup'

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm', 'iife'],
    dts: true,
    target: 'node18',
    clean: true,
    sourcemap: true,
})
