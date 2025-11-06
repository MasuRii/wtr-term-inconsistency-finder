// src/modules/ui/panel.js
import { VERSION } from "../../version";
import { appState, MODELS_CACHE_KEY } from "../state";
import { getAvailableApiKey } from "../geminiApi";
import { escapeHtml, log } from "../utils";
import { addEventListeners, handleRestoreSession } from "./events";

export function createUI() {
  if (document.getElementById('wtr-if-panel')) return;

  const panel = document.createElement('div');
  panel.id = 'wtr-if-panel';
  panel.innerHTML = `
            <div class="wtr-if-header"><h2>Term Inconsistency Finder ${VERSION}</h2><button class="wtr-if-close-btn">&times;</button></div>
            <div class="wtr-if-tabs">
                <button class="wtr-if-tab-btn" data-tab="finder">Finder</button>
                <button class="wtr-if-tab-btn" data-tab="config">Configuration</button>
            </div>
            <div class="wtr-if-content">
                <input type="file" id="wtr-if-file-input" accept=".json" style="display: none;">
                <div id="wtr-if-tab-finder" class="wtr-if-tab-content">
                    <!-- Primary Analysis Controls Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3><i class="wtr-if-icon">🔍</i> Primary Analysis Controls</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-finder-controls">
                                <button id="wtr-if-find-btn" class="wtr-if-btn wtr-if-btn-primary wtr-if-btn-large">Find Inconsistencies</button>
                                <button id="wtr-if-continue-btn" class="wtr-if-btn wtr-if-btn-secondary wtr-if-btn-large" disabled>Continue Analysis</button>
                            </div>
                        </div>
                    </div>

                    <!-- Deep Analysis Configuration Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3><i class="wtr-if-icon">⚙️</i> Deep Analysis Configuration</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-deep-analysis-controls">
                                <div class="wtr-if-form-row">
                                    <label for="wtr-if-deep-analysis-depth" class="wtr-if-form-label">Analysis Depth:</label>
                                    <select id="wtr-if-deep-analysis-depth" class="wtr-if-form-select">
                                        <option value="1">1 (Single Analysis)</option>
                                        <option value="2">2 (Deep Analysis)</option>
                                        <option value="3">3 (Very Deep Analysis)</option>
                                        <option value="4">4 (Maximum Analysis)</option>
                                        <option value="5">5 (Ultra Deep Analysis)</option>
                                    </select>
                                </div>
                                <small class="wtr-if-hint">Run multiple analysis iterations for more comprehensive results. Higher values provide better accuracy but take longer.</small>
                            </div>
                        </div>
                    </div>

                    <!-- Filter and Display Controls Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3><i class="wtr-if-icon">🎛️</i> Filter and Display Controls</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-filter-controls">
                                <div class="wtr-if-form-row">
                                    <label for="wtr-if-filter-select" class="wtr-if-form-label">Filter Results:</label>
                                    <select id="wtr-if-filter-select" class="wtr-if-form-select">
                                        <option value="all">Show All</option>
                                        <option value="new">Show New Only</option>
                                        <option value="verified">Show Verified Only</option>
                                        <option value="CRITICAL">Priority: Critical</option>
                                        <option value="HIGH">Priority: High</option>
                                        <option value="MEDIUM">Priority: Medium</option>
                                        <option value="LOW">Priority: Low</option>
                                        <option value="STYLISTIC">Priority: Stylistic</option>
                                        <option value="INFO">Priority: Info</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Results Display Area Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3><i class="wtr-if-icon">📋</i> Results Display Area</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div id="wtr-if-results"></div>
                        </div>
                    </div>
                </div>
                <div id="wtr-if-tab-config" class="wtr-if-tab-content">
                    <!-- API Keys Management Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3><i class="wtr-if-icon">🔑</i> API Keys Management</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group">
                                <label>Gemini API Keys</label>
                                <div class="wtr-if-api-keys-container-wrapper">
                                    <div id="wtr-if-api-keys-container"></div>
                                </div>
                                <button id="wtr-if-add-key-btn" class="wtr-if-btn wtr-if-btn-secondary" style="margin-top: 8px; width: auto; padding: 5px 10px; font-size: 12px;">+ Add Key</button>
                            </div>
                        </div>
                    </div>

                    <!-- Model Configuration Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3><i class="wtr-if-icon">🤖</i> Model Configuration</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-model">Gemini Model</label>
                                <div class="wtr-if-model-controls">
                                    <select id="wtr-if-model"></select>
                                    <button id="wtr-if-refresh-models-btn" class="wtr-if-btn wtr-if-btn-secondary">Refresh List</button>
                                </div>
                            </div>
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-temperature">AI Temperature (<span id="wtr-if-temp-value">0.5</span>)</label>
                                <input type="range" id="wtr-if-temperature" min="0" max="1" step="0.1" value="0.5">
                                <small class="wtr-if-hint">Lower is more predictable, higher is more creative.</small>
                            </div>
                        </div>
                    </div>

                    <!-- Advanced Settings Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3><i class="wtr-if-icon">⚙️</i> Advanced Settings</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group">
                                <label class="checkbox-label"><input type="checkbox" id="wtr-if-use-json"> Use Term Replacer JSON File</label>
                            </div>
                            <div class="wtr-if-form-group">
                                <label class="checkbox-label"><input type="checkbox" id="wtr-if-logging-enabled"> Enable Debug Logging</label>
                                <small class="wtr-if-hint">Outputs detailed script operations to the browser console.</small>
                            </div>
                        </div>
                    </div>

                    <!-- Data Management Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3><i class="wtr-if-icon">💾</i> Data Management</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group">
                                <label class="checkbox-label"><input type="checkbox" id="wtr-if-auto-restore"> Auto-restore saved results on panel open</label>
                                <small class="wtr-if-hint">Automatically offer to restore previous analysis results when opening the panel.</small>
                            </div>
                            <div class="wtr-if-import-export">
                                <div class="wtr-if-form-row">
                                    <button id="wtr-if-export-config-btn" class="wtr-if-btn wtr-if-btn-secondary">Export Configuration</button>
                                    <button id="wtr-if-import-config-btn" class="wtr-if-btn wtr-if-btn-secondary">Import Configuration</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-content">
                            <button id="wtr-if-save-config-btn" class="wtr-if-btn wtr-if-btn-primary">Save Configuration</button>
                            <div id="wtr-if-status" class="wtr-if-status"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  document.body.appendChild(panel);
  const statusIndicator = document.createElement('div');
  statusIndicator.id = 'wtr-if-status-indicator';
  statusIndicator.innerHTML = `<div class="wtr-if-status-icon"></div><span class="wtr-if-status-text"></span>`;
  document.body.appendChild(statusIndicator);
  
  // Call addEventListeners instead of defining them inline
  addEventListeners();
}

export async function populateModelSelector() {
  const selectEl = document.getElementById('wtr-if-model');
  selectEl.innerHTML = '<option>Loading from cache...</option>';
  selectEl.disabled = true;
  const cachedData = await GM_getValue(MODELS_CACHE_KEY, null);
  if (cachedData && cachedData.models && cachedData.models.length > 0) {
    selectEl.innerHTML = cachedData.models.map(m => `<option value="${m}">${m.replace('models/', '')}</option>`).join('');
    selectEl.value = appState.config.model;
  } else {
    selectEl.innerHTML = '<option value="">No models cached. Please refresh.</option>';
  }
  selectEl.disabled = false;
}

export async function fetchAndCacheModels() {
  const apiKeyInfo = getAvailableApiKey();
  const statusEl = document.getElementById('wtr-if-status');
  if (!apiKeyInfo) {
    statusEl.textContent = 'Error: No available API keys. Add one or wait for cooldowns.';
    setTimeout(() => (statusEl.textContent = ''), 4000);
    return;
  }
  const apiKey = apiKeyInfo.key;
  statusEl.textContent = 'Fetching model list...';
  document.getElementById('wtr-if-refresh-models-btn').disabled = true;
  GM_xmlhttpRequest({
    method: 'GET',
    url: `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
    onload: async function (response) {
      try {
        const data = JSON.parse(response.responseText);
        if (data.error) throw new Error(data.error.message);
        const filteredModels = data.models
          .filter(m => m.supportedGenerationMethods.includes('generateContent'))
          .map(m => m.name);
        if (filteredModels.length > 0) {
          await GM_setValue(MODELS_CACHE_KEY, {timestamp: Date.now(), models: filteredModels});
          statusEl.textContent = `Success! Found ${filteredModels.length} models.`;
          await populateModelSelector();
        } else {
          statusEl.textContent = 'No compatible models found.';
        }
      } catch (e) {
        statusEl.textContent = `Error: ${e.message}`;
      } finally {
        setTimeout(() => (statusEl.textContent = ''), 4000);
        document.getElementById('wtr-if-refresh-models-btn').disabled = false;
      }
    },
    onerror: function (error) {
      console.error('Model fetch error:', error);
      statusEl.textContent = 'Network error while fetching models.';
      setTimeout(() => (statusEl.textContent = ''), 4000);
      document.getElementById('wtr-if-refresh-models-btn').disabled = false;
    }
  });
}

