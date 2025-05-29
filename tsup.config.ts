import { defineConfig } from 'tsup'
import pkg from './package.json'

const common = {
    dts: true,
    target: ['node18', 'es2020'],
    minify: true,
    clean: true,
    sourcemap: true,
    banner: {
        js: `/*! ${pkg.name} v${pkg.version} | Copyright (c) 2007-present, ${pkg.author} | ${pkg.license} */`
    }
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
