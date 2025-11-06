# WTR Lab Term Inconsistency Finder

A powerful userscript that finds translation inconsistencies in WTR Lab chapters using Google Gemini AI. Perfect for translators, proofreaders, and anyone who wants to maintain consistency in WTR Lab novels.

## 🚀 Quick Install

1. **Install a userscript handler** (if you haven't already):
   - [Tampermonkey](https://www.tampermonkey.net/) (most popular)
   - [Violentmonkey](https://violentmonkey.github.io/)
   - [Greasemonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) (Firefox)

2. **Install the script**:
   - Click "Install" on this Greasy Fork page
   - Your userscript handler will prompt for installation

3. **Start using**:
   - Navigate to any WTR Lab chapter
   - Look for the analysis button (🔍 icon)
   - Click it to begin finding inconsistencies

## ⚙️ Setup

### API Key Requirements

**This script requires a Google Gemini API key to work:**

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key (it's free to start)
3. Open the script settings by clicking the analysis button
4. Go to the "Configuration" tab
5. Paste your API key in the "API Keys" field
6. Click "Save Configuration"

**Multiple API Keys**: You can add multiple keys for automatic rotation when one hits rate limits.

## 🎯 What It Does

- **Finds Translation Inconsistencies**: Detects when the same term is translated differently across chapters
- **AI-Powered Analysis**: Uses advanced language models to understand context
- **Smart Filtering**: Filter results by priority (Critical, High, Medium, Low, etc.)
- **Session Memory**: Saves your analysis results so you can continue later
- **Easy Fixes**: Apply suggested replacements directly to the text

## 🔧 How to Use

1. **Configure API Keys** (see Setup above)
2. **Navigate to WTR Lab chapters** you want to analyze
3. **Click the analysis button** (🔍) in the top-right corner
4. **Wait for analysis** (30-60 seconds for 5-10 chapters)
5. **Review results** in the results panel
6. **Apply fixes** by clicking on suggestions or using bulk actions

### Analysis Options

- **Single Analysis**: Quick scan (1 iteration)
- **Deep Analysis**: Thorough investigation (2-5 iterations)
- **Priority Filtering**: Show only critical issues
- **Status Filtering**: See new findings vs. previously reviewed

## 📱 Interface Features

- **Clean, Modern Design**: Works on all devices and screen sizes
- **Real-time Progress**: See analysis progress with live updates
- **Organized Results**: Grouped by priority and status
- **Search and Filter**: Find specific terms or issues quickly
- **Settings Panel**: Easy configuration without code

## 💡 Pro Tips

- **Use Multiple Chapters**: Analysis works best with 5-10+ chapters
- **Deep Analysis**: For thorough review, use 2-3 analysis iterations
- **API Key Management**: Add multiple keys to avoid rate limits
- **Session Persistence**: Results auto-save, you can close and return later
- **Integration**: Works great with other WTR Lab extensions

## 🆘 Troubleshooting

**No analysis button?**
- Check the script is enabled in your userscript handler
- Refresh the page after installation
- Ensure you're on a WTR Lab chapter page

**Getting API errors?**
- Verify your API key is correct
- Check your [Google AI Studio quota](https://makersuite.google.com/)
- Try adding another API key for rotation

**No results found?**
- Try analyzing more chapters (minimum 2-3 recommended)
- Check if chapters have significant text content
- Enable debug mode in settings for more details

**Script not responding?**
- Refresh the page
- Check browser console for error messages
- Try disabling other conflicting extensions

## 🔒 Privacy & Security

- **Local Processing**: All analysis happens in your browser
- **Secure API Calls**: Uses HTTPS to communicate with Google's servers
- **No Data Storage**: Your content isn't stored on external servers
- **Open Source**: Full source code available on GitHub for transparency

## 📋 System Requirements

- **Browser**: Chrome, Firefox, Safari, or Edge
- **Userscript Handler**: Tampermonkey, Violentmonkey, or Greasemonkey
- **Internet**: Required for AI analysis via Google Gemini API
- **WTR Lab**: Works with WTR Lab chapter pages

## 💬 Support

- **Issues**: [Report problems on GitHub](https://github.com/MasuRii/wtr-term-inconsistency-finder/issues)
- **Feature Requests**: [GitHub Discussions](https://github.com/MasuRii/wtr-term-inconsistency-finder/discussions)
- **Source Code**: [View on GitHub](https://github.com/MasuRii/wtr-term-inconsistency-finder)

## 🙏 Credits

- **Google Gemini AI**: For the powerful language model
- **WTR Lab**: For the excellent web novel platform
- **Greasy Fork**: For hosting userscripts
- **Community**: For feedback and testing

---

**Made with ❤️ for the WTR Lab translation community**

*For detailed development information and advanced usage, see the [main README on GitHub](https://github.com/MasuRii/wtr-term-inconsistency-finder).*