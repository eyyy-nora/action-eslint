import { exec } from "@actions/exec";
import { fileExists } from "src/util";

export enum PackageManager {
  NPM = "npm",
  PNPM = "pnpm",
  YARN = "yarn",
}

export async function runScript(
  manager: PackageManager,
  name: string,
  args: string[] = [],
  cwd?: string,
) {
  return await exec(manager, ["run", name, ...args], { cwd });
}

export async function runCommand(
  manager: PackageManager,
  executable: string,
  args: string[] = [],
  cwd?: string,
) {
  if (executable.startsWith(".") || executable.startsWith("/"))
    return await exec(executable, args, { cwd });
  switch (manager) {
    case PackageManager.NPM:
      return await exec("npx", [executable, ...args], { cwd });
    case PackageManager.PNPM:
      return await exec("pnpx", [executable, ...args], { cwd });
    case PackageManager.YARN:
      return await exec("yarn", [executable, ...args], { cwd });
  }
}

export async function detectPackageManager(
  dir: string,
): Promise<PackageManager> {
  if (await fileExists(dir, "package-lock.json")) return PackageManager.NPM;
  if (await fileExists(dir, "yarn.lock")) return PackageManager.YARN;
  if (await fileExists(dir, "pnpm-lock.yaml")) return PackageManager.PNPM;
  return PackageManager.NPM;
}
