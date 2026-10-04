import type {
  AnalysisRecord,
  ExampleCard,
  HistoryItem,
  SkillRecord,
  TemplateRecord,
} from "@/lib/types";

const SKILL_MD = `---
name: debug-module-resolution
description: Diagnose and resolve frontend module resolution errors.
version: 1.0.0
author: TraceForge
license: Apache-2.0
---

# Debug Module Resolution

## Overview

This skill helps diagnose and fix module resolution errors
in frontend projects (Vite, Next.js, Webpack, etc.).

## When to use

- Build fails with "Cannot find module ..."
- Import path or alias not resolving
- Component moved or renamed
- Incorrect file extension or casing

## Steps

1. Inspect the error message.
2. Identify unresolved imports.
3. Check project path aliases (\`tsconfig.json\`, \`vite.config.ts\`, etc.).
4. Verify file location and filename casing.
5. Update import paths if needed.
6. Run the production build.
7. Validate tests after the fix.
`;

const TROUBLESHOOTING_MD = `# Troubleshooting module resolution

- Confirm the file exists at the aliased path.
- Keep tsconfig paths and bundler aliases in sync.
- Watch for case-sensitive paths on CI.
`;

export const PRIMARY_ANALYSIS_ID = "analysis-001";

export const analyses: AnalysisRecord[] = [
  {
    id: PRIMARY_ANALYSIS_ID,
    title: "GitHub Actions build error",
    issueType: "Module Resolution",
    status: "Completed",
    date: "Oct 2, 2026",
    time: "11:30 AM",
    error: "Cannot find module '@components/Button'",
    description: "Deployment started failing after I moved some components.",
    confidence: "High",
    issueDetected: "Module resolution error during production build.",
    whatIsHappening:
      "The build process cannot find the module '@components/Button'.",
    likelyCause:
      "Incorrect import path or missing path alias after moving components.",
    whyLikely:
      "The user recently moved components, and either the import path or alias did not get updated in all files. The build is failing because the resolved path no longer exists.",
    additionalContext:
      "This error commonly occurs after refactoring or moving files. In monorepos or aliased paths, ensure that tsconfig.json and your bundler configuration (e.g. Vite, Webpack, Next.js) are in sync.",
    evidence: [
      "Error shows '@components/Button' cannot be resolved",
      "Failure occurs during production build",
      "User reports a recent component move",
    ],
    reproductionSteps: [
      "Move Button component",
      "Run npm run build",
      "Build fails during module resolution",
    ],
    suggestedFix: "Check tsconfig path aliases and import paths.",
    validationChecklist: [
      "Run npm run build",
      "Run npm run test",
      "Verify deployment succeeds",
    ],
    references: [
      {
        title: "TypeScript path mapping",
        detail: "compilerOptions.paths must match the moved component directory.",
      },
      {
        title: "Next.js / Vite aliases",
        detail: "Bundler alias config should mirror tsconfig.json.",
      },
      {
        title: "CI case sensitivity",
        detail: "GitHub Actions runners treat Button.tsx and button.tsx as different files.",
      },
    ],
    fixSteps: [
      {
        title: "Check tsconfig path aliases",
        description:
          "Ensure the @components alias points to the correct directory.",
        filename: "tsconfig.json",
        language: "json",
        code: `{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@components/*": ["./src/components/*"]
    }
  }
}`,
      },
      {
        title: "Update import paths",
        description:
          "Make sure the import path matches the actual file location.",
        filename: "src/pages/index.tsx",
        language: "tsx",
        code: `// before
import Button from '@components/Button'

// after (if alias removed)
import Button from '../components/Button'`,
      },
      {
        title: "Run production build",
        description:
          "After updating the paths, run the build to verify the fix.",
        filename: "Terminal",
        language: "bash",
        code: "npm run build",
      },
    ],
    originalInput: {
      source: "GitHub Actions",
      subtitle: "Deploy Production",
      errorLines: [
        "Build failed",
        "Error: Cannot find module",
        "'@components/Button'",
      ],
      fileRef: "src/pages/index.tsx:12",
    },
    skillId: "debug-module-resolution",
  },
  {
    id: "analysis-002",
    title: "Database connection error",
    issueType: "Database",
    status: "Completed",
    date: "Oct 1, 2026",
    time: "4:20 PM",
    error: "Postgres timeout in production.",
    description: "Postgres timeout in production.",
    confidence: "High",
    issueDetected: "Database connection timeout under production load.",
    whatIsHappening:
      "The application cannot obtain a Postgres connection before the idle timeout.",
    likelyCause: "Connection pool max is too low for the production traffic pattern.",
    whyLikely:
      "Timeouts started after traffic increased, and local development still connects immediately.",
    additionalContext:
      "Check SSL, pool size, and whether serverless functions open a new client per request.",
    evidence: [
      "Logs show connection timeout after 10s",
      "Issue only appears in production",
      "Local Postgres responds instantly",
    ],
    reproductionSteps: [
      "Deploy the API",
      "Send concurrent requests to a DB-backed endpoint",
      "Observe connection timeouts",
    ],
    suggestedFix: "Increase the pool size and reuse clients across requests.",
    validationChecklist: [
      "Confirm pool metrics in production",
      "Run load against staging",
      "Verify no leaked connections",
    ],
    references: [
      { title: "node-postgres pooling", detail: "Reuse a single Pool instance." },
      { title: "Neon / serverless", detail: "Use a serverless-compatible driver." },
    ],
    fixSteps: [
      {
        title: "Reuse a connection pool",
        description: "Create one Pool and share it across handlers.",
        filename: "lib/db.ts",
        language: "ts",
        code: `export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});`,
      },
    ],
    originalInput: {
      source: "Production logs",
      subtitle: "Postgres",
      errorLines: ["Error: timeout expired", "at Connection.connect"],
    },
    skillId: "postgres-connection-issues",
  },
  {
    id: "analysis-003",
    title: "Docker container exit",
    issueType: "Docker",
    status: "Completed",
    date: "Sep 30, 2026",
    time: "9:15 PM",
    error: "Container fails to start with permission error.",
    description: "Container fails to start with permission error.",
    confidence: "High",
    issueDetected: "Container exits immediately on start.",
    whatIsHappening: "The process cannot write to a mounted volume.",
    likelyCause: "The container user does not own the bind-mounted directory.",
    whyLikely: "Permission denied appears before the app logs any request.",
    additionalContext: "Align UID/GID or chown the volume in an entrypoint.",
    evidence: [
      "docker logs show permission denied",
      "Container status is Exited (1)",
    ],
    reproductionSteps: [
      "docker compose up",
      "Inspect container status",
      "Read permission error in logs",
    ],
    suggestedFix: "Fix volume ownership or run as a matching user.",
    validationChecklist: ["Container stays healthy", "App listens on the expected port"],
    references: [{ title: "Docker user namespaces", detail: "Match host and container UIDs." }],
    fixSteps: [
      {
        title: "Set a matching user",
        description: "Avoid running as root while still owning the data directory.",
        filename: "Dockerfile",
        language: "docker",
        code: "USER node\nWORKDIR /app",
      },
    ],
    originalInput: {
      source: "Docker",
      subtitle: "compose up",
      errorLines: ["permission denied", "exited with code 1"],
    },
    skillId: "fix-docker-startup",
  },
  {
    id: "analysis-004",
    title: "API 500 error",
    issueType: "Backend",
    status: "Completed",
    date: "Sep 29, 2026",
    time: "2:10 PM",
    error: "Internal server error on /user endpoint.",
    description: "Internal server error on /user endpoint.",
    confidence: "Medium",
    issueDetected: "Unhandled exception in the /user handler.",
    whatIsHappening: "The API returns 500 when the user record is missing a field.",
    likelyCause: "Null access on an optional profile property.",
    whyLikely: "Only some users fail, which matches incomplete profile data.",
    additionalContext: "Add a guard and structured error response.",
    evidence: ["Stack trace points to user.profile.email", "Happens for new accounts"],
    reproductionSteps: ["Create a user without a profile", "GET /user", "Observe 500"],
    suggestedFix: "Null-check profile fields before reading nested values.",
    validationChecklist: ["GET /user returns 200 or 404", "Error payload is structured"],
    references: [{ title: "HTTP error handling", detail: "Do not leak stack traces." }],
    fixSteps: [
      {
        title: "Guard optional fields",
        description: "Return a 404 when the profile is incomplete instead of throwing.",
        filename: "app/api/user/route.ts",
        language: "ts",
        code: `if (!user?.profile?.email) {
  return Response.json({ error: "Profile incomplete" }, { status: 404 });
}`,
      },
    ],
    originalInput: {
      source: "API",
      subtitle: "/user",
      errorLines: ["Internal Server Error", "Cannot read properties of undefined"],
    },
    skillId: "api-500-debugger",
  },
  {
    id: "analysis-005",
    title: "Build failed - Vite",
    issueType: "Build Tool",
    status: "In Progress",
    date: "Sep 28, 2026",
    time: "6:45 PM",
    error: "Cannot find module '@/utils'.",
    description: "Cannot find module '@/utils'.",
    confidence: "High",
    issueDetected: "Vite cannot resolve the @ alias during build.",
    whatIsHappening: "TypeScript understands @/utils but Vite does not.",
    likelyCause: "vite.config.ts is missing the resolve.alias mapping.",
    whyLikely: "Dev server may use a plugin that production build does not.",
    additionalContext: "Keep tsconfig paths and Vite aliases identical.",
    evidence: ["Error: Cannot find module '@/utils'", "Dev server still works"],
    reproductionSteps: ["npm run build", "Watch the Vite resolve error"],
    suggestedFix: "Add @ alias in vite.config.ts.",
    validationChecklist: ["npm run build succeeds", "Preview still loads"],
    references: [{ title: "Vite alias", detail: "resolve.alias should match tsconfig." }],
    fixSteps: [
      {
        title: "Add the Vite alias",
        description: "Map @ to the src directory.",
        filename: "vite.config.ts",
        language: "ts",
        code: `resolve: {
  alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
}`,
      },
    ],
    originalInput: {
      source: "Vite",
      subtitle: "production build",
      errorLines: ["Cannot find module '@/utils'"],
    },
    skillId: "vite-config-fix",
  },
  {
    id: "analysis-006",
    title: "TypeScript type error",
    issueType: "TypeScript",
    status: "Completed",
    date: "Sep 28, 2026",
    time: "1:20 PM",
    error: "Type 'string' is not assignable to type 'number'.",
    description: "Type 'string' is not assignable to type 'number'.",
    confidence: "High",
    issueDetected: "A string value is assigned to a numeric state field.",
    whatIsHappening: "An input onChange event yields a string, but count is typed as number.",
    likelyCause: "Missing Number() conversion on the input handler.",
    whyLikely: "The error cites a form input handler.",
    additionalContext: "Prefer valueAsNumber for numeric inputs.",
    evidence: ["TS2322 on let count: number", "Assignment from input value"],
    reproductionSteps: ["Open the form", "Type in the count field", "Run tsc"],
    suggestedFix: "Parse the input as a number before assignment.",
    validationChecklist: ["tsc --noEmit", "Component still updates"],
    references: [{ title: "TS2322", detail: "Type 'string' is not assignable to type 'number'." }],
    fixSteps: [
      {
        title: "Parse numeric input",
        description: "Convert the event target value before storing it.",
        filename: "Counter.tsx",
        language: "tsx",
        code: `const next = event.target.valueAsNumber;
setCount(Number.isNaN(next) ? 0 : next);`,
      },
    ],
    originalInput: {
      source: "TypeScript",
      subtitle: "type checking",
      errorLines: ["Type 'string' is not assignable", "to type 'number'."],
    },
    skillId: "typescript-type-errors",
  },
  {
    id: "analysis-007",
    title: "UI not rendering",
    issueType: "Frontend",
    status: "Failed",
    date: "Sep 27, 2026",
    time: "10:05 AM",
    error: "Component not showing after state update.",
    description: "Component not showing after state update.",
    confidence: "Medium",
    issueDetected: "The component returns null after a state update.",
    whatIsHappening: "A filter condition hides the list when the new state shape changed.",
    likelyCause: "State is stored as an object, but the render path still expects an array.",
    whyLikely: "The UI disappeared immediately after the store refactor.",
    additionalContext: "Log the state shape before mapping over it.",
    evidence: ["Empty render after setState", "No console error in production"],
    reproductionSteps: ["Trigger the state update", "Observe a blank panel"],
    suggestedFix: "Normalize state to an array before rendering.",
    validationChecklist: ["List renders after update", "Empty state still works"],
    references: [{ title: "React state snapshots", detail: "Do not mutate previous state." }],
    fixSteps: [
      {
        title: "Normalize the collection",
        description: "Always render from an array.",
        filename: "List.tsx",
        language: "tsx",
        code: `const items = Array.isArray(state.items) ? state.items : [];`,
      },
    ],
    originalInput: {
      source: "Browser",
      subtitle: "UI",
      errorLines: ["Component not showing after state update"],
    },
    skillId: "ui-rendering-issues",
  },
  {
    id: "analysis-008",
    title: "Environment variable error",
    issueType: "Configuration",
    status: "Completed",
    date: "Sep 26, 2026",
    time: "7:30 PM",
    error: "Missing API key in production env.",
    description: "Missing API key in production env.",
    confidence: "High",
    issueDetected: "Production is missing GEMINI_API_KEY.",
    whatIsHappening: "The server throws when the key is undefined.",
    likelyCause: "The variable was added locally but not in the host dashboard.",
    whyLikely: "Local .env.local works; production health check fails.",
    additionalContext: "Never commit secrets. Set them in the deployment environment.",
    evidence: ["Error: GEMINI_API_KEY is required", "Only production is affected"],
    reproductionSteps: ["Deploy without the env var", "Call /api/analyze"],
    suggestedFix: "Add GEMINI_API_KEY in the hosting dashboard and redeploy.",
    validationChecklist: ["/api/health returns ok", "Analyze request succeeds"],
    references: [{ title: "Vercel / Render env vars", detail: "Set GEMINI_API_KEY per environment." }],
    fixSteps: [
      {
        title: "Set the production secret",
        description: "Add GEMINI_API_KEY and restart the service.",
        filename: ".env.example",
        language: "bash",
        code: "GEMINI_API_KEY=",
      },
    ],
    originalInput: {
      source: "Runtime",
      subtitle: "env",
      errorLines: ["Missing API key in production env"],
    },
    skillId: "env-variable-issues",
  },
];

