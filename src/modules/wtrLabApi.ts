import type { PromptContextCaps } from "./promptBudget"
import { buildPromptContextCaps } from "./promptBudget"
import { log } from "./utils"
import { gmGetValue, gmSetValue, gmXmlhttpRequest } from "./userscriptApi"

const WTR_API_GLOSSARY_CACHE_KEY = "wtr_inconsistency_finder_wtr_glossary_cache"
const GLOSSARY_CACHE_TTL_MS = 6 * 60 * 60 * 1000

export interface WtrPageContext {
	rawId: number
	serieSlug: string
	chapterNo: number
	language: string
}

export interface WtrApiRangeConfig {
	wtrApiRangeMode?: string
	wtrApiPreviousChapters?: number | string
	wtrApiNextChapters?: number | string
	wtrApiStartChapter?: number | string
	wtrApiEndChapter?: number | string
}

export interface WtrChapterData {
	chapter: string
	text: string
	title?: string
	chapterId?: number
	charCount?: number
	placeholderCount?: number
	source?: "wtr-api"
	glossaryTerms?: WtrChapterGlossaryTerm[]
}

export interface WtrChapterGlossaryTerm {
	index: number
	term: string
	source: string
}

export interface OfficialAliasGroup {
	canonical: string
	aliases: string[]
	source: string
	count: number
}

export interface OfficialCorrection {
	source: string
	corrected: string
	reason: string
	type?: string
}

export interface OfficialAliasMatch {
	group: OfficialAliasGroup
	phrases: string[]
}

export interface OfficialGlossaryContext {
	rawId: number
	updatedAt: string
	aliasGroups: OfficialAliasGroup[]
	canonicalTerms: OfficialAliasGroup[]
	replacements: OfficialAliasGroup[]
	corrections: OfficialCorrection[]
	summary: {
		glossaryCount: number
		termCount: number
		replacementCount: number
		correctionCount: number
	}
}

interface WtrApiRequestConfig {
	method: "GET" | "POST"
	url: string
	data?: string
}

function parseNonNegativeInteger(value: unknown, fallback: number): number {
	const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)
	return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback
}

function parseOptionalInteger(value: unknown): number | null {
	const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)
	return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null
}

function wtrApiRequest(config: WtrApiRequestConfig): Promise<any> {
	return new Promise((resolve, reject) => {
		gmXmlhttpRequest({
			method: config.method,
			url: config.url,
			headers: {
				Accept: "application/json",
				...(config.data ? { "Content-Type": "application/json" } : {}),
			},
			data: config.data,
			onload: (response) => {
				try {
					const data = JSON.parse(response.responseText || "{}")
					if (response.status >= 400 || data?.success === false) {
						reject(new Error(data?.message || data?.error || response.statusText || `HTTP ${response.status}`))
						return
					}
					resolve(data)
				} catch (error) {
					reject(error)
				}
			},
			onerror: () => reject(new Error("WTR Lab API network request failed.")),
		})
	})
}

export function getWtrPageContext(): WtrPageContext | null {
	const match = window.location.pathname.match(/^\/(en)\/novel\/(\d+)\/([^/]+)\/chapter-(\d+)/)
	if (!match) {
		return null
	}

	return {
		language: match[1],
		rawId: Number.parseInt(match[2], 10),
		serieSlug: match[3],
		chapterNo: Number.parseInt(match[4], 10),
	}
}

export function buildWtrApiChapterRange(pageContext: WtrPageContext, config: WtrApiRangeConfig): number[] {
	const mode = config.wtrApiRangeMode === "custom" ? "custom" : "nearby"
	let startChapter: number
	let endChapter: number

	if (mode === "custom") {
		startChapter = parseOptionalInteger(config.wtrApiStartChapter) || pageContext.chapterNo
		endChapter = parseOptionalInteger(config.wtrApiEndChapter) || startChapter
		if (endChapter < startChapter) {
			const previousStart = startChapter
			startChapter = endChapter
			endChapter = previousStart
		}
	} else {
		const previousCount = Math.min(25, parseNonNegativeInteger(config.wtrApiPreviousChapters, 2))
		const nextCount = Math.min(25, parseNonNegativeInteger(config.wtrApiNextChapters, 2))
		startChapter = Math.max(1, pageContext.chapterNo - previousCount)
		endChapter = pageContext.chapterNo + nextCount
	}

	const chapters: number[] = []
	for (let chapterNo = startChapter; chapterNo <= endChapter; chapterNo++) {
		chapters.push(chapterNo)
	}
	return chapters
}

