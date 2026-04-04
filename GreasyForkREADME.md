# 🤖 WTR Lab Term Inconsistency Finder

[![Version](https://img.shields.io/badge/version-5.4.1-blue)](https://github.com/MasuRii/wtr-term-inconsistency-finder/blob/main/CHANGELOG.md)

[![WTR Lab Term Inconsistency](https://pixvid.org/images/2025/11/11/kBrXW.gif)](https://pixvid.org/image/kBrXW)

A powerful userscript that uses AI (Google Gemini or OpenAI-compatible APIs) to find translation inconsistencies in WTR Lab chapters. When WTR Lab Term Replacer is also installed, Finder can reuse its live term list automatically during analysis, while still letting you keep Finder fully independent if you prefer.

---

## 🚀 Quick Install & Setup

**1. Install a Userscript Manager** (if you don't have one)
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)

**2. Install this Script**
   - Click the big green "Install this script" button at the top of this page.

**3. Get an API Key**
   - This script **requires** an API key to work.
   - **Google Gemini** (Free): Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - **OpenAI-Compatible** (OpenAI, local models, Ollama, etc.): Use your provider's API key and base URL

**4. Configure the Script**
   - Open any WTR Lab chapter.
   - Click the Finder icon (🔍).
   - Go to the "Configuration" tab.
   - Select your provider type (Gemini or OpenAI-Compatible).
   - Paste your API key and adjust the base URL if using a custom provider.
   - Click "Save".

That's it! You're ready to start analyzing.

## 🎯 Features

-   **Find Inconsistencies**: Automatically detects when a term is translated differently across chapters.
-   **Multi-Provider Support**: Works with Google Gemini or any OpenAI-compatible API (OpenAI, Ollama, local models, self-hosted solutions).
-   **AI-Powered**: Uses advanced AI to understand context and reduce false positives.
-   **Smart Filtering**: Filter results by priority (Critical, High, Medium, Low).
-   **Session Memory**: Saves your analysis so you can continue later.
-   **Easy Fixes**: Integrates with the [WTR Lab Term Replacer](https://github.com/MasuRii/wtr-lab-term-replacer) script to apply fixes directly.
-   **Live Term Sync**: Automatically reuses the current novel's live Term Replacer list during analysis when both scripts are installed.
-   **Optional Toggle**: Turn live sync off if you want Finder to ignore Term Replacer and operate on its own.

## 💡 How to Use

1.  **Open Chapters**: Navigate to the WTR Lab novel you want to check.
2.  **Launch Panel**: Click the Finder icon (🔍) in the top-right corner.
3.  **Start Analysis**: Select the chapters you want to analyze and click "Start Analysis".
4.  **Choose Integration Mode (Optional)**: If Term Replacer is installed, you can let Finder reuse live terms automatically, disable that behavior, or enable JSON mode as a manual override.
5.  **Review Results**: The script will display a list of potential inconsistencies, sorted by priority.
6.  **Apply or Copy Fixes**: Click the suggested term to apply it (if using the Term Replacer script) or copy it.

## 🐛 Troubleshooting

-   **Analysis button (🔍) doesn't appear?**
    -   Make sure the script is enabled in Tampermonkey.
    -   Refresh the WTR Lab page.

-   **Getting API errors?**
    -   Double-check that your API key is correct in the Configuration tab.
    -   If using a custom provider, verify the base URL is correct (e.g., `http://localhost:11434/v1` for Ollama).
    -   Your free API key might have hit its daily limit. You can add multiple keys in the settings for automatic rotation.

-   **No results found?**
    -   Analysis works best with 5+ chapters. Try adding more.
    -   Consider using "Deep Analysis" in the settings for a more thorough scan.

## 🔒 Privacy & Security

-   **Your Data is Yours**: All chapter text is processed locally in your browser and sent directly to your configured AI API endpoint. It is never stored on any third-party server.
-   **Secure Communication**: All API calls are made over HTTPS.
-   **Open Source**: The full source code is available on [GitHub](https://github.com/MasuRii/wtr-term-inconsistency-finder) for you to review.

## 💬 Support & Source Code

-   **Report an Issue**: [GitHub Issues](https://github.com/MasuRii/wtr-term-inconsistency-finder/issues)
-   **Ask a Question**: [GitHub Discussions](https://github.com/MasuRii/wtr-term-inconsistency-finder/discussions)
-   **View the Code**: [GitHub Repository](https://github.com/MasuRii/wtr-term-inconsistency-finder)

---

_For advanced configuration and developer information, please see the [main README on GitHub](https://github.com/MasuRii/wtr-term-inconsistency-finder)._