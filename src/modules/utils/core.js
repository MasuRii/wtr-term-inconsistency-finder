// src/modules/utils/core.js
import { appState } from "../state";

// --- UTILITY FUNCTIONS ---
export function log(...args) {
  if (appState.config.loggingEnabled) {
    console.log("Inconsistency Finder:", ...args);
  }
}

export function getNovelSlug() {
  const match = window.location.pathname.match(/novel\/\d+\/([^/]+)/);
  return match ? match[1] : null;
}

export function crawlChapterData() {
  const chapterTrackers = document.querySelectorAll(".chapter-tracker");
  log(`Found ${chapterTrackers.length} potential chapter elements.`);
  const chapterData = [];
  chapterTrackers.forEach((tracker, index) => {
    const chapterBody = tracker.querySelector(".chapter-body");
    const chapterNo = tracker.dataset.chapterNo;
    if (chapterBody && chapterNo) {
      log(`Processing chapter #${chapterNo}...`);
      chapterData.push({
        chapter: chapterNo,
        text: chapterBody.innerText,
        tracker: tracker,
      });
    } else {
      log(
        `Skipping element at index ${index}: missing chapter number or body. Chapter No: ${chapterNo || "not found"}`,
      );
    }
  });
  log(
    `Successfully collected data for ${chapterData.length} chapters: [${chapterData.map((d) => d.chapter).join(", ")}]`,
  );
  return chapterData;
}

export function extractJsonFromString(text) {
  // First, try to find a JSON markdown block
  const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (markdownMatch && markdownMatch[1]) {
    log("Extracted JSON from markdown block.");
    return markdownMatch[1];
  }

  // Fallback: find the first '{' or '[' and the last '}' or ']'
  const firstBrace = text.indexOf("{");
  const firstBracket = text.indexOf("[");
  let startIndex = -1;

  if (firstBrace === -1) {
    startIndex = firstBracket;
  } else if (firstBracket === -1) {
    startIndex = firstBrace;
  } else {
    startIndex = Math.min(firstBrace, firstBracket);
  }

  if (startIndex !== -1) {
    const lastBrace = text.lastIndexOf("}");
    const lastBracket = text.lastIndexOf("]");
    const endIndex = Math.max(lastBrace, lastBracket);

    if (endIndex > startIndex) {
      log("Extracted JSON using fallback brace/bracket matching.");
      return text.substring(startIndex, endIndex + 1);
    }
  }

  log("No JSON structure found, returning raw text.");
  return text;
}

/**
 * Detect whether the external "WTR Lab Term Replacer" userscript is loaded.
 *
 * This function is designed to be:
 * - Defensive: never throws, always falls back to `false` on errors.
 * - Heuristic-based: checks multiple non-breaking indicators.
 * - Side-effect free: does not modify any external state.
 *
 * Detection heuristics (any passing => detected):
 * - Presence of known global hooks (e.g. window.WTR_LAB_TERM_REPLACER, window.wtrLabTermReplacer)
 * - Presence of a well-known DOM marker element/attribute used by the replacer
 * - Presence of a registered listener for the "wtr:addTerm" CustomEvent on window
 *
 * Note: Listener detection is best-effort. If it cannot be verified reliably,
 *       this helper will not treat it as fatal and will default to safe mode.
 */
let _wtrReplacerDetectionCache = {
  lastResult: false,
  lastCheck: 0,
};

/**
 * Detect whether the external "WTR Lab Term Replacer" userscript is loaded.
 *
 * Primary rule:
 *   - Returns true iff the well-known settings button injected by the real script exists:
 *       .replacer-settings-btn.term-edit-btn.menu-button.small.btn.btn-outline-dark.btn-sm
 *
 * Behavior:
 *   - Defensive: exceptions are caught and logged; returns false on error.
 *   - Cached: repeated calls within a short window reuse the last result to avoid DOM thrash.
 *   - Side-effect free: does not modify external script state.
 */
export function isWTRLabTermReplacerLoaded() {
  try {
    const now = Date.now();
    const CACHE_WINDOW_MS = 3000;

    // Use cached value if within the cache window
    if (now - _wtrReplacerDetectionCache.lastCheck < CACHE_WINDOW_MS) {
      return _wtrReplacerDetectionCache.lastResult;
    }

    const marker = document.querySelector(
      ".replacer-settings-btn.term-edit-btn.menu-button.small.btn.btn-outline-dark.btn-sm",
    );

    const detected = Boolean(marker);

    _wtrReplacerDetectionCache = {
      lastResult: detected,
      lastCheck: now,
    };

    if (detected) {
      log(
        "WTR Lab Term Replacer detection: positive via settings button marker.",
      );
    }

    return detected;
  } catch (error) {
    log(
      "WTR Lab Term Replacer detection error; defaulting to safe mode (not loaded).",
      error,
    );
    _wtrReplacerDetectionCache = {
      lastResult: false,
      lastCheck: Date.now(),
    };
    return false;
  }
}
