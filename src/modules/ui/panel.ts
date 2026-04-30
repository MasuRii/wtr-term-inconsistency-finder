// src/modules/ui/panel.ts
import { appState, MODELS_CACHE_KEY, getModelsCacheBucket } from "../state"
import { getAvailableApiKey } from "../geminiApi"
import {
	AI_PROVIDERS,
	PROVIDER_DEFAULTS,
	buildModelCatalogMetadata,
	buildModelsRequests,
	getProviderDefaultTemperature,
	parseModelCatalogEntries,
	parseModelsResponse,
	type ModelCatalogEntry,
	type ModelCatalogMetadata,
} from "../providerConfig"
import { escapeHtml, log, isWTRLabTermReplacerLoaded, getDebugLogCount } from "../utils"
import { gmGetValue, gmSetValue, gmXmlhttpRequest } from "../userscriptApi"
import { VERSION_INFO } from "../../version"
import { addEventListeners, handleRestoreSession } from "./events"

let areApiKeysVisible = false

const getApiKeyInputType = (): string => (areApiKeysVisible ? "text" : "password")

function updateApiKeyVisibilityButton(): void {
	const toggleButton = document.getElementById("wtr-if-toggle-keys-btn")
	if (!toggleButton) {
		return
	}

	toggleButton.textContent = areApiKeysVisible ? "Hide Keys" : "Show Keys"
	toggleButton.setAttribute("aria-pressed", String(areApiKeysVisible))
	toggleButton.setAttribute("title", areApiKeysVisible ? "Hide API keys from view" : "Display API keys in plain text")
}

