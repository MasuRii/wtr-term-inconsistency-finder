const path = require("path");
const { UserscriptPlugin } = require("webpack-userscript");

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "wtr-term-inconsistency-finder.user.js",
    publicPath: "http://localhost:8080/",
  },
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
    // Disable minification for Greasy Fork compliance
    minimize: false,
  },
  plugins: [
    new UserscriptPlugin({
      headers: (vars) => ({
        name: "WTR Lab Term Inconsistency Finder",
        namespace: "http://tampermonkey.net/",
        version: vars.isDev ? `5.3.1-build.[buildNo]` : "5.3.1",
        description: "Finds term inconsistencies in WTR Lab chapters using Gemini AI. Supports multiple API keys with smart rotation, dynamic model fetching, and background processing. Includes session persistence, auto-restore results with continuation support, and configuration management. Enhanced with author note exclusion, improved alias detection, and streamlined UI.",
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
        // Updated repository links
        "updateURL": "https://raw.githubusercontent.com/MasuRii/wtr-term-inconsistency-finder/main/dist/wtr-term-inconsistency-finder.user.js",
        "downloadURL": "https://raw.githubusercontent.com/MasuRii/wtr-term-inconsistency-finder/main/dist/wtr-term-inconsistency-finder.user.js",
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