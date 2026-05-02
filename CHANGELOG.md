# Changelog

All notable changes to the WTR Lab Term Inconsistency Finder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---
## [Unreleased]

---
## [5.6.0] - 2026-05-02

### Added
- Evidence chain reasoning where AI findings now include explicit reasoning steps and confidence scores, with low-confidence actionable results automatically downgraded to Needs Review.
- Collapsible Decision Guide section in each result showing confidence score, reasoning steps, and confidence factors so users can expand it when they want detail without cluttering the default view.
- Entity tracking guidance in the analysis prompt so the AI anchors findings to first-mention context, descriptor chains, speaker/narration roles, temporal/chapter positions, and compound-term usage.
- Overlap and granularity policy so the AI consolidates duplicate root/compound findings instead of reporting overlapping items for the same evidence.
- Anti-hallucination prompt rules that require every variation target to appear verbatim in its context snippet and forbid identical variation phrases for different source texts.
- Deep-analysis iteration-aware focus instructions that tell the AI to re-verify borderline cases, look for root-cause patterns, and be more conservative on the final pass.
- Richer few-shot examples in the prompt covering a full positive finding, a borderline non-issue, a glossary conflict, a component target, an overlap duplicate, and a formatting non-issue.
- Dynamic prompt scaling (`promptBudget.ts`) that adjusts glossary and verification context caps based on the selected model context length metadata.
- Gemini native API metadata parsing for `inputTokenLimit`, `outputTokenLimit`, `maxInputTokens`, `maxOutputTokens`, and `displayName` so Gemini models populate `contextLength` and `maxCompletionTokens` correctly.
- Precise replacement targeting where each AI variation now includes a `replacement_target` field identifying the exact substring to replace, preventing full evidence phrases from being replaced when only a component term should change.
- Frequency and recency recommendation guidance so the AI counts variant occurrences across all chapters, prefers variants spread across more chapters, and applies clear tie-breaking rules.
- User-guidance prompt style rules so explanations and suggestion reasoning read like a helpful translation editor advising a human, not a database report.
- Post-processing repair that resolves variation targets from context snippets and removes findings without at least two distinct variation targets.

### Changed
- Removed user-facing temperature slider and reasoning/thinking mode selector from the configuration UI. Temperature is now automatically set to 1 when the provider supports it, and high reasoning effort is sent only when the model or provider accepts it.
- Removed persisted temperature and reasoning mode from saved configuration and session data.
- Demoted WTR glossary from "official" to advisory context throughout the prompt, UI labels, debug reports, and log messages. The AI now prioritizes story context, chapter evidence, and world-building consistency over glossary wording, and uses "Reference option" instead of "Glossary option" in suggestion labels.
- Relaxed suggestion count from exactly three to one-to-three unique suggestions, eliminating filler/duplicate options that existed only to reach the previous requirement.
- Blocked invented editorial alternatives unless the wording appears in the analyzed text, the advisory glossary context, or is strictly required for grammatical replacement.
- Removed the Target indicator from variation display; variations now show the exact targetable replacement text matched from context snippets instead of the AI's recommended term.
- Variations are resolved from context snippets so Apply, Apply All, copy, and checkbox targets match the actual chapter text rather than the AI's proposed replacement.
- No-op apply targets are filtered out so Apply All / Apply Selected skip variations that already match the suggestion.
- Apply Selected and Apply All buttons now use `replacement_target` when available and disable automatically when a single-word replacement would be applied to a broader multi-word evidence phrase without an explicit target.
- Updated debug report output to reflect automatic temperature and reasoning behavior instead of showing user-configured values.

---
## [5.5.2] - 2026-05-01

### Added
- Shared userscript API compatibility helpers for legacy `GM_*` and modern `GM.*` managers, with local fallback storage/request handling when those APIs are unavailable.

### Changed
- Updated installation guidance to recommend Violentmonkey, Stay, or ScriptCat first while keeping Tampermonkey documented as a compatibility option.
- Reworked the AI system and glossary prompt format into XML-style sections with stronger context-aware disambiguation rules for titles, aliases, ordinary nouns, dialogue, and glossary-assisted matching.
- Adjusted tablet/mobile modal sizing to preserve margins, rounded corners, and safe-area padding on narrow viewports while still allowing full-screen fallback on tiny screens.

