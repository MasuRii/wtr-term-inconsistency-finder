// src/modules/utils.ts
import { appState } from "./state"

// --- UTILITY FUNCTIONS ---
const MAX_DEBUG_LOG_ENTRIES = 300

const debugLogEntries = []

function redactSensitiveText(value) {
	if (typeof value !== "string") {
		return value
	}

	return value
		.replace(/Bearer\s+[A-Za-z0-9._~+/=:-]+/gi, "Bearer [REDACTED]")
		.replace(/(api[_-]?key|authorization|token|key)(["'`\s:=]+)([^"'`\s,}]+)/gi, "$1$2[REDACTED]")
		.replace(/sk-[A-Za-z0-9_-]{12,}/g, "sk-[REDACTED]")
}

function normalizeDebugLogValue(value) {
	const summarized = summarizeForLog(value)

	if (typeof summarized === "string") {
		return redactSensitiveText(summarized)
	}

	try {
		return JSON.parse(redactSensitiveText(JSON.stringify(summarized)))
	} catch {
		return redactSensitiveText(String(summarized))
	}
}

function appendDebugLogEntry(args) {
	debugLogEntries.push({
		timestamp: new Date().toISOString(),
		args: args.map((arg) => normalizeDebugLogValue(arg)),
	})

	if (debugLogEntries.length > MAX_DEBUG_LOG_ENTRIES) {
		debugLogEntries.splice(0, debugLogEntries.length - MAX_DEBUG_LOG_ENTRIES)
	}
}

function formatDebugLogValue(value) {
	if (typeof value === "string") {
		return value
	}

	try {
		return JSON.stringify(value, null, 2)
	} catch {
		return String(value)
	}
}

export function getDebugLogCount() {
	return debugLogEntries.length
}

export function clearDebugLogs() {
	debugLogEntries.length = 0
}

export function getDebugLogReport() {
	const providerBaseUrl = appState.config.providerBaseUrl || "not configured"
	const reportLines = [
		"# WTR Lab Term Inconsistency Finder Debug Report",
		"",
		`Generated: ${new Date().toISOString()}`,
		`Script version: ${window.WTR_VERSION || "unknown"}`,
		`Page: ${window.location.href}`,
		"",
		"## Configuration",
		`- Provider: ${appState.config.providerType || "unknown"}`,
		`- Base URL: ${providerBaseUrl}`,
		`- Model: ${appState.config.model || "not selected"}`,
		"- Temperature: automatic default (1 when supported)",
		"- Reasoning mode: automatic high when supported",
		`- Deep analysis depth: ${appState.config.deepAnalysisDepth || 1}`,
		`- Chapter source: ${appState.config.chapterSource || "page"}`,
		`- WTR advisory glossary context: ${appState.config.useOfficialWtrGlossary ? "enabled" : "disabled"}`,
		`- API key count: ${Array.isArray(appState.config.apiKeys) ? appState.config.apiKeys.filter(Boolean).length : 0}`,
		"",
		"## Runtime",
		`- Analysis running: ${Boolean(appState.runtime.isAnalysisRunning)}`,
		`- Current iteration: ${appState.runtime.currentIteration || 1}/${appState.runtime.totalIterations || 1}`,
		`- Result count: ${Array.isArray(appState.runtime.cumulativeResults) ? appState.runtime.cumulativeResults.length : 0}`,
		`- Log entries: ${debugLogEntries.length}`,
		"",
		"## Logs",
	]

	if (debugLogEntries.length === 0) {
		reportLines.push("No debug log entries were captured yet.")
	} else {
		debugLogEntries.forEach((entry, index) => {
			reportLines.push("", `### ${index + 1}. ${entry.timestamp}`)
			entry.args.forEach((arg) => {
				reportLines.push("```", formatDebugLogValue(arg), "```")
			})
		})
	}

	return reportLines.join("\n")
}

export function truncateForLog(value, maxLength = 280) {
	if (typeof value !== "string") {
		return value
	}

	if (value.length <= maxLength) {
		return value
	}

	return `${value.slice(0, maxLength)}… [truncated ${value.length - maxLength} chars]`
}

export function summarizeForLog(value, maxStringLength = 280) {
	if (typeof value === "string") {
		return truncateForLog(value, maxStringLength)
	}

	if (Array.isArray(value)) {
		return {
			type: "array",
			length: value.length,
			preview: value.slice(0, 3),
		}
	}

	if (value && typeof value === "object") {
		return value
	}

	return value
}

export function log(...args) {
	if (appState.config.loggingEnabled) {
		appendDebugLogEntry(args)
		console.log("Inconsistency Finder:", ...args.map((arg) => summarizeForLog(arg)))
	}
}

export function getNovelSlug() {
	const match = window.location.pathname.match(/novel\/\d+\/([^/]+)/)
	return match ? match[1] : null
}

export function crawlChapterData() {
	const chapterTrackers = document.querySelectorAll(".chapter-tracker")
	log(`Found ${chapterTrackers.length} potential chapter elements.`)
	const chapterData = []
	chapterTrackers.forEach((tracker, index) => {
		const chapterBody = tracker.querySelector(".chapter-body")
		const chapterNo = tracker.dataset.chapterNo
		if (chapterBody && chapterNo) {
			log(`Processing chapter #${chapterNo}...`)
			chapterData.push({
				chapter: chapterNo,
				text: chapterBody.innerText,
				tracker: tracker,
			})
		} else {
			log(
				`Skipping element at index ${index}: missing chapter number or body. Chapter No: ${chapterNo || "not found"}`,
			)
		}
	})
	log(
		`Successfully collected data for ${chapterData.length} chapters: [${chapterData.map((d) => d.chapter).join(", ")}]`,
	)
	return chapterData
}

export function applyTermReplacements(chapterData, terms = []) {
	if (!terms || terms.length === 0) {
		log("No terms provided. Skipping replacement step.")
		return chapterData
	}
	log(`Applying ${terms.length} replacement terms using advanced logic.`)

	// 1. Categorize and compile terms ONCE for efficiency.
	const simple_cs_partial = new Map()
	const simple_cs_whole = new Map()
	const simple_ci_partial = new Map()
	const simple_ci_whole = new Map()
	const regex_terms = []

	for (const term of terms) {
		if (!term.original) {
			continue
		}
		term.wholeWord = term.wholeWord ?? false
		if (term.isRegex) {
			try {
				const flags = term.caseSensitive ? "g" : "gi"
				regex_terms.push({
					pattern: new RegExp(term.original, flags),
					replacement: term.replacement,
				})
			} catch (e) {
				console.error(`Inconsistency Finder: Skipping invalid regex for term "${term.original}":`, e)
			}
		} else {
			const key = term.caseSensitive ? term.original : term.original.toLowerCase()
			const value = term.replacement
			if (term.caseSensitive) {
				if (term.wholeWord) {
					simple_cs_whole.set(key, value)
				} else {
					simple_cs_partial.set(key, value)
				}
			} else {
				if (term.wholeWord) {
					simple_ci_whole.set(key, value)
				} else {
					simple_ci_partial.set(key, value)
				}
			}
		}
	}

	const compiledTerms = [...regex_terms]
	const addSimpleGroup = (map, flags, wholeWord, caseSensitive) => {
		if (map.size > 0) {
			const sortedKeys = [...map.keys()].sort((a, b) => b.length - a.length)
			const patterns = sortedKeys.map((k) => {
				const escaped = escapeRegExp(k)
				return wholeWord ? `\\b${escaped}\\b` : escaped
			})
			const combined = patterns.join("|")
			compiledTerms.push({
				pattern: new RegExp(combined, flags),
				replacement_map: map,
				is_simple: true,
				case_sensitive: caseSensitive,
			})
		}
	}

	addSimpleGroup(simple_cs_partial, "g", false, true)
	addSimpleGroup(simple_cs_whole, "g", true, true)
	addSimpleGroup(simple_ci_partial, "gi", false, false)
	addSimpleGroup(simple_ci_whole, "gi", true, false)

	const replacementStats = {
		chapterCount: chapterData.length,
		compiledPatternCount: compiledTerms.length,
		rawMatchCount: 0,
		appliedMatchCount: 0,
		chapterSummaries: [],
	}

	// 2. Process each chapter's text.
	const processedChapterData = chapterData.map((data) => {
		// Skip processing if this is the active chapter
		if (data.tracker && data.tracker.classList.contains("chapter-tracker active")) {
			log(`Skipping term replacements on active chapter #${data.chapter} to avoid conflicts`)
			return data
		}

		let fullText = data.text

		// 3. Find ALL possible matches from all compiled terms.
		const allMatches = []
		for (const comp of compiledTerms) {
			for (const match of fullText.matchAll(comp.pattern)) {
				if (match[0].length === 0) {
					continue
				} // Skip zero-length matches

				let replacementText
				if (comp.is_simple) {
					const key = comp.case_sensitive ? match[0] : match[0].toLowerCase()
					replacementText = comp.replacement_map.get(key)
				} else {
					replacementText = comp.replacement // Match the Term Replacer's logic
				}

				if (replacementText !== undefined) {
					allMatches.push({
						start: match.index,
						end: match.index + match[0].length,
						replacement: replacementText,
					})
				}
			}
		}

		// 4. Resolve overlaps: Sort by start index, then by end index descending (longest match wins).
		allMatches.sort((a, b) => {
			if (a.start !== b.start) {
				return a.start - b.start
			}
			return b.end - a.end
		})

		// 5. Select the non-overlapping "winning" matches.
		const winningMatches = []
		let lastEnd = -1
		for (const match of allMatches) {
			if (match.start >= lastEnd) {
				winningMatches.push(match)
				lastEnd = match.end
			}
		}

		// 6. Apply winning matches to the string, from last to first to avoid index issues.
		replacementStats.rawMatchCount += allMatches.length
		replacementStats.appliedMatchCount += winningMatches.length
		if (allMatches.length > 0 || winningMatches.length > 0) {
			replacementStats.chapterSummaries.push({
				chapter: data.chapter,
				rawMatches: allMatches.length,
				appliedMatches: winningMatches.length,
				skippedOverlaps: allMatches.length - winningMatches.length,
			})
		}

		for (let i = winningMatches.length - 1; i >= 0; i--) {
			const match = winningMatches[i]
			fullText = fullText.substring(0, match.start) + match.replacement + fullText.substring(match.end)
		}

		return { ...data, text: fullText }
	})

	log("Completed replacement preprocessing for analysis.", replacementStats)
	return processedChapterData
}

export function summarizeContextResults(existingResults, maxItems = 50) {
	// Implement context summarization to prevent exponential growth
	if (existingResults.length <= maxItems) {
		return existingResults
	}

	// Sort by quality score (highest first)
	const sortedResults = existingResults
		.map((result) => ({
			...result,
			qualityScore: calculateResultQuality(result),
		}))
		.sort((a, b) => b.qualityScore - a.qualityScore)

	// Take top items by quality score
	const topResults = sortedResults.slice(0, maxItems)

	// Summarize the rest into a brief overview
	const summarizedCount = existingResults.length - maxItems
	const summarizedOverview = {
		concept: `[${summarizedCount} Additional Items Summarized]`,
		priority: "INFO",
		explanation: `Additional ${summarizedCount} items from previous analysis are summarized. Focus verification on the detailed items below.`,
		suggestions: [],
		variations: [],
	}

	log(`Context summarization: ${existingResults.length} items reduced to ${maxItems} detailed + 1 summarized`)
	return [...topResults, summarizedOverview]
}

export function validateResultForContext(result) {
	// Validate individual result before including in context
	if (!result || typeof result !== "object") {
		return false
	}

	// Check required fields
	if (!result.concept || typeof result.concept !== "string" || result.concept.trim() === "") {
		return false
	}

	if (!result.explanation || typeof result.explanation !== "string" || result.explanation.trim() === "") {
		return false
	}

	if (!result.variations || !Array.isArray(result.variations) || result.variations.length === 0) {
		return false
	}

	// Validate variations structure
	for (const variation of result.variations) {
		if (!variation.phrase || typeof variation.phrase !== "string" || variation.phrase.trim() === "") {
			return false
		}
		if (!variation.chapter || typeof variation.chapter !== "string" || variation.chapter.trim() === "") {
			return false
		}
		if (!variation.context_snippet || typeof variation.context_snippet !== "string") {
			return false
		}
	}

	return true
}

export function calculateResultQuality(result) {
	// Quality scoring for merge conflict resolution
	let quality = 0

	// Priority-based scoring (higher priority = higher quality)
	const priorityScores = {
		CRITICAL: 100,
		HIGH: 80,
		MEDIUM: 60,
		LOW: 40,
		STYLISTIC: 20,
		INFO: 10,
	}
	quality += priorityScores[result.priority] || 10

	// Variation count bonus (more variations = more thorough analysis)
	quality += (result.variations?.length || 0) * 5

	// Suggestion count bonus (more suggestions = better analysis)
	quality += (result.suggestions?.length || 0) * 3

	// Verified status bonus (verified items are more reliable)
	if (result.status === "Verified") {
		quality += 20
	}

	// New item penalty (new items need verification)
	if (result.isNew) {
		quality -= 10
	}

	// Penalize clearly low-signal / noisy contexts to avoid them dominating merges.
	const concept = (result.concept || "").toString()
	if (/^\s*$/.test(concept)) {
		quality -= 30
	}

	return quality
}

/**
 * Lightweight script detection helpers for semantic safeguards.
 * These are conservative and only used to block obviously invalid merges.
 */
function detectScriptCategory(text) {
	if (!text || typeof text !== "string") {
		return "unknown"
	}

	let hasLatin = false
	let hasCJK = false
	let hasCyrillic = false
	let hasOther = false

	for (const ch of text) {
		const code = ch.codePointAt(0)

		// Latin (basic + extended)
		if (
			(code >= 0x0041 && code <= 0x005a) || // A-Z
			(code >= 0x0061 && code <= 0x007a) || // a-z
			(code >= 0x00c0 && code <= 0x024f) // Latin Extended
		) {
			hasLatin = true
			continue
		}

		// CJK Unified, Hiragana, Katakana, etc.
		if (
			(code >= 0x3040 && code <= 0x30ff) || // Hiragana & Katakana
			(code >= 0x3400 && code <= 0x9fff) || // CJK Unified Ideographs
			(code >= 0xf900 && code <= 0xfaff) // CJK Compatibility Ideographs
		) {
			hasCJK = true
			continue
		}

		// Cyrillic
		if (code >= 0x0400 && code <= 0x04ff) {
			hasCyrillic = true
			continue
		}

		// Skip punctuation, spaces, digits for classification
		if (
			(code >= 0x0030 && code <= 0x0039) || // 0-9
			/\s/.test(ch) ||
			/[.,!?'"`:;()[\]{}\-_/\\]/.test(ch)
		) {
			continue
		}

		hasOther = true
	}

	if (hasCJK && !hasLatin && !hasCyrillic && !hasOther) {
		return "cjk"
	}
	if (hasCyrillic && !hasLatin && !hasCJK && !hasOther) {
		return "cyrillic"
	}
	if (hasLatin && !hasCJK && !hasCyrillic && !hasOther) {
		return "latin"
	}

	// Mixed or unknown scripts; treat conservatively.
	return "mixed"
}

function stripParentheticalAnnotations(value) {
	if (!value || typeof value !== "string") {
		return ""
	}

	const stripped = value
		.replace(/\s*[([{][^\])}]*[\])}]/g, " ")
		.replace(/\s+/g, " ")
		.trim()

	// Only drop annotations when a meaningful base remains. This avoids erasing concepts
	// that are intentionally just a bracketed name.
	return stripped || value.trim()
}

function getComparableConceptText(value) {
	return stripParentheticalAnnotations(value)
}

function splitConceptVariants(concept) {
	if (!concept || typeof concept !== "string") {
		return []
	}

	const trimmed = concept.trim()
	if (!trimmed) {
		return []
	}

	const annotationStripped = stripParentheticalAnnotations(trimmed)
	const variants = [
		trimmed,
		annotationStripped,
		...trimmed.split(/\s*(?:\/|\||;|\bvs\.?\b|\bversus\b)\s*/i),
		...annotationStripped.split(/\s*(?:\/|\||;|\bvs\.?\b|\bversus\b)\s*/i),
	]
	const seen = new Set()

	return variants
		.map((variant) => variant.trim())
		.filter((variant) => {
			if (!variant || seen.has(variant.toLowerCase())) {
				return false
			}
			seen.add(variant.toLowerCase())
			return true
		})
}

function normalizeConceptForComparison(str) {
	return getComparableConceptText(str)
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, " ")
		.replace(/\s+/g, " ")
		.trim()
}

