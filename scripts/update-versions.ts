#!/usr/bin/env node
// scripts/update-versions.ts
// Automated version synchronization for WTR Term Inconsistency Finder

import fs from "node:fs"
import path from "node:path"
import { VERSION_INFO } from "../config/versions"

interface ReplacementPattern {
	search: RegExp
	replace: string
}

interface FileUpdate {
	file: string
	patterns: ReplacementPattern[]
}

// Files to update with version information
const FILES_TO_UPDATE: FileUpdate[] = [
	{
		file: "package.json",
		patterns: [{ search: /"version":\s*"[^"]*"/g, replace: `"version": "${VERSION_INFO.NPM}"` }],
	},
	{
		file: "README.md",
		patterns: [
			{
				search: /!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-[^)]+\)/g,
				replace: `![Version](https://img.shields.io/badge/version-${VERSION_INFO.BADGE}-blue)`,
			},
		],
	},
	{
		file: "src/version.ts",
		patterns: [
			{ search: /SEMANTIC:\s*"[^"]*"/g, replace: `SEMANTIC: "${VERSION_INFO.SEMANTIC}"` },
			{ search: /DISPLAY:\s*"[^"]*"/g, replace: `DISPLAY: "v${VERSION_INFO.SEMANTIC}"` },
			{ search: /BUILD_DATE:\s*"[^"]*"/g, replace: `BUILD_DATE: "${VERSION_INFO.BUILD_DATE}"` },
			{ search: /GREASYFORK:\s*"[^"]*"/g, replace: `GREASYFORK: "${VERSION_INFO.GREASYFORK}"` },
			{ search: /NPM:\s*"[^"]*"/g, replace: `NPM: "${VERSION_INFO.NPM}"` },
			{ search: /BADGE:\s*"[^"]*"/g, replace: `BADGE: "${VERSION_INFO.BADGE}"` },
			{ search: /CHANGELOG:\s*"[^"]*"/g, replace: `CHANGELOG: "${VERSION_INFO.CHANGELOG}"` },
		],
	},
]

const command = process.argv[2] || "update"

const getErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error))

/**
 * Safely update a file using explicit patterns.
 * Returns:
 * - true if any changes were written
 * - false if no changes were needed
 * - throws on hard failure (I/O or unexpected error)
 */
function updateFile(filePath: string, patterns: ReplacementPattern[]): boolean {
	if (!fs.existsSync(filePath)) {
		console.log(`⚠️  File not found: ${filePath}`)
		return false
	}

	try {
		const content = fs.readFileSync(filePath, "utf8")
		let updatedContent = content
		let hasChanges = false

		patterns.forEach(({ search, replace }) => {
			if (search.test(updatedContent)) {
				updatedContent = updatedContent.replace(search, replace)
				hasChanges = true
			}
		})

		if (hasChanges) {
			fs.writeFileSync(filePath, updatedContent, "utf8")
			console.log(`✅ Updated ${filePath}`)
			return true
		}

		console.log(`ℹ️  No changes needed for ${filePath}`)
		return false
	} catch (error) {
		// Treat as hard failure so build can surface the problem
		console.error(`❌ Error updating ${filePath}:`, getErrorMessage(error))
		throw error
	}
}

function generateBanner(): string {
	const banner = `/**
 * WTR Term Inconsistency Finder v${VERSION_INFO.SEMANTIC}
 * Built: ${VERSION_INFO.BUILD_DATE} (${VERSION_INFO.BUILD_ENV})
 *
 * A powerful userscript to find term inconsistencies in WTR Lab chapters
 * using Gemini and OpenAI-compatible AI providers with smart rotation and background processing.
 *
 * @version ${VERSION_INFO.SEMANTIC}
 * @build ${VERSION_INFO.BUILD_ENV}
 * @date ${VERSION_INFO.BUILD_DATE}
 */
`

	const bannerPath = path.join(__dirname, "../src/banner.ts")
	fs.writeFileSync(bannerPath, banner, "utf8")
	console.log(`📝 Generated build banner: ${bannerPath}`)
	return bannerPath
}