### Fixed
- Reset deep-analysis retry timing state between new runs and after successful iterations so completed or aborted passes do not trigger false-positive retry exhaustion on later analyses.
- Routed userscript requests, storage, and menu registration through compatibility wrappers so model loading, glossary fetching, and menu actions keep working across broader userscript manager implementations.

---
## [5.5.1] - 2026-04-30

### Added
- WTR Lab Reader API chapter source mode for fetching current, nearby, or custom chapter ranges directly from WTR Lab without relying on loaded page content.
- WTR Lab official glossary context support that fetches the novel's official glossary, caches it locally, and injects only compact relevant context into the AI prompt.
- Official alias-only finding suppression that prevents the AI from creating findings when all variations of a result are already covered by official WTR glossary alias groups.
- Post-analysis suggestion normalization that enforces exactly three suggestions per actionable finding with a single recommendation, adding fallback dominant-usage, glossary-informed, and editorial options when the AI returns fewer than three.
- Placeholder artifact detection that marks findings containing unresolved WTR placeholder markers (such as `※8⛬`) as Needs Review.
- Low-evidence detection that marks non-informational findings with fewer than two extracted variations as Needs Review.
- Final-pass new-item detection that marks newly discovered findings on the last deep-analysis pass as Needs Review when no later verification pass remains.
- Glossary-aware prompt injection with relevance filtering based on chapter glossary terms, source text occurrence, and CJK-aware phrase matching.
- Debug log replacement preprocessing statistics including raw match, applied match, and skipped-overlap counts per chapter.
- Chapter source and glossary context lines in the debug report output.
- Concept annotation stripping for parenthetical notes during duplicate detection and concept comparison.
- Responsive two-column grid layout for WTR API range controls with single-column mobile fallback.

### Changed
- Refactored the AI system prompt from approximately 197 inline lines to a compact 53-line prompt while preserving all detection logic and exclusion rules.
- Updated suggestion schema guidance to request dominant-usage, glossary-informed, or editorial labels with frequency and chapter evidence in reasoning.
- Simplified the existing-results continuation prompt for deep-analysis verification passes.
- Improved concept merging to prefer concepts that carry useful parenthetical annotations (such as CJK source or alias notes) and to merge variations and suggestions through deduplicated helper functions.
- Updated semantic duplicate detection to strip parenthetical annotations before comparing scripts and proper-name traits.
- Suppressed verbose semantic similarity logging during result merge operations to reduce debug noise.
- Merged prompt suggestion schema fields so `is_recommended` is marked as required on exactly one actionable suggestion instead of optional.

---
## [5.5.0] - 2026-04-28

### Added
- TypeScript build support for source modules while preserving JavaScript userscript output in `dist/`.
- Provider-aware temperature and reasoning/thinking controls in the configuration modal.
- Automatic OpenAI-compatible chat/model endpoint handling with fallback probing for model discovery.
- Enriched OpenAI-compatible model catalog support for providers that expose metadata such as context length, output limits, pricing, capabilities, supported parameters, and latest-alias targets.
- Metadata-aware OpenAI-compatible request serialization so unsupported parameters such as `temperature` or `reasoning_effort` are skipped when model catalogs indicate they are not supported.
- API key visibility controls in the configuration modal, letting users temporarily show or hide saved API keys.
- Debug report controls that appear when Debug Logging is enabled, including copy-ready Markdown reports with runtime details, configuration summary, timestamped logs, and redacted secrets.
- Needs Review confidence state for findings that are preserved but not confirmed by the latest verification pass.
- Removed repository code-style tooling and related scripts to keep development dependencies lean.

### Changed
- Converted remaining runtime/UI source modules and generated source metadata files under `src/` to TypeScript.
- Simplified default OpenAI-compatible setup so users enter a base URL instead of raw chat/models paths.
- Moved manual endpoint path edits behind advanced troubleshooting controls.
- Updated modal styling to reduce box-heavy layout and improve desktop/mobile responsiveness.
- Cached model catalog metadata alongside model IDs to improve model selection hints and request behavior across sessions.
- Improved deep-analysis confidence handling so previous findings remain available for review when model verification is inconclusive.
- Cleaned project Markdown to use plain headings and concise setup notes.

