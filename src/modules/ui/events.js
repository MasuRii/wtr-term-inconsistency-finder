// src/modules/ui/events.js
import { appState, saveConfig, clearSessionResults } from "../state";
import {
  crawlChapterData,
  applyTermReplacements,
  getNovelSlug,
  log,
  escapeRegExp
} from "../utils";
import { findInconsistenciesDeepAnalysis } from "../geminiApi";
import {
  fetchAndCacheModels,
  togglePanel,
  addApiKeyRow,
  renderApiKeysUI,
  populateModelSelector,
  updateStatusIndicator,
  escapeHtml
} from "./panel";
import { displayResults } from "./display";

function startAnalysis(isContinuation = false) {
  if (appState.runtime.isAnalysisRunning) {
    alert('An analysis is already in progress.');
    return;
  }
  if (!appState.config.apiKeys || appState.config.apiKeys.length === 0 || !appState.config.model) {
    alert('Please add at least one API key and select a model in the Configuration tab first.');
    document.querySelector('.wtr-if-tab-btn[data-tab="config"]').click();
    togglePanel(true);
    return;
  }

  const deepAnalysisDepth = Math.max(1, parseInt(appState.config.deepAnalysisDepth) || 1);

  if (!isContinuation) {
    appState.runtime.cumulativeResults = [];
    appState.runtime.apiKeyCooldowns.clear();
    appState.runtime.currentApiKeyIndex = 0;
    appState.runtime.currentIteration = 1;
    appState.runtime.totalIterations = deepAnalysisDepth;
    document.getElementById('wtr-if-results').innerHTML = '';
    document.getElementById('wtr-if-continue-btn').disabled = true;
    document.getElementById('wtr-if-filter-select').value = 'all';
    // Clear session results only when starting a completely new analysis
    clearSessionResults();
  }
  // For continuation analysis, keep the continue button enabled if results exist
  if (isContinuation && appState.session.hasSavedResults) {
    document.getElementById('wtr-if-continue-btn').disabled = false;
  }

  if (appState.config.useJson) {
    document.getElementById('wtr-if-file-input').dataset.continuation = isContinuation;
    document.getElementById('wtr-if-file-input').click();
  } else {
    const chapterData = crawlChapterData();
    const processedData = applyTermReplacements(chapterData);
    findInconsistenciesDeepAnalysis(
      processedData,
      isContinuation ? appState.runtime.cumulativeResults : [],
      deepAnalysisDepth
    );
    togglePanel(false);
  }
}

export function handleSaveConfig() {
  const keyInputs = document.querySelectorAll('.wtr-if-api-key-input');
  const newApiKeys = [];
  keyInputs.forEach(input => {
    const key = input.value.trim();
    if (key) newApiKeys.push(key);
  });
  appState.config.apiKeys = newApiKeys;
  appState.config.model = document.getElementById('wtr-if-model').value;
  appState.config.useJson = document.getElementById('wtr-if-use-json').checked;
  appState.config.loggingEnabled = document.getElementById('wtr-if-logging-enabled').checked;
  appState.config.temperature = parseFloat(document.getElementById('wtr-if-temperature').value);
  const statusEl = document.getElementById('wtr-if-status');
  statusEl.textContent = 'Saving...';
  const success = saveConfig();
  statusEl.textContent = success ? 'Configuration saved successfully!' : 'Failed to save configuration.';
  setTimeout(() => (statusEl.textContent = ''), 3000);
}

export function handleFindInconsistencies() {
  startAnalysis(false);
}

export function handleContinueAnalysis() {
  startAnalysis(true);
}

export function handleFileImportAndAnalyze(event) {
  const file = event.target.files[0];
  if (!file) return;
  const isContinuation = event.target.dataset.continuation === 'true';
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      const novelSlug = getNovelSlug();
      log(`Detected novel slug: "${novelSlug}"`);

      // --- JSON Validation ---
      if (!data || typeof data !== 'object') {
        throw new Error('File is not a valid JSON object.');
      }
      if (!data.terms || typeof data.terms !== 'object') {
        throw new Error("JSON must contain a top-level 'terms' object.");
      }
      const terms = data.terms[novelSlug];
      if (terms === undefined) {
        log(`No replacement terms found for novel slug "${novelSlug}" in the JSON file.`);
        alert(
          `No terms found for the current novel ("${novelSlug}") in this file. Analysis will proceed without replacements.`
        );
      } else if (!Array.isArray(terms)) {
        throw new Error(`The entry for "${novelSlug}" must be an array of term objects.`);
      } else if (terms.length > 0 && (!terms[0].hasOwnProperty('original') || !terms[0].hasOwnProperty('replacement'))) {
        throw new Error(`Term objects for "${novelSlug}" must contain 'original' and 'replacement' properties.`);
      }
      // --- End Validation ---

      const chapterData = crawlChapterData();
      const processedData = applyTermReplacements(chapterData, terms || []);
      const deepAnalysisDepth = Math.max(1, parseInt(appState.config.deepAnalysisDepth) || 1);
      findInconsistenciesDeepAnalysis(
        processedData,
        isContinuation ? appState.runtime.cumulativeResults : [],
        deepAnalysisDepth
      );
      togglePanel(false);
    } catch (err) {
      alert('Failed to read or parse the JSON file. Error: ' + err.message);
    } finally {
      event.target.value = '';
    }
  };
  reader.readAsText(file);
}

