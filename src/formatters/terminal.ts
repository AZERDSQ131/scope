import pc from "picocolors";
import { ProjectInfo } from "../types.js";

const W = 48;

function sep(char = "─", color = pc.dim): string {
  return color(char.repeat(W));
}

function row(label: string, value: string, indent = 2): string {
  return " ".repeat(indent) + pc.bold(label) + " ".repeat(Math.max(1, 14 - label.length)) + value;
}

export function formatTerminal(info: ProjectInfo & { version?: string }): string {
  const lines: string[] = [];
  const hasGit = info.git.isRepo;

  // ── Header with mountain ASCII ──
  lines.push("");
  lines.push(pc.cyan("        ╱★╲"));
  lines.push(pc.cyan("       ╱   ╲") + pc.dim("     neofetch for your codebase"));
  lines.push(pc.cyan("      ╱     ╲"));
  lines.push(pc.bold(pc.cyan("     ╱  SCOPE ╲")) + pc.dim("          v" + info.version || "1.0.0"));
  lines.push(pc.cyan("    ╱___________╲"));
  lines.push("");

  // ── Project Info ──
  lines.push(pc.bold(pc.underline("  Project")));
  lines.push(sep());
  lines.push(row("Name", pc.white(info.name || pc.dim("(untitled)"))));
  if (info.packageManager) {
    lines.push(row("Packages", pc.cyan("via " + info.packageManager)));
  }
  lines.push(sep());

  // ── Tech Stack ──
  lines.push(pc.bold(pc.underline("  Tech Stack")));
  lines.push(sep());
  if (info.techStack.languages.length > 0) {
    lines.push(row("Languages", info.techStack.languages.map((l) => pc.green(l)).join(", ")));
  }
  if (info.techStack.frameworks.length > 0) {
    lines.push(row("Frameworks", info.techStack.frameworks.map((f) => pc.yellow(f)).join(", ")));
  }
  if (info.techStack.database.length > 0) {
    lines.push(row("Database", info.techStack.database.map((d) => pc.blue(d)).join(", ")));
  }
  if (info.techStack.tools.length > 0) {
    const tools = info.techStack.tools.slice(0, 6);
    const toolStr = tools.map((t) => pc.magenta(t)).join(", ");
    lines.push(row("Tools", toolStr + (info.techStack.tools.length > 6 ? pc.dim(` +${info.techStack.tools.length - 6}`) : "")));
  }
  lines.push(sep());

  // ── Codebase Stats ──
  lines.push(pc.bold(pc.underline("  Codebase")));
  lines.push(sep());

  // Bar chart for file types
  const topTypes = Object.entries(info.structure.fileTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6);
  const maxCount = topTypes.length > 0 ? topTypes[0][1] : 0;

  if (topTypes.length > 0) {
    lines.push(row("Files", pc.white(String(info.structure.totalFiles)) + pc.dim(" across ") + pc.white(String(info.structure.totalDirs)) + pc.dim(" dirs")));
    lines.push("");
    for (const [ext, count] of topTypes) {
      const barLen = Math.max(1, maxCount > 0 ? Math.round((count / maxCount) * 20) : 1);
      const bar = pc.cyan("█".repeat(barLen) + pc.dim("░".repeat(Math.max(0, 20 - barLen))));
      const pct = info.structure.totalFiles > 0 ? Math.round((count / info.structure.totalFiles) * 100) : 0;
      lines.push(`   ${bar} ${pc.white(String(count))}${pc.dim(" (" + pct + "%) " + ext)}`);
    }
    lines.push("");
  } else {
    lines.push(row("Files", pc.white(String(info.structure.totalFiles)) + pc.dim(" across ") + pc.white(String(info.structure.totalDirs)) + pc.dim(" dirs")));
  }

  if (info.dependencies.total > 0) {
    lines.push(row("Deps", pc.white(String(info.dependencies.production)) + pc.dim(" prod, ") + pc.white(String(info.dependencies.development)) + pc.dim(" dev")));
  }

  // Locally-estimated total lines (from largest files)
  if (info.structure.largestFiles.length > 0) {
    const topLines = info.structure.largestFiles.slice(0, 3).map((f) => `${pc.dim(f.path)} ${pc.white(`${f.lines} lines`)}`);
    lines.push(row("Top files", topLines.join(pc.dim(" │ "))));
  }
  lines.push(sep());

  // ── Git ──
  if (hasGit) {
    lines.push(pc.bold(pc.underline("  Git")));
    lines.push(sep());

    const branch = info.git.branch ? pc.green(info.git.branch) : pc.dim("—");
    lines.push(row("Branch", branch));

    if (info.git.totalCommits !== null) {
      lines.push(row("Commits", pc.white(String(info.git.totalCommits))));
    }
    if (info.git.totalContributors !== null) {
      lines.push(row("Contributors", pc.white(String(info.git.totalContributors))));
    }
    if (info.git.totalBranches !== null) {
      lines.push(row("Branches", pc.white(String(info.git.totalBranches))));
    }
    if (info.git.totalTags !== null) {
      lines.push(row("Tags", pc.white(String(info.git.totalTags))));
    }
    if (info.git.lastCommitMessage) {
      lines.push(row("Head", pc.italic(pc.white(info.git.lastCommitMessage))));
    }
    if (info.git.lastCommitDate) {
      lines.push(row("Latest", pc.dim(formatTimeAgo(new Date(info.git.lastCommitDate)))));
    }
    if (info.git.createdDate) {
      lines.push(row("Born", pc.dim(new Date(info.git.createdDate).toLocaleDateString())));
    }
    if (info.git.totalAdditions !== null || info.git.totalDeletions !== null) {
      const add = info.git.totalAdditions ?? 0;
      const del = info.git.totalDeletions ?? 0;
      const total = add + del;
      const addPct = total > 0 ? Math.round((add / total) * 100) : 0;
      lines.push(row("Churn", pc.green(`+${add}`) + pc.dim(" / ") + pc.red(`-${del}`) + pc.dim(`  (${addPct}% added)`)));
    }
    if (info.git.repoSize) {
      lines.push(row("Size", pc.dim(info.git.repoSize)));
    }
    lines.push(sep());
  } else {
    lines.push(pc.dim("  (not a git repository)"));
    lines.push(sep());
  }

  // ── Footer ──
  lines.push("");
  lines.push(pc.dim("  Generated ") + new Date().toLocaleString());
  lines.push(pc.dim("  ⭐ github.com/AZERDSQ131/scope"));
  lines.push("");

  return lines.join("\n");
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${Math.floor(diffMonth / 12)}y ago`;
}
