const { spawn } = require("child_process");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const nextBin = path.join(projectRoot, "node_modules", "next", "dist", "bin", "next");

const child = spawn(
  process.execPath,
  [nextBin, "dev", "--hostname", "0.0.0.0"],
  { stdio: "inherit", cwd: projectRoot }
);

child.on("exit", (code) => process.exit(code ?? 0));
