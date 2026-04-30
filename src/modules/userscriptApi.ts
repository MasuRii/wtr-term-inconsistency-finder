type UserscriptValueGetter = <T = unknown>(key: string, defaultValue?: T) => T | Promise<T>
type UserscriptValueSetter = (key: string, value: unknown) => void | Promise<void>

type UserscriptResponse = {
	status: number
	statusText: string
	responseText: string
	finalUrl?: string
}

type UserscriptProgressResponse = {
	responseText?: string
	status?: number
}

type UserscriptRequestDetails = {
	method: string
	url: string
	headers?: Record<string, string>
	data?: string
	onload?: (response: UserscriptResponse) => void
	onerror?: (error: unknown) => void
	onprogress?: (response: UserscriptProgressResponse) => void
}

type ThenableResponse = {
	then: (
		onfulfilled: (response: UserscriptResponse) => void,
		onrejected?: (error: unknown) => void,
	) => unknown
}

type UserscriptGlobal = {
	GM_xmlhttpRequest?: (details: UserscriptRequestDetails) => unknown
	GM_getValue?: UserscriptValueGetter
	GM_setValue?: UserscriptValueSetter
	GM_registerMenuCommand?: (caption: string, commandFunc: () => void) => void
	GM?: {
		xmlHttpRequest?: (details: UserscriptRequestDetails) => unknown
		getValue?: UserscriptValueGetter
		setValue?: UserscriptValueSetter
		registerMenuCommand?: (caption: string, commandFunc: () => void) => void
	}
}

const STORAGE_PREFIX = "wtr_if_gm_fallback_"

function getUserscriptGlobal(): Partial<UserscriptGlobal> {
	return globalThis as Partial<UserscriptGlobal>
}

function isThenableResponse(value: unknown): value is ThenableResponse {
	return typeof value === "object" && value !== null && "then" in value && typeof value.then === "function"
}

function getStoredFallbackValue<T>(key: string, defaultValue?: T): T {
	try {
		const rawValue = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`)
		return rawValue === null ? (defaultValue as T) : (JSON.parse(rawValue) as T)
	} catch (error) {
		console.warn("Inconsistency Finder: Failed to read fallback storage value.", error)
		return defaultValue as T
	}
}

function setStoredFallbackValue(key: string, value: unknown): void {
	try {
		window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value))
	} catch (error) {
		console.warn("Inconsistency Finder: Failed to write fallback storage value.", error)
	}
}

function fetchFallback(details: UserscriptRequestDetails): void {
	const fetchOptions: RequestInit = {
		method: details.method,
		headers: details.headers,
		body: details.data,
		credentials: "include",
	}

	fetch(details.url, fetchOptions)
		.then(async (response) => {
			const responseText = await response.text()
			details.onload?.({
				status: response.status,
				statusText: response.statusText,
				responseText,
				finalUrl: response.url,
			})
		})
		.catch((error) => details.onerror?.(error))
}

export function gmXmlhttpRequest(details: UserscriptRequestDetails): void {
	const userscriptGlobal = getUserscriptGlobal()
	const modernApi = userscriptGlobal.GM
	const legacyRequestApi = userscriptGlobal.GM_xmlhttpRequest
	const modernRequestApi = modernApi?.xmlHttpRequest

	if (!legacyRequestApi && !modernRequestApi) {
		fetchFallback(details)
		return
	}

	let callbackHandled = false
	const wrappedDetails: UserscriptRequestDetails = {
		...details,
		onload: (response) => {
			callbackHandled = true
			details.onload?.(response)
		},
		onerror: (error) => {
			callbackHandled = true
			details.onerror?.(error)
		},
	}

	try {
		const result = legacyRequestApi
			? legacyRequestApi(wrappedDetails)
			: modernRequestApi?.call(modernApi, wrappedDetails)
		if (isThenableResponse(result)) {
			result.then(
				(response) => {
					if (!callbackHandled) {
						details.onload?.(response)
					}
				},
				(error) => {
					if (!callbackHandled) {
						details.onerror?.(error)
					}
				},
			)
		}
	} catch (error) {
		details.onerror?.(error)
	}
}

export async function gmGetValue<T = unknown>(key: string, defaultValue?: T): Promise<T> {
	const userscriptGlobal = getUserscriptGlobal()
	const modernApi = userscriptGlobal.GM
	const legacyGetValue = userscriptGlobal.GM_getValue
	const modernGetValue = modernApi?.getValue

	if (legacyGetValue) {
		return await legacyGetValue(key, defaultValue)
	}
	if (modernGetValue) {
		return await modernGetValue.call(modernApi, key, defaultValue)
	}

	return getStoredFallbackValue(key, defaultValue)
}

export async function gmSetValue(key: string, value: unknown): Promise<void> {
	const userscriptGlobal = getUserscriptGlobal()
	const modernApi = userscriptGlobal.GM
	const legacySetValue = userscriptGlobal.GM_setValue
	const modernSetValue = modernApi?.setValue

	if (legacySetValue) {
		await legacySetValue(key, value)
		return
	}
	if (modernSetValue) {
		await modernSetValue.call(modernApi, key, value)
		return
	}

	setStoredFallbackValue(key, value)
}

export function gmRegisterMenuCommand(caption: string, commandFunc: () => void): void {
	const userscriptGlobal = getUserscriptGlobal()
	const modernApi = userscriptGlobal.GM
	const legacyRegisterMenuCommand = userscriptGlobal.GM_registerMenuCommand
	const modernRegisterMenuCommand = modernApi?.registerMenuCommand

	if (legacyRegisterMenuCommand) {
		legacyRegisterMenuCommand(caption, commandFunc)
		return
	}
	if (modernRegisterMenuCommand) {
		modernRegisterMenuCommand.call(modernApi, caption, commandFunc)
	}
}
