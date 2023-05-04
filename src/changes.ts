import { context, getOctokit } from "@actions/github";
import { GetResponseDataTypeFromEndpointMethod } from "@octokit/types";
import path from "node:path";

type OctoKit = ReturnType<typeof getOctokit>;
type ReposGetCommitResponse = GetResponseDataTypeFromEndpointMethod<
  OctoKit["rest"]["repos"]["getCommit"]
>;
type File = ReposGetCommitResponse["files"][number];

async function getCommitFiles(kit: OctoKit): Promise<File[]> {
  const responses: ReposGetCommitResponse[] = await kit.paginate(
    kit.rest.repos.getCommit.endpoint.merge({
      owner: context.repo.owner,
      repo: context.repo.repo,
      ref: context.sha,
    }),
  );
  return responses.flatMap(({ files }) => files);
}

async function getPullRequestFiles(kit: OctoKit): Promise<File[]> {
  return (await kit.rest.pulls.listFiles.endpoint.merge({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: context.payload.pull_request?.number,
  })) as any;
}

export async function getChangedFiles(token: string) {
  const kit = getOctokit(token);
  const pr = context.payload.pull_request;
  const files = pr?.number
    ? await getPullRequestFiles(kit)
    : await getCommitFiles(kit);
  return files
    .filter(({ status }) => status !== "removed")
    .map(({ filename }) => filename);
}

function fileIsInDirectory(file: string, dir: string) {
  const rel = path.relative(dir, file);
  return !rel.startsWith("..") && !!rel;
}

export async function groupFilesByProject(projects: string[], files: string[]) {
  const grouped: Record<string, string[]> = {};
  for (const file of files) {
    for (const project of projects) {
      if (fileIsInDirectory(file, project)) {
        (grouped[project] ??= []).push(file);
        break;
      }
    }
  }
  return grouped;
}
