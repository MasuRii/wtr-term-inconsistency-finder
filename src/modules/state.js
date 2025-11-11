// src/modules/state.js
import { log } from "./utils";

const SCRIPT_PREFIX = "wtr_inconsistency_finder_";
export const CONFIG_KEY = `${SCRIPT_PREFIX}config`;
export const MODELS_CACHE_KEY = `${SCRIPT_PREFIX}models_cache`;
export const SESSION_RESULTS_KEY = `${SCRIPT_PREFIX}session_results`;
export const KEY_STATE_KEY = `${SCRIPT_PREFIX}key_states`; // Persistent key state tracking

export const appState = {
  // Configuration
  config: {
    apiKeys: [],
    model: "",
    useJson: false,
    loggingEnabled: false,
    temperature: 0.5,
    activeTab: "finder",
    activeFilter: "all",
    deepAnalysisDepth: 1,
  },
  // Runtime state
  runtime: {
    isAnalysisRunning: false,
    cumulativeResults: [],
    currentApiKeyIndex: 0,
    apiKeyCooldowns: new Map(),
    failedKeys: new Set(), // Track keys that have failed due to quota exhaustion
    currentIteration: 1,
    totalIterations: 1,
  },
  // Session data
  session: {
    hasSavedResults: false,
    lastAnalysisTime: null,
  },
  // User preferences
  preferences: {
    autoRestoreResults: true,
  },
};

