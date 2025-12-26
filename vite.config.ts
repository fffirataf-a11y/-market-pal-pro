import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
    // ✅ HTTPS'i kaldır - HTTP kullan
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  },
  // Static assets için cache ayarları
  build: {
    target: "es2015",
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Icon dosyaları için cache busting
          if (assetInfo.name && assetInfo.name.includes('icon')) {
            return `assets/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },
  },
  plugins: [
    react(),
    // ✅ mkcert'i kaldır
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));