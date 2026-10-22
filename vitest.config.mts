import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: false,
    slowTestThreshold: 1000,
    include: ['tests/**/*.{test,spec}.ts'],
  },
});
