import { defineConfig } from 'vitest/config'

export default defineConfig({
    root: '.',
    resolve: {
        alias: {
            '@': new URL('./src', import.meta.url).pathname,
            '@tests': new URL('./tests', import.meta.url).pathname,
        },
    },
    test: {
        benchmark: {
            reporters: ['default']
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['src/**/*.ts'],
            exclude: ['**/*.d.ts', '**/*.test.ts', '**/*.bench.ts'],
            thresholds: {
                100: true,
            },
        },
    },
})
