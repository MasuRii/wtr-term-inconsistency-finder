# Changelog

All notable changes to the WTR Lab Term Inconsistency Finder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.3.7] - 2025-11-11

### 🐛 Fixed
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

### ✨ Added
- **WTR Lab Term Replacer Integration Mode Switcher**: Automatically detects if the external Term Replacer userscript is active, switching between "Apply" and "Copy" modes accordingly. Provides clear user messaging.
- **Advanced API Key Rotation System**: Implemented a state-managed key pool (`AVAILABLE`, `ON_COOLDOWN`, `EXHAUSTED`, `INVALID`) with persistent `localStorage` state. Features context-aware cooldowns, automatic recovery, and intelligent key selection to improve reliability and handle API limits gracefully.

### ♻️ Changed
- **Gemini Prompt Refinement**: Updated the system prompt to ignore non-user-actionable numbering discrepancies from the WTR Lab site templates.
- **Finder Tab Layout Stability**: Ensured the main UI structure remains static during result updates, preventing layout shifts.
- **UI Stacking Order**: Adjusted `z-index` to ensure the Finder panel appears above the site's bottom navigator.
- **UI Header Cleanup**: Removed the version number from the panel header for a cleaner look.

### 🐛 Fixed
- **Status Widget Collision**: Refined positioning logic to prevent jitter and overlap with other status widgets, correctly ignoring the site's bottom navigator for vertical placement.
- **Dynamic Apply/Copy Behavior**: Centralized button mode handling to ensure all action buttons correctly sync with the Term Replacer's detection state, preventing incorrect actions.
- **Smart Quotes Safety**: Reworked smart quote replacement to be more conservative and context-aware, preventing malformed transformations.
- **API Backoff Logic**: Enhanced API calls with exponential backoff for retriable errors, preventing tight retry loops.
- **Semantic Duplicate Merging**: Hardened merging logic with script-aware checks (e.g., Latin/CJK) to prevent improper merges of unrelated terms.
- **Critical API Key Rotation Bug**: Fixed a major issue where the script was stuck using only the first API key. The new state management system resolves this completely.
- **Status Widget UX**: Shortened verbose status messages to improve readability and prevent UI overflow.

## [5.3.5] - 2025-11-10

### ✨ Added
- **Multi-Build System**: Implemented a webpack multi-target build system for performance, GreasyFork, and development outputs.
- **Enhanced Development Workflow**: Integrated Prettier, ESLint, and Stylelint for a complete auto-formatting and auto-fixing pipeline.

### ♻️ Changed
- **Build Process**: Updated `npm run build` to include automated linting and fixing.
- **CSS Processing**: Configured webpack with proper loaders to handle CSS `@import` and processing.

### 🐛 Fixed
- **CSS Linting Errors**: Resolved various selector ordering and duplicate issues.
- **Userscript Validation**: Fixed a webpack header validation issue caused by a conflicting `homepage` field in `package.json`.
- **Build Failures**: Corrected issues related to CSS processing and userscript metadata validation.

### ⚙️ Internal
- **Webpack Configuration**: Enhanced multi-target webpack config for all build types.
- **Version Management**: Improved version synchronization across build artifacts.
- **Optimized Build Artifacts**: Tailored outputs for performance (93.5 KiB), GreasyFork (159 KiB), and development (159 KiB).

## [5.3.3] - 2025-11-07

### ✨ Added
- **Smart Quotes Replacement**: Implemented a pre-processing step to standardize quotes before term analysis.
- **Active Chapter Skipping**: The script now avoids processing chapters currently being edited to prevent conflicts.

### 🐛 Fixed
- **Status Indicator Positioning**: Adjusted CSS to avoid collision with other status widgets on the page.

## [5.3.2] - 2025-11-06

### 🐛 Fixed
- **Quote Handling False Positives**: Enhanced the AI prompt to correctly ignore differences in quote styles (e.g., straight vs. smart quotes).
- **Configuration Bug**: Fixed an issue where the "Auto-restore saved results" setting would not save correctly when disabled.
- **UI Conflict**: Resolved a `z-index` conflict with the site's bottom navigation bar.

## [5.3.1] - 2025-11-06

### ✨ Added
- Complete refactoring to a modern **ES6 modular architecture**.
- **Multi-API Key Support** with rotation and cooldowns.
- **Deep Analysis** feature with multiple iterations.
- **Session Persistence** for saving and restoring results.
- **Advanced Filtering** and an enhanced, responsive UI.
- Seamless integration with the **Term Replacer** userscript.
- **GitHub Actions** for automated CI builds.

### ♻️ Changed
- Migrated the build system to **webpack-userscript**.
- Reorganized the codebase into focused modules (`api`, `state`, `ui`, `utils`).
- Improved error handling with exponential backoff.

### 🐛 Fixed
- Addressed various bugs related to session restoration, memory leaks, API rate limiting, and UI responsiveness.

## [5.2.0] - 2025-10-XX (Legacy)

### ✨ Added
- Initial AI-powered inconsistency detection.
- Priority-based result filtering.

## [5.1.0] - 2025-09-XX (Legacy)

### ✨ Added
- Initial integration with the Gemini AI.
- Basic chapter data extraction and results display.

---

**Note**: This changelog documents the evolution of the WTR Lab Term Inconsistency Finder from its initial release through the current modular architecture. The project follows semantic versioning and maintains backward compatibility for user configurations while introducing new features and improvements.