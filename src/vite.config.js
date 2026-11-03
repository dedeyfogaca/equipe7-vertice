import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// React + Tailwind CSS. O Tailwind gera só as classes usadas nas telas, a
// partir do `src/index.css`.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    rollupOptions: {
      output: {
        // Bibliotecas em arquivos separados: mudam pouco, então o navegador
        // reaproveita o cache entre uma versão e outra do sistema.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          interface: [
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
            'lucide-react',
            'sonner',
          ],
        },
      },
    },
  },
});
