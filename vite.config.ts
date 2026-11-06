import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// base './' so the built files load from disk inside the desktop app
export default defineConfig({ plugins: [react()], base: './' });
