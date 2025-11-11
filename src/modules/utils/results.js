// src/modules/utils/results.js

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

  // Penalize clearly low-signal / noisy contexts to avoid them dominating merges.
  const concept = (result.concept || "").toString();
  if (/^\s*$/.test(concept)) {
    quality -= 30;
  }

  return quality;
}

/**
 * Safely converts suggestion data to ensure proper formatting and fallbacks
 */
export function sanitizeSuggestionData(suggestion) {
  // Enhanced suggestion sanitization with multiple fallback strategies
  const sanitized = { ...suggestion };

  // Fix missing or invalid suggestion field
  if (
    !sanitized.suggestion ||
    typeof sanitized.suggestion !== "string" ||
    sanitized.suggestion.trim() === ""
  ) {
    // Try to extract from display_text
    if (sanitized.display_text && typeof sanitized.display_text === "string") {
      // Remove common prefixes and extract the actual suggestion
      const cleaned = sanitized.display_text
        .replace(
          /^(standardize to|use|change to|replace with|update to)\s*/i,
          "",
        )
        .replace(/^['"`]|['"`]$/g, "") // Remove surrounding quotes
        .trim();

      if (cleaned && cleaned !== sanitized.display_text) {
        sanitized.suggestion = cleaned;
      } else if (cleaned) {
        sanitized.suggestion = cleaned;
      }
    }
  }

  // Ensure suggestion field is valid
  if (
    !sanitized.suggestion ||
    typeof sanitized.suggestion !== "string" ||
    sanitized.suggestion.trim() === ""
  ) {
    // Last resort: use concept name or mark as non-actionable
    sanitized.suggestion = sanitized.display_text || "[Informational]";
  }

  // Clean up other fields
  sanitized.display_text =
    sanitized.display_text || `Use "${sanitized.suggestion}"`;
  sanitized.reasoning = sanitized.reasoning || "AI-generated suggestion";

  return sanitized;
}

/**
 * Sanitize results data to fix corrupted suggestion data from restored sessions
 */
export function sanitizeResultsData(results) {
  // Sanitize all results to fix corrupted suggestion data from restored sessions
  return results.map((result) => {
    if (!result.suggestions || !Array.isArray(result.suggestions)) {
      return result;
    }

    return {
      ...result,
      suggestions: result.suggestions.map(sanitizeSuggestionData),
    };
  });
}
