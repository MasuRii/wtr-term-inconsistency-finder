// src/modules/api/keys.js
import { updateKeyState, getNextAvailableKey, appState } from "../state";
import { log } from "../utils";
import { updateStatusIndicator, displayResults } from "../ui";

const _MAX_RETRIES_PER_KEY = 3;

// Exponential backoff settings (per logical operation, not per key)
const BASE_BACKOFF_MS = 2000; // 2s
const MAX_BACKOFF_MS = 60000; // 60s cap
const MAX_TOTAL_RETRY_DURATION_MS = 5 * 60 * 1000; // 5 minutes safety cap per run

const RETRIABLE_STATUSES = new Set([
  "RESOURCE_EXHAUSTED", // 429 Rate limit
  "INTERNAL", // 500 Server error
  "UNAVAILABLE", // 503 Service overloaded
  "DEADLINE_EXCEEDED", // 504 Request timed out
]);

/**
 * Calculate exponential backoff delay with an upper bound.
 * retryIndex is zero-based: 0 -> BASE_BACKOFF_MS, 1 -> 2x, 2 -> 4x, etc.
 */
function calculateBackoffDelayMs(retryIndex) {
  const delay = BASE_BACKOFF_MS * Math.pow(2, retryIndex);
  return Math.min(delay, MAX_BACKOFF_MS);
}

/**
 * Schedule a retriable retry with exponential backoff.
 * - Preserves existing key rotation & cooldown logic (caller must have set cooldowns).
 * - Ensures we do not exceed a global max retry window.
 * - Provides consistent logging and UI feedback.
 */
function scheduleRetriableRetry({
  operationName,
  retryCount,
  maxTotalRetries,
  startedAt,
  nextStep,
}) {
  const now = Date.now();

  // Enforce attempt-based and time-based ceilings
  if (retryCount >= maxTotalRetries) {
    handleApiError(
      `${operationName} failed after ${retryCount} attempts across all keys. Please check your API keys or wait a while.`,
    );
    return;
  }

  if (now - startedAt > MAX_TOTAL_RETRY_DURATION_MS) {
    handleApiError(
      `${operationName} failed after repeated retries over an extended period. Please wait a while before trying again.`,
    );
    return;
  }

  const delay = calculateBackoffDelayMs(retryCount);
  log(
    `${operationName}: Scheduling retry #${
      retryCount + 1
    } with exponential backoff delay ${delay}ms.`,
  );
  updateStatusIndicator(
    "running",
    `Retrying in ${Math.round(delay / 1000)}s...`,
  );

  // Ensure no uncaught exceptions propagate from the scheduled callback
  setTimeout(() => {
    try {
      nextStep();
    } catch (e) {
      console.error(
        `Inconsistency Finder: Uncaught error during scheduled retry for ${operationName}:`,
        e,
      );
      handleApiError(
        `${operationName} encountered an unexpected error during retry. Please try again.`,
      );
    }
  }, delay);
}

/**
 * Handle API errors with proper logging and state management
 */
function handleApiError(errorMessage) {
  console.error("Inconsistency Finder:", errorMessage);
  appState.runtime.cumulativeResults.push({ error: errorMessage });
  appState.runtime.isAnalysisRunning = false;

  // Reset retry-related state so future runs are clean
  appState.runtime.analysisStartedAt = null;
  if (appState.runtime.deepAnalysisStartTimes) {
    appState.runtime.deepAnalysisStartTimes = {};
  }

  updateStatusIndicator("error", "Error!");
  displayResults(appState.runtime.cumulativeResults);
}

/**
 * Get the next available API key with rotation logic
 */
export function getAvailableApiKey() {
  const apiKeyInfo = getNextAvailableKey();
  if (apiKeyInfo) {
    return {
      key: apiKeyInfo.key,
      index: apiKeyInfo.index,
      state: apiKeyInfo.state,
    };
  }
  return null;
}

/**
 * Handle API error responses and determine retry eligibility
 */
export function handleApiErrorStatus(
  apiResponse,
  operationName,
  currentKeyIndex,
  retryCount,
  maxTotalRetries,
  startedAt,
  nextStep,
) {
  const errorStatus = apiResponse.error.status;
  const errorMessage = apiResponse.error.message || "";
  const isRetriable =
    RETRIABLE_STATUSES.has(errorStatus) ||
    errorMessage.includes("The model is overloaded");

  if (isRetriable) {
    log(
      `${operationName}: Retriable API Error (Status: ${errorStatus}) with key index ${currentKeyIndex}.`,
    );

    if (errorStatus === "RESOURCE_EXHAUSTED") {
      // Mark key as exhausted with 24-hour cooldown (daily reset)
      const unlockTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      updateKeyState(currentKeyIndex, "EXHAUSTED", unlockTime, 1);
      log(
        `Key ${currentKeyIndex} marked as EXHAUSTED. Will reset in 24 hours.`,
      );
    } else if (errorStatus === "UNAVAILABLE" || errorStatus === "INTERNAL") {
      // Temporary server issues - put on short cooldown
      const unlockTime = Date.now() + 60 * 1000; // 1 minute
      updateKeyState(currentKeyIndex, "ON_COOLDOWN", unlockTime, 1);
      log(`Key ${currentKeyIndex} on temporary COOLDOWN for 1 minute.`);
    } else if (errorStatus === "DEADLINE_EXCEEDED") {
      // Request timeout - brief cooldown
      const unlockTime = Date.now() + 30 * 1000; // 30 seconds
      updateKeyState(currentKeyIndex, "ON_COOLDOWN", unlockTime, 1);
      log(`Key ${currentKeyIndex} on timeout COOLDOWN for 30 seconds.`);
    }

    scheduleRetriableRetry({
      operationName,
      retryCount,
      maxTotalRetries,
      startedAt,
      nextStep,
    });
    return true;
  }

  return false;
}
