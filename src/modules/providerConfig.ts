/**
 * Provider configuration and request helpers.
 */

export const AI_PROVIDERS = Object.freeze({
	OPENAI_COMPATIBLE: "openai-compatible",
	GEMINI: "gemini",
})

export type ProviderType = (typeof AI_PROVIDERS)[keyof typeof AI_PROVIDERS]
export type ModelEndpointType = "chat" | "models"

export const DEFAULT_PROVIDER_TYPE: ProviderType = AI_PROVIDERS.OPENAI_COMPATIBLE

export interface ProviderDefaults {
	baseUrl: string
	chatCompletionsPath: string
	modelsPath: string
	modelLabel: string
	apiKeyLabel: string
}

export interface ProviderConfig {
	providerType?: string
	providerBaseUrl?: string
	providerChatCompletionsPath?: string
	providerModelsPath?: string
	providerUseManualPaths?: boolean
	model?: string
	providerModelMetadata?: ModelCatalogMetadata
}

export interface ProviderSettings {
	providerType: ProviderType
	baseUrl: string
	chatCompletionsPath: string
	modelsPath: string
	modelLabel: string
	apiKeyLabel: string
	useManualPaths: boolean
}

export interface ProviderRequestConfig {
	method: "GET" | "POST"
	url: string
	headers: Record<string, string>
	data?: string
	endpointDescription?: string
}

export interface EndpointCandidate {
	url: string
	path: string
	description: string
	isManual: boolean
}

export interface ModelCatalogEntry {
	id: string
	displayName?: string
	ownedBy?: string
	description?: string
	contextLength?: number
	maxCompletionTokens?: number
	pricing?: Record<string, unknown>
	capabilities?: Record<string, unknown>
	supportedParameters?: string[]
	latestAliasFor?: string
}

export type ModelCatalogMetadata = Record<string, ModelCatalogEntry>

export const PROVIDER_DEFAULTS: Readonly<Record<ProviderType, Readonly<ProviderDefaults>>> = Object.freeze({
	[AI_PROVIDERS.OPENAI_COMPATIBLE]: Object.freeze({
		baseUrl: "https://api.openai.com/v1",
		chatCompletionsPath: "/chat/completions",
		modelsPath: "/models",
		modelLabel: "OpenAI-Compatible Model",
		apiKeyLabel: "[REDACTED] Keys",
	}),
	[AI_PROVIDERS.GEMINI]: Object.freeze({
		baseUrl: "https://generativelanguage.googleapis.com/v1beta",
		chatCompletionsPath: "/chat/completions",
		modelsPath: "/models",
		modelLabel: "Gemini Model",
		apiKeyLabel: "[REDACTED] API Keys",
	}),
})

const COMMON_VERSIONED_PREFIXES = ["/v1", "/api/v1", "/openai/v1", "/v1beta/openai"]
const OPENAI_STYLE_CHAT_PATH = "/chat/completions"
const OPENAI_STYLE_MODELS_PATH = "/models"
const ANALYSIS_TEMPERATURE = 1
const HIGH_REASONING_EFFORT = "high"

function ensureProviderType(providerType: unknown): ProviderType {
	return providerType === AI_PROVIDERS.GEMINI ? AI_PROVIDERS.GEMINI : AI_PROVIDERS.OPENAI_COMPATIBLE
}

export function normalizeBaseUrl(value: unknown, fallback: string): string {
	const candidate = typeof value === "string" ? value.trim() : ""
	return (candidate || fallback).replace(/\/+$/, "")
}

export function normalizeApiPath(value: unknown, fallback: string): string {
	const candidate = typeof value === "string" ? value.trim() : ""
	const normalized = candidate || fallback
	const withLeadingSlash = normalized.startsWith("/") ? normalized : `/${normalized}`
	return withLeadingSlash === "/" ? fallback : withLeadingSlash.replace(/\/+$/, "")
}

export function getProviderDefaults(providerType: unknown): Readonly<ProviderDefaults> {
	return PROVIDER_DEFAULTS[ensureProviderType(providerType)]
}

