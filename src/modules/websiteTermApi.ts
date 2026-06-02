import { gmXmlhttpRequest } from "./userscriptApi"
import { log } from "./utils"

// --- Types ---

export type WebsiteTermEntry = [
	string, // id/timestamp
	string, // to (replacement)
	string, // from (original / chinese text)
	boolean, // case_sensitive
	number[], // filter (raw_ids)
	number, // source (raw_id)
	string, // source_id (e.g., "id.raw.31")
	string, // source_hash (same as from)
]

export interface WebsiteTermConfig {
	success: boolean
	config?: {
		terms: WebsiteTermEntry[]
		version: number
		date: string
	}
}

export interface NormalizedWebsiteTerm {
	original: string
	replacement: string
	caseSensitive: boolean
	wholeWord: boolean
	isRegex: boolean
	filter?: number[]
	source?: number
	sourceId?: string
	sourceHash?: string
}

export interface SaveWebsiteTermParams {
	from: string
	to: string
	caseSensitive?: boolean
	filter?: number[]
	source: number
	sourceId: string
	sourceHash: string
	lang: string
}

type WebsiteApiRequestConfig = {
	method: "GET" | "POST"
	url: string
	data?: string
}

type WebsiteApiResponseMeta = {
	status: number
	statusText: string
	responseText: string
}

// --- Constants ---

const WEBSITE_TERM_CONFIG_PATH = "/api/v2/user/config"
const WEBSITE_TERM_SAVE_PATH = "/api/v2/user/config/term"

// --- Private ---

function getWebsiteUrl(path: string): string {
	return `${window.location.origin}${path}`
}

function buildWebsiteApiHeaders(hasBody: boolean): Record<string, string> {
	return {
		Accept: "application/json",
		...(hasBody ? { "Content-Type": "application/json" } : {}),
	}
}

function parseWebsiteApiResponse(meta: WebsiteApiResponseMeta): any {
	let data: any = {}
	try {
		data = JSON.parse(meta.responseText || "{}")
	} catch (error) {
		throw new Error(
			`Website Term API returned invalid JSON (${meta.status} ${meta.statusText || "unknown status"}).`,
		)
	}

	if (meta.status >= 400 || data?.success === false) {
		throw new Error(data?.message || data?.error || meta.statusText || `HTTP ${meta.status}`)
	}
	return data
}

async function fetchWebsiteApiRequest(config: WebsiteApiRequestConfig): Promise<any> {
	const response = await fetch(config.url, {
		method: config.method,
		headers: buildWebsiteApiHeaders(Boolean(config.data)),
		body: config.data,
		credentials: "include",
		cache: "no-store",
	})
	const responseText = await response.text()
	return parseWebsiteApiResponse({
		status: response.status,
		statusText: response.statusText,
		responseText,
	})
}

function gmWebsiteApiRequest(config: WebsiteApiRequestConfig): Promise<any> {
	return new Promise((resolve, reject) => {
		gmXmlhttpRequest({
			method: config.method,
			url: config.url,
			headers: buildWebsiteApiHeaders(Boolean(config.data)),
			data: config.data,
			onload: (response) => {
				try {
					resolve(
						parseWebsiteApiResponse({
							status: response.status,
							statusText: response.statusText,
							responseText: response.responseText,
						}),
					)
				} catch (error) {
					reject(error)
				}
			},
			onerror: () => reject(new Error("Website Term API userscript request failed.")),
		})
	})
}

async function websiteApiRequest(config: WebsiteApiRequestConfig): Promise<any> {
	try {
		return await fetchWebsiteApiRequest(config)
	} catch (fetchError) {
		log("Website Term API browser fetch failed; trying userscript request fallback.", fetchError)
		return gmWebsiteApiRequest(config)
	}
}

function normalizeRawIdFilter(value: unknown): number[] | undefined {
	if (!Array.isArray(value)) {
		return undefined
	}
	const ids = value
		.map((item) => (typeof item === "number" ? item : Number.parseInt(String(item), 10)))
		.filter((item) => Number.isFinite(item))
	return ids.length > 0 ? ids : undefined
}

// --- Public ---

export async function fetchWebsiteTermConfig(): Promise<WebsiteTermConfig | null> {
	try {
		const data = await websiteApiRequest({ method: "GET", url: getWebsiteUrl(WEBSITE_TERM_CONFIG_PATH) })
		if (!data || data.success !== true) {
			return null
		}
		return data as WebsiteTermConfig
	} catch (error) {
		log("Website Term Replacer config fetch failed.", error)
		return null
	}
}

export function normalizeWebsiteTerms(terms: WebsiteTermEntry[] | undefined): NormalizedWebsiteTerm[] {
	if (!Array.isArray(terms)) {
		return []
	}
	return terms
		.filter((entry) => {
			return (
				Array.isArray(entry) &&
				entry.length >= 3 &&
				typeof entry[1] === "string" &&
				entry[1].trim() !== "" &&
				typeof entry[2] === "string" &&
				entry[2].trim() !== ""
			)
		})
		.map((entry) => ({
			original: entry[2].trim(),
			replacement: entry[1].trim(),
			caseSensitive: Boolean(entry[3]),
			wholeWord: false,
			isRegex: false,
			filter: normalizeRawIdFilter(entry[4]),
			source: typeof entry[5] === "number" ? entry[5] : undefined,
			sourceId: typeof entry[6] === "string" ? entry[6] : undefined,
			sourceHash: typeof entry[7] === "string" ? entry[7] : entry[2].trim(),
		}))
}

export async function saveWebsiteTerm(params: SaveWebsiteTermParams): Promise<boolean> {
	try {
		const body = JSON.stringify({
			term: {
				from: params.from,
				to: params.to,
				case: Boolean(params.caseSensitive),
				filter: Array.isArray(params.filter) ? params.filter : [params.source],
				source: params.source,
				source_id: params.sourceId,
				source_hash: params.sourceHash,
			},
			lang: params.lang,
		})
		await websiteApiRequest({ method: "POST", url: getWebsiteUrl(WEBSITE_TERM_SAVE_PATH), data: body })
		return true
	} catch (error) {
		log("Website Term Replacer save failed.", error)
		return false
	}
}

export async function isWebsiteTermReplacerAvailable(): Promise<boolean> {
	const config = await fetchWebsiteTermConfig()
	return config !== null && config.success === true
}
