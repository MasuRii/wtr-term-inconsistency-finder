/**
 * Prompt Manager Module
 * Handles AI prompt generation and management for translation consistency analysis
 */

import { validateResultForContext, summarizeContextResults, log } from "./utils"

/**
 * Advanced system prompt template for AI analysis
 * Contains comprehensive instructions for detecting translation inconsistencies
 */
export const ADVANCED_SYSTEM_PROMPT = `You are a Translation Consistency Editor for machine-translated novels. Detect only user-actionable term inconsistencies in the supplied text, then return strict JSON matching the requested schema.

## Goal
Find recurring entities translated inconsistently across chapters: character names, aliases used incorrectly, locations, organizations, titles, items, abilities, techniques, species, realms, and important recurring concepts. Prefer high-confidence issues that harm readability.

## Method
1. Scan recurring terms and build entity profiles from context.
2. Normalize harmless formatting before comparing: quote style, surrounding punctuation, capitalization-only differences when meaning is unchanged.
3. Link variants only when context supports the same source/entity. Use character/location context, speaker, chapter order, component-based names, and source-term clues.
4. Discard weak matches, intentional aliases, contextual nuance, and true term evolutions.
5. For each remaining issue, provide concise evidence snippets and practical standardization suggestions.

## Do Not Flag
- Official glossary alias groups supplied in glossary context unless the chapter text proves one alias is used as an actual mistaken translation.
- Terms differing only by straight/smart quote style or trivial title colon punctuation.
- Systematic site-level chapter number/title offsets that repeat across consecutive chapters.
- Author notes, translator notes, casual expressions, onomatopoeia, emotional sounds, or intentionally flavorful speech.
- Character aliases, nicknames, undercover names, online handles, shortened usernames, or progression names when context shows they are intentional.
- Similar terms used by different speakers/entities with distinct meanings, such as two different techniques.

## What To Flag
- Same entity/source concept rendered with incompatible English names.
- Root terms whose inconsistency causes dependent title/location/organization variants.
- Pinyin/romanized terms mixed into otherwise English terminology when context suggests they should be localized.
- Username formatting/localization issues only when context clearly indicates a player ID/handle. Do not flag NPC names or single concatenated handles such as PlayerName.
- Non-English honorific usage only when it creates a consistency/localization issue worth reviewing.

## Priority
Use CRITICAL for central, frequent, ongoing root/main-character issues; HIGH for important recurring names/places/abilities; MEDIUM for supporting recurring issues; LOW for minor or likely term-evolution reviews; STYLISTIC for username/honorific/localization style suggestions; INFO only for non-actionable nuance/alias notes.

## Recommendation Policy
- For actionable findings, provide exactly 3 suggestions: one dominant analyzed-text usage option, one glossary-informed option when available, and one editorial best/readability option. If a role has no distinct candidate, still provide 3 text-supported options by varying the reasoning, not by inventing unsupported terms.
- Mark exactly one suggestion with is_recommended: true.
- The recommended suggestion should usually be the dominant consistent usage in the supplied text, especially if it appears across multiple chapters after preprocessing.
- Official glossary data is advisory for source mapping, aliases, and possible corrections. Do not automatically recommend a glossary term over a dominant text term.
- Let a glossary correction override dominant usage only when the correction clearly says the dominant usage is wrong and the chapter evidence supports that correction.
- If dominant usage and glossary wording conflict, include both as suggestions and explain the conflict in reasoning.

## Output Rules
- Base all findings exclusively on the supplied text plus relevant glossary context.
- Each distinct concept must be a separate item; do not group unrelated entities.
- Always populate variations with exact phrases, chapter numbers, and short context snippets.
- Actionable findings must have exactly 3 suggestions. Non-actionable INFO findings may use an empty suggestions array or one empty informational suggestion.
- The suggestion field must contain only the replacement text, never phrases like "standardize to". Use an empty string for informational items.
- Use plain text only inside JSON values. No markdown, no commentary outside JSON.

Example issue: Li Fuchen / Lee Fu Chen for the same hero across chapters should be one concept with both variants and a recommendation such as Li Fuchen. Example non-issue: "Project Doomsday" vs 'Project Doomsday' is quote formatting only and must be ignored.`

/**
 * Generate AI prompt with chapter text and existing results
 * @param {string} chapterText - The chapter text to analyze
 * @param {Array} existingResults - Results from previous analysis for context
 * @returns {string} - Generated prompt for the AI
 */
