// webpack.config.ts
// Multi-build configuration for WTR Term Inconsistency Finder

import path from "node:path"
import type { Configuration, RuleSetRule } from "webpack"
import { UserscriptPlugin, type HeadersProps } from "webpack-userscript"
import "webpack-dev-server"

import pkg from "./package.json"
import { getVersion } from "./config/versions"

const COMMON_META = {
	description: pkg.description,
	author: pkg.author,
	license: pkg.license,
	namespace: "http://tampermonkey.net/",
	match: "https://wtr-lab.com/en/novel/*/*/*",
	icon: "https://www.google.com/s2/favicons?sz=64&domain=wtr-lab.com",
	connect: "*",
	grant: ["GM_setValue", "GM_getValue", "GM_addStyle", "GM_registerMenuCommand", "GM_xmlhttpRequest"],
	"run-at": "document-idle",
	supportURL: "https://github.com/MasuRii/wtr-term-inconsistency-finder/issues",
	website: "https://github.com/MasuRii/wtr-term-inconsistency-finder",
} satisfies HeadersProps

const SCRIPT_NAME = "WTR Lab Term Inconsistency Finder"
const PACKAGE_NAME = pkg.name

const typeScriptRule = (): RuleSetRule => ({
	test: /\.ts$/,
	use: {
		loader: "ts-loader",
		options: {
			transpileOnly: true,
			compilerOptions: { noEmit: false },
		},
	},
	exclude: /node_modules/,
})

const cssRule = (): RuleSetRule => ({
	test: /\.css$/,
	use: ["style-loader", "css-loader"],
})

const performanceConfig: Configuration = {
	name: "performance",
	mode: "production",
	entry: "./src/index.ts",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: `${PACKAGE_NAME}.user.js`,
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	module: {
		rules: [typeScriptRule(), cssRule()],
	},
	optimization: {
		minimize: true,
		usedExports: true,
		concatenateModules: true,
		splitChunks: {
			chunks: "all",
		},
	},
	plugins: [
		new UserscriptPlugin({
			headers: {
				...COMMON_META,
				name: SCRIPT_NAME,
				version: getVersion("semantic"),
				downloadURL: `https://raw.githubusercontent.com/MasuRii/wtr-term-inconsistency-finder/main/dist/${PACKAGE_NAME}.user.js`,
				updateURL: `https://raw.githubusercontent.com/MasuRii/wtr-term-inconsistency-finder/main/dist/${PACKAGE_NAME}.user.js`,
			},
		}),
	],
}

const greasyforkConfig: Configuration = {
	name: "greasyfork",
	mode: "production",
	entry: "./src/index.ts",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: `${PACKAGE_NAME}.greasyfork.user.js`,
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	module: {
		rules: [typeScriptRule(), cssRule()],
	},
	optimization: {
		minimize: false,
		usedExports: true,
		concatenateModules: true,
	},
	plugins: [
		new UserscriptPlugin({
			headers: {
				...COMMON_META,
				name: SCRIPT_NAME,
				version: getVersion("semantic"),
			},
		}),
	],
}

const devConfig: Configuration = {
	name: "dev",
	mode: "development",
	entry: "./src/index.ts",
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: `${PACKAGE_NAME}.dev.user.js`,
		publicPath: "http://localhost:8080/",
	},
	devServer: {
		static: {
			directory: path.join(__dirname, "dist"),
		},
		port: 8080,
		hot: true,
		liveReload: false,
		client: {
			webSocketURL: "ws://localhost:8080/ws",
			overlay: false,
			logging: "none",
		},
	},
	resolve: {
		extensions: [".ts", ".js"],
	},
	module: {
		rules: [typeScriptRule(), cssRule()],
	},
	optimization: {
		minimize: false,
		usedExports: true,
		splitChunks: {
			chunks: "all",
		},
	},
	plugins: [
		new UserscriptPlugin({
			headers: {
				...COMMON_META,
				name: `${SCRIPT_NAME} [DEV]`,
				version: getVersion("dev"),
			},
			proxyScript: {
				baseURL: "http://localhost:8080/",
				filename: "[basename].proxy.user.js",
			},
		}),
	],
}

export default [performanceConfig, greasyforkConfig, devConfig]
