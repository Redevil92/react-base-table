import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { peerDependencies } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      css: {},
    },
  },
  build: {
    outDir: "dist", // Output folder for compiled code
    lib: {
      entry: "./src/index.ts",
      name: "ReactBaseTable",
      fileName: (format) => `index.${format}.js`,
      formats: ["cjs", "es"],
    },
    rollupOptions: {
      external: ["react", "react-dom", ...Object.keys(peerDependencies)],
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [react()],
});
