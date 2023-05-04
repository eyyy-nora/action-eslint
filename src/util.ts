import fs from "node:fs/promises";
import { resolve } from "node:path";

export async function fileExists(dir: string, path: string): Promise<boolean> {
  return fs
    .access(resolve(dir, path))
    .then(() => true)
    .catch(() => false);
}
