/**
 * Analysis Engine Module
 * Core analysis logic for translation consistency detection across supported AI providers
 */

// Import from state module
import { appState, saveSessionResults, getNextAvailableKey, updateKeyState } from "./state"

// Import from ui module
import { displayResults, updateStatusIndicator } from "./ui"

// Import from utils module
import { areSemanticallySimilar, extractJsonFromString, log, mergeAnalysisResults, truncateForLog } from "./utils"

// Import from retryLogic module
import { MAX_RETRIES_PER_KEY, MAX_TOTAL_RETRY_DURATION_MS } from "./retryLogic"

// Import from promptManager module
import { buildPrompt, buildDeepAnalysisPrompt } from "./promptManager"

// Import from providerConfig module
import {
	buildAnalysisRequest,
	createOpenAiStreamState,
	consumeOpenAiStreamResponse,
	extractResponseText,
	finalizeOpenAiStreamResponse,
	getResponseFinishReason,
	providerUsesStreaming,
	resolveProviderSettings,
} from "./providerConfig"

// Import from apiErrorHandler module
import { handleApiError, classifyApiError, handleRateLimitError } from "./apiErrorHandler"
import { formatOfficialGlossaryPromptContext, getOfficialAliasOnlyMatch } from "./wtrLabApi"

/**
 * Get next available API key from the pool
 * @returns {Object|null} - API key information or null if none available
 */
export function getAvailableApiKey() {
	const apiKeyInfo = getNextAvailableKey()
	if (apiKeyInfo) {
		return {
			key: apiKeyInfo.key,
			index: apiKeyInfo.index,
			state: apiKeyInfo.state,
		}
	}
	return null
}

/**
 * Validate API key for use
 * @returns {boolean} - True if valid API key is available
 */
export function validateApiKey() {
	return getAvailableApiKey() !== null
}

/**
 * Parse and validate API response content
 * @param {string} _resultText - Raw text response from API (unused parameter for compatibility)
 * @returns {Object|Array} - Parsed JSON response
 * @throws {Error} - If parsing fails
 */
export function parseApiResponse(_resultText) {
	const cleanedJsonString = extractJsonFromString(_resultText)
	return JSON.parse(cleanedJsonString)
}

function normalizeApiResponse(response, apiResponse) {
	if (apiResponse?.error || response.status < 400) {
		return apiResponse
	}

	const fallbackMessage =
		apiResponse?.message || apiResponse?.detail || response.statusText || `HTTP ${response.status || "Unknown"}`

	return {
		...apiResponse,
		error: {
			message: fallbackMessage,
			type: apiResponse?.type,
			code: apiResponse?.code,
		},
	}
}

function buildMissingContentError(apiResponse) {
	const finishReason = getResponseFinishReason(appState.config, apiResponse)
	if (finishReason === "MAX_TOKENS" || finishReason === "length") {
		return "Analysis failed: The text from the selected chapters is too long, and the AI's response was cut off. Please try again with fewer chapters."
	}

	return `Invalid API response: No content found. Finish Reason: ${finishReason || "Unknown"}`
}

function getProviderLogContext() {
	const provider = resolveProviderSettings(appState.config)
	return {
		providerType: provider.providerType,
		model: appState.config.model,
		baseUrl: provider.baseUrl,
	}
}

function summarizeParsedResponse(parsedResponse) {
	if (Array.isArray(parsedResponse)) {
		return {
			resultType: "initial",
			itemCount: parsedResponse.length,
			conceptPreview: parsedResponse
				.slice(0, 3)
				.map((item) => item?.concept)
				.filter(Boolean),
		}
	}

	return {
		resultType: "verification",
		verifiedCount: Array.isArray(parsedResponse?.verified_inconsistencies)
			? parsedResponse.verified_inconsistencies.length
			: 0,
		newCount: Array.isArray(parsedResponse?.new_inconsistencies) ? parsedResponse.new_inconsistencies.length : 0,
		conceptPreview: [
			...(parsedResponse?.verified_inconsistencies || []),
			...(parsedResponse?.new_inconsistencies || []),
		]
			.slice(0, 3)
			.map((item) => item?.concept)
			.filter(Boolean),
	}
}

function getOfficialGlossaryPromptContext(chapterText, chapterData) {
	return formatOfficialGlossaryPromptContext(appState.runtime.officialGlossaryContext || null, chapterText, chapterData)
}

function filterOfficialAliasOnlyFindings(results, operationName) {
	if (!Array.isArray(results) || !appState.runtime.officialGlossaryContext) {
		return results
	}

	const suppressedMatches = []
	const filteredResults = results.filter((result) => {
		const match = getOfficialAliasOnlyMatch(result, appState.runtime.officialGlossaryContext)
		if (match) {
			suppressedMatches.push({
				concept: result?.concept || "Unknown concept",
				phrases: match.phrases,
				officialCanonical: match.group.canonical,
				officialSource: match.group.source,
				officialAliases: match.group.aliases,
			})
			return false
		}
		return true
	})

	if (suppressedMatches.length > 0) {
		log(
			`${operationName}: Suppressed ${suppressedMatches.length} official WTR glossary alias-only finding${suppressedMatches.length === 1 ? "" : "s"}.`,
			suppressedMatches,
		)
	}
	return filteredResults
}

