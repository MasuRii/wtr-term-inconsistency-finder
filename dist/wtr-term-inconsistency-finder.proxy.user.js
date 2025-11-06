// ==UserScript==
// @name WTR Lab Term Inconsistency Finder
// @description Finds term inconsistencies in WTR Lab chapters using Gemini AI. Supports multiple API keys with smart rotation, dynamic model fetching, and background processing. Includes session persistence, auto-restore results with continuation support, and configuration management. Enhanced with author note exclusion, improved alias detection, and streamlined UI.
// @version 5.3.1
// @author MasuRii
// @supportURL https://github.com/MasuRii/wtr-term-inconsistency-finder/issues
// @match https://wtr-lab.com/en/novel/*/*/*
// @connect generativelanguage.googleapis.com
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_addStyle
// @grant GM_registerMenuCommand
// @grant GM_xmlhttpRequest
// @icon https://www.google.com/s2/favicons?sz=64&domain=wtr-lab.com
// @license MIT
// @namespace http://tampermonkey.net/
// @require http://localhost:8080/wtr-term-inconsistency-finder.user.js
// @run-at document-idle
// @website https://github.com/MasuRii/wtr-term-inconsistency-finder
// ==/UserScript==
