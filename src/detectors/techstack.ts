import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, extname, basename } from "node:path";
import { TechStack } from "../types.js";

const CONFIG_PATTERNS: Record<string, RegExp> = {
  "package.json": /"(react|vue|next|nuxt|svelte|angular|express|fastify|nest|remix|gatsby|astro|solid|qwik|hono|elysia|fastify|loopback|adonis|sails|meteor|blitz|redwood)"/i,
  "Cargo.toml": /^(actix|axum|rocket|tide|warp|leptos|yew|dioxus|tauri|iced|egui|bevy)/im,
  "go.mod": /^(gin|echo|fiber|chi|mux|gorilla|revel|buffalo)/im,
  "Gemfile": /^(rails|sinatra|rack|hanami|jekyll)/i,
  "requirements.txt": /(django|flask|fastapi|starlette|bottle|tornado|aiohttp|sanic|pyramid)/i,
  "CMakeLists.txt": /qt|boost|opencv/i,
  "pubspec.yaml": /(flutter|dart)/i,
  "composer.json": /(laravel|symfony|codeigniter|cakephp|yii)/i,
  "build.gradle": /spring|micronaut|quarkus|grails/i,
  "mix.exs": /phoenix/i,
  "Project.toml": /julia/i,
  "Cargo.lock": /./,
  "yarn.lock": /./,
  "pnpm-lock.yaml": /./,
  "bun.lock": /./,
  "deno.json": /./,
};

const LANGUAGE_EXTENSIONS: Record<string, string> = {
  ".ts": "TypeScript",
  ".tsx": "TypeScript (React)",
  ".js": "JavaScript",
  ".jsx": "JavaScript (React)",
  ".py": "Python",
  ".rs": "Rust",
  ".go": "Go",
  ".java": "Java",
  ".kt": "Kotlin",
  ".swift": "Swift",
  ".rb": "Ruby",
  ".php": "PHP",
  ".cs": "C#",
  ".cpp": "C++",
  ".c": "C",
  ".h": "C/C++",
  ".hpp": "C++",
  ".zig": "Zig",
  ".scala": "Scala",
  ".elm": "Elm",
  ".clj": "Clojure",
  ".ex": "Elixir",
  ".exs": "Elixir",
  ".erl": "Erlang",
  ".hs": "Haskell",
  ".ml": "OCaml",
  ".r": "R",
  ".dart": "Dart",
  ".lua": "Lua",
  ".vue": "Vue",
  ".svelte": "Svelte",
  ".astro": "Astro",
  ".wasm": "WebAssembly",
  ".nu": "Nushell",
  ".sh": "Shell",
  ".bash": "Shell",
  ".zsh": "Shell",
  ".fish": "Shell",
  ".ps1": "PowerShell",
  ".sql": "SQL",
  ".graphql": "GraphQL",
  ".prisma": "Prisma",
  ".tf": "Terraform",
  ".yaml": "YAML",
  ".yml": "YAML",
  ".toml": "TOML",
  ".json": "JSON",
  ".md": "Markdown",
  ".css": "CSS",
  ".scss": "SCSS",
  ".less": "Less",
  ".html": "HTML",
  ".dockerfile": "Docker",
  ".cmake": "CMake",
  ".make": "Makefile",
};