export function createUI() {
	if (document.getElementById("wtr-if-panel")) {
		return
	}

	const panel = document.createElement("div")
	panel.id = "wtr-if-panel"
	panel.innerHTML = `
            <div class="wtr-if-header">
                <div class="wtr-if-title-group">
                    <h2>Term Inconsistency Finder</h2>
                    <span class="wtr-if-version-badge" title="Build ${escapeHtml(VERSION_INFO.BUILD_DATE)} (${escapeHtml(VERSION_INFO.BUILD_ENV)})">
                        ${escapeHtml(VERSION_INFO.DISPLAY)}
                    </span>
                </div>
                <button class="wtr-if-close-btn" aria-label="Close Term Inconsistency Finder">&times;</button>
            </div>
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
                            <h3>Primary Analysis Controls</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-finder-controls">
                                <button id="wtr-if-find-btn" class="wtr-if-btn wtr-if-btn-primary wtr-if-btn-large">Find Inconsistencies</button>
                                <button id="wtr-if-continue-btn" class="wtr-if-btn wtr-if-btn-secondary wtr-if-btn-large" disabled>Continue Analysis</button>
                            </div>
                        </div>
                    </div>

                    <!-- Chapter Source Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Chapter Source</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-chapter-source">Analysis Source</label>
                                <select id="wtr-if-chapter-source">
                                    <option value="page">Loaded page chapters</option>
                                    <option value="wtr-api">WTR Lab reader API</option>
                                </select>
                                <small class="wtr-if-hint">Reader API mode fetches chapters directly from WTR Lab and resolves official glossary placeholders before AI analysis.</small>
                            </div>
                            <div id="wtr-if-wtr-api-range-controls" class="wtr-if-api-range-controls">
                                <div class="wtr-if-form-group">
                                    <label for="wtr-if-wtr-api-range-mode">API Chapter Range</label>
                                    <select id="wtr-if-wtr-api-range-mode">
                                        <option value="nearby">Current chapter with nearby chapters</option>
                                        <option value="custom">Custom chapter range</option>
                                    </select>
                                </div>
                                <div class="wtr-if-range-grid" data-range-mode="nearby">
                                    <div class="wtr-if-form-group">
                                        <label for="wtr-if-wtr-api-previous">Previous chapters</label>
                                        <input type="number" id="wtr-if-wtr-api-previous" min="0" max="25" step="1" value="2">
                                    </div>
                                    <div class="wtr-if-form-group">
                                        <label for="wtr-if-wtr-api-next">Next chapters</label>
                                        <input type="number" id="wtr-if-wtr-api-next" min="0" max="25" step="1" value="2">
                                    </div>
                                </div>
                                <div class="wtr-if-range-grid" data-range-mode="custom">
                                    <div class="wtr-if-form-group">
                                        <label for="wtr-if-wtr-api-start">Start chapter</label>
                                        <input type="number" id="wtr-if-wtr-api-start" min="1" step="1" placeholder="e.g. 390">
                                    </div>
                                    <div class="wtr-if-form-group">
                                        <label for="wtr-if-wtr-api-end">End chapter</label>
                                        <input type="number" id="wtr-if-wtr-api-end" min="1" step="1" placeholder="e.g. 400">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Deep Analysis Configuration Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Deep Analysis Configuration</h3>
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
                            <h3>Filter and Display Controls</h3>
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
                            <h3>Results Display Area</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div id="wtr-if-results"></div>
                        </div>
                    </div>
                </div>
                <div id="wtr-if-tab-config" class="wtr-if-tab-content">
                    <!-- Provider & API Keys Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Provider Configuration</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-provider-type">AI Provider</label>
                                <select id="wtr-if-provider-type">
                                    <option value="openai-compatible">OpenAI-Compatible</option>
                                    <option value="gemini">Google Gemini</option>
                                </select>
                                <small id="wtr-if-provider-hint" class="wtr-if-hint"></small>
                            </div>
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-provider-base-url" id="wtr-if-provider-base-url-label">Provider Base URL</label>
                                <input type="text" id="wtr-if-provider-base-url" placeholder="https://api.openai.com/v1" autocomplete="off">
                                <small class="wtr-if-hint">Use the provider base URL only. Finder automatically derives chat and model endpoints for common OpenAI-compatible providers.</small>
                            </div>
                            <details id="wtr-if-openai-compatible-fields" class="wtr-if-advanced-details">
                                <summary>Advanced endpoint troubleshooting</summary>
                                <small class="wtr-if-hint">Only change these paths if model refresh or analysis fails because your provider uses non-standard OpenAI-compatible routes.</small>
                                <div class="wtr-if-form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="wtr-if-provider-use-manual-paths">
                                        Use manual endpoint paths
                                    </label>
                                </div>
                                <div class="wtr-if-form-group wtr-if-manual-path-field">
                                    <label for="wtr-if-provider-chat-path">Chat completions path</label>
                                    <input type="text" id="wtr-if-provider-chat-path" placeholder="/chat/completions" autocomplete="off">
                                </div>
                                <div class="wtr-if-form-group wtr-if-manual-path-field">
                                    <label for="wtr-if-provider-models-path">Models path</label>
                                    <input type="text" id="wtr-if-provider-models-path" placeholder="/models" autocomplete="off">
                                </div>
                            </details>
                            <div class="wtr-if-form-group">
                                <div class="wtr-if-api-key-header">
                                    <label id="wtr-if-api-key-label">API Keys</label>
                                    <button type="button" id="wtr-if-toggle-keys-btn" class="wtr-if-key-visibility-btn" aria-pressed="false" title="Display API keys in plain text">Show Keys</button>
                                </div>
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
                            <h3>Model Configuration</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-model" id="wtr-if-model-label">OpenAI-Compatible Model</label>
                                <div class="wtr-if-model-controls">
                                    <select id="wtr-if-model"></select>
                                    <button id="wtr-if-refresh-models-btn" class="wtr-if-btn wtr-if-btn-secondary">Refresh List</button>
                                </div>
                            </div>
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-temperature">AI Temperature (<span id="wtr-if-temp-value">0.5</span>)</label>
                                <input type="range" id="wtr-if-temperature" min="0" max="2" step="0.1" value="0.5">
                                <small id="wtr-if-temperature-hint" class="wtr-if-hint">Lower is more predictable, higher is more creative.</small>
                            </div>
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-reasoning-mode">Reasoning / Thinking</label>
                                <select id="wtr-if-reasoning-mode">
                                    <option value="off">Off</option>
                                    <option value="low">Low effort</option>
                                    <option value="medium">Medium effort</option>
                                    <option value="high">High effort</option>
                                </select>
                                <small id="wtr-if-reasoning-hint" class="wtr-if-hint">Used only for models/providers that advertise reasoning or thinking controls.</small>
                            </div>
                        </div>
                    </div>

                    <!-- Advanced Settings Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Advanced Settings</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group" id="wtr-if-use-live-term-replacer-sync-container">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="wtr-if-use-live-term-replacer-sync">
                                    Use Live Term Replacer Terms Automatically During Analysis
                                </label>
                            </div>
                            <div class="wtr-if-form-group" id="wtr-if-use-json-container">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="wtr-if-use-json">
                                    Use Imported Term Replacer JSON File (Optional Override)
                                </label>
                            </div>
                            <div class="wtr-if-form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="wtr-if-use-official-wtr-glossary">
                                    Use WTR Lab Official Glossary Context
                                </label>
                                <small class="wtr-if-hint">Fetches WTR Lab's novel glossary to suppress official alias false positives and improve AI suggestions.</small>
                            </div>
                            <div class="wtr-if-form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="wtr-if-logging-enabled">
                                    Enable Debug Logging
                                </label>
                                <small class="wtr-if-hint">Outputs detailed script operations to the browser console and keeps a redacted report buffer.</small>
                                <div id="wtr-if-debug-log-actions" class="wtr-if-debug-log-actions" style="display: none;">
                                    <div class="wtr-if-debug-log-copy">
                                        <button type="button" id="wtr-if-copy-debug-report-btn" class="wtr-if-btn wtr-if-btn-secondary">Copy Debug Report</button>
                                        <button type="button" id="wtr-if-clear-debug-logs-btn" class="wtr-if-btn wtr-if-btn-secondary">Clear Logs</button>
                                    </div>
                                    <small id="wtr-if-debug-log-hint" class="wtr-if-hint">No debug logs captured yet.</small>
                                </div>
                            </div>
                            <div class="wtr-if-form-group">
                                <div class="wtr-if-hint">
                                    If you do not want to use the original site term replacer, you may use the external userscript from:
                                    <a href="https://github.com/MasuRii/wtr-lab-term-replacer/tree/main/dist" target="_blank" rel="noopener noreferrer">
                                        WTR Lab Term Replacer (GitHub)
                                    </a>.
                                    Navigate to this URL to install the supported userscript.
                                </div>
                                <small id="wtr-if-term-replacer-mode-hint" class="wtr-if-hint"></small>
                            </div>
                        </div>
                    </div>

                    <!-- Data Management Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Data Management</h3>
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
        `
	document.body.appendChild(panel)
	const statusIndicator = document.createElement("div")
	statusIndicator.id = "wtr-if-status-indicator"
	// Base fixed positioning; dynamic system will adjust bottom and keep z-index stable
	statusIndicator.style.position = "fixed"
	statusIndicator.style.left = "20px"
	statusIndicator.style.bottom = POSITION.BASE
	statusIndicator.style.zIndex = "1025"
	statusIndicator.innerHTML = '<div class="wtr-if-status-icon"></div><span class="wtr-if-status-text"></span>'
	document.body.appendChild(statusIndicator)

	// Call addEventListeners instead of defining them inline
	addEventListeners()
}

