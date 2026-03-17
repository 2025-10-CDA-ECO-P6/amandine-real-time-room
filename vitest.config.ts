import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html'],
            all: true,
            include: ['packages/**/src/**/*.{ts,js}'],  // couvre tous les packages
            exclude: ['node_modules/', 'packages/**/tests/**/*'],
        },
    },
})
