import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { execSync } from "node:child_process";
import { GitInfo } from "../types.js";

export function detectGitInfo(projectDir: string): GitInfo {
  const gitDir = join(projectDir, ".git");
  const isRepo = existsSync(gitDir);

  if (!isRepo) {
    return {
      isRepo: false,
      branch: null,
      totalCommits: null,
      totalContributors: null,
      lastCommitDate: null,
      lastCommitMessage: null,
      totalBranches: null,
      totalTags: null,
      repoSize: null,
      totalAdditions: null,
      totalDeletions: null,
      createdDate: null,
    };
  }

  function run(cmd: string): string | null {
    try {
      return execSync(cmd, { cwd: projectDir, encoding: "utf-8", timeout: 5000 }).trim();
    } catch {
      return null;
    }
  }

  const branch = run("git rev-parse --abbrev-ref HEAD 2>/dev/null");
  const totalCommits = run("git rev-list --count HEAD 2>/dev/null");
  const totalContributors = run("git shortlog -sn --all 2>/dev/null | wc -l");
  const lastCommitDate = run("git log -1 --format=%cI 2>/dev/null");
  const lastCommitMessage = run("git log -1 --format=%s 2>/dev/null");
  const totalBranches = run("git branch -a 2>/dev/null | wc -l");
  const totalTags = run("git tag 2>/dev/null | wc -l");

  // Repo size
  let repoSize: string | null = null;
  const sizeResult = run("git count-objects -vH 2>/dev/null | grep 'size-pack' | awk '{print $2}'");
  if (sizeResult) repoSize = sizeResult;

  // Total additions/deletions
  const diffResult = run("git log --oneline --shortstat 2>/dev/null | awk '/changed/ {ins+=$4; del+=$6} END {print ins, del}'");
  let totalAdditions: number | null = null;
  let totalDeletions: number | null = null;
  if (diffResult) {
    const parts = diffResult.split(" ");
    totalAdditions = parseInt(parts[0]) || null;
    totalDeletions = parseInt(parts[1]) || null;
  }

  // Created date (first commit)
  const createdDate = run("git log --reverse --format=%cI 2>/dev/null | head -1");

  return {
    isRepo: true,
    branch,
    totalCommits: totalCommits ? parseInt(totalCommits) : null,
    totalContributors: totalContributors ? parseInt(totalContributors) : null,
    lastCommitDate,
    lastCommitMessage: lastCommitMessage?.slice(0, 80) ?? null,
    totalBranches: totalBranches ? parseInt(totalBranches) : null,
    totalTags: totalTags ? parseInt(totalTags) : null,
    repoSize,
    totalAdditions,
    totalDeletions,
    createdDate,
  };
}