export function renderApiKeysUI() {
  const container = document.getElementById('wtr-if-api-keys-container');
  container.innerHTML = ''; // Clear existing
  const keys = appState.config.apiKeys.length > 0 ? appState.config.apiKeys : ['']; // Show at least one empty input

  keys.forEach(key => {
    const keyRow = document.createElement('div');
    keyRow.className = 'wtr-if-key-row';
    keyRow.innerHTML = `
            <input type="password" class="wtr-if-api-key-input" value="${escapeHtml(
              key
            )}" placeholder="Enter your API key">
            <button class="wtr-if-remove-key-btn" title="Remove this key">&times;</button>
        `;
    container.appendChild(keyRow);
  });
}

export function addApiKeyRow() {
  const container = document.getElementById('wtr-if-api-keys-container');
  const keyRow = document.createElement('div');
  keyRow.className = 'wtr-if-key-row';
  keyRow.innerHTML = `
        <input type="password" class="wtr-if-api-key-input" placeholder="Enter your API key">
        <button class="wtr-if-remove-key-btn" title="Remove this key">&times;</button>
    `;
  container.appendChild(keyRow);
  keyRow.querySelector('input').focus();
}

export async function togglePanel(show = null) {
  const panel = document.getElementById('wtr-if-panel');
  const isVisible = panel.style.display === 'flex';
  const shouldShow = show !== null ? show : !isVisible;
  panel.style.display = shouldShow ? 'flex' : 'none';
  if (shouldShow) {
    // Restore UI state from config
    renderApiKeysUI();
    document.getElementById('wtr-if-use-json').checked = appState.config.useJson;
    document.getElementById('wtr-if-logging-enabled').checked = appState.config.loggingEnabled;
    document.getElementById('wtr-if-auto-restore').checked = appState.preferences.autoRestoreResults;
    const tempSlider = document.getElementById('wtr-if-temperature');
    const tempValue = document.getElementById('wtr-if-temp-value');
    tempSlider.value = appState.config.temperature;
    tempValue.textContent = appState.config.temperature;

    // Restore tab
    panel.querySelectorAll('.wtr-if-tab-btn').forEach(b => b.classList.remove('active'));
    panel.querySelectorAll('.wtr-if-tab-content').forEach(c => c.classList.remove('active'));
    const activeTabBtn = panel.querySelector(`.wtr-if-tab-btn[data-tab="${appState.config.activeTab}"]`);
    const activeTabContent = panel.querySelector(`#wtr-if-tab-${appState.config.activeTab}`);
    if (activeTabBtn) activeTabBtn.classList.add('active');
    if (activeTabContent) activeTabContent.classList.add('active');

    // Restore deep analysis depth
    document.getElementById('wtr-if-deep-analysis-depth').value = appState.config.deepAnalysisDepth.toString();

    // Restore filter
    document.getElementById('wtr-if-filter-select').value = appState.config.activeFilter;

    await populateModelSelector();

    // Check for session results and show restore option if available
    const sessionRestore = document.getElementById('wtr-if-session-restore');
    if (appState.session.hasSavedResults && appState.preferences.autoRestoreResults) {
      // Auto-restore if enabled
      handleRestoreSession();
    } else if (appState.session.hasSavedResults) {
      sessionRestore.style.display = 'block';
    } else {
      sessionRestore.style.display = 'none';
    }
  }
}