function summarizeResultsForDebug(results) {
	return (Array.isArray(results) ? results : [])
		.filter((result) => result && !result.error && result.concept)
		.map((result) => {
			const recommendedSuggestion = Array.isArray(result.suggestions)
				? result.suggestions.find((suggestion) => suggestion?.is_recommended)?.suggestion ||
					result.suggestions[0]?.suggestion ||
					""
				: ""
			return {
				concept: result.concept,
				priority: result.priority || "INFO",
				status: result.status || (result.isNew ? "New" : "Unverified"),
				variationCount: Array.isArray(result.variations) ? result.variations.length : 0,
				recommendedSuggestion,
			}
		})
}

function logResultSummary(operationName, results) {
	const summary = summarizeResultsForDebug(results)
	log(`${operationName}: Current result summary.`, {
		resultCount: summary.length,
		results: summary,
	})
}

function isActionableFinding(result) {
	const priority = String(result?.priority || "INFO").toUpperCase()
	return Boolean(result && !result.error && result.concept && priority !== "INFO")
}

function getCleanSuggestionText(value) {
	return typeof value === "string" ? value.trim() : ""
}

function createFallbackSuggestion(_result, suggestion, label, reasoning) {
	const cleanSuggestion = getCleanSuggestionText(suggestion)
	return {
		display_text: cleanSuggestion ? `${label}: '${cleanSuggestion}'` : label,
		suggestion: cleanSuggestion,
		reasoning,
	}
}

function getSuggestionCandidates(result) {
	const candidates = []
	if (Array.isArray(result?.suggestions)) {
		result.suggestions.forEach((suggestion) => {
			const cleanSuggestion = getCleanSuggestionText(suggestion?.suggestion)
			if (cleanSuggestion) {
				candidates.push(cleanSuggestion)
			}
		})
	}
	if (Array.isArray(result?.variations)) {
		result.variations.forEach((variation) => {
			const phrase = getCleanSuggestionText(variation?.phrase)
			if (phrase) {
				candidates.push(phrase)
			}
		})
	}
	const concept = getCleanSuggestionText(result?.concept).replace(/\s*[([{][^\])}]*[\])}]/g, "").trim()
	if (concept) {
		candidates.push(concept)
	}

	const seen = new Set()
	return candidates.filter((candidate) => {
		const normalizedCandidate = candidate.toLowerCase()
		if (seen.has(normalizedCandidate)) {
			return false
		}
		seen.add(normalizedCandidate)
		return true
	})
}

function normalizeActionableSuggestions(results, operationName) {
	if (!Array.isArray(results) || results.length === 0) {
		return results
	}

	const normalizationLog = []
	const normalizedResults = results.map((result) => {
		if (!isActionableFinding(result)) {
			return result
		}

		const originalSuggestions = Array.isArray(result.suggestions) ? result.suggestions : []
		const validSuggestions = originalSuggestions.filter((suggestion) => {
			const hasSuggestion = getCleanSuggestionText(suggestion?.suggestion)
			const hasDisplayText = getCleanSuggestionText(suggestion?.display_text)
			return hasSuggestion || hasDisplayText
		})
		const candidates = getSuggestionCandidates({ ...result, suggestions: validSuggestions })
		const nextSuggestions = validSuggestions.slice(0, 3).map((suggestion) => ({
			...suggestion,
			is_recommended: false,
		}))

		const fallbackRoles = [
			{
				label: "Dominant usage",
				reasoning:
					"Fallback dominant-usage option added because the AI returned fewer than three actionable suggestions. Review variation frequency before applying.",
			},
			{
				label: "Glossary-informed option",
				reasoning:
					"Fallback glossary/editing option added because the AI returned fewer than three actionable suggestions. Treat as advisory unless supported by analyzed text.",
			},
			{
				label: "Editorial option",
				reasoning:
					"Fallback editorial option added to preserve the required three-suggestion structure. Validate manually before applying.",
			},
		]

		let candidateIndex = 0
		while (nextSuggestions.length < 3) {
			const candidate = candidates[candidateIndex] || candidates[0] || getCleanSuggestionText(result.concept)
			const role = fallbackRoles[nextSuggestions.length]
			nextSuggestions.push(createFallbackSuggestion(result, candidate, role.label, role.reasoning))
			candidateIndex++
		}

		const originalRecommendedIndex = validSuggestions.findIndex((suggestion) => suggestion?.is_recommended === true)
		const recommendedIndex = originalRecommendedIndex >= 0 && originalRecommendedIndex < 3 ? originalRecommendedIndex : 0
		nextSuggestions.forEach((suggestion, index) => {
			if (index === recommendedIndex) {
				suggestion.is_recommended = true
			} else {
				delete suggestion.is_recommended
			}
		})

		if (
			originalSuggestions.length !== 3 ||
			originalSuggestions.filter((suggestion) => suggestion?.is_recommended === true).length !== 1
		) {
			normalizationLog.push({
				concept: result.concept,
				originalSuggestionCount: originalSuggestions.length,
				normalizedSuggestionCount: nextSuggestions.length,
				originalRecommendedCount: originalSuggestions.filter((suggestion) => suggestion?.is_recommended === true)
					.length,
			})
		}

		return {
			...result,
			suggestions: nextSuggestions,
		}
	})

	if (normalizationLog.length > 0) {
		log(
			`${operationName}: Normalized actionable suggestions to exactly 3 entries with exactly one recommendation.`,
			normalizationLog,
		)
	}

	return normalizedResults
}