function getCachedModelMetadata(cachedData): ModelCatalogMetadata {
	return cachedData?.metadata && typeof cachedData.metadata === "object" ? cachedData.metadata : {}
}

function formatTokenCount(value: unknown): string | null {
	const count = typeof value === "number" ? value : Number(value)
	if (!Number.isFinite(count) || count <= 0) {
		return null
	}

	return count >= 1000 ? `${Math.round(count / 1000)}k` : String(count)
}

function formatPricing(metadata: ModelCatalogEntry): string | null {
	const prompt = metadata.pricing?.prompt
	const completion = metadata.pricing?.completion
	if (prompt === undefined && completion === undefined) {
		return null
	}

	return `pricing in/out: ${prompt ?? "?"}/${completion ?? "?"}`
}

function formatModelOptionTitle(modelId: string, metadata?: ModelCatalogEntry): string {
	if (!metadata) {
		return modelId
	}

	const details = [modelId]
	if (metadata.displayName && metadata.displayName !== modelId) {
		details.push(metadata.displayName)
	}
	if (metadata.ownedBy) {
		details.push(`owned by ${metadata.ownedBy}`)
	}
	const contextLength = formatTokenCount(metadata.contextLength)
	if (contextLength) {
		details.push(`${contextLength} context`)
	}
	const maxOutput = formatTokenCount(metadata.maxCompletionTokens)
	if (maxOutput) {
		details.push(`${maxOutput} max output`)
	}
	if (metadata.capabilities?.reasoning === true) {
		details.push("reasoning")
	}
	if (metadata.capabilities?.temperature === false) {
		details.push("temperature disabled")
	}
	if (metadata.latestAliasFor) {
		details.push(`resolves to ${metadata.latestAliasFor}`)
	}
	const pricing = formatPricing(metadata)
	if (pricing) {
		details.push(pricing)
	}

	return details.join(" - ")
}

function getCachedModelsData(cacheState, providerBucket) {
	if (cacheState && Array.isArray(cacheState.models)) {
		return cacheState
	}

	if (!cacheState || typeof cacheState !== "object") {
		return null
	}

	return cacheState[providerBucket] || null
}

export function syncProviderConfigUI() {
	const providerType = document.getElementById("wtr-if-provider-type")?.value || AI_PROVIDERS.OPENAI_COMPATIBLE
	const defaults = PROVIDER_DEFAULTS[providerType] || PROVIDER_DEFAULTS[AI_PROVIDERS.OPENAI_COMPATIBLE]
	const apiKeyLabel = document.getElementById("wtr-if-api-key-label")
	const modelLabel = document.getElementById("wtr-if-model-label")
	const baseUrlLabel = document.getElementById("wtr-if-provider-base-url-label")
	const baseUrlInput = document.getElementById("wtr-if-provider-base-url")
	const providerHint = document.getElementById("wtr-if-provider-hint")
	const chatPathInput = document.getElementById("wtr-if-provider-chat-path")
	const modelsPathInput = document.getElementById("wtr-if-provider-models-path")
	const manualPathCheckbox = document.getElementById("wtr-if-provider-use-manual-paths")
	const manualPathFields = document.querySelectorAll(".wtr-if-manual-path-field")
	const openAiFields = document.getElementById("wtr-if-openai-compatible-fields")
	const isGemini = providerType === AI_PROVIDERS.GEMINI

	if (apiKeyLabel) {
		apiKeyLabel.textContent = defaults.apiKeyLabel
	}
	if (modelLabel) {
		modelLabel.textContent = defaults.modelLabel
	}
	if (baseUrlLabel) {
		baseUrlLabel.textContent = isGemini ? "Gemini Base URL" : "Provider Base URL"
	}
	if (baseUrlInput) {
		baseUrlInput.placeholder = defaults.baseUrl
	}
	if (providerHint) {
		providerHint.textContent = isGemini
			? "Uses Gemini's native generateContent endpoint and Gemini model catalog. Temperature defaults to 1.0 for Gemini."
			: "Enter only the base URL, such as https://api.openai.com/v1, http://localhost:11434/v1, or https://openrouter.ai/api/v1."
	}
	if (chatPathInput) {
		chatPathInput.placeholder = defaults.chatCompletionsPath
	}
	if (modelsPathInput) {
		modelsPathInput.placeholder = defaults.modelsPath
	}
	if (manualPathCheckbox) {
		manualPathCheckbox.checked = Boolean(appState.config.providerUseManualPaths)
	}
	manualPathFields.forEach((field) => {
		field.style.display = manualPathCheckbox?.checked ? "" : "none"
	})
	if (openAiFields) {
		openAiFields.style.display = isGemini ? "none" : "block"
		if (!isGemini) {
			openAiFields.open = Boolean(appState.config.providerUseManualPaths)
		}
	}
	updateAIControlHints()
}

