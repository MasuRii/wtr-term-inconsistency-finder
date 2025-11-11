// src/modules/api/deep.js
import { appState } from "../state";
import { log } from "../utils";
import { displayResults, updateStatusIndicator } from "../ui";
import { getAvailableApiKey } from "./keys";
import { generatePrompt } from "./prompts";

export function findInconsistenciesDeepAnalysis(
  chapterData,
  existingResults = [],
  targetDepth = 1,
  currentDepth = 1,
) {
  if (currentDepth > targetDepth) {
    // Deep analysis complete
    appState.runtime.isAnalysisRunning = false;
    const statusMessage =
      targetDepth > 1
        ? `Complete! (Deep Analysis: ${targetDepth} iterations)`
        : "Complete!";
    updateStatusIndicator("complete", statusMessage);
    document.getElementById("wtr-if-continue-btn").disabled = false;
    displayResults(appState.runtime.cumulativeResults);
    return;
  }

  log(`Starting deep analysis iteration ${currentDepth}/${targetDepth}`);

  // Update status to show iteration progress
  if (targetDepth > 1) {
    updateStatusIndicator(
      "running",
      `Deep Analysis (${currentDepth}/${targetDepth})...`,
    );
  } else {
    updateStatusIndicator(
      "running",
      currentDepth > 1
        ? `Deep Analysis (${currentDepth}/${targetDepth})...`
        : "Analyzing...",
    );
  }

  // Standardized context selection - always use cumulative results for deep analysis
  const contextResults =
    appState.runtime.cumulativeResults.length > 0
      ? appState.runtime.cumulativeResults
      : existingResults;

  // Run iteration only if we have a real deep analysis (depth > 1)
  if (targetDepth > 1) {
    findInconsistenciesIteration(
      chapterData,
      contextResults,
      targetDepth,
      currentDepth,
    );
  } else {
    // For normal analysis (depth = 1), use the regular analysis function
    import("./core.js").then(({ findInconsistencies }) => {
      findInconsistencies(chapterData, contextResults);
    });
  }
}

