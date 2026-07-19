import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const clientRoot = resolve(projectRoot, "public");

const pageNames = [
  "index",
  "login",
  "signup",
  "projects",
  "project",
  "settings",
  "alerts",
];

export default defineConfig({
  root: clientRoot,
  publicDir: false,
  build: {
    outDir: resolve(projectRoot, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: Object.fromEntries(
        pageNames.map((page) => [page, resolve(clientRoot, `${page}.html`)]),
      ),
    },
  },
});
