const path = require("path");
const { UserscriptPlugin } = require("webpack-userscript");

const { VERSION } = require('./src/version.js');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "wtr-term-inconsistency-finder.greasyfork.user.js",
    publicPath: "http://localhost:8080/",
  },
  mode: "production",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
    ],
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
    },
    port: 8080,
    hot: true,
    liveReload: false,
  },
  optimization: {
    // Disable minification for GreasyFork compliance
    minimize: false,
    // Keep module structure for readability
    usedExports: false,
    sideEffects: false,
    splitChunks: false, // Disable code splitting for single-file userscript
    // Keep original module IDs for readability
    moduleIds: 'named',
    chunkIds: 'named',
    concatenateModules: false,
    removeEmptyChunks: true,
  },
  plugins: [
    new UserscriptPlugin({
      headers: (vars) => ({
        name: "WTR Lab Term Inconsistency Finder",
        namespace: "http://tampermonkey.net/",
        version: vars.isDev ? `${VERSION}-greasyfork.[buildNo]` : `${VERSION}-greasyfork`,
        description: "Finds term inconsistencies in WTR Lab chapters using Gemini AI. Supports multiple API keys with smart rotation, dynamic model fetching, and background processing. Includes session persistence, auto-restore results with continuation support, and configuration management. Enhanced with author note exclusion, improved alias detection, and streamlined UI. GreasyFork compliant version.",
        author: "MasuRii",
        license: "MIT",
        match: "https://wtr-lab.com/en/novel/*/*/*",
        icon: "https://www.google.com/s2/favicons?sz=64&domain=wtr-lab.com",
        connect: "generativelanguage.googleapis.com",
        grant: [
          "GM_setValue",
          "GM_getValue",
          "GM_addStyle",
          "GM_registerMenuCommand",
          "GM_xmlhttpRequest",
        ],
        "run-at": "document-idle",
        "updateURL": "https://raw.githubusercontent.com/MasuRii/wtr-term-inconsistency-finder/main/dist/wtr-term-inconsistency-finder.greasyfork.user.js",
        "downloadURL": "https://raw.githubusercontent.com/MasuRii/wtr-term-inconsistency-finder/main/dist/wtr-term-inconsistency-finder.greasyfork.user.js",
        "supportURL": "https://github.com/MasuRii/wtr-term-inconsistency-finder/issues",
        "website": "https://github.com/MasuRii/wtr-term-inconsistency-finder",
      }),
      proxyScript: {
        baseUrl: "http://127.0.0.1:8080/",
        filename: "[basename].proxy.user.js",
        enable: true,
      },
    }),
  ],
};