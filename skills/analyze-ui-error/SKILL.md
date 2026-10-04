---
name: analyze-ui-error
description: Diagnose UI-to-API connection failures from browser screenshots, console errors, and network logs. Use when the interface cannot load data from its backend.
license: Apache-2.0
---

# Analyze UI Error

## Purpose

Use this skill when a user interface cannot reach its API.

## Workflow

1. Open the UI and reproduce the failing action.
2. Inspect the browser console.
3. Inspect the failed network request.
4. Confirm the API URL used by the client.
5. Check CORS headers on the API.
6. Retry the request after the smallest fix.

## Evidence Rules

- Prefer the network panel and browser console over guesses.
- Distinguish client URL mistakes from server downtime.
- Do not invent API routes or CORS origins.

## Validation

- The network request succeeds.
- The UI renders the expected data.
- Browser console no longer shows the connection error.
