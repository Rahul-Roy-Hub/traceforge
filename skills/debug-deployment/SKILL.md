---
name: debug-deployment
description: Diagnose CI/CD production deploy failures from screenshots, workflow logs, and environment evidence. Use when a GitHub Action or deploy job fails.
license: Apache-2.0
---

# Debug Deployment

## Purpose

Use this skill to diagnose failed production deployments and CI jobs.

## Workflow

1. Inspect the failed job in the CI screenshot or workflow UI.
2. Read the build log for the first hard error.
3. Compare local and CI environment variable values.
4. Check deploy commands, secrets, and required config files.
5. Apply the smallest configuration fix.
6. Redeploy the workflow.

## Evidence Rules

- Prefer the failed job screenshot and the raw build log.
- Treat missing secrets as hypotheses until the log names them.
- Do not invent environment variable names.

## Validation

- The deploy job succeeds.
- The production URL responds.
- Redeploy after the fix to confirm the same job is green.