const FRAMEWORK_PATTERNS: Array<{ name: string; test: (dir: string) => boolean }> = [
  { name: "Next.js", test: (d) => existsSync(join(d, "next.config.js")) || existsSync(join(d, "next.config.mjs")) || existsSync(join(d, "next.config.ts")) },
  { name: "Vue.js", test: (d) => existsSync(join(d, "vue.config.js")) || existsSync(join(d, "nuxt.config.js")) || existsSync(join(d, "nuxt.config.ts")) },
  { name: "Nuxt", test: (d) => existsSync(join(d, "nuxt.config.ts")) || existsSync(join(d, "nuxt.config.js")) },
  { name: "SvelteKit", test: (d) => existsSync(join(d, "svelte.config.js")) || existsSync(join(d, "svelte.config.ts")) },
  { name: "Astro", test: (d) => existsSync(join(d, "astro.config.mjs")) || existsSync(join(d, "astro.config.ts")) },
  { name: "SolidJS", test: (d) => existsSync(join(d, "solid.config.js")) || existsSync(join(d, "vite.config.ts")) && hasDependency(d, "solid-js") },
  { name: "Remix", test: (d) => existsSync(join(d, "remix.config.js")) || existsSync(join(d, "remix.config.ts")) },
  { name: "Gatsby", test: (d) => existsSync(join(d, "gatsby-config.js")) || existsSync(join(d, "gatsby-config.ts")) },
  { name: "Express", test: (d) => hasDependency(d, "express") },
  { name: "Fastify", test: (d) => hasDependency(d, "fastify") },
  { name: "NestJS", test: (d) => existsSync(join(d, "nest-cli.json")) || hasDependency(d, "@nestjs/core") },
  { name: "Hono", test: (d) => hasDependency(d, "hono") },
  { name: "Elysia", test: (d) => hasDependency(d, "elysia") },
  { name: "React", test: (d) => hasDependency(d, "react") },
  { name: "Django", test: (d) => existsSync(join(d, "manage.py")) || hasDependency(d, "django") },
  { name: "Flask", test: (d) => hasDependency(d, "flask") },
  { name: "FastAPI", test: (d) => hasDependency(d, "fastapi") },
  { name: "Rails", test: (d) => !!existsSync(join(d, "Gemfile")) && !!readIfExists(d, "Gemfile")?.includes("rails") },
  { name: "Laravel", test: (d) => existsSync(join(d, "artisan")) },
  { name: "Spring Boot", test: (d) => !!existsSync(join(d, "pom.xml")) && !!readIfExists(d, "pom.xml")?.includes("spring-boot") },
  { name: "Rocket", test: (d) => { try { return readIfExists(d, "Cargo.toml")?.includes("rocket") ?? false; } catch { return false; }}},
  { name: "Axum", test: (d) => { try { return readIfExists(d, "Cargo.toml")?.includes("axum") ?? false; } catch { return false; }}},
  { name: "Gin", test: (d) => { try { return readIfExists(d, "go.mod")?.includes("gin") ?? false; } catch { return false; }}},
  { name: "Echo", test: (d) => { try { return readIfExists(d, "go.mod")?.includes("echo") ?? false; } catch { return false; }}},
  { name: "Fiber", test: (d) => { try { return readIfExists(d, "go.mod")?.includes("fiber") ?? false; } catch { return false; }}},
  { name: "Tauri", test: (d) => hasDependency(d, "tauri") || existsSync(join(d, "src-tauri")) },
  { name: "Electron", test: (d) => hasDependency(d, "electron") },
  { name: "Prisma", test: (d) => hasDependency(d, "prisma") || existsSync(join(d, "schema.prisma")) },
  { name: "Drizzle", test: (d) => hasDependency(d, "drizzle-orm") },
  { name: "Tailwind CSS", test: (d) => hasDependency(d, "tailwindcss") || existsSync(join(d, "tailwind.config.js")) || existsSync(join(d, "tailwind.config.ts")) },
  { name: "Bootstrap", test: (d) => hasDependency(d, "bootstrap") },
  { name: "Shadcn/ui", test: (d) => existsSync(join(d, "components.json")) || hasDependency(d, "@radix-ui") },
];

const TOOL_PATTERNS: Array<{ name: string; test: (dir: string) => boolean }> = [
  { name: "Docker", test: (d) => existsSync(join(d, "Dockerfile")) || existsSync(join(d, "docker-compose.yml")) || existsSync(join(d, "docker-compose.yaml")) },
  { name: "GitHub Actions", test: (d) => existsSync(join(d, ".github/workflows")) },
  { name: "ESLint", test: (d) => existsSync(join(d, ".eslintrc")) || existsSync(join(d, ".eslintrc.json")) || existsSync(join(d, ".eslintrc.js")) || hasDependency(d, "eslint") },
  { name: "Prettier", test: (d) => existsSync(join(d, ".prettierrc")) || existsSync(join(d, ".prettierrc.json")) || hasDependency(d, "prettier") },
  { name: "Biome", test: (d) => existsSync(join(d, "biome.json")) || hasDependency(d, "@biomejs/biome") },
  { name: "Jest", test: (d) => hasDependency(d, "jest") },
  { name: "Vitest", test: (d) => hasDependency(d, "vitest") },
  { name: "Playwright", test: (d) => hasDependency(d, "@playwright/test") || hasDependency(d, "playwright") },
  { name: "Cypress", test: (d) => hasDependency(d, "cypress") },
  { name: "pnpm", test: (d) => existsSync(join(d, "pnpm-lock.yaml")) },
  { name: "Yarn", test: (d) => existsSync(join(d, "yarn.lock")) },
  { name: "Bun", test: (d) => existsSync(join(d, "bun.lock")) || existsSync(join(d, "bun.lockb")) },
  { name: "Deno", test: (d) => existsSync(join(d, "deno.json")) || existsSync(join(d, "deno.jsonc")) },
  { name: "Turborepo", test: (d) => hasDependency(d, "turbo") || existsSync(join(d, "turbo.json")) },
  { name: "Nx", test: (d) => existsSync(join(d, "nx.json")) || hasDependency(d, "@nx/workspace") },
  { name: "Storybook", test: (d) => existsSync(join(d, ".storybook")) || hasDependency(d, "@storybook/react") },
  { name: "Vite", test: (d) => hasDependency(d, "vite") },
  { name: "Webpack", test: (d) => hasDependency(d, "webpack") },
  { name: "tRPC", test: (d) => hasDependency(d, "@trpc/server") },
  { name: "Redis", test: (d) => hasDependency(d, "redis") || hasDependency(d, "ioredis") },
  { name: "PostgreSQL", test: (d) => hasDependency(d, "pg") || hasDependency(d, "postgres") || hasDependency(d, "@prisma/client") },
  { name: "MongoDB", test: (d) => hasDependency(d, "mongoose") || hasDependency(d, "mongodb") },
  { name: "SQLite", test: (d) => hasDependency(d, "better-sqlite3") || hasDependency(d, "sqlite3") },
  { name: "GraphQL", test: (d) => hasDependency(d, "graphql") || hasDependency(d, "@apollo/client") },
  { name: "OpenAPI", test: (d) => existsSync(join(d, "openapi.yaml")) || existsSync(join(d, "openapi.yml")) || existsSync(join(d, "swagger.yaml")) },
  { name: "Auth.js", test: (d) => hasDependency(d, "@auth/core") || hasDependency(d, "next-auth") },
  { name: "Clerk", test: (d) => hasDependency(d, "@clerk/nextjs") || hasDependency(d, "@clerk/clerk-react") },
  { name: "Stripe", test: (d) => hasDependency(d, "stripe") },
];