export function updateChapterSourceUI() {
	const sourceEl = document.getElementById("wtr-if-chapter-source")
	const rangeControls = document.getElementById("wtr-if-wtr-api-range-controls")
	const rangeModeEl = document.getElementById("wtr-if-wtr-api-range-mode")
	const source = sourceEl?.value || appState.config.chapterSource || "page"
	const rangeMode = rangeModeEl?.value || appState.config.wtrApiRangeMode || "nearby"

	if (rangeControls) {
		rangeControls.style.display = source === "wtr-api" ? "" : "none"
	}
	document.querySelectorAll<HTMLElement>(".wtr-if-range-grid[data-range-mode]").forEach((group) => {
		group.style.display = source === "wtr-api" && group.dataset.rangeMode === rangeMode ? "grid" : "none"
	})
}

export function updateAIControlHints() {
	const providerType = document.getElementById("wtr-if-provider-type")?.value || appState.config.providerType
	const temperatureHint = document.getElementById("wtr-if-temperature-hint")
	const reasoningHint = document.getElementById("wtr-if-reasoning-hint")
	const isGemini = providerType === AI_PROVIDERS.GEMINI

	if (temperatureHint) {
		temperatureHint.textContent = isGemini
			? "Gemini usually works best near 1.0. Thinking models may ignore custom sampling settings."
			: "Lower is more predictable, higher is more creative. Reasoning models may ignore or reject custom temperature."
	}
	if (reasoningHint) {
		reasoningHint.textContent = isGemini
			? "Gemini thinking is sent only for likely thinking-capable Gemini models."
			: "Reasoning effort is sent only for known reasoning models or Ollama-compatible local models."
	}
}

export async function populateModelSelector() {
	const selectEl = document.getElementById("wtr-if-model")
	if (!selectEl) {
		return
	}
	selectEl.innerHTML = "<option>Loading from cache...</option>"
	selectEl.disabled = true
	const providerBucket = getModelsCacheBucket(appState.config)
	const cacheState = await gmGetValue(MODELS_CACHE_KEY, null)
	const cachedData = getCachedModelsData(cacheState, providerBucket)
	const cachedModels = Array.isArray(cachedData?.models) ? [...cachedData.models] : []
	const cachedMetadata = getCachedModelMetadata(cachedData)
	appState.runtime.providerModelMetadata = cachedMetadata

	if (cachedModels.length > 0 && appState.config.model && !cachedModels.includes(appState.config.model)) {
		cachedModels.unshift(appState.config.model)
	}

	if (cachedModels.length > 0) {
		selectEl.innerHTML = cachedModels
			.map((modelId) => {
				const metadata = cachedMetadata[modelId]
				const title = formatModelOptionTitle(modelId, metadata)
				return `<option value="${escapeHtml(modelId)}" title="${escapeHtml(title)}">${escapeHtml(modelId.replace(/^models\//, ""))}</option>`
			})
			.join("")
		selectEl.value = appState.config.model || cachedModels[0]
	} else {
		selectEl.innerHTML = '<option value="">No models cached. Please refresh.</option>'
	}
	selectEl.disabled = false
}

function requestModelCatalog(requestConfig): Promise<any> {
	return new Promise((resolve, reject) => {
		gmXmlhttpRequest({
			method: requestConfig.method,
			url: requestConfig.url,
			headers: requestConfig.headers,
			onload: function (response) {
				try {
					const data = JSON.parse(response.responseText)
					if (response.status >= 400) {
						throw new Error(data?.error?.message || response.statusText || `HTTP ${response.status}`)
					}
					if (data.error) {
						throw new Error(data.error.message || "Failed to fetch models")
					}
					resolve({ data, url: requestConfig.url })
				} catch (e) {
					reject(e)
				}
			},
			onerror: function (error) {
				console.error("Model fetch error:", error)
				reject(new Error("Network error while fetching models."))
			},
		})
	})
}

export async function fetchAndCacheModels() {
	const apiKeyInfo = getAvailableApiKey()
	const statusEl = document.getElementById("wtr-if-status")
	const refreshButton = document.getElementById("wtr-if-refresh-models-btn")
	if (!apiKeyInfo) {
		statusEl.textContent = "Error: No available API keys. Add one or wait for cooldowns."
		setTimeout(() => (statusEl.textContent = ""), 4000)
		return
	}
	const apiKey = apiKeyInfo.key
	const providerBucket = getModelsCacheBucket(appState.config)
	const requestConfigs = buildModelsRequests(appState.config, apiKey)
	statusEl.textContent = "Fetching model list..."
	refreshButton.disabled = true

	try {
		let lastError = null
		for (let index = 0; index < requestConfigs.length; index++) {
			const requestConfig = requestConfigs[index]
			if (index > 0) {
				statusEl.textContent = `Trying alternate model endpoint ${index + 1}/${requestConfigs.length}...`
			}
			try {
				const { data, url } = await requestModelCatalog(requestConfig)
				const modelEntries = parseModelCatalogEntries(data)
				const filteredModels = parseModelsResponse(appState.config, data)
				if (filteredModels.length === 0) {
					lastError = new Error("No compatible models found.")
					continue
				}

				const modelMetadata = buildModelCatalogMetadata(
					modelEntries.filter((entry) => filteredModels.includes(entry.id)),
				)
				const existingCache = await gmGetValue(MODELS_CACHE_KEY, null)
				const nextCacheState =
					existingCache && typeof existingCache === "object" && !Array.isArray(existingCache.models)
						? existingCache
						: {}
				nextCacheState[providerBucket] = {
					timestamp: Date.now(),
					models: filteredModels,
					metadata: modelMetadata,
				}
				appState.runtime.providerModelMetadata = modelMetadata
				await gmSetValue(MODELS_CACHE_KEY, nextCacheState)
				statusEl.textContent = `Success! Found ${filteredModels.length} models.`
				log(`Fetched model catalog from ${url}`, { metadataCount: Object.keys(modelMetadata).length })
				await populateModelSelector()
				return
			} catch (e) {
				lastError = e
			}
		}

		const advancedDetails = document.getElementById("wtr-if-openai-compatible-fields")
		if (advancedDetails && appState.config.providerType !== AI_PROVIDERS.GEMINI) {
			advancedDetails.open = true
		}
		statusEl.textContent = `Error: ${lastError?.message || "Unable to fetch models"}. See advanced endpoint troubleshooting.`
	} finally {
		setTimeout(() => (statusEl.textContent = ""), 6000)
		refreshButton.disabled = false
	}
}

