/**
 * Prompt Manager Module
 * Handles AI prompt generation and management for translation consistency analysis
 */

import type { PromptContextCaps } from "./promptBudget"
import { buildPromptContextCaps } from "./promptBudget"
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
6. For each remaining issue, provide concise evidence snippets, a user-visible evidence chain, confidence assessment, and practical standardization suggestions.
</analysis_workflow>

<entity_tracking>
When building entity profiles, track only details grounded in the supplied text:
- First-mention context: how the entity/concept is introduced, named, titled, or described.
- Descriptor chains: recurring roles, titles, relationships, places, abilities, pronouns, or nearby actions attached to the same referent.
- Speaker and narration anchors: who says the term, whether it appears in dialogue or narration, and whether the speaker has reason to use a nickname, insult, honorific, joke, or alias.
- Temporal/chapter anchors: where each variant first appears, where it changes, and whether later chapters consistently prefer one form.
- Compound-term anchors: whether a root term appears inside titles, locations, organizations, abilities, or item names that should be standardized together.
</entity_tracking>

<context_aware_requirements>
- MUST judge meaning in chapter context, not isolated word similarity. Different English terms are valid when surrounding text shows different referents, abilities, ranks, locations, speakers, tones, or narrative functions.
- MUST disambiguate proper names, titles, aliases, epithets, ranks, and common nouns. A word used as a title/name in one passage and as an ordinary noun or descriptive phrase in another is NOT an inconsistency unless context proves the same source concept was rendered two ways.
- MUST treat dialogue and narration separately when needed. Speaker-specific nicknames, honorific choices, insults, jokes, or in-world terminology MAY be intentional; flag them ONLY when another context clearly uses a conflicting translation for the same entity/concept.
- MUST use chapter-local evidence such as titles, introductions, repeated nearby descriptors, pronouns, relationships, and action continuity to decide whether two terms refer to the same thing.
- MUST treat WTR glossary aliases as advisory hints only. Story context, usage frequency, grammar, world-building consistency, and chapter evidence outrank glossary wording. MUST NOT assume glossary aliases are correct or official.
- MUST flag genuine consistency issues when context shows the same source/entity/concept is rendered incompatibly across chapters or passages, especially when the variation affects names, titles, abilities, organizations, locations, or recurring key terms.
</context_aware_requirements>

<overlap_and_granularity_policy>
- MUST avoid duplicate root-term and compound-term findings for the same evidence. Before output, compare findings and merge or omit overlaps.
- If a root term appears only as part of a longer title, event, organization, item, technique, or fixed phrase, report the longer compound concept only; do NOT create a separate root-term finding.
- Create a separate root-term finding ONLY when the root term has independent inconsistent uses outside the compound phrase and those uses need a different replacement than the compound.
- If one suggested replacement would fix both a compound phrase and its root component, keep the most user-actionable concept and include all targetable variations there.
- If two candidate findings share the same chapters, snippets, or variation phrases, they are probably duplicates. Consolidate them into one finding with the clearest concept name.
</overlap_and_granularity_policy>

<evidence_chain_policy>
- For every finding, provide concise, user-visible reasoning_steps that act as a decision guide, not private hidden deliberation.
- reasoning_steps MUST explain: which variants were found, what context links them to the same referent/source concept, what evidence rules out intentional alias/nickname/common-noun usage, and why the final recommendation follows.
- Each reasoning step SHOULD give the user something practical to check, such as frequency, chapter spread, glossary support, grammar fit, or whether the variant could be intentional.
- If the same entity link depends on weak evidence, downgrade priority or omit the finding. Do not use reasoning_steps to justify speculation.
</evidence_chain_policy>

<user_guidance_style>
- Write explanations and suggestion reasoning like a helpful translation editor advising a human, not like a database report.
- Be concise but specific: say what choice you would make, why it helps the reader, and what tradeoff the user should notice.
- Avoid robotic boilerplate such as "is translated inconsistently" without context. Prefer concrete wording like "Use this if you want to preserve the glossary/event name; choose the later wording only if chapter 425 intentionally renamed the event."
- Mention uncertainty plainly when relevant. If two options are both defensible, tell the user what would make you choose one over the other.
- Do not invent personality, jokes, or unsupported editorial opinions. The tone should be warm, practical, and decisive.
</user_guidance_style>

