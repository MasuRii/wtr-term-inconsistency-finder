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
    `Successfully collected data for ${chapterData.length} chapters: [${chapterData.map((d) => d.chapter).join(", ")}]`,
  );
  return chapterData;
}

/**
 * Converts straight quotes to curly quotes and double hyphens to em-dashes.
 * Based on the principles of SmartyPants.
 * @param {string} text The input string.
 * @returns {string} The processed string with smart typography.
 */
function smartenQuotes(text) {
  if (!text) {
    return "";
  }

  // The order of these replacements is important.
  return (
    text
      // Special case for apostrophes in years like '70s
      .replace(/'(\d+s)/g, "\u2019$1")
      // Opening single quotes: at the start of a line, or after a space, dash, or opening bracket/quote.
      .replace(/(^|[-\u2014\s([【"'])/g, "$1\u2018")
      // All remaining single quotes are closing quotes or apostrophes.
      .replace(/'/g, "\u2019")
      // Opening double quotes: at the start of a line, or after a space, dash, or opening bracket/quote.
      .replace(/(^|[-\u2014\s([【"'])/g, "$1\u201c")
      // All remaining double quotes are closing quotes.
      .replace(/"/g, "\u201d")
      // Em-dashes
      .replace(/--/g, "\u2014")
  );
}

/**
 * Applies smart quotes replacement to chapter text, skipping the active chapter
 * to avoid conflicts with other userscripts.
 * @param {Array} chapterData Array of chapter data objects
 * @returns {Array} Chapter data with smart quotes applied (where applicable)
 */
export function applySmartQuotesReplacement(chapterData) {
  log(`Applying smart quotes replacement to ${chapterData.length} chapters...`);

  let totalConversions = 0;
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

    // Store original text for comparison
    const originalText = data.text;
    const originalStraightQuotes = (originalText.match(/["']/g) || []).length;
    const originalSmartQuotes = (originalText.match(/[“”‘’]/g) || []).length;

    // Apply smart quotes to the text
    const smartenedText = smartenQuotes(data.text);

    // Count conversions
    const newStraightQuotes = (smartenedText.match(/["']/g) || []).length;
    const newSmartQuotes = (smartenedText.match(/[“”‘’]/g) || []).length;
    const quotesConverted = newSmartQuotes - originalSmartQuotes;

    if (smartenedText !== originalText) {
      totalConversions++;

      // Show detailed conversion information
      log(`SMART QUOTES CONVERSION Chapter #${data.chapter}:`);
      log(
        `  Original: ${originalStraightQuotes} straight quotes, ${originalSmartQuotes} smart quotes`,
      );
      log(
        `  After: ${newStraightQuotes} straight quotes, ${newSmartQuotes} smart quotes`,
      );
      log(`  Converted: ${quotesConverted} quotes to smart format`);

      // Show a sample of the conversion
      const sampleLength = Math.min(100, originalText.length);
      const originalSample = originalText
        .substring(0, sampleLength)
        .replace(/\n/g, "\\n");
      const convertedSample = smartenedText
        .substring(0, sampleLength)
        .replace(/\n/g, "\\n");
      log(
        `  Sample before: "${originalSample}${originalText.length > sampleLength ? "..." : ""}"`,
      );
      log(
        `  Sample after:  "${convertedSample}${smartenedText.length > sampleLength ? "..." : ""}"`,
      );
    } else {
      log(
        `No changes needed for chapter #${data.chapter} (${originalStraightQuotes} straight quotes, ${originalSmartQuotes} smart quotes already present)`,
      );
    }

    return { ...data, text: smartenedText };
  });

  // Summary log
  log(
    `SMART QUOTES SUMMARY: Processed ${chapterData.length} chapters, skipped ${skippedChapters} active chapters, converted quotes in ${totalConversions} chapters`,
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

export function summarizeContextResults(existingResults, maxItems = 50) {
  // Implement context summarization to prevent exponential growth
  if (existingResults.length <= maxItems) {
    return existingResults;
  }

  // Sort by quality score (highest first)
  const sortedResults = existingResults
    .map((result) => ({
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

  return quality;
}

export function areSemanticallySimilar(concept1, concept2) {
  // Basic semantic similarity check for concept names
  const normalize = (str) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .trim();
  const norm1 = normalize(concept1);
  const norm2 = normalize(concept2);

  // Exact match
  if (norm1 === norm2) {
    return true;
  }

  // Check if one is contained in the other (for partial matches)
  if (norm1.includes(norm2) || norm2.includes(norm1)) {
    return true;
  }

  // Check for common words (for compound names)
  const words1 = norm1.split(/\s+/);
  const words2 = norm2.split(/\s+/);
  const commonWords = words1.filter((word) => words2.includes(word));
  if (
    commonWords.length > 0 &&
    commonWords.length / Math.max(words1.length, words2.length) > 0.5
  ) {
    return true;
  }

  return false;
}

export function mergeAnalysisResults(existingResults, newResults) {
  // Enhanced merge strategy with semantic duplicate detection and quality-based conflict resolution
  const merged = [...existingResults];

  newResults.forEach((newResult) => {
    // Find potential semantic duplicates
    const duplicateIndex = merged.findIndex((existing) =>
      areSemanticallySimilar(existing.concept, newResult.concept),
    );

    if (duplicateIndex === -1) {
      // No duplicate found, add as new entry
      merged.push(newResult);
    } else {
      // Found potential duplicate, perform quality-based merge
      const existing = merged[duplicateIndex];
      const existingQuality = calculateResultQuality(existing);
      const newQuality = calculateResultQuality(newResult);

      log(
        `Semantic duplicate detected: "${existing.concept}" vs "${newResult.concept}". Quality scores: ${existingQuality} vs ${newQuality}`,
      );

      if (newQuality > existingQuality) {
        // New result has higher quality, replace existing
        merged[duplicateIndex] = newResult;
        log("Replaced lower quality result with higher quality version");
      } else {
        // Existing result has equal or higher quality, merge intelligently
        const mergedResult = {
          ...existing,
          // Preserve existing core data
          concept: existing.concept, // Keep original concept name
          priority: existing.priority, // Keep original priority
          explanation: existing.explanation, // Keep original explanation
          // Merge variations (avoid duplicates)
          variations: [
            ...(existing.variations || []),
            ...(newResult.variations || []),
          ].filter(
            (variation, index, arr) =>
              arr.findIndex(
                (v) =>
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
              arr.findIndex((s) => s.suggestion === suggestion.suggestion) ===
              index,
          ),
          // Preserve status flags from higher quality result
          status: existing.status || newResult.status,
          isNew: existing.isNew && newResult.isNew, // Only mark as new if both are new
        };

        merged[duplicateIndex] = mergedResult;
        log("Merged duplicate results, preserving higher quality data");
      }
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
