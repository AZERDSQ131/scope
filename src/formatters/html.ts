import { ProjectInfo } from "../types.js";

export function formatHTML(info: ProjectInfo): string {
  const topTypes = Object.entries(info.structure.fileTypes)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);
  const maxCount = topTypes.length > 0 ? topTypes[0][1] : 1;

  const barCharts = topTypes
    .map(
      ([ext, count]) =>
        `<div class="bar-row"><span class="bar-label">${ext}</span><div class="bar-bg"><div class="bar-fill" style="width:${(count / maxCount) * 100}%"></div></div><span class="bar-count">${count}</span></div>`
    )
    .join("");

  const gitSection = info.git.isRepo
    ? `
    <div class="card">
      <h2>Git</h2>
      <table>
        ${info.git.branch ? `<tr><td>Branch</td><td>${info.git.branch}</td></tr>` : ""}
        ${info.git.totalCommits !== null ? `<tr><td>Commits</td><td>${info.git.totalCommits.toLocaleString()}</td></tr>` : ""}
        ${info.git.totalContributors !== null ? `<tr><td>Contributors</td><td>${info.git.totalContributors}</td></tr>` : ""}
        ${info.git.lastCommitMessage ? `<tr><td>Head</td><td><code>${info.git.lastCommitMessage}</code></td></tr>` : ""}
        ${info.git.lastCommitDate ? `<tr><td>Latest activity</td><td>${new Date(info.git.lastCommitDate).toLocaleString()}</td></tr>` : ""}
        ${info.git.createdDate ? `<tr><td>Created</td><td>${new Date(info.git.createdDate).toLocaleDateString()}</td></tr>` : ""}
      </table>
    </div>`
    : "";

  const langColors: Record<string, string> = {
    TypeScript: "#3178c6",
    JavaScript: "#f7df1e",
    Python: "#3572a5",
    Rust: "#dea584",
    Go: "#00add8",
    Java: "#b07219",
    Ruby: "#701516",
    PHP: "#4f5d95",
    CSS: "#563d7c",
    HTML: "#e34c26",
    Shell: "#89e051",
    JSON: "#292929",
    Markdown: "#083fa1",
  };

  const langBadges = info.techStack.languages
    .map((l) => {
      const color = langColors[l] || "#6b7280";
      return `<span class="badge" style="background:${color}20;color:${color};border:1px solid ${color}40">${l}</span>`;
    })
    .join(" ");

  const fwBadges = info.techStack.frameworks
    .map((f) => `<span class="badge" style="background:#d2992215;color:#d29922;border:1px solid #d2992240">${f}</span>`)
    .join(" ");

  const toolBadges = info.techStack.tools
    .slice(0, 12)
    .map((t) => `<span class="badge" style="background:#bc8cff15;color:#bc8cff;border:1px solid #bc8cff40">${t}</span>`)
    .join(" ");

  const dbBadges = info.techStack.database
    .map((d) => `<span class="badge" style="background:#58a6ff15;color:#58a6ff;border:1px solid #58a6ff40">${d}</span>`)
    .join(" ");

  const topFiles = info.structure.largestFiles
    .slice(0, 5)
    .map((f) => `<tr><td class="dim">${f.path}</td><td style="text-align:right">${f.lines.toLocaleString()} lines</td></tr>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scope Report — ${info.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0d1117;
      color: #c9d1d9;
      line-height: 1.6;
      padding: 2rem;
    }
    .container { max-width: 800px; margin: 0 auto; }
    h1 { color: #f0f6fc; font-size: 1.8rem; margin-bottom: 0.5rem; }
    .subtitle { color: #8b949e; font-size: 0.9rem; margin-bottom: 2rem; }
    .card {
      background: #161b22;
      border: 1px solid #30363d;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 1rem;
    }
    .card h2 { color: #f0f6fc; font-size: 1rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 0.4rem 0; border-bottom: 1px solid #21262d; }
    td:first-child { color: #8b949e; width: 140px; }
    td:last-child { color: #e6edf3; }
    .dim { color: #8b949e !important; }
    .badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.8rem;
      margin: 0.2rem;
    }
    .bar-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; }
    .bar-label { width: 80px; font-size: 0.8rem; color: #8b949e; text-align: right; font-family: monospace; }
    .bar-bg { flex: 1; height: 20px; background: #21262d; border-radius: 4px; overflow: hidden; }
    .bar-fill { height: 100%; background: #58a6ff; border-radius: 4px; transition: width 0.3s; }
    .bar-count { width: 50px; font-size: 0.8rem; color: #e6edf3; font-family: monospace; }
    .footer { text-align: center; padding: 2rem; color: #484f58; font-size: 0.85rem; }
    .footer a { color: #58a6ff; }
    .meta { display: flex; gap: 1rem; flex-wrap: wrap; }
    .meta-item { flex: 1; min-width: 120px; background: #0d1117; border: 1px solid #21262d; border-radius: 6px; padding: 1rem; text-align: center; }
    .meta-value { font-size: 1.5rem; font-weight: 700; color: #f0f6fc; }
    .meta-label { font-size: 0.75rem; color: #8b949e; text-transform: uppercase; margin-top: 0.2rem; }
    code { background: #21262d; padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85rem; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${info.name}</h1>
    <p class="subtitle">Scope Report — generated ${new Date().toLocaleString()}</p>

    <div class="meta">
      <div class="meta-item">
        <div class="meta-value">${info.structure.totalFiles.toLocaleString()}</div>
        <div class="meta-label">Files</div>
      </div>
      <div class="meta-item">
        <div class="meta-value">${info.structure.totalDirs.toLocaleString()}</div>
        <div class="meta-label">Directories</div>
      </div>
      <div class="meta-item">
        <div class="meta-value">${info.dependencies.total}</div>
        <div class="meta-label">Dependencies</div>
      </div>
      ${info.git.totalCommits !== null ? `<div class="meta-item"><div class="meta-value">${info.git.totalCommits.toLocaleString()}</div><div class="meta-label">Commits</div></div>` : ""}
      ${info.git.totalContributors !== null ? `<div class="meta-item"><div class="meta-value">${info.git.totalContributors}</div><div class="meta-label">Contributors</div></div>` : ""}
    </div>

    ${langBadges || fwBadges ? `<div class="card"><h2>Tech Stack</h2><div style="margin-bottom:0.5rem">${langBadges}</div><div style="margin-bottom:0.5rem">${fwBadges}</div>${toolBadges ? `<div style="margin-bottom:0.5rem">${toolBadges}</div>` : ""}${dbBadges ? `<div>${dbBadges}</div>` : ""}</div>` : ""}

    <div class="card">
      <h2>File Types</h2>
      ${barCharts}
    </div>

    ${gitSection}

    ${topFiles.length > 0 ? `<div class="card"><h2>Largest Files</h2><table>${topFiles}</table></div>` : ""}

    <div class="card">
      <h2>Info</h2>
      <table>
        ${info.packageManager ? `<tr><td>Package manager</td><td>${info.packageManager}</td></tr>` : ""}
        <tr><td>Dependencies</td><td>${info.dependencies.production} production, ${info.dependencies.development} development</td></tr>
        <tr><td>Generated by</td><td><a href="https://github.com/AZERDSQ131/scope">Scope</a></td></tr>
      </table>
    </div>

    <div class="footer">
      <p>Generated by <a href="https://github.com/AZERDSQ131/scope">scope</a> — neofetch for your codebase</p>
    </div>
  </div>
</body>
</html>`;
}
