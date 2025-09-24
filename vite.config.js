import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { cpSync, readFileSync, existsSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKSPACE_ROOT = __dirname;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-notes-and-lyre',
      configureServer(server) {
        server.middlewares.use('/lyre', (req, res, next) => {
          const filePath = resolve(__dirname, 'src/lyre', req.url.substring(1));
          
          if (existsSync(filePath)) {
            try {
              const content = readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'application/javascript');
              res.end(content);
              return;
            } catch (error) {
              console.error('Error serving lyre file:', error);
            }
          }
          
          next();
        });
      },
      closeBundle() {
        cpSync('notes', 'dist/notes', { recursive: true });
        cpSync('src/lyre', 'dist/lyre', { recursive: true });
      }
    }
  ],
  server: {
    port: 8000,
    fs: {
      allow: [WORKSPACE_ROOT]
    }
  },
  define: {
    __WORKSPACE_ROOT__: JSON.stringify(WORKSPACE_ROOT)
  }
});