<confidence_policy>
- Provide confidence.score from 1 to 10 for every finding and a short confidence.factors explanation.
- Use 9-10 only when multiple contextual anchors from the chapter text clearly prove the same entity/source concept and the recommendation is obvious.
- Do not use 9-10 when the deciding evidence is mainly glossary data; cap such findings at 7 unless chapter context independently proves the issue.
- Use 7-8 for actionable findings with good evidence but minor uncertainty.
- Use 5-6 for plausible but incomplete evidence and normally mark such findings LOW, STYLISTIC, or INFO unless user review is clearly useful.
- Omit findings below 5 unless they are non-actionable INFO notes.
</confidence_policy>

<anti_hallucination_policy>
- Do not infer source-language terms, official names, hidden author intent, or glossary authority unless they are explicitly present in the supplied text or advisory glossary context.
- Do not say a term is official, canonical, verified, or correct because it appears in glossary context.
- Every variation must be backed by a context_snippet containing that exact surface text. If you cannot quote the targetable text, omit that variation.
- Every finding must include at least two genuinely different variation phrases after normalization. If all variation phrases would be identical, omit the finding.
- Do not create a suggestion that introduces a new name unless it is already present in the supplied text, present in advisory glossary context, or strictly required as a grammatical editorial replacement.
</anti_hallucination_policy>

<do_not_flag>
- WTR glossary alias groups by themselves. Glossary data is AI/user/site-derived reference context, not proof of a real inconsistency.
- Terms differing only by straight/smart quote style or trivial title colon punctuation.
- Systematic site-level chapter number/title offsets that repeat across consecutive chapters.
- Author notes, translator notes, casual expressions, onomatopoeia, emotional sounds, or intentionally flavorful speech.
- Character aliases, nicknames, undercover names, online handles, shortened usernames, or progression names when context shows they are intentional.
- Similar terms used by different speakers/entities with distinct meanings, such as two different techniques.
</do_not_flag>

<flag_when>
- Same entity/source concept is rendered with incompatible English names.
- Root terms cause dependent title/location/organization variants that can be handled as one consolidated, user-actionable finding rather than duplicated root and compound findings.
- Pinyin/romanized terms are mixed into otherwise English terminology when context suggests localization.
- Username formatting/localization issues exist and context clearly indicates a player ID/handle. MUST NOT flag NPC names or single concatenated handles such as PlayerName.
- Non-English honorific usage creates a consistency/localization issue worth reviewing.
</flag_when>

<priority_policy>
Use CRITICAL for central, frequent, ongoing root/main-character issues. Use HIGH for important recurring names/places/abilities. Use MEDIUM for supporting recurring issues. Use LOW for minor or likely term-evolution reviews. Use STYLISTIC for username/honorific/localization style suggestions. Use INFO only for non-actionable nuance/alias notes.
</priority_policy>

<recommendation_policy>
- Actionable findings MUST provide 1 to 3 useful suggestions. Do NOT add filler suggestions just to reach three.
- Suggestions SHOULD cover only distinct defensible choices: dominant analyzed-text usage, advisory reference wording when useful, or an editorial/readability option when it is clearly supported.
- MUST mark exactly one suggestion with is_recommended: true.
- Count variant occurrences across all supplied chapters and mention frequency/chapter spread in suggestion reasoning when possible.
- Prefer variants appearing across more distinct chapters over variants clustered in one short passage.
- The recommended suggestion SHOULD usually be the dominant consistent usage in the supplied text, especially if it appears across multiple chapters after preprocessing.
- If frequency is close or tied, prefer later-chapter usage when it appears to be a stable evolution, then prefer clearer standard English, then advisory glossary source mapping.
- WTR glossary data is advisory for possible source mapping, aliases, and corrections. MUST NOT automatically recommend glossary wording over stronger analyzed-text usage, story context, grammar, or world-building consistency.
- A glossary correction MAY override dominant usage only when chapter evidence independently supports that correction. A glossary label alone is not enough.
- If dominant usage and advisory glossary wording conflict, include both only when both are useful choices, and explain the conflict without calling the glossary official or canonical.
- MUST NOT invent editorial alternatives unless the exact wording appears in the supplied text, appears in advisory glossary context, or is clearly necessary to make a grammatical replacement for the highlighted variation.
- Ensure the recommended replacement makes grammatical sense in every variation context. If the issue occurs inside compound phrases, recommend the whole compound term when replacing only the root would be unclear.
</recommendation_policy>

