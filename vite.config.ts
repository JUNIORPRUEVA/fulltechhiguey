// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isProd = mode === "production";
  const isReplit = !!process.env.REPL_ID;

  const plugins = [react()];

  if (!isProd) {
    // Plugins SOLO en dev - con manejo de errores para plugins faltantes
    try {
      // Solo agregar plugins de Replit si están disponibles
      if (isReplit) {
        // Los plugins de Replit se cargan dinámicamente si están disponibles
        console.log("⚠️ Plugins de Replit omitidos para mayor portabilidad");
      }
    } catch (error) {
      console.warn("⚠️ Plugins de desarrollo no disponibles:", (error as Error).message);
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
  };
});