function markFinalVerificationNewItemsForReview(items, operationName) {
	if (!Array.isArray(items) || items.length === 0) {
		return items
	}

	log(
		`${operationName}: Marking ${items.length} final-pass new finding${items.length === 1 ? "" : "s"} as Needs Review because no later verification pass remains.`,
		items.map((item) => item?.concept).filter(Boolean),
	)

	return items.map((item) => {
		if (!item || item.error || !item.concept) {
			return item
		}
		return {
			...item,
			status: "Needs Review",
			latestVerificationStatus: "final_unverified_discovery",
			verificationNote:
				"This finding was newly discovered on the final verification pass and has not been verified by a later pass.",
		}
	})
}

function resultContainsUnresolvedPlaceholder(result) {
	if (!Array.isArray(result?.variations)) {
		return false
	}
	return result.variations.some((variation) => /※\d+[⛬〓]?/.test(String(variation?.phrase || "")))
}

function markPlaceholderArtifactResultsForReview(results, operationName) {
	if (!Array.isArray(results) || results.length === 0) {
		return results
	}

	const placeholderConcepts = []
	const reviewedResults = results.map((result) => {
		if (!result || result.error || !result.concept || !resultContainsUnresolvedPlaceholder(result)) {
			return result
		}

		placeholderConcepts.push({
			concept: result.concept,
			priority: result.priority || "INFO",
			previousStatus: result.status || (result.isNew ? "New" : "Unverified"),
			placeholderVariations: (result.variations || [])
				.map((variation) => variation?.phrase)
				.filter((phrase) => /※\d+[⛬〓]?/.test(String(phrase || "")))
				.slice(0, 5),
		})

		return {
			...result,
			status: "Needs Review",
			latestVerificationStatus: "unresolved_placeholder_artifact",
			verificationNote:
				"This finding includes unresolved WTR placeholder markers, so it needs manual review before applying.",
		}
	})

	if (placeholderConcepts.length > 0) {
		log(
			`${operationName}: Marked ${placeholderConcepts.length} placeholder-derived finding${placeholderConcepts.length === 1 ? "" : "s"} as Needs Review due to unresolved markers.`,
			placeholderConcepts,
		)
	}

	return reviewedResults
}

function markLowEvidenceResultsForReview(results, operationName) {
	if (!Array.isArray(results) || results.length === 0) {
		return results
	}

	const lowEvidenceConcepts = []
	const reviewedResults = results.map((result) => {
		if (!result || result.error || !result.concept) {
			return result
		}

		const priority = String(result.priority || "INFO").toUpperCase()
		const variationCount = Array.isArray(result.variations) ? result.variations.length : 0
		const isInformational = priority === "INFO" || priority === "STYLISTIC"
		if (isInformational || variationCount >= 2) {
			return result
		}

		lowEvidenceConcepts.push({
			concept: result.concept,
			priority,
			variationCount,
			previousStatus: result.status || (result.isNew ? "New" : "Unverified"),
		})

		return {
			...result,
			status: "Needs Review",
			latestVerificationStatus: "low_evidence_variation_count",
			verificationNote:
				"This non-informational finding has fewer than two extracted variations, so it needs manual review before applying.",
		}
	})

	if (lowEvidenceConcepts.length > 0) {
		log(
			`${operationName}: Marked ${lowEvidenceConcepts.length} low-evidence finding${lowEvidenceConcepts.length === 1 ? "" : "s"} as Needs Review due to insufficient variations.`,
			lowEvidenceConcepts,
		)
	}

	return reviewedResults
}

function createStreamingRequestState(config) {
	if (!providerUsesStreaming(config)) {
		return null
	}

	return {
		...createOpenAiStreamState(),
		lastStatusUpdateAt: 0,
		lastStatusLength: 0,
	}
}

function buildProviderRequestWithRuntimeMetadata(apiKey, prompt) {
	return buildAnalysisRequest(
		{
			...appState.config,
			providerModelMetadata: appState.runtime.providerModelMetadata || {},
		},
		apiKey,
		prompt,
	)
}

