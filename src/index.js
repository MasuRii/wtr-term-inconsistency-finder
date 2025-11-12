// src/index.js

// Import styles - Webpack will handle injection
import "./styles/main.css";

// Import version information (fallback for build time)
// import { VERSION } from "./version";

// Import core modules
import { loadConfig } from "./modules/state";
import {
  createUI,
  initializeCollisionAvoidance,
  injectControlButton,
  togglePanel,
} from "./modules/ui";
import { log } from "./modules/utils";

// --- INITIALIZATION ---
async function main() {
  try {
    await loadConfig();
    log("Configuration loaded.");
    createUI();
    injectControlButton();
    initializeCollisionAvoidance();
    GM_registerMenuCommand("Term Inconsistency Finder", () =>
      togglePanel(true),
    );
    log("WTR Term Inconsistency Finder initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize WTR Term Inconsistency Finder:", error);
  }
}

// Run the script
main();