<replacement_target_policy>
- variation.phrase MUST be the exact targetable term, alias, name, title, or component as it appears in the supplied chapter text.
- variation.replacement_target MUST be the exact text currently present in the supplied chapter text that should be replaced. It MUST NOT be the recommended replacement unless that exact wording already appears in context_snippet.
- variation.phrase and variation.replacement_target MUST appear verbatim in context_snippet, allowing only surrounding quote/punctuation differences.
- NEVER output identical variation phrases for different snippets when the snippets contain different surface text. If the context says "Seventh-Stage", the variation is "Stage", not the recommended "Grade". If the context says "Empty Sword Sect", the variation is "Empty Sword Sect", not "Void Sword Sect".
- variation.phrase MUST NOT be a surrounding quote, full sentence, or broad evidence phrase; put that context only in context_snippet.
- If the full compound term should be replaced, set both phrase and replacement_target to the full compound term found in the text.
- If only one component inside a longer phrase should change, set both phrase and replacement_target to that component found in the text, and include the longer phrase in context_snippet.
</replacement_target_policy>

<output_rules>
- MUST base all findings exclusively on the supplied text plus relevant advisory glossary context.
- Each distinct concept MUST be a separate item. MUST NOT group unrelated entities, and MUST NOT split one overlapping root/compound issue into duplicate findings.
- MUST always populate variations with exact targetable phrases that appear in their context snippets, replacement_target, chapter numbers, and short context snippets.
- MUST include at least two different variation.phrase values for an actionable finding; identical phrases in different snippets are supporting evidence, not variations.
- MUST populate reasoning_steps with concise evidence-chain statements that a user can inspect.
- MUST populate confidence.score and confidence.factors for every finding.
- Actionable findings MUST have 1 to 3 useful suggestions. Non-actionable INFO findings MAY use an empty suggestions array or one empty informational suggestion.
- MUST NOT mention a variant in explanation, reasoning_steps, confidence.factors, or suggestion reasoning unless that variant appears in variations or is explicitly identified as the suggested replacement.
- The suggestion field MUST contain only the replacement text, never phrases like "standardize to". Use an empty string for informational items.
- Use plain text only inside JSON values. No markdown. No commentary outside JSON.
</output_rules>