### Fixed
- Fixed the userscript runtime startup failure caused by Node-only `process.env` references being bundled into the browser userscript after the TypeScript rewrite.
- Preserved browser-safe runtime version globals without importing Node-only version configuration into the userscript bundle.
- Reduced provider request failures for OpenAI-compatible endpoints that advertise unsupported parameters in their model metadata.
- Clamped completed deep-analysis iteration state so reports show the configured target depth instead of advancing past it.
- Improved semantic duplicate detection for composite concepts such as `A / B` by comparing individual variants and handling proper-name connector words.
- Preserved previous findings as Needs Review when a verification pass returns no items or omits earlier context results, making confidence changes explicit.
- Marked findings discovered on the final deep-analysis pass as Needs Review when no later verification pass remains.

---
## [5.4.1] - 2026-04-04

### Added
- **Live Term Replacer Sync**: When the external WTR Lab Term Replacer userscript is installed, Finder can now request the current novel's live term list directly at analysis time instead of requiring an exported JSON file.
- **Live Sync Preference Toggle**: Added a configuration toggle so users can explicitly choose whether Finder should reuse Term Replacer terms automatically or operate independently even when both scripts are installed.

### Changed
- **JSON Integration Positioning**: Reframed the Term Replacer JSON option as an optional manual override/backup import path instead of the primary integration workflow.
- **Configuration Messaging**: Updated the configuration panel hints to explain the three supported modes clearly: Finder-only, live sync with Term Replacer, and optional JSON import.

### Fixed
- **Dual-Script Workflow Friction**: Removed the need to export a Term Replacer JSON file before running Finder analysis in the common case where both userscripts are installed together.
- **Finder-Only Control**: Preserved the ability to ignore Term Replacer data by disabling the new live sync toggle, preventing unwanted automatic reuse of external terms.

---
## [5.4.0] - 2026-04-04

### Added
- **Multi-Provider Support**: Added support for OpenAI-compatible API providers in addition to Google Gemini. Users can now choose between Gemini and any OpenAI-compatible API (OpenAI, local models, self-hosted solutions like Ollama, etc.).
- **Flexible API Configuration**: New configuration options for provider type, base URL, and custom API endpoints, enabling integration with various AI backends.
- **Dynamic Model Discovery**: Enhanced model fetching system that works with both Gemini and OpenAI-compatible model catalogs.
- **Provider-Aware Request Building**: Automatic request formatting based on provider type, handling authentication and payload differences transparently.

### New Module
- **providerConfig.js**: New module providing provider configuration, URL/path normalization, request builders, and response parsers for both Gemini and OpenAI-compatible APIs.

---
## [5.3.9] - 2026-04-04

### Added
- **Version Badge in UI Header**: Added a visible version indicator badge to the panel header, making it easy to identify the current script version at a glance. The badge displays the version number (e.g., `v5.3.9`) and includes a tooltip showing the build date and environment.
- **Node.js Engine Requirement**: Added `engines` field to `package.json` specifying Node.js >=20.19.0 as the minimum required version.

### Changed
- **Dependency Updates**: Updated build dependencies to their latest compatible versions, including webpack, webpack CLI, webpack dev server, and CSS loaders.
- **Build Pipeline Order**: Fixed build script execution order so version synchronization runs before generated bundle output.
- **Version Script Enhancement**: Extended `update-versions.js` to automatically sync `src/version.js` fallback values, preventing the UI version badge from showing stale data.
- **Version Module Refactor**: Converted `src/version.js` to proper ESM exports while maintaining browser globals for backward compatibility.

### Fixed
- **Broken `version:check` Script**: Corrected the command alias from pointing to `version` (invalid) to `check` (valid), restoring `npm run version:check` functionality.
- **Generated File Consistency**: Fixed generated `banner.js` and `header.js` consistency issues after builds.

---
## [5.3.8] - 2025-11-17

### Changed
- **Major Gemini API Module Refactoring**: Completely modularized the monolithic 908-line `geminiApi.js` file into 5 focused modules following single responsibility principle:
  - `retryLogic.js` (107 lines) - Exponential backoff and retry scheduling logic
  - `promptManager.js` (310 lines) - AI prompt generation and response parsing
  - `apiErrorHandler.js` (143 lines) - Centralized error handling and classification
  - `analysisEngine.js` (609 lines) - Core analysis and API integration logic
  - `geminiApi.js` (82 lines) - Facade module maintaining backward compatibility
