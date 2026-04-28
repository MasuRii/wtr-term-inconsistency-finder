declare const GM_xmlhttpRequest: (details: {
	method: string
	url: string
	headers?: Record<string, string>
	data?: string
	onload?: (response: { status: number; statusText: string; responseText: string; finalUrl?: string }) => void
	onerror?: (error: unknown) => void
	onprogress?: (response: { responseText?: string; status?: number }) => void
}) => void

declare const GM_getValue: <T = unknown>(key: string, defaultValue?: T) => Promise<T>
declare const GM_setValue: (key: string, value: unknown) => Promise<void>
declare const GM_addStyle: (css: string) => void
declare const GM_registerMenuCommand: (caption: string, commandFunc: () => void) => void
declare const require: (moduleName: string) => any

interface Element {
	checked?: boolean
	classList: DOMTokenList
	dataset: DOMStringMap
	disabled?: boolean
	files?: FileList | null
	innerText?: string
	open?: boolean
	placeholder?: string
	result?: string | ArrayBuffer | null
	style: CSSStyleDeclaration
	value?: any
	click(): void
	closest(selectors: string): Element | null
}

interface EventTarget {
	checked?: boolean
	classList?: DOMTokenList
	dataset?: DOMStringMap
	files?: FileList | null
	result?: string | ArrayBuffer | null
	value?: any
	closest?(selectors: string): Element | null
}

interface Window {
	WTR_LAB_TERM_REPLACER?: { ready?: boolean }
	WTR_VERSION?: string
	WTR_VERSION_INFO?: any
}

declare module "*.css" {
	const content: string
	export default content
}