<examples>
<positive_issue_example>
Concept: Li Fuchen.
Why it is an issue: "Li Fuchen" and "Lee Fu Chen" both refer to the same protagonist because both snippets attach the same sect role, mentor relationship, and ongoing duel context across chapters. Recommend the dominant form when it appears in more chapters and reads consistently.
Example output fragment:
[
  {
    "concept": "Li Fuchen",
    "priority": "HIGH",
    "explanation": "The protagonist's name appears as both Li Fuchen and Lee Fu Chen in matching sect and duel contexts.",
    "reasoning_steps": [
      "Found Li Fuchen in chapter 12 and Lee Fu Chen in chapter 13.",
      "Both snippets describe the same sect disciple continuing the same duel, so the variants refer to the same character rather than separate people.",
      "Li Fuchen appears in more supplied chapters and is the cleaner romanization, so it is the recommended standard."
    ],
    "confidence": { "score": 9, "factors": "Multiple chapter anchors and repeated role/action context support the same-character link." },
    "suggestions": [
      { "display_text": "Dominant usage: Li Fuchen", "suggestion": "Li Fuchen", "reasoning": "Appears in more supplied chapters and fits the recurring protagonist context.", "is_recommended": true },
      { "display_text": "Reference option: Li Fuchen", "suggestion": "Li Fuchen", "reasoning": "Use this if advisory glossary/source mapping supports the same romanization." }
    ],
    "variations": [
      { "phrase": "Li Fuchen", "replacement_target": "Li Fuchen", "chapter": "12", "context_snippet": "Li Fuchen raised his sword before the sect elder." },
      { "phrase": "Lee Fu Chen", "replacement_target": "Lee Fu Chen", "chapter": "13", "context_snippet": "Lee Fu Chen continued the same duel before the sect elder." }
    ]
  }
]
</positive_issue_example>
<borderline_non_issue_example>
"Cloud Sword" used as an ability by Elder Mo and "Azure Cloud Sword" used as a named technique by another disciple are NOT automatically inconsistent. If speaker, owner, rank, or action context shows distinct techniques, omit the finding even if the terms are lexically similar.
</borderline_non_issue_example>
<glossary_conflict_example>
If the text uses "Heavenly Flame" in five chapters but the advisory glossary lists source 火灵 as "Skyfire Spirit", include both as suggestions. Recommend the glossary term only if chapter context proves "Heavenly Flame" is wrong; otherwise recommend the dominant text usage and explain the conflict.
</glossary_conflict_example>
<component_target_example>
If the text says "Fifth-Stage Spirit Emperor" but the inconsistency is only Stage vs Grade, set phrase and replacement_target to "Stage" and put "Fifth-Stage Spirit Emperor" in context_snippet. If another snippet says "Fourth Rank Flying Sword", its variation is "Rank", not the recommended replacement. If the whole compound title should become "Fifth-Grade Spirit Emperor", set phrase and replacement_target to the full compound title as found in the text.
</component_target_example>
<overlap_duplicate_example>
If "Hand-Pushed Tractor Competition" and "walking tractor" candidates come from the same event/title snippets, output only the event/title finding unless "walking tractor" is also independently inconsistent as a vehicle term outside that event. Do not output both just because one term is contained inside the other.
</overlap_duplicate_example>
<formatting_non_issue_example>
"Project Doomsday" vs 'Project Doomsday' is quote formatting only and MUST be ignored.
</formatting_non_issue_example>
</examples>

<final_directive>
Return only schema-valid JSON containing evidence-backed, context-aware term inconsistency findings.
</final_directive>`

function buildDeepAnalysisFocus(currentDepth, targetDepth) {
	if (!currentDepth || !targetDepth) {
		return ""
	}

	return `\n\n<deep_analysis_focus>
