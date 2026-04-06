import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";

export function serveStatic(app: Express) {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidatePaths = [
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(moduleDir, "..", "dist", "public"),
  ];
  const distPath = candidatePaths.find((candidate) => fs.existsSync(candidate));

  if (!distPath) {
    throw new Error(
      `Could not find the client build directory. Looked in: ${candidatePaths.join(", ")}. Did you run npm run build?`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