function normalizeChapterGlossaryTerm(rawTerm: unknown, index: number): WtrChapterGlossaryTerm | null {
	if (!Array.isArray(rawTerm) || rawTerm.length < 2) {
		return null
	}

	const termValue = Array.isArray(rawTerm[0]) ? rawTerm[0][0] : rawTerm[0]
	const sourceValue = rawTerm[1]
	const term = typeof termValue === "string" ? termValue.trim() : ""
	const source = typeof sourceValue === "string" ? sourceValue.trim() : ""

	if (!term) {
		return null
	}

	return { index, term, source }
}

export function resolveWtrGlossaryPlaceholders(text: string, glossaryTerms: WtrChapterGlossaryTerm[]): string {
	if (!text || glossaryTerms.length === 0) {
		return text || ""
	}

	const termsByIndex = new Map(glossaryTerms.map((term) => [term.index, term.term]))
	return text.replace(/※(\d+)[⛬〓]/g, (match, indexValue) => {
		const index = Number.parseInt(indexValue, 10)
		return termsByIndex.get(index) || match
	})
}

export async function fetchWtrChapter(pageContext: WtrPageContext, chapterNo: number): Promise<WtrChapterData> {
	const response = await wtrApiRequest({
		method: "POST",
		url: `${window.location.origin}/api/reader/get`,
		data: JSON.stringify({
			translate: "ai",
			language: pageContext.language,
			raw_id: pageContext.rawId,
			chapter_no: chapterNo,
			retry: false,
			force_retry: false,
		}),
	})

	const chapter = response?.chapter || {}
	const payload = response?.data?.data || {}
	const rawBody = Array.isArray(payload.body) ? payload.body.join("\n\n") : ""
	const rawTitle = payload.title || chapter.title || ""
	const placeholderCount = ((`${rawTitle}\n${rawBody}`).match(/※\d+[⛬〓]/g) || []).length
	const glossaryTerms = Array.isArray(payload.glossary_data?.terms)
		? payload.glossary_data.terms
				.map((term, index) => normalizeChapterGlossaryTerm(term, index))
				.filter(Boolean)
		: []
	const resolvedTitle = resolveWtrGlossaryPlaceholders(rawTitle, glossaryTerms)
	const resolvedBody = resolveWtrGlossaryPlaceholders(rawBody, glossaryTerms)
	const titlePrefix = resolvedTitle ? `Title: ${resolvedTitle}\n\n` : ""

	if (!resolvedBody.trim()) {
		throw new Error(`Chapter ${chapterNo} returned no readable body text.`)
	}

	return {
		chapter: String(chapter.order || chapterNo),
		text: `${titlePrefix}${resolvedBody}`,
		title: resolvedTitle,
		chapterId: typeof chapter.id === "number" ? chapter.id : undefined,
		charCount: typeof chapter.char_count === "number" ? chapter.char_count : resolvedBody.length,
		placeholderCount,
		source: "wtr-api",
		glossaryTerms,
	}
}

function getTermAliases(rawTerm: unknown): string[] {
	if (!Array.isArray(rawTerm) || rawTerm.length === 0) {
		return []
	}

	const rawAliases = Array.isArray(rawTerm[0]) ? rawTerm[0] : [rawTerm[0]]
	return rawAliases.filter((alias) => typeof alias === "string").map((alias) => alias.trim()).filter(Boolean)
}

function getTermSource(rawTerm: unknown): string {
	return Array.isArray(rawTerm) && typeof rawTerm[1] === "string" ? rawTerm[1].trim() : ""
}

function getTermCount(rawTerm: unknown): number {
	if (!Array.isArray(rawTerm)) {
		return 0
	}

	return rawTerm.slice(2).reduce((highest, value) => {
		if (typeof value === "number" && Number.isFinite(value)) {
			return Math.max(highest, value)
		}
		return highest
	}, 0)
}