export function renderApiKeysUI() {
	const container = document.getElementById("wtr-if-api-keys-container")
	if (!container) {
		return
	}
	container.innerHTML = "" // Clear existing
	const keys = appState.config.apiKeys.length > 0 ? appState.config.apiKeys : [""] // Show at least one empty input
	const inputType = getApiKeyInputType()

	keys.forEach((key) => {
		const keyRow = document.createElement("div")
		keyRow.className = "wtr-if-key-row"
		keyRow.innerHTML = `
            <input type="${inputType}" class="wtr-if-api-key-input" value="${escapeHtml(
				key,
			)}" placeholder="Enter your API key">
            <button class="wtr-if-remove-key-btn" title="Remove this key">&times;</button>
        `
		container.appendChild(keyRow)
	})
	updateApiKeyVisibilityButton()
}

export function addApiKeyRow() {
	const container = document.getElementById("wtr-if-api-keys-container")
	const keyRow = document.createElement("div")
	keyRow.className = "wtr-if-key-row"
	keyRow.innerHTML = `
        <input type="${getApiKeyInputType()}" class="wtr-if-api-key-input" placeholder="Enter your API key">
        <button class="wtr-if-remove-key-btn" title="Remove this key">&times;</button>
    `
	container.appendChild(keyRow)
	keyRow.querySelector("input").focus()
}

export function toggleApiKeyVisibility() {
	areApiKeysVisible = !areApiKeysVisible
	document.querySelectorAll<HTMLInputElement>(".wtr-if-api-key-input").forEach((input) => {
		input.type = getApiKeyInputType()
	})
	updateApiKeyVisibilityButton()
}

export function updateDebugLoggingUI() {
	const loggingCheckbox = document.getElementById("wtr-if-logging-enabled")
	const debugActions = document.getElementById("wtr-if-debug-log-actions")
	const debugHint = document.getElementById("wtr-if-debug-log-hint")
	const isEnabled = Boolean(loggingCheckbox?.checked || appState.config.loggingEnabled)

	if (debugActions) {
		debugActions.style.display = isEnabled ? "" : "none"
	}
	if (debugHint) {
		const logCount = getDebugLogCount()
		debugHint.textContent =
			logCount > 0
				? `${logCount} debug log entr${logCount === 1 ? "y" : "ies"} ready to copy. API keys are redacted from the report.`
				: "No debug logs captured yet. Reproduce the issue, then copy the report."
	}
}

export function updateTermReplacerIntegrationUI() {
	try {
		const isExternalReplacerAvailable = isWTRLabTermReplacerLoaded()
		const liveSyncContainer = document.getElementById("wtr-if-use-live-term-replacer-sync-container")
		const liveSyncCheckbox = document.getElementById("wtr-if-use-live-term-replacer-sync")
		const useJsonContainer = document.getElementById("wtr-if-use-json-container")
		const useJsonCheckbox = document.getElementById("wtr-if-use-json")
		const modeHint = document.getElementById("wtr-if-term-replacer-mode-hint")

		if (!liveSyncContainer || !liveSyncCheckbox || !useJsonContainer || !useJsonCheckbox || !modeHint) {
			return
		}

		if (isExternalReplacerAvailable) {
			liveSyncContainer.style.display = ""
			liveSyncCheckbox.disabled = false
			liveSyncCheckbox.checked = Boolean(appState.config.useLiveTermReplacerSync)
			useJsonContainer.style.display = ""
			useJsonCheckbox.disabled = false

			modeHint.textContent = appState.config.useLiveTermReplacerSync
				? "Detected WTR Lab Term Replacer userscript. Finder will automatically use its live term list during analysis. Enable JSON mode only if you want to import a backup file instead."
				: "Detected WTR Lab Term Replacer userscript, but automatic live-term sync is disabled. Finder will ignore Term Replacer terms during analysis unless you enable JSON mode or turn live sync back on."
		} else {
			liveSyncContainer.style.display = "none"
			useJsonContainer.style.display = "none"
			useJsonCheckbox.checked = false
			if (appState.config.useJson) {
				appState.config.useJson = false
			}
			modeHint.textContent =
				"External WTR Lab Term Replacer userscript not detected. Using built-in term inconsistency finder behavior only. Install the external userscript if you want tight integration."
		}
	} catch (e) {
		log("WTR Lab Term Replacer UI integration update failed; continuing in safe mode.", e)
	}
}

