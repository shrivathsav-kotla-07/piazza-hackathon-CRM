import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000', // Node backend
      '/ask': 'http://localhost:8000', // FastAPI backend
      '/extract': 'http://localhost:8000',
      '/save_lead': 'http://localhost:8000',
      '/update-graph': 'http://localhost:8000',
      '/run': 'http://localhost:8000' // Added for workflow execution
    }
  }
}); 