export const historyItems: HistoryItem[] = analyses.map((item) => ({
  id: item.id,
  title: item.title,
  subtitle: item.description,
  issueType: item.issueType,
  status: item.status,
  date: item.date,
  time: item.time,
}));

export const skills: SkillRecord[] = [
  {
    id: "debug-module-resolution",
    name: "debug-module-resolution",
    category: "Frontend",
    description: "Diagnose and resolve frontend module resolution errors.",
    visibility: "Public",
    updated: "2 hours ago",
    files: [
      { path: "SKILL.md", content: SKILL_MD },
      { path: "references/troubleshooting.md", content: TROUBLESHOOTING_MD },
      {
        path: "scripts/validate.py",
        content: `def validate():\n    print("check tsconfig paths and import aliases")\n`,
      },
      {
        path: "scripts/check-paths.js",
        content: `import fs from "node:fs";\nconsole.log("exists", fs.existsSync("tsconfig.json"));\n`,
      },
      {
        path: "examples/vite-example.md",
        content: `# Vite\n\nAdd resolve.alias for @components.\n`,
      },
      {
        path: "examples/nextjs-example.md",
        content: `# Next.js\n\nKeep tsconfig paths in sync with the bundler.\n`,
      },
    ],
  },
  {
    id: "fix-docker-startup",
    name: "fix-docker-startup",
    category: "DevOps",
    description: "Troubleshoot Docker container startup failures.",
    visibility: "Private",
    updated: "1 day ago",
    files: [{ path: "SKILL.md", content: "# Docker startup\n\nInspect logs, permissions, and healthchecks.\n" }],
  },
  {
    id: "postgres-connection-issues",
    name: "postgres-connection-issues",
    category: "Database",
    description: "Handle common Postgres connection errors.",
    visibility: "Public",
    updated: "2 days ago",
    files: [{ path: "SKILL.md", content: "# Postgres connections\n\nPool, SSL, and timeouts.\n" }],
  },
  {
    id: "api-500-debugger",
    name: "api-500-debugger",
    category: "Backend",
    description: "Debug and resolve 500 internal server errors.",
    visibility: "Public",
    updated: "2 days ago",
    files: [{ path: "SKILL.md", content: "# API 500 debugger\n" }],
  },
  {
    id: "react-build-errors",
    name: "react-build-errors",
    category: "Frontend",
    description: "Fix common React build errors.",
    visibility: "Public",
    updated: "4 days ago",
    files: [{ path: "SKILL.md", content: "# React build errors\n" }],
  },
  {
    id: "env-variable-issues",
    name: "env-variable-issues",
    category: "DevOps",
    description: "Diagnose environment variable configuration problems.",
    visibility: "Public",
    updated: "5 days ago",
    files: [{ path: "SKILL.md", content: "# Env variable issues\n" }],
  },
  {
    id: "vite-config-fix",
    name: "vite-config-fix",
    category: "Build Tool",
    description: "Fix Vite configuration and build related issues.",
    visibility: "Private",
    updated: "6 days ago",
    files: [{ path: "SKILL.md", content: "# Vite config fix\n" }],
  },
  {
    id: "typescript-type-errors",
    name: "typescript-type-errors",
    category: "TypeScript",
    description: "Resolve common TypeScript type errors.",
    visibility: "Public",
    updated: "1 week ago",
    files: [{ path: "SKILL.md", content: "# TypeScript type errors\n" }],
  },
  {
    id: "ui-rendering-issues",
    name: "ui-rendering-issues",
    category: "Frontend",
    description: "Diagnose and fix component rendering issues.",
    visibility: "Public",
    updated: "1 week ago",
    files: [{ path: "SKILL.md", content: "# UI rendering issues\n" }],
  },
  {
    id: "database-timeout-fix",
    name: "database-timeout-fix",
    category: "Database",
    description: "Troubleshoot database timeout and connection issues.",
    visibility: "Public",
    updated: "1 week ago",
    files: [{ path: "SKILL.md", content: "# Database timeout fix\n" }],
  },
  {
    id: "build-cache-issues",
    name: "build-cache-issues",
    category: "Build Tool",
    description: "Resolve build cache and dependency issues.",
    visibility: "Private",
    updated: "1 week ago",
    files: [{ path: "SKILL.md", content: "# Build cache issues\n" }],
  },
  {
    id: "cicd-deployment-errors",
    name: "cicd-deployment-errors",
    category: "DevOps",
    description: "Debug and fix CI/CD deployment failures.",
    visibility: "Public",
    updated: "2 weeks ago",
    files: [{ path: "SKILL.md", content: "# CI/CD deployment errors\n" }],
  },
];

