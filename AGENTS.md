# Repository Guidelines

## Project Structure
- `src/index.ts` is the userscript entry point; it loads saved configuration, creates the UI, injects the WTR Lab control, and registers the Tampermonkey menu command.
- `src/modules/` contains runtime behavior: analysis, provider configuration/API handling, retry/error helpers, state, utilities, and UI modules under `src/modules/ui/`.
- `src/styles/` contains CSS imported by `src/styles/main.css` and bundled through webpack style/css loaders.
- `config/versions.ts` and `src/version.ts` hold version data used by build and release scripts.
- `scripts/update-versions.ts` updates versioned files and generates `src/banner.ts` and `src/header.ts`.
- `dist/` contains generated userscript bundles and metadata listed in `README.md`; treat it as build output.

## Development Commands
- Use Node.js 20.19.0 or newer; `package.json` declares `"node": ">=20.19.0"`.
- `npm install`: Install dependencies; use npm because `package-lock.json` is present.
- `npm run dev`: Start webpack-dev-server for the development userscript/proxy on port 8080.
- `npm run build`: Run `version:update`, then build production userscript bundles into `dist/`.
- `npm run build:devbundle`: Run `version:update`, then build development-mode bundles into `dist/`.
- `npm run typecheck`: Run TypeScript checking with `tsc --noEmit`.
- `npm run version:check`: Print current version data without updating files.
- `npm run version:update`: Synchronize package/README/version files and regenerate banner/header files.
- `npm run version:banner`: Generate the build banner through `scripts/update-versions.ts`.
- `npm run version:header`: Generate the userscript header through `scripts/update-versions.ts`.
- Lint, format, full-test, and single-test commands are not configured in `package.json`; do not invent them.

## Coding Conventions
- Write TypeScript in the style already used: tab indentation, double quotes, no semicolons, and named exports for shared helpers.
- Keep `tsconfig.json` constraints in mind: ES2021 target, ESNext modules, bundler module resolution, and `allowJs: false`.
- Keep userscript-specific globals typed through `src/types/userscript.d.ts`; do not replace GM APIs with browser-only APIs without checking userscript support.
- Follow existing module boundaries: provider URL/model logic belongs in `src/modules/providerConfig.ts`, persisted settings in `src/modules/state.ts`, analysis flow in `src/modules/analysisEngine.ts`, and DOM event/UI work under `src/modules/ui/`.
- Keep CSS changes in the relevant file under `src/styles/` and ensure `src/styles/main.css` imports any new stylesheet.
- Preserve provider-aware request behavior: unsupported model options such as temperature or reasoning effort are intentionally filtered based on metadata.

## Testing & Verification
- Use `npm run typecheck` as the primary lightweight validation command.
- Use `npm run build` when a change affects webpack config, CSS bundling, userscript headers, generated version files, or `dist/` output.
- There is no test framework or test-file pattern in this repository; record that tests are unavailable instead of adding ad hoc commands.
- After build-related changes, inspect generated userscript paths documented in `README.md`: `dist/wtr-lab-term-inconsistency-finder.user.js`, `dist/wtr-lab-term-inconsistency-finder.greasyfork.user.js`, and `dist/wtr-lab-term-inconsistency-finder.dev.user.js`.

## Safety & Change Management
- Preserve unrelated changes; this workspace may contain local HAR/debug files that are not part of source edits.
- Use strict Conventional Commits 1.0.0 with no emojis.
- Split unrelated logical concerns into multiple atomic commits by default; use one commit only when the full diff is one logical unit or the user explicitly approves it.
- Do not edit `dist/`, `src/banner.ts`, `src/header.ts`, or `src/version.ts` by hand unless the task is specifically about generated output or version metadata; prefer the version scripts when appropriate.
- Do not edit `package-lock.json` unless dependencies change, and do not add dependencies, hooks, CI, tests, or formatter/linter configuration unless requested.
- Never commit secrets, API keys, tokens, `.env` files, or unredacted debug reports.

## Agent Notes
- Read `README.md` first for user-facing behavior, supported providers, debug report expectations, and install/build guidance.
- Check `webpack.config.ts` before changing bundling, userscript metadata, grants, match patterns, or dev-server behavior.
- Check `scripts/update-versions.ts` before release/version work because `npm run build` invokes `version:update` and can modify versioned files.
- Keep OpenAI-compatible provider base URL handling and advanced manual endpoint paths aligned with the README’s configuration guidance.