function handleStreamingProgress(operationName, streamState, response) {
	if (!streamState) {
		return
	}

	consumeOpenAiStreamResponse(streamState, response.responseText || "")

	const currentLength = streamState.text.length
	if (currentLength <= 0 || currentLength === streamState.lastStatusLength) {
		return
	}

	const now = Date.now()
	if (now - streamState.lastStatusUpdateAt < 250) {
		return
	}

	streamState.lastStatusUpdateAt = now
	streamState.lastStatusLength = currentLength
	updateStatusIndicator("running", `${operationName}: Streaming response (${currentLength} chars)...`)
}

function resolveStreamedApiResponse(response, streamState) {
	const streamResult = finalizeOpenAiStreamResponse(streamState, response.responseText || "")
	if (!streamResult.isStreamResponse) {
		return null
	}

	if (streamResult.errorPayload) {
		return streamResult.errorPayload
	}

	return {
		choices: [
			{
				message: {
					content: streamResult.text || "",
				},
				finish_reason: streamResult.finishReason,
			},
		],
	}
}

function getPreservableResults(results) {
	return Array.isArray(results) ? results.filter((result) => result && !result.error && result.concept) : []
}

function markResultsForReviewAfterEmptyVerification(results) {
	return results.map((result) => {
		if (!result || result.error || !result.concept) {
			return result
		}

		return {
			...result,
			isNew: false,
			status: "Needs Review",
			latestVerificationStatus: "empty_verification_pass",
			verificationNote: "Latest verification returned no items; this result was preserved for review.",
		}
	})
}

function markFinalInitialResultsForReview(results) {
	return results.map((result) => {
		if (!result || result.error || !result.concept) {
			return result
		}

		return {
			...result,
			isNew: true,
			status: "Needs Review",
			latestVerificationStatus: "final_unverified_discovery",
			verificationNote:
				"This finding was discovered on the final deep-analysis pass and has not been verified by a later pass.",
		}
	})
}

function preserveResultsAfterEmptyVerification(operationName, fallbackResults = []) {
	const sourceResults = getPreservableResults(appState.runtime.cumulativeResults).length
		? appState.runtime.cumulativeResults
		: fallbackResults
	const preservableCount = getPreservableResults(sourceResults).length

	if (preservableCount === 0) {
		return false
	}

	appState.runtime.cumulativeResults = markResultsForReviewAfterEmptyVerification(sourceResults)
	log(
		`${operationName}: Verification returned no items; preserving ${preservableCount} previous result${preservableCount === 1 ? "" : "s"} as Needs Review to avoid dropping findings from an empty model response.`,
	)
	return true
}

function hasMatchingConcept(result, candidates) {
	return candidates.some((candidate) =>
		areSemanticallySimilar(result?.concept || "", candidate?.concept || "", { silent: true }),
	)
}

function markUnreturnedPreviousResultsForReview(mergedResults, previousResults, latestResults, operationName) {
	const previousFindings = getPreservableResults(previousResults)
	const latestFindings = getPreservableResults(latestResults)

	if (previousFindings.length === 0 || latestFindings.length === 0) {
		return mergedResults
	}

	const unreturnedPreviousFindings = previousFindings.filter(
		(previousResult) => !hasMatchingConcept(previousResult, latestFindings),
	)

	if (unreturnedPreviousFindings.length === 0) {
		return mergedResults
	}

	log(
		`${operationName}: Latest verification did not return ${unreturnedPreviousFindings.length} previous result${unreturnedPreviousFindings.length === 1 ? "" : "s"}; preserving them as Needs Review.`,
	)

	return mergedResults.map((result) => {
		if (!result || result.error || !result.concept) {
			return result
		}

		const wasPreviousButUnreturned = hasMatchingConcept(result, unreturnedPreviousFindings)
		const wasReturnedByLatestVerification = hasMatchingConcept(result, latestFindings)
		if (!wasPreviousButUnreturned || wasReturnedByLatestVerification) {
			return result
		}

		return {
			...result,
			isNew: false,
			status: "Needs Review",
			latestVerificationStatus: "not_returned_by_latest_verification",
			verificationNote: "Latest verification did not return this previous finding; it was preserved for review.",
		}
	})
}

/**
 * Main inconsistency analysis function
 * @param {Array} chapterData - Array of chapter objects with text and chapter numbers
 * @param {Array} existingResults - Results from previous analysis for context
 * @param {number} retryCount - Current retry attempt count
 * @param {number} parseRetryCount - Parse retry attempt count
 */