function parseUrl(value: string): URL | null {
	try {
		return new URL(value)
	} catch {
		return null
	}
}

function isDeepSeekBase(url: URL | null): boolean {
	return Boolean(url?.hostname.toLowerCase().endsWith("deepseek.com"))
}

function isOllamaBase(url: URL | null): boolean {
	const host = url?.hostname.toLowerCase() || ""
	return host === "localhost" || host === "127.0.0.1" || host.includes("ollama")
}

function isAnthropicBase(url: URL | null): boolean {
	return Boolean(url?.hostname.toLowerCase().includes("anthropic"))
}

function hasKnownOpenAiPrefix(url: URL | null): boolean {
	const path = (url?.pathname || "").replace(/\/+$/, "")
	return COMMON_VERSIONED_PREFIXES.some((prefix) => path.endsWith(prefix)) || isDeepSeekBase(url)
}

function getCompatibilityPrefix(baseUrl: string): string {
	const url = parseUrl(baseUrl)
	if (hasKnownOpenAiPrefix(url)) {
		return ""
	}
	return "/v1"
}

function deriveAutomaticPath(baseUrl: string, endpointType: ModelEndpointType): string {
	const suffix = endpointType === "chat" ? OPENAI_STYLE_CHAT_PATH : OPENAI_STYLE_MODELS_PATH
	return `${getCompatibilityPrefix(baseUrl)}${suffix}`
}

function pathMatchesAutomaticBase(baseUrl: string, path: string, endpointType: ModelEndpointType): boolean {
	return normalizeApiPath(path, "") === normalizeApiPath(deriveAutomaticPath(baseUrl, endpointType), "")
}

export function isManualPathConfig(config: ProviderConfig = {}): boolean {
	if (config.providerUseManualPaths === true) {
		return true
	}
	if (config.providerType === AI_PROVIDERS.GEMINI) {
		return false
	}
	const baseUrl = normalizeBaseUrl(config.providerBaseUrl, PROVIDER_DEFAULTS[AI_PROVIDERS.OPENAI_COMPATIBLE].baseUrl)
	const chatPath = config.providerChatCompletionsPath
	const modelsPath = config.providerModelsPath
	return Boolean(
		(chatPath && !pathMatchesAutomaticBase(baseUrl, chatPath, "chat")) ||
		(modelsPath && !pathMatchesAutomaticBase(baseUrl, modelsPath, "models")),
	)
}

export function resolveProviderSettings(config: ProviderConfig = {}): ProviderSettings {
	const providerType = ensureProviderType(config.providerType)
	const defaults = getProviderDefaults(providerType)
	const baseUrl = normalizeBaseUrl(config.providerBaseUrl, defaults.baseUrl)
	const useManualPaths = providerType === AI_PROVIDERS.OPENAI_COMPATIBLE && isManualPathConfig(config)

	return {
		providerType,
		baseUrl,
		chatCompletionsPath: useManualPaths
			? normalizeApiPath(config.providerChatCompletionsPath, defaults.chatCompletionsPath)
			: deriveAutomaticPath(baseUrl, "chat"),
		modelsPath: useManualPaths
			? normalizeApiPath(config.providerModelsPath, defaults.modelsPath)
			: deriveAutomaticPath(baseUrl, "models"),
		modelLabel: defaults.modelLabel,
		apiKeyLabel: defaults.apiKeyLabel,
		useManualPaths,
	}
}

function createEndpointCandidate(
	baseUrl: string,
	path: string,
	description: string,
	isManual: boolean,
): EndpointCandidate {
	return {
		url: `${baseUrl}${path}`,
		path,
		description,
		isManual,
	}
}

