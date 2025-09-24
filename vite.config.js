import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { cpSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const WORKSPACE_ROOT = __dirname;

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-notes',
      closeBundle() {
        cpSync('notes', 'dist/notes', { recursive: true });
      }
    }
  ],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'audio-worklet-processor': resolve(__dirname, 'src/audio/lyre-worklet.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'audio-worklet-processor') {
            return 'audio-worklet-processor.js';
          }
          return '[name]-[hash].js';
        }
      }
    }
  },
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
