import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        projects: [
            'apps/web-app',
            'apps/web-api',
        ],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            all: true,
            include: ['apps/**/src/**/*.{ts,tsx}'],
            exclude: ['apps/**/src/**/*.test.{ts,tsx}', 'node_modules/'],
        },
    },
})
