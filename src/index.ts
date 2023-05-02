import { group, info, error, notice, getInput, getMultilineInput } from "@actions/core";
import { exec } from "@actions/exec";
import { getOctokit, context } from '@actions/github';
import { GetResponseDataTypeFromEndpointMethod } from '@octokit/types';
import fs from "node:fs/promises";
import { detectPackageManager, getLintScript, getPackageJson } from "src/package-json";
import { getChangedFiles, groupFilesByProject } from "src/changes";

type OctoKit = ReturnType<typeof getOctokit>;

type ReposGetCommitResponse = GetResponseDataTypeFromEndpointMethod<OctoKit["rest"]["repos"]["getCommit"]>;


function getOptions() {
  let directories = getMultilineInput("directories", { trimWhitespace: true, required: false });
  if (!directories || !directories.length) directories = ["."];

  const executable = getInput("executable", { trimWhitespace: true, required: false }) ?? "eslint";
  const token = getInput("github-token", { trimWhitespace: true, required: false });

  return { directories, executable, token };
}


async function lint() {
  const { directories, executable, token } = getOptions();
  const changed = token ? await getChangedFiles(token) : undefined;
  const grouped = changed?.length && await groupFilesByProject(directories, changed);
  const checks = [];
  for (const directory of directories) {
    const title = directory === "." ? "run eslint" : `run eslint in ${directory}`;
    await group(title, async () => {
      const pkg = await getPackageJson(directory);
      const script = await getLintScript(pkg);
      if (executable) return exec(executable, [], { cwd: pkg ? directory : "." });
      if (script) info(`detected lint script for project "${pkg.name ?? directory}"`);
      const manager = await detectPackageManager(directory);

    });
  }
}



export {}