export function handleRestoreSession() {
  if (appState.session.hasSavedResults) {
    displayResults(appState.runtime.cumulativeResults);
      
    // Hide session restore element if it exists (removed UI section)
    const sessionRestoreEl = document.getElementById('wtr-if-session-restore');
    if (sessionRestoreEl) {
      sessionRestoreEl.style.display = 'none';
    }

    // Enable continue button after restoring results
    const continueBtn = document.getElementById('wtr-if-continue-btn');
    if (continueBtn) {
      continueBtn.disabled = false;
    }

    const statusEl = document.getElementById('wtr-if-status');
    if (statusEl) {
      statusEl.textContent = `Restored ${appState.runtime.cumulativeResults.length} results from previous session`;
      setTimeout(() => (statusEl.textContent = ''), 3000);
    }
  }
}

export function handleClearSession() {
  clearSessionResults();
    
  // Hide session restore element if it exists (removed UI section)
  const sessionRestoreEl = document.getElementById('wtr-if-session-restore');
  if (sessionRestoreEl) {
    sessionRestoreEl.style.display = 'none';
  }

  // Disable continue button when clearing results
  const continueBtn = document.getElementById('wtr-if-continue-btn');
  if (continueBtn) {
    continueBtn.disabled = true;
  }

  const statusEl = document.getElementById('wtr-if-status');
  if (statusEl) {
    statusEl.textContent = 'Saved session results cleared';
    setTimeout(() => (statusEl.textContent = ''), 3000);
  }
}

export function handleStatusClick() {
  const indicator = document.getElementById('wtr-if-status-indicator');
  if (indicator.classList.contains('complete') || indicator.classList.contains('error')) {
    togglePanel(true);
    document.querySelector('.wtr-if-tab-btn[data-tab="finder"]').click();
    displayResults(appState.runtime.cumulativeResults);
    updateStatusIndicator('hidden');
  }
}

export function handleApplyClick(event) {
  const button = event.currentTarget;
  const action = button.dataset.action;
  const replacement = button.dataset.suggestion || '';
  let variationsToApply = [];

  // Enhanced logging for debugging the empty suggestion issue
  if (appState.config.loggingEnabled) {
    log('Button click analysis:', {
      action: action,
      replacementValue: replacement,
      replacementLength: replacement ? replacement.length : 'empty',
      buttonDataset: button.dataset
    });
  }

  if (action === 'apply-all') {
    variationsToApply = JSON.parse(button.dataset.variations);
  } else if (action === 'apply-selected') {
    const groupEl = button.closest('.wtr-if-result-group');
    const checkedBoxes = groupEl.querySelectorAll('.wtr-if-variation-checkbox:checked');
    checkedBoxes.forEach(box => variationsToApply.push(box.value));
  }

  const uniqueVariations = [...new Set(variationsToApply)];

  if (uniqueVariations.length === 0) {
    const originalText = button.textContent;
    button.textContent = 'None Selected!';
    setTimeout(() => {
      button.textContent = originalText;
    }, 2000);
    return;
  }

  let originalTerm;
  let isRegex;

  if (uniqueVariations.length > 1) {
    uniqueVariations.sort((a, b) => b.length - a.length);
    originalTerm = uniqueVariations.map(v => escapeRegExp(v)).join('|');
    isRegex = true;
    log(`Applying suggestion "${replacement}" via multi-term regex: /${originalTerm}/gi`);
  } else {
    originalTerm = uniqueVariations[0];
    isRegex = false;
    log(`Applying suggestion "${replacement}" via simple replacement for: "${originalTerm}"`);
  }

  // Enhanced validation to prevent empty suggestions
  const finalReplacement = replacement && replacement.trim() !== '' ? replacement.trim() : null;
  if (!finalReplacement) {
    log(`ERROR: Empty or invalid replacement value detected. Aborting term addition.`, {
      originalReplacement: replacement,
      variations: uniqueVariations
    });

    const originalText = button.textContent;
    button.textContent = 'Invalid Suggestion!';
    button.style.backgroundColor = '#dc3545';
    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
    }, 3000);
    return;
  }

  const customEvent = new CustomEvent('wtr:addTerm', {
    detail: {
      original: originalTerm,
      replacement: finalReplacement,
      isRegex: isRegex
    }
  });
  window.dispatchEvent(customEvent);

  const originalText = button.textContent;
  button.classList.add('sent');
  button.textContent = 'Applied!';
  setTimeout(() => {
    button.classList.remove('sent');
    button.textContent = originalText;
  }, 2000);
}