export const templates: TemplateRecord[] = [
  {
    id: "module-resolution",
    name: "Module resolution",
    category: "Module Resolution",
    description: "Alias, import path, and moved-file failures in frontend builds.",
  },
  {
    id: "api-500",
    name: "API 500",
    category: "Backend",
    description: "Unhandled exceptions, missing fields, and 500 responses.",
  },
  {
    id: "docker-start",
    name: "Docker startup",
    category: "Docker",
    description: "Permission, port, and healthcheck failures on container boot.",
  },
  {
    id: "postgres-timeout",
    name: "Postgres timeout",
    category: "Database",
    description: "Connection pooling and production timeout patterns.",
  },
];

export const exampleCards: ExampleCard[] = [
  {
    id: "module",
    title: "Module error",
    subtitle: "Node.js / React",
    analysisId: PRIMARY_ANALYSIS_ID,
    preview: ["> npm run build", "Error: Cannot find module 'react'", "> /app/src/index.js"],
  },
  {
    id: "api",
    title: "API error",
    subtitle: "500 response",
    analysisId: "analysis-004",
    preview: ["fetch('/api/users')", ".then(res => res.json())", "TypeError: Failed to fetch"],
  },
  {
    id: "runtime",
    title: "Runtime error",
    subtitle: "Python / Flask",
    analysisId: "analysis-002",
    preview: ["Traceback (most recent call last):", 'File "app.py", line 12', "JSONDecodeError"],
  },
  {
    id: "docker",
    title: "Docker error",
    subtitle: "Container / DevOps",
    analysisId: "analysis-003",
    preview: ["=> [internal] load build context", "ERROR: failed to solve", "npm install did not complete"],
  },
  {
    id: "typescript",
    title: "TypeScript error",
    subtitle: "Type checking",
    analysisId: "analysis-006",
    preview: ["Type 'string' is not assignable", "to type 'number'. ts(2322)", "let count: number = \"10\";"],
  },
];

export function getAnalysisById(id: string) {
  return analyses.find((item) => item.id === id) ?? analyses[0];
}

export function getSkillById(id: string) {
  return skills.find((item) => item.id === id) ?? skills[0];
}
