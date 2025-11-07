# WTR Lab Term Inconsistency Finder

A sophisticated userscript for finding translation inconsistencies in WTR Lab chapters using the Gemini AI API. Built with a modern, modular architecture for maintainability and advanced features.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-5.3.3.svg)](https://github.com/MasuRii/wtr-term-inconsistency-finder)
[![Greasy Fork](https://img.shields.io/badge/Greasy%20Fork-Install-green.svg)](https://greasyfork.org/en/scripts/554989-wtr-lab-term-inconsistency-finder)

## 🚀 Quick Install (Recommended)

**For most users, we recommend installing directly from Greasy Fork:**

1. Install any userscript handler extension (like [Tampermonkey](https://www.tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/), etc.)
2. [Install from Greasy Fork](https://greasyfork.org/en/scripts/554989-wtr-lab-term-inconsistency-finder)
3. Navigate to any WTR Lab chapter
4. Click the analysis button to start finding inconsistencies

**Source Code**: Available on [GitHub](https://github.com/MasuRii/wtr-term-inconsistency-finder)

## 🎯 Features

- **🤖 AI-Powered Analysis**: Uses Google's Gemini AI to detect translation inconsistencies
- **🔄 Multi-API Key Support**: Smart rotation and cooldown management for multiple API keys
- **🔍 Deep Analysis**: Multiple analysis iterations for comprehensive results
- **💾 Session Persistence**: Auto-save and restore analysis results
- **🎛️ Advanced Filtering**: Filter by priority level, new vs verified findings
- **📱 Responsive UI**: Clean, modern interface that works on all devices
- **🛠️ Term Replacement**: Built-in integration with Term Replacer extension
- **📊 Real-time Status**: Live progress indicators and detailed logging

## 🛠️ Development Setup

### Prerequisites

- Node.js 16+ and npm
- Any userscript handler extension (like [Tampermonkey](https://www.tampermonkey.net/), [Violentmonkey](https://violentmonkey.github.io/), etc.)
- Google Gemini API key(s)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/MasuRii/wtr-term-inconsistency-finder.git
   cd wtr-term-inconsistency-finder
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure API keys**

   - Create `.env` file (optional, for local testing):

   ```
   GEMINI_API_KEY=your_api_key_here
   ```

   - Or add them through the script's UI

4. **Start development server**

   ```bash
   npm run dev
   ```

   - Opens development server on `http://localhost:8080`
   - Produces proxy script for hot reload testing
   - Watch for changes and auto-rebuild

5. **Build for production**
   ```bash
   npm run build
   ```
   - Creates `dist/wtr-term-inconsistency-finder.user.js`
   - Ready for Tampermonkey installation

## 📁 Project Structure

```
wtr-term-inconsistency-finder/
├── src/
│   ├── index.js              # Main entry point
│   ├── modules/
│   │   ├── geminiApi.js      # AI API integration
│   │   ├── state.js          # State management
│   │   ├── utils.js          # Utility functions
│   │   └── ui/               # User interface modules
│   │       ├── display.js    # Results display
│   │       ├── events.js     # Event handling
│   │       ├── index.js      # UI exports
│   │       └── panel.js      # Main panel UI
│   └── styles/
│       └── main.css          # All styles
├── dist/                     # Build output (gitignored)
├── webpack.config.js         # Webpack configuration
├── package.json             # Dependencies and scripts
├── .gitignore              # Git ignore rules
└── LICENSE                 # MIT License
```

## 🚀 Usage

### For End Users (Userscript Handler Installation)

1. **Install the script**

   - Download the built `.user.js` file from the repository
   - Open in browser with any userscript handler (Tampermonkey, Violentmonkey, etc.) installed
   - Follow installation prompts

2. **Configure API keys**

   - Open the script panel (click the analysis button)
   - Go to Configuration tab
   - Add your Gemini API keys (multiple supported)
   - Select preferred AI model
   - Adjust temperature and other settings

3. **Start analyzing**
   - Navigate to any WTR Lab chapter
   - Click the analysis button (🔍 icon)
   - Wait for AI analysis to complete
   - Review and apply suggested fixes

### For Developers

1. **Local development with hot reload**

   ```bash
   npm run dev
   ```

   - Creates proxy script that auto-reloads
   - Test changes in real-time
   - Check console for detailed logs

2. **Production build**

   ```bash
   npm run build
   ```

   - Minified, single-file output
   - Ready for distribution
   - Optimized for performance

3. **Testing workflow**
   - Install proxy script in Tampermonkey
   - Make code changes
   - Check proxy script auto-updates
   - Test on WTR Lab chapters

## ⚙️ Configuration

### Required Settings

- **API Keys**: At least one Google Gemini API key
- **Model**: Select from available Gemini models
- **Temperature**: AI creativity level (0.0-1.0)

### Optional Settings

- **Deep Analysis Depth**: Number of analysis iterations (1-5)
- **Auto-restore Results**: Automatically load previous session
- **Enable Debug Logging**: Detailed console output
- **Use Term Replacer JSON**: Integration with term replacement

### API Key Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it through the script's Configuration tab
4. For multiple keys, add them all for automatic rotation

## 🔧 API Key Management

The script supports multiple API keys with smart rotation:

- **Automatic Rotation**: Switches to next key on errors
- **Cooldown Management**: Tracks rate-limited keys
- **Retry Logic**: Intelligent retry with backoff
- **Error Handling**: Graceful handling of API failures

## 🎯 Features Deep Dive

### Deep Analysis

Run multiple analysis iterations for comprehensive results:

- **Single Analysis** (1 iteration): Quick scan
- **Deep Analysis** (2-5 iterations): Thorough investigation
- Each iteration builds on previous findings
- Automatic result merging and deduplication

### Session Persistence

- Results auto-save to browser storage
- Continue analysis from where you left off
- Session data includes timestamp and config
- Restore previous results on panel open

### Smart Filtering

- **Priority Levels**: CRITICAL, HIGH, MEDIUM, LOW, STYLISTIC, INFO
- **Status Filters**: New items, verified items, all items
- **Real-time Updates**: Instant filter application

### Term Replacement Integration

- Seamless integration with Term Replacer extension
- Apply fixes directly to text
- Support for both simple and regex replacements
- Selected or bulk application

## 🐛 Troubleshooting

### Common Issues

**Script not loading?**

- Check Tampermonkey is enabled
- Verify script is activated for WTR Lab domain
- Check browser console for errors

**API errors?**

- Verify API keys are valid
- Check rate limits haven't been exceeded
- Try switching to a different model
- Enable debug logging for details

**No results found?**

- Ensure you have multiple chapters loaded
- Check if text is in the expected format
- Try increasing analysis depth
- Verify AI model supports the content length

**UI not responsive?**

- Disable other conflicting extensions
- Try refreshing the page
- Clear Tampermonkey storage
- Reinstall the script

### Debug Mode

Enable debug logging in Configuration tab for detailed information:

- API request/response logs
- Analysis progress updates
- Error details and stack traces
- Performance metrics

### Performance Tips

- Use fewer chapters for faster analysis
- Lower temperature for more consistent results
- Clear session data if results become too large
- Monitor API usage to avoid rate limits

## 📈 Performance

- **Analysis Speed**: 30-60 seconds for 5-10 chapters
- **Memory Usage**: ~50-100MB during analysis
- **Network**: Optimized API requests with retry logic
- **Storage**: Minimal local storage footprint

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines

1. **Code Style**: Follow existing patterns
2. **Modularity**: Keep functions small and focused
3. **Testing**: Test on real WTR Lab chapters
4. **Documentation**: Update README and comments
5. **Performance**: Consider memory and speed impacts

### Setup Development Environment

1. Fork the repository
2. Create a feature branch
3. Install dependencies
4. Run development server
5. Make your changes
6. Test thoroughly
7. Submit a pull request

## 📜 Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and changes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI**: For providing the powerful language model
- **WTR Lab**: For the excellent web novel platform
- **Tampermonkey**: For the userscript management system
- **Webpack Userscript Plugin**: For the build tool integration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/MasuRii/wtr-term-inconsistency-finder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MasuRii/wtr-term-inconsistency-finder/discussions)
- **Greasy Fork**: [Script Page](https://greasyfork.org/en/scripts/554989-wtr-lab-term-inconsistency-finder)

## 🏗️ Build System

The project uses a modern webpack-based build system:

- **Development**: `npm run dev` - Hot reload with proxy script
- **Production**: `npm run build` - Minified single-file output
- **Module System**: ES6 modules with webpack bundling
- **CSS Processing**: Automatic style injection
- **Userscript Headers**: Auto-generated from webpack config

### Build Outputs

- **Development**: Proxy script with hot reload support
- **Production**: Minified `.user.js` file ready for installation
- **Headers**: Greasyfork-compliant metadata and permissions
- **Assets**: All styles and scripts bundled inline

---

**Made with ❤️ for the WTR Lab community**