export function getOpenAiCompatibleEndpointCandidates(
	config: ProviderConfig = {},
	endpointType: ModelEndpointType,
): EndpointCandidate[] {
	const provider = resolveProviderSettings(config)
	const suffix = endpointType === "chat" ? OPENAI_STYLE_CHAT_PATH : OPENAI_STYLE_MODELS_PATH
	if (provider.providerType !== AI_PROVIDERS.OPENAI_COMPATIBLE) {
		return []
	}
	if (provider.useManualPaths) {
		const path = endpointType === "chat" ? provider.chatCompletionsPath : provider.modelsPath
		return [createEndpointCandidate(provider.baseUrl, path, "manual advanced override", true)]
	}

	const candidates = [deriveAutomaticPath(provider.baseUrl, endpointType)]
	const url = parseUrl(provider.baseUrl)
	if (!hasKnownOpenAiPrefix(url)) {
		candidates.push(`/v1${suffix}`, `/api/v1${suffix}`, `/openai/v1${suffix}`, `/v1beta/openai${suffix}`, suffix)
	}

	const seen = new Set<string>()
	return candidates
		.map((path) => normalizeApiPath(path, `${getCompatibilityPrefix(provider.baseUrl)}${suffix}`))
		.filter((path) => {
			const key = `${provider.baseUrl}${path}`
			if (seen.has(key)) {
				return false
			}
			seen.add(key)
			return true
		})
		.map((path, index) =>
			createEndpointCandidate(
				provider.baseUrl,
				path,
				index === 0 ? "automatic provider path" : "fallback probe path",
				false,
			),
		)
}

export function providerUsesStreaming(config: ProviderConfig): boolean {
	const provider = resolveProviderSettings(config)
	return provider.providerType === AI_PROVIDERS.OPENAI_COMPATIBLE
}

function getConfiguredModelMetadata(config: ProviderConfig): ModelCatalogEntry | null {
	const modelId = typeof config.model === "string" ? config.model : ""
	if (!modelId || !config.providerModelMetadata) {
		return null
	}

	return (
		config.providerModelMetadata[modelId] || config.providerModelMetadata[modelId.replace(/^models\//, "")] || null
	)
}

function getSupportedParameters(metadata: ModelCatalogEntry | null): Set<string> | null {
	if (!metadata || !Array.isArray(metadata.supportedParameters) || metadata.supportedParameters.length === 0) {
		return null
	}

	return new Set(metadata.supportedParameters.map((parameter) => parameter.toLowerCase()))
}

function supportsOpenAiParameter(metadata: ModelCatalogEntry | null, parameter: string): boolean | null {
	const supportedParameters = getSupportedParameters(metadata)
	return supportedParameters ? supportedParameters.has(parameter.toLowerCase()) : null
}

function modelSupportsTemperature(metadata: ModelCatalogEntry | null): boolean {
	if (metadata?.capabilities?.temperature === false) {
		return false
	}

	return supportsOpenAiParameter(metadata, "temperature") !== false
}

function metadataSupportsReasoningEffort(metadata: ModelCatalogEntry | null): boolean {
	return metadata?.capabilities?.reasoning === true || supportsOpenAiParameter(metadata, "reasoning_effort") === true
}

function metadataRejectsReasoningEffort(metadata: ModelCatalogEntry | null): boolean {
	return metadata?.capabilities?.reasoning === false || supportsOpenAiParameter(metadata, "reasoning_effort") === false
}

function modelSupportsReasoningEffort(model: unknown, metadata: ModelCatalogEntry | null = null): boolean {
	if (metadataSupportsReasoningEffort(metadata)) {
		return true
	}
	if (metadataRejectsReasoningEffort(metadata)) {
		return false
	}

	const modelId = typeof model === "string" ? model.toLowerCase() : ""
	return /(^|[-_/])(o1|o3|o4|gpt-5|r1|qwq|qwen3|reasoning|codex)([-_/]|$)/i.test(modelId)
}

function modelSupportsGeminiThinking(model: unknown): boolean {
	const modelId = typeof model === "string" ? model.toLowerCase() : ""
	return modelId.includes("gemini-2.5") || modelId.includes("thinking")
}

function highGeminiThinkingBudget(model: unknown): number {
	const modelId = typeof model === "string" ? model.toLowerCase() : ""
	if (modelId.includes("gemini-2.5-pro")) {
		return 32768
	}
	if (modelId.includes("gemini-2.5-flash")) {
		return 24576
	}
	return 8192
}

function buildGeminiGenerationConfig(config: ProviderConfig): Record<string, unknown> {
	const generationConfig: Record<string, unknown> = {
		temperature: ANALYSIS_TEMPERATURE,
	}

	if (modelSupportsGeminiThinking(config.model)) {
		generationConfig.thinkingConfig = {
			thinkingBudget: highGeminiThinkingBudget(config.model),
		}
	}

	return generationConfig
}

function buildOpenAiCompatibleBody(config: ProviderConfig): Record<string, unknown> {
	const provider = resolveProviderSettings(config)
	const providerUrl = parseUrl(provider.baseUrl)
	const modelMetadata = getConfiguredModelMetadata(config)
	const explicitReasoningSupport = metadataSupportsReasoningEffort(modelMetadata)
	const explicitReasoningRejection = metadataRejectsReasoningEffort(modelMetadata)
	const supportsReasoning =
		!explicitReasoningRejection &&
		(explicitReasoningSupport ||
			(!isAnthropicBase(providerUrl) &&
				(modelSupportsReasoningEffort(config.model, modelMetadata) || isOllamaBase(providerUrl))))
	const body: Record<string, unknown> = {
		model: config.model,
		stream: true,
		messages: [],
	}

	if (modelSupportsTemperature(modelMetadata) && !supportsReasoning) {
		body.temperature = ANALYSIS_TEMPERATURE
	}

	if (supportsReasoning) {
		body.reasoning_effort = HIGH_REASONING_EFFORT
		if (isOllamaBase(providerUrl)) {
			body.reasoning = { effort: HIGH_REASONING_EFFORT }
		}
	}

	return body
}

export function buildAnalysisRequest(config: ProviderConfig, apiKey: string, prompt: string): ProviderRequestConfig {
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
				generationConfig: buildGeminiGenerationConfig(config),
			}),
		}
	}

	const body = buildOpenAiCompatibleBody(config)
	body.messages = [{ role: "user", content: prompt }]

	return {
		method: "POST",
		url: `${provider.baseUrl}${provider.chatCompletionsPath}`,
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		data: JSON.stringify(body),
		endpointDescription: provider.useManualPaths ? "manual advanced override" : "automatic provider path",
	}
}

