// src/modules/ui/display.js
import { appState } from "../state";
import { escapeHtml, log } from "../utils";
import {
  handleApplyClick,
  handleCopyVariationClick,
  updateApplyCopyButtonsMode,
} from "./events";

export function displayResults(results) {
  // Ensure we render only into the dedicated results container inside Finder tab.
  const finderTab = document.getElementById("wtr-if-tab-finder");
  const resultsContainer =
    (finderTab && finderTab.querySelector("#wtr-if-results")) ||
    document.getElementById("wtr-if-results");

  if (!resultsContainer) {
    log("displayResults: No #wtr-if-results container found; aborting render.");
    return;
  }

  // Only clear the dynamic results area, never the entire Finder tab wrapper.
  resultsContainer.innerHTML = "";
  const filterValue =
    document.getElementById("wtr-if-filter-select")?.value || "all";

  let displayedResults = results.filter((r) => !r.error && r.concept);
  const errors = results.filter((r) => r.error);

  if (filterValue === "new") {
    displayedResults = displayedResults.filter((r) => r.isNew);
  } else if (filterValue === "verified") {
    displayedResults = displayedResults.filter(
      (r) =>
        r.status === "Verified" ||
        (r.isNew === false && r.status !== "Verified"),
    );
  } else if (filterValue !== "all") {
    displayedResults = displayedResults.filter(
      (r) => r.priority === filterValue,
    );
  }

  if (displayedResults.length === 0 && errors.length === 0) {
    resultsContainer.innerHTML =
      '<div class="wtr-if-no-results">No inconsistencies found matching the current filter.</div>';
    return;
  }

  const priorityOrder = {
    CRITICAL: 1,
    HIGH: 2,
    MEDIUM: 3,
    LOW: 4,
    STYLISTIC: 5,
    INFO: 6,
  };
  displayedResults.sort(
    (a, b) =>
      (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99),
  );

  // Append successful results first
  const successFragment = document.createDocumentFragment();
  displayedResults.forEach((group) => {
    const groupEl = document.createElement("div");
    groupEl.className = "wtr-if-result-group";
    const uniqueVariations = [
      ...new Set(group.variations.map((v) => v.phrase)),
    ];
    const variationsJson = JSON.stringify(uniqueVariations);

    const suggestionsHtml = (group.suggestions || [])
      .map((sugg, suggIndex) => {
        // ENHANCED VALIDATION & FALLBACK LOGIC
        const rawSuggestion = sugg.suggestion;
        const suggestionType = typeof rawSuggestion;
        const isValidSuggestion =
          suggestionType === "string" &&
          rawSuggestion &&
          rawSuggestion.trim() !== "";

        // FALLBACK HIERARCHY: suggestion -> cleaned display_text -> skip
        let finalSuggestionValue = "";
        let isActionable = false;

        if (isValidSuggestion) {
          // Primary: Use raw suggestion if valid
          finalSuggestionValue = rawSuggestion.trim();
          isActionable = true;
        } else if (sugg.display_text && sugg.display_text.trim()) {
          // Secondary: Extract actionable text from display_text
          const cleanedDisplayText = sugg.display_text
            .replace(
              /^(standardize to|use|change to|replace with|update to)\s*/i,
              "",
            )
            .replace(/^['"`]|['"`]$/g, "") // Remove surrounding quotes
            .trim();

          if (cleanedDisplayText && cleanedDisplayText !== sugg.display_text) {
            finalSuggestionValue = cleanedDisplayText;
            isActionable = true;
          }
        }

        // Debug logging for suggestion validation (only if enabled)
        if (appState.config.loggingEnabled && !isActionable) {
          log(`Suggestion validation for "${group.concept}" #${suggIndex}:`, {
            originalSuggestion: rawSuggestion,
            displayText: sugg.display_text,
            finalSuggestionValue: finalSuggestionValue,
            isActionable: isActionable,
          });
        }

        const replacementText = isActionable
          ? `<code>${escapeHtml(finalSuggestionValue)}</code>`
          : "<em>(Informational, no replacement)</em>";
        const buttonState = isActionable ? "" : "disabled";
        const applyTitle = isActionable
          ? `Apply '${escapeHtml(finalSuggestionValue)}'`
          : "No direct replacement";
        const recommendedBadge = sugg.is_recommended
          ? '<span class="wtr-if-recommended-badge">Recommended</span>'
          : "";

        return `
             <div class="wtr-if-suggestion-item">
                 <div class="wtr-if-suggestion-header">
                     <span class="wtr-if-correct">${escapeHtml(
                       sugg.display_text ||
                         rawSuggestion ||
                         "No suggestion available",
                     )} ${recommendedBadge}</span>
                     <div class="wtr-if-suggestion-actions">
                         <button class="wtr-if-apply-btn" data-action="apply-selected" data-suggestion="${escapeHtml(
                           finalSuggestionValue,
                         )}" title="${applyTitle} to selected variations" ${buttonState}>Apply Selected</button>
                         <button class="wtr-if-apply-btn" data-action="apply-all" data-suggestion="${escapeHtml(
                           finalSuggestionValue,
                         )}" data-variations='${escapeHtml(
                           variationsJson,
                         )}' title="${applyTitle} to all variations" ${buttonState}>Apply All</button>
                     </div>
                 </div>
                 <p class="wtr-if-replacement-info"><strong>Replacement:</strong> ${replacementText}</p>
                 <p class="wtr-if-reasoning">${escapeHtml(sugg.reasoning)}</p>
             </div>
             `;
      })
      .join("");

    groupEl.innerHTML = `
                <div class="wtr-if-group-header">
                    <h3>
                        <span class="wtr-if-priority wtr-if-priority-${(
                          group.priority || "info"
                        ).toLowerCase()}">${escapeHtml(group.priority || "INFO")}</span>
                        Concept: <span class="wtr-if-concept">${escapeHtml(group.concept)}</span>
                        ${
                          group.status === "Verified" ||
                          (group.isNew === false && group.status !== "Verified")
                            ? '<span class="wtr-if-verified-badge">Verified</span>'
                            : ""
                        }
                    </h3>
                    <p class="wtr-if-explanation">${escapeHtml(group.explanation)}</p>
                </div>
                <div class="wtr-if-details-section">
                    <h4>Variations Found</h4>
                    <div class="wtr-if-variations">
                        ${(group.variations || [])
                          .map(
                            (item) => `
                        <div class="wtr-if-variation-item">
                            <div class="wtr-if-variation-header">
                                <input type="checkbox" class="wtr-if-variation-checkbox" value="${escapeHtml(
                                  item.phrase,
                                )}" title="Select this variation">
                                <button class="wtr-if-copy-variation-btn" data-text="${escapeHtml(
                                  item.phrase,
                                )}" title="Copy variation text">📋</button>
                                <span class="wtr-if-incorrect">"${escapeHtml(item.phrase)}"</span>
                                <span class="wtr-if-chapter">Chapter ${escapeHtml(item.chapter)}</span>
                            </div>
                            <p class="wtr-if-context"><strong>Context:</strong> <em>"...${escapeHtml(
                              item.context_snippet,
                            )}..."</em></p>
                        </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
                <div class="wtr-if-details-section">
                    <h4>Suggestions</h4>
                    <div class="wtr-if-suggestions">
                        ${suggestionsHtml}
                    </div>
                </div>
            `;
    successFragment.appendChild(groupEl);
  });
  resultsContainer.appendChild(successFragment);

  // Prepend errors to the top
  errors
    .slice()
    .reverse()
    .forEach((err) => {
      const errorEl = document.createElement("div");
      errorEl.className = "wtr-if-error";
      errorEl.textContent = err.error;
      resultsContainer.prepend(errorEl);
    });

  // Wire up Apply/Copy buttons for each suggestion group
  const finderScope =
    document.getElementById("wtr-if-tab-finder") || resultsContainer;

  if (finderScope) {
    finderScope.querySelectorAll(".wtr-if-apply-btn").forEach((btn) => {
      // Ensure per-result buttons are reliably discoverable for mode switching
      if (!btn.dataset.role) {
        btn.dataset.role = "wtr-if-apply-action";
      }
      if (!btn.dataset.scope) {
        const action = btn.dataset.action || "";
        if (action.endsWith("-selected")) {
          btn.dataset.scope = "selected";
        } else if (action.endsWith("-all")) {
          btn.dataset.scope = "all";
        }
      }
      btn.addEventListener("click", handleApplyClick);
    });
  }

  // Wire up individual variation copy buttons
  resultsContainer
    .querySelectorAll(".wtr-if-copy-variation-btn")
    .forEach((btn) => btn.addEventListener("click", handleCopyVariationClick));

  // Ensure Apply/Copy button modes are synchronized after results are rendered
  updateApplyCopyButtonsMode();
}
