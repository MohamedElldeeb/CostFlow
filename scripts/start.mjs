import { spawn } from "node:child_process";

const args = process.env.NODE_ENV === "production"
  ? ["dist-server/server/index.js"]
  : ["--watch", "dist-server/server/index.js"];

const server = spawn(process.execPath, args, { stdio: "inherit" });
server.on("exit", (code) => process.exitCode = code ?? 1);
