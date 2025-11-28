import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // --- New Development Server Configuration ---
  server: {
    // Vite Dev Server settings
    host: 'localhost',
    port: 5173, 
    
    // Setup Proxy to redirect /api calls to the backend server
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Change this if your backend uses a different port
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '') // Often optional if backend also uses /api prefix
      },
    },
  },
  // --- End Configuration ---
});