export async function togglePanel(show = null) {
	const panel = document.getElementById("wtr-if-panel")
	if (!panel) {
		return
	}
	const isVisible = panel.style.display === "flex"
	const shouldShow = show !== null ? show : !isVisible
	panel.style.display = shouldShow ? "flex" : "none"
	if (shouldShow) {
		// Restore UI state from config
		renderApiKeysUI()
		document.getElementById("wtr-if-provider-type").value = appState.config.providerType
		document.getElementById("wtr-if-provider-base-url").value = appState.config.providerBaseUrl
		document.getElementById("wtr-if-provider-chat-path").value = appState.config.providerChatCompletionsPath
		document.getElementById("wtr-if-provider-models-path").value = appState.config.providerModelsPath
		document.getElementById("wtr-if-provider-use-manual-paths").checked = Boolean(
			appState.config.providerUseManualPaths,
		)
		syncProviderConfigUI()
		document.getElementById("wtr-if-use-live-term-replacer-sync").checked = appState.config.useLiveTermReplacerSync
		document.getElementById("wtr-if-use-json").checked = appState.config.useJson
		document.getElementById("wtr-if-use-official-wtr-glossary").checked = appState.config.useOfficialWtrGlossary
		document.getElementById("wtr-if-chapter-source").value = appState.config.chapterSource || "page"
		document.getElementById("wtr-if-wtr-api-range-mode").value = appState.config.wtrApiRangeMode || "nearby"
		document.getElementById("wtr-if-wtr-api-previous").value = String(appState.config.wtrApiPreviousChapters ?? 2)
		document.getElementById("wtr-if-wtr-api-next").value = String(appState.config.wtrApiNextChapters ?? 2)
		document.getElementById("wtr-if-wtr-api-start").value = String(appState.config.wtrApiStartChapter || "")
		document.getElementById("wtr-if-wtr-api-end").value = String(appState.config.wtrApiEndChapter || "")
		updateChapterSourceUI()
		document.getElementById("wtr-if-logging-enabled").checked = appState.config.loggingEnabled
		updateDebugLoggingUI()
		document.getElementById("wtr-if-auto-restore").checked = appState.preferences.autoRestoreResults
		const tempSlider = document.getElementById("wtr-if-temperature")
		const tempValue = document.getElementById("wtr-if-temp-value")
		tempSlider.value = appState.config.temperature ?? getProviderDefaultTemperature(appState.config.providerType)
		tempValue.textContent = tempSlider.value
		document.getElementById("wtr-if-reasoning-mode").value = appState.config.reasoningMode || "off"

		// Restore tab
		panel.querySelectorAll(".wtr-if-tab-btn").forEach((b) => b.classList.remove("active"))
		panel.querySelectorAll(".wtr-if-tab-content").forEach((c) => c.classList.remove("active"))
		const activeTabBtn = panel.querySelector(`.wtr-if-tab-btn[data-tab="${appState.config.activeTab}"]`)
		const activeTabContent = panel.querySelector(`#wtr-if-tab-${appState.config.activeTab}`)
		if (activeTabBtn) {
			activeTabBtn.classList.add("active")
		}
		if (activeTabContent) {
			activeTabContent.classList.add("active")
		}

		// Restore deep analysis depth
		document.getElementById("wtr-if-deep-analysis-depth").value = appState.config.deepAnalysisDepth.toString()

		// Restore filter
		document.getElementById("wtr-if-filter-select").value = appState.config.activeFilter

		await populateModelSelector()

		// Apply dynamic UI based on WTR Lab Term Replacer detection
		updateTermReplacerIntegrationUI()

		// Check for session results and show restore option if available
		const sessionRestore = document.getElementById("wtr-if-session-restore")
		if (appState.session.hasSavedResults && appState.preferences.autoRestoreResults) {
			// Auto-restore if enabled:
			// - Restores results
			// - Immediately syncs Finder Apply/Copy buttons for restored DOM
			handleRestoreSession()
		} else if (sessionRestore) {
			sessionRestore.style.display = appState.session.hasSavedResults ? "block" : "none"
		}

		// Ensure Apply/Copy button modes are synchronized after panel initialization
		try {
			const { updateApplyCopyButtonsMode } = await import("./events")
			updateApplyCopyButtonsMode()
		} catch (error) {
			log("Failed to sync Apply/Copy button modes after panel initialization:", error)
		}
	}
}

export function updateStatusIndicator(state, message = "") {
	const indicator = document.getElementById("wtr-if-status-indicator")
	if (!indicator) {
		return
	}
	const iconEl = indicator.querySelector(".wtr-if-status-icon")
	const textEl = indicator.querySelector(".wtr-if-status-text")

	indicator.className = state
	textEl.textContent = message
	iconEl.textContent = "" // Clear any previous icon content

	indicator.style.display = state === "hidden" ? "none" : "flex"
	adjustIndicatorPosition()
}

/**
 * Dynamic Collision Avoidance System for WTR Status Indicator
 *
 * This system provides intelligent, real-time collision detection and avoidance
 * for the WTR Term Inconsistency Finder status widget.
 */

// Position constants
const POSITION = {
	BASE: "var(--nig-space-xl, 20px)", // Default baseline above page bottom
	NIG_CONFLICT: "80px", // Move up when conflicting widget present
	SAFE_DEFAULT: "60px", // Fallback position
}

// Collision detection state
const collisionState = {
	isMonitoringActive: false,
	lastNigWidgetState: null,
	currentPosition: null,
	lastZIndex: null,
	debounceTimer: null,
	lastAppliedBottom: null,
}

