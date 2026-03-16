const { spawn } = require("node:child_process");
const path = require("node:path");

// Keep backward compatibility for older commands that still run scripts/deploy.js.
const scriptPath = path.join(__dirname, "deploy_pure.cjs");

const child = spawn(process.execPath, [scriptPath], {
  stdio: "inherit",
});

child.on("close", (code) => {
  process.exitCode = code ?? 1;
});
