---
name: debug-module-resolution
description: Diagnose and resolve frontend module resolution failures from screenshots, logs, and project configuration evidence. Use when a production build cannot find a module or import.
license: Apache-2.0
---

# Debug Module Resolution

## Purpose

Use this skill to diagnose unresolved import and module resolution problems.

## Workflow

1. Inspect the error message.
2. Inspect import paths in the failing file.
3. Identify the unresolved module or import.
4. Verify the file path exists at the expected location.
5. Inspect path alias configuration in tsconfig or the bundler.
6. Check filename casing against the import.
7. Apply the smallest appropriate correction.
8. Run the production build.
9. Run relevant tests.

## Evidence Rules

- Prefer direct evidence from logs or screenshots.
- Distinguish observed facts from hypotheses.
- Do not claim that a cause is confirmed unless evidence supports it.
- Do not invent file names, commands, configuration values, or logs.

## Validation

- Build completes successfully.
- Relevant tests pass.
- No unresolved imports remain.
- Run the production build after the fix.
