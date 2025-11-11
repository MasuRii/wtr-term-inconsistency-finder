// src/modules/api/core.js
import { appState } from "../state";
import { extractJsonFromString, log } from "../utils";
import { displayResults, updateStatusIndicator } from "../ui";
import { getAvailableApiKey, handleApiErrorStatus } from "./keys";
import { generatePrompt } from "./prompts";

export function findInconsistencies(
  chapterData,
  existingResults = [],
  retryCount = 0,
  parseRetryCount = 0,
) {
  const operationName = "Analysis";
  const maxTotalRetries =
    Math.max(1, appState.config.apiKeys.length) * MAX_RETRIES_PER_KEY;

  // Initialize or reuse startedAt to enforce a global safety window for this run
  const startedAt = appState.runtime.analysisStartedAt || Date.now();
  if (!appState.runtime.analysisStartedAt) {
    appState.runtime.analysisStartedAt = startedAt;
  }

  // Hard cap by attempts
  if (retryCount >= maxTotalRetries) {
    handleApiError(
      `${operationName} failed after ${retryCount} attempts across all keys. Please check your API keys or wait a while.`,
    );
    return;
  }

  // Hard cap by duration (5-minute safety net)
  if (Date.now() - startedAt > MAX_TOTAL_RETRY_DURATION_MS) {
    handleApiError(
      `${operationName} failed after repeated retries over an extended period. Please wait a while before trying again.`,
    );
    return;
  }

  const apiKeyInfo = getAvailableApiKey();
  if (!apiKeyInfo) {
    handleApiError(
      "All API keys are currently rate-limited or failing. Please wait a moment before trying again.",
    );
    return;
  }
  const currentKey = apiKeyInfo.key;
  const currentKeyIndex = apiKeyInfo.index;

  appState.runtime.isAnalysisRunning = true;
  updateStatusIndicator(
    "running",
    `${operationName} (Key ${currentKeyIndex + 1}, Attempt ${
      retryCount + 1
    })...`,
  );

  const combinedText = chapterData
    .map((d) => `--- CHAPTER ${d.chapter} ---\n${d.text}`)
    .join("\n\n");
  log(
    `${operationName}: Sending ${
      combinedText.length
    } characters to the AI. Using key index: ${currentKeyIndex}. (Total Attempt ${
      retryCount + 1
    })`,
  );

  const prompt = generatePrompt(combinedText, existingResults);
  const requestData = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: appState.config.temperature,
    },
  };

  GM_xmlhttpRequest({
    method: "POST",
    url: `https://generativelanguage.googleapis.com/v1beta/${appState.config.model}:generateContent?key=${currentKey}`,
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify(requestData),
    onload: function (response) {
      log("Received raw response from API:", response.responseText);
      let apiResponse;
      let parsedResponse;

      // Shell parse errors are treated as retriable (can be transient)
      try {
        apiResponse = JSON.parse(response.responseText);
      } catch (e) {
        log(
          `${operationName}: Failed to parse API response shell: ${e.message}. Scheduling retry with backoff.`,
        );
        scheduleRetriableRetry({
          operationName: `${operationName} (shell parse recovery)`,
          retryCount,
          maxTotalRetries,
          startedAt,
          nextStep: () =>
            findInconsistencies(
              chapterData,
              existingResults,
              retryCount + 1,
              parseRetryCount,
            ),
        });
        return;
      }

      // Handle explicit API error responses
      if (apiResponse.error) {
        const handled = handleApiErrorStatus(
          apiResponse,
          operationName,
          currentKeyIndex,
          retryCount,
          maxTotalRetries,
          startedAt,
          () =>
            findInconsistencies(
              chapterData,
              existingResults,
              retryCount + 1,
              parseRetryCount,
            ),
        );
        if (handled) {
          return;
        }

        // Non-retriable API error -> final failure
        const finalError = `API Error (Status: ${apiResponse.error.status}): ${apiResponse.error.message}`;
        handleApiError(finalError);
        return;
      }

      const candidate = apiResponse.candidates?.[0];
      if (!candidate || !candidate.content) {
        let error;
        if (candidate?.finishReason === "MAX_TOKENS") {
          error =
            "Analysis failed: The text from the selected chapters is too long, and the AI's response was cut off. Please try again with fewer chapters.";
        } else {
          error = `Invalid API response: No content found. Finish Reason: ${
            candidate?.finishReason || "Unknown"
          }`;
        }
        handleApiError(error);
        return;
      }

      // Parse the inner content (model JSON); treat malformed JSON as retriable once
      try {
        const resultText = candidate.content.parts[0].text;
        const cleanedJsonString = extractJsonFromString(resultText);
        parsedResponse = JSON.parse(cleanedJsonString);
        log(
          `${operationName}: Successfully parsed API response content.`,
          parsedResponse,
        );
      } catch (e) {
        if (parseRetryCount < 1) {
          log(
            `${operationName}: Failed to parse AI response content, scheduling retry with backoff. Error: ${e.message}`,
          );
          updateStatusIndicator(
            "running",
            "AI response malformed. Retrying...",
          );
          scheduleRetriableRetry({
            operationName: `${operationName} (parse recovery)`,
            retryCount,
            maxTotalRetries,
            startedAt,
            nextStep: () =>
              findInconsistencies(
                chapterData,
                existingResults,
                retryCount + 1,
                parseRetryCount + 1,
              ),
          });
          return;
        }
        const error = `${operationName} failed to process AI response content after retry: ${e.message}`;
        handleApiError(error);
        return;
      }

      // Success: rotate key index for next invocation
      appState.runtime.currentApiKeyIndex =
        (currentKeyIndex + 1) % appState.config.apiKeys.length;
      appState.runtime.isAnalysisRunning = false;
      appState.runtime.analysisStartedAt = null;

      const isVerificationRun = existingResults.length > 0;

      if (isVerificationRun) {
        if (
          !parsedResponse.verified_inconsistencies ||
          !parsedResponse.new_inconsistencies
        ) {
          handleApiError(
            "Invalid response format for verification run. Expected 'verified_inconsistencies' and 'new_inconsistencies' keys.",
          );
          return;
        }
        const verifiedItems = parsedResponse.verified_inconsistencies || [];
        const newItems = parsedResponse.new_inconsistencies || [];

        verifiedItems.forEach((item) => {
          item.isNew = false;
          item.status = "Verified";
        });
        newItems.forEach((item) => {
          item.isNew = true;
        });

        log(
          `Verification complete. ${verifiedItems.length} concepts re-verified. ${newItems.length} new concepts found.`,
        );
        appState.runtime.cumulativeResults = [...verifiedItems, ...newItems];
      } else {
        if (!Array.isArray(parsedResponse)) {
          handleApiError(
            "Invalid response format for initial run. Expected a JSON array.",
          );
          return;
        }
        parsedResponse.forEach((r) => (r.isNew = true));
        appState.runtime.cumulativeResults = parsedResponse;
      }

      saveSessionResults();
      updateStatusIndicator("complete", "Complete!");
      const continueBtn = document.getElementById("wtr-if-continue-btn");
      if (continueBtn) {
        continueBtn.disabled = false;
      }
      displayResults(appState.runtime.cumulativeResults);
    },
    onerror: function (error) {
      console.error("Inconsistency Finder: Network error:", error);
      log(
        `${operationName}: Network error with key index ${currentKeyIndex}. Rotating key and scheduling retry with backoff.`,
      );
      appState.runtime.apiKeyCooldowns.set(currentKey, Date.now() + 1000); // 1-second cooldown

      scheduleRetriableRetry({
        operationName,
        retryCount,
        maxTotalRetries,
        startedAt,
        nextStep: () =>
          findInconsistencies(
            chapterData,
            existingResults,
            retryCount + 1,
            parseRetryCount,
          ),
      });
    },
  });
}

// Constants and helper functions from original file
const MAX_RETRIES_PER_KEY = 3;
const MAX_TOTAL_RETRY_DURATION_MS = 5 * 60 * 1000; // 5 minutes safety cap per run
const BASE_BACKOFF_MS = 2000; // 2s
const MAX_BACKOFF_MS = 60000; // 60s cap

function calculateBackoffDelayMs(retryIndex) {
  const delay = BASE_BACKOFF_MS * Math.pow(2, retryIndex);
  return Math.min(delay, MAX_BACKOFF_MS);
}

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

// Import saveSessionResults from state
import { saveSessionResults } from "../state";
