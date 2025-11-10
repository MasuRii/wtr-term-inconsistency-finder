// ==UserScript==
// @name         WTR Term Inconsistency Finder v5.3.6
// @namespace    http://tampermonkey.net/
// @version      5.3.6
// @description  Finds term inconsistencies in WTR Lab chapters using Gemini AI. Supports multiple API keys with smart rotation, dynamic model fetching, and background processing.
// @author       MasuRii
// @license      MIT
// @match        https://wtr-lab.com/en/novel/*/*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wtr-lab.com
// @connect      generativelanguage.googleapis.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_registerMenuCommand
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// @supportURL   https://github.com/MasuRii/wtr-term-inconsistency-finder/issues
// @website      https://github.com/MasuRii/wtr-term-inconsistency-finder
// ==/UserScript==

