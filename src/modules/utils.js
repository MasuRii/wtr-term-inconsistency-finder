// src/modules/utils.js
import { appState } from "./state";

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
    `Successfully collected data for ${chapterData.length} chapters: [${chapterData.map(d => d.chapter).join(", ")}]`,
  );
  return chapterData;
}

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

    // 2) Handle years like '70s -> ’70s (must be before generic apostrophe handling).
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
    out = out.replace(/(^|[\s({>“”[])"(?=\S)/g, "$1\u201c");
    out = out.replace(/"/g, "\u201d");

    // 6) Single quotes (excluding ones already converted by contractions/years rules):
    //    - Opening single quote when at start or after whitespace/([{- or opening quote and before non-space.
    //    - Remaining straight single quotes become closing/apostrophe.
    out = out.replace(/(^|[\s({>“”[] )'(?=\S)/g, "$1\u2018");
    out = out.replace(/'/g, "\u2019");

    // Post-counts
    const newStraightSingles = (out.match(/'/g) || []).length;
    const newStraightDoubles = (out.match(/"/g) || []).length;
    const newSmart = (out.match(/[“”‘’]/g) || []).length;

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

  const processedData = chapterData.map(data => {
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
    const originalSmartQuotes = (originalText.match(/[“”‘’]/g) || []).length;

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
    const newSmartQuotes = (smartenedText.match(/[“”‘’]/g) || []).length;
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
      const patterns = sortedKeys.map(k => {
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
  return chapterData.map(data => {
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

export function summarizeContextResults(existingResults, maxItems = 50) {
  // Implement context summarization to prevent exponential growth
  if (existingResults.length <= maxItems) {
    return existingResults;
  }

  // Sort by quality score (highest first)
  const sortedResults = existingResults
    .map(result => ({
      ...result,
      qualityScore: calculateResultQuality(result),
    }))
    .sort((a, b) => b.qualityScore - a.qualityScore);

  // Take top items by quality score
  const topResults = sortedResults.slice(0, maxItems);

  // Summarize the rest into a brief overview
  const summarizedCount = existingResults.length - maxItems;
  const summarizedOverview = {
    concept: `[${summarizedCount} Additional Items Summarized]`,
    priority: "INFO",
    explanation: `Additional ${summarizedCount} items from previous analysis are summarized. Focus verification on the detailed items below.`,
    suggestions: [],
    variations: [],
  };

  log(
    `Context summarization: ${existingResults.length} items reduced to ${maxItems} detailed + 1 summarized`,
  );
  return [...topResults, summarizedOverview];
}

export function validateResultForContext(result) {
  // Validate individual result before including in context
  if (!result || typeof result !== "object") {
    return false;
  }

  // Check required fields
  if (
    !result.concept ||
    typeof result.concept !== "string" ||
    result.concept.trim() === ""
  ) {
    return false;
  }

  if (
    !result.explanation ||
    typeof result.explanation !== "string" ||
    result.explanation.trim() === ""
  ) {
    return false;
  }

  if (
    !result.variations ||
    !Array.isArray(result.variations) ||
    result.variations.length === 0
  ) {
    return false;
  }

  // Validate variations structure
  for (const variation of result.variations) {
    if (
      !variation.phrase ||
      typeof variation.phrase !== "string" ||
      variation.phrase.trim() === ""
    ) {
      return false;
    }
    if (
      !variation.chapter ||
      typeof variation.chapter !== "string" ||
      variation.chapter.trim() === ""
    ) {
      return false;
    }
    if (
      !variation.context_snippet ||
      typeof variation.context_snippet !== "string"
    ) {
      return false;
    }
  }

  return true;
}

export function calculateResultQuality(result) {
  // Quality scoring for merge conflict resolution
  let quality = 0;

  // Priority-based scoring (higher priority = higher quality)
  const priorityScores = {
    CRITICAL: 100,
    HIGH: 80,
    MEDIUM: 60,
    LOW: 40,
    STYLISTIC: 20,
    INFO: 10,
  };
  quality += priorityScores[result.priority] || 10;

  // Variation count bonus (more variations = more thorough analysis)
  quality += (result.variations?.length || 0) * 5;

  // Suggestion count bonus (more suggestions = better analysis)
  quality += (result.suggestions?.length || 0) * 3;

  // Verified status bonus (verified items are more reliable)
  if (result.status === "Verified") {
    quality += 20;
  }

  // New item penalty (new items need verification)
  if (result.isNew) {
    quality -= 10;
  }

  // Penalize clearly low-signal / noisy contexts to avoid them dominating merges.
  const concept = (result.concept || "").toString();
  if (/^\s*$/.test(concept)) {
    quality -= 30;
  }

  return quality;
}

/**
 * Lightweight script detection helpers for semantic safeguards.
 * These are conservative and only used to block obviously invalid merges.
 */
function detectScriptCategory(text) {
  if (!text || typeof text !== "string") {
    return "unknown";
  }

  let hasLatin = false;
  let hasCJK = false;
  let hasCyrillic = false;
  let hasOther = false;

  for (const ch of text) {
    const code = ch.codePointAt(0);

    // Latin (basic + extended)
    if (
      (code >= 0x0041 && code <= 0x005a) || // A-Z
      (code >= 0x0061 && code <= 0x007a) || // a-z
      (code >= 0x00c0 && code <= 0x024f) // Latin Extended
    ) {
      hasLatin = true;
      continue;
    }

    // CJK Unified, Hiragana, Katakana, etc.
    if (
      (code >= 0x3040 && code <= 0x30ff) || // Hiragana & Katakana
      (code >= 0x3400 && code <= 0x9fff) || // CJK Unified Ideographs
      (code >= 0xf900 && code <= 0xfaff) // CJK Compatibility Ideographs
    ) {
      hasCJK = true;
      continue;
    }

    // Cyrillic
    if (code >= 0x0400 && code <= 0x04ff) {
      hasCyrillic = true;
      continue;
    }

    // Skip punctuation, spaces, digits for classification
    if (
      (code >= 0x0030 && code <= 0x0039) || // 0-9
      /\s/.test(ch) ||
      /[.,!?'"`:;()[\]{}\-_/\\]/.test(ch)
    ) {
      continue;
    }

    hasOther = true;
  }

  if (hasCJK && !hasLatin && !hasCyrillic && !hasOther) {
    return "cjk";
  }
  if (hasCyrillic && !hasLatin && !hasCJK && !hasOther) {
    return "cyrillic";
  }
  if (hasLatin && !hasCJK && !hasCyrillic && !hasOther) {
    return "latin";
  }

  // Mixed or unknown scripts; treat conservatively.
  return "mixed";
}

function isProperNameLike(concept) {
  if (!concept || typeof concept !== "string") {
    return false;
  }
  const trimmed = concept.trim();

  // Single token with leading capital and not all caps -> likely proper name
  const tokens = trimmed.split(/\s+/);
  if (tokens.length === 1) {
    const t = tokens[0];
    if (/^[A-Z][a-zA-Z]+$/.test(t)) {
      return true;
    }
  }

  // Simple heuristic: multiple capitalized tokens
  if (tokens.length > 1 && tokens.every(t => /^[A-Z][a-z]+$/.test(t))) {
    return true;
  }

  return false;
}

/**
 * More conservative semantic similarity with script & contextual safeguards.
 */
export function areSemanticallySimilar(concept1, concept2) {
  if (!concept1 || !concept2) {
    return false;
  }

  const c1 = concept1.toString();
  const c2 = concept2.toString();

  const script1 = detectScriptCategory(c1);
  const script2 = detectScriptCategory(c2);

  // Hard rule: do not treat clearly different scripts as similar.
  if (script1 !== "unknown" && script2 !== "unknown" && script1 !== script2) {
    log(
      `Semantic similarity blocked by script mismatch: "${c1}" [${script1}] vs "${c2}" [${script2}]`,
    );
    return false;
  }

  // Normalize for ASCII/Latin similarity. Non-Latin content will mostly reduce to empty,
  // which is fine because we already guard by script category above.
  const normalize = str =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

  const norm1 = normalize(c1);
  const norm2 = normalize(c2);

  // If both normalizations are empty (e.g., pure CJK) and scripts are same non-latin,
  // fall back to strict exact match only.
  if (!norm1 && !norm2) {
    const exact = c1.trim() === c2.trim();
    if (!exact) {
      log(
        `Semantic similarity rejected for non-Latin pair (no normalized content): "${c1}" vs "${c2}"`,
      );
    }
    return exact;
  }

  // Exact match after normalization.
  if (norm1 === norm2 && norm1.length > 0) {
    return true;
  }

  // Very short tokens (<=3) should only match on exact equality to avoid noise.
  if (norm1.length <= 3 || norm2.length <= 3) {
    return norm1.length > 0 && norm1 === norm2;
  }

  // Block merging clearly unrelated when one looks like a proper name and the other does not.
  const proper1 = isProperNameLike(c1);
  const proper2 = isProperNameLike(c2);
  if (proper1 !== proper2) {
    log(
      `Semantic similarity rejected due to proper-name mismatch: "${c1}" (proper=${proper1}) vs "${c2}" (proper=${proper2})`,
    );
    return false;
  }

  // Check if one is contained in the other (for partial matches), but require decent length overlap.
  if (norm1.length >= 4 && norm2.length >= 4) {
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      return true;
    }
  }

  // Token overlap with conservative threshold.
  const words1 = norm1.split(/\s+/).filter(Boolean);
  const words2 = norm2.split(/\s+/).filter(Boolean);

  if (words1.length && words2.length) {
    const commonWords = words1.filter(word => words2.includes(word));
    const overlapRatio =
      commonWords.length / Math.max(words1.length, words2.length);

    // Require strong overlap to consider them semantically similar.
    if (overlapRatio >= 0.8 && commonWords.length > 0) {
      return true;
    }
  }

  log(
    `Semantic similarity not strong enough: "${c1}" [${script1}] vs "${c2}" [${script2}] (norm1="${norm1}", norm2="${norm2}")`,
  );
  return false;
}

/**
 * Merge analysis results with strict semantic & script-aware safeguards.
 */
export function mergeAnalysisResults(existingResults, newResults) {
  const merged = [...existingResults];

  newResults.forEach(newResult => {
    if (!newResult || typeof newResult !== "object") {
      return;
    }

    const newConcept = newResult.concept || "";
    const newScript = detectScriptCategory(newConcept);

    // Find potential semantic duplicates (script-aware via areSemanticallySimilar)
    const duplicateIndex = merged.findIndex(existing => {
      if (!existing || !existing.concept) {
        return false;
      }
      return areSemanticallySimilar(existing.concept, newConcept);
    });

    if (duplicateIndex === -1) {
      // No duplicate found, add as new entry
      merged.push(newResult);
      return;
    }

    // Found potential duplicate, perform stricter merge validation
    const existing = merged[duplicateIndex];
    const existingConcept = existing.concept || "";
    const existingScript = detectScriptCategory(existingConcept);

    const existingQuality = calculateResultQuality(existing);
    const newQuality = calculateResultQuality(newResult);

    // Ensure scripts are compatible before merging (defensive double-check)
    if (
      existingScript !== "unknown" &&
      newScript !== "unknown" &&
      existingScript !== newScript
    ) {
      log(
        `Merge prevented: script mismatch between "${existingConcept}" [${existingScript}] and "${newConcept}" [${newScript}].`,
      );
      // Treat as distinct concepts despite prior similarity signal.
      merged.push(newResult);
      return;
    }

    // Extra safeguard: prevent merging clearly different-language or mixed-script terms.
    if (
      (existingScript === "mixed" && newScript !== "mixed") ||
      (newScript === "mixed" && existingScript !== "mixed")
    ) {
      log(
        `Merge prevented: mixed/ambiguous script conflict between "${existingConcept}" [${existingScript}] and "${newConcept}" [${newScript}].`,
      );
      merged.push(newResult);
      return;
    }

    log(
      `Semantic duplicate candidate: "${existingConcept}" vs "${newConcept}". Quality scores: ${existingQuality} vs ${newQuality}`,
    );

    // Require at least one side to be reasonably strong to allow merge.
    const MIN_QUALITY_FOR_MERGE = 40;
    if (
      existingQuality < MIN_QUALITY_FOR_MERGE &&
      newQuality < MIN_QUALITY_FOR_MERGE
    ) {
      log(
        `Merge prevented: both candidates have low quality (${existingQuality}, ${newQuality}). Keeping as separate concepts.`,
      );
      merged.push(newResult);
      return;
    }

    if (newQuality > existingQuality) {
      merged[duplicateIndex] = {
        ...newResult,
        // Preserve original concept if they are near-identical variants
        concept: newResult.concept,
      };
      log(
        "Merged duplicate results by favoring higher quality new result for this concept.",
      );
    } else {
      // Existing result has equal or higher quality, merge intelligently INTO existing.
      const mergedResult = {
        ...existing,
        concept: existing.concept,
        priority: existing.priority,
        explanation: existing.explanation,
        // Merge variations (avoid duplicates)
        variations: [
          ...(existing.variations || []),
          ...(newResult.variations || []),
        ].filter(
          (variation, index, arr) =>
            arr.findIndex(
              v =>
                v.phrase === variation.phrase &&
                v.chapter === variation.chapter,
            ) === index,
        ),
        // Merge suggestions (avoid duplicates)
        suggestions: [
          ...(existing.suggestions || []),
          ...(newResult.suggestions || []),
        ].filter(
          (suggestion, index, arr) =>
            arr.findIndex(s => s.suggestion === suggestion.suggestion) ===
            index,
        ),
        // Preserve status flags from higher quality result
        status: existing.status || newResult.status,
        isNew: Boolean(existing.isNew && newResult.isNew),
      };

      merged[duplicateIndex] = mergedResult;
      log(
        "Merged duplicate results, preserving higher or equal quality concept and safely aggregating variations/suggestions.",
      );
    }
  });

  return merged;
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
