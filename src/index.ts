import { group, info, getInput, getMultilineInput } from "@actions/core";
import { getLintScript, getPackageJson } from "src/package-json";
import { getChangedFiles, groupFilesByProject } from "src/changes";
import {
  detectPackageManager,
  runCommand,
  runScript,
} from "src/package-manager";

function getOptions() {
  let directories = getMultilineInput("directories", {
    trimWhitespace: true,
    required: false,
  });
  if (!directories || !directories.length) directories = ["."];

  const executable =
    getInput("executable", { trimWhitespace: true, required: false }) ??
    "eslint";
  const token = getInput("github-token", {
    trimWhitespace: true,
    required: false,
  });

  return { directories, executable, token };
}

async function lint() {
  const { directories, executable, token } = getOptions();
  const changed = token ? await getChangedFiles(token) : undefined;
  const grouped =
    changed?.length && (await groupFilesByProject(directories, changed));
  for (const directory of directories) {
    const title = directory === "." ? "eslint" : `eslint in ${directory}`;
    await group(title, async () => {
      const pkg = await getPackageJson(directory);
      const manager = await detectPackageManager(directory);
      const script = await getLintScript(pkg);
      const matching = grouped?.[directory];
      info(`context "${pkg.name ?? directory}" manager is "${manager}"`);
      info(`lint script is ${script ? "preset" : "not present"}`);
      if (executable)
        await runCommand(manager, executable, matching, directory);
      else if (script) await runScript(manager, "lint", [], directory);
      else if (matching)
        await runCommand(manager, "eslint", matching, directory);
    });
  }
}

lint();

export {};
