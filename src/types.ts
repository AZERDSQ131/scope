export interface ProjectInfo {
  name: string;
  path: string;
  techStack: TechStack;
  structure: ProjectStructure;
  git: GitInfo;
  dependencies: Dependencies;
  packageManager: string | null;
}

export interface TechStack {
  languages: string[];
  frameworks: string[];
  tools: string[];
  database: string[];
}

export interface ProjectStructure {
  totalFiles: number;
  totalDirs: number;
  fileTypes: Record<string, number>;
  largestFiles: { path: string; lines: number }[];
}

export interface GitInfo {
  isRepo: boolean;
  branch: string | null;
  totalCommits: number | null;
  totalContributors: number | null;
  lastCommitDate: string | null;
  lastCommitMessage: string | null;
  totalBranches: number | null;
  totalTags: number | null;
  repoSize: string | null;
  totalAdditions: number | null;
  totalDeletions: number | null;
  createdDate: string | null;
}

export interface Dependencies {
  total: number;
  production: number;
  development: number;
  outdated: number | null;
  hasVulnerabilities: boolean | null;
}

export interface ScopeOutput {
  project: ProjectInfo;
  generatedAt: string;
  version: string;
}
