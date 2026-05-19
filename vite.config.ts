import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function copyMusicPlugin() {
  return {
    name: "copy-music",
    closeBundle() {
      const srcDir = path.resolve(import.meta.dirname, "public/music");
      const outDir = path.resolve(import.meta.dirname, "dist/public/music");
      if (fs.existsSync(srcDir)) {
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }
        fs.readdirSync(srcDir).forEach(file => {
          fs.copyFileSync(path.join(srcDir, file), path.join(outDir, file));
        });
        console.log("Copied music files to dist");
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyMusicPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5001",
        changeOrigin: true,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