export function buildPrompt(chapterText, existingResults = [], officialGlossaryContext = "") {
	let prompt = ADVANCED_SYSTEM_PROMPT
	if (officialGlossaryContext) {
		prompt += `\n\n## Relevant WTR Lab Official Glossary Context\nThis compact JSON is pre-filtered to terms relevant to the supplied text. Formats: aliases = [canonical, alternate_aliases, source_term, count]; terms = [canonical, source_term, count]; replacements = [canonical, alternates, source_term, count]; corrections = [source_term, corrected_english, type, brief_reason]. Treat aliases as accepted variants unless the text proves a real error. Treat terms/replacements/corrections as advisory candidates, not automatic winners. Use them as one of the three suggestion perspectives when relevant, and recommend them only when they beat dominant analyzed-text usage on evidence. Do not create findings from glossary context alone.\n\`\`\`json\n${officialGlossaryContext}\n\`\`\``
	}
	prompt += `\n\nHere is the text to analyze:\n---\n${chapterText}\n---`

	const schemaDefinition = `
         [
           {
             "concept": "The core concept or inferred original term.",
             "priority": "CRITICAL | HIGH | MEDIUM | LOW | STYLISTIC | INFO",
             "explanation": "A brief explanation of the inconsistency or issue.",
             "suggestions": [
               {
                 "display_text": "A user-friendly label such as 'Dominant usage: Term A', 'Glossary option: Term B', or 'Editorial option: Term C'.",
                 "suggestion": "The exact, clean replacement text only. Do not include conversational text like 'Standardize to...'. Use an empty string (\\"\\") for informational suggestions.",
                 "reasoning": "Explain whether this is dominant analyzed usage, glossary-informed, or editorial/readability-based, with frequency/chapter evidence when possible.",
                 "is_recommended": "Required on exactly one actionable suggestion. A boolean true indicating the best recommendation."
               }
             ],
             "variations": [
               {
                 "phrase": "The specific incorrect/variant phrase found.",
                 "chapter": "The chapter number as a string.",
                 "context_snippet": "A snippet of text showing the context."
               }
             ]
           }
         ]`

	if (existingResults.length > 0) {
		// Validate results before processing
		const validResults = existingResults.filter((result) => {
			const isValid = validateResultForContext(result)
			if (!isValid) {
				log(`Filtered out invalid result from context: ${result.concept || "Unknown concept"}`)
			}
			return isValid
		})

		if (validResults.length === 0) {
			log("All existing results failed validation, proceeding without context")
		} else {
			log(
				`Context validation: ${existingResults.length} results filtered to ${validResults.length} valid results`,
			)
		}

		// Apply context summarization to prevent exponential growth
		const summarizedResults = summarizeContextResults(validResults, 30) // Limit to 30 detailed items

		const existingJson = JSON.stringify(
			summarizedResults.map(({ concept, explanation, variations }) => ({
				concept,
				explanation,
				variations,
			})),
			null,
			2,
		)
		prompt += `\n\n## Verification & Continuation Task
Re-check previous findings against the current supplied text, then scan for new issues. Use strict evidence from the current text only; do not copy old snippets or priorities.

Tasks:
1. Put still-valid, high-confidence previous findings in verified_inconsistencies as freshly rebuilt objects. Re-extract variations, snippets, chapters, priority, explanation, and suggestions from the current text.
2. Omit previous findings that are now resolved, unsupported, intentional aliases/nicknames, contextual nuance, confirmed term evolutions, official glossary aliases, or false positives. Do not list discarded items.
3. Put newly discovered issues in new_inconsistencies using the same schema.

Previously Identified Inconsistencies for Verification:
\`\`\`json
${existingJson}
\`\`\`

Required Output Format:
Return only one valid JSON object: {"verified_inconsistencies": [], "new_inconsistencies": []}. Both arrays must contain objects matching this schema; use empty arrays when no items exist.

Schema Reference:
\`\`\`json
${schemaDefinition}
\`\`\`
`
	} else {
		prompt += `\n\nIMPORTANT: Your final output MUST be ONLY a single, valid JSON array matching this specific schema. Do not include any other text, explanations, or markdown formatting outside of the JSON array itself.
        Schema:
        ${schemaDefinition}`
	}
	return prompt
}

/**
 * Build prompt for deep analysis with enhanced context processing
 * @param {string} chapterText - The chapter text to analyze
 * @param {Array} existingResults - Results from previous analysis iterations
 * @returns {string} - Generated prompt for deep analysis
 */
export function buildDeepAnalysisPrompt(chapterText, existingResults = [], officialGlossaryContext = "") {
	// For deep analysis, we always want the verification mode which includes both
	// verification of existing results and discovery of new ones
	return buildPrompt(chapterText, existingResults, officialGlossaryContext)
}

/**
 * Parse and validate API response content
 * @param {string} resultText - Raw text response from API
 * @returns {Object|Array} - Parsed JSON response
 * @throws {Error} - If parsing fails
 */
export function parseApiResponse(_resultText) {
	// This function will be implemented in the analysis engine to avoid circular dependencies
	// For now, provide a placeholder that throws an error if called directly
	throw new Error("parseApiResponse should be implemented in the analysis engine module")
}