function createOfficialTermGroup(rawTerm: unknown): OfficialAliasGroup | null {
	const aliases = getTermAliases(rawTerm)
	if (aliases.length === 0) {
		return null
	}

	return {
		canonical: aliases[0],
		aliases: [...new Set(aliases)],
		source: getTermSource(rawTerm),
		count: getTermCount(rawTerm),
	}
}

function compareOfficialGroups(a: OfficialAliasGroup, b: OfficialAliasGroup): number {
	if (b.count !== a.count) {
		return b.count - a.count
	}
	return b.aliases.length - a.aliases.length
}

function dedupeOfficialGroups(groups: OfficialAliasGroup[]): OfficialAliasGroup[] {
	const seen = new Set<string>()
	return groups.filter((group) => {
		const key = `${group.source}|${group.aliases.join("|")}`.toLowerCase()
		if (seen.has(key)) {
			return false
		}
		seen.add(key)
		return true
	})
}

function buildOfficialGlossaryContext(rawId: number, response: any): OfficialGlossaryContext {
	const glossaries = Array.isArray(response?.glossaries) ? response.glossaries : []
	const allTerms: OfficialAliasGroup[] = []
	const allReplacements: OfficialAliasGroup[] = []
	const allCorrections: OfficialCorrection[] = []
	let updatedAt = ""

	glossaries.forEach((glossary) => {
		if (typeof glossary?.updated_at === "string" && glossary.updated_at > updatedAt) {
			updatedAt = glossary.updated_at
		}

		const data = glossary?.data || {}
		if (Array.isArray(data.terms)) {
			data.terms.forEach((term) => {
				const group = createOfficialTermGroup(term)
				if (group) {
					allTerms.push(group)
				}
			})
		}
		if (Array.isArray(data.replacements)) {
			data.replacements.forEach((term) => {
				const group = createOfficialTermGroup(term)
				if (group) {
					allReplacements.push(group)
				}
			})
		}
		if (Array.isArray(data.ai_run?.incorrect)) {
			data.ai_run.incorrect.forEach((item) => {
				if (!item || typeof item !== "object") {
					return
				}
				const source = typeof item.zh === "string" ? item.zh.trim() : ""
				const corrected = typeof item.corrected_en === "string" ? item.corrected_en.trim() : ""
				if (!source || !corrected) {
					return
				}
				allCorrections.push({
					source,
					corrected,
					reason: typeof item.reason === "string" ? item.reason : "",
					type: typeof item.corrected_type === "string" ? item.corrected_type : undefined,
				})
			})
		}
	})

	const canonicalTerms = dedupeOfficialGroups(allTerms).sort(compareOfficialGroups)
	const aliasGroups = canonicalTerms.filter((group) => group.aliases.length > 1)
	const replacements = dedupeOfficialGroups(allReplacements).sort(compareOfficialGroups)

	return {
		rawId,
		updatedAt,
		aliasGroups,
		canonicalTerms,
		replacements,
		corrections: allCorrections,
		summary: {
			glossaryCount: glossaries.length,
			termCount: allTerms.length,
			replacementCount: allReplacements.length,
			correctionCount: allCorrections.length,
		},
	}
}

async function getGlossaryCache(): Promise<Record<string, any>> {
	const cache = await gmGetValue(WTR_API_GLOSSARY_CACHE_KEY, {})
	return cache && typeof cache === "object" ? cache : {}
}

export async function fetchOfficialWtrGlossaryContext(rawId: number): Promise<OfficialGlossaryContext | null> {
	const cache = await getGlossaryCache()
	const cacheKey = String(rawId)
	const cached = cache[cacheKey]
	const now = Date.now()

	if (cached?.timestamp && cached?.context && now - cached.timestamp < GLOSSARY_CACHE_TTL_MS) {
		log(`Using cached WTR glossary context for raw_id ${rawId}.`, cached.context.summary)
		return cached.context
	}

	try {
		const response = await wtrApiRequest({
			method: "GET",
			url: `${window.location.origin}/api/v2/reader/terms/${rawId}.json`,
		})
		const context = buildOfficialGlossaryContext(rawId, response)
		cache[cacheKey] = {
			timestamp: now,
			context,
		}
		await gmSetValue(WTR_API_GLOSSARY_CACHE_KEY, cache)
		log(`Fetched WTR glossary context for raw_id ${rawId}.`, context.summary)
		return context
	} catch (error) {
		if (cached?.context) {
			log(`Failed to refresh WTR glossary context for raw_id ${rawId}; using stale cache.`, error)
			return cached.context
		}
		log(`Failed to fetch WTR glossary context for raw_id ${rawId}.`, error)
		return null
	}
}

