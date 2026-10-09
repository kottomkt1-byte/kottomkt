import { defineConfig } from 'vite';
import { resolve } from 'node:path';
const names = ['index','about','services','contact','location','service-blog','service-hpblog','service-instagram','service-place','service-daangn','service-cafe','service-website'];
export default defineConfig({
  base: './',
  build: { rollupOptions: { input: Object.fromEntries(names.map(name => [name, resolve(`${name}.html`)])) } },
});
