export interface PromptContextCaps {
	aliasGroups: number
	canonicalTerms: number
	replacements: number
	corrections: number
	correctionReasonChars: number
	previousResults: number
}

const DEFAULT_PROMPT_CONTEXT_CAPS: PromptContextCaps = Object.freeze({
	aliasGroups: 20,
	canonicalTerms: 40,
	replacements: 25,
	corrections: 15,
	correctionReasonChars: 160,
	previousResults: 30,
})

function getContextScaleFactor(contextLength?: number): number {
	const parsedContextLength =
		typeof contextLength === "number" ? contextLength : Number.parseInt(String(contextLength ?? ""), 10)
	if (!Number.isFinite(parsedContextLength) || parsedContextLength <= 0) {
		return 1
	}

	if (parsedContextLength < 32_000) {
		return 0.5
	}
	if (parsedContextLength < 128_000) {
		return 1
	}
	if (parsedContextLength < 512_000) {
		return 1.5
	}
	return 2
}

function scaleCap(value: number, scaleFactor: number): number {
	return Math.max(1, Math.round(value * scaleFactor))
}

export function buildPromptContextCaps(contextLength?: number): PromptContextCaps {
	const scaleFactor = getContextScaleFactor(contextLength)
	return {
		aliasGroups: scaleCap(DEFAULT_PROMPT_CONTEXT_CAPS.aliasGroups, scaleFactor),
		canonicalTerms: scaleCap(DEFAULT_PROMPT_CONTEXT_CAPS.canonicalTerms, scaleFactor),
		replacements: scaleCap(DEFAULT_PROMPT_CONTEXT_CAPS.replacements, scaleFactor),
		corrections: scaleCap(DEFAULT_PROMPT_CONTEXT_CAPS.corrections, scaleFactor),
		correctionReasonChars: scaleCap(DEFAULT_PROMPT_CONTEXT_CAPS.correctionReasonChars, scaleFactor),
		previousResults: scaleCap(DEFAULT_PROMPT_CONTEXT_CAPS.previousResults, scaleFactor),
	}
}
