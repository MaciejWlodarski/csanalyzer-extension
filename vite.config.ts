import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import pkg from "./package.json";

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, "src/content.jsx"),
        inject: resolve(__dirname, "src/inject.js"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "imports.js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.names?.[0]?.endsWith(".css")) {
            return "main.css";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
    cssCodeSplit: false,
    outDir: "dist",
    emptyOutDir: true,
  },
});
