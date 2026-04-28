/**
 * Gemini API Facade Module
 * Maintains 100% backward compatibility by re-exporting functions from modular submodules
 *
 * This module serves as a backward-compatible facade that delegates to the new modular structure:
 * - retryLogic.ts: Exponential backoff and retry scheduling
 * - promptManager.ts: AI prompt generation and management
 * - apiErrorHandler.ts: Centralized error handling
 * - analysisEngine.ts: Core analysis logic and API communication
 */

import { handleApiError } from "./apiErrorHandler"
import { buildPrompt } from "./promptManager"
import { log } from "./utils"

// ===== BACKWARD COMPATIBILITY RE-EXPORTS =====

// Re-export analysis engine functions for backward compatibility
export {
	getAvailableApiKey,
	findInconsistencies,
	findInconsistenciesDeepAnalysis,
	validateApiKey,
} from "./analysisEngine"

// Re-export retry logic constants and functions
export {
	MAX_RETRIES_PER_KEY,
	BASE_BACKOFF_MS,
	MAX_BACKOFF_MS,
	MAX_TOTAL_RETRY_DURATION_MS,
	RETRIABLE_STATUSES,
	calculateBackoffDelayMs,
	scheduleRetriableRetry,
	createRetryHandler,
} from "./retryLogic"

// Re-export prompt management functions
export { ADVANCED_SYSTEM_PROMPT, buildPrompt, buildDeepAnalysisPrompt, parseApiResponse } from "./promptManager"

// Re-export error handling functions
export {
	handleApiError,
	classifyApiError,
	createErrorResponse,
	handleRateLimitError,
	getCooldownDuration,
	createUserFriendlyErrorMessage,
} from "./apiErrorHandler"

// ===== BACKWARD COMPATIBILITY ALIASES =====

/**
 * Legacy alias for buildPrompt - maintains exact backward compatibility
 * @param {string} chapterText - The chapter text to analyze
 * @param {Array} existingResults - Results from previous analysis for context
 * @returns {string} - Generated prompt for the AI
 */
export function generatePrompt(chapterText, existingResults = []) {
	return buildPrompt(chapterText, existingResults)
}

// ===== DEPRECATED FUNCTIONS (maintained for compatibility) =====

/**
 * Deprecated: This function is now handled internally by analysisEngine
 * Kept for backward compatibility but not recommended for new code
 * @param {string} errorMessage - The error message to handle
 * @deprecated Use handleApiError from apiErrorHandler module directly
 */
export function deprecatedHandleApiError(errorMessage) {
	console.warn("deprecatedHandleApiError is deprecated. Use handleApiError from apiErrorHandler module directly.")
	handleApiError(errorMessage)
}

// ===== MODULE INITIALIZATION =====

// Log successful modular structure initialization when module loads
log("Modular Gemini API structure loaded successfully")
log("├── retryLogic.ts: Exponential backoff and retry scheduling")
log("├── promptManager.ts: AI prompt generation and management")
log("├── apiErrorHandler.ts: Centralized error handling")
log("├── analysisEngine.ts: Core analysis logic and API communication")
log("└── geminiApi.ts: Backward compatibility facade")