- **Enhanced Code Organization**: Improved maintainability, testability, and developer experience through logical separation of concerns
- **Better Tree-Shaking**: Modular structure enables improved webpack optimization for unused code elimination
- **Preserved Backward Compatibility**: All existing function signatures and interfaces remain unchanged - no breaking changes
- **API Key Rotation Logic Refactoring**: Removed exponential backoff mechanism and implemented immediate key-switching with smart cooldown system for faster API key cycling and improved user experience

### Fixed
- **Mobile CSS Layout**: Removed `flex-direction: column;` from the mobile view rule for `.wtr-if-section-header h3` to correct layout behavior
- **Chapter Title Punctuation Filtering**: Added exclusion rule to prevent flagging of minor, non-actionable stylistic inconsistencies related to chapter title formatting, specifically the presence or absence of colon separators
- **Debug Log Leakage**: Corrected the logging mechanism to ensure that initialization and module loading messages are suppressed when the user has disabled debug logging in the configuration settings panel

### Internal
- **Comprehensive Documentation**: Added detailed JSDoc documentation to all new modular components
- **Dependency Management**: Implemented proper module initialization order with circular dependency resolution
- **Error Handling Enhancement**: Extended error handling patterns across all modules with comprehensive recovery strategies
- **Build System Validation**: Verified `npm run build` completes successfully with 0 syntax errors after modularization

## [5.3.7] - 2025-11-11

### Fixed
- **Critical API Key Cooldown State Synchronization**: Resolved issue where API keys whose cooldown periods had expired remained marked as unavailable, causing false "no available keys" errors. Implemented proactive state synchronization that automatically re-evaluates and marks expired keys as available based on real-time clock information without requiring failed analysis attempts.
- **First-Attempt Success After Cooldown**: Eliminated redundant failure-first behavior where users had to perform multiple analysis attempts after cooldown expiry. The first analysis attempt now succeeds immediately if at least one key's cooldown has expired and no other constraints prevent its use.
- **Real-Time Key State Management**: Replaced reactive-only state updates with comprehensive real-time evaluation. Key availability is now computed using up-to-date cooldown information on every selection attempt, ensuring the system no longer relies solely on state refresh triggered by user actions.
- **Streamlined User Experience**: Removed the requirement for users to perform extra steps to trigger state refresh. Key state synchronization now occurs automatically and seamlessly during normal operation.
- **Robust State Normalization**: Added comprehensive data validation and sanitization for persisted key states, preventing corruption from time drift, server restarts, or inconsistent system times. The system now gracefully handles malformed state data without crashing or producing misleading errors.
- **Deterministic Key Selection**: Implemented fair and consistent key selection across scenarios where multiple keys complete cooldown simultaneously, eliminating race conditions and ensuring predictable behavior.
- **Critical TypeError in Failure-Handling Logic**: Resolved unhandled TypeError when accessing 'style' property of null DOM elements during deep analysis API retry exhaustion scenarios. Added comprehensive null checks and defensive programming patterns to prevent UI crashes when elements become detached during async error handling.
- **Graceful Failure Sequences**: Implemented robust error handling that ensures the script executes complete and graceful failure sequences without uncaught exceptions after all deep analysis API retry attempts are exhausted.
- **DOM Element Validation**: Added proper validation for all DOM element references before accessing properties, including progress indicators, error messaging elements, and UI state management components.
- **Safe Style Property Access**: Created `safeSetStyle()` helper function to prevent TypeError exceptions when DOM elements are missing or detached during timeout handlers and asynchronous operations.
- **UI State Consistency**: Ensured the user interface remains responsive and consistent during error states, preventing frozen, blocked, or inconsistent UI states during failure scenarios.

## [5.3.6] - 2025-11-10

### Added
- **WTR Lab Term Replacer Integration Mode Switcher**: Automatically detects if the external Term Replacer userscript is active, switching between "Apply" and "Copy" modes accordingly. Provides clear user messaging.
- **Advanced API Key Rotation System**: Implemented a state-managed key pool (`AVAILABLE`, `ON_COOLDOWN`, `EXHAUSTED`, `INVALID`) with persistent `localStorage` state. Features context-aware cooldowns, automatic recovery, and intelligent key selection to improve reliability and handle API limits gracefully.

