// config/versions.ts
// Centralized version management for WTR Term Inconsistency Finder

import pkg from "../package.json"

export interface VersionInfo {
	SEMANTIC: string
	DISPLAY: string
	BUILD_ENV: string
	BUILD_DATE: string
	GREASYFORK: string
	NPM: string
	BADGE: string
	CHANGELOG: string
}

// Environment variable overrides with fallbacks
const envVersion = process.env.WTR_VERSION || process.env.APP_VERSION
const buildEnv = process.env.WTR_BUILD_ENV || process.env.BUILD_ENV || process.env.NODE_ENV
const buildDate = process.env.WTR_BUILD_DATE || process.env.BUILD_DATE || new Date().toISOString().split("T")[0]

// Derive base version from package.json at runtime so only package.json is edited manually
const BASE_VERSION = pkg.version

export const VERSION_INFO: VersionInfo = {
	SEMANTIC: envVersion || BASE_VERSION,
	DISPLAY: `v${envVersion || BASE_VERSION}`,
	BUILD_ENV: buildEnv || "production",
	BUILD_DATE: buildDate,
	GREASYFORK: envVersion || BASE_VERSION,
	NPM: envVersion || BASE_VERSION,
	BADGE: envVersion || BASE_VERSION,
	CHANGELOG: envVersion || BASE_VERSION,
}

export const getVersion = (type = "semantic"): string => {
	switch (type.toLowerCase()) {
		case "semantic":
		case "semver":
			return VERSION_INFO.SEMANTIC
		case "display":
			return VERSION_INFO.DISPLAY
		case "build":
			return `${VERSION_INFO.SEMANTIC}-${VERSION_INFO.BUILD_ENV}`
		case "dev":
			return `${VERSION_INFO.SEMANTIC}-dev.${Date.now()}`
		default:
			return VERSION_INFO.SEMANTIC
	}
}

export const getBuildTime = (): string => new Date().toISOString()
export const getBuildDate = (): string => VERSION_INFO.BUILD_DATE
export const isProduction = (): boolean => VERSION_INFO.BUILD_ENV === "production"
export const isDevelopment = (): boolean => VERSION_INFO.BUILD_ENV === "development"
