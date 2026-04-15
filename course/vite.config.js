import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { cpSync, readFileSync, existsSync, mkdirSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKSPACE_ROOT = __dirname;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-notes-and-lyre',
      transformIndexHtml(html, { mode }) {
        if (mode === 'development') {
          return html.replace(/<!-- GA_START -->[\s\S]*?<!-- GA_END -->\n?/m, '');
        }
        return html;
      },
      configureServer(server) {
        server.middlewares.use('/lang', (req, res, next) => {
          const filePath = resolve(__dirname, '../lang/src', req.url.substring(1));

          if (existsSync(filePath)) {
            try {
              const content = readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'application/javascript');
              res.end(content);
              return;
            } catch (error) {
              console.error('Error serving lang file:', error);
            }
          }

          next();
        });
      },
      closeBundle() {
        cpSync('notes', 'dist/notes', { recursive: true });
        cpSync('../lang/src', 'dist/lang', { recursive: true });
        cpSync('src/assets', 'dist/assets', { recursive: true });
        mkdirSync('dist/lang-docs', { recursive: true });
        cpSync('../lang/On the language.md', 'dist/lang-docs/On the language.md');
        cpSync('../lang/On the engine.md', 'dist/lang-docs/On the engine.md');
      }
    }
  ],
  server: {
    port: 8000,
    fs: {
      allow: [WORKSPACE_ROOT, resolve(__dirname, '..')]
    }
  },
  define: {
    __WORKSPACE_ROOT__: JSON.stringify(WORKSPACE_ROOT)
  }
});
