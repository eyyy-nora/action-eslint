import fs from "node:fs/promises";
import path from "node:path";

export interface PackageJson {
  name?: string;
  description?: string;
  version?: string;
  scripts?: Record<string, string>;
}

export async function getPackageJson(project: string): Promise<PackageJson> {
  try {
    return JSON.parse(
      await fs.readFile(path.resolve(project, "package.json"), "utf-8"),
    );
  } catch (e) {
    return {};
  }
}

export async function getLintScript(pkg: PackageJson) {
  return pkg?.scripts?.lint;
}