export function findInconsistencies(chapterData, existingResults = [], retryCount = 0, parseRetryCount = 0) {
	const operationName = "Analysis"
	const maxTotalRetries = Math.max(1, appState.config.apiKeys.length) * MAX_RETRIES_PER_KEY

	// Initialize or reuse startedAt to enforce a global safety window for this run
	const startedAt = appState.runtime.analysisStartedAt || Date.now()
	if (!appState.runtime.analysisStartedAt) {
		appState.runtime.analysisStartedAt = startedAt
	}

	// Hard cap by attempts
	if (retryCount >= maxTotalRetries) {
		handleApiError(
			`${operationName} failed after ${retryCount} attempts across all keys. Please check your API keys or wait a while.`,
		)
		return
	}

	// Hard cap by duration (5-minute safety net)
	if (Date.now() - startedAt > MAX_TOTAL_RETRY_DURATION_MS) {
		handleApiError(
			`${operationName} failed after repeated retries over an extended period. Please wait a while before trying again.`,
		)
		return
	}

	const apiKeyInfo = getAvailableApiKey()
	if (!apiKeyInfo) {
		handleApiError("All API keys are currently rate-limited or failing. Please wait a moment before trying again.")
		return
	}
	const currentKey = apiKeyInfo.key
	const currentKeyIndex = apiKeyInfo.index

	appState.runtime.isAnalysisRunning = true
	updateStatusIndicator("running", `${operationName} (Key ${currentKeyIndex + 1}, Attempt ${retryCount + 1})...`)

	const combinedText = chapterData.map((d) => `--- CHAPTER ${d.chapter} ---\n${d.text}`).join("\n\n")
	log(`${operationName}: Dispatching request.`, {
		...getProviderLogContext(),
		keyIndex: currentKeyIndex,
		attempt: retryCount + 1,
		chapterCount: chapterData.length,
		characterCount: combinedText.length,
	})

	const prompt = buildPrompt(combinedText, existingResults, getOfficialGlossaryPromptContext(combinedText, chapterData))
	const requestConfig = buildProviderRequestWithRuntimeMetadata(currentKey, prompt)
	const streamingRequestState = createStreamingRequestState(appState.config)

	GM_xmlhttpRequest({
		method: requestConfig.method,
		url: requestConfig.url,
		headers: requestConfig.headers,
		data: requestConfig.data,
		onprogress: function (response) {
			handleStreamingProgress(operationName, streamingRequestState, response)
		},
		onload: function (response) {
			log(`${operationName}: Received API response.`, {
				...getProviderLogContext(),
				httpStatus: response.status,
				responseLength: response.responseText?.length || 0,
				responsePreview: truncateForLog(response.responseText || "", 320),
			})
			let apiResponse
			let parsedResponse

			// Shell parse errors are treated as retriable (can be transient)
			try {
				const streamedApiResponse = resolveStreamedApiResponse(response, streamingRequestState)
				apiResponse = normalizeApiResponse(response, streamedApiResponse || JSON.parse(response.responseText))
			} catch (e) {
				log(
					`${operationName}: Failed to parse API response shell: ${e.message}. Retrying immediately with next key.`,
				)
				// Immediate retry with next available key
				findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount)
				return
			}

			// Handle explicit API error responses
			if (apiResponse.error) {
				const errorClassification = classifyApiError(apiResponse, response.status)
				const isRetriable = errorClassification.retriable

				if (isRetriable) {
					log(
						`${operationName}: Retriable API Error (Status: ${errorClassification.status}) with key index ${currentKeyIndex}. Putting key on cooldown and retrying immediately with next key.`,
					)

					handleRateLimitError(currentKeyIndex, errorClassification, updateKeyState)

					// Immediate retry with next available key
					findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount)
					return
				}

				// Non-retriable API error -> final failure
				const finalError = `API Error (Status: ${errorClassification.status}): ${errorClassification.message}`
				handleApiError(finalError)
				return
			}

			const resultText = extractResponseText(appState.config, apiResponse)
			if (!resultText) {
				handleApiError(buildMissingContentError(apiResponse))
				return
			}

			// Parse the inner content (model JSON); treat malformed JSON as retriable once
			try {
				parsedResponse = parseApiResponse(resultText)
				log(`${operationName}: Parsed API response content.`, {
					...getProviderLogContext(),
					...summarizeParsedResponse(parsedResponse),
				})
			} catch (e) {
				if (parseRetryCount < 1) {
					log(
						`${operationName}: Failed to parse AI response content, retrying immediately with next key. Error: ${e.message}`,
					)
					updateStatusIndicator("running", "AI response malformed. Retrying...")
					// Immediate retry with next available key
					findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount + 1)
					return
				}
				const error = `${operationName} failed to process AI response content after retry: ${e.message}`
				handleApiError(error)
				return
			}

			// Success: rotate key index for next invocation
			appState.runtime.currentApiKeyIndex = (currentKeyIndex + 1) % appState.config.apiKeys.length
			appState.runtime.isAnalysisRunning = false
			appState.runtime.analysisStartedAt = null

			const isVerificationRun = existingResults.length > 0

			if (isVerificationRun) {
				if (!parsedResponse.verified_inconsistencies || !parsedResponse.new_inconsistencies) {
					handleApiError(
						"Invalid response format for verification run. Expected 'verified_inconsistencies' and 'new_inconsistencies' keys.",
					)
					return
				}
				const verifiedItems = filterOfficialAliasOnlyFindings(
					parsedResponse.verified_inconsistencies || [],
					operationName,
				)
				const newItems = filterOfficialAliasOnlyFindings(parsedResponse.new_inconsistencies || [], operationName)

				verifiedItems.forEach((item) => {
					item.isNew = false
					item.status = "Verified"
				})
				newItems.forEach((item) => {
					item.isNew = true
				})

				log(
					`Verification complete. ${verifiedItems.length} concepts re-verified. ${newItems.length} new concepts found.`,
				)
				const allVerifiedItems = [...verifiedItems, ...newItems]
				if (
					allVerifiedItems.length === 0 &&
					preserveResultsAfterEmptyVerification(operationName, existingResults)
				) {
					// Preserve existing findings explicitly when the verifier returns an empty pass.
				} else {
					const mergedVerificationResults = mergeAnalysisResults(existingResults, allVerifiedItems)
					appState.runtime.cumulativeResults = markUnreturnedPreviousResultsForReview(
						mergedVerificationResults,
						existingResults,
						allVerifiedItems,
						operationName,
					)
				}
			} else {
				if (!Array.isArray(parsedResponse)) {
					handleApiError("Invalid response format for initial run. Expected a JSON array.")
					return
				}
				const filteredInitialResults = filterOfficialAliasOnlyFindings(parsedResponse, operationName)
				filteredInitialResults.forEach((r) => (r.isNew = true))
				appState.runtime.cumulativeResults = filteredInitialResults
			}

			appState.runtime.cumulativeResults = normalizeActionableSuggestions(
				appState.runtime.cumulativeResults,
				operationName,
			)
			appState.runtime.cumulativeResults = markPlaceholderArtifactResultsForReview(
				appState.runtime.cumulativeResults,
				operationName,
			)
			appState.runtime.cumulativeResults = markLowEvidenceResultsForReview(
				appState.runtime.cumulativeResults,
				operationName,
			)
			logResultSummary(operationName, appState.runtime.cumulativeResults)
			saveSessionResults()
			updateStatusIndicator("complete", "Complete!")
			const continueBtn = document.getElementById("wtr-if-continue-btn")
			if (continueBtn) {
				continueBtn.disabled = false
			}
			displayResults(appState.runtime.cumulativeResults)
		},
		onerror: function (error) {
			console.error("Inconsistency Finder: Network error:", error)
			log(
				`${operationName}: Network error with key index ${currentKeyIndex}. Putting key on cooldown and retrying immediately with next key.`,
			)
			appState.runtime.apiKeyCooldowns.set(currentKey, Date.now() + 1000) // 1-second cooldown

			// Immediate retry with next available key
			findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount)
		},
	})
}

