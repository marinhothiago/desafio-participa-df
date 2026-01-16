import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // Prioridade:
  // 1. VITE_BASE_PATH (definido no Dockerfile)
  // 2. GITHUB_ACTIONS (definido no CI/CD)
  // 3. Fallback para raiz '/'
  base: process.env.VITE_BASE_PATH || (process.env.GITHUB_ACTIONS ? '/desafio-participa-df/' : '/'),
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