function findInconsistenciesIteration(
  chapterData,
  existingResults,
  targetDepth,
  currentDepth,
) {
  const maxTotalRetries =
    Math.max(1, appState.config.apiKeys.length) * MAX_RETRIES_PER_KEY;
  let retryCount = 0;
  let parseRetryCount = 0;

  // Track when this deep analysis iteration started to enforce a safety window
  const iterationKey = `deep_${currentDepth}`;
  const now = Date.now();
  if (!appState.runtime.deepAnalysisStartTimes) {
    appState.runtime.deepAnalysisStartTimes = {};
  }
  if (!appState.runtime.deepAnalysisStartTimes[iterationKey]) {
    appState.runtime.deepAnalysisStartTimes[iterationKey] = now;
  }
  const startedAt = appState.runtime.deepAnalysisStartTimes[iterationKey];

  const operationName = `Deep analysis iteration ${currentDepth}/${targetDepth}`;

  const executeIteration = () => {
    // Attempt-based ceiling
    if (retryCount >= maxTotalRetries) {
      handleApiError(
        `${operationName} failed after ${retryCount} attempts. Please check your API keys or wait a while.`,
      );
      delete appState.runtime.deepAnalysisStartTimes[iterationKey];
      return;
    }

    // Time-based safety ceiling
    if (Date.now() - startedAt > MAX_TOTAL_RETRY_DURATION_MS) {
      handleApiError(
        `${operationName} failed after repeated retries over an extended period. Please wait a while before trying again.`,
      );
      delete appState.runtime.deepAnalysisStartTimes[iterationKey];
      return;
    }

    const apiKeyInfo = getAvailableApiKey();
    if (!apiKeyInfo) {
      handleApiError(
        "All API keys are currently rate-limited or failing. Please wait a moment before trying again.",
      );
      delete appState.runtime.deepAnalysisStartTimes[iterationKey];
      return;
    }
    const currentKey = apiKeyInfo.key;
    const currentKeyIndex = apiKeyInfo.index;

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

        // Shell parse: treat as retriable (can be transient / truncation)
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
            nextStep: () => {
              retryCount++;
              executeIteration();
            },
          });
          return;
        }

        if (apiResponse.error) {
          const errorStatus = apiResponse.error.status;
          const errorMessage = apiResponse.error.message || "";
          const isRetriable =
            RETRIABLE_STATUSES.has(errorStatus) ||
            errorMessage.includes("The model is overloaded");

          if (isRetriable) {
            log(
              `${operationName}: Retriable API Error (Status: ${errorStatus}) with key index ${currentKeyIndex}. Rotating key and scheduling retry with backoff.`,
            );
            const cooldownSeconds =
              errorStatus === "RESOURCE_EXHAUSTED" ? 2 : 1;
            appState.runtime.apiKeyCooldowns.set(
              currentKey,
              Date.now() + cooldownSeconds * 1000,
            );
            scheduleRetriableRetry({
              operationName,
              retryCount,
              maxTotalRetries,
              startedAt,
              nextStep: () => {
                retryCount++;
                executeIteration();
              },
            });
            return;
          }

          const finalError = `API Error (Status: ${errorStatus}): ${errorMessage}`;
          handleApiError(finalError);
          delete appState.runtime.deepAnalysisStartTimes[iterationKey];
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
          delete appState.runtime.deepAnalysisStartTimes[iterationKey];
          return;
        }

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
              nextStep: () => {
                retryCount++;
                parseRetryCount++;
                executeIteration();
              },
            });
            return;
          }
          const error = `${operationName} failed to process AI response content after retry: ${e.message}`;
          handleApiError(error);
          delete appState.runtime.deepAnalysisStartTimes[iterationKey];
          return;
        }

        // On success, advance the key index for the next run
        appState.runtime.currentApiKeyIndex =
          (currentKeyIndex + 1) % appState.config.apiKeys.length;

        const isVerificationRun = existingResults.length > 0;

        if (isVerificationRun) {
          if (
            !parsedResponse.verified_inconsistencies ||
            !parsedResponse.new_inconsistencies
          ) {
            handleApiError(
              "Invalid response format for verification run. Expected 'verified_inconsistencies' and 'new_inconsistencies' keys.",
            );
            delete appState.runtime.deepAnalysisStartTimes[iterationKey];
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
            `${operationName}: ${verifiedItems.length} concepts re-verified. ${newItems.length} new concepts found.`,
          );

          const allNewItems = [...verifiedItems, ...newItems];
          appState.runtime.cumulativeResults = mergeAnalysisResults(
            appState.runtime.cumulativeResults,
            allNewItems,
          );
        } else {
          if (!Array.isArray(parsedResponse)) {
            handleApiError(
              "Invalid response format for initial run. Expected a JSON array.",
            );
            delete appState.runtime.deepAnalysisStartTimes[iterationKey];
            return;
          }
          parsedResponse.forEach((r) => (r.isNew = true));
          appState.runtime.cumulativeResults = mergeAnalysisResults(
            appState.runtime.cumulativeResults,
            parsedResponse,
          );
        }

        // Save session results after each iteration
        saveSessionResults();

        // Continue to next iteration or complete
        appState.runtime.currentIteration = currentDepth + 1;
        if (currentDepth < targetDepth) {
          // Next iteration; we keep per-iteration timing, so do not reset deepAnalysisStartTimes
          setTimeout(() => {
            findInconsistenciesDeepAnalysis(
              chapterData,
              appState.runtime.cumulativeResults,
              targetDepth,
              currentDepth + 1,
            );
          }, 1000);
        } else {
          // Deep analysis complete for this path
          delete appState.runtime.deepAnalysisStartTimes[iterationKey];
          appState.runtime.isAnalysisRunning = false;
          updateStatusIndicator(
            "complete",
            `Complete! (Deep Analysis: ${targetDepth} iterations)`,
          );
          const continueBtn = document.getElementById("wtr-if-continue-btn");
          if (continueBtn) {
            continueBtn.disabled = false;
          }
          displayResults(appState.runtime.cumulativeResults);
        }
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
          nextStep: () => {
            retryCount++;
            executeIteration();
          },
        });
      },
    });
  };

  executeIteration();
}

// Constants and helper functions
const MAX_RETRIES_PER_KEY = 3;
const MAX_TOTAL_RETRY_DURATION_MS = 5 * 60 * 1000; // 5 minutes safety cap per run
const BASE_BACKOFF_MS = 2000; // 2s
const MAX_BACKOFF_MS = 60000; // 60s cap
const RETRIABLE_STATUSES = new Set([
  "RESOURCE_EXHAUSTED", // 429 Rate limit
  "INTERNAL", // 500 Server error
  "UNAVAILABLE", // 503 Service overloaded
  "DEADLINE_EXCEEDED", // 504 Request timed out
]);

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
    delete appState.runtime.deepAnalysisStartTimes[iterationKey];
  }

  updateStatusIndicator("error", "Error!");
  displayResults(appState.runtime.cumulativeResults);
}

// Import required functions
import { extractJsonFromString } from "../utils";
import { saveSessionResults, mergeAnalysisResults } from "../state";