// --- DATA SANITIZATION ---
function sanitizeSuggestionData(suggestion) {
  // Enhanced suggestion sanitization with multiple fallback strategies
  const sanitized = { ...suggestion };

  // Fix missing or invalid suggestion field
  if (
    !sanitized.suggestion ||
    typeof sanitized.suggestion !== "string" ||
    sanitized.suggestion.trim() === ""
  ) {
    // Try to extract from display_text
    if (sanitized.display_text && typeof sanitized.display_text === "string") {
      // Remove common prefixes and extract the actual suggestion
      const cleaned = sanitized.display_text
        .replace(
          /^(standardize to|use|change to|replace with|update to)\s*/i,
          "",
        )
        .replace(/^['"`]|['"`]$/g, "") // Remove surrounding quotes
        .trim();

      if (cleaned && cleaned !== sanitized.display_text) {
        sanitized.suggestion = cleaned;
      } else if (cleaned) {
        sanitized.suggestion = cleaned;
      }
    }
  }

  // Ensure suggestion field is valid
  if (
    !sanitized.suggestion ||
    typeof sanitized.suggestion !== "string" ||
    sanitized.suggestion.trim() === ""
  ) {
    // Last resort: use concept name or mark as non-actionable
    sanitized.suggestion = sanitized.display_text || "[Informational]";
  }

  // Clean up other fields
  sanitized.display_text =
    sanitized.display_text || `Use "${sanitized.suggestion}"`;
  sanitized.reasoning = sanitized.reasoning || "AI-generated suggestion";

  return sanitized;
}

function sanitizeResultsData(results) {
  // Sanitize all results to fix corrupted suggestion data from restored sessions
  return results.map((result) => {
    if (!result.suggestions || !Array.isArray(result.suggestions)) {
      return result;
    }

    return {
      ...result,
      suggestions: result.suggestions.map(sanitizeSuggestionData),
    };
  });
}

// --- STATE MANAGEMENT FUNCTIONS ---
export async function loadConfig() {
  const savedConfig = await GM_getValue(CONFIG_KEY, {});

  // --- Migration for single API key to multiple ---
  if (savedConfig.apiKey && !savedConfig.apiKeys) {
    log("Migrating legacy single API key to new array format.");
    savedConfig.apiKeys = [savedConfig.apiKey];
    delete savedConfig.apiKey;
  }
  // --- End Migration ---

  // Load preferences from saved config if they exist
  if (savedConfig.preferences) {
    appState.preferences = {
      ...appState.preferences,
      ...savedConfig.preferences,
    };
    log("Loaded preferences from config:", appState.preferences);
  }

  appState.config = { ...appState.config, ...savedConfig };

  // Load session results if available
  const sessionResults = sessionStorage.getItem(SESSION_RESULTS_KEY);
  if (sessionResults) {
    try {
      const parsed = JSON.parse(sessionResults);
      const rawResults = parsed.results || [];

      // CRITICAL: Sanitize restored results to fix corrupted suggestion data
      const sanitizedResults = sanitizeResultsData(rawResults);

      appState.runtime.cumulativeResults = sanitizedResults;
      appState.session.hasSavedResults = true;
      appState.session.lastAnalysisTime = parsed.timestamp;
      log(
        "Session results loaded and sanitized:",
        appState.runtime.cumulativeResults.length,
        "items",
      );

      // Log any sanitization that was performed
      if (sanitizedResults.length !== rawResults.length) {
        log("🔧 Data sanitization: Results count changed during cleanup");
      } else {
        // Check if any suggestions were modified
        let modifiedSuggestions = 0;
        for (let i = 0; i < sanitizedResults.length; i++) {
          const original = rawResults[i];
          const sanitized = sanitizedResults[i];
          if (original.suggestions && sanitized.suggestions) {
            for (let j = 0; j < sanitized.suggestions.length; j++) {
              if (
                original.suggestions[j]?.suggestion !==
                sanitized.suggestions[j]?.suggestion
              ) {
                modifiedSuggestions++;
              }
            }
          }
        }
        if (modifiedSuggestions > 0) {
          log(
            `🔧 Data sanitization: Fixed ${modifiedSuggestions} corrupted suggestion fields`,
          );
        }
      }
    } catch (e) {
      log("Failed to parse session results:", e);
    }
  }
}

export async function saveConfig() {
  try {
    const configToSave = {
      ...appState.config,
      preferences: appState.preferences,
    };
    await GM_setValue(CONFIG_KEY, configToSave);
    return true;
  } catch (e) {
    console.error("Inconsistency Finder: Error saving config:", e);
    return false;
  }
}

export function saveSessionResults() {
  try {
    const sessionData = {
      results: appState.runtime.cumulativeResults,
      timestamp: Date.now(),
      config: {
        model: appState.config.model,
        temperature: appState.config.temperature,
      },
    };
    sessionStorage.setItem(SESSION_RESULTS_KEY, JSON.stringify(sessionData));
    appState.session.hasSavedResults = true;
    appState.session.lastAnalysisTime = sessionData.timestamp;
    log("Session results saved");
  } catch (e) {
    console.error("Inconsistency Finder: Error saving session results:", e);
  }
}

export function clearSessionResults() {
  try {
    sessionStorage.removeItem(SESSION_RESULTS_KEY);
    appState.session.hasSavedResults = false;
    appState.session.lastAnalysisTime = null;
    log("Session results cleared");
  } catch (e) {
    console.error("Inconsistency Finder: Error clearing session results:", e);
  }
}

// --- KEY STATE MANAGEMENT ---
/**
 * Load persisted key states from localStorage
 * States: AVAILABLE, ON_COOLDOWN, EXHAUSTED, INVALID
 */
export function loadKeyStates() {
  try {
    const savedStates = GM_getValue(KEY_STATE_KEY, {}) || {};
    const now = Date.now();
    const normalizedStates = {};

    Object.keys(savedStates).forEach((key) => {
      const parsedIndex = parseInt(key, 10);
      const index = Number.isNaN(parsedIndex) ? key : parsedIndex;
      const raw = savedStates[key] || {};

      // Defensive normalization
      const status = raw.status || "AVAILABLE";
      const unlockTime =
        typeof raw.unlockTime === "number" && Number.isFinite(raw.unlockTime)
          ? raw.unlockTime
          : 0;
      const failureCount =
        typeof raw.failureCount === "number" && raw.failureCount >= 0
          ? raw.failureCount
          : 0;

      let normalizedStatus = status;
      let normalizedUnlockTime = unlockTime;

      // Auto-refresh cooldown expiry on load to avoid stale "ON_COOLDOWN"
      if (normalizedStatus === "ON_COOLDOWN" && now > normalizedUnlockTime) {
        normalizedStatus = "AVAILABLE";
        normalizedUnlockTime = 0;
      }

      normalizedStates[index] = {
        status: normalizedStatus,
        unlockTime: normalizedUnlockTime,
        lastUsed:
          typeof raw.lastUsed === "number" && Number.isFinite(raw.lastUsed)
            ? raw.lastUsed
            : null,
        failureCount,
        lastReset:
          typeof raw.lastReset === "number" && Number.isFinite(raw.lastReset)
            ? raw.lastReset
            : raw.lastReset || null,
      };
    });

    // Persist normalized states if any structural or semantic differences exist.
    const serializedOriginal = JSON.stringify(savedStates);
    const serializedNormalized = JSON.stringify(normalizedStates);
    if (serializedOriginal !== serializedNormalized) {
      saveKeyStates(normalizedStates);
      log(
        "Inconsistency Finder: Normalized API key states on load to prevent stale cooldown or invalid metadata.",
      );
    }

    return normalizedStates;
  } catch (e) {
    console.error("Inconsistency Finder: Error loading key states:", e);
    return {};
  }
}

/**
 * Save key states to localStorage for persistence across page reloads
 */
export function saveKeyStates(keyStates) {
  try {
    GM_setValue(KEY_STATE_KEY, keyStates);
  } catch (e) {
    console.error("Inconsistency Finder: Error saving key states:", e);
  }
}

/**
 * Initialize key states for all available keys
 */
export function initializeKeyStates() {
  const keyStates = loadKeyStates();
  const now = Date.now();
  let hasChanges = false;

  if (appState.config.apiKeys) {
    appState.config.apiKeys.forEach((key, index) => {
      if (!keyStates[index]) {
        keyStates[index] = {
          status: "AVAILABLE",
          unlockTime: 0,
          lastUsed: null,
          failureCount: 0,
        };
        hasChanges = true;
      } else {
        // Check if cooldown has expired
        if (
          keyStates[index].status === "ON_COOLDOWN" &&
          now > keyStates[index].unlockTime
        ) {
          keyStates[index].status = "AVAILABLE";
          keyStates[index].unlockTime = 0;
          hasChanges = true;
        }
        // Check if daily reset has occurred (for exhausted keys)
        if (keyStates[index].status === "EXHAUSTED") {
          const lastReset = keyStates[index].lastReset || now;
          const daysSinceReset = Math.floor(
            (now - lastReset) / (24 * 60 * 60 * 1000),
          );
          if (daysSinceReset >= 1) {
            keyStates[index] = {
              status: "AVAILABLE",
              unlockTime: 0,
              lastUsed: null,
              failureCount: 0,
              lastReset: now,
            };
            hasChanges = true;
          }
        }
      }
    });
  }

  if (hasChanges) {
    saveKeyStates(keyStates);
  }

  return keyStates;
}

/**
 * Update the state of a specific key
 */
export function updateKeyState(
  keyIndex,
  status,
  unlockTime = null,
  failureCount = 0,
) {
  const keyStates = loadKeyStates();
  const now = Date.now();

  if (!keyStates[keyIndex]) {
    keyStates[keyIndex] = {
      status: "AVAILABLE",
      unlockTime: 0,
      lastUsed: null,
      failureCount: 0,
    };
  }

  // Ensure unlockTime is numeric
  const safeUnlockTime =
    typeof unlockTime === "number" && Number.isFinite(unlockTime)
      ? unlockTime
      : 0;

  // Normalize: if setting ON_COOLDOWN with past unlockTime (time drift), treat as AVAILABLE.
  let nextStatus = status;
  let nextUnlockTime = safeUnlockTime;
  if (nextStatus === "ON_COOLDOWN" && now > safeUnlockTime) {
    nextStatus = "AVAILABLE";
    nextUnlockTime = 0;
  }

  const prevFailureCount =
    typeof keyStates[keyIndex].failureCount === "number"
      ? keyStates[keyIndex].failureCount
      : 0;

  const nextFailureCount = Math.max(0, prevFailureCount + failureCount);

  keyStates[keyIndex] = {
    ...keyStates[keyIndex],
    status: nextStatus,
    unlockTime: nextUnlockTime,
    lastUsed: now,
    failureCount: nextFailureCount,
  };

  // Mark as permanently invalid after 3 consecutive failures (unless explicitly set INVALID)
  if (keyStates[keyIndex].failureCount >= 3 && status !== "INVALID") {
    keyStates[keyIndex].status = "INVALID";
  }

  saveKeyStates(keyStates);
  return keyStates[keyIndex];
}

/**
 * Get the next available key according to state management rules
 */
export function getNextAvailableKey() {
  const keyStates = initializeKeyStates();
  const now = Date.now();

  if (!appState.config.apiKeys || appState.config.apiKeys.length === 0) {
    return null;
  }

  // Proactively refresh any keys whose cooldown has expired based on real-time clock.
  // This ensures that after inactivity, the first attempt sees available keys
  // without requiring a prior failure to trigger a state refresh.
  let refreshNeeded = false;
  for (let i = 0; i < appState.config.apiKeys.length; i++) {
    const state = keyStates[i];
    if (
      state &&
      state.status === "ON_COOLDOWN" &&
      typeof state.unlockTime === "number" &&
      Number.isFinite(state.unlockTime) &&
      now > state.unlockTime
    ) {
      keyStates[i] = {
        ...state,
        status: "AVAILABLE",
        unlockTime: 0,
      };
      refreshNeeded = true;
    }
  }
  if (refreshNeeded) {
    saveKeyStates(keyStates);
    log(
      "Inconsistency Finder: Refreshed API key cooldown states before selection.",
    );
  }

  // First pass: look for AVAILABLE keys
  for (let i = 0; i < appState.config.apiKeys.length; i++) {
    const keyIndex =
      (appState.runtime.currentApiKeyIndex + i) %
      appState.config.apiKeys.length;
    const keyState = keyStates[keyIndex];

    if (keyState && keyState.status === "AVAILABLE") {
      // Found an available key
      updateKeyState(keyIndex, "AVAILABLE", 0, -1); // Reset failure count
      appState.runtime.currentApiKeyIndex =
        (keyIndex + 1) % appState.config.apiKeys.length;
      return {
        key: appState.config.apiKeys[keyIndex],
        index: keyIndex,
        state: keyState,
      };
    }
  }

  // Second pass: check for keys whose cooldown has expired
  for (let i = 0; i < appState.config.apiKeys.length; i++) {
    const keyIndex =
      (appState.runtime.currentApiKeyIndex + i) %
      appState.config.apiKeys.length;
    const keyState = keyStates[keyIndex];

    if (
      keyState &&
      keyState.status === "ON_COOLDOWN" &&
      now > keyState.unlockTime
    ) {
      // Cooldown expired, make it available
      updateKeyState(keyIndex, "AVAILABLE", 0, -1);
      appState.runtime.currentApiKeyIndex =
        (keyIndex + 1) % appState.config.apiKeys.length;
      return {
        key: appState.config.apiKeys[keyIndex],
        index: keyIndex,
        state: keyStates[keyIndex],
      };
    }
  }

  // No keys available, find the one that will be available soonest
  let soonestKey = null;
  let soonestTime = Infinity;

  for (let i = 0; i < appState.config.apiKeys.length; i++) {
    const keyState = keyStates[i];
    if (
      keyState &&
      keyState.status === "ON_COOLDOWN" &&
      keyState.unlockTime < soonestTime
    ) {
      soonestKey = i;
      soonestTime = keyState.unlockTime;
    }
  }

  if (soonestKey !== null) {
    const waitTime = Math.max(0, soonestTime - now);
    const minutes = Math.ceil(waitTime / (60 * 1000));
    log(
      `All keys are currently unavailable. Next key (index ${soonestKey}) will be available in ${minutes} minutes.`,
    );
  } else {
    log("All available API keys are permanently invalid or exhausted.");
  }

  return null; // No keys currently available
}
