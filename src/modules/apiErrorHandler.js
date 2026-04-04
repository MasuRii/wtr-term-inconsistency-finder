/**
 * API Error Handler Module
 * Centralizes error handling for API requests and responses
 */

import { appState } from "./state"
import { RETRIABLE_STATUSES } from "./retryLogic"
import { updateStatusIndicator } from "./ui"
import { displayResults } from "./ui"
import { log } from "./utils"

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
export function classifyApiError(apiResponse, httpStatus = null) {
	if (!apiResponse.error) {
		return { type: "none", retriable: false }
	}

	const errorMessage = apiResponse.error.message || ""
	const errorSignals = [apiResponse.error.status, apiResponse.error.type, apiResponse.error.code, errorMessage]
		.filter(Boolean)
		.join(" ")
		.toLowerCase()

	let errorStatus = apiResponse.error.status
	if (!errorStatus) {
		if (errorSignals.includes("insufficient_quota") || errorSignals.includes("quota")) {
			errorStatus = "RESOURCE_EXHAUSTED"
		} else if (httpStatus === 429) {
			errorStatus = "RATE_LIMIT"
		} else if (httpStatus === 408 || httpStatus === 504) {
			errorStatus = "DEADLINE_EXCEEDED"
		} else if (httpStatus === 500 || httpStatus === 502) {
			errorStatus = "INTERNAL"
		} else if (httpStatus === 503) {
			errorStatus = "UNAVAILABLE"
		} else if (httpStatus === 401) {
			errorStatus = "UNAUTHORIZED"
		} else if (httpStatus === 403) {
			errorStatus = "FORBIDDEN"
		} else if (httpStatus) {
			errorStatus = `HTTP_${httpStatus}`
		} else {
			errorStatus = "UNKNOWN"
		}
	}

	const isRetriable =
		RETRIABLE_STATUSES.has(errorStatus) ||
		errorStatus === "RATE_LIMIT" ||
		errorMessage.includes("The model is overloaded")

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
		log("API key marked exhausted.", {
			keyIndex,
			status: errorClassification.status,
			cooldownMs: 24 * 60 * 60 * 1000,
		})
	} else if (errorClassification.status === "RATE_LIMIT") {
		const unlockTime = Date.now() + 60 * 1000 // 60 seconds
		updateKeyState(keyIndex, "ON_COOLDOWN", unlockTime, 1)
		log("API key entered cooldown.", {
			keyIndex,
			status: errorClassification.status,
			cooldownMs: 60 * 1000,
		})
	} else if (errorClassification.status === "UNAVAILABLE" || errorClassification.status === "INTERNAL") {
		// Temporary server issues - put on short cooldown for faster cycling
		const unlockTime = Date.now() + 5 * 1000 // 5 seconds
		updateKeyState(keyIndex, "ON_COOLDOWN", unlockTime, 1)
		log("API key entered cooldown.", {
			keyIndex,
			status: errorClassification.status,
			cooldownMs: 5 * 1000,
		})
	} else if (errorClassification.status === "DEADLINE_EXCEEDED") {
		// Request timeout - brief cooldown for faster cycling
		const unlockTime = Date.now() + 2 * 1000 // 2 seconds
		updateKeyState(keyIndex, "ON_COOLDOWN", unlockTime, 1)
		log("API key entered cooldown.", {
			keyIndex,
			status: errorClassification.status,
			cooldownMs: 2 * 1000,
		})
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
		case "RATE_LIMIT":
			return 60 * 1000 // 60 seconds
		case "UNAVAILABLE":
		case "INTERNAL":
			return 5 * 1000 // 5 seconds for faster cycling
		case "DEADLINE_EXCEEDED":
			return 2 * 1000 // 2 seconds for faster cycling
		default:
			return 5 * 1000 // Default 5 seconds for faster cycling
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
			return "API quota exhausted. Please wait before trying again or switch to another key."
		case "RATE_LIMIT":
			return "API rate limit exceeded. Please wait a moment before trying again."
		case "UNAVAILABLE":
			return "The AI provider is temporarily unavailable. Please try again in a few minutes."
		case "INTERNAL":
			return "The AI provider returned an internal server error. Please try again later."
		case "DEADLINE_EXCEEDED":
			return "Request timed out. The text may be too long. Try analyzing fewer chapters."
		case "MAX_TOKENS":
			return "Analysis failed: The text from the selected chapters is too long. Please try again with fewer chapters."
		default:
			return `API Error: ${errorClassification.message || "Unknown error occurred"}`
	}
}
