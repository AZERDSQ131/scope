<div align="center">
  <br/>
  <pre>
        ╱★╲
       ╱   ╲     neofetch for your codebase
      ╱     ╲
     ╱  SCOPE ╲          Instant project insights
    ╱___________╲            from your terminal
  </pre>
  <br/>

  <p>
    <b>scope</b> — instantly see the full picture of any codebase:
    tech stack, git history, file structure, and dependencies.
    One command, zero configuration.
  </p>

  <br/>

  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#examples">Examples</a> •
    <a href="#options">Options</a> •
    <a href="#installation">Installation</a>
  </p>

  <br/>

  <p>
    <a href="https://www.npmjs.com/package/@azerdsq131/scope">
      <img src="https://img.shields.io/npm/v/@azerdsq131/scope?style=flat-square" alt="npm version"/>
    </a>
    <a href="https://github.com/AZERDSQ131/scope/actions/workflows/ci.yml">
      <img src="https://img.shields.io/github/actions/workflow/status/AZERDSQ131/scope/ci.yml?branch=main&style=flat-square" alt="CI"/>
    </a>
    <a href="https://github.com/AZERDSQ131/scope">
      <img src="https://img.shields.io/github/stars/AZERDSQ131/scope?style=flat-square" alt="stars"/>
    </a>
    <a href="https://github.com/AZERDSQ131/scope/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/AZERDSQ131/scope?style=flat-square" alt="license"/>
    </a>
  </p>

  <br/>

  <img src="assets/demo.svg" alt="Scope terminal output" width="100%" max-width="800px"/>

  <br/><br/>

  <a href="https://star-history.com/#AZERDSQ131/scope&Date">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=AZERDSQ131/scope&type=Date&theme=dark" />
      <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=AZERDSQ131/scope&type=Date" />
      <img alt="Star History Chart" src="https://api.star-history.com/svg?repos=AZERDSQ131/scope&type=Date" width="400" />
    </picture>
  </a>

  <br/>
</div>

---

## Features

- **Tech Stack Detection** — Automatically identifies languages, frameworks, databases, and tools used in any project
- **Git Insights** — Branch, commit count, contributors, churn, repo age, and more
- **File Structure Analysis** — Total files, directories, file type distribution with visual bar charts
- **Dependency Overview** — Production vs development dependencies at a glance
- **Beautiful Terminal Output** — Clean, color-coded, and easy to read
- **HTML Reports** — Generate shareable HTML reports you can host or print
- **JSON Export** — Perfect for CI/CD pipelines and AI coding assistants
- **Markdown Export** — Great for documentation and sharing context

## Quick Start

```bash
# Run anywhere — no install needed
npx @azerdsq131/scope

# Or install globally
npm install -g @azerdsq131/scope
scope
```

That's it. Run it in any project directory and get a complete overview instantly.

## Examples

### Basic usage

```bash
# Current directory
npx scope

# Specific project
npx scope ~/projects/my-app

# JSON output (great for AI context)
npx scope --json

# Markdown output
npx scope --markdown

# HTML report (great for docs/CI)
npx scope --html --output report.html
```

### Sample output

```
        ╱★╲
       ╱   ╲     neofetch for your codebase
      ╱     ╲
     ╱  SCOPE ╲          v1.0.0
    ╱___________╲

  Project
────────────────────────────────────────────────
  Name          my-awesome-project
  Packages      via pnpm
────────────────────────────────────────────────
  Tech Stack
────────────────────────────────────────────────
  Languages     TypeScript, JavaScript, CSS, HTML
  Frameworks   Next.js, React, Tailwind CSS
  Database     PostgreSQL, Redis
  Tools        Docker, ESLint, Vitest, Playwright
────────────────────────────────────────────────
  Codebase
────────────────────────────────────────────────
  Files         1,284 across 47 dirs

   ████████████████████ 420 (33%) .ts
   ██████████████░░░░░░ 280 (22%) .tsx
   ████████░░░░░░░░░░░░ 156 (12%) .css
   ██████░░░░░░░░░░░░░░ 120 (9%)  .json
   ████░░░░░░░░░░░░░░░░  89 (7%)  .md
   ██░░░░░░░░░░░░░░░░░░  42 (3%)  .js

  Deps          42 prod, 89 dev
────────────────────────────────────────────────
  Git
────────────────────────────────────────────────
  Branch        main
  Commits      1,847
  Contributors 12
  Branches     8
  Tags         5
  Head         feat: add dark mode support
  Latest       2h ago
  Born         1/15/2024
  Churn        +89,420 / -42,180  (68% added)
  Size         24 MiB
────────────────────────────────────────────────

  Generated 6/30/2026, 10:45 PM
  npx scope to explore any project
```

## Options

| Option | Description |
|--------|-------------|
| `[directory]` | Project directory to analyze (default: `.`) |
| `-j, --json` | Output as JSON |
| `-m, --markdown` | Output as Markdown |
| `-h, --html` | Output as HTML report |
| `-o, --output <file>` | Save output to a file |
| `-n, --name <name>` | Override project name |
| `--help` | Show help |
| `--version` | Show version |

## Installation

### One-shot (recommended)

```bash
npx @azerdsq131/scope
```

### Global install

```bash
npm install -g @azerdsq131/scope
```

### Using other package managers

```bash
# pnpm
pnpm add -g @azerdsq131/scope

# yarn
yarn global add @azerdsq131/scope

# bun
bun add -g @azerdsq131/scope
```

## Use Cases

**👀 Explore new projects** — Clone a repo and immediately understand its structure and tech stack

**🤖 Feed AI coding assistants** — Use `scope --json` or `scope --markdown` to give Claude Code, Cursor, or Copilot full project context

**🔍 Code review prep** — Understand the scope of changes and project health before diving into code review

**📋 Documentation** — Generate markdown summaries of project structure for team docs

**📊 CI/CD dashboards** — Output JSON for custom dashboards and project tracking

## How It Works

Scope scans your project directory and git history to build a comprehensive profile. It uses:

- **File extension analysis** to detect programming languages
- **Config file detection** (package.json, Cargo.toml, go.mod, etc.) to identify frameworks and tools
- **Git commands** (no library dependency) for repository statistics
- **Directory traversal** for file structure and size analysis

Everything runs locally — zero network calls, zero telemetry.

## Contributing

Contributions are welcome! Check the [issues page](https://github.com/AZERDSQ131/scope/issues) for ideas or open a PR.

## License

MIT — see [LICENSE](LICENSE) for details.