function generateHeader(): string {
	const header = `// ==UserScript==
// @name         WTR Term Inconsistency Finder v${VERSION_INFO.SEMANTIC}
// @namespace    https://github.com/MasuRii/wtr-term-inconsistency-finder
// @version      ${VERSION_INFO.SEMANTIC}
// @description  Finds term inconsistencies in WTR Lab chapters using Gemini and OpenAI-compatible AI providers. Supports multiple API keys with smart rotation, dynamic model fetching, and background processing.
// @author       MasuRii
// @license      MIT
// @match        https://wtr-lab.com/en/novel/*/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wtr-lab.com
// @connect      *
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.registerMenuCommand
// @grant        GM.xmlHttpRequest
// @run-at       document-idle
// @supportURL   https://github.com/MasuRii/wtr-term-inconsistency-finder/issues
// @website      https://github.com/MasuRii/wtr-term-inconsistency-finder
// ==/UserScript==
`

	const headerPath = path.join(__dirname, "../src/header.ts")
	fs.writeFileSync(headerPath, header, "utf8")
	console.log(`📋 Generated script header: ${headerPath}`)
	return headerPath
}

function checkVersion(): void {
	console.log("📋 Current Version Information:")
	console.log(`   Semantic Version: ${VERSION_INFO.SEMANTIC}`)
	console.log(`   Display Version: ${VERSION_INFO.DISPLAY}`)
	console.log(`   Build Environment: ${VERSION_INFO.BUILD_ENV}`)
	console.log(`   Build Date: ${VERSION_INFO.BUILD_DATE}`)
	console.log(`   GreasyFork Version: ${VERSION_INFO.GREASYFORK}`)
	console.log(`   NPM Version: ${VERSION_INFO.NPM}`)
	console.log(`   Badge Version: ${VERSION_INFO.BADGE}`)
	console.log(`   Changelog Version: ${VERSION_INFO.CHANGELOG}`)
}

// Main execution
console.log("🔄 WTR Term Inconsistency Finder - Version Management")
console.log("=".repeat(55))

switch (command) {
	case "update": {
		console.log("🔄 Updating versioned files...")

		let updatedFiles = 0
		let hadHardFailure = false

		// 1) Update all configured files (package.json, README, etc.)
		FILES_TO_UPDATE.forEach(({ file, patterns }) => {
			const filePath = path.join(__dirname, "..", file)
			try {
				if (updateFile(filePath, patterns)) {
					updatedFiles++
				}
			} catch {
				hadHardFailure = true
			}
		})

		// 2) Generate banner and header directly from VERSION_INFO
		try {
			generateBanner()
			updatedFiles++
		} catch (error) {
			console.error("❌ Failed to generate banner.ts:", getErrorMessage(error))
			hadHardFailure = true
		}

		try {
			generateHeader()
			updatedFiles++
		} catch (error) {
			console.error("❌ Failed to generate header.ts:", getErrorMessage(error))
			hadHardFailure = true
		}

		if (hadHardFailure) {
			console.error("❌ Version update failed. Build aborted due to version sync errors.")
			process.exit(1)
		}

		console.log(`✅ Completed! Updated ${updatedFiles} items (including banner.ts and header.ts).`)
		break
	}

	case "check":
	case "version":
		checkVersion()
		break

	case "banner":
		try {
			generateBanner()
		} catch (error) {
			console.error("❌ Failed to generate banner.ts:", getErrorMessage(error))
			process.exit(1)
		}
		break

	case "header":
		try {
			generateHeader()
		} catch (error) {
			console.error("❌ Failed to generate header.ts:", getErrorMessage(error))
			process.exit(1)
		}
		break

	default:
		console.log("❓ Unknown command:", command)
		console.log("📖 Available commands:")
		console.log("   update  - Update all versioned files (default)")
		console.log("   check   - Display current version information")
		console.log("   version - Alias for check (backward compatible)")
		console.log("   banner  - Generate build banner only")
		console.log("   header  - Generate script header only")
		process.exit(1)
}

// Success exit
process.exit(0)
