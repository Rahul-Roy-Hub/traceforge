# TraceForge

Visual Evidence → Diagnosis → Reusable Agent Skill

TraceForge is a multimodal developer troubleshooting tool powered by [Gemma 4 on the Gemini API](https://ai.google.dev/gemma/docs/core/gemma_on_gemini_api). Developers upload a screenshot, paste an error log, and describe what they were doing. TraceForge correlates visual and textual evidence, produces a structured diagnosis with uncertainty, and converts the troubleshooting workflow into a reusable Agent Skill.

## Problem

Debugging starts with fragmented evidence: a screenshot, a log, and a short description. Most tools process only one of these well, and the answer disappears after the incident.

## Solution

TraceForge compiles one debugging incident into reusable agent knowledge:

```text
SEE → UNDERSTAND → EXPLAIN → REPRODUCE → FIX → ENCODE → REUSE
```

## Demo

1. `POST /api/analyze` with a screenshot, user context, and optional log.
2. `POST /api/generate-skill` with the analysis JSON.
3. `POST /api/validate-skill` to check Agent Skill frontmatter and required sections.
4. `POST /api/export-skill` to download a ZIP.

A thin tester is available at `/` for local and Render smoke tests. UI polish is intentionally deferred.

Demo fixtures live in [`public/demo`](public/demo).

## Features

- Gemma 4 multimodal analysis (screenshot + log + context)
- Structured diagnosis validated with Zod
- Evidence separated from likely causes and unknowns
- Agent Skill generation (`SKILL.md`)
- Original skill validator
- Lightweight skill harness
- ZIP export
- Chrome extension that captures screenshot, console, and failed network requests

## Architecture

```text
Client (curl or thin tester)
        │
        ▼
Next.js App Router on Render
        │
        ├── POST /api/analyze          → Gemma 4 (Gemini API)
        ├── POST /api/generate-skill   → SKILL.md package
        ├── POST /api/validate-skill   → validator
        ├── POST /api/export-skill     → ZIP
        ├── POST /api/harness          → fixture coverage
        └── GET  /api/health           → Render health check
```

The Gemini API key stays on the server. Screenshots are not stored.

## Why Gemma 4

Gemma 4 is the primary intelligence layer. It reads the screenshot and the log together, supports system instructions, and can use thinking for multi-step debugging. TraceForge does not treat the image as an afterthought.

## Agent Skill workflow

Analysis JSON → skill name → `SKILL.md` (Purpose, Workflow, Evidence Rules, Validation) → validator → ZIP.

Generated skills follow the [Agent Skills](https://agentskills.io/specification) `name` and `description` rules.

## Skill Validator

[`lib/skill-validator.ts`](lib/skill-validator.ts) checks:

- Frontmatter exists and parses as YAML
- `name` and `description` are present and valid
- Required instruction sections exist
- Body is not empty
- Optional directory name matches frontmatter `name`

## Skill Harness

The harness scores three known fixtures (module resolution, CI deploy, UI/API connection) for concept coverage.

```bash
npm run harness
```

Or `GET /api/harness`.

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Gemma 4 via `@google/genai`
- Zod
- js-yaml
- JSZip
- Render Web Service

## Local Setup

```bash
npm install
copy .env.example .env.local
```

Set `GEMINI_API_KEY` from [Google AI Studio](https://aistudio.google.com/apikey).

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Chrome extension

The extension does not open DevTools. It captures the visible tab, console errors, and failed network requests, then sends them to Gemma 4 through this app.

1. Run `npm run dev` so `http://localhost:3000` is up.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select the [`extension/`](extension/) folder.
5. Open a page where a button or request fails, then click the TraceForge icon → **Trace This Issue**.
6. Review the screenshot, URL, selected text, and console/network evidence, then **Analyze with TraceForge**.

Set a deployed API origin in the extension options (gear) if you are not using localhost. The Gemini API key stays in the Next.js env, never in the extension.

On restricted pages (`chrome://`, the Chrome Web Store) capture is limited; use a normal http(s) site.

## Environment Variables

| Name | Required | Default | Purpose |
|---|---|---|---|
| `GEMINI_API_KEY` | Yes | | Gemini API key for Gemma 4 |
| `GEMMA_MODEL` | No | `gemma-4-26b-a4b-it` | Model id |
| `GEMMA_THINKING_LEVEL` | No | `high` | `high` or `minimal` |
| `CORS_ORIGIN` | No | `*` | Allowed browser origin |

## Example

PowerShell against a local server:

```powershell
curl.exe http://localhost:3000/api/health

curl.exe -X POST http://localhost:3000/api/analyze `
  -F "image=@public/demo/placeholder.png" `
  -F "userContext=The deployment started failing after I moved the Button component." `
  -F "logText=Error: Cannot find module '@components/Button'"
```

Then send the analysis JSON to `/api/generate-skill`, `/api/validate-skill`, and `/api/export-skill`.

On Render, replace `http://localhost:3000` with your service URL.

## Deploy on Render

1. Push this repo to GitHub.
2. Create a Render Web Service from the repo, or use `render.yaml`.
3. Build command: `npm ci && npm run build`
4. Start command: `npm start`
5. Set `GEMINI_API_KEY` in the Render dashboard.
6. Health check path: `/api/health`

`next start` binds to Render's `PORT`.

If analysis times out, set `GEMMA_THINKING_LEVEL=minimal`.

## Project Structure

```text
app/api/analyze/route.ts
app/api/generate-skill/route.ts
app/api/validate-skill/route.ts
app/api/export-skill/route.ts
app/api/harness/route.ts
app/api/health/route.ts
lib/gemma.ts
lib/prompts.ts
lib/schemas.ts
lib/skill-generator.ts
lib/skill-validator.ts
lib/skill-harness.ts
skills/
public/demo/
extension/
```

## License

Apache-2.0. See [LICENSE](LICENSE).