function escapeRegExpForSearch(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function containsCjk(value: string): boolean {
	return /[\u3400-\u9fff]/.test(value)
}

function phraseAppearsInText(phrase: string, sourceText: string): boolean {
	const normalizedPhrase = phrase.trim()
	if (normalizedPhrase.length < 3 || !sourceText) {
		return false
	}

	if (containsCjk(normalizedPhrase)) {
		return sourceText.includes(normalizedPhrase)
	}

	const escapedPhrase = escapeRegExpForSearch(normalizedPhrase)
	return new RegExp(`(^|[^A-Za-z0-9])${escapedPhrase}([^A-Za-z0-9]|$)`, "i").test(sourceText)
}

function normalizeIndexTerm(value: unknown): string {
	return typeof value === "string" ? value.trim().toLowerCase() : ""
}

function buildChapterGlossaryIndex(chapterData: Array<Partial<WtrChapterData>> = []) {
	const sourceTerms = new Set<string>()
	const englishTerms = new Set<string>()

	chapterData.forEach((chapter) => {
		if (!Array.isArray(chapter.glossaryTerms)) {
			return
		}
		chapter.glossaryTerms.forEach((term) => {
			const source = normalizeIndexTerm(term.source)
			const english = normalizeIndexTerm(term.term)
			if (source) {
				sourceTerms.add(source)
			}
			if (english) {
				englishTerms.add(english)
			}
		})
	})

	return { sourceTerms, englishTerms }
}

function calculateGroupRelevance(
	group: OfficialAliasGroup,
	sourceText: string,
	chapterIndex: ReturnType<typeof buildChapterGlossaryIndex>,
): number {
	const normalizedSource = normalizeIndexTerm(group.source)
	const normalizedAliases = group.aliases.map(normalizeIndexTerm).filter(Boolean)
	let score = 0

	if (normalizedSource && chapterIndex.sourceTerms.has(normalizedSource)) {
		score += 1_000_000
	}
	if (normalizedAliases.some((alias) => chapterIndex.englishTerms.has(alias))) {
		score += 500_000
	}
	if (group.source && phraseAppearsInText(group.source, sourceText)) {
		score += 100_000
	}
	if (group.aliases.some((alias) => phraseAppearsInText(alias, sourceText))) {
		score += 50_000
	}

	return score > 0 ? score + Math.min(group.count || 0, 10_000) : 0
}

function getRelevantGroups(
	groups: OfficialAliasGroup[],
	sourceText: string,
	chapterIndex: ReturnType<typeof buildChapterGlossaryIndex>,
): OfficialAliasGroup[] {
	return groups
		.map((group) => ({
			group,
			relevance: calculateGroupRelevance(group, sourceText, chapterIndex),
		}))
		.filter((item) => item.relevance > 0)
		.sort((a, b) => b.relevance - a.relevance || compareOfficialGroups(a.group, b.group))
		.map((item) => item.group)
}

function formatAliasGroupForPrompt(group: OfficialAliasGroup): unknown[] {
	return [group.canonical, group.aliases.filter((alias) => alias !== group.canonical), group.source, group.count]
}

function formatCanonicalTermForPrompt(group: OfficialAliasGroup): unknown[] {
	return [group.canonical, group.source, group.count]
}

function formatCorrectionForPrompt(correction: OfficialCorrection, reasonCharLimit: number): unknown[] {
	const reason = correction.reason.length > reasonCharLimit
		? `${correction.reason.slice(0, reasonCharLimit)}…`
		: correction.reason
	return [correction.source, correction.corrected, correction.type || "", reason]
}

function correctionIsRelevant(
	correction: OfficialCorrection,
	sourceText: string,
	chapterIndex: ReturnType<typeof buildChapterGlossaryIndex>,
): boolean {
	const normalizedSource = normalizeIndexTerm(correction.source)
	const normalizedCorrected = normalizeIndexTerm(correction.corrected)
	return Boolean(
		(normalizedSource && chapterIndex.sourceTerms.has(normalizedSource)) ||
			(normalizedCorrected && chapterIndex.englishTerms.has(normalizedCorrected)) ||
			phraseAppearsInText(correction.source, sourceText) ||
			phraseAppearsInText(correction.corrected, sourceText),
	)
}

export function formatOfficialGlossaryPromptContext(
	context: OfficialGlossaryContext | null,
	sourceText = "",
	chapterData: Array<Partial<WtrChapterData>> = [],
	promptCaps: PromptContextCaps = buildPromptContextCaps(),
): string {
	if (!context) {
		return ""
	}

	const chapterIndex = buildChapterGlossaryIndex(chapterData)
	const relevantAliasGroups = getRelevantGroups(context.aliasGroups, sourceText, chapterIndex)
	const relevantCanonicalTerms = getRelevantGroups(context.canonicalTerms, sourceText, chapterIndex)
	const relevantReplacements = getRelevantGroups(context.replacements, sourceText, chapterIndex)
	const relevantCorrections = context.corrections.filter((correction) =>
		correctionIsRelevant(correction, sourceText, chapterIndex),
	)

	if (
		relevantAliasGroups.length === 0 &&
		relevantCanonicalTerms.length === 0 &&
		relevantReplacements.length === 0 &&
		relevantCorrections.length === 0
	) {
		return ""
	}

	const included = {
		aliases: Math.min(relevantAliasGroups.length, promptCaps.aliasGroups),
		terms: Math.min(relevantCanonicalTerms.length, promptCaps.canonicalTerms),
		replacements: Math.min(relevantReplacements.length, promptCaps.replacements),
		corrections: Math.min(relevantCorrections.length, promptCaps.corrections),
	}
	const payload = {
		total: context.summary,
		included,
		aliases: relevantAliasGroups.slice(0, promptCaps.aliasGroups).map(formatAliasGroupForPrompt),
		terms: relevantCanonicalTerms.slice(0, promptCaps.canonicalTerms).map(formatCanonicalTermForPrompt),
		replacements: relevantReplacements.slice(0, promptCaps.replacements).map(formatAliasGroupForPrompt),
		corrections: relevantCorrections
			.slice(0, promptCaps.corrections)
			.map((correction) => formatCorrectionForPrompt(correction, promptCaps.correctionReasonChars)),
	}

	const serialized = JSON.stringify(payload)
	log("Prepared WTR advisory glossary prompt context.", {
		included,
		relevantBeforeCaps: {
			aliases: relevantAliasGroups.length,
			terms: relevantCanonicalTerms.length,
			replacements: relevantReplacements.length,
			corrections: relevantCorrections.length,
		},
		contextLength: serialized.length,
		sourceTextLength: sourceText.length,
		chapterGlossaryTermCount: chapterIndex.sourceTerms.size,
		promptCaps,
	})
	return serialized
}

export function getOfficialAliasOnlyMatch(
	result: any,
	context: OfficialGlossaryContext | null,
): OfficialAliasMatch | null {
	if (!result || !context || !Array.isArray(result.variations) || result.variations.length < 2) {
		return null
	}

	const phrases: string[] = [
		...new Set<string>(
			result.variations
				.map((variation) => (typeof variation?.phrase === "string" ? variation.phrase.trim().toLowerCase() : ""))
				.filter((phrase): phrase is string => Boolean(phrase)),
		),
	]
	if (phrases.length < 2) {
		return null
	}

	const matchingGroup = context.aliasGroups.find((group) => {
		const aliasSet = new Set(group.aliases.map((alias) => alias.trim().toLowerCase()).filter(Boolean))
		return phrases.every((phrase) => aliasSet.has(phrase))
	})

	return matchingGroup ? { group: matchingGroup, phrases } : null
}

export function isOfficialAliasOnlyFinding(result: any, context: OfficialGlossaryContext | null): boolean {
	return Boolean(getOfficialAliasOnlyMatch(result, context))
}
