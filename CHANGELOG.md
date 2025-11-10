# Changelog

All notable changes to the WTR Lab Term Inconsistency Finder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [5.3.6] - 2025-11-10

### Added
- **WTR Lab Term Replacer Integration Mode Switcher**:
  - Introduced runtime detection via [`src/modules/utils.isWTRLabTermReplacerLoaded()`](src/modules/utils.js:982) to differentiate between:
    - Using the original WTR site term replacer.
    - Using the external WTR Lab Term Replacer userscript and JSON compatibility mode.
  - Added clear configuration messaging and link to the supported external userscript, so users can explicitly choose their integration mode.

### Changed
- **Gemini Prompt Refinement**: Updated the advanced system prompt in [`src/modules/geminiApi.js`](src/modules/geminiApi.js:20) to explicitly exclude non-user-actionable chapter title numbering discrepancies that originate from WTR Lab site-level or template-level behavior (such as systematic off-by-one chapter title patterns).
- **Finder Tab Layout Stability**:
  - Ensured the Finder tab preserves all intended sections:
    - Primary Analysis Controls
    - Deep Analysis Configuration
    - Filter and Display Controls
    - Results Display Area
  - Restricted dynamic rendering to the dedicated `#wtr-if-results` container so structural UI elements are never cleared when updating results.
- **Panel Stacking Order**:
  - Updated `#wtr-if-panel` to use `z-index: 1040` (via [`src/styles/panel.css`](src/styles/panel.css:11)) so the Inconsistency Finder panel consistently appears above the site’s bottom navigator while remaining independent from status widget stacking.

### Fixed
- **Status Widget Collision and Jitter**:
  - Refined collision logic in [`src/modules/ui/panel.js`](src/modules/ui/panel.js:441) so the status widget:
    - Defaults to `bottom: var(--nig-space-xl, 20px)` in normal conditions.
    - Only moves up to the conflict offset (e.g., `80px`) when a visible NIG status widget (or equivalent external status widget) actually overlaps the default position.
    - Ignores the site’s bottom reader navigator for vertical repositioning (it no longer causes spurious jumps), while preserving correct z-index ordering.
- **Dynamic Apply/Copy Behavior for Finder Actions**:
  - Centralized Apply/Copy mode handling in [`src/modules/ui/events.updateApplyCopyButtonsMode()`](src/modules/ui/events.js:286) so all Finder action buttons (global and per-result, including session-restored ones):
    - Show and use "Apply Selected"/"Apply All" (with `apply-*` actions) only when the external WTR Lab Term Replacer userscript is detected.
    - Show and use "Copy Selected"/"Copy All" (with `copy-*` actions) when the external userscript is not detected.
  - Ensured [`src/modules/ui/events.handleApplyClick()`](src/modules/ui/events.js:347) routes strictly by `data-action`:
    - `apply-*` → dispatches `wtr:addTerm` to the external replacer (when available).
    - `copy-*` → produces non-destructive clipboard output in the format:
      - `Term: variant1|variant2|...`
      - `Replaced: chosenSuggestion`
    - Prevents accidental apply attempts when the external replacer is unavailable.
- **Smart Quotes Safety and Correctness**:
  - Reworked smart quote handling in [`src/modules/utils.smartenQuotes()`](src/modules/utils.js:54) and [`applySmartQuotesReplacement()`](src/modules/utils.js:186) to:
    - Be conservative and context-aware for apostrophes and quotes.
    - Preserve existing smart quotes.
    - Include anomaly detection to prevent explosive or corrupt transformations (with automatic fallback to original text).
    - Respect a `smartQuotesEnabled` configuration flag.
- **API Backoff and Final Failure State**:
  - Enhanced [`src/modules/geminiApi.js`](src/modules/geminiApi.js:30) with:
    - Exponential backoff for retriable errors (2s, 4s, 8s, capped, with a global time window).
    - Clear final failure conditions when all keys/retries are exhausted.
    - Preservation of existing key rotation and cooldown behavior.
    - Robust error handling to avoid tight retry loops and silent failures.
- **Semantic Duplicate Merging Hardening**:
  - Updated merging and similarity logic in [`src/modules/utils.js`](src/modules/utils.js:558) to:
    - Incorporate script-aware checks (Latin/CJK/Cyrillic) and proper-name heuristics.
    - Block cross-script or low-quality merges (e.g., preventing "Rhode" from merging with "雜物").
    - Ensure replacement regexes are built only from the variations of the selected concept.

## [5.3.5] - 2025-11-10

