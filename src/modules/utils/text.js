// src/modules/utils/text.js
import { appState } from "../state";

/**
 * Safely converts straight quotes to curly quotes and double hyphens to em-dashes.
 * Conservative implementation inspired by SmartyPants:
 * - Preserves existing smart quotes.
 * - Handles common English contractions/possessives.
 * - Handles years like '70s.
 * - Handles typical opening/closing quotes around words/sentences.
 * - Avoids exponential or runaway replacements via validation.
 *
 * @param {string} text The input string.
 * @returns {string} The processed string with smart typography, or original text on anomaly.
 */
function smartenQuotes(text) {
  if (!text || typeof text !== "string") {
    return "";
  }

  // Configuration toggle (global config is preferred; local constant as safe default)
  const smartQuotesEnabled =
    appState?.config?.smartQuotesEnabled !== undefined
      ? Boolean(appState.config.smartQuotesEnabled)
      : true;

  if (!smartQuotesEnabled) {
    return text;
  }

  try {
    const original = text;

    // Pre-counts
    const originalStraightSingles = (original.match(/'/g) || []).length;
    const originalStraightDoubles = (original.match(/"/g) || []).length;
    const originalSmart = (original.match(/[“”‘’]/g) || []).length;

    // If there are no straight quotes, nothing to do.
    if (originalStraightSingles === 0 && originalStraightDoubles === 0) {
      return original;
    }

    // 1) Normalize em-dashes first (safe, independent).
    let out = original.replace(/--/g, "\u2014");

    // 2) Handle years like '70s -> '70s (must be before generic apostrophe handling).
    out = out.replace(/'(\d{2}s)/g, "\u2019$1");

    // 3) Handle common contractions/possessives:
    //    don't, it's, we've, I'll, John's, etc.
    //    Pattern: letter ' letter(s) (no spaces), treat the ' as apostrophe.
    out = out.replace(/(\p{L})'(\p{L}{1,3}\b)/gu, "$1\u2019$2");

    // 4) Handle possessives like Councilor's, John's (letter ' s\b).
    out = out.replace(/(\p{L})'s\b/gu, "$1\u2019s");

    // Note: Above rules intentionally only touch ASCII ' that are clearly apostrophes.
    // Remaining straight single quotes will be processed more structurally below.

    // 5) Double quotes: conservative opening/closing.
    //    - Opening double quote when at start or after whitespace/([{- and followed by non-space.
    //    - Closing double quote otherwise.
    out = out.replace(/(^|[\s({>""[])"(?=\S)/g, "$1\u201c");
    out = out.replace(/"/g, "\u201d");

    // 6) Single quotes (excluding ones already converted by contractions/years rules):
    //    - Opening single quote when at start or after whitespace/([{- or opening quote and before non-space.
    //    - Remaining straight single quotes become closing/apostrophe.
    out = out.replace(/(^|[\s({>""[] )'(?=\S)/g, "$1\u2018");
    out = out.replace(/'/g, "\u2019");

    // Post-counts
    const newStraightSingles = (out.match(/'/g) || []).length;
    const newStraightDoubles = (out.match(/"/g) || []).length;
    const newSmart = (out.match(/[""''""'']/g) || []).length;

    const straightSinglesConsumed =
      originalStraightSingles - newStraightSingles;
    const straightDoublesConsumed =
      originalStraightDoubles - newStraightDoubles;
    const totalStraightOriginal =
      originalStraightSingles + originalStraightDoubles;
    const totalStraightRemaining = newStraightSingles + newStraightDoubles;
    const totalStraightConsumed =
      totalStraightOriginal - totalStraightRemaining;

    // Validation / anomaly detection:
    // - New smart quotes should not exceed:
    //   originalSmart + totalStraightOriginal * 2 (extremely generous upper bound).
    // - Straight quotes consumed should not be negative.
    // - If we somehow produced far more smart quotes than plausible, revert.
    const maxAllowedNewSmart = originalSmart + totalStraightOriginal * 2;

    const anomaly =
      newSmart > maxAllowedNewSmart ||
      straightSinglesConsumed < 0 ||
      straightDoublesConsumed < 0;

    if (anomaly) {
      log(
        "SMART QUOTES SAFEGUARD: Detected anomalous conversion. Reverting to original text.",
        {
          originalStraightSingles,
          originalStraightDoubles,
          originalSmart,
          newStraightSingles,
          newStraightDoubles,
          newSmart,
          totalStraightOriginal,
          totalStraightRemaining,
          totalStraightConsumed,
          maxAllowedNewSmart,
        },
      );
      return original;
    }

    // Debug logging (chapter-level wrapper will also log context).
    log("SMART QUOTES STATS (smartenQuotes):", {
      originalStraightSingles,
      originalStraightDoubles,
      originalSmart,
      newStraightSingles,
      newStraightDoubles,
      newSmart,
      totalStraightOriginal,
      totalStraightRemaining,
      totalStraightConsumed,
    });

    return out;
  } catch (error) {
    // Hard safeguard: never let smart quotes break analysis.
    log(
      "SMART QUOTES ERROR: Failed to apply smart quotes. Returning original text.",
      error,
    );
    return text;
  }
}

/**
 * Applies smart quotes replacement to chapter text, skipping the active chapter
 * to avoid conflicts with other userscripts.
 * @param {Array} chapterData Array of chapter data objects
 * @returns {Array} Chapter data with smart quotes applied (where applicable)
 */
export function applySmartQuotesReplacement(chapterData) {
  if (!Array.isArray(chapterData) || chapterData.length === 0) {
    return chapterData || [];
  }

  const smartQuotesEnabled =
    appState?.config?.smartQuotesEnabled !== undefined
      ? Boolean(appState.config.smartQuotesEnabled)
      : true;

  if (!smartQuotesEnabled) {
    log(
      "SMART QUOTES: Skipping conversion because smartQuotesEnabled is false.",
    );
    return chapterData;
  }

  log(`Applying smart quotes replacement to ${chapterData.length} chapters...`);

  let chaptersWithChanges = 0;
  let skippedChapters = 0;

  const processedData = chapterData.map((data) => {
    // Skip processing if this is the active chapter
    if (
      data.tracker &&
      data.tracker.classList.contains("chapter-tracker active")
    ) {
      log(
        `Skipping smart quotes on ACTIVE chapter #${data.chapter} to avoid conflicts`,
      );
      skippedChapters++;
      return data;
    }

    const originalText = data.text || "";
    const originalStraightQuotes = (originalText.match(/["']/g) || []).length;
    const originalSmartQuotes = (originalText.match(/[""''""'']/g) || [])
      .length;

    // If no straight quotes, skip for efficiency.
    if (originalStraightQuotes === 0) {
      log(
        `SMART QUOTES: No straight quotes to convert for chapter #${data.chapter}. Skipping.`,
      );
      return data;
    }

    let smartenedText = originalText;
    let usedFallback = false;

    try {
      smartenedText = smartenQuotes(originalText);
    } catch (error) {
      // Defensive: log and fallback to original.
      log(
        `SMART QUOTES ERROR: Conversion failed for chapter #${data.chapter}. Using original text.`,
        error,
      );
      smartenedText = originalText;
      usedFallback = true;
    }

    // Post counts
    const newStraightQuotes = (smartenedText.match(/["']/g) || []).length;
    const newSmartQuotes = (smartenedText.match(/[""''""'']/g) || []).length;
    const quotesConverted = newSmartQuotes - originalSmartQuotes;

    // Safeguard at chapter level:
    // If we somehow increased smart quotes wildly relative to original straight quotes,
    // treat as anomaly and revert this chapter only.
    const totalOriginalStraight = originalStraightQuotes;
    const maxAllowedNewSmart = originalSmartQuotes + totalOriginalStraight * 2;

    const anomaly =
      !usedFallback &&
      (newSmartQuotes > maxAllowedNewSmart || quotesConverted < 0);

    if (anomaly) {
      log(
        `SMART QUOTES SAFEGUARD (chapter #${data.chapter}): Anomalous stats detected. Reverting to original text.`,
        {
          originalStraightQuotes,
          originalSmartQuotes,
          newStraightQuotes,
          newSmartQuotes,
          quotesConverted,
          maxAllowedNewSmart,
        },
      );
      smartenedText = originalText;
    } else if (!usedFallback && smartenedText !== originalText) {
      chaptersWithChanges++;

      const sampleLength = Math.min(160, originalText.length);
      const originalSample = originalText
        .substring(0, sampleLength)
        .replace(/\n/g, "\\n");
      const convertedSample = smartenedText
        .substring(0, sampleLength)
        .replace(/\n/g, "\\n");

      log(`SMART QUOTES CONVERSION Chapter #${data.chapter}:`);
      log(
        `  Original: ${originalStraightQuotes} straight, ${originalSmartQuotes} smart`,
      );
      log(`  After:    ${newStraightQuotes} straight, ${newSmartQuotes} smart`);
      log(`  Converted: ${quotesConverted} quotes to smart format`);
      log(
        `  Sample before: "${originalSample}${
          originalText.length > sampleLength ? "..." : ""
        }"`,
      );
      log(
        `  Sample after:  "${convertedSample}${
          smartenedText.length > sampleLength ? "..." : ""
        }"`,
      );
    } else {
      log(
        `SMART QUOTES: No safe changes for chapter #${data.chapter} (${originalStraightQuotes} straight, ${originalSmartQuotes} smart).`,
      );
    }

    return { ...data, text: smartenedText };
  });

  log(
    `SMART QUOTES SUMMARY: Processed ${chapterData.length} chapters, skipped ${skippedChapters} active chapters, applied safe conversions to ${chaptersWithChanges} chapters.`,
  );

  return processedData;
}

export function applyTermReplacements(chapterData, terms = []) {
  if (!terms || terms.length === 0) {
    log("No terms provided. Skipping replacement step.");
    return chapterData;
  }
  log(`Applying ${terms.length} replacement terms using advanced logic.`);

  // 1. Categorize and compile terms ONCE for efficiency.
  const simple_cs_partial = new Map();
  const simple_cs_whole = new Map();
  const simple_ci_partial = new Map();
  const simple_ci_whole = new Map();
  const regex_terms = [];

  for (const term of terms) {
    if (!term.original) {
      continue;
    }
    term.wholeWord = term.wholeWord ?? false;
    if (term.isRegex) {
      try {
        const flags = term.caseSensitive ? "g" : "gi";
        regex_terms.push({
          pattern: new RegExp(term.original, flags),
          replacement: term.replacement,
        });
      } catch (e) {
        console.error(
          `Inconsistency Finder: Skipping invalid regex for term "${term.original}":`,
          e,
        );
      }
    } else {
      const key = term.caseSensitive
        ? term.original
        : term.original.toLowerCase();
      const value = term.replacement;
      if (term.caseSensitive) {
        if (term.wholeWord) {
          simple_cs_whole.set(key, value);
        } else {
          simple_cs_partial.set(key, value);
        }
      } else {
        if (term.wholeWord) {
          simple_ci_whole.set(key, value);
        } else {
          simple_ci_partial.set(key, value);
        }
      }
    }
  }

  const compiledTerms = [...regex_terms];
  const addSimpleGroup = (map, flags, wholeWord, caseSensitive) => {
    if (map.size > 0) {
      const sortedKeys = [...map.keys()].sort((a, b) => b.length - a.length);
      const patterns = sortedKeys.map((k) => {
        const escaped = escapeRegExp(k);
        return wholeWord ? `\\b${escaped}\\b` : escaped;
      });
      const combined = patterns.join("|");
      compiledTerms.push({
        pattern: new RegExp(combined, flags),
        replacement_map: map,
        is_simple: true,
        case_sensitive: caseSensitive,
      });
    }
  };

  addSimpleGroup(simple_cs_partial, "g", false, true);
  addSimpleGroup(simple_cs_whole, "g", true, true);
  addSimpleGroup(simple_ci_partial, "gi", false, false);
  addSimpleGroup(simple_ci_whole, "gi", true, false);

  // 2. Process each chapter's text.
  return chapterData.map((data) => {
    // Skip processing if this is the active chapter
    if (
      data.tracker &&
      data.tracker.classList.contains("chapter-tracker active")
    ) {
      log(
        `Skipping term replacements on active chapter #${data.chapter} to avoid conflicts`,
      );
      return data;
    }

    let fullText = data.text;

    // 3. Find ALL possible matches from all compiled terms.
    const allMatches = [];
    for (const comp of compiledTerms) {
      for (const match of fullText.matchAll(comp.pattern)) {
        if (match[0].length === 0) {
          continue;
        } // Skip zero-length matches

        let replacementText;
        if (comp.is_simple) {
          const key = comp.case_sensitive ? match[0] : match[0].toLowerCase();
          replacementText = comp.replacement_map.get(key);
        } else {
          replacementText = comp.replacement; // Match the Term Replacer's logic
        }

        if (replacementText !== undefined) {
          allMatches.push({
            start: match.index,
            end: match.index + match[0].length,
            replacement: replacementText,
          });
        }
      }
    }

    // 4. Resolve overlaps: Sort by start index, then by end index descending (longest match wins).
    allMatches.sort((a, b) => {
      if (a.start !== b.start) {
        return a.start - b.start;
      }
      return b.end - a.end;
    });

    // 5. Select the non-overlapping "winning" matches.
    const winningMatches = [];
    let lastEnd = -1;
    for (const match of allMatches) {
      if (match.start >= lastEnd) {
        winningMatches.push(match);
        lastEnd = match.end;
      }
    }

    // 6. Apply winning matches to the string, from last to first to avoid index issues.
    for (let i = winningMatches.length - 1; i >= 0; i--) {
      const match = winningMatches[i];
      fullText =
        fullText.substring(0, match.start) +
        match.replacement +
        fullText.substring(match.end);
    }

    return { ...data, text: fullText };
  });
}

export function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function escapeHtml(unsafe) {
  if (typeof unsafe !== "string") {
    return "";
  }
  return unsafe
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "&#039;");
}

// Import log function
import { log } from "./core.js";
