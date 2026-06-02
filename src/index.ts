// src/index.ts

// Import styles - Webpack will handle injection
import "./styles/main.css"

// Import version information (fallback for build time)
// import { VERSION } from "./version";

// Import core modules
import { loadConfig, appState } from "./modules/state"
import {
	createUI,
	initializeCollisionAvoidance,
	injectControlButton,
	togglePanel,
	updateApplyCopyButtonsMode,
	updateTermReplacerIntegrationUI,
} from "./modules/ui"
import { log } from "./modules/utils"
import { gmRegisterMenuCommand } from "./modules/userscriptApi"
import { isWebsiteTermReplacerAvailable } from "./modules/websiteTermApi"

// --- INITIALIZATION ---
async function main() {
	try {
		await loadConfig()
		log("Configuration loaded.")
		createUI()
		injectControlButton()
		initializeCollisionAvoidance()
		gmRegisterMenuCommand("Term Inconsistency Finder", () => togglePanel(true))

		// Background check for website built-in term replacer availability
		isWebsiteTermReplacerAvailable()
			.then((available) => {
				appState.runtime.websiteReplacerAvailable = available
				log(`Website built-in Term Replacer availability: ${available}`)
				// Sync labels and configuration hint now that availability is known.
				updateApplyCopyButtonsMode()
				updateTermReplacerIntegrationUI()
			})
			.catch((error) => {
				appState.runtime.websiteReplacerAvailable = false
				log("Website built-in Term Replacer availability probe failed.", error)
				updateApplyCopyButtonsMode()
				updateTermReplacerIntegrationUI()
			})

		log("WTR Term Inconsistency Finder initialized successfully.")
	} catch (error) {
		console.error("Failed to initialize WTR Term Inconsistency Finder:", error)
	}
}

// Run the script
main()