You are running deep analysis iteration ${currentDepth} of ${targetDepth}.
- Re-check previous findings first, then scan for new cross-chapter patterns.
- Pay special attention to borderline cases from previous passes, weakly supported links, and findings that need fresh corroborating evidence.
- Look for root-cause patterns across chapters, such as one recurring source term producing several compound variants.
- Verify whether terms discovered in earlier passes now have more chapter spread, stronger entity anchors, or contradicting evidence.
- Downgrade or omit findings that remain ambiguous after this pass. New findings discovered on a final pass must be especially conservative.
</deep_analysis_focus>`
}

/**
 * Generate AI prompt with chapter text and existing results
 * @param {string} chapterText - The chapter text to analyze
 * @param {Array} existingResults - Results from previous analysis for context
 * @returns {string} - Generated prompt for the AI
 */
export function buildPrompt(
	chapterText,
	existingResults = [],
	officialGlossaryContext = "",
	analysisFocus = "",
	promptCaps: PromptContextCaps = buildPromptContextCaps(),
) {
	let prompt = ADVANCED_SYSTEM_PROMPT
	if (analysisFocus) {
		prompt += analysisFocus
	}
	if (officialGlossaryContext) {
		prompt += `\n\n<advisory_wtr_glossary_context>\n<format_reference>\naliases = [suggested_primary, alternate_aliases, source_term, count]; terms = [suggested_primary, source_term, count]; replacements = [suggested_primary, alternates, source_term, count]; corrections = [source_term, suggested_english, type, brief_reason].\n</format_reference>\n<glossary_rules>\n- This compact JSON is pre-filtered to terms relevant to the supplied text.\n- This glossary is advisory context only. It may be AI-generated, user-generated, incomplete, or machine-translated. It is NOT official truth.\n- MUST prioritize analyzed chapter text, story/world-building context, continuity, grammar, and actual usage over glossary wording.\n- MUST treat aliases as possible accepted variants, not as proof that no issue exists and not as proof that one term is correct.\n- SHOULD use glossary data as a reference suggestion perspective when relevant, but MUST NOT make it the recommended option unless chapter evidence supports it.\n- MUST NOT create findings from glossary context alone.\n- MUST NOT call glossary terms official, canonical, or verified in explanations, reasoning, confidence factors, or suggestion labels.\n</glossary_rules>\n\`\`\`json\n${officialGlossaryContext}\n\`\`\`\n</advisory_wtr_glossary_context>`
	}
	prompt += `\n\n<chapter_text>\n---\n${chapterText}\n---\n</chapter_text>`

	const schemaDefinition = `
         [
           {
             "concept": "The core concept or inferred original term.",
             "priority": "CRITICAL | HIGH | MEDIUM | LOW | STYLISTIC | INFO",
             "explanation": "A brief, user-facing explanation of the issue and why it matters for reader clarity.",
             "reasoning_steps": [
               "Decision-guide step: identify the variants and where they appear.",
               "Decision-guide step: explain what contextual anchors prove or weaken the same-entity/source-concept link.",
               "Decision-guide step: explain what choice you recommend and what tradeoff the user should notice."
             ],
             "confidence": {
               "score": "A number from 1 to 10. Use 7+ for actionable findings and lower scores only for review/info-level items.",
               "factors": "Short plain-text explanation of what increases or lowers confidence."
             },
             "suggestions": [
               {
                 "display_text": "A user-friendly label such as 'Dominant usage: Term A', 'Reference option: Term B', or 'Editorial option: Term C'.",
                 "suggestion": "The exact, clean replacement text only. Do not include conversational text like 'Standardize to...'. Use an empty string for informational suggestions.",
                 "reasoning": "Give practical advice for choosing this option, including whether it is dominant usage, advisory-reference, or editorial/readability-based, with frequency/chapter evidence when possible.",
                 "is_recommended": "Required on exactly one actionable suggestion. A boolean true indicating the best recommendation."
               }
             ],
             "variations": [
               {
                 "phrase": "The exact targetable variation text found in this snippet, not the recommended replacement and not a surrounding quote or context phrase.",
                 "replacement_target": "The exact text currently present in this snippet to replace with a suggestion. Usually the same value as phrase.",
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
		const summarizedResults = summarizeContextResults(validResults, promptCaps.previousResults)

		const existingJson = JSON.stringify(
			summarizedResults.map(({ concept, explanation, reasoning_steps, confidence, variations }) => ({
				concept,
				explanation,
				reasoning_steps,
				confidence,
				variations: Array.isArray(variations)
					? variations.map((variation) => ({
							phrase: variation?.phrase,
							replacement_target: variation?.replacement_target || variation?.target_phrase,
							chapter: variation?.chapter,
							context_snippet: variation?.context_snippet,
						}))
					: variations,
			})),
			null,
			2,
		)
		prompt += `\n\n<verification_and_continuation_task>
<instruction>
Re-check previous findings against the current supplied text, then scan for new issues. Use strict evidence from the current text only. MUST NOT copy old snippets, confidence values, reasoning steps, or priorities.
</instruction>

<tasks>
1. Put still-valid, high-confidence previous findings in verified_inconsistencies as freshly rebuilt objects. Re-extract variations, replacement_target, snippets, chapters, priority, explanation, reasoning_steps, confidence, and suggestions from the current text.
2. Omit previous findings that are now resolved, unsupported, intentional aliases/nicknames, contextual nuance, distinct speaker/narration usage, title/name/common-noun ambiguity, confirmed term evolutions, advisory glossary-only matches, or false positives. MUST NOT list discarded items.
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
export function buildDeepAnalysisPrompt(
	chapterText,
	existingResults = [],
	officialGlossaryContext = "",
	currentDepth = 0,
	targetDepth = 0,
	promptCaps: PromptContextCaps = buildPromptContextCaps(),
) {
	const analysisFocus = buildDeepAnalysisFocus(currentDepth, targetDepth)
	// For deep analysis, we always want the verification mode which includes both
	// verification of existing results and discovery of new ones
	return buildPrompt(chapterText, existingResults, officialGlossaryContext, analysisFocus, promptCaps)
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
