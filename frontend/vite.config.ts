import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    // Any request that the frontend makes to /api/... during "vite dev" will be forwarded to http://localhost:4000/api/...
    // So our frontend can just fetch /api/login without CORS headaches
    server: {
        port: 5173,
        proxy: {
            // Proxy /api to the backend
            '/api': {
                target: 'http://localhost:4000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
