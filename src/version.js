// src/version.js
// Shared runtime version information for the userscript UI

const FALLBACK_VERSION_INFO = {
	SEMANTIC: "5.4.0",
	DISPLAY: "v5.4.0",
	BUILD_ENV: "production",
	BUILD_DATE: "2026-04-04",
}

let runtimeVersionInfo = FALLBACK_VERSION_INFO

try {
	const versionModule = require("../config/versions.js")
	runtimeVersionInfo = versionModule.VERSION_INFO
} catch {
	runtimeVersionInfo = FALLBACK_VERSION_INFO
}

export const VERSION_INFO = runtimeVersionInfo
export const VERSION = VERSION_INFO.SEMANTIC

if (typeof window !== "undefined") {
	window.WTR_VERSION = VERSION
	window.WTR_VERSION_INFO = VERSION_INFO
}