### Added
- **Multi-Build System**: Implemented comprehensive webpack multi-target build system with performance, GreasyFork, and development builds
- **Enhanced Development Workflow**: Complete auto-formatting and auto-fixing pipeline with Prettier, ESLint, and Stylelint integration
- **Professional Build Pipeline**: Automated build process with CSS linting fixes, userscript validation, and version management

### Changed
- **Build Command Enhancement**: Updated `npm run build` to include full auto-fix capabilities (`lint:fix` instead of `lint:check`)
- **CSS Processing**: Added proper CSS loader configuration for webpack to handle `@import` statements and style processing
- **Linting System**: Complete integration of automated code quality checks with auto-fix capabilities
- **Development Experience**: Streamlined development workflow with comprehensive formatting and linting

### Fixed
- **CSS Linting Errors**: Resolved selector ordering and duplicate selector issues in `src/styles/results.css`
- **Userscript Validation**: Fixed webpack userscript header validation by removing conflicting `homepage` field from `package.json`
- **CSS Import Processing**: Added missing CSS loader configuration to properly handle `@import` statements
- **Build Pipeline**: Resolved webpack build failures related to CSS processing and userscript metadata validation

### Technical
- **Webpack Configuration**: Enhanced multi-target webpack configuration with CSS loaders for all build types
- **CSS Architecture**: Maintained modular CSS structure with proper import handling and build optimization
- **Version Management**: Improved version synchronization across all build artifacts and metadata files
- **Quality Assurance**: Full integration of automated formatting and linting in the build pipeline
- **Build Artifacts**: Optimized output for performance (93.5 KiB), GreasyFork (159 KiB), and development (159 KiB) builds

### Infrastructure
- **Development Tools**: Complete setup for Prettier, ESLint, and Stylelint with auto-fix capabilities
- **Build Targets**: Professional build system supporting multiple distribution formats
- **Code Quality**: Automated code formatting, linting, and validation in the build process

## [5.3.3] - 2025-11-07

### Added
- **Smart Quotes Replacement System**: Implemented smart quotes replacement that runs BEFORE terms replacement to avoid inconsistencies due to quotation issues
- **Active Chapter Skipping**: Both smart quotes and terms replacement now skip processing on chapters with the "chapter-tracker active" class to avoid conflicts with other userscripts

### Fixed
- **Status Indicator Positioning**: Adjusted status indicator positioning to avoid collision with the existing NIG status widget
  - Normal position: bottom: 50px (increased from 20px)
  - When conflicts detected: bottom: 110px (increased from 80px)
  - Maintains z-index management for proper layering

### Technical
- **Processing Order**: Changed order of operations to: smart quotes replacement → terms replacement
- **Chapter Detection**: Enhanced chapter data collection to include tracker element references for proper active chapter detection
- **Conflict Avoidance**: Active chapters are now skipped in both smart quotes and term replacement processes

## [5.3.2] - 2025-11-06

