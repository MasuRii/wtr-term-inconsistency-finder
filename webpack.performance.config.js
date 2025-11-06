const path = require("path");
const { UserscriptPlugin } = require("webpack-userscript");

const { VERSION } = require('./src/version.js');

module.exports = {
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "wtr-term-inconsistency-finder.performance.user.js",
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
    // Enable performance optimizations suitable for single-file userscripts
    minimize: true,
    usedExports: true,
    sideEffects: false,
    // Disable code splitting for userscript compatibility
    splitChunks: false,
    runtimeChunk: false,
    moduleIds: "deterministic",
    chunkIds: "deterministic",
    concatenateModules: true,
    removeEmptyChunks: true,
    sideEffects: false,
  },
  plugins: [
    new UserscriptPlugin({
      headers: (vars) => ({
        name: "WTR Lab Term Inconsistency Finder",
        namespace: "http://tampermonkey.net/",
        version: vars.isDev ? `${VERSION}-perf.[buildNo]` : `${VERSION}-perf`,
        description:
          "Performance-optimized version of the WTR Lab Term Inconsistency Finder. Finds term inconsistencies in WTR Lab chapters using Gemini AI with enhanced performance optimizations including tree shaking, minification, and code splitting.",
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
        updateURL:
          "https://raw.githubusercontent.com/MasuRii/wtr-term-inconsistency-finder/main/dist/wtr-term-inconsistency-finder.performance.user.js",
        downloadURL:
          "https://raw.githubusercontent.com/MasuRii/wtr-term-inconsistency-finder/main/dist/wtr-term-inconsistency-finder.performance.user.js",
        supportURL:
          "https://github.com/MasuRii/wtr-term-inconsistency-finder/issues",
        website: "https://github.com/MasuRii/wtr-term-inconsistency-finder",
      }),
      proxyScript: {
        baseUrl: "http://127.0.0.1:8080/",
        filename: "[basename].proxy.user.js",
        enable: true,
      },
    }),
  ],
};