const DATABASE_PATTERNS: Array<{ name: string; test: (dir: string) => boolean }> = [
  { name: "PostgreSQL", test: (d) => hasDependency(d, "pg", "postgres", "@prisma/client") },
  { name: "MySQL", test: (d) => hasDependency(d, "mysql", "mysql2") },
  { name: "SQLite", test: (d) => hasDependency(d, "better-sqlite3", "sqlite3") },
  { name: "MongoDB", test: (d) => hasDependency(d, "mongoose", "mongodb") },
  { name: "Redis", test: (d) => hasDependency(d, "redis", "ioredis") },
  { name: "Supabase", test: (d) => hasDependency(d, "@supabase/supabase-js") },
  { name: "Firebase", test: (d) => hasDependency(d, "firebase") },
  { name: "PlanetScale", test: (d) => hasDependency(d, "@planetscale/database") },
  { name: "Neon", test: (d) => hasDependency(d, "@neondatabase/serverless") },
  { name: "Turso", test: (d) => hasDependency(d, "@libsql/client") },
  { name: "DynamoDB", test: (d) => hasDependency(d, "@aws-sdk/client-dynamodb") },
];

function hasDependency(dir: string, ...names: string[]): boolean {
  try {
    const pkgPath = join(dir, "package.json");
    if (!existsSync(pkgPath)) return false;
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));
    const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
    return names.some((n) => n in allDeps);
  } catch {
    return false;
  }
}

function readIfExists(dir: string, file: string): string | null {
  try {
    const path = join(dir, file);
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

export function detectTechStack(projectDir: string): TechStack {
  const languages = new Set<string>();
  const frameworks: string[] = [];
  const tools: string[] = [];
  const database: string[] = [];

  // Detect languages from file extensions (sample first 500 files)
  try {
    const allFiles = getAllFiles(projectDir, 500);
    for (const file of allFiles) {
      const ext = extname(file).toLowerCase();
      if (ext in LANGUAGE_EXTENSIONS) {
        languages.add(LANGUAGE_EXTENSIONS[ext]);
      }
      const base = basename(file).toLowerCase();
      if (base === "dockerfile") languages.add("Docker");
      if (base === "makefile") languages.add("Make");
    }
  } catch {}

  // Detect frameworks
  for (const fw of FRAMEWORK_PATTERNS) {
    try {
      if (fw.test(projectDir)) frameworks.push(fw.name);
    } catch {}
  }

  // Detect tools
  for (const tool of TOOL_PATTERNS) {
    try {
      if (tool.test(projectDir)) tools.push(tool.name);
    } catch {}
  }

  // Detect databases
  for (const db of DATABASE_PATTERNS) {
    try {
      if (db.test(projectDir)) database.push(db.name);
    } catch {}
  }

  return {
    languages: Array.from(languages).slice(0, 8),
    frameworks: frameworks.slice(0, 8),
    tools: tools.slice(0, 12),
    database: database.slice(0, 6),
  };
}

function getAllFiles(dir: string, max: number): string[] {
  const results: string[] = [];
  const IGNORE = new Set([
    "node_modules", ".git", "dist", "build", ".next", ".nuxt",
    "target", "vendor", ".cache", "coverage", ".vercel", ".turbo",
    "__pycache__", ".pytest_cache", ".eggs", "egg-info",
    "Pods", ".gradle", "bin", "obj", ".swc", ".serverless",
  ]);

  function walk(current: string) {
    if (results.length >= max) return;
    let entries;
    try {
      entries = readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      if (results.length >= max) return;
      const name = entry.name;
      if (IGNORE.has(name) || name.startsWith(".")) continue;
      const fullPath = join(current, name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results.slice(0, max);
}
