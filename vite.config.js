import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

const base = process.env.BASE_URL || '/';

export default defineConfig({
    base,
    plugins: [glsl()],
});