function getNormalizedConceptVariants(concept) {
	return splitConceptVariants(concept)
		.map((variant) => normalizeConceptForComparison(variant))
		.filter(Boolean)
}

function hasUsefulConceptAnnotation(concept) {
	return /[([{][^\])}]*([\u3400-\u9fff]|\balias\b|\bsource\b|\bcharacter\b|\btitle\b)[^\])}]*[\])}]/i.test(
		concept || "",
	)
}

function chooseMergedConcept(existingConcept, newConcept, existingQuality, newQuality) {
	const existingNorm = normalizeConceptForComparison(existingConcept || "")
	const newNorm = normalizeConceptForComparison(newConcept || "")

	if (existingNorm && existingNorm === newNorm) {
		if (hasUsefulConceptAnnotation(existingConcept)) {
			return existingConcept
		}
		if (hasUsefulConceptAnnotation(newConcept)) {
			return newConcept
		}
	}

	return newQuality > existingQuality ? newConcept : existingConcept
}

function mergeUniqueVariations(existingVariations = [], newVariations = []) {
	return [...existingVariations, ...newVariations].filter(
		(variation, index, arr) =>
			arr.findIndex((candidate) => candidate.phrase === variation.phrase && candidate.chapter === variation.chapter) ===
			index,
	)
}

