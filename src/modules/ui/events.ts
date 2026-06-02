// src/modules/ui/events.ts
import { appState, saveConfig, clearSessionResults } from "../state"
import { AI_PROVIDERS, PROVIDER_DEFAULTS, resolveProviderSettings } from "../providerConfig"
import {
	crawlChapterData,
	applyTermReplacements,
	getNovelSlug,
	log,
	escapeRegExp,
	isWTRLabTermReplacerLoaded,
	requestTermsFromWTRLabTermReplacer,
	getDebugLogReport,
	clearDebugLogs,
} from "../utils"
import {
	fetchWebsiteTermConfig,
	normalizeWebsiteTerms,
	saveWebsiteTerm,
} from "../websiteTermApi"
import { findInconsistenciesDeepAnalysis } from "../geminiApi"
import {
	fetchAndCacheModels,
	togglePanel,
	addApiKeyRow,
	renderApiKeysUI,
	populateModelSelector,
	syncProviderConfigUI,
	updateStatusIndicator,
	updateTermReplacerIntegrationUI,
	updateChapterSourceUI,
	toggleApiKeyVisibility,
	updateDebugLoggingUI,
} from "./panel"
import { displayResults } from "./display"
import {
	buildWtrApiChapterRange,
	fetchOfficialWtrGlossaryContext,
	fetchWtrChapter,
	getWtrPageContext,
} from "../wtrLabApi"