export function updateStatusIndicator(state, message = '') {
  const indicator = document.getElementById('wtr-if-status-indicator');
  if (!indicator) return;
  const iconEl = indicator.querySelector('.wtr-if-status-icon');
  const textEl = indicator.querySelector('.wtr-if-status-text');

  indicator.className = state;
  textEl.textContent = message;
  iconEl.textContent = ''; // Clear any previous icon content

  indicator.style.display = state === 'hidden' ? 'none' : 'flex';
  adjustIndicatorPosition();
}

function adjustIndicatorPosition() {
  const indicator = document.getElementById('wtr-if-status-indicator');
  if (!indicator) return;

  const otherWidget = document.querySelector('.nig-status-widget');
  if (otherWidget && getComputedStyle(otherWidget).display !== 'none') {
    log('Conflict detected with .nig-status-widget, adjusting position.');
    indicator.style.bottom = '80px';
  } else {
    indicator.style.bottom = '20px';
  }
}

export function injectControlButton() {
  const mainObserver = new MutationObserver((mutations, mainObs) => {
    const navBar = document.querySelector('nav.bottom-reader-nav');
    if (navBar) {
      log('Bottom navigation bar found. Attaching persistent observer.');
      mainObs.disconnect();

      const navObserver = new MutationObserver(() => {
        const targetContainer = navBar.querySelector('div[role="group"].btn-group');
        if (targetContainer && !document.getElementById('wtr-if-analyze-btn')) {
          log('Button container found. Injecting button.');
          const analyzeButton = document.createElement('button');
          analyzeButton.id = 'wtr-if-analyze-btn';
          analyzeButton.className = 'wtr btn btn-outline-dark btn-sm';
          analyzeButton.type = 'button';
          analyzeButton.title = 'Analyze Inconsistencies';
          analyzeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4V6a4 4 0 0 0-4-4Z"/><path d="M12 2v20"/><path d="M12 12h8"/><path d="M12 12H4"/><path d="M12 6h6"/><path d="M12 6H6"/><path d="M12 18h6"/><path d="M12 18H6"/></svg>`;
          analyzeButton.addEventListener('click', () => togglePanel(true));
          targetContainer.appendChild(analyzeButton);
        }
      });

      navObserver.observe(navBar, {childList: true, subtree: true});
      // Initial check
      const initialTarget = navBar.querySelector('div[role="group"].btn-group');
      if (initialTarget && !document.getElementById('wtr-if-analyze-btn')) {
        const analyzeButton = document.createElement('button');
        analyzeButton.id = 'wtr-if-analyze-btn';
        analyzeButton.className = 'wtr btn btn-outline-dark btn-sm';
        analyzeButton.type = 'button';
        analyzeButton.title = 'Analyze Inconsistencies';
        analyzeButton.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4V6a4 4 0 0 0-4-4Z"/><path d="M12 2v20"/><path d="M12 12h8"/><path d="M12 12H4"/><path d="M12 6h6"/><path d="M12 6H6"/><path d="M12 18h6"/><path d="M12 18H6"/></svg>`;
        analyzeButton.addEventListener('click', () => togglePanel(true));
        initialTarget.appendChild(analyzeButton);
      }
    }
  });
  mainObserver.observe(document.body, {childList: true, subtree: true});
}

export function setupConflictObserver() {
  const observer = new MutationObserver(() => {
    adjustIndicatorPosition();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  log('Conflict observer initialized.');
}