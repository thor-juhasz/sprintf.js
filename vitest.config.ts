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
            // include: ['./benchmark/**/*.(c|m)ts?(x)']
            reporters: ['default']
        }
    }
})
