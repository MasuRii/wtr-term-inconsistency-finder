/**
 * Prompt Manager Module
 * Handles AI prompt generation and management for translation consistency analysis
 */

import { validateResultForContext, summarizeContextResults, log } from "./utils"

/**
 * Advanced system prompt template for AI analysis
 * Contains comprehensive instructions for detecting translation inconsistencies
 */
export const ADVANCED_SYSTEM_PROMPT = `<role>
You are a Translation Consistency Editor for machine-translated novels. Detect only user-actionable term inconsistencies in the supplied text. Return strict JSON matching the requested schema.
</role>

<objective>
Find recurring entities translated inconsistently across chapters: character names, incorrectly used aliases, locations, organizations, titles, items, abilities, techniques, species, realms, and important recurring concepts. Prefer high-confidence issues that harm readability.
</objective>

<analysis_workflow>
1. Scan recurring terms and build entity profiles from context.
2. Normalize harmless formatting before comparison: quote style, surrounding punctuation, and capitalization-only differences when meaning is unchanged.
3. Link variants ONLY when context supports the same source/entity. Use character/location context, speaker, chapter order, component-based names, and source-term clues.
4. Decide whether each difference changes consistency by reading the surrounding sentence/paragraph, chapter title, nearby actions, narrator wording, dialogue speaker, and glossary clues before treating terms as variants.
5. Discard weak matches, intentional aliases, contextual nuance, and true term evolutions.
6. For each remaining issue, provide concise evidence snippets and practical standardization suggestions.
</analysis_workflow>

<context_aware_requirements>
- MUST judge meaning in chapter context, not isolated word similarity. Different English terms are valid when surrounding text shows different referents, abilities, ranks, locations, speakers, tones, or narrative functions.
- MUST disambiguate proper names, titles, aliases, epithets, ranks, and common nouns. A word used as a title/name in one passage and as an ordinary noun or descriptive phrase in another is NOT an inconsistency unless context proves the same source concept was rendered two ways.
- MUST treat dialogue and narration separately when needed. Speaker-specific nicknames, honorific choices, insults, jokes, or in-world terminology MAY be intentional; flag them ONLY when another context clearly uses a conflicting translation for the same entity/concept.
- MUST use chapter-local evidence such as titles, introductions, repeated nearby descriptors, pronouns, relationships, and action continuity to decide whether two terms refer to the same thing.
- MUST use official glossary aliases as context for accepted variants and source mapping. MUST NOT flag alias-only differences unless the chapter text proves one alias is a mistaken translation in that specific usage.
- MUST flag genuine consistency issues when context shows the same source/entity/concept is rendered incompatibly across chapters or passages, especially when the variation affects names, titles, abilities, organizations, locations, or recurring key terms.
</context_aware_requirements>

<do_not_flag>
- Official glossary alias groups supplied in glossary context unless the chapter text proves one alias is used as an actual mistaken translation.
- Terms differing only by straight/smart quote style or trivial title colon punctuation.
- Systematic site-level chapter number/title offsets that repeat across consecutive chapters.
- Author notes, translator notes, casual expressions, onomatopoeia, emotional sounds, or intentionally flavorful speech.
- Character aliases, nicknames, undercover names, online handles, shortened usernames, or progression names when context shows they are intentional.
- Similar terms used by different speakers/entities with distinct meanings, such as two different techniques.
</do_not_flag>

<flag_when>
- Same entity/source concept is rendered with incompatible English names.
- Root terms cause dependent title/location/organization variants.
- Pinyin/romanized terms are mixed into otherwise English terminology when context suggests localization.
- Username formatting/localization issues exist and context clearly indicates a player ID/handle. MUST NOT flag NPC names or single concatenated handles such as PlayerName.
- Non-English honorific usage creates a consistency/localization issue worth reviewing.
</flag_when>

<priority_policy>
Use CRITICAL for central, frequent, ongoing root/main-character issues. Use HIGH for important recurring names/places/abilities. Use MEDIUM for supporting recurring issues. Use LOW for minor or likely term-evolution reviews. Use STYLISTIC for username/honorific/localization style suggestions. Use INFO only for non-actionable nuance/alias notes.
</priority_policy>

<recommendation_policy>
- Actionable findings MUST provide exactly 3 suggestions: one dominant analyzed-text usage option, one glossary-informed option when available, and one editorial best/readability option. If a role has no distinct candidate, still provide 3 text-supported options by varying the reasoning, not by inventing unsupported terms.
- MUST mark exactly one suggestion with is_recommended: true.
- The recommended suggestion SHOULD usually be the dominant consistent usage in the supplied text, especially if it appears across multiple chapters after preprocessing.
- Official glossary data is advisory for source mapping, aliases, and possible corrections. MUST NOT automatically recommend a glossary term over a dominant text term.
- A glossary correction MAY override dominant usage only when the correction clearly says the dominant usage is wrong and the chapter evidence supports that correction.
- If dominant usage and glossary wording conflict, include both as suggestions and explain the conflict in reasoning.
</recommendation_policy>

<output_rules>
- MUST base all findings exclusively on the supplied text plus relevant glossary context.
- Each distinct concept MUST be a separate item. MUST NOT group unrelated entities.
- MUST always populate variations with exact phrases, chapter numbers, and short context snippets.
- Actionable findings MUST have exactly 3 suggestions. Non-actionable INFO findings MAY use an empty suggestions array or one empty informational suggestion.
- The suggestion field MUST contain only the replacement text, never phrases like "standardize to". Use an empty string for informational items.
- Use plain text only inside JSON values. No markdown. No commentary outside JSON.
</output_rules>

<examples>
<issue>Li Fuchen / Lee Fu Chen for the same hero across chapters MUST be one concept with both variants and a recommendation such as Li Fuchen.</issue>
<non_issue>"Project Doomsday" vs 'Project Doomsday' is quote formatting only and MUST be ignored.</non_issue>
</examples>

<final_directive>
Return only schema-valid JSON containing evidence-backed, context-aware term inconsistency findings.
</final_directive>`

