// src/modules/utils/semantic.js

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
  if (tokens.length > 1 && tokens.every((t) => /^[A-Z][a-z]+$/.test(t))) {
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
  const normalize = (str) =>
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
    const commonWords = words1.filter((word) => words2.includes(word));
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

  newResults.forEach((newResult) => {
    if (!newResult || typeof newResult !== "object") {
      return;
    }

    const newConcept = newResult.concept || "";
    const newScript = detectScriptCategory(newConcept);

    // Find potential semantic duplicates (script-aware via areSemanticallySimilar)
    const duplicateIndex = merged.findIndex((existing) => {
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

// Import required functions
import { calculateResultQuality } from "./results.js";
import { log } from "./core.js";
