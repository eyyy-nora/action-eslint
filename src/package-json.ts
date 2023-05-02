import fs from "node:fs/promises";
import path from "node:path";
import { exec } from "@actions/exec";

export interface PackageJson {
  name?: string;
  description?: string;
  version?: string;
  scripts?: Record<string, string>;
}

async function fileExists(dir: string, path_: string): Promise<boolean> {
  return fs.access(path.resolve(dir, path_)).then(() => true).catch(() => false);
}

export async function getPackageJson(project: string): Promise<PackageJson> {
  try {
    return JSON.parse(await fs.readFile(path.resolve(project, "package.json"), "utf-8"));
  } catch (e) {
    return {};
  }
}

export async function detectPackageManager(project: string) {
  if (await fileExists(project, "package-lock.json")) return "npm";
  if (await fileExists(project, "yarn.lock")) return "yarn";
  if (await fileExists(project, "pnpm-lock.yaml")) return "pnpm";
  return "unknown";
}

export async function runScript(manager: string, script: string, path: string, isCommand?: boolean) {
  switch (manager) {
    case "npm":
      return await exec(!isCommand ? `npm run ${script}` : `npx ${script}`, [], { cwd: path });
    case "pnpm":
      return await exec(!isCommand ? `pnpm run ${script}` : `pnpm ${script}`, [], { cwd: path });
    case "yarn":
      return await exec(`yarn ${script}`, [], { cwd: path });
  }
}

export async function getLintScript(pkg: PackageJson) {
  return pkg?.scripts?.lint;
}
