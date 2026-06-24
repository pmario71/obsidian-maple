# Copilot instructions for `obsidian-maple`

## Build, test, and lint

- Install dependencies: `npm install`
- Dev/watch build (esbuild watch mode): `npm run dev`
- Production build (type-check + bundle): `npm run build`
- Run all tests (Jest + ts-jest): `npm test`
- Run a single test file: `npm test -- DrawioIntegation/FileExt.test.ts`
- Run a single test by name: `npm test -- -t "isDrawioFile"`
- Lint (no npm script is defined; ESLint is configured via `.eslintrc`): `npx eslint . --ext .ts`

## High-level architecture

- **Entry point:** `main.ts` defines the Obsidian plugin class, loads/saves plugin settings, and registers all commands and the settings tab.
- **Draw.io integration flow:** `DrawioIntegation/DrawIOCommandBuilder.ts` registers:
  - a command to create a new Draw.io file from a template (`PromptFilenameModal` + template copy + markdown embed insertion),
  - a file context-menu action to open Draw.io files in the desktop app (or default OS handler).
- **Change tracking flow:** `Services/UpdateRecorder.ts` subscribes to vault/workspace events (`rename`, `delete`, `file-open`) and stores `FileRecord` entries keyed by path.
- **Data model:** `DataModel/FileRecord.ts` + `DataModel/FileModificationType.ts` represent recorded file changes.
- **Utility layer:** `DrawioIntegation/StringHelper.ts` and `DrawioIntegation/FileExt.ts` implement Draw.io filename/path handling and file-type checks used by command and settings logic.
- **Tests:** colocated `*.test.ts` files validate helpers and data model behavior with Jest (`jest.config.js` matches `**/*.test.ts`).

## Key repository conventions

- TypeScript imports rely on `tsconfig.json` `baseUrl: "."`; prefer existing non-relative imports like `DrawioIntegation/...`, `DataModel/...`, and `main`.
- Keep the existing folder/import spelling **`DrawioIntegation`** (note the current repo spelling) unless doing a deliberate full rename.
- Plugin settings and key plugin fields use underscore-prefixed names (for example `_drawio_template`, `_azureToken`, `_updateRecorder`); follow that established pattern for new settings/state.
- Obsidian filesystem path operations that require local disk access should follow the existing `FileSystemAdapter` guard pattern before resolving absolute paths.
- Draw.io-specific file handling treats `.drawio.svg` and `.drawio.png` as rendered Draw.io files, and `.drawio` plus those rendered variants as Draw.io files.
- Formatting conventions come from `.editorconfig`: tabs, width 4, LF line endings, UTF-8.

## Local Copilot skill

- Use `.github/skills/obsidian-feature-safe-implementation/SKILL.md` when implementing plugin features in this repo.
- The skill enforces:
  - inspecting plugin metadata and source first,
  - minimal API-safe implementation,
  - low startup overhead in `onload()`,
  - migration-safe settings updates,
  - README usage updates,
  - manual validation steps for a test vault.

