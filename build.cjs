const { build } = require("vite");
const { resolve } = require("path");
const react = require("@vitejs/plugin-react");
const pkg = require("./package.json");

const sharedConfig = {
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  cssCodeSplit: false,
  outDir: "dist",
};

const builds = [
  {
    name: "content",
    input: resolve(__dirname, "src/content.jsx"),
    output: "content.js",
  },
  {
    name: "inject",
    input: resolve(__dirname, "src/inject.ts"),
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
