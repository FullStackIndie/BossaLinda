import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command, mode }) => ({
  root: "src",
  base: "/BossaLinda/",
  publicDir: "public",

  build: {
    brotliSize: false,
    manifest: false,
    minify: mode === "development" ? false : "terser",
    outDir: "../dist",
    sourcemap: command === "serve" ? "inline" : false,
    chunkSizeWarningLimit: 1000,
    // rollupOptions: {
    //   output: {
    //     assetFileNames: 'clientlib-site/resources/[ext]/[name][extname]',
    //     chunkFileNames: 'clientlib-site/resources/chunks/[name].[hash].js',
    //     entryFileNames: 'clientlib-site/resources/js/[name].js',
    //   },
    // },
  },

  server: {
    origin: "https://fullstackindie.github.io/BossaLinda",
  },
  plugins: [tsconfigPaths()],
}));
