// ==UserScript==
// @name WTR Lab Term Inconsistency Finder [DEV]
// @description Finds term inconsistencies in WTR Lab chapters using Gemini and OpenAI-compatible AI providers. Supports multiple API keys with smart rotation, dynamic model fetching, and background processing.
// @version 5.6.0-dev.1777739767397
// @author MasuRii
// @supportURL https://github.com/MasuRii/wtr-term-inconsistency-finder/issues
// @match https://wtr-lab.com/en/novel/*/*/*
// @connect *
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_addStyle
// @grant GM_registerMenuCommand
// @grant GM_xmlhttpRequest
// @grant GM.setValue
// @grant GM.getValue
// @grant GM.registerMenuCommand
// @grant GM.xmlHttpRequest
// @icon https://www.google.com/s2/favicons?sz=64&domain=wtr-lab.com
// @license MIT
// @namespace https://github.com/MasuRii/wtr-term-inconsistency-finder
// @require http://localhost:8080/wtr-lab-term-inconsistency-finder.dev.user.js
// @run-at document-idle
// @website https://github.com/MasuRii/wtr-term-inconsistency-finder
// ==/UserScript==