export function handleCopyVariationClick(event) {
  const button = event.currentTarget;
  const textToCopy = button.dataset.text;
  if (!textToCopy) return;

  navigator.clipboard
    .writeText(textToCopy)
    .then(() => {
      const originalContent = button.innerHTML;
      button.innerHTML = '✅';
      button.disabled = true;
      setTimeout(() => {
        button.innerHTML = originalContent;
        button.disabled = false;
      }, 1500);
    })
    .catch(err => {
      console.error('Inconsistency Finder: Failed to copy text:', err);
      const originalContent = button.innerHTML;
      button.innerHTML = '❌';
      setTimeout(() => {
        button.innerHTML = originalContent;
      }, 1500);
    });
}

function exportConfiguration() {
  const configData = {
    version: '5.2',
    timestamp: new Date().toISOString(),
    config: appState.config,
    preferences: {
      autoRestoreResults: appState.preferences.autoRestoreResults
    }
  };

  const blob = new Blob([JSON.stringify(configData, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `WTR Lab Term Inconsistency Finder-5.2-config-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const statusEl = document.getElementById('wtr-if-status');
  statusEl.textContent = 'Configuration exported successfully';
  setTimeout(() => (statusEl.textContent = ''), 3000);
}

function importConfiguration() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.config || !data.version) {
          throw new Error('Invalid configuration file format');
        }

        // Backup current config
        const backup = {...appState.config};

        // Import new config
        appState.config = {...appState.config, ...data.config};
        if (data.preferences) {
          appState.preferences = {...appState.preferences, ...data.preferences};
        }

        saveConfig();

        // Refresh UI
        renderApiKeysUI();
        populateModelSelector();

        // Update form fields
        document.getElementById('wtr-if-use-json').checked = appState.config.useJson;
        document.getElementById('wtr-if-logging-enabled').checked = appState.config.loggingEnabled;
        document.getElementById('wtr-if-auto-restore').checked = appState.preferences.autoRestoreResults;
        document.getElementById('wtr-if-temperature').value = appState.config.temperature;
        document.getElementById('wtr-if-temp-value').textContent = appState.config.temperature;

        const statusEl = document.getElementById('wtr-if-status');
        statusEl.textContent = 'Configuration imported successfully';
        setTimeout(() => (statusEl.textContent = ''), 3000);
      } catch (err) {
        alert('Failed to import configuration: ' + err.message);
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

export function addEventListeners() {
  const panel = document.getElementById('wtr-if-panel');
  if (!panel) return;
  
  panel.querySelector('.wtr-if-close-btn').addEventListener('click', () => togglePanel(false));
  panel.querySelector('#wtr-if-save-config-btn').addEventListener('click', handleSaveConfig);
  panel.querySelector('#wtr-if-find-btn').addEventListener('click', handleFindInconsistencies);
  panel.querySelector('#wtr-if-continue-btn').addEventListener('click', handleContinueAnalysis);
  panel.querySelector('#wtr-if-refresh-models-btn').addEventListener('click', fetchAndCacheModels);
  panel.querySelector('#wtr-if-file-input').addEventListener('change', handleFileImportAndAnalyze);
  panel.querySelector('#wtr-if-export-config-btn').addEventListener('click', exportConfiguration);
  panel.querySelector('#wtr-if-import-config-btn').addEventListener('click', importConfiguration);
  panel.querySelector('#wtr-if-restore-btn')?.addEventListener('click', handleRestoreSession);
  panel.querySelector('#wtr-if-clear-session-btn')?.addEventListener('click', handleClearSession);

  const filterSelect = panel.querySelector('#wtr-if-filter-select');
  filterSelect.addEventListener('change', () => {
    displayResults(appState.runtime.cumulativeResults);
    appState.config.activeFilter = filterSelect.value;
    saveConfig();
  });

  document.getElementById('wtr-if-status-indicator').addEventListener('click', handleStatusClick);
  panel.querySelector('#wtr-if-temperature').addEventListener('input', e => {
    document.getElementById('wtr-if-temp-value').textContent = e.target.value;
  });

  panel.querySelector('#wtr-if-auto-restore').addEventListener('change', e => {
    appState.preferences.autoRestoreResults = e.target.checked;
    saveConfig();
  });

  panel.querySelector('#wtr-if-deep-analysis-depth').addEventListener('change', e => {
    appState.config.deepAnalysisDepth = parseInt(e.target.value) || 1;
    saveConfig();
  });

  panel.querySelectorAll('.wtr-if-tab-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      const targetTab = e.target.dataset.tab;
      panel.querySelectorAll('.wtr-if-tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      panel.querySelectorAll('.wtr-if-tab-content').forEach(c => c.classList.remove('active'));
      panel.querySelector(`#wtr-if-tab-${targetTab}`).classList.add('active');
      appState.config.activeTab = targetTab;
      saveConfig();
    });
  });

  panel.querySelector('#wtr-if-add-key-btn').addEventListener('click', addApiKeyRow);
  panel.querySelector('#wtr-if-api-keys-container').addEventListener('click', e => {
    if (e.target.classList.contains('wtr-if-remove-key-btn')) {
      if (panel.querySelectorAll('.wtr-if-key-row').length > 1) {
        e.target.closest('.wtr-if-key-row').remove();
      } else {
        e.target.closest('.wtr-if-key-row').querySelector('input').value = '';
      }
    }
  });
}