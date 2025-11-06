// src/modules/state.js
import { log } from "./utils";

const SCRIPT_PREFIX = "wtr_inconsistency_finder_";
export const CONFIG_KEY = `${SCRIPT_PREFIX}config`;
export const MODELS_CACHE_KEY = `${SCRIPT_PREFIX}models_cache`;
export const SESSION_RESULTS_KEY = `${SCRIPT_PREFIX}session_results`;

export let appState = {
  // Configuration
  config: {
    apiKeys: [],
    model: '',
    useJson: false,
    loggingEnabled: false,
    temperature: 0.5,
    activeTab: 'finder',
    activeFilter: 'all',
    deepAnalysisDepth: 1
  },
  // Runtime state
  runtime: {
    isAnalysisRunning: false,
    cumulativeResults: [],
    currentApiKeyIndex: 0,
    apiKeyCooldowns: new Map(),
    currentIteration: 1,
    totalIterations: 1
  },
  // Session data
  session: {
    hasSavedResults: false,
    lastAnalysisTime: null
  },
  // User preferences
  preferences: {
    autoRestoreResults: true
  }
};

// --- DATA SANITIZATION ---
function sanitizeSuggestionData(suggestion) {
  // Enhanced suggestion sanitization with multiple fallback strategies
  const sanitized = {...suggestion};

  // Fix missing or invalid suggestion field
  if (!sanitized.suggestion || typeof sanitized.suggestion !== 'string' || sanitized.suggestion.trim() === '') {
    // Try to extract from display_text
    if (sanitized.display_text && typeof sanitized.display_text === 'string') {
      // Remove common prefixes and extract the actual suggestion
      const cleaned = sanitized.display_text
        .replace(/^(standardize to|use|change to|replace with|update to)\s*/i, '')
        .replace(/^['"`]|['"`]$/g, '') // Remove surrounding quotes
        .trim();

      if (cleaned && cleaned !== sanitized.display_text) {
        sanitized.suggestion = cleaned;
      } else if (cleaned) {
        sanitized.suggestion = cleaned;
      }
    }
  }

  // Ensure suggestion field is valid
  if (!sanitized.suggestion || typeof sanitized.suggestion !== 'string' || sanitized.suggestion.trim() === '') {
    // Last resort: use concept name or mark as non-actionable
    sanitized.suggestion = sanitized.display_text || '[Informational]';
  }

  // Clean up other fields
  sanitized.display_text = sanitized.display_text || `Use "${sanitized.suggestion}"`;
  sanitized.reasoning = sanitized.reasoning || 'AI-generated suggestion';

  return sanitized;
}

function sanitizeResultsData(results) {
  // Sanitize all results to fix corrupted suggestion data from restored sessions
  return results.map(result => {
    if (!result.suggestions || !Array.isArray(result.suggestions)) {
      return result;
    }

    return {
      ...result,
      suggestions: result.suggestions.map(sanitizeSuggestionData)
    };
  });
}

// --- STATE MANAGEMENT FUNCTIONS ---
export async function loadConfig() {
  const savedConfig = await GM_getValue(CONFIG_KEY, {});

  // --- Migration for single API key to multiple ---
  if (savedConfig.apiKey && !savedConfig.apiKeys) {
    log('Migrating legacy single API key to new array format.');
    savedConfig.apiKeys = [savedConfig.apiKey];
    delete savedConfig.apiKey;
  }
  // --- End Migration ---

  appState.config = {...appState.config, ...savedConfig};

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
      log('Session results loaded and sanitized:', appState.runtime.cumulativeResults.length, 'items');

      // Log any sanitization that was performed
      if (sanitizedResults.length !== rawResults.length) {
        log('🔧 Data sanitization: Results count changed during cleanup');
      } else {
        // Check if any suggestions were modified
        let modifiedSuggestions = 0;
        for (let i = 0; i < sanitizedResults.length; i++) {
          const original = rawResults[i];
          const sanitized = sanitizedResults[i];
          if (original.suggestions && sanitized.suggestions) {
            for (let j = 0; j < sanitized.suggestions.length; j++) {
              if (original.suggestions[j]?.suggestion !== sanitized.suggestions[j]?.suggestion) {
                modifiedSuggestions++;
              }
            }
          }
        }
        if (modifiedSuggestions > 0) {
          log(`🔧 Data sanitization: Fixed ${modifiedSuggestions} corrupted suggestion fields`);
        }
      }
    } catch (e) {
      log('Failed to parse session results:', e);
    }
  }
}

export async function saveConfig() {
  try {
    await GM_setValue(CONFIG_KEY, appState.config);
    return true;
  } catch (e) {
    console.error('Inconsistency Finder: Error saving config:', e);
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
        temperature: appState.config.temperature
      }
    };
    sessionStorage.setItem(SESSION_RESULTS_KEY, JSON.stringify(sessionData));
    appState.session.hasSavedResults = true;
    appState.session.lastAnalysisTime = sessionData.timestamp;
    log('Session results saved');
  } catch (e) {
    console.error('Inconsistency Finder: Error saving session results:', e);
  }
}

export function clearSessionResults() {
  try {
    sessionStorage.removeItem(SESSION_RESULTS_KEY);
    appState.session.hasSavedResults = false;
    appState.session.lastAnalysisTime = null;
    log('Session results cleared');
  } catch (e) {
    console.error('Inconsistency Finder: Error clearing session results:', e);
  }
}