function extractOpenAiMessageText(content: unknown): string | null {
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

			const record = item as Record<string, unknown>
			if (typeof record.text === "string") {
				return record.text
			}

			if (typeof record.content === "string") {
				return record.content
			}

			return ""
		})
		.filter(Boolean)

	return textParts.length > 0 ? textParts.join("\n") : null
}

function getRecord(value: unknown): Record<string, unknown> | null {
	return value && typeof value === "object" ? (value as Record<string, unknown>) : null
}

function getFirstArrayRecord(value: unknown): Record<string, unknown> | null {
	return Array.isArray(value) ? getRecord(value[0]) : null
}

function extractOpenAiDeltaText(delta: unknown): string | null {
	return extractOpenAiMessageText(getRecord(delta)?.content)
}

function consumeOpenAiStreamLine(streamState: Record<string, unknown>, line: unknown): void {
	const trimmedLine = typeof line === "string" ? line.trim() : ""
	if (!trimmedLine || trimmedLine.startsWith(":")) {
		return
	}

	if (!trimmedLine.startsWith("data:")) {
		return
	}

	const payloadText = trimmedLine.slice(5).trim()
	if (!payloadText) {
		return
	}

	if (payloadText === "[DONE]") {
		streamState.done = true
		return
	}

	let payload: unknown
	try {
		payload = JSON.parse(payloadText)
	} catch {
		return
	}

	streamState.eventCount = Number(streamState.eventCount || 0) + 1

	const payloadRecord = getRecord(payload)
	if (payloadRecord?.error) {
		streamState.errorPayload = payload
		return
	}

	const choice = getFirstArrayRecord(payloadRecord?.choices)
	const deltaText = extractOpenAiDeltaText(choice?.delta)
	if (deltaText) {
		streamState.text = `${String(streamState.text || "")}${deltaText}`
	}

	if (choice?.finish_reason) {
		streamState.finishReason = choice.finish_reason
	}
}

