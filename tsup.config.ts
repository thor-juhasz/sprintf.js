import { defineConfig } from 'tsup'
import pkg from './package.json'

const common = {
    dts: false,
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
        entry: ['src/sprintf.ts'],
        format: 'esm',
        ...common,
        dts: true,
    },
    {
        entry: ['src/sprintf.ts'],
        format: 'cjs',
        ...common,
    },
    {
        entry: ['src/browser.ts'],
        format: 'iife',
        ...common,
    },
])
