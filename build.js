import { build } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import pkg from "./package.json" with { type: "json" };

const sharedConfig = {
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(process.cwd(), "src"),
    },
  },
  cssCodeSplit: false,
  outDir: "dist",
};

const builds = [
  {
    name: "content",
    input: resolve("src/content.jsx"),
    output: "content.js",
  },
  {
    name: "inject",
    input: resolve("src/inject.ts"),
    output: "inject.js",
  },
];

async function buildAll() {
  for (const { name, input, output } of builds) {
    console.log(`📦 Building: ${name}`);
    await build({
      ...sharedConfig,
      build: {
        emptyOutDir: false,
        outDir: "dist",
        cssCodeSplit: false,
        rollupOptions: {
          input,
          output: {
            entryFileNames: output,
            manualChunks: undefined,
            assetFileNames: (assetInfo) => {
              if (assetInfo.names?.[0]?.endsWith(".css")) return "main.css";
              return "assets/[name]-[hash][extname]";
            },
          },
        },
      },
    });
  }

  console.log("✅ All done!");
}

buildAll().catch((e) => {
  console.error("❌ Build failed:", e);
  process.exit(1);
});
