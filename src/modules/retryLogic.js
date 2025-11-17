/**
 * Retry Logic Module
 * Handles exponential backoff and retry scheduling for API requests
 */

import { log } from "./utils"
import { updateStatusIndicator } from "./ui"

// Constants for retry configuration
export const MAX_RETRIES_PER_KEY = 3

// Exponential backoff settings (per logical operation, not per key)
export const BASE_BACKOFF_MS = 2000 // 2s
export const MAX_BACKOFF_MS = 60000 // 60s cap
export const MAX_TOTAL_RETRY_DURATION_MS = 5 * 60 * 1000 // 5 minutes safety cap per run

export const RETRIABLE_STATUSES = new Set([
	"RESOURCE_EXHAUSTED", // 429 Rate limit
	"INTERNAL", // 500 Server error
	"UNAVAILABLE", // 503 Service overloaded
	"DEADLINE_EXCEEDED", // 504 Request timed out
])

/**
 * Calculate exponential backoff delay with an upper bound.
 * retryIndex is zero-based: 0 -> BASE_BACKOFF_MS, 1 -> 2x, 2 -> 4x, etc.
 * @param {number} retryIndex - Zero-based retry attempt index
 * @returns {number} - Delay in milliseconds
 */
export function calculateBackoffDelayMs(retryIndex) {
	const delay = BASE_BACKOFF_MS * Math.pow(2, retryIndex)
	return Math.min(delay, MAX_BACKOFF_MS)
}

/**
 * Schedule an immediate retriable retry with the next available key.
 * @param {Object} options - Retry options
 * @param {string} options.operationName - Name of the operation for logging
 * @param {number} options.retryCount - Current retry attempt count
 * @param {number} options.maxTotalRetries - Maximum total retries allowed
 * @param {number} options.startedAt - Timestamp when operation started
 * @param {Function} options.nextStep - Function to call immediately
 * @param {Function} [options.errorHandler] - Optional error handler function to avoid circular dependencies
 */
export function scheduleRetriableRetry({
	operationName,
	retryCount,
	maxTotalRetries,
	startedAt,
	nextStep,
	errorHandler = null,
}) {
	const now = Date.now()

	// Enforce attempt-based and time-based ceilings
	if (retryCount >= maxTotalRetries) {
		const errorMessage = `${operationName} failed after ${retryCount} attempts across all keys. Please check your API keys or wait a while.`
		if (errorHandler) {
			errorHandler(errorMessage)
		} else {
			console.error("Inconsistency Finder:", errorMessage)
		}
		return
	}

	if (now - startedAt > MAX_TOTAL_RETRY_DURATION_MS) {
		const errorMessage = `${operationName} failed after repeated retries over an extended period. Please wait a while before trying again.`
		if (errorHandler) {
			errorHandler(errorMessage)
		} else {
			console.error("Inconsistency Finder:", errorMessage)
		}
		return
	}

	log(`${operationName}: Scheduling immediate retry #${retryCount + 1} with next available key.`)
	updateStatusIndicator("running", `Retrying immediately...`)

	// Ensure no uncaught exceptions propagate from the callback
	try {
		nextStep()
	} catch (e) {
		console.error(`Inconsistency Finder: Uncaught error during immediate retry for ${operationName}:`, e)
		const errorMessage = `${operationName} encountered an unexpected error during retry. Please try again.`
		if (errorHandler) {
			errorHandler(errorMessage)
		} else {
			console.error("Inconsistency Finder:", errorMessage)
		}
	}
}

/**
 * Create a retry handler with a specific error handler to avoid circular dependencies
 * @param {Function} errorHandler - The error handler function to use
 * @returns {Function} - A retry scheduling function with the error handler bound
 */
export function createRetryHandler(errorHandler) {
	return function scheduleRetriableRetryWithHandler(options) {
		return scheduleRetriableRetry({
			...options,
			errorHandler,
		})
	}
}