### Changed
- **Gemini Prompt Refinement**: Updated the system prompt to ignore non-user-actionable numbering discrepancies from the WTR Lab site templates.
- **Finder Tab Layout Stability**: Ensured the main UI structure remains static during result updates, preventing layout shifts.
- **UI Stacking Order**: Adjusted `z-index` to ensure the Finder panel appears above the site's bottom navigator.
- **UI Header Cleanup**: Removed the version number from the panel header for a cleaner look.

### Fixed
- **Status Widget Collision**: Refined positioning logic to prevent jitter and overlap with other status widgets, correctly ignoring the site's bottom navigator for vertical placement.
- **Dynamic Apply/Copy Behavior**: Centralized button mode handling to ensure all action buttons correctly sync with the Term Replacer's detection state, preventing incorrect actions.
- **Smart Quotes Safety**: Reworked smart quote replacement to be more conservative and context-aware, preventing malformed transformations.
- **API Backoff Logic**: Enhanced API calls with exponential backoff for retriable errors, preventing tight retry loops.
- **Semantic Duplicate Merging**: Hardened merging logic with script-aware checks (e.g., Latin/CJK) to prevent improper merges of unrelated terms.
- **Critical API Key Rotation Bug**: Fixed a major issue where the script was stuck using only the first API key. The new state management system resolves this completely.
- **Status Widget UX**: Shortened verbose status messages to improve readability and prevent UI overflow.

## [5.3.5] - 2025-11-10

### Added
- **Multi-Build System**: Implemented a webpack multi-target build system for performance, GreasyFork, and development outputs.
- **Enhanced Development Workflow**: Added a code-quality workflow for generated userscript builds.

### Changed
- **Build Process**: Updated `npm run build` to include automated code-quality checks at the time.
- **CSS Processing**: Configured webpack with proper loaders to handle CSS `@import` and processing.

### Fixed
- **CSS Quality Errors**: Resolved various selector ordering and duplicate issues.
- **Userscript Validation**: Fixed a webpack header validation issue caused by a conflicting `homepage` field in `package.json`.
- **Build Failures**: Corrected issues related to CSS processing and userscript metadata validation.

### Internal
- **Webpack Configuration**: Enhanced multi-target webpack config for all build types.
- **Version Management**: Improved version synchronization across build artifacts.
- **Optimized Build Artifacts**: Tailored outputs for performance (93.5 KiB), GreasyFork (159 KiB), and development (159 KiB).

## [5.3.3] - 2025-11-07

### Added
- **Smart Quotes Replacement**: Implemented a pre-processing step to standardize quotes before term analysis.
- **Active Chapter Skipping**: The script now avoids processing chapters currently being edited to prevent conflicts.

### Fixed
- **Status Indicator Positioning**: Adjusted CSS to avoid collision with other status widgets on the page.

## [5.3.2] - 2025-11-06

### Fixed
- **Quote Handling False Positives**: Enhanced the AI prompt to correctly ignore differences in quote styles (e.g., straight vs. smart quotes).
- **Configuration Bug**: Fixed an issue where the "Auto-restore saved results" setting would not save correctly when disabled.
- **UI Conflict**: Resolved a `z-index` conflict with the site's bottom navigation bar.

## [5.3.1] - 2025-11-06

### Added
- Complete refactoring to a modern **ES6 modular architecture**.
- **Multi-API Key Support** with rotation and cooldowns.
- **Deep Analysis** feature with multiple iterations.
- **Session Persistence** for saving and restoring results.
- **Advanced Filtering** and an enhanced, responsive UI.
- Seamless integration with the **Term Replacer** userscript.
- **GitHub Actions** for automated CI builds.

### Changed
- Migrated the build system to **webpack-userscript**.
- Reorganized the codebase into focused modules (`api`, `state`, `ui`, `utils`).
- Improved error handling with exponential backoff.

### Fixed
- Addressed various bugs related to session restoration, memory leaks, API rate limiting, and UI responsiveness.

## [5.2.0] - 2025-10-XX (Legacy)

### Added
- Initial AI-powered inconsistency detection.
- Priority-based result filtering.

## [5.1.0] - 2025-09-XX (Legacy)

### Added
- Initial integration with the Gemini AI.
- Basic chapter data extraction and results display.

---

**Note**: This changelog documents the evolution of the WTR Lab Term Inconsistency Finder from its initial release through the current modular architecture. The project follows semantic versioning and maintains backward compatibility for user configurations while introducing new features and improvements.