function normalizeTermLookupKey(value: unknown): string {
	if (typeof value !== "string") {
		return ""
	}
	return value
		.trim()
		.toLowerCase()
		.replace(/[“”]/g, '"')
		.replace(/[‘’]/g, "'")
		.replace(/^[\s'"`]+|[\s'"`]+$/g, "")
		.replace(/\s+/g, " ")
}

function containsCjk(value: string): boolean {
	return /[\u3400-\u9fff]/.test(value)
}

function getSourceLookupIndex(): Map<string, string> {
	if (!(appState.runtime.websiteTermSourceIndex instanceof Map)) {
		appState.runtime.websiteTermSourceIndex = new Map()
	}
	return appState.runtime.websiteTermSourceIndex
}

function addSourceLookup(phrase: unknown, source: unknown) {
	const phraseKey = normalizeTermLookupKey(phrase)
	const sourceValue = typeof source === "string" ? source.trim() : ""
	if (phraseKey && sourceValue) {
		getSourceLookupIndex().set(phraseKey, sourceValue)
	}
}

function rememberChapterGlossarySources(chapterData) {
	for (const chapter of Array.isArray(chapterData) ? chapterData : []) {
		if (!Array.isArray(chapter?.glossaryTerms)) {
			continue
		}
		for (const term of chapter.glossaryTerms) {
			addSourceLookup(term?.term, term?.source)
			addSourceLookup(term?.source, term?.source)
		}
	}
}

function addResolvedSource(sources: Map<string, string>, source: unknown) {
	const sourceValue = typeof source === "string" ? source.trim() : ""
	const sourceKey = normalizeTermLookupKey(sourceValue)
	if (sourceKey && sourceValue) {
		sources.set(sourceKey, sourceValue)
	}
}

function groupCandidateMatchesVariations(group: any, variationKeys: Set<string>): boolean {
	if (!group || typeof group !== "object") {
		return false
	}
	const candidates: string[] = []
	if (typeof group.canonical === "string") {
		candidates.push(group.canonical)
	}
	if (Array.isArray(group.aliases)) {
		for (const alias of group.aliases) {
			if (typeof alias === "string") {
				candidates.push(alias)
			}
		}
	}
	return candidates.some((candidate) => variationKeys.has(normalizeTermLookupKey(candidate)))
}

function addSourcesFromGroups(groups: any[], variationKeys: Set<string>, sources: Map<string, string>) {
	for (const group of Array.isArray(groups) ? groups : []) {
		if (groupCandidateMatchesVariations(group, variationKeys)) {
			addResolvedSource(sources, group.source)
		}
	}
}

function addSourcesFromCorrections(corrections: any[], variationKeys: Set<string>, sources: Map<string, string>) {
	for (const correction of Array.isArray(corrections) ? corrections : []) {
		if (variationKeys.has(normalizeTermLookupKey(correction?.corrected))) {
			addResolvedSource(sources, correction?.source)
		}
	}
}

function getWebsiteTermGlossaryContext() {
	return appState.runtime.officialGlossaryContext || appState.runtime.websiteTermGlossaryContext || null
}

function termsNeedWebsiteGlossaryMapping(terms): boolean {
	return (Array.isArray(terms) ? terms : []).some((term) => {
		return (
			(typeof term?.sourceHash === "string" && term.sourceHash.trim() !== "") ||
			(typeof term?.original === "string" && containsCjk(term.original))
		)
	})
}

async function ensureWebsiteTermGlossaryContext(pageContext, terms) {
	if (!pageContext || !termsNeedWebsiteGlossaryMapping(terms) || getWebsiteTermGlossaryContext()) {
		return
	}
	appState.runtime.websiteTermGlossaryContext = await fetchOfficialWtrGlossaryContext(pageContext.rawId)
}

async function getOfficialGlossaryContextForApply(pageContext) {
	const existingContext = getWebsiteTermGlossaryContext()
	if (existingContext) {
		return existingContext
	}
	if (!pageContext) {
		return null
	}
	appState.runtime.websiteTermGlossaryContext = await fetchOfficialWtrGlossaryContext(pageContext.rawId)
	return appState.runtime.websiteTermGlossaryContext
}

/**
 * Resolve original Chinese source text for English finding variations.
 * The website API requires the Chinese `from/source_hash` value, so this uses
 * chapter glossary metadata first and falls back to the official glossary API.
 */
async function resolveChineseSourcesForVariations(variations: string[], pageContext): Promise<string[]> {
	const variationKeys = new Set(variations.map(normalizeTermLookupKey).filter(Boolean))
	const sources = new Map<string, string>()
	if (variationKeys.size === 0) {
		return []
	}

	for (const variation of variations) {
		if (typeof variation === "string" && containsCjk(variation)) {
			addResolvedSource(sources, variation)
		}
	}

	const sourceIndex = getSourceLookupIndex()
	for (const variationKey of variationKeys) {
		addResolvedSource(sources, sourceIndex.get(variationKey))
	}

	const glossary = await getOfficialGlossaryContextForApply(pageContext)
	if (glossary) {
		addSourcesFromGroups(glossary.canonicalTerms, variationKeys, sources)
		addSourcesFromGroups(glossary.aliasGroups, variationKeys, sources)
		addSourcesFromGroups(glossary.replacements, variationKeys, sources)
		addSourcesFromCorrections(glossary.corrections, variationKeys, sources)
	}

	return Array.from(sources.values())
}

function getOfficialAliasesForSource(source: string): string[] {
	const glossary = getWebsiteTermGlossaryContext()
	const sourceKey = normalizeTermLookupKey(source)
	if (!glossary || !sourceKey) {
		return []
	}

	const aliases = new Set<string>()
	const collectFromGroups = (groups: any[]) => {
		for (const group of Array.isArray(groups) ? groups : []) {
			if (normalizeTermLookupKey(group?.source) !== sourceKey) {
				continue
			}
			if (typeof group.canonical === "string") {
				aliases.add(group.canonical.trim())
			}
			if (Array.isArray(group.aliases)) {
				for (const alias of group.aliases) {
					if (typeof alias === "string" && alias.trim()) {
						aliases.add(alias.trim())
					}
				}
			}
		}
	}

	collectFromGroups(glossary.canonicalTerms)
	collectFromGroups(glossary.aliasGroups)
	collectFromGroups(glossary.replacements)
	for (const correction of Array.isArray(glossary.corrections) ? glossary.corrections : []) {
		if (normalizeTermLookupKey(correction?.source) === sourceKey && typeof correction?.corrected === "string") {
			aliases.add(correction.corrected.trim())
		}
	}

	return Array.from(aliases).filter(Boolean)
}

function getChapterAliasesForSource(source: string, chapterData): string[] {
	const sourceKey = normalizeTermLookupKey(source)
	const aliases = new Set<string>()
	if (!sourceKey) {
		return []
	}

	for (const chapter of Array.isArray(chapterData) ? chapterData : []) {
		if (!Array.isArray(chapter?.glossaryTerms)) {
			continue
		}
		for (const term of chapter.glossaryTerms) {
			if (normalizeTermLookupKey(term?.source) === sourceKey && typeof term?.term === "string") {
				aliases.add(term.term.trim())
			}
		}
	}

	return Array.from(aliases).filter(Boolean)
}

function expandWebsiteTermsForAnalysis(terms, chapterData) {
	if (!Array.isArray(terms) || terms.length === 0) {
		return terms
	}

	rememberChapterGlossarySources(chapterData)
	const expandedTerms = [...terms]
	const seen = new Set(
		expandedTerms.map(
			(term) => `${term.caseSensitive ? "cs" : "ci"}|${normalizeTermLookupKey(term.original)}|${term.replacement}`,
		),
	)
	let addedCount = 0

	for (const term of terms) {
		const source =
			typeof term.sourceHash === "string" && term.sourceHash.trim()
				? term.sourceHash.trim()
				: typeof term.original === "string" && containsCjk(term.original)
					? term.original.trim()
					: ""
		if (!source) {
			continue
		}

		const aliases = [...getChapterAliasesForSource(source, chapterData), ...getOfficialAliasesForSource(source)]
		for (const alias of aliases) {
			const aliasKey = normalizeTermLookupKey(alias)
			if (!aliasKey || aliasKey === normalizeTermLookupKey(term.original)) {
				continue
			}
			const key = `${term.caseSensitive ? "cs" : "ci"}|${aliasKey}|${term.replacement}`
			if (seen.has(key)) {
				continue
			}
			seen.add(key)
			expandedTerms.push({
				...term,
				original: alias,
				caseSensitive: false,
			})
			addedCount++
		}
	}

	if (addedCount > 0) {
		log(`Expanded website term replacements with ${addedCount} glossary alias${addedCount === 1 ? "" : "es"}.`)
	}
	return expandedTerms
}

function getConfiguredApplyTarget(): "both" | "userscript" | "website" {
	return ["both", "userscript", "website"].includes(appState.config.applyTarget)
		? appState.config.applyTarget
		: "both"
}

function getApplyTargetAvailability() {
	const target = getConfiguredApplyTarget()
	const pageContext = getWtrPageContext()
	const isUserscriptAvailable = isWTRLabTermReplacerLoaded()
	const isWebsiteAvailable = Boolean(appState.runtime.websiteReplacerAvailable)
	const wantsUserscript = target === "both" || target === "userscript"
	const wantsWebsite = target === "both" || target === "website"

	return {
		target,
		pageContext,
		isUserscriptAvailable,
		isWebsiteAvailable,
		isWebsitePageAvailable: Boolean(pageContext),
		canApplyUserscript: wantsUserscript && isUserscriptAvailable,
		canApplyWebsite: wantsWebsite && Boolean(pageContext) && isWebsiteAvailable,
	}
}

function summarizeChapterCollection(chapterData) {
	return (Array.isArray(chapterData) ? chapterData : []).map((chapter) => ({
		chapter: chapter.chapter,
		title: chapter.title || "",
		textLength: typeof chapter.text === "string" ? chapter.text.length : 0,
		charCount: chapter.charCount || null,
		placeholderCount: chapter.placeholderCount || 0,
		glossaryTermCount: Array.isArray(chapter.glossaryTerms) ? chapter.glossaryTerms.length : 0,
	}))
}

function summarizeUnresolvedPlaceholders(chapterData) {
	return (Array.isArray(chapterData) ? chapterData : [])
		.map((chapter) => {
			const text = typeof chapter.text === "string" ? chapter.text : ""
			const matches = [...text.matchAll(/※\d+[⛬〓]?/g)].map((match) => match[0])
			return {
				chapter: chapter.chapter,
				count: matches.length,
				markers: [...new Set(matches)].slice(0, 10),
			}
		})
		.filter((summary) => summary.count > 0)
}

function logUnresolvedPlaceholderAudit(stage, chapterData) {
	const summaries = summarizeUnresolvedPlaceholders(chapterData)
	if (summaries.length === 0) {
		log(`${stage}: No unresolved WTR placeholders detected after preprocessing.`)
		return
	}

	log(`${stage}: Unresolved WTR placeholders remain after preprocessing.`, {
		chapterCount: summaries.length,
		totalMarkers: summaries.reduce((total, summary) => total + summary.count, 0),
		chapters: summaries,
	})
}

async function collectChapterDataForAnalysis(liveTerms) {
	appState.runtime.officialGlossaryContext = null
	appState.runtime.websiteTermGlossaryContext = null
	appState.runtime.websiteTermSourceIndex = new Map()
	const pageContext = getWtrPageContext()

	if (appState.config.useOfficialWtrGlossary && pageContext) {
		updateStatusIndicator("running", "Loading WTR glossary context...")
		appState.runtime.officialGlossaryContext = await fetchOfficialWtrGlossaryContext(pageContext.rawId)
		appState.runtime.websiteTermGlossaryContext = appState.runtime.officialGlossaryContext
	}

	if (appState.config.chapterSource === "wtr-api" && pageContext) {
		const chapterRange = buildWtrApiChapterRange(pageContext, appState.config)
		log("WTR reader API chapter request prepared.", {
			rawId: pageContext.rawId,
			serieSlug: pageContext.serieSlug,
			currentChapter: pageContext.chapterNo,
			rangeMode: appState.config.wtrApiRangeMode || "nearby",
			requestedChapters: chapterRange,
		})
		const fetchedChapters = []
		for (let index = 0; index < chapterRange.length; index++) {
			const chapterNo = chapterRange[index]
			updateStatusIndicator("running", `Fetching WTR chapter ${chapterNo} (${index + 1}/${chapterRange.length})...`)
			fetchedChapters.push(await fetchWtrChapter(pageContext, chapterNo))
		}
		log(
			`Collected ${fetchedChapters.length} chapter${fetchedChapters.length === 1 ? "" : "s"} from WTR Lab reader API.`,
			summarizeChapterCollection(fetchedChapters),
		)
		logUnresolvedPlaceholderAudit("WTR API fetch", fetchedChapters)
		await ensureWebsiteTermGlossaryContext(pageContext, liveTerms)
		const termsForAnalysis = expandWebsiteTermsForAnalysis(liveTerms, fetchedChapters)
		const processedChapters = applyTermReplacements(fetchedChapters, termsForAnalysis)
		logUnresolvedPlaceholderAudit("Term replacement preprocessing", processedChapters)
		return processedChapters
	}

	if (appState.config.chapterSource === "wtr-api" && !pageContext) {
		log("WTR reader API source was selected, but the current page URL did not expose raw_id/chapter metadata. Falling back to loaded page chapters.")
	}

	const chapterData = crawlChapterData()
	log("Collected loaded page chapters for analysis.", summarizeChapterCollection(chapterData))
	logUnresolvedPlaceholderAudit("Loaded page crawl", chapterData)
	await ensureWebsiteTermGlossaryContext(pageContext, liveTerms)
	const termsForAnalysis = expandWebsiteTermsForAnalysis(liveTerms, chapterData)
	const processedChapters = applyTermReplacements(chapterData, termsForAnalysis)
	logUnresolvedPlaceholderAudit("Term replacement preprocessing", processedChapters)
	return processedChapters
}

async function startAnalysis(isContinuation = false) {
	try {
		if (appState.runtime.isAnalysisRunning) {
			alert("An analysis is already in progress.")
			return
		}
		if (!appState.config.apiKeys || appState.config.apiKeys.length === 0 || !appState.config.model) {
			alert("Please add at least one API key and select a model in the Configuration tab first.")
			document.querySelector('.wtr-if-tab-btn[data-tab="config"]').click()
			togglePanel(true)
			return
		}

		const deepAnalysisDepth = Math.max(1, parseInt(appState.config.deepAnalysisDepth) || 1)

		// Each button press starts a new request lifecycle. Keep continuation results,
		// but never reuse retry timers from a completed or aborted run.
		appState.runtime.analysisStartedAt = null
		appState.runtime.deepAnalysisStartTimes = {}

		if (!isContinuation) {
			appState.runtime.cumulativeResults = []
			appState.runtime.apiKeyCooldowns.clear()
			appState.runtime.currentApiKeyIndex = 0
			appState.runtime.currentIteration = 1
			appState.runtime.totalIterations = deepAnalysisDepth
			document.getElementById("wtr-if-results").innerHTML = ""
			document.getElementById("wtr-if-continue-btn").disabled = true
			document.getElementById("wtr-if-filter-select").value = "all"
			// Clear session results only when starting a completely new analysis
			clearSessionResults()
		}
		if (isContinuation && appState.session.hasSavedResults) {
			document.getElementById("wtr-if-continue-btn").disabled = false
		}

		if (appState.config.useJson) {
			document.getElementById("wtr-if-file-input").dataset.continuation = String(isContinuation)
			document.getElementById("wtr-if-file-input").click()
			return
		}

		let liveTerms = []
		if (appState.config.useLiveTermReplacerSync && isWTRLabTermReplacerLoaded()) {
			const novelSlug = getNovelSlug()
			const syncedTerms = await requestTermsFromWTRLabTermReplacer(novelSlug)

			if (Array.isArray(syncedTerms)) {
				liveTerms = syncedTerms
				log(`Using ${liveTerms.length} live terms from WTR Lab Term Replacer for analysis.`)
			} else {
				log(
					"Live term sync from WTR Lab Term Replacer was unavailable. Continuing without preloaded replacements.",
				)
				const statusEl = document.getElementById("wtr-if-status")
				if (statusEl) {
					statusEl.textContent =
						"Live Term Replacer sync unavailable; analyzing without preloaded replacements."
					setTimeout(() => {
						if (statusEl) {
							statusEl.textContent = ""
						}
					}, 3500)
				}
			}
		}

		// Also fetch terms from the website's built-in term replacer
		if (appState.config.useWebsiteTermReplacerSync) {
			const pageContext = getWtrPageContext()
			if (pageContext) {
				const websiteConfig = await fetchWebsiteTermConfig()
				appState.runtime.websiteReplacerAvailable = Boolean(websiteConfig?.success)
				updateTermReplacerIntegrationUI()
				updateApplyCopyButtonsMode()
				if (websiteConfig?.config?.terms) {
					let websiteTerms = normalizeWebsiteTerms(websiteConfig.config.terms)
					// Filter to terms relevant for the current novel when possible
					if (websiteTerms.length > 0) {
						const beforeFilter = websiteTerms.length
						websiteTerms = websiteTerms.filter((term) => {
							if (!term.filter || term.filter.length === 0) return true
							return term.filter.includes(pageContext.rawId)
						})
						log(
							`Loaded ${websiteTerms.length}/${beforeFilter} website built-in term replacer terms for raw_id ${pageContext.rawId}.`,
						)
					}
					// Merge with external userscript terms, deduplicating by original+replacement
					const termMap = new Map<string, any>()
					for (const term of liveTerms) {
						const key = `${term.caseSensitive ? "cs:" : "ci:"}${term.original}→${term.replacement}`
						termMap.set(key, term)
					}
					for (const term of websiteTerms) {
						const key = `${term.caseSensitive ? "cs:" : "ci:"}${term.original}→${term.replacement}`
						if (!termMap.has(key)) {
							termMap.set(key, term)
						}
					}
					liveTerms = Array.from(termMap.values())
				} else {
					log("Website built-in term replacer config was unavailable; continuing without website terms.")
				}
			}
		}

		let processedData
		try {
			processedData = await collectChapterDataForAnalysis(liveTerms)
		} catch (error) {
			if (appState.config.chapterSource !== "wtr-api") {
				throw error
			}
			log("WTR reader API collection failed. Falling back to loaded page chapters.", error)
			const statusEl = document.getElementById("wtr-if-status")
			if (statusEl) {
				statusEl.textContent = "WTR API fetch failed; using loaded page chapters instead."
				setTimeout(() => {
					if (statusEl) {
						statusEl.textContent = ""
					}
				}, 4500)
			}
			const chapterData = crawlChapterData()
			await ensureWebsiteTermGlossaryContext(getWtrPageContext(), liveTerms)
			const termsForAnalysis = expandWebsiteTermsForAnalysis(liveTerms, chapterData)
			processedData = applyTermReplacements(chapterData, termsForAnalysis)
		}

		if (!processedData.length) {
			throw new Error("No chapter text was available for analysis.")
		}

		findInconsistenciesDeepAnalysis(
			processedData,
			isContinuation ? appState.runtime.cumulativeResults : [],
			deepAnalysisDepth,
		)
		togglePanel(false)
	} catch (error) {
		log("Failed to start analysis.", error)
		alert(`Failed to start analysis. ${error instanceof Error ? error.message : String(error)}`)
	}
}

function safeSetStyle(element, property, value) {
	if (element && element.style && property) {
		element.style[property] = value
		return true
	}
	return false
}

export async function handleSaveConfig() {
	const keyInputs = document.querySelectorAll(".wtr-if-api-key-input")
	const newApiKeys = []
	keyInputs.forEach((input) => {
		const key = input.value.trim()
		if (key) {
			newApiKeys.push(key)
		}
	})

	const providerSettings = resolveProviderSettings({
		providerType: document.getElementById("wtr-if-provider-type").value,
		providerBaseUrl: document.getElementById("wtr-if-provider-base-url").value,
		providerChatCompletionsPath: document.getElementById("wtr-if-provider-chat-path").value,
		providerModelsPath: document.getElementById("wtr-if-provider-models-path").value,
		providerUseManualPaths: document.getElementById("wtr-if-provider-use-manual-paths").checked,
	})

	appState.config.apiKeys = newApiKeys
	appState.config.providerType = providerSettings.providerType
	appState.config.providerBaseUrl = providerSettings.baseUrl
	appState.config.providerChatCompletionsPath = providerSettings.chatCompletionsPath
	appState.config.providerModelsPath = providerSettings.modelsPath
	appState.config.providerUseManualPaths = providerSettings.useManualPaths
	appState.config.model = document.getElementById("wtr-if-model").value
	appState.config.useLiveTermReplacerSync = document.getElementById("wtr-if-use-live-term-replacer-sync").checked
	appState.config.useWebsiteTermReplacerSync = document.getElementById("wtr-if-use-website-term-replacer-sync").checked
	const applyTarget = document.getElementById("wtr-if-apply-target").value
	appState.config.applyTarget = ["both", "userscript", "website"].includes(applyTarget) ? applyTarget : "both"
	appState.config.useJson = document.getElementById("wtr-if-use-json").checked
	appState.config.chapterSource = document.getElementById("wtr-if-chapter-source").value
	appState.config.wtrApiRangeMode = document.getElementById("wtr-if-wtr-api-range-mode").value
	appState.config.wtrApiPreviousChapters = parseInt(document.getElementById("wtr-if-wtr-api-previous").value, 10) || 0
	appState.config.wtrApiNextChapters = parseInt(document.getElementById("wtr-if-wtr-api-next").value, 10) || 0
	appState.config.wtrApiStartChapter = document.getElementById("wtr-if-wtr-api-start").value.trim()
	appState.config.wtrApiEndChapter = document.getElementById("wtr-if-wtr-api-end").value.trim()
	appState.config.useOfficialWtrGlossary = document.getElementById("wtr-if-use-official-wtr-glossary").checked
	appState.config.loggingEnabled = document.getElementById("wtr-if-logging-enabled").checked
	const statusEl = document.getElementById("wtr-if-status")
	statusEl.textContent = "Saving..."
	const success = await saveConfig()
	statusEl.textContent = success ? "Configuration saved successfully!" : "Failed to save configuration."
	setTimeout(() => (statusEl.textContent = ""), 3000)
}

export function handleFindInconsistencies() {
	startAnalysis(false)
}

export function handleContinueAnalysis() {
	startAnalysis(true)
}

export function handleFileImportAndAnalyze(event) {
	const file = event.target.files[0]
	if (!file) {
		return
	}
	const isContinuation = event.target.dataset.continuation === "true"
	const reader = new FileReader()
	reader.onload = async (e) => {
		try {
			const data = JSON.parse(String(e.target.result))
			const novelSlug = getNovelSlug()
			log(`Detected novel slug: "${novelSlug}"`)

			// --- JSON Validation ---
			if (!data || typeof data !== "object") {
				throw new Error("File is not a valid JSON object.")
			}
			if (!data.terms || typeof data.terms !== "object") {
				throw new Error("JSON must contain a top-level 'terms' object.")
			}
			const terms = data.terms[novelSlug]
			if (terms === undefined) {
				log(`No replacement terms found for novel slug "${novelSlug}" in the JSON file.`)
				alert(
					`No terms found for the current novel ("${novelSlug}") in this file. Analysis will proceed without replacements.`,
				)
			} else if (!Array.isArray(terms)) {
				throw new Error(`The entry for "${novelSlug}" must be an array of term objects.`)
			} else if (
				terms.length > 0 &&
				(!Object.prototype.hasOwnProperty.call(terms[0], "original") ||
					!Object.prototype.hasOwnProperty.call(terms[0], "replacement"))
			) {
				throw new Error(`Term objects for "${novelSlug}" must contain 'original' and 'replacement' properties.`)
			}
			// --- End Validation ---

			appState.runtime.officialGlossaryContext = null
			appState.runtime.websiteTermGlossaryContext = null
			appState.runtime.websiteTermSourceIndex = new Map()
			const pageContext = getWtrPageContext()
			if (appState.config.useOfficialWtrGlossary && pageContext) {
				appState.runtime.officialGlossaryContext = await fetchOfficialWtrGlossaryContext(pageContext.rawId)
				appState.runtime.websiteTermGlossaryContext = appState.runtime.officialGlossaryContext
			}
			const chapterData = crawlChapterData()
			await ensureWebsiteTermGlossaryContext(pageContext, terms || [])
			const termsForAnalysis = expandWebsiteTermsForAnalysis(terms || [], chapterData)
			const processedData = applyTermReplacements(chapterData, termsForAnalysis)
			const deepAnalysisDepth = Math.max(1, parseInt(appState.config.deepAnalysisDepth) || 1)
			findInconsistenciesDeepAnalysis(
				processedData,
				isContinuation ? appState.runtime.cumulativeResults : [],
				deepAnalysisDepth,
			)
			togglePanel(false)
		} catch (err) {
			alert("Failed to read or parse the JSON file. Error: " + err.message)
		} finally {
			event.target.value = ""
		}
	}
	reader.readAsText(file)
}

export function handleRestoreSession() {
	if (appState.session.hasSavedResults) {
		// 1) Build Finder UI for restored results
		displayResults(appState.runtime.cumulativeResults)

		// 2) Immediately sync Apply/Copy mode on the actual rendered Finder buttons
		//    This ensures restored sessions respect the current external integration state.
		updateApplyCopyButtonsMode()

		// Hide session restore element if it exists (removed UI section)
		const sessionRestoreEl = document.getElementById("wtr-if-session-restore")
		if (sessionRestoreEl) {
			safeSetStyle(sessionRestoreEl, "display", "none")
		}

		// Enable continue button after restoring results
		const continueBtn = document.getElementById("wtr-if-continue-btn")
		if (continueBtn) {
			continueBtn.disabled = false
		}

		const statusEl = document.getElementById("wtr-if-status")
		if (statusEl) {
			statusEl.textContent = `Restored ${appState.runtime.cumulativeResults.length} results from previous session`
			setTimeout(() => {
				if (statusEl) {
					statusEl.textContent = ""
				}
			}, 3000)
		}
	}
}

export function handleClearSession() {
	clearSessionResults()

	// Hide session restore element if it exists (removed UI section)
	const sessionRestoreEl = document.getElementById("wtr-if-session-restore")
	if (sessionRestoreEl) {
		safeSetStyle(sessionRestoreEl, "display", "none")
	}

	// Disable continue button when clearing results
	const continueBtn = document.getElementById("wtr-if-continue-btn")
	if (continueBtn) {
		continueBtn.disabled = true
	}

	const statusEl = document.getElementById("wtr-if-status")
	if (statusEl) {
		statusEl.textContent = "Saved session results cleared"
		setTimeout(() => {
			if (statusEl) {
				statusEl.textContent = ""
			}
		}, 3000)
	}
}

export function handleStatusClick() {
	const indicator = document.getElementById("wtr-if-status-indicator")
	if (indicator.classList.contains("complete") || indicator.classList.contains("error")) {
		// Show panel
		togglePanel(true)

		// Activate Finder tab
		const finderTabBtn = document.querySelector('.wtr-if-tab-btn[data-tab="finder"]')
		if (finderTabBtn) {
			finderTabBtn.click()
		}

		// Re-render results (if any) into Finder tab
		if (Array.isArray(appState.runtime.cumulativeResults) && appState.runtime.cumulativeResults.length > 0) {
			displayResults(appState.runtime.cumulativeResults)
		}

		// Ensure status indicator is hidden after navigation
		updateStatusIndicator("hidden")

		// IMPORTANT:
		// Run after Finder DOM is present so button modes match current detection state.
		updateApplyCopyButtonsMode()
	}
}

/**
 * Single source of truth for Finder Apply/Copy button mode.
 *
 * This helper:
 * - Checks isWTRLabTermReplacerLoaded()
 * - Updates Finder tab Apply/Copy buttons:
 *     - #wtr-if-apply-selected
 *     - #wtr-if-apply-all
 *   or any matching .wtr-if-apply-action buttons with data-scope attributes.
 * - When external detected:
 *     - Labels: "Apply Selected" / "Apply All"
 *     - data-action: "apply-selected" / "apply-all"
 * - When external NOT detected:
 *     - Labels: "Copy Selected" / "Copy All"
 *     - data-action: "copy-selected" / "copy-all"
 *
 * Idempotent, cheap, and safe if elements are missing.
 */
export function updateApplyCopyButtonsMode() {
	let externalAvailable = false

	try {
		const availability = getApplyTargetAvailability()
		externalAvailable = availability.canApplyUserscript || availability.canApplyWebsite
	} catch (err) {
		log(
			"WTR Lab Term Replacer detection failed in updateApplyCopyButtonsMode; falling back to safe copy mode.",
			err,
		)
		externalAvailable = false
	}

	// Scope to the Finder tab content to avoid touching any non-related buttons.
	const finderTab = document.getElementById("wtr-if-tab-finder")
	if (!finderTab) {
		return
	}

	// Helper to keep labels/actions in sync for a given scope.
	function syncButton(btn, scope) {
		if (!btn) {
			return
		}
		const isSelected = scope === "selected"
		const applyLabel = isSelected ? "Apply Selected" : "Apply All"
		const copyLabel = isSelected ? "Copy Selected" : "Copy All"
		const applyAction = isSelected ? "apply-selected" : "apply-all"
		const copyAction = isSelected ? "copy-selected" : "copy-all"

		btn.textContent = externalAvailable ? applyLabel : copyLabel
		btn.dataset.action = externalAvailable ? applyAction : copyAction
	}

	// Explicit Finder tab buttons.
	syncButton(finderTab.querySelector("#wtr-if-apply-selected"), "selected")
	syncButton(finderTab.querySelector("#wtr-if-apply-all"), "all")

	// Also support any dynamically rendered action buttons inside result groups.
	// Be robust:
	// - Prefer [data-role='wtr-if-apply-action'] with data-scope.
	// - Fallback to plain .wtr-if-apply-btn (e.g., from restored sessions) and
	//   infer scope from existing data.
	const groupButtons = finderTab.querySelectorAll("[data-role='wtr-if-apply-action'], .wtr-if-apply-btn")
	groupButtons.forEach((btn) => {
		let scope = btn.dataset.scope || btn.getAttribute("data-scope")
		if (!scope) {
			const a = btn.dataset.action || ""
			if (a.endsWith("-selected")) {
				scope = "selected"
			} else if (a.endsWith("-all")) {
				scope = "all"
			}
		}
		if (scope === "selected" || scope === "all") {
			syncButton(btn, scope)
		}
	})
}

/**
 * Handle Apply/Copy actions for a group of variations.
 *
 * Behavior is dynamic:
 * - If WTR Lab Term Replacer is detected:
 *     - Dispatches "wtr:addTerm" with aggregated term(s) for external script.
 *     - Buttons represent "Apply Selected"/"Apply All" semantics.
 * - If not detected (safe mode):
 *     - Copies variations or suggestion text to clipboard instead.
 *     - Buttons represent "Copy Selected"/"Copy All" semantics.
 */
export async function handleApplyClick(event) {
	const button = event.currentTarget
	const action = button.dataset.action || ""
	const replacement = button.dataset.suggestion || ""
	let variationsToApply = []

	let externalAvailable = false
	try {
		const availability = getApplyTargetAvailability()
		externalAvailable = availability.canApplyUserscript || availability.canApplyWebsite
	} catch {
		// If detection explodes for any reason, treat as not available for safety.
		externalAvailable = false
	}

	if (appState.config.loggingEnabled) {
		log("Apply/Copy button click", {
			action,
			replacementValue: replacement,
			replacementLength: replacement ? replacement.length : "empty",
			buttonDataset: { ...button.dataset },
			externalAvailable,
		})
	}

	// Resolve variations based on the button scope, mirroring existing apply selection semantics.
	if (action === "apply-all" || action === "copy-all") {
		try {
			variationsToApply = JSON.parse(button.dataset.variations || "[]")
		} catch (e) {
			log("Failed to parse variations for apply-all/copy-all.", e)
			variationsToApply = []
		}
	} else if (action === "apply-selected" || action === "copy-selected") {
		const groupEl = button.closest(".wtr-if-result-group")
		if (groupEl) {
			const checkedBoxes = groupEl.querySelectorAll(".wtr-if-variation-checkbox:checked")
			checkedBoxes.forEach((box) => variationsToApply.push(box.value))
		}
	}

	let uniqueVariations = [...new Set(variationsToApply)]
	if (button.dataset.safeVariations) {
		try {
			const safeVariations = new Set(JSON.parse(button.dataset.safeVariations || "[]"))
			uniqueVariations = uniqueVariations.filter((variation) => safeVariations.has(variation))
		} catch (e) {
			log("Failed to parse safe variations for apply-selected/copy-selected.", e)
			uniqueVariations = []
		}
	}

	if (uniqueVariations.length === 0) {
		const originalText = button.textContent
		button.textContent = "None Selected!"
		setTimeout(() => {
			if (button) {
				button.textContent = originalText
			}
		}, 2000)
		return
	}

	// Helper to compute final replacement text.
	const finalReplacement = replacement && replacement.trim() !== "" ? replacement.trim() : null

	// Handle Copy Selected / Copy All (safe mode semantics) WITHOUT mutating content or dispatching events.
	if (action === "copy-selected" || action === "copy-all") {
		// For copy, we reuse the same conceptual resolution:
		// - uniqueVariations is the set of variations for this concept (no cross-concept mixing).
		// - finalReplacement is the chosen suggestion (if available).
		if (!finalReplacement) {
			// If we somehow lack a valid suggestion, degrade gracefully and use variations only.
			if (appState.config.loggingEnabled) {
				log("Copy action invoked without a valid suggestion; falling back to variations-only output.", {
					uniqueVariations,
				})
			}
		}

		const termPart = uniqueVariations.join("|")
		const replacedPart = finalReplacement || ""

		let output = ""
		if (termPart) {
			output += `Term: ${termPart}\n`
		}
		if (replacedPart) {
			output += `Replaced: ${replacedPart}\n`
		}

		if (!output) {
			const originalText = button.textContent
			button.textContent = "Nothing to Copy"
			setTimeout(() => {
				if (button) {
					button.textContent = originalText
				}
			}, 1500)
			return
		}

		const writeToClipboard = (text) => {
			if (navigator.clipboard && navigator.clipboard.writeText) {
				return navigator.clipboard.writeText(text)
			}

			// Fallback using a temporary textarea for environments without navigator.clipboard
			return new Promise((resolve, reject) => {
				try {
					const textarea = document.createElement("textarea")
					textarea.value = text
					safeSetStyle(textarea, "position", "fixed")
					safeSetStyle(textarea, "opacity", "0")
					document.body.appendChild(textarea)
					textarea.select()
					const successful = document.execCommand("copy")
					if (textarea && textarea.parentNode) {
						textarea.parentNode.removeChild(textarea)
					}
					if (!successful) {
						reject(new Error("execCommand copy failed"))
					} else {
						resolve(undefined)
					}
				} catch (err) {
					reject(err)
				}
			})
		}

		const originalText = button.textContent
		writeToClipboard(output.trimEnd())
			.then(() => {
				if (!button) {
					return
				}
				button.textContent = "Copied!"
				setTimeout(() => {
					if (button) {
						button.textContent = originalText
					}
				}, 1500)
			})
			.catch((err) => {
				log("Failed to copy terms payload.", err)
				if (!button) {
					return
				}
				button.textContent = "Copy Failed"
				setTimeout(() => {
					if (button) {
						button.textContent = originalText
					}
				}, 1500)
			})

		return
	}

	// From here on, handle Apply Selected / Apply All semantics.
	if (action !== "apply-selected" && action !== "apply-all") {
		// Unknown action; do nothing for safety.
		return
	}

	// Resolve target-specific availability
	const availability = getApplyTargetAvailability()
	const target = availability.target
	const isUserscriptAvailable = availability.isUserscriptAvailable
	const isWebsiteAvailable = availability.isWebsiteAvailable
	const isWebsitePageAvailable = availability.isWebsitePageAvailable
	const canApplyUserscript = availability.canApplyUserscript
	const canApplyWebsite = availability.canApplyWebsite

	if (!canApplyUserscript && !canApplyWebsite) {
		log("Apply action attempted but chosen target is unavailable; ignoring.", {
			action,
			applyTarget: target,
			isUserscriptAvailable,
			isWebsiteAvailable,
			isWebsitePageAvailable,
			uniqueVariations,
		})
		return
	}

	if (!finalReplacement) {
		log("ERROR: Empty or invalid replacement value detected. Aborting term addition.", {
			originalReplacement: replacement,
			variations: uniqueVariations,
		})

		const originalText = button.textContent
		button.textContent = "Invalid Suggestion!"
		safeSetStyle(button, "backgroundColor", "#dc3545")
		setTimeout(() => {
			if (button) {
				button.textContent = originalText
				safeSetStyle(button, "backgroundColor", "")
			}
		}, 3000)
		return
	}

	// External replacer IS available -> preserve original apply behavior semantics.
	let originalTerm
	let isRegex

	if (uniqueVariations.length > 1) {
		uniqueVariations.sort((a, b) => b.length - a.length)
		originalTerm = uniqueVariations.map((v) => escapeRegExp(v)).join("|")
		isRegex = true
		log(`Applying suggestion "${finalReplacement}" via multi-term regex: /${originalTerm}/gi`)
	} else {
		originalTerm = uniqueVariations[0]
		isRegex = false
		log(`Applying suggestion "${finalReplacement}" via simple replacement for: "${originalTerm}"`)
	}

	const originalText = button.textContent
	button.disabled = true
	button.textContent = "Applying..."
	button.classList.remove("sent")
	safeSetStyle(button, "backgroundColor", "")

	let userscriptApplied = false
	let websiteSavedCount = 0
	let websiteFailedCount = 0
	const failures: string[] = []

	if ((target === "both" || target === "userscript") && !canApplyUserscript) {
		failures.push("userscript target unavailable")
	}
	if ((target === "both" || target === "website") && !canApplyWebsite) {
		failures.push(isWebsitePageAvailable ? "website API unavailable" : "website page context unavailable")
	}

	try {
		// Apply to external userscript when requested and available.
		if (canApplyUserscript) {
			try {
				const customEvent = new CustomEvent("wtr:addTerm", {
					detail: {
						original: originalTerm,
						replacement: finalReplacement,
						isRegex: isRegex,
					},
				})
				window.dispatchEvent(customEvent)
				userscriptApplied = true
				log("Dispatched term to WTR Lab Term Replacer userscript.", {
					original: originalTerm,
					replacement: finalReplacement,
				})
			} catch (error) {
				failures.push("userscript dispatch failed")
				log("Failed to dispatch term to WTR Lab Term Replacer userscript.", error)
			}
		}

		// Apply to website built-in term replacer when requested and available.
		if (canApplyWebsite) {
			const pageContext = availability.pageContext
			const chineseSources = pageContext
				? await resolveChineseSourcesForVariations(uniqueVariations, pageContext)
				: []

			if (chineseSources.length === 0) {
				websiteFailedCount++
				failures.push("website source could not be resolved")
				log("Could not resolve Chinese source for website term save; skipping.", {
					uniqueVariations,
					finalReplacement,
				})
			} else {
				for (const chineseSource of chineseSources) {
					const saved = await saveWebsiteTerm({
						from: chineseSource,
						to: finalReplacement,
						caseSensitive: false,
						filter: [pageContext.rawId],
						source: pageContext.rawId,
						sourceId: `id.raw.${pageContext.rawId}`,
						sourceHash: chineseSource,
						lang: pageContext.language,
					})
					if (saved) {
						websiteSavedCount++
						addSourceLookup(chineseSource, chineseSource)
						for (const variation of uniqueVariations) {
							addSourceLookup(variation, chineseSource)
						}
						log(`Saved term to website built-in replacer: "${chineseSource}" → "${finalReplacement}"`)
					} else {
						websiteFailedCount++
						failures.push(`website save failed for ${chineseSource}`)
					}
				}
			}
		}
	} catch (error) {
		failures.push(error instanceof Error ? error.message : String(error))
		log("Unexpected apply failure.", error)
	}

	const appliedCount = (userscriptApplied ? 1 : 0) + websiteSavedCount
	const failedCount = failures.length
	const wasFullyApplied = appliedCount > 0 && failedCount === 0
	const wasPartiallyApplied = appliedCount > 0 && failedCount > 0

	if (wasFullyApplied) {
		button.classList.add("sent")
		button.textContent = websiteSavedCount > 1 ? `Applied ${websiteSavedCount} Website Terms!` : "Applied!"
	} else if (wasPartiallyApplied) {
		button.classList.add("sent")
		button.textContent = "Partially Applied"
	} else {
		button.textContent = "Apply Failed"
		safeSetStyle(button, "backgroundColor", "#dc3545")
	}

	log("Apply action completed.", {
		applyTarget: target,
		userscriptApplied,
		websiteSavedCount,
		websiteFailedCount,
		failures,
	})

	setTimeout(() => {
		button.disabled = false
		button.classList.remove("sent")
		button.textContent = originalText
		safeSetStyle(button, "backgroundColor", "")
	}, wasFullyApplied ? 2000 : 3000)
}

export function handleCopyVariationClick(event) {
	const button = event.currentTarget
	const textToCopy = button.dataset.text
	if (!textToCopy) {
		return
	}

	navigator.clipboard
		.writeText(textToCopy)
		.then(() => {
			const originalContent = button.innerHTML
			button.innerHTML = "✅"
			button.disabled = true
			setTimeout(() => {
				if (button) {
					button.innerHTML = originalContent
					button.disabled = false
				}
			}, 1500)
		})
		.catch((err) => {
			console.error("Inconsistency Finder: Failed to copy text:", err)
			const originalContent = button.innerHTML
			button.innerHTML = "❌"
			setTimeout(() => {
				if (button) {
					button.innerHTML = originalContent
				}
			}, 1500)
		})
}

function exportConfiguration() {
	const configData = {
		version: "5.2",
		timestamp: new Date().toISOString(),
		config: appState.config,
		preferences: {
			autoRestoreResults: appState.preferences.autoRestoreResults,
		},
	}

	const blob = new Blob([JSON.stringify(configData, null, 2)], {
		type: "application/json",
	})
	const url = URL.createObjectURL(blob)
	const a = document.createElement("a")
	a.href = url
	a.download = `WTR Lab Term Inconsistency Finder-5.2-config-${new Date().toISOString().split("T")[0]}.json`
	document.body.appendChild(a)
	a.click()
	document.body.removeChild(a)
	URL.revokeObjectURL(url)

	const statusEl = document.getElementById("wtr-if-status")
	statusEl.textContent = "Configuration exported successfully"
	setTimeout(() => (statusEl.textContent = ""), 3000)
}

function importConfiguration() {
	const input = document.createElement("input")
	input.type = "file"
	input.accept = ".json"
	input.onchange = (e) => {
		const file = e.target.files[0]
		if (!file) {
			return
		}

		const reader = new FileReader()
		reader.onload = (e) => {
			try {
				const data = JSON.parse(String(e.target.result))

				if (!data.config || !data.version) {
					throw new Error("Invalid configuration file format")
				}

				// Backup current config
				const _backup = { ...appState.config }

				// Import new config
				appState.config = {
					...appState.config,
					...data.config,
				}
				const importedProviderSettings = resolveProviderSettings(appState.config)
				appState.config.providerType = importedProviderSettings.providerType
				appState.config.providerBaseUrl = importedProviderSettings.baseUrl
				appState.config.providerChatCompletionsPath = importedProviderSettings.chatCompletionsPath
				appState.config.providerModelsPath = importedProviderSettings.modelsPath
				appState.config.providerUseManualPaths = importedProviderSettings.useManualPaths
				if (data.preferences) {
					appState.preferences = {
						...appState.preferences,
						...data.preferences,
					}
				}

				saveConfig()

				// Refresh UI
				renderApiKeysUI()
				document.getElementById("wtr-if-provider-type").value = appState.config.providerType
				document.getElementById("wtr-if-provider-base-url").value = appState.config.providerBaseUrl
				document.getElementById("wtr-if-provider-chat-path").value = appState.config.providerChatCompletionsPath
				document.getElementById("wtr-if-provider-models-path").value = appState.config.providerModelsPath
				document.getElementById("wtr-if-provider-use-manual-paths").checked = Boolean(
					appState.config.providerUseManualPaths,
				)
				syncProviderConfigUI()
				populateModelSelector()

				// Update form fields
				document.getElementById("wtr-if-use-live-term-replacer-sync").checked =
					appState.config.useLiveTermReplacerSync
				const websiteSyncCheckbox = document.getElementById("wtr-if-use-website-term-replacer-sync")
				if (websiteSyncCheckbox) {
					websiteSyncCheckbox.checked = appState.config.useWebsiteTermReplacerSync
				}
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
				updateTermReplacerIntegrationUI()
				document.getElementById("wtr-if-auto-restore").checked = appState.preferences.autoRestoreResults

				const statusEl = document.getElementById("wtr-if-status")
				statusEl.textContent = "Configuration imported successfully"
				setTimeout(() => (statusEl.textContent = ""), 3000)
			} catch (err) {
				alert("Failed to import configuration: " + err.message)
			}
		}
		reader.readAsText(file)
	}
	input.click()
}

function copyTextToClipboard(text) {
	if (navigator.clipboard?.writeText) {
		return navigator.clipboard.writeText(text)
	}

	const textarea = document.createElement("textarea")
	textarea.value = text
	textarea.setAttribute("readonly", "true")
	textarea.style.position = "fixed"
	textarea.style.left = "-9999px"
	document.body.appendChild(textarea)
	textarea.select()
	const copied = document.execCommand("copy")
	document.body.removeChild(textarea)
	return copied ? Promise.resolve() : Promise.reject(new Error("Clipboard copy failed"))
}

function setConfigStatus(message, timeout = 3000) {
	const statusEl = document.getElementById("wtr-if-status")
	if (!statusEl) {
		return
	}
	statusEl.textContent = message
	if (timeout > 0) {
		setTimeout(() => {
			if (statusEl.textContent === message) {
				statusEl.textContent = ""
			}
		}, timeout)
	}
}

async function handleCopyDebugReport() {
	try {
		await copyTextToClipboard(getDebugLogReport())
		setConfigStatus("Debug report copied. Paste it into your issue report.")
	} catch (error) {
		log("Failed to copy debug report.", error)
		setConfigStatus("Failed to copy debug report. Check clipboard permissions.", 5000)
	}
}

function handleClearDebugLogs() {
	clearDebugLogs()
	updateDebugLoggingUI()
	setConfigStatus("Debug logs cleared.")
}

export function addEventListeners() {
	const panel = document.getElementById("wtr-if-panel")
	if (!panel) {
		return
	}

	panel.querySelector(".wtr-if-close-btn").addEventListener("click", () => togglePanel(false))
	panel.querySelector("#wtr-if-save-config-btn").addEventListener("click", () => {
		handleSaveConfig()
	})
	panel.querySelector("#wtr-if-find-btn").addEventListener("click", handleFindInconsistencies)
	panel.querySelector("#wtr-if-continue-btn").addEventListener("click", handleContinueAnalysis)
	panel.querySelector("#wtr-if-refresh-models-btn").addEventListener("click", fetchAndCacheModels)
	panel.querySelector("#wtr-if-file-input").addEventListener("change", handleFileImportAndAnalyze)
	panel.querySelector("#wtr-if-export-config-btn").addEventListener("click", exportConfiguration)
	panel.querySelector("#wtr-if-import-config-btn").addEventListener("click", importConfiguration)
	panel.querySelector("#wtr-if-copy-debug-report-btn").addEventListener("click", handleCopyDebugReport)
	panel.querySelector("#wtr-if-clear-debug-logs-btn").addEventListener("click", handleClearDebugLogs)
	panel.querySelector("#wtr-if-restore-btn")?.addEventListener("click", handleRestoreSession)
	panel.querySelector("#wtr-if-clear-session-btn")?.addEventListener("click", handleClearSession)

	const filterSelect = panel.querySelector("#wtr-if-filter-select")
	filterSelect.addEventListener("change", () => {
		displayResults(appState.runtime.cumulativeResults)
		appState.config.activeFilter = filterSelect.value
		saveConfig()

		// Ensure Apply/Copy button modes are synchronized after filter change and result re-render
		updateApplyCopyButtonsMode()
	})

	document.getElementById("wtr-if-status-indicator").addEventListener("click", handleStatusClick)

	panel.querySelector("#wtr-if-chapter-source").addEventListener("change", (e) => {
		appState.config.chapterSource = e.target.value
		updateChapterSourceUI()
		saveConfig()
	})

	panel.querySelector("#wtr-if-wtr-api-range-mode").addEventListener("change", (e) => {
		appState.config.wtrApiRangeMode = e.target.value
		updateChapterSourceUI()
		saveConfig()
	})

	panel.querySelectorAll("#wtr-if-wtr-api-previous, #wtr-if-wtr-api-next, #wtr-if-wtr-api-start, #wtr-if-wtr-api-end").forEach((input) => {
		input.addEventListener("change", () => {
			appState.config.wtrApiPreviousChapters = parseInt(document.getElementById("wtr-if-wtr-api-previous").value, 10) || 0
			appState.config.wtrApiNextChapters = parseInt(document.getElementById("wtr-if-wtr-api-next").value, 10) || 0
			appState.config.wtrApiStartChapter = document.getElementById("wtr-if-wtr-api-start").value.trim()
			appState.config.wtrApiEndChapter = document.getElementById("wtr-if-wtr-api-end").value.trim()
			saveConfig()
		})
	})

	panel.querySelector("#wtr-if-use-official-wtr-glossary").addEventListener("change", (e) => {
		appState.config.useOfficialWtrGlossary = e.target.checked
		saveConfig()
	})

	panel.querySelector("#wtr-if-logging-enabled").addEventListener("change", (e) => {
		appState.config.loggingEnabled = e.target.checked
		updateDebugLoggingUI()
		saveConfig()
	})

	panel.querySelector("#wtr-if-provider-use-manual-paths").addEventListener("change", (e) => {
		appState.config.providerUseManualPaths = e.target.checked
		syncProviderConfigUI()
	})

	panel.querySelector("#wtr-if-auto-restore").addEventListener("change", (e) => {
		appState.preferences.autoRestoreResults = e.target.checked
		saveConfig()
	})

	panel.querySelector("#wtr-if-provider-type").addEventListener("change", (e) => {
		const providerType =
			e.target.value === AI_PROVIDERS.GEMINI ? AI_PROVIDERS.GEMINI : AI_PROVIDERS.OPENAI_COMPATIBLE
		const defaults = PROVIDER_DEFAULTS[providerType]
		document.getElementById("wtr-if-provider-base-url").value = defaults.baseUrl
		document.getElementById("wtr-if-provider-chat-path").value = defaults.chatCompletionsPath
		document.getElementById("wtr-if-provider-models-path").value = defaults.modelsPath
		document.getElementById("wtr-if-provider-use-manual-paths").checked = false
		appState.config.providerType = providerType
		appState.config.providerBaseUrl = defaults.baseUrl
		appState.config.providerChatCompletionsPath = defaults.chatCompletionsPath
		appState.config.providerModelsPath = defaults.modelsPath
		appState.config.providerUseManualPaths = false
		appState.config.model = ""
		syncProviderConfigUI()
		populateModelSelector()
	})

	panel.querySelector("#wtr-if-deep-analysis-depth").addEventListener("change", (e) => {
		appState.config.deepAnalysisDepth = parseInt(e.target.value) || 1
		saveConfig()
	})

	panel.querySelectorAll(".wtr-if-tab-btn").forEach((btn) => {
		btn.addEventListener("click", (e) => {
			const targetTab = e.target.dataset.tab
			panel.querySelectorAll(".wtr-if-tab-btn").forEach((b) => b.classList.remove("active"))
			e.target.classList.add("active")
			panel.querySelectorAll(".wtr-if-tab-content").forEach((c) => c.classList.remove("active"))
			panel.querySelector(`#wtr-if-tab-${targetTab}`).classList.add("active")
			appState.config.activeTab = targetTab
			saveConfig()

			// When switching to Finder tab, (re)sync Apply/Copy labels and actions.
			if (targetTab === "finder") {
				updateApplyCopyButtonsMode()
			}

			// When switching to config tab, re-evaluate WTR Lab Term Replacer state
			if (targetTab === "config") {
				updateTermReplacerIntegrationUI()
			}
		})
	})

	panel.querySelector("#wtr-if-add-key-btn").addEventListener("click", addApiKeyRow)
	panel.querySelector("#wtr-if-toggle-keys-btn").addEventListener("click", toggleApiKeyVisibility)
	panel.querySelector("#wtr-if-api-keys-container").addEventListener("click", (e) => {
		if (e.target.classList.contains("wtr-if-remove-key-btn")) {
			if (panel.querySelectorAll(".wtr-if-key-row").length > 1) {
				e.target.closest(".wtr-if-key-row").remove()
			} else {
				e.target.closest(".wtr-if-key-row").querySelector("input").value = ""
			}
		}
	})

	const liveSyncCheckbox = panel.querySelector("#wtr-if-use-live-term-replacer-sync")
	if (liveSyncCheckbox) {
		liveSyncCheckbox.addEventListener("change", (e) => {
			appState.config.useLiveTermReplacerSync = e.target.checked
			saveConfig()
			updateTermReplacerIntegrationUI()
		})
	}

	const websiteSyncCheckbox = panel.querySelector("#wtr-if-use-website-term-replacer-sync")
	if (websiteSyncCheckbox) {
		websiteSyncCheckbox.addEventListener("change", (e) => {
			appState.config.useWebsiteTermReplacerSync = e.target.checked
			saveConfig()
			updateTermReplacerIntegrationUI()
		})
	}

	const applyTargetSelect = panel.querySelector("#wtr-if-apply-target")
	if (applyTargetSelect) {
		applyTargetSelect.addEventListener("change", (e) => {
			const value = e.target.value
			if (["both", "userscript", "website"].includes(value)) {
				appState.config.applyTarget = value
			} else {
				appState.config.applyTarget = "both"
			}
			saveConfig()
			updateTermReplacerIntegrationUI()
		})
	}

	// Delayed-load handling: re-check external userscript presence shortly after init.
	// This is allowed to call updateApplyCopyButtonsMode(), which no-ops if Finder DOM
	// is not yet present, so it does not create stale wiring.
	setTimeout(() => {
		try {
			updateTermReplacerIntegrationUI()
			updateApplyCopyButtonsMode()
		} catch (err) {
			log("WTR Lab Term Replacer delayed detection check failed; continuing safely.", err)
		}
	}, 2000)
}