/**
 * Get the current computed bottom position of an element
 */
function _getElementBottomPosition(element) {
	if (!element) {
		return null
	}

	const computed = getComputedStyle(element)
	const bottom = computed.bottom

	// Extract numeric value from bottom position
	if (bottom && bottom !== "auto") {
		return parseFloat(bottom.replace("px", "")) || 0
	}

	return 0
}

/**
 * Check if two elements would collide vertically
 */
function isVisibleElement(el) {
	if (!el) {
		return false
	}
	const style = getComputedStyle(el)
	if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
		return false
	}
	const rect = el.getBoundingClientRect()
	return rect.width > 0 && rect.height > 0
}

/**
 * Check if two elements would collide vertically (and generally overlap)
 * Only considers collisions when both elements are visible in the viewport.
 */
function _wouldCollide(element1, element2, spacing = 10) {
	if (!element1 || !element2) {
		return false
	}

	if (!isVisibleElement(element1) || !isVisibleElement(element2)) {
		return false
	}

	const rect1 = element1.getBoundingClientRect()
	const rect2 = element2.getBoundingClientRect()

	// Basic overlap check: vertical spacing plus horizontal intersection
	const verticalOverlap = rect1.bottom + spacing > rect2.top
	const horizontalOverlap = rect1.right > rect2.left && rect1.left < rect2.right

	return verticalOverlap && horizontalOverlap
}

/**
 * Determine optimal position based on current collision state
 */
function calculateOptimalPosition(nigWidget, indicator) {
	const isNigVisible = isVisibleElement(nigWidget)
	const nigState = isNigVisible ? "present" : "absent"

	const conflictStates = {
		nig: nigState,
	}

	const newZIndex = 1025

	if (!indicator) {
		return {
			position: POSITION.BASE,
			zIndex: newZIndex,
			states: conflictStates,
		}
	}

	let hasNigConflict = false

	if (isNigVisible && nigWidget) {
		// Virtually test the indicator at BASE position against the NIG widget
		const indicatorRect = indicator.getBoundingClientRect()
		const nigRect = nigWidget.getBoundingClientRect()

		// Construct a virtual rect for the indicator as if it were at BASE (20px)
		const baseOffsetPx = 20
		const viewportHeight = window.innerHeight || document.documentElement.clientHeight
		const virtualBottom = baseOffsetPx
		const virtualTop = viewportHeight - virtualBottom - indicatorRect.height
		const virtualRect = {
			top: virtualTop,
			bottom: virtualTop + indicatorRect.height,
			left: indicatorRect.left,
			right: indicatorRect.right,
		}

		const verticalOverlap = virtualRect.bottom > nigRect.top
		const horizontalOverlap = virtualRect.right > nigRect.left && virtualRect.left < nigRect.right

		if (verticalOverlap && horizontalOverlap) {
			hasNigConflict = true
		}
	}

	const position = hasNigConflict ? POSITION.NIG_CONFLICT : POSITION.BASE

	return {
		position,
		zIndex: newZIndex,
		states: conflictStates,
	}
}

/**
 * Apply position changes with smooth transitions
 */
function applyPosition(indicator, position, zIndex) {
	if (!indicator) {
		return
	}

	const nextBottom = position
	const nextZ = zIndex || 1025

	// Avoid unnecessary writes to prevent jitter
	if (collisionState.lastAppliedBottom === nextBottom && collisionState.lastZIndex === nextZ) {
		return
	}

	collisionState.currentPosition = nextBottom
	collisionState.lastAppliedBottom = nextBottom
	collisionState.lastZIndex = nextZ

	indicator.style.bottom = nextBottom
	indicator.style.zIndex = String(nextZ)

	log(`Position updated to: ${nextBottom}, Z-index: ${nextZ}`)
}

/**
 * Main collision detection function - dynamically monitors and adjusts position
 */
function adjustIndicatorPosition() {
	const indicator = document.getElementById("wtr-if-status-indicator")
	if (!indicator) {
		return
	}

	// Ensure stable fixed positioning; never toggle between fixed/other
	const computed = getComputedStyle(indicator)
	if (computed.position !== "fixed") {
		indicator.style.position = "fixed"
		if (!indicator.style.left) {
			indicator.style.left = "20px"
		}
	}

	const nigWidget = document.querySelector(".nig-status-widget, #nig-status-widget")

	const { position, zIndex, states } = calculateOptimalPosition(nigWidget, indicator)

	applyPosition(indicator, position, zIndex)

	collisionState.lastNigWidgetState = states.nig
}

