import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    host: true, // listen on 0.0.0.0 so you can open the app on your phone (same WiFi)
  },
});
