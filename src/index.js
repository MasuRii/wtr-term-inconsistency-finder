// src/index.js

// Import styles - Webpack will handle injection
import "./styles/main.css";

// Import version information
import { VERSION } from "./version";

// Import core modules
import { loadConfig } from "./modules/state";
import { log } from "./modules/utils";
import {
  createUI,
  injectControlButton,
  setupConflictObserver,
  togglePanel
} from "./modules/ui";

// --- INITIALIZATION ---
async function main() {
  await loadConfig();
  log("Configuration loaded.");
  createUI();
  injectControlButton();
  setupConflictObserver();
  GM_registerMenuCommand("Term Inconsistency Finder", () => togglePanel(true));
}

// Run the script
main();