/**
 * Deep analysis coordinator function
 * @param {Array} chapterData - Array of chapter objects with text and chapter numbers
 * @param {Array} existingResults - Results from previous analysis for context
 * @param {number} targetDepth - Target depth for deep analysis
 * @param {number} currentDepth - Current depth in analysis
 */
export function findInconsistenciesDeepAnalysis(chapterData, existingResults = [], targetDepth = 1, currentDepth = 1) {
	if (currentDepth > targetDepth) {
		// Deep analysis complete
		appState.runtime.currentIteration = targetDepth
		appState.runtime.isAnalysisRunning = false
		const statusMessage = targetDepth > 1 ? `Complete! (Deep Analysis: ${targetDepth} iterations)` : "Complete!"
		updateStatusIndicator("complete", statusMessage)
		document.getElementById("wtr-if-continue-btn").disabled = false
		displayResults(appState.runtime.cumulativeResults)
		return
	}

	log(`Starting deep analysis iteration ${currentDepth}/${targetDepth}`)

	// Update status to show iteration progress
	if (targetDepth > 1) {
		updateStatusIndicator("running", `Deep Analysis (${currentDepth}/${targetDepth})...`)
	} else {
		updateStatusIndicator(
			"running",
			currentDepth > 1 ? `Deep Analysis (${currentDepth}/${targetDepth})...` : "Analyzing...",
		)
	}

	// Standardized context selection - always use cumulative results for deep analysis
	const contextResults =
		appState.runtime.cumulativeResults.length > 0 ? appState.runtime.cumulativeResults : existingResults

	// Run iteration only if we have a real deep analysis (depth > 1)
	if (targetDepth > 1) {
		findInconsistenciesIteration(chapterData, contextResults, targetDepth, currentDepth)
	} else {
		// For normal analysis (depth = 1), use the regular analysis function
		findInconsistencies(chapterData, contextResults)
	}
}

/**
 * Single iteration of deep analysis
 * @param {Array} chapterData - Array of chapter objects with text and chapter numbers
 * @param {Array} existingResults - Results from previous analysis iterations
 * @param {number} targetDepth - Target depth for deep analysis
 * @param {number} currentDepth - Current depth in analysis
 */
