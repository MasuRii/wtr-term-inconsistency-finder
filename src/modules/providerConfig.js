/**
 * Provider configuration and request helpers.
 *
 * Inspired by the provider/base URL + path normalization approach used in:
 * - C:/Repository/proxx/src/lib/config.ts
 * - C:/Repository/proxx/src/lib/provider-routing.ts
 */

export const AI_PROVIDERS = Object.freeze({
	OPENAI_COMPATIBLE: "openai-compatible",
	GEMINI: "gemini",
})

export const DEFAULT_PROVIDER_TYPE = AI_PROVIDERS.OPENAI_COMPATIBLE

export const PROVIDER_DEFAULTS = Object.freeze({
	[AI_PROVIDERS.OPENAI_COMPATIBLE]: Object.freeze({
		baseUrl: "https://api.openai.com",
		chatCompletionsPath: "/v1/chat/completions",
		modelsPath: "/v1/models",
		modelLabel: "OpenAI-Compatible Model",
		apiKeyLabel: "API Keys",
	}),
	[AI_PROVIDERS.GEMINI]: Object.freeze({
		baseUrl: "https://generativelanguage.googleapis.com/v1beta",
		chatCompletionsPath: "/v1/chat/completions",
		modelsPath: "/v1/models",
		modelLabel: "Gemini Model",
		apiKeyLabel: "Gemini API Keys",
	}),
})

function ensureProviderType(providerType) {
	return providerType === AI_PROVIDERS.GEMINI ? AI_PROVIDERS.GEMINI : AI_PROVIDERS.OPENAI_COMPATIBLE
}

export function normalizeBaseUrl(value, fallback) {
	const candidate = typeof value === "string" ? value.trim() : ""
	return (candidate || fallback).replace(/\/+$/, "")
}

export function normalizeApiPath(value, fallback) {
	const candidate = typeof value === "string" ? value.trim() : ""
	const normalized = candidate || fallback
	const withLeadingSlash = normalized.startsWith("/") ? normalized : `/${normalized}`
	return withLeadingSlash === "/" ? fallback : withLeadingSlash.replace(/\/+$/, "")
}

export function getProviderDefaults(providerType) {
	return PROVIDER_DEFAULTS[ensureProviderType(providerType)]
}

export function resolveProviderSettings(config = {}) {
	const providerType = ensureProviderType(config.providerType)
	const defaults = getProviderDefaults(providerType)

	return {
		providerType,
		baseUrl: normalizeBaseUrl(config.providerBaseUrl, defaults.baseUrl),
		chatCompletionsPath: normalizeApiPath(config.providerChatCompletionsPath, defaults.chatCompletionsPath),
		modelsPath: normalizeApiPath(config.providerModelsPath, defaults.modelsPath),
		modelLabel: defaults.modelLabel,
		apiKeyLabel: defaults.apiKeyLabel,
	}
}

export function buildAnalysisRequest(config, apiKey, prompt) {
	const provider = resolveProviderSettings(config)

	if (provider.providerType === AI_PROVIDERS.GEMINI) {
		return {
			method: "POST",
			url: `${provider.baseUrl}/${config.model}:generateContent?key=${encodeURIComponent(apiKey)}`,
			headers: {
				"Content-Type": "application/json",
			},
			data: JSON.stringify({
				contents: [{ parts: [{ text: prompt }] }],
				generationConfig: {
					temperature: config.temperature,
				},
			}),
		}
	}

	return {
		method: "POST",
		url: `${provider.baseUrl}${provider.chatCompletionsPath}`,
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		data: JSON.stringify({
			model: config.model,
			temperature: config.temperature,
			messages: [{ role: "user", content: prompt }],
		}),
	}
}

function extractOpenAiMessageText(content) {
	if (typeof content === "string") {
		return content
	}

	if (!Array.isArray(content)) {
		return null
	}

	const textParts = content
		.map((item) => {
			if (typeof item === "string") {
				return item
			}

			if (!item || typeof item !== "object") {
				return ""
			}

			if (typeof item.text === "string") {
				return item.text
			}

			if (typeof item.content === "string") {
				return item.content
			}

			return ""
		})
		.filter(Boolean)

	return textParts.length > 0 ? textParts.join("\n") : null
}

export function extractResponseText(config, apiResponse) {
	const provider = resolveProviderSettings(config)

	if (provider.providerType === AI_PROVIDERS.GEMINI) {
		return apiResponse?.candidates?.[0]?.content?.parts?.[0]?.text ?? null
	}

	const choice = apiResponse?.choices?.[0]
	if (!choice) {
		return null
	}

	if (typeof choice.text === "string") {
		return choice.text
	}

	return extractOpenAiMessageText(choice.message?.content)
}

export function getResponseFinishReason(config, apiResponse) {
	const provider = resolveProviderSettings(config)
	if (provider.providerType === AI_PROVIDERS.GEMINI) {
		return apiResponse?.candidates?.[0]?.finishReason ?? null
	}
	return apiResponse?.choices?.[0]?.finish_reason ?? null
}

export function buildModelsRequest(config, apiKey) {
	const provider = resolveProviderSettings(config)

	if (provider.providerType === AI_PROVIDERS.GEMINI) {
		return {
			method: "GET",
			url: `${provider.baseUrl}/models?key=${encodeURIComponent(apiKey)}`,
			headers: {},
		}
	}

	return {
		method: "GET",
		url: `${provider.baseUrl}${provider.modelsPath}`,
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
	}
}

export function parseModelIdsFromCatalogPayload(payload) {
	if (Array.isArray(payload)) {
		return Array.from(new Set(payload.filter((entry) => typeof entry === "string" && entry.trim()))).map((entry) =>
			entry.trim(),
		)
	}

	if (!payload || typeof payload !== "object") {
		return []
	}

	if (Array.isArray(payload.data)) {
		return Array.from(
			new Set(
				payload.data
					.map((entry) => (entry && typeof entry === "object" ? entry.id : null))
					.filter((entry) => typeof entry === "string" && entry.trim())
					.map((entry) => entry.trim()),
			),
		)
	}

	if (Array.isArray(payload.models)) {
		return Array.from(
			new Set(
				payload.models
					.map((entry) => {
						if (typeof entry === "string") {
							return entry
						}

						if (!entry || typeof entry !== "object") {
							return null
						}

						return entry.id || entry.name || entry.model || null
					})
					.filter((entry) => typeof entry === "string" && entry.trim())
					.map((entry) => entry.trim()),
			),
		)
	}

	return []
}

export function parseModelsResponse(config, payload) {
	const provider = resolveProviderSettings(config)

	if (provider.providerType === AI_PROVIDERS.GEMINI) {
		return Array.isArray(payload?.models)
			? payload.models
					.filter(
						(model) =>
							Array.isArray(model?.supportedGenerationMethods) &&
							model.supportedGenerationMethods.includes("generateContent"),
					)
					.map((model) => model.name)
			: []
	}

	return parseModelIdsFromCatalogPayload(payload)
}
