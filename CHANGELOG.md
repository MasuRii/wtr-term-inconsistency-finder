# Changelog

All notable changes to the WTR Lab Term Inconsistency Finder will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

- **v5.3.1**: Current - Modular architecture with advanced features
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