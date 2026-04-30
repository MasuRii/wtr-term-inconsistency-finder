# WTR Lab Term Inconsistency Finder

[![Version](https://img.shields.io/badge/version-5.5.1-blue)](https://github.com/MasuRii/wtr-term-inconsistency-finder/blob/main/CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Greasy Fork](https://img.shields.io/badge/Install-Greasy%20Fork-green.svg)](https://greasyfork.org/en/scripts/554989-wtr-lab-term-inconsistency-finder)

[![WTR Lab Term Inconsistency](https://pixvid.org/images/2025/11/11/kBrXW.gif)](https://pixvid.org/image/kBrXW)

A userscript for finding translation term inconsistencies in WTR Lab chapters. It supports Google Gemini and OpenAI-compatible providers, can rotate multiple API keys, can reuse live terms from WTR Lab Term Replacer, and includes shareable debug reports for issue reporting.

## Features

- AI-assisted inconsistency detection with Gemini or OpenAI-compatible APIs.
- Simple provider setup using provider type, base URL, API keys, and model selection.
- Automatic OpenAI-compatible endpoint handling for common bases such as OpenAI, Ollama, OpenRouter, Groq, Together, DeepSeek, and Gemini OpenAI compatibility.
- Advanced endpoint path overrides hidden behind troubleshooting controls for non-standard providers.
- Enriched OpenAI-compatible model catalog support, including optional metadata for context length, output limits, pricing, capabilities, supported parameters, and latest-alias targets.
- Metadata-aware request serialization that avoids unsupported options such as temperature or reasoning effort when a provider advertises those limits.
- Configurable temperature and reasoning/thinking effort with provider-aware request serialization.
- Multiple API keys with rotation, cooldown state, saved configuration migration, and a show/hide API key toggle in the modal.
- Deep analysis carries findings forward between iterations, verifies them in later passes, and downgrades uncertain findings to Needs Review instead of silently dropping or over-confirming them.
- Session persistence for continuing analysis later.
- Optional live sync with WTR Lab Term Replacer terms and optional JSON import fallback.
- Optional WTR Lab reader API source mode for directly fetching nearby or custom chapter ranges without relying only on loaded page content.
- Optional WTR Lab official glossary context with compact relevance filtering to reduce alias false positives and improve suggestions.
- Debug logging mode with copy-ready, redacted Markdown reports for easier issue reporting.
- Responsive modal UI for desktop and mobile.

## Installation

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Install the script from [Greasy Fork](https://greasyfork.org/en/scripts/554989-wtr-lab-term-inconsistency-finder).
3. Open a WTR Lab chapter and click the Finder control.
4. In Configuration, choose Gemini or OpenAI-Compatible, enter your API key, set the base URL, refresh models, select a model, and save.

For OpenAI-compatible providers, enter the base URL only. Examples: `https://api.openai.com/v1`, `http://localhost:11434/v1`, `https://openrouter.ai/api/v1`, or `https://api.groq.com/openai/v1`. Manual chat/models paths are available only in Advanced endpoint troubleshooting.

## Usage

1. Open the Finder panel on a WTR Lab chapter.
2. Configure provider, API keys, model, temperature, and optional reasoning/thinking effort.
3. Use Show Keys only when you need to inspect or edit saved API key values.
4. Choose the chapter source in the Finder tab:
   - Loaded page chapters analyzes chapters already present in the page DOM.
   - WTR Lab reader API can fetch the current chapter with nearby chapters or a custom chapter range.
5. Choose whether to use WTR Lab official glossary context and live Term Replacer sync when available.
6. Start analysis from the Finder tab.
7. Review results, including Verified and Needs Review badges, then filter by priority/status and apply through Term Replacer or copy suggestions.

## Chapter Sources and Glossary Context

The Finder supports two chapter sources:

- Loaded page chapters: Uses chapter text already rendered on the WTR Lab page. This is the safest fallback and matches earlier behavior.
- WTR Lab reader API: Fetches chapter text directly from WTR Lab for the current, nearby, or custom chapter range. The script resolves WTR glossary placeholders such as `※8⛬` before sending text to the AI.

When Use WTR Lab Official Glossary Context is enabled, the script fetches the novel's official WTR glossary, caches it locally, and injects only relevant compact context into the prompt. Official alias groups are used to reduce false positives; glossary entries alone do not create findings unless the analyzed chapter text supports them.

## Debug Reports

When reporting an issue:

1. Open Configuration and enable Debug Logging.
2. Reproduce the issue.
3. Click Copy Debug Report.
4. Paste the copied Markdown report into a GitHub issue or Greasy Fork feedback thread.

The report includes runtime details, provider/model configuration, iteration state, result count, and timestamped debug logs. API keys and common token formats are redacted before copying.

## Developer Setup

### Prerequisites

- Node.js 20.19.0 or newer
- npm
- A userscript manager for browser testing

### Install

```bash
npm install
```

### Build

```bash
npm run build
```

Webpack compiles TypeScript source and CSS into JavaScript userscript bundles in `dist/`:

- `dist/wtr-lab-term-inconsistency-finder.user.js`
- `dist/wtr-lab-term-inconsistency-finder.greasyfork.user.js`
- `dist/wtr-lab-term-inconsistency-finder.dev.user.js`

### Checks

```bash
npm run typecheck
```

### Project Structure

```text
src/
  index.ts
  modules/
    analysisEngine.ts
    providerConfig.ts
    state.ts
    wtrLabApi.ts
    ui/
  styles/
dist/
  generated userscript output
```

## Support

- [GitHub Issues](https://github.com/MasuRii/wtr-term-inconsistency-finder/issues)
- [GitHub Discussions](https://github.com/MasuRii/wtr-term-inconsistency-finder/discussions)
- [Greasy Fork Feedback](https://greasyfork.org/en/scripts/554989-wtr-lab-term-inconsistency-finder/feedback)

## License

MIT. See [LICENSE](LICENSE).