/**
 * Generate AI prompt with chapter text and existing results
 * @param {string} chapterText - The chapter text to analyze
 * @param {Array} existingResults - Results from previous analysis for context
 * @returns {string} - Generated prompt for the AI
 */
export function buildPrompt(chapterText, existingResults = [], officialGlossaryContext = "") {
	let prompt = ADVANCED_SYSTEM_PROMPT
	if (officialGlossaryContext) {
		prompt += `\n\n<official_glossary_context>\n<format_reference>\naliases = [canonical, alternate_aliases, source_term, count]; terms = [canonical, source_term, count]; replacements = [canonical, alternates, source_term, count]; corrections = [source_term, corrected_english, type, brief_reason].\n</format_reference>\n<glossary_rules>\n- This compact JSON is pre-filtered to terms relevant to the supplied text.\n- MUST treat aliases as accepted variants unless the text proves a real error.\n- MUST treat terms/replacements/corrections as advisory candidates, not automatic winners.\n- SHOULD use glossary data as one of the three suggestion perspectives when relevant.\n- MUST recommend glossary wording only when it beats dominant analyzed-text usage on evidence.\n- MUST NOT create findings from glossary context alone.\n</glossary_rules>\n\`\`\`json\n${officialGlossaryContext}\n\`\`\`\n</official_glossary_context>`
	}
	prompt += `\n\n<chapter_text>\n---\n${chapterText}\n---\n</chapter_text>`

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
		prompt += `\n\n<verification_and_continuation_task>
<instruction>
Re-check previous findings against the current supplied text, then scan for new issues. Use strict evidence from the current text only. MUST NOT copy old snippets or priorities.
</instruction>

<tasks>
1. Put still-valid, high-confidence previous findings in verified_inconsistencies as freshly rebuilt objects. Re-extract variations, snippets, chapters, priority, explanation, and suggestions from the current text.
2. Omit previous findings that are now resolved, unsupported, intentional aliases/nicknames, contextual nuance, distinct speaker/narration usage, title/name/common-noun ambiguity, confirmed term evolutions, official glossary aliases, or false positives. MUST NOT list discarded items.
3. Put newly discovered issues in new_inconsistencies using the same schema.
</tasks>

<previously_identified_inconsistencies_for_verification>
\`\`\`json
${existingJson}
\`\`\`
</previously_identified_inconsistencies_for_verification>

<required_output_format>
Return only one valid JSON object: {"verified_inconsistencies": [], "new_inconsistencies": []}. Both arrays MUST contain objects matching this schema. Use empty arrays when no items exist.
</required_output_format>

<schema_reference>
\`\`\`json
${schemaDefinition}
\`\`\`
</schema_reference>
</verification_and_continuation_task>
`
	} else {
		prompt += `\n\n<required_output_format>
Your final output MUST be ONLY a single, valid JSON array matching this specific schema. MUST NOT include any other text, explanations, or markdown formatting outside of the JSON array itself.
</required_output_format>
<schema_reference>
\`\`\`json
${schemaDefinition}
\`\`\`
</schema_reference>`
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
