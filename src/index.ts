#!/usr/bin/env node

import { program } from "commander";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { detectTechStack } from "./detectors/techstack.js";
import { detectGitInfo } from "./detectors/git.js";
import { detectStructure } from "./detectors/structure.js";
import { detectDependencies, detectPackageManager } from "./detectors/deps.js";
import { formatTerminal } from "./formatters/terminal.js";
import { formatJSON, formatMarkdown } from "./formatters/json.js";
import { formatHTML } from "./formatters/html.js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ScopeOptions {
  json?: boolean;
  markdown?: boolean;
  html?: boolean;
  output?: string;
  name?: string;
}

function getVersion(): string {
  try {
    const pkgPath = join(__dirname, "..", "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    return pkg.version || "1.0.0";
  } catch {
    return "1.0.0";
  }
}

program
  .name("scope")
  .description("🏔️ neofetch for your codebase — beautiful project overview in your terminal")
  .version(getVersion())
  .argument("[directory]", "Project directory to analyze", ".")
  .option("-j, --json", "Output as JSON")
  .option("-m, --markdown", "Output as Markdown (great for AI context)")
  .option("-h, --html", "Output as HTML report")
  .option("-o, --output <file>", "Save output to a file")
  .option("-n, --name <name>", "Override project name")
  .action(async (directory: string, options: ScopeOptions) => {
    try {
      const projectDir = resolve(process.cwd(), directory);

      if (!existsSync(projectDir)) {
        console.error(`Error: Directory "${projectDir}" does not exist`);
        process.exit(1);
      }

      const projectName = options.name || getProjectName(projectDir);

      // Gather all data
      const [techStack, git, structure, deps] = await Promise.all([
        Promise.resolve(detectTechStack(projectDir)),
        Promise.resolve(detectGitInfo(projectDir)),
        Promise.resolve(detectStructure(projectDir)),
        Promise.resolve(detectDependencies(projectDir)),
      ]);

      const packageManager = detectPackageManager(projectDir);

      const projectInfo = {
        name: projectName,
        path: projectDir,
        techStack,
        structure,
        git,
        dependencies: deps,
        packageManager,
      };

      const outputData = {
        project: projectInfo,
        generatedAt: new Date().toISOString(),
        version: getVersion(),
      };

      // Format output
      let output: string;
      if (options.json) {
        output = formatJSON(outputData) + "\n";
      } else if (options.markdown) {
        output = formatMarkdown(projectInfo) + "\n";
      } else if (options.html) {
        output = formatHTML(projectInfo) + "\n";
      } else {
        output = formatTerminal({ ...projectInfo, version: getVersion() });
      }

      // Write or print
      if (options.output) {
        const outputPath = resolve(process.cwd(), options.output);
        const fs = await import("node:fs");
        fs.writeFileSync(outputPath, output, "utf-8");
        console.error(`✨ Written to ${outputPath}`);
      } else {
        console.log(output);
      }
    } catch (error) {
      console.error("Error:", error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

function getProjectName(dir: string): string {
  try {
    const pkgPath = join(dir, "package.json");
    if (existsSync(pkgPath)) {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
      if (pkg.name) return pkg.name;
    }
  } catch {}
  return dir.split("/").pop() || dir.split("\\").pop() || "unknown";
}

program.parse();
