// src/modules/ui/display.ts
import { appState } from "../state"
import { escapeHtml, escapeRegExp, log } from "../utils"
import { handleApplyClick, handleCopyVariationClick, updateApplyCopyButtonsMode } from "./events"

const loggedNonActionableSuggestions = new Set()

function getVariationApplyTarget(variation) {
	const explicitTarget =
		typeof variation?.replacement_target === "string"
			? variation.replacement_target.trim()
			: typeof variation?.target_phrase === "string"
				? variation.target_phrase.trim()
				: ""
	return explicitTarget || (typeof variation?.phrase === "string" ? variation.phrase.trim() : "")
}

function buildFlexibleCandidatePattern(candidate) {
	return escapeRegExp(candidate.trim()).replace(/[\s\-_'"“”‘’]+/g, "[\\s\\-_'\"“”‘’]+")
}

function findCandidateInContext(candidate, context) {
	const cleanCandidate = typeof candidate === "string" ? candidate.trim() : ""
	const cleanContext = typeof context === "string" ? context.trim() : ""
	if (!cleanCandidate || !cleanContext) {
		return ""
	}

	if (cleanContext.includes(cleanCandidate)) {
		return cleanCandidate
	}

	const lowerContext = cleanContext.toLowerCase()
	const lowerCandidate = cleanCandidate.toLowerCase()
	const directIndex = lowerContext.indexOf(lowerCandidate)
	if (directIndex !== -1) {
		return cleanContext.slice(directIndex, directIndex + cleanCandidate.length)
	}

	try {
		const match = cleanContext.match(new RegExp(buildFlexibleCandidatePattern(cleanCandidate), "i"))
		return match?.[0]?.trim() || ""
	} catch {
		return ""
	}
}

function getSuggestionValues(suggestions) {
	const values = []
	;(Array.isArray(suggestions) ? suggestions : []).forEach((suggestion) => {
		const value = typeof suggestion?.suggestion === "string" ? suggestion.suggestion.trim() : ""
		if (value) {
			values.push(value)
		}
	})
	return values
}

function resolveVariationTextFromContext(variation, suggestionValues) {
	const context = typeof variation?.context_snippet === "string" ? variation.context_snippet : ""
	const phrase = typeof variation?.phrase === "string" ? variation.phrase.trim() : ""
	const target = getVariationApplyTarget(variation)
	const directCandidates = [phrase, target].filter(Boolean)

	for (const candidate of directCandidates) {
		const match = findCandidateInContext(candidate, context)
		if (match) {
			return match
		}
	}

	for (const candidate of suggestionValues) {
		const match = findCandidateInContext(candidate, context)
		if (match) {
			return match
		}
	}

	return target || phrase
}

function normalizeVariationForDisplay(variation, suggestionValues) {
	const resolvedText = resolveVariationTextFromContext(variation, suggestionValues)
	return {
		...variation,
		phrase: resolvedText,
		replacement_target: resolvedText,
	}
}

function hasExplicitApplyTarget(variation) {
	return Boolean(
		(typeof variation?.replacement_target === "string" && variation.replacement_target.trim()) ||
			(typeof variation?.target_phrase === "string" && variation.target_phrase.trim()),
	)
}

function countTermParts(value) {
	return String(value || "")
		.split(/[\s\-_/]+/)
		.map((part) => part.trim())
		.filter(Boolean).length
}

function isRiskyReplacementGranularity(variation, suggestion) {
	const target = getVariationApplyTarget(variation)
	const cleanSuggestion = String(suggestion || "").trim()
	if (!target || !cleanSuggestion || hasExplicitApplyTarget(variation)) {
		return false
	}
	if (target.toLowerCase() === cleanSuggestion.toLowerCase()) {
		return false
	}

	return countTermParts(cleanSuggestion) === 1 && countTermParts(target) > 1
}

function getSafeApplyTargets(variations, suggestion) {
	const seen = new Set()
	const unsafeTargets = []
	const safeTargets = []

	;(Array.isArray(variations) ? variations : []).forEach((variation) => {
		const target = getVariationApplyTarget(variation)
		if (!target) {
			return
		}
		if (isRiskyReplacementGranularity(variation, suggestion)) {
			unsafeTargets.push(target)
			return
		}
		const key = target.toLowerCase()
		if (key === String(suggestion || "").trim().toLowerCase()) {
			return
		}
		if (!seen.has(key)) {
			seen.add(key)
			safeTargets.push(target)
		}
	})

	return { safeTargets, unsafeTargets }
}

function getStatusBadge(group) {
	if (group.status === "Verified") {
		return '<span class="wtr-if-verified-badge">Verified</span>'
	}
	if (group.status === "Needs Review") {
		return '<span class="wtr-if-review-badge" title="Latest verification returned no items, so this finding was preserved for review.">Needs Review</span>'
	}
	return ""
}

function getConfidenceScore(confidence) {
	const rawScore = confidence?.score
	if (typeof rawScore === "number" && Number.isFinite(rawScore)) {
		return rawScore
	}
	if (typeof rawScore === "string" && rawScore.trim()) {
		const parsed = Number(rawScore)
		return Number.isFinite(parsed) ? parsed : null
	}
	return null
}

function getConfidenceLabel(score) {
	if (score >= 9) {
		return "very strong"
	}
	if (score >= 7) {
		return "solid"
	}
	if (score >= 5) {
		return "worth reviewing"
	}
	return "low"
}

function renderDecisionGuide(group) {
	const steps = Array.isArray(group?.reasoning_steps)
		? group.reasoning_steps.filter((step) => typeof step === "string" && step.trim())
		: []
	const score = getConfidenceScore(group?.confidence)
	const factors = typeof group?.confidence?.factors === "string" ? group.confidence.factors.trim() : ""

	if (!steps.length && score === null && !factors) {
		return ""
	}

	const confidenceHtml = score !== null
		? `<p class="wtr-if-confidence"><strong>Confidence:</strong> ${escapeHtml(String(score))}/10 <span>${escapeHtml(getConfidenceLabel(score))}</span></p>`
		: ""
	const stepsHtml = steps.length
		? `<ol class="wtr-if-decision-steps">${steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>`
		: ""
	const factorsHtml = factors
		? `<p class="wtr-if-confidence-factors"><strong>Why:</strong> ${escapeHtml(factors)}</p>`
		: ""

	return `
                <details class="wtr-if-details-section wtr-if-decision-guide">
                    <summary>Decision Guide</summary>
                    ${confidenceHtml}
                    ${stepsHtml}
                    ${factorsHtml}
                </details>
            `
}

export function displayResults(results) {
	// Ensure we render only into the dedicated results container inside Finder tab.
	const finderTab = document.getElementById("wtr-if-tab-finder")
	const resultsContainer =
		(finderTab && finderTab.querySelector("#wtr-if-results")) || document.getElementById("wtr-if-results")

	if (!resultsContainer) {
		log("displayResults: No #wtr-if-results container found; aborting render.")
		return
	}

	// Only clear the dynamic results area, never the entire Finder tab wrapper.
	resultsContainer.innerHTML = ""
	const filterValue = document.getElementById("wtr-if-filter-select")?.value || "all"

	let displayedResults = results.filter((r) => !r.error && r.concept)
	const errors = results.filter((r) => r.error)

	if (filterValue === "new") {
		displayedResults = displayedResults.filter((r) => r.isNew)
	} else if (filterValue === "verified") {
		displayedResults = displayedResults.filter((r) => r.status === "Verified")
	} else if (filterValue !== "all") {
		displayedResults = displayedResults.filter((r) => r.priority === filterValue)
	}

	if (displayedResults.length === 0 && errors.length === 0) {
		resultsContainer.innerHTML =
			'<div class="wtr-if-no-results">No inconsistencies found matching the current filter.</div>'
		return
	}

	const priorityOrder = {
		CRITICAL: 1,
		HIGH: 2,
		MEDIUM: 3,
		LOW: 4,
		STYLISTIC: 5,
		INFO: 6,
	}
	displayedResults.sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99))

	// Append successful results first
	const successFragment = document.createDocumentFragment()
	displayedResults.forEach((group) => {
		const groupEl = document.createElement("div")
		groupEl.className = "wtr-if-result-group"
		const suggestionValues = getSuggestionValues(group.suggestions)
		const groupVariations = (Array.isArray(group.variations) ? group.variations : []).map((variation) =>
			normalizeVariationForDisplay(variation, suggestionValues),
		)

		const suggestionsHtml = (group.suggestions || [])
			.map((sugg, suggIndex) => {
				// ENHANCED VALIDATION & FALLBACK LOGIC
				const rawSuggestion = sugg.suggestion
				const suggestionType = typeof rawSuggestion
				const isValidSuggestion = suggestionType === "string" && rawSuggestion && rawSuggestion.trim() !== ""

				// FALLBACK HIERARCHY: suggestion -> cleaned display_text -> skip
				let finalSuggestionValue = ""
				let isActionable = false

				if (isValidSuggestion) {
					// Primary: Use raw suggestion if valid
					finalSuggestionValue = rawSuggestion.trim()
					isActionable = true
				} else if (sugg.display_text && sugg.display_text.trim()) {
					// Secondary: Extract actionable text from display_text
					const cleanedDisplayText = sugg.display_text
						.replace(/^(standardize to|use|change to|replace with|update to)\s*/i, "")
						.replace(/^['"`]|['"`]$/g, "") // Remove surrounding quotes
						.trim()

					if (cleanedDisplayText && cleanedDisplayText !== sugg.display_text) {
						finalSuggestionValue = cleanedDisplayText
						isActionable = true
					}
				}

				// Debug logging for suggestion validation (only if enabled)
				if (appState.config.loggingEnabled && !isActionable) {
					const suggestionLogKey = [group.concept, suggIndex, sugg.display_text || rawSuggestion || ""]
						.map((part) => part || "")
						.join("|")
					if (!loggedNonActionableSuggestions.has(suggestionLogKey)) {
						loggedNonActionableSuggestions.add(suggestionLogKey)
						log(`Suggestion validation skipped actionable output for "${group.concept}" #${suggIndex}.`, {
							originalSuggestion: rawSuggestion,
							displayText: sugg.display_text,
						})
					}
				}

				const { safeTargets, unsafeTargets } = getSafeApplyTargets(groupVariations, finalSuggestionValue)
				const safeVariationsJson = JSON.stringify(safeTargets)
				const hasSafeTargets = safeTargets.length > 0
				const replacementText = isActionable
					? `<code>${escapeHtml(finalSuggestionValue)}</code>`
					: "<em>(Informational, no replacement)</em>"
				const buttonState = isActionable && hasSafeTargets ? "" : "disabled"
				const applyTitle = !isActionable
					? "No direct replacement"
					: hasSafeTargets
						? `Apply '${escapeHtml(finalSuggestionValue)}'`
						: "Apply disabled because variation phrases are broader than the replacement target"
				const granularityWarning = unsafeTargets.length
					? `<p class="wtr-if-replacement-info"><em>Apply disabled for ${unsafeTargets.length} broad variation${unsafeTargets.length === 1 ? "" : "s"}; rerun analysis or copy manually so only the exact target term is replaced.</em></p>`
					: ""
				const recommendedBadge = sugg.is_recommended
					? '<span class="wtr-if-recommended-badge">Recommended</span>'
					: ""

				return `
             <div class="wtr-if-suggestion-item">
                 <div class="wtr-if-suggestion-header">
                     <span class="wtr-if-correct">${escapeHtml(
							sugg.display_text || rawSuggestion || "No suggestion available",
						)} ${recommendedBadge}</span>
                     <div class="wtr-if-suggestion-actions">
                         <button class="wtr-if-apply-btn" data-action="apply-selected" data-suggestion="${escapeHtml(
								finalSuggestionValue,
							)}" data-safe-variations='${escapeHtml(
								safeVariationsJson,
							)}' title="${applyTitle} to selected variations" ${buttonState}>Apply Selected</button>
                         <button class="wtr-if-apply-btn" data-action="apply-all" data-suggestion="${escapeHtml(
								finalSuggestionValue,
							)}" data-variations='${escapeHtml(
								safeVariationsJson,
							)}' title="${applyTitle} to all variations" ${buttonState}>Apply All</button>
                     </div>
                 </div>
                 <p class="wtr-if-replacement-info"><strong>Replacement:</strong> ${replacementText}</p>
                 ${granularityWarning}
                 <p class="wtr-if-reasoning">${escapeHtml(sugg.reasoning)}</p>
             </div>
             `
			})
			.join("")

		groupEl.innerHTML = `
                <div class="wtr-if-group-header">
                    <h3>
                        <span class="wtr-if-priority wtr-if-priority-${(
							group.priority || "info"
						).toLowerCase()}">${escapeHtml(group.priority || "INFO")}</span>
                        Concept: <span class="wtr-if-concept">${escapeHtml(group.concept)}</span>
                        ${getStatusBadge(group)}
                    </h3>
                    <p class="wtr-if-explanation">${escapeHtml(group.explanation)}</p>
                </div>
                ${renderDecisionGuide(group)}
                <div class="wtr-if-details-section">
                    <h4>Variations Found</h4>
                    <div class="wtr-if-variations">
                        ${groupVariations
							.map((item) => {
								const applyTarget = getVariationApplyTarget(item)
								const displayPhrase = applyTarget || item.phrase
								return `
                        <div class="wtr-if-variation-item">
                            <div class="wtr-if-variation-header">
                                <input type="checkbox" class="wtr-if-variation-checkbox" value="${escapeHtml(
									applyTarget,
								)}" title="Select this variation">
                                <button class="wtr-if-copy-variation-btn" data-text="${escapeHtml(
									displayPhrase,
								)}" title="Copy variation text">📋</button>
                                <span class="wtr-if-incorrect">"${escapeHtml(displayPhrase)}"</span>
                                <span class="wtr-if-chapter">Chapter ${escapeHtml(item.chapter)}</span>
                            </div>
                            <p class="wtr-if-context"><strong>Context:</strong> <em>"...${escapeHtml(
								item.context_snippet,
							)}..."</em></p>
                        </div>
                        `
							})
							.join("")}
                    </div>
                </div>
                <div class="wtr-if-details-section">
                    <h4>Suggestions</h4>
                    <div class="wtr-if-suggestions">
                        ${suggestionsHtml}
                    </div>
                </div>
            `
		successFragment.appendChild(groupEl)
	})
	resultsContainer.appendChild(successFragment)

	// Prepend errors to the top
	errors
		.slice()
		.reverse()
		.forEach((err) => {
			const errorEl = document.createElement("div")
			errorEl.className = "wtr-if-error"
			errorEl.textContent = err.error
			resultsContainer.prepend(errorEl)
		})

	// Wire up Apply/Copy buttons for each suggestion group
	const finderScope = document.getElementById("wtr-if-tab-finder") || resultsContainer

	if (finderScope) {
		finderScope.querySelectorAll(".wtr-if-apply-btn").forEach((btn) => {
			// Ensure per-result buttons are reliably discoverable for mode switching
			if (!btn.dataset.role) {
				btn.dataset.role = "wtr-if-apply-action"
			}
			if (!btn.dataset.scope) {
				const action = btn.dataset.action || ""
				if (action.endsWith("-selected")) {
					btn.dataset.scope = "selected"
				} else if (action.endsWith("-all")) {
					btn.dataset.scope = "all"
				}
			}
			btn.addEventListener("click", handleApplyClick)
		})
	}

	// Wire up individual variation copy buttons
	resultsContainer
		.querySelectorAll(".wtr-if-copy-variation-btn")
		.forEach((btn) => btn.addEventListener("click", handleCopyVariationClick))

	// Ensure Apply/Copy button modes are synchronized after results are rendered
	updateApplyCopyButtonsMode()
}
