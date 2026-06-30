import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { Dependencies } from "../types.js";

export function detectDependencies(projectDir: string): Dependencies {
  const pkgPath = join(projectDir, "package.json");

  if (!existsSync(pkgPath)) {
    return { total: 0, production: 0, development: 0, outdated: null, hasVulnerabilities: null };
  }

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    const prod = pkg.dependencies ? Object.keys(pkg.dependencies).length : 0;
    const dev = pkg.devDependencies ? Object.keys(pkg.devDependencies).length : 0;

    return {
      total: prod + dev,
      production: prod,
      development: dev,
      outdated: null, // Would require `npm outdated` which is slow
      hasVulnerabilities: null, // Would require `npm audit`
    };
  } catch {
    return { total: 0, production: 0, development: 0, outdated: null, hasVulnerabilities: null };
  }
}

export function detectPackageManager(projectDir: string): string | null {
  if (existsSync(join(projectDir, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(join(projectDir, "bun.lock")) || existsSync(join(projectDir, "bun.lockb"))) return "bun";
  if (existsSync(join(projectDir, "yarn.lock"))) return "yarn";
  if (existsSync(join(projectDir, "package-lock.json"))) return "npm";
  if (existsSync(join(projectDir, "deno.json")) || existsSync(join(projectDir, "deno.jsonc"))) return "deno";
  return null;
}
