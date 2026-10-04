import type { ExampleCard, IssueCategory, TemplateRecord } from "@/lib/types";

export const demoExamples: ExampleCard[] = [
  {
    id: "module-resolution",
    title: "Module resolution",
    subtitle: "GitHub Actions production build",
    description: "The deployment started failing after I moved the Button component.",
    logText: `Error: Cannot find module '@components/Button'

src/pages/index.tsx

GitHub Actions
Deploy Production
Build failed`,
    preview: [
      "Error: Cannot find module",
      "'@components/Button'",
      "src/pages/index.tsx",
    ],
  },
  {
    id: "ci-deploy",
    title: "CI/CD deploy",
    subtitle: "Missing production environment variable",
    description: "Describe a failed GitHub Actions production deploy.",
    logText: `GitHub Actions / Deploy Production

Error: process.env.DATABASE_URL is not defined
npm run build failed
Job failed at "Build and deploy"`,
    preview: [
      "DATABASE_URL is not defined",
      "npm run build failed",
      "Job failed at Build and deploy",
    ],
  },
  {
    id: "ui-api",
    title: "UI/API connection",
    subtitle: "Browser cannot reach the API",
    description: "The page loads, but data from the API never appears.",
    logText: `Access to fetch at 'http://localhost:4000/api/items' from origin 'http://localhost:3000' has been blocked by CORS policy.

GET http://localhost:4000/api/items net::ERR_FAILED
Uncaught TypeError: Failed to fetch`,
    preview: [
      "blocked by CORS policy",
      "GET /api/items net::ERR_FAILED",
      "Failed to fetch",
    ],
  },
];

export const demoTemplates: TemplateRecord[] = demoExamples.map((example) => ({
  id: example.id,
  name: example.title,
  category: inferTemplateCategory(example.id),
  description: example.description,
}));

function inferTemplateCategory(id: string): IssueCategory {
  if (id === "module-resolution") return "Module Resolution";
  if (id === "ci-deploy") return "DevOps";
  return "Frontend";
}
