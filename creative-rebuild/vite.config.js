import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({ base: './', build: { rollupOptions: { input: {index:resolve('index.html'),a:resolve('a.html'),b:resolve('b.html'),c:resolve('c.html')} } } });
