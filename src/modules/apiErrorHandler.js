/**
 * API Error Handler Module
 * Centralizes error handling for API requests and responses
 */

import { appState } from "./state"
import { updateStatusIndicator } from "./ui"
import { displayResults } from "./ui"
import { RETRIABLE_STATUSES } from "./retryLogic"

/**
 * Centralized API error handling function
 * @param {string} errorMessage - The error message to handle
 */
export function handleApiError(errorMessage) {
	console.error("Inconsistency Finder:", errorMessage)
	appState.runtime.cumulativeResults.push({ error: errorMessage })
	appState.runtime.isAnalysisRunning = false

	// Reset retry-related state so future runs are clean
	appState.runtime.analysisStartedAt = null
	if (appState.runtime.deepAnalysisStartTimes) {
		appState.runtime.deepAnalysisStartTimes = {}
	}

	updateStatusIndicator("error", "Error!")
	displayResults(appState.runtime.cumulativeResults)
}

/**
 * Classify API error by type and status code
 * @param {Object} apiResponse - The API response object containing error information
 * @returns {Object} - Error classification information
 */
export function classifyApiError(apiResponse) {
	if (!apiResponse.error) {
		return { type: "none", retriable: false }
	}

	const errorStatus = apiResponse.error.status
	const errorMessage = apiResponse.error.message || ""

	const isRetriable = RETRIABLE_STATUSES.has(errorStatus) || errorMessage.includes("The model is overloaded")

	return {
		type: errorStatus || "UNKNOWN",
		message: errorMessage,
		retriable: isRetriable,
		status: errorStatus,
	}
}

/**
 * Create standardized error response object
 * @param {string} type - Error type classification
 * @param {string} message - Error message
 * @param {boolean} retriable - Whether the error is retriable
 * @param {Object} [additionalData] - Additional error data
 * @returns {Object} - Standardized error response
 */
export function createErrorResponse(type, message, retriable = false, additionalData = {}) {
	return {
		error: true,
		type,
		message,
		retriable,
		timestamp: Date.now(),
		...additionalData,
	}
}

/**
 * Handle rate limit specific errors with cooldown management
 * @param {number} keyIndex - The API key index that hit rate limit
 * @param {Object} errorClassification - Error classification from classifyApiError
 * @param {Function} updateKeyState - Function to update key state
 */
export function handleRateLimitError(keyIndex, errorClassification, updateKeyState) {
	if (errorClassification.status === "RESOURCE_EXHAUSTED") {
		// Mark key as exhausted with 24-hour cooldown (daily reset)
		const unlockTime = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
		updateKeyState(keyIndex, "EXHAUSTED", unlockTime, 1)
		console.log(`Key ${keyIndex} marked as EXHAUSTED. Will reset in 24 hours.`)
	} else if (errorClassification.status === "UNAVAILABLE" || errorClassification.status === "INTERNAL") {
		// Temporary server issues - put on short cooldown
		const unlockTime = Date.now() + 60 * 1000 // 1 minute
		updateKeyState(keyIndex, "ON_COOLDOWN", unlockTime, 1)
		console.log(`Key ${keyIndex} on temporary COOLDOWN for 1 minute.`)
	} else if (errorClassification.status === "DEADLINE_EXCEEDED") {
		// Request timeout - brief cooldown
		const unlockTime = Date.now() + 30 * 1000 // 30 seconds
		updateKeyState(keyIndex, "ON_COOLDOWN", unlockTime, 1)
		console.log(`Key ${keyIndex} on timeout COOLDOWN for 30 seconds.`)
	}
}

/**
 * Determine appropriate cooldown duration based on error type
 * @param {Object} errorClassification - Error classification from classifyApiError
 * @returns {number} - Cooldown duration in milliseconds
 */
export function getCooldownDuration(errorClassification) {
	switch (errorClassification.status) {
		case "RESOURCE_EXHAUSTED":
			return 24 * 60 * 60 * 1000 // 24 hours
		case "UNAVAILABLE":
		case "INTERNAL":
			return 60 * 1000 // 1 minute
		case "DEADLINE_EXCEEDED":
			return 30 * 1000 // 30 seconds
		default:
			return 60 * 1000 // Default 1 minute
	}
}

/**
 * Create user-friendly error message based on error type
 * @param {Object} errorClassification - Error classification from classifyApiError
 * @returns {string} - User-friendly error message
 */
export function createUserFriendlyErrorMessage(errorClassification) {
	switch (errorClassification.type) {
		case "RESOURCE_EXHAUSTED":
			return "API rate limit exceeded. Please wait 24 hours before trying again."
		case "UNAVAILABLE":
			return "Gemini API service is temporarily unavailable. Please try again in a few minutes."
		case "INTERNAL":
			return "Gemini API is experiencing internal server issues. Please try again later."
		case "DEADLINE_EXCEEDED":
			return "Request timed out. The text may be too long. Try analyzing fewer chapters."
		case "MAX_TOKENS":
			return "Analysis failed: The text from the selected chapters is too long. Please try again with fewer chapters."
		default:
			return `API Error: ${errorClassification.message || "Unknown error occurred"}`
	}
}
