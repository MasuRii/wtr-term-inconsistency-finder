// src/version.js
// Backward compatibility layer for version information
// This file will be replaced by the build banner system in production

// Support both Node.js and browser environments
let VERSION_INFO
try {
	const versionModule = require("../config/versions.js")
	VERSION_INFO = versionModule.VERSION_INFO
} catch {
	// Fallback for browser environment or when config is not available
	VERSION_INFO = {
		SEMANTIC: "5.3.5",
		DISPLAY: "v5.3.5",
		BUILD_ENV: "production",
		BUILD_DATE: "2025-11-10",
	}
}

// Export VERSION constant for backward compatibility
const VERSION = VERSION_INFO.SEMANTIC

if (typeof module !== "undefined" && module.exports) {
	module.exports = {
		VERSION,
		VERSION_INFO,
	}
} else {
	// Browser environment
	window.WTR_VERSION = VERSION
	window.WTR_VERSION_INFO = VERSION_INFO
}
