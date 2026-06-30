import { readdirSync, statSync, readFileSync } from "node:fs";
import { join, extname } from "node:path";
import { ProjectStructure } from "../types.js";

const IGNORE_DIRS = new Set([
  "node_modules", ".git", "dist", "build", ".next", ".nuxt",
  "target", "vendor", ".cache", "coverage", ".vercel", ".turbo",
  "__pycache__", ".pytest_cache", ".eggs", "egg-info",
  "Pods", ".gradle", "bin", "obj", ".swc", ".serverless",
  ".gitlab", "assets", "public", ".claude",
  ".venv", "venv", "env", ".env", "site-packages",
  ".dart_tool", ".packages", "bower_components",
  "jspm_packages", ".npm", ".yarn", ".pnp",
  "third_party", "third-party",
]);

const MAX_FILES_TO_COUNT = 100_000;
const MAX_FILES_TO_READ_CONTENT = 2000;

export function detectStructure(projectDir: string): ProjectStructure {
  let totalFiles = 0;
  let totalDirs = 0;
  const fileTypes: Record<string, number> = {};
  const fileSizes: { path: string; lines: number }[] = [];

  function walk(current: string, depth = 0) {
    if (depth > 8) return;
    if (totalFiles >= MAX_FILES_TO_COUNT) return;
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const name = entry.name;
      if (IGNORE_DIRS.has(name) || name.startsWith(".")) continue;
      const fullPath = join(current, name);
      try {
        if (entry.isDirectory()) {
          totalDirs++;
          walk(fullPath, depth + 1);
        } else if (entry.isFile()) {
          totalFiles++;
          const ext = extname(name).toLowerCase() || "(no extension)";
          fileTypes[ext] = (fileTypes[ext] || 0) + 1;

          // Track large files (limit to avoid perf issues)
          if (totalFiles <= MAX_FILES_TO_READ_CONTENT) {
            const stats = statSync(fullPath);
            if (stats.size > 0 && stats.size < 1_000_000) {
              const content = readFileSync(fullPath, "utf-8");
              const lines = content.split("\n").length;
              fileSizes.push({ path: fullPath.replace(projectDir, "").slice(1), lines });
            }
          }
        }
      } catch {
        // skip files we can't read
      }
    }
  }

  walk(projectDir);

  // Sort by lines descending, take top 10
  fileSizes.sort((a, b) => b.lines - a.lines);

  return {
    totalFiles,
    totalDirs,
    fileTypes,
    largestFiles: fileSizes.slice(0, 10),
  };
}
