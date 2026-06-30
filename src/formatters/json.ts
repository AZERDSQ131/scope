import { ScopeOutput } from "../types.js";

export function formatJSON(output: ScopeOutput): string {
  return JSON.stringify(output, null, 2);
}

export function formatMarkdown(info: ScopeOutput["project"]): string {
  const lines: string[] = [];
  lines.push(`# ${info.name} — Codebase Overview`);
  lines.push("");
  lines.push(`Generated: ${new Date().toLocaleString()}`);
  lines.push("");

  // Tech Stack
  lines.push("## Tech Stack");
  if (info.techStack.languages.length) lines.push(`- **Languages:** ${info.techStack.languages.join(", ")}`);
  if (info.techStack.frameworks.length) lines.push(`- **Frameworks:** ${info.techStack.frameworks.join(", ")}`);
  if (info.techStack.tools.length) lines.push(`- **Tools:** ${info.techStack.tools.join(", ")}`);
  if (info.techStack.database.length) lines.push(`- **Database:** ${info.techStack.database.join(", ")}`);
  lines.push("");

  // Structure
  lines.push("## Structure");
  lines.push(`- **Total files:** ${info.structure.totalFiles}`);
  lines.push(`- **Directories:** ${info.structure.totalDirs}`);
  if (info.packageManager) lines.push(`- **Package manager:** ${info.packageManager}`);
  if (info.dependencies.total > 0) {
    lines.push(`- **Dependencies:** ${info.dependencies.production} production / ${info.dependencies.development} development`);
  }
  lines.push("");

  // Git
  if (info.git.isRepo) {
    lines.push("## Git");
    if (info.git.branch) lines.push(`- **Branch:** ${info.git.branch}`);
    if (info.git.totalCommits !== null) lines.push(`- **Commits:** ${info.git.totalCommits}`);
    if (info.git.totalContributors !== null) lines.push(`- **Contributors:** ${info.git.totalContributors}`);
    if (info.git.lastCommitMessage) lines.push(`- **Last commit:** ${info.git.lastCommitMessage}`);
    if (info.git.createdDate) lines.push(`- **Created:** ${new Date(info.git.createdDate).toLocaleDateString()}`);
    lines.push("");
  }

  // File types
  const topTypes = Object.entries(info.structure.fileTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  if (topTypes.length > 0) {
    lines.push("## File Types");
    lines.push("| Extension | Count |");
    lines.push("|-----------|-------|");
    for (const [ext, count] of topTypes) {
      lines.push(`| ${ext} | ${count} |`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