export function injectControlButton() {
	const mainObserver = new MutationObserver((mutations, mainObs) => {
		const navBar = document.querySelector("nav.bottom-reader-nav")
		if (navBar) {
			log("Bottom navigation bar found. Attaching persistent observer.")
			mainObs.disconnect()

			const navObserver = new MutationObserver(() => {
				const targetContainer = navBar.querySelector('div[role="group"].btn-group')
				if (targetContainer && !document.getElementById("wtr-if-analyze-btn")) {
					log("Button container found. Injecting button.")
					const analyzeButton = document.createElement("button")
					analyzeButton.id = "wtr-if-analyze-btn"
					analyzeButton.className = "wtr btn btn-outline-dark btn-sm"
					analyzeButton.type = "button"
					analyzeButton.title = "Analyze Inconsistencies"
					analyzeButton.innerHTML =
						'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4V6a4 4 0 0 0-4-4Z"/><path d="M12 2v20"/><path d="M12 12h8"/><path d="M12 12H4"/><path d="M12 6h6"/><path d="M12 6H6"/><path d="M12 18h6"/><path d="M12 18H6"/></svg>'
					analyzeButton.addEventListener("click", () => togglePanel(true))
					targetContainer.appendChild(analyzeButton)
				}
			})

			navObserver.observe(navBar, {
				childList: true,
				subtree: true,
			})
			// Initial check
			const initialTarget = navBar.querySelector('div[role="group"].btn-group')
			if (initialTarget && !document.getElementById("wtr-if-analyze-btn")) {
				const analyzeButton = document.createElement("button")
				analyzeButton.id = "wtr-if-analyze-btn"
				analyzeButton.className = "wtr btn btn-outline-dark btn-sm"
				analyzeButton.type = "button"
				analyzeButton.title = "Analyze Inconsistencies"
				analyzeButton.innerHTML =
					'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4V6a4 4 0 0 0-4-4Z"/><path d="M12 2v20"/><path d="M12 12h8"/><path d="M12 12H4"/><path d="M12 6h6"/><path d="M12 6H6"/><path d="M12 18h6"/><path d="M12 18H6"/></svg>'
				analyzeButton.addEventListener("click", () => togglePanel(true))
				initialTarget.appendChild(analyzeButton)
			}
		}
	})
	mainObserver.observe(document.body, {
		childList: true,
		subtree: true,
	})
}

/**
 * Initialize the dynamic collision avoidance system
 */
export function initializeCollisionAvoidance() {
	// Start monitoring
	collisionState.isMonitoringActive = true

	// Initial position check
	adjustIndicatorPosition()

	// Set up comprehensive observers for dynamic collision detection
	setupConflictObserver()
	setupScrollListener()
	setupResizeListener()

	log("Dynamic collision avoidance system initialized.")
}

/**
 * Enhanced conflict observer with debounced updates and comprehensive monitoring
 */
export function setupConflictObserver() {
	// Debounced observer to prevent excessive updates and oscillation
	const debouncedAdjustPosition = debounce(() => {
		if (collisionState.isMonitoringActive) {
			adjustIndicatorPosition()
		}
	}, 150)

	const observer = new MutationObserver((mutations) => {
		const relevantMutations = mutations.some((mutation) => {
			if (mutation.type === "childList") {
				return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0
			}
			if (mutation.type === "attributes") {
				return ["style", "class", "display"].includes(mutation.attributeName)
			}
			return false
		})

		if (relevantMutations) {
			debouncedAdjustPosition()
		}
	})

	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ["style", "class", "id", "display"],
	})

	// Observe key conflict-prone elements directly when present
	const nigWidget = document.querySelector(".nig-status-widget, #nig-status-widget")
	if (nigWidget) {
		observer.observe(nigWidget, {
			attributes: true,
			attributeFilter: ["style", "class", "display"],
		})
	}

	const bottomNav =
		document.querySelector("nav.bottom-reader-nav") ||
		document.querySelector(".bottom-reader-nav") ||
		document.querySelector(".fixed-bottom")
	if (bottomNav) {
		observer.observe(bottomNav, {
			attributes: true,
			childList: true,
			subtree: true,
		})
	}

	log("Enhanced conflict observer initialized (NIG widget, bottom reader nav, and related widgets).")
}

/**
 * Monitor scroll events to detect position changes
 */
function setupScrollListener() {
	let scrollTimeout
	const handleScroll = () => {
		if (!collisionState.isMonitoringActive) {
			return
		}

		clearTimeout(scrollTimeout)
		scrollTimeout = setTimeout(() => {
			adjustIndicatorPosition()
		}, 150) // Debounce scroll events
	}

	window.addEventListener("scroll", handleScroll, { passive: true })
	log("Scroll listener initialized for collision detection.")
}

/**
 * Monitor window resize events
 */
function setupResizeListener() {
	let resizeTimeout
	const handleResize = () => {
		if (!collisionState.isMonitoringActive) {
			return
		}

		clearTimeout(resizeTimeout)
		resizeTimeout = setTimeout(() => {
			adjustIndicatorPosition()
		}, 250) // Debounce resize events
	}

	window.addEventListener("resize", handleResize)
	log("Resize listener initialized for collision detection.")
}

/**
 * Debounce utility function
 */
function debounce(func, wait) {
	let timeout
	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout)
			func(...args)
		}
		clearTimeout(timeout)
		timeout = setTimeout(later, wait)
	}
}

/**
 * Enable/disable collision monitoring
 */
export function setCollisionMonitoring(enabled) {
	collisionState.isMonitoringActive = enabled
	log(`Collision monitoring ${enabled ? "enabled" : "disabled"}.`)

	if (enabled) {
		adjustIndicatorPosition() // Immediate update when re-enabling
	}
}

/**
 * Get current collision avoidance status for debugging
 */
export function getCollisionAvoidanceStatus() {
	const indicator = document.getElementById("wtr-if-status-indicator")
	const nigWidget = document.querySelector(".nig-status-widget, #nig-status-widget")

	return {
		isMonitoring: collisionState.isMonitoringActive,
		currentPosition: collisionState.currentPosition,
		lastNigState: collisionState.lastNigWidgetState,
		indicatorRect: indicator ? indicator.getBoundingClientRect() : null,
		nigWidgetVisible: nigWidget ? getComputedStyle(nigWidget).display !== "none" : false,
	}
}