export function createOpenAiStreamState(): Record<string, unknown> {
	return {
		processedLength: 0,
		pendingLine: "",
		text: "",
		finishReason: null,
		done: false,
		eventCount: 0,
		errorPayload: null,
	}
}

export function consumeOpenAiStreamResponse(
	streamState: Record<string, unknown>,
	responseText: unknown,
): Record<string, unknown> {
	if (!streamState || typeof responseText !== "string" || responseText.length === 0) {
		return streamState
	}

	const processedLength = Number(streamState.processedLength || 0)
	const nextChunk = responseText.slice(processedLength)
	if (!nextChunk) {
		return streamState
	}

	streamState.processedLength = responseText.length
	const bufferedChunk = `${String(streamState.pendingLine || "")}${nextChunk}`
	const lines = bufferedChunk.split(/\r?\n/)
	streamState.pendingLine = lines.pop() || ""
	lines.forEach((line) => consumeOpenAiStreamLine(streamState, line))
	return streamState
}

export function finalizeOpenAiStreamResponse(
	streamState: Record<string, unknown>,
	responseText: unknown,
): Record<string, unknown> {
	if (!streamState) {
		return {
			isStreamResponse: false,
			text: null,
			finishReason: null,
			errorPayload: null,
		}
	}

	consumeOpenAiStreamResponse(streamState, responseText)

	if (String(streamState.pendingLine || "").trim()) {
		consumeOpenAiStreamLine(streamState, streamState.pendingLine)
		streamState.pendingLine = ""
	}

	return {
		isStreamResponse: Number(streamState.eventCount || 0) > 0 || Boolean(streamState.done),
		text: streamState.text || null,
		finishReason: streamState.finishReason || null,
		errorPayload: streamState.errorPayload,
	}
}

export function extractResponseText(config: ProviderConfig, apiResponse: unknown): string | null {
	const provider = resolveProviderSettings(config)
	const response = getRecord(apiResponse)

	if (provider.providerType === AI_PROVIDERS.GEMINI) {
		const candidate = getFirstArrayRecord(response?.candidates)
		const content = getRecord(candidate?.content)
		const part = getFirstArrayRecord(content?.parts)
		return typeof part?.text === "string" ? part.text : null
	}

	const choice = getFirstArrayRecord(response?.choices)
	if (!choice) {
		return null
	}

	if (typeof choice.text === "string") {
		return choice.text
	}

	return extractOpenAiMessageText(getRecord(choice.message)?.content)
}

export function getResponseFinishReason(config: ProviderConfig, apiResponse: unknown): unknown {
	const provider = resolveProviderSettings(config)
	const response = getRecord(apiResponse)
	if (provider.providerType === AI_PROVIDERS.GEMINI) {
		return getFirstArrayRecord(response?.candidates)?.finishReason ?? null
	}
	return getFirstArrayRecord(response?.choices)?.finish_reason ?? null
}

export function buildModelsRequest(config: ProviderConfig, apiKey: string): ProviderRequestConfig {
	const provider = resolveProviderSettings(config)

	if (provider.providerType === AI_PROVIDERS.GEMINI) {
		return {
			method: "GET",
			url: `${provider.baseUrl}/models?key=${encodeURIComponent(apiKey)}`,
			headers: {},
		}
	}

	const candidate = getOpenAiCompatibleEndpointCandidates(config, "models")[0]
	return {
		method: "GET",
		url: candidate.url,
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
		endpointDescription: candidate.description,
	}
}

export function buildModelsRequests(config: ProviderConfig, apiKey: string): ProviderRequestConfig[] {
	const provider = resolveProviderSettings(config)
	if (provider.providerType === AI_PROVIDERS.GEMINI) {
		return [buildModelsRequest(config, apiKey)]
	}

	return getOpenAiCompatibleEndpointCandidates(config, "models").map((candidate) => ({
		method: "GET",
		url: candidate.url,
		headers: {
			Authorization: `Bearer ${apiKey}`,
		},
		endpointDescription: candidate.description,
	}))
}

