/**
 * Analysis Engine Module
 * Core analysis logic for translation consistency detection using Gemini API
 */

// Import from state module
import { appState, saveSessionResults, getNextAvailableKey, updateKeyState } from "./state"

// Import from ui module
import { displayResults, updateStatusIndicator } from "./ui"

// Import from utils module
import { extractJsonFromString, log, mergeAnalysisResults } from "./utils"

// Import from retryLogic module
import { createRetryHandler, MAX_RETRIES_PER_KEY, MAX_TOTAL_RETRY_DURATION_MS } from "./retryLogic"

// Import from promptManager module
import { buildPrompt, buildDeepAnalysisPrompt } from "./promptManager"

// Import from apiErrorHandler module
import { handleApiError, classifyApiError, handleRateLimitError } from "./apiErrorHandler"

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
	log(
		`${operationName}: Sending ${
			combinedText.length
		} characters to the AI. Using key index: ${currentKeyIndex}. (Total Attempt ${retryCount + 1})`,
	)

	const prompt = buildPrompt(combinedText, existingResults)
	const requestData = {
		contents: [{ parts: [{ text: prompt }] }],
		generationConfig: {
			temperature: appState.config.temperature,
		},
	}

	GM_xmlhttpRequest({
		method: "POST",
		url: `https://generativelanguage.googleapis.com/v1beta/${appState.config.model}:generateContent?key=${currentKey}`,
		headers: {
			"Content-Type": "application/json",
		},
		data: JSON.stringify(requestData),
		onload: function (response) {
			log("Received raw response from API:", response.responseText)
			let apiResponse
			let parsedResponse

			// Shell parse errors are treated as retriable (can be transient)
			try {
				apiResponse = JSON.parse(response.responseText)
			} catch (e) {
				log(
					`${operationName}: Failed to parse API response shell: ${e.message}. Scheduling retry with backoff.`,
				)
				const retryHandler = createRetryHandler(handleApiError)
				retryHandler({
					operationName: `${operationName} (shell parse recovery)`,
					retryCount,
					maxTotalRetries,
					startedAt,
					nextStep: () => findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount),
				})
				return
			}

			// Handle explicit API error responses
			if (apiResponse.error) {
				const errorClassification = classifyApiError(apiResponse)
				const isRetriable = errorClassification.retriable

				if (isRetriable) {
					log(
						`${operationName}: Retriable API Error (Status: ${errorClassification.status}) with key index ${currentKeyIndex}.`,
					)

					handleRateLimitError(currentKeyIndex, errorClassification, updateKeyState)

					const retryHandler = createRetryHandler(handleApiError)
					retryHandler({
						operationName,
						retryCount,
						maxTotalRetries,
						startedAt,
						nextStep: () =>
							findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount),
					})
					return
				}

				// Non-retriable API error -> final failure
				const finalError = `API Error (Status: ${errorClassification.status}): ${errorClassification.message}`
				handleApiError(finalError)
				return
			}

			const candidate = apiResponse.candidates?.[0]
			if (!candidate || !candidate.content) {
				let error
				if (candidate?.finishReason === "MAX_TOKENS") {
					error =
						"Analysis failed: The text from the selected chapters is too long, and the AI's response was cut off. Please try again with fewer chapters."
				} else {
					error = `Invalid API response: No content found. Finish Reason: ${
						candidate?.finishReason || "Unknown"
					}`
				}
				handleApiError(error)
				return
			}

			// Parse the inner content (model JSON); treat malformed JSON as retriable once
			try {
				const resultText = candidate.content.parts[0].text
				parsedResponse = parseApiResponse(resultText)
				log(`${operationName}: Successfully parsed API response content.`, parsedResponse)
			} catch (e) {
				if (parseRetryCount < 1) {
					log(
						`${operationName}: Failed to parse AI response content, scheduling retry with backoff. Error: ${e.message}`,
					)
					updateStatusIndicator("running", "AI response malformed. Retrying...")
					const retryHandler = createRetryHandler(handleApiError)
					retryHandler({
						operationName: `${operationName} (parse recovery)`,
						retryCount,
						maxTotalRetries,
						startedAt,
						nextStep: () =>
							findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount + 1),
					})
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
				const verifiedItems = parsedResponse.verified_inconsistencies || []
				const newItems = parsedResponse.new_inconsistencies || []

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
				appState.runtime.cumulativeResults = [...verifiedItems, ...newItems]
			} else {
				if (!Array.isArray(parsedResponse)) {
					handleApiError("Invalid response format for initial run. Expected a JSON array.")
					return
				}
				parsedResponse.forEach((r) => (r.isNew = true))
				appState.runtime.cumulativeResults = parsedResponse
			}

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
				`${operationName}: Network error with key index ${currentKeyIndex}. Rotating key and scheduling retry with backoff.`,
			)
			appState.runtime.apiKeyCooldowns.set(currentKey, Date.now() + 1000) // 1-second cooldown

			const retryHandler = createRetryHandler(handleApiError)
			retryHandler({
				operationName,
				retryCount,
				maxTotalRetries,
				startedAt,
				nextStep: () => findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount),
			})
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
		log(
			`${operationName}: Sending ${
				combinedText.length
			} characters to the AI. Using key index: ${currentKeyIndex}. (Total Attempt ${retryCount + 1})`,
		)

		const prompt = buildDeepAnalysisPrompt(combinedText, existingResults)
		const requestData = {
			contents: [{ parts: [{ text: prompt }] }],
			generationConfig: {
				temperature: appState.config.temperature,
			},
		}

		GM_xmlhttpRequest({
			method: "POST",
			url: `https://generativelanguage.googleapis.com/v1beta/${appState.config.model}:generateContent?key=${currentKey}`,
			headers: {
				"Content-Type": "application/json",
			},
			data: JSON.stringify(requestData),
			onload: function (response) {
				log("Received raw response from API:", response.responseText)
				let apiResponse
				let parsedResponse

				// Shell parse: treat as retriable (can be transient / truncation)
				try {
					apiResponse = JSON.parse(response.responseText)
				} catch (e) {
					log(
						`${operationName}: Failed to parse API response shell: ${e.message}. Scheduling retry with backoff.`,
					)
					const retryHandler = createRetryHandler(handleApiError)
					retryHandler({
						operationName: `${operationName} (shell parse recovery)`,
						retryCount,
						maxTotalRetries,
						startedAt,
						nextStep: () => {
							retryCount++
							executeIteration()
						},
					})
					return
				}

				if (apiResponse.error) {
					const errorClassification = classifyApiError(apiResponse)
					const isRetriable = errorClassification.retriable

					if (isRetriable) {
						log(
							`${operationName}: Retriable API Error (Status: ${errorClassification.status}) with key index ${currentKeyIndex}. Rotating key and scheduling retry with backoff.`,
						)
						const cooldownSeconds = errorClassification.status === "RESOURCE_EXHAUSTED" ? 2 : 1
						appState.runtime.apiKeyCooldowns.set(currentKey, Date.now() + cooldownSeconds * 1000)
						const retryHandler = createRetryHandler(handleApiError)
						retryHandler({
							operationName,
							retryCount,
							maxTotalRetries,
							startedAt,
							nextStep: () => {
								retryCount++
								executeIteration()
							},
						})
						return
					}

					const finalError = `API Error (Status: ${errorClassification.status}): ${errorClassification.message}`
					handleApiError(finalError)
					delete appState.runtime.deepAnalysisStartTimes[iterationKey]
					return
				}

				const candidate = apiResponse.candidates?.[0]
				if (!candidate || !candidate.content) {
					let error
					if (candidate?.finishReason === "MAX_TOKENS") {
						error =
							"Analysis failed: The text from the selected chapters is too long, and the AI's response was cut off. Please try again with fewer chapters."
					} else {
						error = `Invalid API response: No content found. Finish Reason: ${
							candidate?.finishReason || "Unknown"
						}`
					}
					handleApiError(error)
					delete appState.runtime.deepAnalysisStartTimes[iterationKey]
					return
				}

				try {
					const resultText = candidate.content.parts[0].text
					parsedResponse = parseApiResponse(resultText)
					log(`${operationName}: Successfully parsed API response content.`, parsedResponse)
				} catch (e) {
					if (parseRetryCount < 1) {
						log(
							`${operationName}: Failed to parse AI response content, scheduling retry with backoff. Error: ${e.message}`,
						)
						updateStatusIndicator("running", "AI response malformed. Retrying...")
						const retryHandler = createRetryHandler(handleApiError)
						retryHandler({
							operationName: `${operationName} (parse recovery)`,
							retryCount,
							maxTotalRetries,
							startedAt,
							nextStep: () => {
								retryCount++
								parseRetryCount++
								executeIteration()
							},
						})
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
					const verifiedItems = parsedResponse.verified_inconsistencies || []
					const newItems = parsedResponse.new_inconsistencies || []

					verifiedItems.forEach((item) => {
						item.isNew = false
						item.status = "Verified"
					})
					newItems.forEach((item) => {
						item.isNew = true
					})

					log(
						`${operationName}: ${verifiedItems.length} concepts re-verified. ${newItems.length} new concepts found.`,
					)

					const allNewItems = [...verifiedItems, ...newItems]
					appState.runtime.cumulativeResults = mergeAnalysisResults(
						appState.runtime.cumulativeResults,
						allNewItems,
					)
				} else {
					if (!Array.isArray(parsedResponse)) {
						handleApiError("Invalid response format for initial run. Expected a JSON array.")
						delete appState.runtime.deepAnalysisStartTimes[iterationKey]
						return
					}
					parsedResponse.forEach((r) => (r.isNew = true))
					appState.runtime.cumulativeResults = mergeAnalysisResults(
						appState.runtime.cumulativeResults,
						parsedResponse,
					)
				}

				// Save session results after each iteration
				saveSessionResults()

				// Continue to next iteration or complete
				appState.runtime.currentIteration = currentDepth + 1
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
					`${operationName}: Network error with key index ${currentKeyIndex}. Rotating key and scheduling retry with backoff.`,
				)
				appState.runtime.apiKeyCooldowns.set(currentKey, Date.now() + 1000) // 1-second cooldown

				const retryHandler = createRetryHandler(handleApiError)
				retryHandler({
					operationName,
					retryCount,
					maxTotalRetries,
					startedAt,
					nextStep: () => {
						retryCount++
						executeIteration()
					},
				})
			},
		})
	}

	executeIteration()
}