function findInconsistenciesIteration(chapterData, existingResults, targetDepth, currentDepth) {
	const maxTotalRetries = Math.max(1, appState.config.apiKeys.length) * MAX_RETRIES_PER_KEY
	let retryCount = 0
	let parseRetryCount = 0

	// Track when this deep analysis iteration started to enforce a safety window
	const iterationKey = `deep_${currentDepth}`
	const now = Date.now()
	if (!appState.runtime.deepAnalysisStartTimes) {
		appState.runtime.deepAnalysisStartTimes = {}
	}
	if (!appState.runtime.deepAnalysisStartTimes[iterationKey]) {
		appState.runtime.deepAnalysisStartTimes[iterationKey] = now
	}
	const startedAt = appState.runtime.deepAnalysisStartTimes[iterationKey]

	const operationName = `Deep analysis iteration ${currentDepth}/${targetDepth}`

	const executeIteration = () => {
		// Attempt-based ceiling
		if (retryCount >= maxTotalRetries) {
			handleApiError(
				`${operationName} failed after ${retryCount} attempts. Please check your API keys or wait a while.`,
			)
			delete appState.runtime.deepAnalysisStartTimes[iterationKey]
			return
		}

		// Time-based safety ceiling
		if (Date.now() - startedAt > MAX_TOTAL_RETRY_DURATION_MS) {
			handleApiError(
				`${operationName} failed after repeated retries over an extended period. Please wait a while before trying again.`,
			)
			delete appState.runtime.deepAnalysisStartTimes[iterationKey]
			return
		}

		const apiKeyInfo = getAvailableApiKey()
		if (!apiKeyInfo) {
			handleApiError(
				"All API keys are currently rate-limited or failing. Please wait a moment before trying again.",
			)
			delete appState.runtime.deepAnalysisStartTimes[iterationKey]
			return
		}
		const currentKey = apiKeyInfo.key
		const currentKeyIndex = apiKeyInfo.index

		const combinedText = chapterData.map((d) => `--- CHAPTER ${d.chapter} ---\n${d.text}`).join("\n\n")
		log(`${operationName}: Dispatching request.`, {
			...getProviderLogContext(),
			keyIndex: currentKeyIndex,
			attempt: retryCount + 1,
			chapterCount: chapterData.length,
			characterCount: combinedText.length,
		})

		const prompt = buildDeepAnalysisPrompt(
			combinedText,
			existingResults,
			getOfficialGlossaryPromptContext(combinedText, chapterData),
		)
		const requestConfig = buildProviderRequestWithRuntimeMetadata(currentKey, prompt)
		const streamingRequestState = createStreamingRequestState(appState.config)

		GM_xmlhttpRequest({
			method: requestConfig.method,
			url: requestConfig.url,
			headers: requestConfig.headers,
			data: requestConfig.data,
			onprogress: function (response) {
				handleStreamingProgress(operationName, streamingRequestState, response)
			},
			onload: function (response) {
				log(`${operationName}: Received API response.`, {
					...getProviderLogContext(),
					httpStatus: response.status,
					responseLength: response.responseText?.length || 0,
					responsePreview: truncateForLog(response.responseText || "", 320),
				})
				let apiResponse
				let parsedResponse

				// Shell parse: treat as retriable (can be transient / truncation)
				try {
					const streamedApiResponse = resolveStreamedApiResponse(response, streamingRequestState)
					apiResponse = normalizeApiResponse(
						response,
						streamedApiResponse || JSON.parse(response.responseText),
					)
				} catch (e) {
					log(
						`${operationName}: Failed to parse API response shell: ${e.message}. Retrying immediately with next key.`,
					)
					// Immediate retry with next available key
					retryCount++
					executeIteration()
					return
				}

				if (apiResponse.error) {
					const errorClassification = classifyApiError(apiResponse, response.status)
					const isRetriable = errorClassification.retriable

					if (isRetriable) {
						log(
							`${operationName}: Retriable API Error (Status: ${errorClassification.status}) with key index ${currentKeyIndex}. Putting key on cooldown and retrying immediately with next key.`,
						)
						handleRateLimitError(currentKeyIndex, errorClassification, updateKeyState)
						// Immediate retry with next available key
						retryCount++
						executeIteration()
						return
					}

					const finalError = `API Error (Status: ${errorClassification.status}): ${errorClassification.message}`
					handleApiError(finalError)
					delete appState.runtime.deepAnalysisStartTimes[iterationKey]
					return
				}

				const resultText = extractResponseText(appState.config, apiResponse)
				if (!resultText) {
					handleApiError(buildMissingContentError(apiResponse))
					delete appState.runtime.deepAnalysisStartTimes[iterationKey]
					return
				}

				try {
					parsedResponse = parseApiResponse(resultText)
					log(`${operationName}: Parsed API response content.`, {
						...getProviderLogContext(),
						...summarizeParsedResponse(parsedResponse),
					})
				} catch (e) {
					if (parseRetryCount < 1) {
						log(
							`${operationName}: Failed to parse AI response content, retrying immediately with next key. Error: ${e.message}`,
						)
						updateStatusIndicator("running", "AI response malformed. Retrying...")
						// Immediate retry with next available key
						retryCount++
						parseRetryCount++
						executeIteration()
						return
					}
					const error = `${operationName} failed to process AI response content after retry: ${e.message}`
					handleApiError(error)
					delete appState.runtime.deepAnalysisStartTimes[iterationKey]
					return
				}

				// On success, advance the key index for the next run
				appState.runtime.currentApiKeyIndex = (currentKeyIndex + 1) % appState.config.apiKeys.length

				const isVerificationRun = existingResults.length > 0

				if (isVerificationRun) {
					if (!parsedResponse.verified_inconsistencies || !parsedResponse.new_inconsistencies) {
						handleApiError(
							"Invalid response format for verification run. Expected 'verified_inconsistencies' and 'new_inconsistencies' keys.",
						)
						delete appState.runtime.deepAnalysisStartTimes[iterationKey]
						return
					}
					const verifiedItems = filterOfficialAliasOnlyFindings(
						parsedResponse.verified_inconsistencies || [],
						operationName,
					)
					let newItems = filterOfficialAliasOnlyFindings(parsedResponse.new_inconsistencies || [], operationName)

					verifiedItems.forEach((item) => {
						item.isNew = false
						item.status = "Verified"
					})
					newItems.forEach((item) => {
						item.isNew = true
					})
					if (currentDepth >= targetDepth) {
						newItems = markFinalVerificationNewItemsForReview(newItems, operationName)
					}

					log(
						`${operationName}: ${verifiedItems.length} concepts re-verified. ${newItems.length} new concepts found.`,
					)

					const allNewItems = [...verifiedItems, ...newItems]
					if (
						allNewItems.length === 0 &&
						preserveResultsAfterEmptyVerification(operationName, existingResults)
					) {
						// Preserve existing findings explicitly when the verifier returns an empty pass.
					} else {
						const mergedVerificationResults = mergeAnalysisResults(
							appState.runtime.cumulativeResults,
							allNewItems,
						)
						appState.runtime.cumulativeResults = markUnreturnedPreviousResultsForReview(
							mergedVerificationResults,
							existingResults,
							allNewItems,
							operationName,
						)
					}
				} else {
					if (!Array.isArray(parsedResponse)) {
						handleApiError("Invalid response format for initial run. Expected a JSON array.")
						delete appState.runtime.deepAnalysisStartTimes[iterationKey]
						return
					}
					const filteredInitialResults = filterOfficialAliasOnlyFindings(parsedResponse, operationName)
					filteredInitialResults.forEach((r) => (r.isNew = true))
					const resultsToMerge =
						currentDepth >= targetDepth && filteredInitialResults.length > 0
							? markFinalInitialResultsForReview(filteredInitialResults)
							: filteredInitialResults
					if (resultsToMerge !== filteredInitialResults) {
						log(
							`${operationName}: Final iteration produced ${filteredInitialResults.length} new unverified result${filteredInitialResults.length === 1 ? "" : "s"}; marking as Needs Review because no verification pass remains.`,
						)
					}
					appState.runtime.cumulativeResults = mergeAnalysisResults(
						appState.runtime.cumulativeResults,
						resultsToMerge,
					)
				}

				appState.runtime.cumulativeResults = normalizeActionableSuggestions(
					appState.runtime.cumulativeResults,
					operationName,
				)
				appState.runtime.cumulativeResults = markPlaceholderArtifactResultsForReview(
					appState.runtime.cumulativeResults,
					operationName,
				)
				appState.runtime.cumulativeResults = markLowEvidenceResultsForReview(
					appState.runtime.cumulativeResults,
					operationName,
				)
				logResultSummary(operationName, appState.runtime.cumulativeResults)

				// Save session results after each iteration
				saveSessionResults()

				// Continue to next iteration or complete
				appState.runtime.currentIteration = currentDepth < targetDepth ? currentDepth + 1 : targetDepth
				if (currentDepth < targetDepth) {
					// Next iteration; we keep per-iteration timing, so do not reset deepAnalysisStartTimes
					setTimeout(() => {
						findInconsistenciesDeepAnalysis(
							chapterData,
							appState.runtime.cumulativeResults,
							targetDepth,
							currentDepth + 1,
						)
					}, 1000)
				} else {
					// Deep analysis complete for this path
					delete appState.runtime.deepAnalysisStartTimes[iterationKey]
					appState.runtime.isAnalysisRunning = false
					updateStatusIndicator("complete", `Complete! (Deep Analysis: ${targetDepth} iterations)`)
					const continueBtn = document.getElementById("wtr-if-continue-btn")
					if (continueBtn) {
						continueBtn.disabled = false
					}
					displayResults(appState.runtime.cumulativeResults)
				}
			},
			onerror: function (error) {
				console.error("Inconsistency Finder: Network error:", error)
				log(
					`${operationName}: Network error with key index ${currentKeyIndex}. Putting key on cooldown and retrying immediately with next key.`,
				)
				appState.runtime.apiKeyCooldowns.set(currentKey, Date.now() + 1000) // 1-second cooldown

				// Immediate retry with next available key
				retryCount++
				executeIteration()
			},
		})
	}

	executeIteration()
}