function toFiniteNumber(value: unknown): number | undefined {
	const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10)
	return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function normalizeSupportedParameters(value: unknown): string[] | undefined {
	if (!Array.isArray(value)) {
		return undefined
	}

	const parameters = Array.from(
		new Set(value.filter((entry): entry is string => typeof entry === "string" && Boolean(entry.trim()))),
	).map((entry) => entry.trim())
	return parameters.length > 0 ? parameters : undefined
}

function modelCatalogEntryFromValue(value: unknown): ModelCatalogEntry | null {
	if (typeof value === "string") {
		const id = value.trim()
		return id ? { id } : null
	}

	const record = getRecord(value)
	const rawId = record?.id || record?.name || record?.model
	if (typeof rawId !== "string" || !rawId.trim()) {
		return null
	}

	const contextLength =
		toFiniteNumber(record.context_length) ||
		toFiniteNumber(record.context_window) ||
		toFiniteNumber(record.max_context_tokens) ||
		toFiniteNumber(record.max_input_tokens) ||
		toFiniteNumber(record.maxInputTokens) ||
		toFiniteNumber(record.inputTokenLimit) ||
		toFiniteNumber(record.input_token_limit) ||
		toFiniteNumber(getRecord(record.limits)?.context_window)
	const maxCompletionTokens =
		toFiniteNumber(record.max_completion_tokens) ||
		toFiniteNumber(record.max_output_tokens) ||
		toFiniteNumber(record.maxOutputTokens) ||
		toFiniteNumber(record.outputTokenLimit) ||
		toFiniteNumber(record.output_token_limit) ||
		toFiniteNumber(getRecord(record.limits)?.max_output)

	return {
		id: rawId.trim(),
		displayName:
			typeof record.display_name === "string"
				? record.display_name
				: typeof record.displayName === "string"
					? record.displayName
					: undefined,
		ownedBy: typeof record.owned_by === "string" ? record.owned_by : undefined,
		description: typeof record.description === "string" ? record.description : undefined,
		contextLength,
		maxCompletionTokens,
		pricing: getRecord(record.pricing) || undefined,
		capabilities: getRecord(record.capabilities) || undefined,
		supportedParameters: normalizeSupportedParameters(record.supported_parameters),
		latestAliasFor: typeof record.latest_alias_for === "string" ? record.latest_alias_for : undefined,
	}
}

export function parseModelCatalogEntries(payload: unknown): ModelCatalogEntry[] {
	let source: unknown[] = []

	if (Array.isArray(payload)) {
		source = payload
	} else {
		const record = getRecord(payload)
		if (Array.isArray(record?.data)) {
			source = record.data
		} else if (Array.isArray(record?.models)) {
			source = record.models
		}
	}

	const entriesById = new Map<string, ModelCatalogEntry>()
	source.forEach((entry) => {
		const normalizedEntry = modelCatalogEntryFromValue(entry)
		if (normalizedEntry) {
			entriesById.set(normalizedEntry.id, normalizedEntry)
		}
	})

	return Array.from(entriesById.values())
}

export function buildModelCatalogMetadata(entries: ModelCatalogEntry[]): ModelCatalogMetadata {
	return entries.reduce<ModelCatalogMetadata>((metadata, entry) => {
		metadata[entry.id] = entry
		return metadata
	}, {})
}

export function parseModelIdsFromCatalogPayload(payload: unknown): string[] {
	return parseModelCatalogEntries(payload).map((entry) => entry.id)
}

export function parseModelsResponse(config: ProviderConfig, payload: unknown): string[] {
	const provider = resolveProviderSettings(config)
	const response = getRecord(payload)

	if (provider.providerType === AI_PROVIDERS.GEMINI) {
		return Array.isArray(response?.models)
			? response.models
					.filter((model) => {
						const modelRecord = getRecord(model)
						return (
							Array.isArray(modelRecord?.supportedGenerationMethods) &&
							modelRecord.supportedGenerationMethods.includes("generateContent")
						)
					})
					.map((model) => getRecord(model)?.name)
					.filter((model): model is string => typeof model === "string")
			: []
	}

	return parseModelIdsFromCatalogPayload(payload)
}