### Fixed
- **Quote Handling False Positives**: Enhanced AI prompt to prevent flagging terms that differ only in quote styles (straight quotes ", single quotes ', or smart quotes " " ' '). This resolves false positives caused by different chapters being processed by different quote conversion scripts.
- **Auto-Restore Configuration Bug**: Fixed persistence issue where "Auto-restore saved results on panel open" setting would not save when disabled. Configuration now properly persists user preferences.
- **Bottom Navigation Conflict**: Fixed z-index conflict between status indicator and site bottom navigation. Status indicator now properly hides behind the bottom nav when visible to prevent visual overlap.

### Technical
- **AI Prompt Enhancement**: Added critical quote normalization logic to distinguish between genuine text inconsistencies and formatting differences
- **Configuration Management**: Improved save/load mechanism to properly handle user preferences
- **Z-Index Management**: Dynamic z-index adjustment based on bottom navigation presence (z-index: 1029 when bottom nav is visible, 10000 when hidden)

## [5.3.1] - 2025-11-06

### Added
- **Modular Architecture**: Complete refactoring to modern ES6 modules for better maintainability
- **Multi-API Key Support**: Smart rotation and cooldown management for multiple Gemini API keys
- **Deep Analysis**: Multiple analysis iterations (1-5) for comprehensive results
- **Session Persistence**: Auto-save and restore analysis results with continuation support
- **Advanced Filtering**: Filter by priority levels, new vs verified findings
- **Enhanced UI**: Modern, responsive interface with section-based layout
- **Term Replacer Integration**: Seamless integration with Term Replacer extension
- **Real-time Status**: Live progress indicators and detailed logging
- **Context Summarization**: Intelligent handling of large result sets to prevent UI overload
- **Smart Result Merging**: Quality-based conflict resolution for multiple analysis runs
- **Enhanced Alias Detection**: Improved recognition of intentional aliases vs true inconsistencies
- **Data Sanitization**: Automatic cleanup of corrupted suggestion data from restored sessions
- **GitHub Actions**: Automated build workflow for continuous integration
- **Comprehensive Documentation**: Detailed README with installation and development guides

### Changed
- **Build System**: Migrated to webpack-userscript for professional builds
- **Code Organization**: Split monolith into focused modules (api, state, ui, utils)
- **Error Handling**: Enhanced retry logic with exponential backoff
- **Performance**: Optimized memory usage and response processing
- **User Experience**: Streamlined configuration workflow
- **API Integration**: Improved model fetching and validation
- **Session Management**: More robust storage and recovery mechanisms

### Fixed
- **Quote Handling False Positives**: Enhanced AI prompt to prevent flagging terms that differ only in quote styles (straight quotes, smart quotes, curly quotes) - caused by different chapters being processed by different quote conversion scripts
- **Auto-Restore Configuration Bug**: Fixed persistence issue where "Auto-restore saved results on panel open" setting would not save when disabled
- **Session Restoration**: Fixed corrupted suggestion data handling
- **Memory Leaks**: Resolved issues with large analysis result sets
- **API Rate Limiting**: Improved cooldown and rotation logic
- **UI Responsiveness**: Enhanced performance for large result displays
- **Build Artifacts**: Proper .gitignore and distribution setup
- **Development Workflow**: Hot reload proxy script functionality

### Technical
- **Architecture**: ES6 modules with clean separation of concerns
- **Build Output**: Single-file bundle ready for Greasy Fork distribution
- **Development**: Hot reload support with proxy script
- **Testing**: Local development server with auto-rebuild
- **Distribution**: GitHub Actions for automated builds
- **Documentation**: Comprehensive developer and user guides
- **Quote Normalization**: AI prompt enhancement for smarter quote-style inconsistency detection
- **Configuration Management**: Improved save/load mechanism for user preferences

## [5.2.0] - 2025-10-XX (Legacy)

### Added
- Initial AI-powered inconsistency detection
- Basic UI implementation
- API key management
- Priority-based result filtering

### Changed
- Improved AI prompting
- Better error handling
- UI refinements

### Fixed
- API response parsing
- Memory optimization
- Session management

## [5.1.0] - 2025-09-XX (Legacy)

### Added
- Basic Gemini AI integration
- Chapter data extraction
- Results display system
- Configuration management

### Technical
- Initial monolithic structure
- Basic webpack setup
- UI framework integration

## Version History

- **v5.3.5**: Current - Multi-build system with comprehensive development workflow
- **v5.3.3**: Smart quotes system with active chapter detection
- **v5.3.2**: Fixed quote handling and UI conflicts
- **v5.3.1**: Modular architecture with advanced features
- **v5.2.0**: Legacy - Enhanced AI integration
- **v5.1.0**: Legacy - Initial AI-powered version
- **v5.0.0**: Legacy - Basic inconsistency detection

## Installation Notes

### For Users
- Install latest version from [Greasy Fork](https://greasyfork.org/en/scripts/554989-wtr-lab-term-inconsistency-finder)
- Supports auto-updates via @updateURL
- Requires Tampermonkey browser extension

### For Developers
- Clone repository and run `npm install`
- Use `npm run dev` for development with hot reload
- Use `npm run build` for production builds
- See README.md for detailed setup instructions

## Upcoming Features

### Planned for v5.4.0
- Enhanced localization support
- Additional AI model support
- Performance optimizations
- Mobile UI improvements

### Future Roadmap
- Batch chapter processing
- Advanced analytics dashboard
- Community-driven rule sets
- Multi-language support

## Breaking Changes

### v5.3.0 Migration
- **API Keys**: Migrated from single key to array format (auto-migrated)
- **UI Layout**: Completely redesigned interface (backward compatible)
- **Configuration**: Enhanced settings with new options
- **Build System**: New webpack-based build (affects developers only)

### Migration Assistance
- Existing configurations are automatically migrated
- No user action required for updates
- Previous session data is preserved and sanitized

## Support

For issues, feature requests, or questions:
- **GitHub Issues**: [Create an issue](https://github.com/MasuRii/wtr-term-inconsistency-finder/issues)
- **Discussions**: [Join discussions](https://github.com/MasuRii/wtr-term-inconsistency-finder/discussions)
- **Greasy Fork**: Script page with community feedback

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines and contribution process.

---

**Note**: This changelog documents the evolution of the WTR Lab Term Inconsistency Finder from its initial release through the current modular architecture. The project follows semantic versioning and maintains backward compatibility for user configurations while introducing new features and improvements.