function mergeUniqueSuggestions(existingSuggestions = [], newSuggestions = []) {
	return [...existingSuggestions, ...newSuggestions].filter(
		(suggestion, index, arr) =>
			arr.findIndex((candidate) => candidate.suggestion === suggestion.suggestion) === index,
	)
}

function areNormalizedConceptsSimilar(norm1, norm2) {
	if (!norm1 || !norm2) {
		return false
	}

	if (norm1 === norm2) {
		return true
	}

	if (norm1.length <= 3 || norm2.length <= 3) {
		return false
	}

	if (norm1.includes(norm2) || norm2.includes(norm1)) {
		return true
	}

	const words1 = norm1.split(/\s+/).filter(Boolean)
	const words2 = norm2.split(/\s+/).filter(Boolean)
	if (!words1.length || !words2.length) {
		return false
	}

	const commonWords = words1.filter((word) => words2.includes(word))
	const overlapRatio = commonWords.length / Math.max(words1.length, words2.length)
	return overlapRatio >= 0.8 && commonWords.length > 0
}

function isVariantProperNameLike(variant) {
	const tokens = variant.match(/[A-Za-z][A-Za-z0-9'-]*/g) || []
	if (tokens.length === 0) {
		return false
	}

	const connectorWords = new Set([
		"a",
		"an",
		"and",
		"at",
		"by",
		"de",
		"for",
		"from",
		"in",
		"la",
		"of",
		"on",
		"the",
		"to",
	])
	const meaningfulTokens = tokens.filter((token) => !connectorWords.has(token.toLowerCase()))
	if (meaningfulTokens.length === 0) {
		return false
	}

	const capitalizedTokens = meaningfulTokens.filter((token) => /^[A-Z][a-zA-Z0-9'-]*$/.test(token))
	if (meaningfulTokens.length === 1) {
		return capitalizedTokens.length === 1 && meaningfulTokens[0].toUpperCase() !== meaningfulTokens[0]
	}

	return capitalizedTokens.length >= 2 && capitalizedTokens.length / meaningfulTokens.length >= 0.6
}

function isProperNameLike(concept) {
	return splitConceptVariants(concept).some((variant) => isVariantProperNameLike(variant))
}

/**
 * More conservative semantic similarity with script & contextual safeguards.
 */
export function areSemanticallySimilar(concept1, concept2, options: any = {}) {
	const shouldLog = !options?.silent
	if (!concept1 || !concept2) {
		return false
	}

	const c1 = concept1.toString()
	const c2 = concept2.toString()
	const comparable1 = getComparableConceptText(c1)
	const comparable2 = getComparableConceptText(c2)

	const script1 = detectScriptCategory(comparable1)
	const script2 = detectScriptCategory(comparable2)

	// Hard rule: do not treat clearly different scripts as similar.
	if (script1 !== "unknown" && script2 !== "unknown" && script1 !== script2) {
		if (shouldLog) {
			log(`Semantic similarity blocked by script mismatch: "${c1}" [${script1}] vs "${c2}" [${script2}]`)
		}
		return false
	}

	const norm1 = normalizeConceptForComparison(c1)
	const norm2 = normalizeConceptForComparison(c2)

	// If both normalizations are empty (e.g., pure CJK) and scripts are same non-latin,
	// fall back to strict exact match only.
	if (!norm1 && !norm2) {
		const exact = c1.trim() === c2.trim()
		if (!exact && shouldLog) {
			log(`Semantic similarity rejected for non-Latin pair (no normalized content): "${c1}" vs "${c2}"`)
		}
		return exact
	}

	// Block merging clearly unrelated when one looks like a proper name and the other does not.
	// Composite concepts like "A / B" are evaluated per variant so proper-name alternates stay mergeable.
	const proper1 = isProperNameLike(comparable1)
	const proper2 = isProperNameLike(comparable2)
	if (proper1 !== proper2) {
		if (shouldLog) {
			log(
				`Semantic similarity rejected due to proper-name mismatch: "${c1}" (proper=${proper1}) vs "${c2}" (proper=${proper2})`,
			)
		}
		return false
	}

	const normalizedVariants1 = getNormalizedConceptVariants(c1)
	const normalizedVariants2 = getNormalizedConceptVariants(c2)

	for (const variant1 of normalizedVariants1) {
		for (const variant2 of normalizedVariants2) {
			if (areNormalizedConceptsSimilar(variant1, variant2)) {
				return true
			}
		}
	}

	if (shouldLog) {
		log(
			`Semantic similarity not strong enough: "${c1}" [${script1}] vs "${c2}" [${script2}] (norm1="${norm1}", norm2="${norm2}")`,
		)
	}
	return false
}

/**
 * Merge analysis results with strict semantic & script-aware safeguards.
 */
export function mergeAnalysisResults(existingResults, newResults) {
	const merged = [...existingResults]

	newResults.forEach((newResult) => {
		if (!newResult || typeof newResult !== "object") {
			return
		}

		const newConcept = newResult.concept || ""
		const newScript = detectScriptCategory(newConcept)

		// Find potential semantic duplicates (script-aware via areSemanticallySimilar)
		const duplicateIndex = merged.findIndex((existing) => {
			if (!existing || !existing.concept) {
				return false
			}
			return areSemanticallySimilar(existing.concept, newConcept, { silent: true })
		})

		if (duplicateIndex === -1) {
			// No duplicate found, add as new entry
			merged.push(newResult)
			return
		}

		// Found potential duplicate, perform stricter merge validation
		const existing = merged[duplicateIndex]
		const existingConcept = existing.concept || ""
		const existingScript = detectScriptCategory(existingConcept)

		const existingQuality = calculateResultQuality(existing)
		const newQuality = calculateResultQuality(newResult)

		// Ensure scripts are compatible before merging (defensive double-check)
		if (existingScript !== "unknown" && newScript !== "unknown" && existingScript !== newScript) {
			log(
				`Merge prevented: script mismatch between "${existingConcept}" [${existingScript}] and "${newConcept}" [${newScript}].`,
			)
			// Treat as distinct concepts despite prior similarity signal.
			merged.push(newResult)
			return
		}

		// Extra safeguard: prevent merging clearly different-language or mixed-script terms.
		if (
			(existingScript === "mixed" && newScript !== "mixed") ||
			(newScript === "mixed" && existingScript !== "mixed")
		) {
			log(
				`Merge prevented: mixed/ambiguous script conflict between "${existingConcept}" [${existingScript}] and "${newConcept}" [${newScript}].`,
			)
			merged.push(newResult)
			return
		}

		log(
			`Semantic duplicate candidate: "${existingConcept}" vs "${newConcept}". Quality scores: ${existingQuality} vs ${newQuality}`,
		)

		// Require at least one side to be reasonably strong to allow merge.
		const MIN_QUALITY_FOR_MERGE = 40
		if (existingQuality < MIN_QUALITY_FOR_MERGE && newQuality < MIN_QUALITY_FOR_MERGE) {
			log(
				`Merge prevented: both candidates have low quality (${existingQuality}, ${newQuality}). Keeping as separate concepts.`,
			)
			merged.push(newResult)
			return
		}

		if (newQuality > existingQuality) {
			merged[duplicateIndex] = {
				...newResult,
				concept: chooseMergedConcept(existing.concept, newResult.concept, existingQuality, newQuality),
				variations: mergeUniqueVariations(existing.variations || [], newResult.variations || []),
				suggestions: mergeUniqueSuggestions(existing.suggestions || [], newResult.suggestions || []),
				isNew: Boolean(existing.isNew && newResult.isNew),
			}
			log("Merged duplicate results by favoring higher quality new result while preserving useful concept annotations.")
		} else {
			// Existing result has equal or higher quality, merge intelligently INTO existing.
			const mergedResult = {
				...existing,
				concept: chooseMergedConcept(existing.concept, newResult.concept, existingQuality, newQuality),
				priority: existing.priority,
				explanation: existing.explanation,
				variations: mergeUniqueVariations(existing.variations || [], newResult.variations || []),
				suggestions: mergeUniqueSuggestions(existing.suggestions || [], newResult.suggestions || []),
				// Preserve status flags from higher quality result
				status: existing.status || newResult.status,
				isNew: Boolean(existing.isNew && newResult.isNew),
			}

			merged[duplicateIndex] = mergedResult
			log(
				"Merged duplicate results, preserving higher or equal quality concept and safely aggregating variations/suggestions.",
			)
		}
	})

	return merged
}

export function extractJsonFromString(text) {
	// First, try to find a JSON markdown block
	const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/)
	if (markdownMatch && markdownMatch[1]) {
		log("Extracted JSON from markdown block.")
		return markdownMatch[1]
	}

	// Fallback: find the first '{' or '[' and the last '}' or ']'
	const firstBrace = text.indexOf("{")
	const firstBracket = text.indexOf("[")
	let startIndex = -1

	if (firstBrace === -1) {
		startIndex = firstBracket
	} else if (firstBracket === -1) {
		startIndex = firstBrace
	} else {
		startIndex = Math.min(firstBrace, firstBracket)
	}

	if (startIndex !== -1) {
		const lastBrace = text.lastIndexOf("}")
		const lastBracket = text.lastIndexOf("]")
		const endIndex = Math.max(lastBrace, lastBracket)

		if (endIndex > startIndex) {
			log("Extracted JSON using fallback brace/bracket matching.")
			return text.substring(startIndex, endIndex + 1)
		}
	}

	log("No JSON structure found, returning raw text.")
	return text
}

export function escapeRegExp(str) {
	return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function escapeHtml(unsafe) {
	if (typeof unsafe !== "string") {
		return ""
	}
	return unsafe.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, '"').replace(/'/g, "&#039;")
}

/**
 * Detect whether the external "WTR Lab Term Replacer" userscript is loaded.
 *
 * This function is designed to be:
 * - Defensive: never throws, always falls back to `false` on errors.
 * - Heuristic-based: checks multiple non-breaking indicators.
 * - Side-effect free: does not modify any external state.
 */
let _wtrReplacerDetectionCache = {
	lastResult: false,
	lastCheck: 0,
}

function normalizeLiveTermReplacerTerms(terms) {
	if (!Array.isArray(terms)) {
		return []
	}

	return terms
		.filter(
			(term) =>
				term &&
				typeof term === "object" &&
				typeof term.original === "string" &&
				Object.prototype.hasOwnProperty.call(term, "replacement"),
		)
		.map((term) => ({
			...term,
			wholeWord: term.wholeWord ?? false,
		}))
}

/**
 * Detect whether the external "WTR Lab Term Replacer" userscript is loaded.
 *
 * Detection heuristics (any passing => detected):
 * - Presence of a well-known global integration marker
 * - Presence of the injected settings button used by the replacer UI
 *
 * Behavior:
 * - Defensive: exceptions are caught and logged; returns false on error.
 * - Cached: repeated calls within a short window reuse the last result to avoid DOM thrash.
 * - Side-effect free: does not modify external script state.
 */
export function isWTRLabTermReplacerLoaded() {
	try {
		const now = Date.now()
		const CACHE_WINDOW_MS = 3000

		if (now - _wtrReplacerDetectionCache.lastCheck < CACHE_WINDOW_MS) {
			return _wtrReplacerDetectionCache.lastResult
		}

		const globalMarker = window.WTR_LAB_TERM_REPLACER
		const marker = document.querySelector(
			".replacer-settings-btn.term-edit-btn.menu-button.small.btn.btn-outline-dark.btn-sm",
		)

		const detected = Boolean(globalMarker?.ready || marker)

		_wtrReplacerDetectionCache = {
			lastResult: detected,
			lastCheck: now,
		}

		if (detected) {
			log("WTR Lab Term Replacer detection: positive via global marker or settings button marker.")
		}

		return detected
	} catch (error) {
		log("WTR Lab Term Replacer detection error; defaulting to safe mode (not loaded).", error)
		_wtrReplacerDetectionCache = {
			lastResult: false,
			lastCheck: Date.now(),
		}
		return false
	}
}

/**
 * Request the live term list for the current novel from the external WTR Lab Term Replacer userscript.
 *
 * Returns:
 * - `Array` of normalized term objects on success (including empty array if no terms exist)
 * - `null` if the bridge is unavailable, times out, or responds with an error
 */
export function requestTermsFromWTRLabTermReplacer(novelSlug, options: any = {}) {
	if (!novelSlug || !isWTRLabTermReplacerLoaded()) {
		return Promise.resolve(null)
	}

	const timeoutMs = Math.max(250, Number(options.timeoutMs) || 1500)
	const requestId = `wtr-if-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`

	return new Promise((resolve) => {
		let isSettled = false
		let timeoutId = null

		const cleanup = () => {
			window.removeEventListener("wtr:termsResponse", handleResponse)
			if (timeoutId !== null) {
				window.clearTimeout(timeoutId)
			}
		}

		const finish = (value) => {
			if (isSettled) {
				return
			}
			isSettled = true
			cleanup()
			resolve(value)
		}

		const handleResponse = (event) => {
			const detail = event?.detail || {}
			if (detail.requestId !== requestId) {
				return
			}

			if (detail.success === false) {
				log("WTR Lab Term Replacer live term request failed.", detail.error || "Unknown bridge error")
				finish(null)
				return
			}

			finish(normalizeLiveTermReplacerTerms(detail.terms))
		}

		window.addEventListener("wtr:termsResponse", handleResponse)
		timeoutId = window.setTimeout(() => {
			log(`Timed out after ${timeoutMs}ms while requesting live terms from WTR Lab Term Replacer.`)
			finish(null)
		}, timeoutMs)

		try {
			window.dispatchEvent(
				new CustomEvent("wtr:requestTerms", {
					detail: {
						requestId,
						novelSlug,
					},
				}),
			)
		} catch (error) {
			log("Failed to dispatch live term request to WTR Lab Term Replacer.", error)
			finish(null)
		}
	})
}
