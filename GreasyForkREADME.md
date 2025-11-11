# 🤖 WTR Lab Term Inconsistency Finder

[![WTR Lab Term Inconsistency](https://pixvid.org/images/2025/11/11/kBrXW.gif)](https://pixvid.org/image/kBrXW)

A powerful userscript that uses Google Gemini AI to find translation inconsistencies in WTR Lab chapters. Keep your translations clean and professional!

---

## 🚀 Quick Install & Setup

**1. Install a Userscript Manager** (if you don't have one)
   - [Tampermonkey](https://www.tampermonkey.net/) (Recommended)
   - [Violentmonkey](https://violentmonkey.github.io/)

**2. Install this Script**
   - Click the big green "Install this script" button at the top of this page.

**3. Get a FREE Google Gemini API Key**
   - This script **requires** an API key to work.
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey) to create your key.

**4. Add the Key to the Script**
   - Open any WTR Lab chapter.
   - Click the Finder icon (🔍).
   - Go to the "Configuration" tab, paste your key, and click "Save".

That's it! You're ready to start analyzing.

## 🎯 Features

-   **Find Inconsistencies**: Automatically detects when a term is translated differently across chapters.
-   **AI-Powered**: Uses advanced AI to understand context and reduce false positives.
-   **Smart Filtering**: Filter results by priority (Critical, High, Medium, Low).
-   **Session Memory**: Saves your analysis so you can continue later.
-   **Easy Fixes**: Integrates with the [WTR Lab Term Replacer](https://github.com/MasuRii/wtr-lab-term-replacer) script to apply fixes directly.

## 💡 How to Use

1.  **Open Chapters**: Navigate to the WTR Lab novel you want to check.
2.  **Launch Panel**: Click the Finder icon (🔍) in the top-right corner.
3.  **Start Analysis**: Select the chapters you want to analyze and click "Start Analysis".
4.  **Review Results**: The script will display a list of potential inconsistencies, sorted by priority.
5.  **Apply or Copy Fixes**: Click the suggested term to apply it (if using the Term Replacer script) or copy it.

## 🐛 Troubleshooting

-   **Analysis button (🔍) doesn't appear?**
    -   Make sure the script is enabled in Tampermonkey.
    -   Refresh the WTR Lab page.

-   **Getting API errors?**
    -   Double-check that your API key is correct in the Configuration tab.
    -   Your free API key might have hit its daily limit. You can add multiple keys in the settings for automatic rotation.

-   **No results found?**
    -   Analysis works best with 5+ chapters. Try adding more.
    -   Consider using "Deep Analysis" in the settings for a more thorough scan.

## 🔒 Privacy & Security

-   **Your Data is Yours**: All chapter text is processed locally in your browser and sent directly to the Google Gemini API. It is never stored on any third-party server.
-   **Secure Communication**: All API calls are made over HTTPS.
-   **Open Source**: The full source code is available on [GitHub](https://github.com/MasuRii/wtr-term-inconsistency-finder) for you to review.

## 💬 Support & Source Code

-   **Report an Issue**: [GitHub Issues](https://github.com/MasuRii/wtr-term-inconsistency-finder/issues)
-   **Ask a Question**: [GitHub Discussions](https://github.com/MasuRii/wtr-term-inconsistency-finder/discussions)
-   **View the Code**: [GitHub Repository](https://github.com/MasuRii/wtr-term-inconsistency-finder)

---

_For advanced configuration and developer information, please see the [main README on GitHub](https://github.com/MasuRii/wtr-term-inconsistency-finder)._