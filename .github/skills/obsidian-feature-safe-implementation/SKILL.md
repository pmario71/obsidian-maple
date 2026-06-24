---
name: obsidian-feature-safe-implementation
description: Implement Obsidian plugin features with minimal API-safe changes, low startup cost, migration-safe settings, and README plus manual test-vault validation updates.
---

# Obsidian Feature Safe Implementation

Use this skill when implementing or modifying plugin features in this repository.

## Task

{{task_description}}

## Required Workflow

1. Inspect `manifest.json`, `versions.json`, `package.json`, and plugin source files (`main.ts`, `DrawioIntegation/*`, `Services/*`, `DataModel/*`).
2. Propose the smallest API-safe implementation before editing files.
3. Implement using existing Obsidian `Plugin` class patterns already present in `main.ts`.
4. Minimize startup cost in `onload()`:
   - avoid expensive vault scans unless absolutely necessary,
   - defer optional work until command execution or settings-tab display,
   - register events/commands once and do not add blocking work in startup.
5. Keep settings migration-safe:
   - extend the settings interface using optional fields when possible,
   - merge with defaults via `Object.assign({}, DEFAULT_SETTINGS, await this.loadData())`,
   - preserve unknown persisted keys and avoid destructive rewrites,
   - if needed, add explicit one-way migration logic with a versioned marker.
6. Update README usage instructions for end users when behavior changes.
7. Provide manual validation steps in a test vault.

## Implementation Rules

- Prefer additive changes over refactors.
- Keep existing import style and folder naming (`DrawioIntegation`) unchanged.
- Use `FileSystemAdapter` guards before filesystem-only operations.
- Reuse existing settings and command registration patterns.
- Add/adjust focused unit tests only when directly impacted.

## Output Contract

Return a concise implementation report with these sections:

1. `Change summary`
2. `API safety rationale`
3. `Startup cost impact`
4. `Settings migration notes`
5. `README updates`
6. `Manual test vault validation`
