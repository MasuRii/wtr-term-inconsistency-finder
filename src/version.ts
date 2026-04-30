// src/version.ts
// Shared runtime version information for the userscript UI

interface RuntimeVersionInfo {
	SEMANTIC: string
	DISPLAY: string
	BUILD_ENV: string
	BUILD_DATE: string
	GREASYFORK: string
	NPM: string
	BADGE: string
	CHANGELOG: string
}

export const VERSION_INFO: RuntimeVersionInfo = {
	SEMANTIC: "5.5.2",
	DISPLAY: "v5.5.2",
	BUILD_ENV: "production",
	BUILD_DATE: "2026-05-01",
	GREASYFORK: "5.5.2",
	NPM: "5.5.2",
	BADGE: "5.5.2",
	CHANGELOG: "5.5.2",
}

export const VERSION = VERSION_INFO.SEMANTIC

if (typeof window !== "undefined") {
	window.WTR_VERSION = VERSION
	window.WTR_VERSION_INFO = VERSION_INFO
}
