// ==UserScript==
// @name WTR Lab Term Inconsistency Finder
// @description Finds term inconsistencies in WTR Lab chapters using Gemini and OpenAI-compatible AI providers. Supports multiple API keys with smart rotation, dynamic model fetching, and background processing.
// @version 5.5.1
// @author MasuRii
// @supportURL https://github.com/MasuRii/wtr-term-inconsistency-finder/issues
// @match https://wtr-lab.com/en/novel/*/*/*
// @connect *
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_addStyle
// @grant GM_registerMenuCommand
// @grant GM_xmlhttpRequest
// @icon https://www.google.com/s2/favicons?sz=64&domain=wtr-lab.com
// @license MIT
// @namespace http://tampermonkey.net/
// @run-at document-idle
// @website https://github.com/MasuRii/wtr-term-inconsistency-finder
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 131
(module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `.wtr-if-btn {
	border: none;
	border-radius: 4px;
	color: white;
	cursor: pointer;
	font-weight: bold;
	padding: 10px 15px;
}

.wtr-if-btn:disabled {
	cursor: not-allowed;
	opacity: 0.6;
}

.wtr-if-btn-primary {
	background-color: var(--bs-primary, #fd7e14);
}

.wtr-if-btn-secondary {
	background-color: var(--bs-secondary, #6c757d);
}

.wtr-if-btn-large {
	flex: 1;
	font-size: 16px;
	min-width: 180px;
	padding: 12px 20px;
}

.wtr-if-action-buttons {
	display: flex;
	flex-wrap: wrap;
	gap: 10px;
}

.wtr-if-apply-btn {
	background-color: var(--bs-success, #198754);
	border: none;
	border-radius: 4px;
	color: white;
	cursor: pointer;
	font-size: 12px;
	padding: 4px 10px;
	white-space: nowrap;
}

.wtr-if-apply-btn.sent {
	background-color: var(--bs-secondary, #6c757d);
}

.wtr-if-copy-variation-btn {
	background: none;
	border: none;
	cursor: pointer;
	font-size: 16px;
	line-height: 1;
	opacity: 0.7;
	padding: 2px 4px;
	transition: opacity 0.2s;
}

.wtr-if-copy-variation-btn:hover {
	opacity: 1;
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ },

/***/ 421
(module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* Form styling for configuration */
.wtr-if-form-group {
	margin-bottom: 16px;
}

.wtr-if-form-group input,
.wtr-if-form-group select {
	background-color: var(--bs-secondary-bg, #f6f7f8);
	border: 1px solid var(--bs-border-color, #dee2e6);
	border-radius: 8px;
	box-sizing: border-box;
	color: var(--bs-body-color, #212529);
	font-size: 14px;
	padding: 10px 12px;
	transition:
		border-color 0.15s ease-in-out,
		box-shadow 0.15s ease-in-out;
	width: 100%;
}

.wtr-if-model-controls select,
.wtr-if-key-row input {
	flex-grow: 1;
}

.wtr-if-key-row input:focus,
.wtr-if-form-group input:focus,
.wtr-if-form-group select:focus,
.wtr-if-tab-btn:focus-visible,
.wtr-if-close-btn:focus-visible,
.wtr-if-btn:focus-visible {
	border-color: var(--bs-primary, #fd7e14);
	box-shadow: 0 0 0 0.2rem rgb(253 126 20 / 25%);
	outline: none;
}

.wtr-if-form-group input[type="range"] {
	background: transparent;
	padding: 0;
}

.wtr-if-form-group label {
	color: var(--bs-body-color, #212529);
	display: block;
	font-size: 14px;
	font-weight: 650;
	margin-bottom: 8px;
}

.wtr-if-form-group label.checkbox-label {
	align-items: center;
	display: flex;
	font-weight: normal;
	gap: 10px;
	margin-bottom: 0;
}

.wtr-if-form-group label.checkbox-label input {
	margin: 0;
	width: auto;
}

.wtr-if-hint {
	color: var(--bs-secondary-color, #6c757d);
	display: block;
	font-size: 12px;
	font-weight: normal;
	line-height: 1.45;
	margin-top: 6px;
}

.wtr-if-form-row {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
	margin-bottom: 8px;
}

.wtr-if-form-label {
	color: var(--bs-body-color, #212529);
	font-weight: 650;
	min-width: 120px;
	white-space: nowrap;
}

.wtr-if-form-select {
	background-color: var(--bs-secondary-bg, #f6f7f8);
	border: 1px solid var(--bs-border-color, #dee2e6);
	border-radius: 8px;
	color: var(--bs-body-color, #212529);
	flex: 1;
	max-width: 100%;
	min-width: 200px;
	padding: 8px 12px;
}

.wtr-if-model-controls {
	align-items: center;
	display: flex;
	gap: 12px;
	margin-top: 8px;
}

.wtr-if-debug-log-actions {
	background: rgb(0 0 0 / 3%);
	border: 1px dashed var(--bs-border-color, #dee2e6);
	border-radius: 10px;
	margin-top: 10px;
	padding: 10px;
}

.wtr-if-debug-log-copy {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.wtr-if-debug-log-copy .wtr-if-btn {
	font-size: 12px;
	padding: 7px 10px;
}

.wtr-if-api-key-header {
	align-items: center;
	display: flex;
	gap: 10px;
	justify-content: space-between;
	margin-bottom: 8px;
}

.wtr-if-api-key-header label {
	margin-bottom: 0;
}

.wtr-if-key-visibility-btn {
	background: var(--bs-body-bg, #fff);
	border: 1px solid var(--bs-border-color, #dee2e6);
	border-radius: 999px;
	color: var(--bs-body-color, #212529);
	cursor: pointer;
	font-size: 12px;
	font-weight: 650;
	padding: 5px 10px;
	white-space: nowrap;
}

.wtr-if-key-visibility-btn:focus-visible {
	border-color: var(--bs-primary, #fd7e14);
	box-shadow: 0 0 0 0.2rem rgb(253 126 20 / 25%);
	outline: none;
}

.wtr-if-key-visibility-btn[aria-pressed="true"] {
	background: rgb(253 126 20 / 12%);
	border-color: rgb(253 126 20 / 45%);
	color: var(--bs-primary, #fd7e14);
}

.wtr-if-key-row {
	align-items: center;
	display: flex;
	gap: 8px;
	margin-bottom: 8px;
}

.wtr-if-model-controls button {
	flex-shrink: 0;
	white-space: nowrap;
}

.wtr-if-api-keys-container-wrapper {
	background-color: var(--bs-secondary-bg, #f6f7f8);
	border: 1px solid var(--bs-border-color, #dee2e6);
	border-radius: 8px;
	margin-bottom: 8px;
	max-height: 200px;
	overflow-y: auto;
	padding: 12px;
}

.wtr-if-remove-key-btn {
	background: var(--bs-danger, #dc3545);
	border: none;
	border-radius: 50%;
	color: white;
	cursor: pointer;
	flex-shrink: 0;
	font-size: 16px;
	height: 24px;
	line-height: 1;
	transition: background-color 0.15s ease-in-out;
	width: 24px;
}

.wtr-if-remove-key-btn:hover {
	background: #c82333;
}

.wtr-if-deep-analysis-controls,
.wtr-if-filter-controls,
.wtr-if-api-range-controls {
	width: 100%;
}

.wtr-if-range-grid {
	display: grid;
	gap: 12px;
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (width <= 768px) {
	.wtr-if-range-grid {
		grid-template-columns: 1fr;
	}
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ },

/***/ 784
(module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* Section layout */
.wtr-if-section {
	background-color: var(--bs-body-bg, #fff);
	border: 1px solid color-mix(in srgb, var(--bs-border-color, #dee2e6) 72%, transparent);
	border-radius: 12px;
	box-shadow: none;
	margin-bottom: 16px;
	overflow: hidden;
}

.wtr-if-section-header {
	background: transparent;
	border-bottom: 1px solid color-mix(in srgb, var(--bs-border-color, #dee2e6) 64%, transparent);
	padding: 14px 18px 8px;
}

.wtr-if-section-header h3 {
	align-items: center;
	color: var(--bs-body-color, #212529);
	display: flex;
	font-size: 16px;
	font-weight: 650;
	gap: 8px;
	margin: 0;
}

.wtr-if-icon {
	display: none;
}

.wtr-if-section-content {
	padding: 16px 18px 18px;
}

.wtr-if-finder-controls {
	display: flex;
	flex-wrap: wrap;
	gap: 12px;
}

.wtr-if-advanced-details {
	border: 1px dashed var(--bs-border-color, #dee2e6);
	border-radius: 10px;
	margin-bottom: 16px;
	padding: 10px 12px;
}

.wtr-if-advanced-details summary {
	cursor: pointer;
	font-weight: 650;
}

.wtr-if-advanced-details .wtr-if-form-group {
	margin-top: 12px;
}

@media (width <= 768px) {
	#wtr-if-panel {
		border-radius: 0;
		height: 100dvh;
		max-height: none;
		width: 100%;
	}

	.wtr-if-finder-controls,
	.wtr-if-action-buttons,
	.wtr-if-model-controls {
		flex-direction: column;
	}

	.wtr-if-btn-large,
	.wtr-if-action-buttons button,
	.wtr-if-model-controls select,
	.wtr-if-model-controls button,
	.wtr-if-import-export button,
	.wtr-if-form-select {
		min-width: auto;
		width: 100%;
	}

	.wtr-if-form-row {
		align-items: stretch;
		flex-direction: column;
	}

	.wtr-if-form-label {
		min-width: auto;
	}

	.wtr-if-section {
		border-left: none;
		border-right: none;
		border-radius: 0;
		margin-bottom: 12px;
	}

	.wtr-if-section-header h3 {
		align-items: flex-start;
		font-size: 15px;
	}

	.wtr-if-section-content {
		padding: 14px;
	}

	.wtr-if-api-keys-container-wrapper {
		max-height: 150px;
	}
}

.wtr-if-import-export {
	border-top: 1px solid var(--bs-border-color, #dee2e6);
	margin-top: 15px;
	padding-top: 15px;
}

.wtr-if-import-export h4 {
	font-size: 14px;
	font-weight: bold;
	margin-bottom: 10px;
	margin-top: 0;
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ },

/***/ 249
(module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_panel_css__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(974);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_layout_css__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(784);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_forms_css__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(421);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_buttons_css__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(131);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_results_css__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(198);
/* harmony import */ var _node_modules_css_loader_dist_cjs_js_utilities_css__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(92);
// Imports








var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_panel_css__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_layout_css__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_forms_css__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_buttons_css__WEBPACK_IMPORTED_MODULE_5__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_results_css__WEBPACK_IMPORTED_MODULE_6__/* ["default"] */ .A);
___CSS_LOADER_EXPORT___.i(_node_modules_css_loader_dist_cjs_js_utilities_css__WEBPACK_IMPORTED_MODULE_7__/* ["default"] */ .A);
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* WTR Term Inconsistency Finder - Modular CSS */

/* Import all component styles */

/* 1. Panel and core layout */

/* 2. Layout and responsive design */

/* 3. Form controls and inputs */

/* 4. Buttons and actions */

/* 5. Results display */

/* 6. Utilities, status, and indicators */
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ },

/***/ 974
(module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `@keyframes wtr-if-spin {
	0% {
		transform: rotate(0deg);
	}

	100% {
		transform: rotate(360deg);
	}
}

#wtr-if-panel {
	background-color: var(--wtr-bg, #f8f9fa);
	border: 1px solid var(--bs-border-color, #dee2e6);
	border-radius: 14px;
	box-shadow: 0 18px 48px rgb(0 0 0 / 28%);
	color: var(--bs-body-color, #212529);
	display: none;
	flex-direction: column;
	font-family: var(--bs-body-font-family, sans-serif);
	left: 50%;
	max-height: min(88vh, 900px);
	max-width: 860px;
	position: fixed;
	top: 50%;
	transform: translate(-50%, -50%);
	width: min(94vw, 860px);
	z-index: 1040;
}

.wtr-if-header {
	align-items: center;
	background-color: var(--bs-body-bg, #fff);
	border-bottom: 1px solid var(--bs-border-color, #dee2e6);
	display: flex;
	justify-content: space-between;
	padding: 14px 18px;
}

.wtr-if-title-group {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.wtr-if-header h2 {
	font-size: 18px;
	margin: 0;
}

.wtr-if-version-badge {
	background: rgb(253 126 20 / 10%);
	border: 1px solid rgb(253 126 20 / 30%);
	border-radius: 999px;
	color: var(--bs-primary, #fd7e14);
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.04em;
	line-height: 1;
	padding: 4px 8px;
	white-space: nowrap;
}

.wtr-if-close-btn {
	background: none;
	border: none;
	color: var(--bs-body-color, #212529);
	cursor: pointer;
	font-size: 24px;
	line-height: 1;
	padding: 0 4px;
}

.wtr-if-tabs {
	background-color: var(--bs-body-bg, #fff);
	border-bottom: 1px solid var(--bs-border-color, #dee2e6);
	display: flex;
	gap: 4px;
	padding: 0 12px;
}

.wtr-if-tab-btn {
	background: none;
	border: none;
	border-bottom: 3px solid transparent;
	color: var(--bs-secondary-color, #6c757d);
	cursor: pointer;
	font-size: 14px;
	padding: 10px 15px;
}

.wtr-if-tab-btn.active {
	border-bottom-color: var(--bs-primary, #fd7e14);
	color: var(--bs-body-color, #212529);
	font-weight: bold;
}

.wtr-if-content {
	flex-grow: 1;
	overflow-y: auto;
	padding: 18px;
}

.wtr-if-tab-content {
	display: none;
}

.wtr-if-tab-content.active {
	display: block;
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ },

/***/ 198
(module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* Results Display Styles */
#wtr-if-results {
	margin-top: 10px;
}

.wtr-if-result-group {
	background-color: var(--bs-body-bg, #fff);
	border: 1px solid var(--bs-border-color, #dee2e6);
	border-radius: 6px;
	margin-bottom: 16px;
}

.wtr-if-group-header {
	background-color: var(--bs-tertiary-bg, #f8f9fa);
	border-bottom: 1px solid var(--bs-border-color, #dee2e6);
	padding: 12px;
	position: relative;
}

.wtr-if-group-header h3 {
	align-items: center;
	display: flex;
	flex-wrap: wrap;
	font-size: 16px;
	gap: 8px;
	margin: 0 0 8px;
}

.wtr-if-explanation {
	font-size: 14px;
	font-style: italic;
	margin: 0;
	opacity: 0.9;
}

.wtr-if-group-actions {
	position: absolute;
	right: 12px;
	top: 12px;
}

.wtr-if-details-section {
	padding: 12px;
}

.wtr-if-details-section h4 {
	border-bottom: 1px solid var(--bs-border-color-translucent, #dee2e6);
	font-size: 14px;
	font-weight: bold;
	margin-bottom: 8px;
	margin-top: 0;
	padding-bottom: 4px;
}

.wtr-if-variations,
.wtr-if-suggestions {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.wtr-if-variation-item {
	border: 1px solid var(--bs-border-color-translucent, #dee2e6);
	border-radius: 4px;
}

.wtr-if-variation-header {
	align-items: center;
	background-color: var(--bs-secondary-bg, #e9ecef);
	display: flex;
	gap: 8px;
	justify-content: space-between;
	padding: 6px 8px;
}

.wtr-if-incorrect {
	color: var(--bs-danger-text-emphasis, #58151c);
	font-weight: bold;
}

.wtr-if-variation-header .wtr-if-incorrect {
	flex-grow: 1;
	color: var(--bs-danger-text-emphasis, #58151c);
	font-weight: bold;
}

.wtr-if-variation-checkbox {
	flex-shrink: 0;
	margin: 0;
}

.wtr-if-context {
	font-size: 13px;
	margin: 0;
	padding: 6px 8px;
}

.wtr-if-suggestion-item {
	border: 1px solid var(--bs-border-color-translucent, #dee2e6);
	border-radius: 4px;
	overflow: hidden;
}

.wtr-if-suggestion-header {
	align-items: center;
	background-color: var(--bs-success-bg-subtle, #d1e7dd);
	display: flex;
	justify-content: space-between;
	padding: 8px;
}

.wtr-if-correct {
	color: var(--bs-success-text-emphasis, #0a3622);
	font-weight: bold;
}

.wtr-if-suggestion-header .wtr-if-correct {
	flex-grow: 1;
	color: var(--bs-success-text-emphasis, #0a3622);
	font-weight: bold;
}

.wtr-if-suggestion-actions {
	display: flex;
	gap: 8px;
}

.wtr-if-replacement-info {
	background-color: var(--bs-tertiary-bg, #f8f9fa);
	border-top: 1px solid var(--bs-border-color-translucent, #dee2e6);
	font-size: 13px;
	margin: 0;
	padding: 6px 8px;
}

.wtr-if-replacement-info code {
	background-color: var(--bs-body-bg, #fff);
	border: 1px solid var(--bs-border-color, #dee2e6);
	border-radius: 4px;
	font-family: var(--bs-font-monospace, monospace);
	padding: 2px 5px;
}

.wtr-if-reasoning {
	font-size: 13px;
	margin: 0;
	padding: 6px 8px;
}

/* Base color classes for text highlighting */
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ },

/***/ 92
(module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `/* Utility and Status Styles */
.wtr-if-status {
	font-size: 14px;
	margin-top: 10px;
	text-align: center;
}

.wtr-if-session-restore {
	background-color: var(--bs-info-bg-subtle, #cff4fc);
	border: 1px solid var(--bs-info-border-subtle, #9eeaf9);
	border-radius: 4px;
	margin-bottom: 16px;
	padding: 10px;
}

.wtr-if-session-restore button {
	margin-right: 8px;
}

.wtr-if-priority {
	border-radius: 12px;
	color: white;
	font-size: 12px;
	font-weight: bold;
	padding: 3px 8px;
}

.wtr-if-priority-critical {
	background-color: var(--bs-danger, #dc3545);
}

.wtr-if-priority-high {
	background-color: var(--bs-warning, #ffc107);
	color: #000;
}

.wtr-if-priority-medium {
	background-color: var(--bs-info, #0dcaf0);
}

.wtr-if-priority-low {
	background-color: var(--bs-secondary, #6c757d);
}

.wtr-if-priority-stylistic,
.wtr-if-priority-info {
	background-color: var(--bs-light, #f8f9fa);
	border: 1px solid #ccc;
	color: #000;
}

.wtr-if-concept {
	color: var(--bs-link-color, #0d6efd);
	font-weight: bold;
}

.wtr-if-chapter {
	background-color: var(--bs-tertiary-bg, #f8f9fa);
	border-radius: 4px;
	color: var(--bs-secondary-color, #6c757d);
	font-size: 12px;
	font-weight: bold;
	padding: 3px 6px;
}

.wtr-if-error {
	background-color: var(--bs-danger-bg-subtle, #f8d7da);
	border: 1px solid var(--bs-danger, #dc3545);
	border-radius: 4px;
	color: var(--bs-danger-text-emphasis, #58151c);
	margin-bottom: 10px;
	padding: 10px;
}

.wtr-if-no-results {
	padding: 10px;
	text-align: center;
}

.wtr-if-verified-badge {
	background-color: var(--bs-success, #198754);
	border-radius: 12px;
	color: white;
	font-size: 11px;
	font-weight: bold;
	margin-left: 8px;
	padding: 3px 8px;
}

.wtr-if-review-badge {
	background-color: var(--bs-warning, #ffc107);
	border-radius: 12px;
	color: #212529;
	font-size: 11px;
	font-weight: bold;
	margin-left: 8px;
	padding: 3px 8px;
}

.wtr-if-recommended-badge {
	background-color: var(--bs-info, #0dcaf0);
	border-radius: 12px;
	color: white;
	font-size: 11px;
	font-weight: bold;
	margin-left: 8px;
	padding: 3px 8px;
	vertical-align: middle;
}

/* Status Indicator */
#wtr-if-status-indicator {
	align-items: center;
	background-color: #2c2c2e;
	border-radius: 8px;
	bottom: var(--nig-space-xl, 20px);
	box-shadow: 0 4px 8px rgb(0 0 0 / 30%);
	color: #f0f0f0;
	display: none;
	font-family: sans-serif;
	font-size: 14px;
	gap: 10px;
	left: 20px;
	padding: 10px 15px;
	position: fixed;
	transition:
		background-color 0.3s ease,
		bottom 0.3s ease;
	z-index: 10000;
}

.wtr-if-status-icon {
	align-items: center;
	display: flex;
	height: 20px;
	justify-content: center;
	width: 20px;
}

#wtr-if-status-indicator.running .wtr-if-status-icon {
	animation: wtr-if-spin 1s linear infinite;
	border: 3px solid #555;
	border-radius: 50%;
	border-top-color: #4285f4;
	box-sizing: border-box;
}

#wtr-if-status-indicator.complete {
	background-color: #4caf50;
	cursor: pointer;
}

#wtr-if-status-indicator.complete .wtr-if-status-icon::before {
	content: "✅";
}

#wtr-if-status-indicator.error {
	background-color: #f44336;
	cursor: pointer;
}

#wtr-if-status-indicator.error .wtr-if-status-icon::before {
	content: "❌";
}
`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ },

/***/ 314
(module) {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ },

/***/ 601
(module) {



module.exports = function (i) {
  return i[1];
};

/***/ },

/***/ 72
(module) {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ },

/***/ 659
(module) {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ },

/***/ 540
(module) {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ },

/***/ 56
(module, __unused_webpack_exports, __webpack_require__) {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ },

/***/ 825
(module) {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

/***/ },

/***/ 113
(module) {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ },

/***/ 598
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Nz: () => (/* reexport */ findInconsistenciesDeepAnalysis),
  Rq: () => (/* reexport */ getAvailableApiKey)
});

// UNUSED EXPORTS: ADVANCED_SYSTEM_PROMPT, BASE_BACKOFF_MS, MAX_BACKOFF_MS, MAX_RETRIES_PER_KEY, MAX_TOTAL_RETRY_DURATION_MS, RETRIABLE_STATUSES, buildDeepAnalysisPrompt, buildPrompt, calculateBackoffDelayMs, classifyApiError, createErrorResponse, createRetryHandler, createUserFriendlyErrorMessage, deprecatedHandleApiError, findInconsistencies, generatePrompt, getCooldownDuration, handleApiError, handleRateLimitError, parseApiResponse, scheduleRetriableRetry, validateApiKey

// EXTERNAL MODULE: ./src/modules/state.ts
var state = __webpack_require__(654);
// EXTERNAL MODULE: ./src/modules/utils.ts
var utils = __webpack_require__(158);
// EXTERNAL MODULE: ./src/modules/ui/index.ts
var ui = __webpack_require__(782);
;// ./src/modules/retryLogic.ts
/* unused harmony import specifier */ var log;
/* unused harmony import specifier */ var updateStatusIndicator;
/**
 * Retry Logic Module
 * Handles exponential backoff and retry scheduling for API requests
 */


// Constants for retry configuration
const MAX_RETRIES_PER_KEY = 3;
// Exponential backoff settings (per logical operation, not per key)
const BASE_BACKOFF_MS = 2000; // 2s
const MAX_BACKOFF_MS = 60000; // 60s cap
const MAX_TOTAL_RETRY_DURATION_MS = 5 * 60 * 1000; // 5 minutes safety cap per run
const RETRIABLE_STATUSES = new Set([
    "RESOURCE_EXHAUSTED", // 429 Rate limit
    "INTERNAL", // 500 Server error
    "UNAVAILABLE", // 503 Service overloaded
    "DEADLINE_EXCEEDED", // 504 Request timed out
]);
/**
 * Calculate exponential backoff delay with an upper bound.
 * retryIndex is zero-based: 0 -> BASE_BACKOFF_MS, 1 -> 2x, 2 -> 4x, etc.
 * @param {number} retryIndex - Zero-based retry attempt index
 * @returns {number} - Delay in milliseconds
 */
function calculateBackoffDelayMs(retryIndex) {
    const delay = BASE_BACKOFF_MS * Math.pow(2, retryIndex);
    return Math.min(delay, MAX_BACKOFF_MS);
}
/**
 * Schedule an immediate retriable retry with the next available key.
 * @param {Object} options - Retry options
 * @param {string} options.operationName - Name of the operation for logging
 * @param {number} options.retryCount - Current retry attempt count
 * @param {number} options.maxTotalRetries - Maximum total retries allowed
 * @param {number} options.startedAt - Timestamp when operation started
 * @param {Function} options.nextStep - Function to call immediately
 * @param {Function} [options.errorHandler] - Optional error handler function to avoid circular dependencies
 */
function scheduleRetriableRetry({ operationName, retryCount, maxTotalRetries, startedAt, nextStep, errorHandler = null, }) {
    const now = Date.now();
    // Enforce attempt-based and time-based ceilings
    if (retryCount >= maxTotalRetries) {
        const errorMessage = `${operationName} failed after ${retryCount} attempts across all keys. Please check your API keys or wait a while.`;
        if (errorHandler) {
            errorHandler(errorMessage);
        }
        else {
            console.error("Inconsistency Finder:", errorMessage);
        }
        return;
    }
    if (now - startedAt > MAX_TOTAL_RETRY_DURATION_MS) {
        const errorMessage = `${operationName} failed after repeated retries over an extended period. Please wait a while before trying again.`;
        if (errorHandler) {
            errorHandler(errorMessage);
        }
        else {
            console.error("Inconsistency Finder:", errorMessage);
        }
        return;
    }
    log(`${operationName}: Scheduling immediate retry #${retryCount + 1} with next available key.`);
    updateStatusIndicator("running", `Retrying immediately...`);
    // Ensure no uncaught exceptions propagate from the callback
    try {
        nextStep();
    }
    catch (e) {
        console.error(`Inconsistency Finder: Uncaught error during immediate retry for ${operationName}:`, e);
        const errorMessage = `${operationName} encountered an unexpected error during retry. Please try again.`;
        if (errorHandler) {
            errorHandler(errorMessage);
        }
        else {
            console.error("Inconsistency Finder:", errorMessage);
        }
    }
}
/**
 * Create a retry handler with a specific error handler to avoid circular dependencies
 * @param {Function} errorHandler - The error handler function to use
 * @returns {Function} - A retry scheduling function with the error handler bound
 */
function createRetryHandler(errorHandler) {
    return function scheduleRetriableRetryWithHandler(options) {
        return scheduleRetriableRetry({
            ...options,
            errorHandler,
        });
    };
}

;// ./src/modules/apiErrorHandler.ts
/**
 * API Error Handler Module
 * Centralizes error handling for API requests and responses
 */





/**
 * Centralized API error handling function
 * @param {string} errorMessage - The error message to handle
 */
function handleApiError(errorMessage) {
    console.error("Inconsistency Finder:", errorMessage);
    state/* appState */.XJ.runtime.cumulativeResults.push({ error: errorMessage });
    state/* appState */.XJ.runtime.isAnalysisRunning = false;
    // Reset retry-related state so future runs are clean
    state/* appState */.XJ.runtime.analysisStartedAt = null;
    if (state/* appState */.XJ.runtime.deepAnalysisStartTimes) {
        state/* appState */.XJ.runtime.deepAnalysisStartTimes = {};
    }
    (0,ui/* updateStatusIndicator */.LI)("error", "Error!");
    (0,ui/* displayResults */.Hv)(state/* appState */.XJ.runtime.cumulativeResults);
}
/**
 * Classify API error by type and status code
 * @param {Object} apiResponse - The API response object containing error information
 * @returns {Object} - Error classification information
 */
function classifyApiError(apiResponse, httpStatus = null) {
    if (!apiResponse.error) {
        return { type: "none", retriable: false };
    }
    const errorMessage = apiResponse.error.message || "";
    const errorSignals = [apiResponse.error.status, apiResponse.error.type, apiResponse.error.code, errorMessage]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    let errorStatus = apiResponse.error.status;
    if (!errorStatus) {
        if (errorSignals.includes("insufficient_quota") || errorSignals.includes("quota")) {
            errorStatus = "RESOURCE_EXHAUSTED";
        }
        else if (httpStatus === 429) {
            errorStatus = "RATE_LIMIT";
        }
        else if (httpStatus === 408 || httpStatus === 504) {
            errorStatus = "DEADLINE_EXCEEDED";
        }
        else if (httpStatus === 500 || httpStatus === 502) {
            errorStatus = "INTERNAL";
        }
        else if (httpStatus === 503) {
            errorStatus = "UNAVAILABLE";
        }
        else if (httpStatus === 401) {
            errorStatus = "UNAUTHORIZED";
        }
        else if (httpStatus === 403) {
            errorStatus = "FORBIDDEN";
        }
        else if (httpStatus) {
            errorStatus = `HTTP_${httpStatus}`;
        }
        else {
            errorStatus = "UNKNOWN";
        }
    }
    const isRetriable = RETRIABLE_STATUSES.has(errorStatus) ||
        errorStatus === "RATE_LIMIT" ||
        errorMessage.includes("The model is overloaded");
    return {
        type: errorStatus || "UNKNOWN",
        message: errorMessage,
        retriable: isRetriable,
        status: errorStatus,
    };
}
/**
 * Create standardized error response object
 * @param {string} type - Error type classification
 * @param {string} message - Error message
 * @param {boolean} retriable - Whether the error is retriable
 * @param {Object} [additionalData] - Additional error data
 * @returns {Object} - Standardized error response
 */
function createErrorResponse(type, message, retriable = false, additionalData = {}) {
    return {
        error: true,
        type,
        message,
        retriable,
        timestamp: Date.now(),
        ...additionalData,
    };
}
/**
 * Handle rate limit specific errors with cooldown management
 * @param {number} keyIndex - The API key index that hit rate limit
 * @param {Object} errorClassification - Error classification from classifyApiError
 * @param {Function} updateKeyState - Function to update key state
 */
function handleRateLimitError(keyIndex, errorClassification, updateKeyState) {
    if (errorClassification.status === "RESOURCE_EXHAUSTED") {
        // Mark key as exhausted with 24-hour cooldown (daily reset)
        const unlockTime = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        updateKeyState(keyIndex, "EXHAUSTED", unlockTime, 1);
        (0,utils/* log */.Rm)("API key marked exhausted.", {
            keyIndex,
            status: errorClassification.status,
            cooldownMs: 24 * 60 * 60 * 1000,
        });
    }
    else if (errorClassification.status === "RATE_LIMIT") {
        const unlockTime = Date.now() + 60 * 1000; // 60 seconds
        updateKeyState(keyIndex, "ON_COOLDOWN", unlockTime, 1);
        (0,utils/* log */.Rm)("API key entered cooldown.", {
            keyIndex,
            status: errorClassification.status,
            cooldownMs: 60 * 1000,
        });
    }
    else if (errorClassification.status === "UNAVAILABLE" || errorClassification.status === "INTERNAL") {
        // Temporary server issues - put on short cooldown for faster cycling
        const unlockTime = Date.now() + 5 * 1000; // 5 seconds
        updateKeyState(keyIndex, "ON_COOLDOWN", unlockTime, 1);
        (0,utils/* log */.Rm)("API key entered cooldown.", {
            keyIndex,
            status: errorClassification.status,
            cooldownMs: 5 * 1000,
        });
    }
    else if (errorClassification.status === "DEADLINE_EXCEEDED") {
        // Request timeout - brief cooldown for faster cycling
        const unlockTime = Date.now() + 2 * 1000; // 2 seconds
        updateKeyState(keyIndex, "ON_COOLDOWN", unlockTime, 1);
        (0,utils/* log */.Rm)("API key entered cooldown.", {
            keyIndex,
            status: errorClassification.status,
            cooldownMs: 2 * 1000,
        });
    }
}
/**
 * Determine appropriate cooldown duration based on error type
 * @param {Object} errorClassification - Error classification from classifyApiError
 * @returns {number} - Cooldown duration in milliseconds
 */
function getCooldownDuration(errorClassification) {
    switch (errorClassification.status) {
        case "RESOURCE_EXHAUSTED":
            return 24 * 60 * 60 * 1000; // 24 hours
        case "RATE_LIMIT":
            return 60 * 1000; // 60 seconds
        case "UNAVAILABLE":
        case "INTERNAL":
            return 5 * 1000; // 5 seconds for faster cycling
        case "DEADLINE_EXCEEDED":
            return 2 * 1000; // 2 seconds for faster cycling
        default:
            return 5 * 1000; // Default 5 seconds for faster cycling
    }
}
/**
 * Create user-friendly error message based on error type
 * @param {Object} errorClassification - Error classification from classifyApiError
 * @returns {string} - User-friendly error message
 */
function createUserFriendlyErrorMessage(errorClassification) {
    switch (errorClassification.type) {
        case "RESOURCE_EXHAUSTED":
            return "API quota exhausted. Please wait before trying again or switch to another key.";
        case "RATE_LIMIT":
            return "API rate limit exceeded. Please wait a moment before trying again.";
        case "UNAVAILABLE":
            return "The AI provider is temporarily unavailable. Please try again in a few minutes.";
        case "INTERNAL":
            return "The AI provider returned an internal server error. Please try again later.";
        case "DEADLINE_EXCEEDED":
            return "Request timed out. The text may be too long. Try analyzing fewer chapters.";
        case "MAX_TOKENS":
            return "Analysis failed: The text from the selected chapters is too long. Please try again with fewer chapters.";
        default:
            return `API Error: ${errorClassification.message || "Unknown error occurred"}`;
    }
}

;// ./src/modules/promptManager.ts
/**
 * Prompt Manager Module
 * Handles AI prompt generation and management for translation consistency analysis
 */

/**
 * Advanced system prompt template for AI analysis
 * Contains comprehensive instructions for detecting translation inconsistencies
 */
const ADVANCED_SYSTEM_PROMPT = `You are a Translation Consistency Editor for machine-translated novels. Detect only user-actionable term inconsistencies in the supplied text, then return strict JSON matching the requested schema.

## Goal
Find recurring entities translated inconsistently across chapters: character names, aliases used incorrectly, locations, organizations, titles, items, abilities, techniques, species, realms, and important recurring concepts. Prefer high-confidence issues that harm readability.

## Method
1. Scan recurring terms and build entity profiles from context.
2. Normalize harmless formatting before comparing: quote style, surrounding punctuation, capitalization-only differences when meaning is unchanged.
3. Link variants only when context supports the same source/entity. Use character/location context, speaker, chapter order, component-based names, and source-term clues.
4. Discard weak matches, intentional aliases, contextual nuance, and true term evolutions.
5. For each remaining issue, provide concise evidence snippets and practical standardization suggestions.

## Do Not Flag
- Official glossary alias groups supplied in glossary context unless the chapter text proves one alias is used as an actual mistaken translation.
- Terms differing only by straight/smart quote style or trivial title colon punctuation.
- Systematic site-level chapter number/title offsets that repeat across consecutive chapters.
- Author notes, translator notes, casual expressions, onomatopoeia, emotional sounds, or intentionally flavorful speech.
- Character aliases, nicknames, undercover names, online handles, shortened usernames, or progression names when context shows they are intentional.
- Similar terms used by different speakers/entities with distinct meanings, such as two different techniques.

## What To Flag
- Same entity/source concept rendered with incompatible English names.
- Root terms whose inconsistency causes dependent title/location/organization variants.
- Pinyin/romanized terms mixed into otherwise English terminology when context suggests they should be localized.
- Username formatting/localization issues only when context clearly indicates a player ID/handle. Do not flag NPC names or single concatenated handles such as PlayerName.
- Non-English honorific usage only when it creates a consistency/localization issue worth reviewing.

## Priority
Use CRITICAL for central, frequent, ongoing root/main-character issues; HIGH for important recurring names/places/abilities; MEDIUM for supporting recurring issues; LOW for minor or likely term-evolution reviews; STYLISTIC for username/honorific/localization style suggestions; INFO only for non-actionable nuance/alias notes.

## Recommendation Policy
- For actionable findings, provide exactly 3 suggestions: one dominant analyzed-text usage option, one glossary-informed option when available, and one editorial best/readability option. If a role has no distinct candidate, still provide 3 text-supported options by varying the reasoning, not by inventing unsupported terms.
- Mark exactly one suggestion with is_recommended: true.
- The recommended suggestion should usually be the dominant consistent usage in the supplied text, especially if it appears across multiple chapters after preprocessing.
- Official glossary data is advisory for source mapping, aliases, and possible corrections. Do not automatically recommend a glossary term over a dominant text term.
- Let a glossary correction override dominant usage only when the correction clearly says the dominant usage is wrong and the chapter evidence supports that correction.
- If dominant usage and glossary wording conflict, include both as suggestions and explain the conflict in reasoning.

## Output Rules
- Base all findings exclusively on the supplied text plus relevant glossary context.
- Each distinct concept must be a separate item; do not group unrelated entities.
- Always populate variations with exact phrases, chapter numbers, and short context snippets.
- Actionable findings must have exactly 3 suggestions. Non-actionable INFO findings may use an empty suggestions array or one empty informational suggestion.
- The suggestion field must contain only the replacement text, never phrases like "standardize to". Use an empty string for informational items.
- Use plain text only inside JSON values. No markdown, no commentary outside JSON.

Example issue: Li Fuchen / Lee Fu Chen for the same hero across chapters should be one concept with both variants and a recommendation such as Li Fuchen. Example non-issue: "Project Doomsday" vs 'Project Doomsday' is quote formatting only and must be ignored.`;
/**
 * Generate AI prompt with chapter text and existing results
 * @param {string} chapterText - The chapter text to analyze
 * @param {Array} existingResults - Results from previous analysis for context
 * @returns {string} - Generated prompt for the AI
 */
function buildPrompt(chapterText, existingResults = [], officialGlossaryContext = "") {
    let prompt = ADVANCED_SYSTEM_PROMPT;
    if (officialGlossaryContext) {
        prompt += `\n\n## Relevant WTR Lab Official Glossary Context\nThis compact JSON is pre-filtered to terms relevant to the supplied text. Formats: aliases = [canonical, alternate_aliases, source_term, count]; terms = [canonical, source_term, count]; replacements = [canonical, alternates, source_term, count]; corrections = [source_term, corrected_english, type, brief_reason]. Treat aliases as accepted variants unless the text proves a real error. Treat terms/replacements/corrections as advisory candidates, not automatic winners. Use them as one of the three suggestion perspectives when relevant, and recommend them only when they beat dominant analyzed-text usage on evidence. Do not create findings from glossary context alone.\n\`\`\`json\n${officialGlossaryContext}\n\`\`\``;
    }
    prompt += `\n\nHere is the text to analyze:\n---\n${chapterText}\n---`;
    const schemaDefinition = `
         [
           {
             "concept": "The core concept or inferred original term.",
             "priority": "CRITICAL | HIGH | MEDIUM | LOW | STYLISTIC | INFO",
             "explanation": "A brief explanation of the inconsistency or issue.",
             "suggestions": [
               {
                 "display_text": "A user-friendly label such as 'Dominant usage: Term A', 'Glossary option: Term B', or 'Editorial option: Term C'.",
                 "suggestion": "The exact, clean replacement text only. Do not include conversational text like 'Standardize to...'. Use an empty string (\\"\\") for informational suggestions.",
                 "reasoning": "Explain whether this is dominant analyzed usage, glossary-informed, or editorial/readability-based, with frequency/chapter evidence when possible.",
                 "is_recommended": "Required on exactly one actionable suggestion. A boolean true indicating the best recommendation."
               }
             ],
             "variations": [
               {
                 "phrase": "The specific incorrect/variant phrase found.",
                 "chapter": "The chapter number as a string.",
                 "context_snippet": "A snippet of text showing the context."
               }
             ]
           }
         ]`;
    if (existingResults.length > 0) {
        // Validate results before processing
        const validResults = existingResults.filter((result) => {
            const isValid = (0,utils/* validateResultForContext */.oV)(result);
            if (!isValid) {
                (0,utils/* log */.Rm)(`Filtered out invalid result from context: ${result.concept || "Unknown concept"}`);
            }
            return isValid;
        });
        if (validResults.length === 0) {
            (0,utils/* log */.Rm)("All existing results failed validation, proceeding without context");
        }
        else {
            (0,utils/* log */.Rm)(`Context validation: ${existingResults.length} results filtered to ${validResults.length} valid results`);
        }
        // Apply context summarization to prevent exponential growth
        const summarizedResults = (0,utils/* summarizeContextResults */.fN)(validResults, 30); // Limit to 30 detailed items
        const existingJson = JSON.stringify(summarizedResults.map(({ concept, explanation, variations }) => ({
            concept,
            explanation,
            variations,
        })), null, 2);
        prompt += `\n\n## Verification & Continuation Task
Re-check previous findings against the current supplied text, then scan for new issues. Use strict evidence from the current text only; do not copy old snippets or priorities.

Tasks:
1. Put still-valid, high-confidence previous findings in verified_inconsistencies as freshly rebuilt objects. Re-extract variations, snippets, chapters, priority, explanation, and suggestions from the current text.
2. Omit previous findings that are now resolved, unsupported, intentional aliases/nicknames, contextual nuance, confirmed term evolutions, official glossary aliases, or false positives. Do not list discarded items.
3. Put newly discovered issues in new_inconsistencies using the same schema.

Previously Identified Inconsistencies for Verification:
\`\`\`json
${existingJson}
\`\`\`

Required Output Format:
Return only one valid JSON object: {"verified_inconsistencies": [], "new_inconsistencies": []}. Both arrays must contain objects matching this schema; use empty arrays when no items exist.

Schema Reference:
\`\`\`json
${schemaDefinition}
\`\`\`
`;
    }
    else {
        prompt += `\n\nIMPORTANT: Your final output MUST be ONLY a single, valid JSON array matching this specific schema. Do not include any other text, explanations, or markdown formatting outside of the JSON array itself.
        Schema:
        ${schemaDefinition}`;
    }
    return prompt;
}
/**
 * Build prompt for deep analysis with enhanced context processing
 * @param {string} chapterText - The chapter text to analyze
 * @param {Array} existingResults - Results from previous analysis iterations
 * @returns {string} - Generated prompt for deep analysis
 */
function buildDeepAnalysisPrompt(chapterText, existingResults = [], officialGlossaryContext = "") {
    // For deep analysis, we always want the verification mode which includes both
    // verification of existing results and discovery of new ones
    return buildPrompt(chapterText, existingResults, officialGlossaryContext);
}
/**
 * Parse and validate API response content
 * @param {string} resultText - Raw text response from API
 * @returns {Object|Array} - Parsed JSON response
 * @throws {Error} - If parsing fails
 */
function parseApiResponse(_resultText) {
    // This function will be implemented in the analysis engine to avoid circular dependencies
    // For now, provide a placeholder that throws an error if called directly
    throw new Error("parseApiResponse should be implemented in the analysis engine module");
}

// EXTERNAL MODULE: ./src/modules/providerConfig.ts
var providerConfig = __webpack_require__(980);
// EXTERNAL MODULE: ./src/modules/wtrLabApi.ts
var wtrLabApi = __webpack_require__(41);
;// ./src/modules/analysisEngine.ts
/**
 * Analysis Engine Module
 * Core analysis logic for translation consistency detection across supported AI providers
 */
// Import from state module

// Import from ui module

// Import from utils module

// Import from retryLogic module

// Import from promptManager module

// Import from providerConfig module

// Import from apiErrorHandler module


/**
 * Get next available API key from the pool
 * @returns {Object|null} - API key information or null if none available
 */
function getAvailableApiKey() {
    const apiKeyInfo = (0,state/* getNextAvailableKey */.gb)();
    if (apiKeyInfo) {
        return {
            key: apiKeyInfo.key,
            index: apiKeyInfo.index,
            state: apiKeyInfo.state,
        };
    }
    return null;
}
/**
 * Validate API key for use
 * @returns {boolean} - True if valid API key is available
 */
function validateApiKey() {
    return getAvailableApiKey() !== null;
}
/**
 * Parse and validate API response content
 * @param {string} _resultText - Raw text response from API (unused parameter for compatibility)
 * @returns {Object|Array} - Parsed JSON response
 * @throws {Error} - If parsing fails
 */
function analysisEngine_parseApiResponse(_resultText) {
    const cleanedJsonString = (0,utils/* extractJsonFromString */.zF)(_resultText);
    return JSON.parse(cleanedJsonString);
}
function normalizeApiResponse(response, apiResponse) {
    if (apiResponse?.error || response.status < 400) {
        return apiResponse;
    }
    const fallbackMessage = apiResponse?.message || apiResponse?.detail || response.statusText || `HTTP ${response.status || "Unknown"}`;
    return {
        ...apiResponse,
        error: {
            message: fallbackMessage,
            type: apiResponse?.type,
            code: apiResponse?.code,
        },
    };
}
function buildMissingContentError(apiResponse) {
    const finishReason = (0,providerConfig/* getResponseFinishReason */.$i)(state/* appState */.XJ.config, apiResponse);
    if (finishReason === "MAX_TOKENS" || finishReason === "length") {
        return "Analysis failed: The text from the selected chapters is too long, and the AI's response was cut off. Please try again with fewer chapters.";
    }
    return `Invalid API response: No content found. Finish Reason: ${finishReason || "Unknown"}`;
}
function getProviderLogContext() {
    const provider = (0,providerConfig/* resolveProviderSettings */.vy)(state/* appState */.XJ.config);
    return {
        providerType: provider.providerType,
        model: state/* appState */.XJ.config.model,
        baseUrl: provider.baseUrl,
    };
}
function summarizeParsedResponse(parsedResponse) {
    if (Array.isArray(parsedResponse)) {
        return {
            resultType: "initial",
            itemCount: parsedResponse.length,
            conceptPreview: parsedResponse
                .slice(0, 3)
                .map((item) => item?.concept)
                .filter(Boolean),
        };
    }
    return {
        resultType: "verification",
        verifiedCount: Array.isArray(parsedResponse?.verified_inconsistencies)
            ? parsedResponse.verified_inconsistencies.length
            : 0,
        newCount: Array.isArray(parsedResponse?.new_inconsistencies) ? parsedResponse.new_inconsistencies.length : 0,
        conceptPreview: [
            ...(parsedResponse?.verified_inconsistencies || []),
            ...(parsedResponse?.new_inconsistencies || []),
        ]
            .slice(0, 3)
            .map((item) => item?.concept)
            .filter(Boolean),
    };
}
function getOfficialGlossaryPromptContext(chapterText, chapterData) {
    return (0,wtrLabApi/* formatOfficialGlossaryPromptContext */.CO)(state/* appState */.XJ.runtime.officialGlossaryContext || null, chapterText, chapterData);
}
function filterOfficialAliasOnlyFindings(results, operationName) {
    if (!Array.isArray(results) || !state/* appState */.XJ.runtime.officialGlossaryContext) {
        return results;
    }
    const suppressedMatches = [];
    const filteredResults = results.filter((result) => {
        const match = (0,wtrLabApi/* getOfficialAliasOnlyMatch */.t0)(result, state/* appState */.XJ.runtime.officialGlossaryContext);
        if (match) {
            suppressedMatches.push({
                concept: result?.concept || "Unknown concept",
                phrases: match.phrases,
                officialCanonical: match.group.canonical,
                officialSource: match.group.source,
                officialAliases: match.group.aliases,
            });
            return false;
        }
        return true;
    });
    if (suppressedMatches.length > 0) {
        (0,utils/* log */.Rm)(`${operationName}: Suppressed ${suppressedMatches.length} official WTR glossary alias-only finding${suppressedMatches.length === 1 ? "" : "s"}.`, suppressedMatches);
    }
    return filteredResults;
}
function summarizeResultsForDebug(results) {
    return (Array.isArray(results) ? results : [])
        .filter((result) => result && !result.error && result.concept)
        .map((result) => {
        const recommendedSuggestion = Array.isArray(result.suggestions)
            ? result.suggestions.find((suggestion) => suggestion?.is_recommended)?.suggestion ||
                result.suggestions[0]?.suggestion ||
                ""
            : "";
        return {
            concept: result.concept,
            priority: result.priority || "INFO",
            status: result.status || (result.isNew ? "New" : "Unverified"),
            variationCount: Array.isArray(result.variations) ? result.variations.length : 0,
            recommendedSuggestion,
        };
    });
}
function logResultSummary(operationName, results) {
    const summary = summarizeResultsForDebug(results);
    (0,utils/* log */.Rm)(`${operationName}: Current result summary.`, {
        resultCount: summary.length,
        results: summary,
    });
}
function isActionableFinding(result) {
    const priority = String(result?.priority || "INFO").toUpperCase();
    return Boolean(result && !result.error && result.concept && priority !== "INFO");
}
function getCleanSuggestionText(value) {
    return typeof value === "string" ? value.trim() : "";
}
function createFallbackSuggestion(_result, suggestion, label, reasoning) {
    const cleanSuggestion = getCleanSuggestionText(suggestion);
    return {
        display_text: cleanSuggestion ? `${label}: '${cleanSuggestion}'` : label,
        suggestion: cleanSuggestion,
        reasoning,
    };
}
function getSuggestionCandidates(result) {
    const candidates = [];
    if (Array.isArray(result?.suggestions)) {
        result.suggestions.forEach((suggestion) => {
            const cleanSuggestion = getCleanSuggestionText(suggestion?.suggestion);
            if (cleanSuggestion) {
                candidates.push(cleanSuggestion);
            }
        });
    }
    if (Array.isArray(result?.variations)) {
        result.variations.forEach((variation) => {
            const phrase = getCleanSuggestionText(variation?.phrase);
            if (phrase) {
                candidates.push(phrase);
            }
        });
    }
    const concept = getCleanSuggestionText(result?.concept).replace(/\s*[([{][^\])}]*[\])}]/g, "").trim();
    if (concept) {
        candidates.push(concept);
    }
    const seen = new Set();
    return candidates.filter((candidate) => {
        const normalizedCandidate = candidate.toLowerCase();
        if (seen.has(normalizedCandidate)) {
            return false;
        }
        seen.add(normalizedCandidate);
        return true;
    });
}
function normalizeActionableSuggestions(results, operationName) {
    if (!Array.isArray(results) || results.length === 0) {
        return results;
    }
    const normalizationLog = [];
    const normalizedResults = results.map((result) => {
        if (!isActionableFinding(result)) {
            return result;
        }
        const originalSuggestions = Array.isArray(result.suggestions) ? result.suggestions : [];
        const validSuggestions = originalSuggestions.filter((suggestion) => {
            const hasSuggestion = getCleanSuggestionText(suggestion?.suggestion);
            const hasDisplayText = getCleanSuggestionText(suggestion?.display_text);
            return hasSuggestion || hasDisplayText;
        });
        const candidates = getSuggestionCandidates({ ...result, suggestions: validSuggestions });
        const nextSuggestions = validSuggestions.slice(0, 3).map((suggestion) => ({
            ...suggestion,
            is_recommended: false,
        }));
        const fallbackRoles = [
            {
                label: "Dominant usage",
                reasoning: "Fallback dominant-usage option added because the AI returned fewer than three actionable suggestions. Review variation frequency before applying.",
            },
            {
                label: "Glossary-informed option",
                reasoning: "Fallback glossary/editing option added because the AI returned fewer than three actionable suggestions. Treat as advisory unless supported by analyzed text.",
            },
            {
                label: "Editorial option",
                reasoning: "Fallback editorial option added to preserve the required three-suggestion structure. Validate manually before applying.",
            },
        ];
        let candidateIndex = 0;
        while (nextSuggestions.length < 3) {
            const candidate = candidates[candidateIndex] || candidates[0] || getCleanSuggestionText(result.concept);
            const role = fallbackRoles[nextSuggestions.length];
            nextSuggestions.push(createFallbackSuggestion(result, candidate, role.label, role.reasoning));
            candidateIndex++;
        }
        const originalRecommendedIndex = validSuggestions.findIndex((suggestion) => suggestion?.is_recommended === true);
        const recommendedIndex = originalRecommendedIndex >= 0 && originalRecommendedIndex < 3 ? originalRecommendedIndex : 0;
        nextSuggestions.forEach((suggestion, index) => {
            if (index === recommendedIndex) {
                suggestion.is_recommended = true;
            }
            else {
                delete suggestion.is_recommended;
            }
        });
        if (originalSuggestions.length !== 3 ||
            originalSuggestions.filter((suggestion) => suggestion?.is_recommended === true).length !== 1) {
            normalizationLog.push({
                concept: result.concept,
                originalSuggestionCount: originalSuggestions.length,
                normalizedSuggestionCount: nextSuggestions.length,
                originalRecommendedCount: originalSuggestions.filter((suggestion) => suggestion?.is_recommended === true)
                    .length,
            });
        }
        return {
            ...result,
            suggestions: nextSuggestions,
        };
    });
    if (normalizationLog.length > 0) {
        (0,utils/* log */.Rm)(`${operationName}: Normalized actionable suggestions to exactly 3 entries with exactly one recommendation.`, normalizationLog);
    }
    return normalizedResults;
}
function markFinalVerificationNewItemsForReview(items, operationName) {
    if (!Array.isArray(items) || items.length === 0) {
        return items;
    }
    (0,utils/* log */.Rm)(`${operationName}: Marking ${items.length} final-pass new finding${items.length === 1 ? "" : "s"} as Needs Review because no later verification pass remains.`, items.map((item) => item?.concept).filter(Boolean));
    return items.map((item) => {
        if (!item || item.error || !item.concept) {
            return item;
        }
        return {
            ...item,
            status: "Needs Review",
            latestVerificationStatus: "final_unverified_discovery",
            verificationNote: "This finding was newly discovered on the final verification pass and has not been verified by a later pass.",
        };
    });
}
function resultContainsUnresolvedPlaceholder(result) {
    if (!Array.isArray(result?.variations)) {
        return false;
    }
    return result.variations.some((variation) => /※\d+[⛬〓]?/.test(String(variation?.phrase || "")));
}
function markPlaceholderArtifactResultsForReview(results, operationName) {
    if (!Array.isArray(results) || results.length === 0) {
        return results;
    }
    const placeholderConcepts = [];
    const reviewedResults = results.map((result) => {
        if (!result || result.error || !result.concept || !resultContainsUnresolvedPlaceholder(result)) {
            return result;
        }
        placeholderConcepts.push({
            concept: result.concept,
            priority: result.priority || "INFO",
            previousStatus: result.status || (result.isNew ? "New" : "Unverified"),
            placeholderVariations: (result.variations || [])
                .map((variation) => variation?.phrase)
                .filter((phrase) => /※\d+[⛬〓]?/.test(String(phrase || "")))
                .slice(0, 5),
        });
        return {
            ...result,
            status: "Needs Review",
            latestVerificationStatus: "unresolved_placeholder_artifact",
            verificationNote: "This finding includes unresolved WTR placeholder markers, so it needs manual review before applying.",
        };
    });
    if (placeholderConcepts.length > 0) {
        (0,utils/* log */.Rm)(`${operationName}: Marked ${placeholderConcepts.length} placeholder-derived finding${placeholderConcepts.length === 1 ? "" : "s"} as Needs Review due to unresolved markers.`, placeholderConcepts);
    }
    return reviewedResults;
}
function markLowEvidenceResultsForReview(results, operationName) {
    if (!Array.isArray(results) || results.length === 0) {
        return results;
    }
    const lowEvidenceConcepts = [];
    const reviewedResults = results.map((result) => {
        if (!result || result.error || !result.concept) {
            return result;
        }
        const priority = String(result.priority || "INFO").toUpperCase();
        const variationCount = Array.isArray(result.variations) ? result.variations.length : 0;
        const isInformational = priority === "INFO" || priority === "STYLISTIC";
        if (isInformational || variationCount >= 2) {
            return result;
        }
        lowEvidenceConcepts.push({
            concept: result.concept,
            priority,
            variationCount,
            previousStatus: result.status || (result.isNew ? "New" : "Unverified"),
        });
        return {
            ...result,
            status: "Needs Review",
            latestVerificationStatus: "low_evidence_variation_count",
            verificationNote: "This non-informational finding has fewer than two extracted variations, so it needs manual review before applying.",
        };
    });
    if (lowEvidenceConcepts.length > 0) {
        (0,utils/* log */.Rm)(`${operationName}: Marked ${lowEvidenceConcepts.length} low-evidence finding${lowEvidenceConcepts.length === 1 ? "" : "s"} as Needs Review due to insufficient variations.`, lowEvidenceConcepts);
    }
    return reviewedResults;
}
function createStreamingRequestState(config) {
    if (!(0,providerConfig/* providerUsesStreaming */._C)(config)) {
        return null;
    }
    return {
        ...(0,providerConfig/* createOpenAiStreamState */.ac)(),
        lastStatusUpdateAt: 0,
        lastStatusLength: 0,
    };
}
function buildProviderRequestWithRuntimeMetadata(apiKey, prompt) {
    return (0,providerConfig/* buildAnalysisRequest */.g)({
        ...state/* appState */.XJ.config,
        providerModelMetadata: state/* appState */.XJ.runtime.providerModelMetadata || {},
    }, apiKey, prompt);
}
function handleStreamingProgress(operationName, streamState, response) {
    if (!streamState) {
        return;
    }
    (0,providerConfig/* consumeOpenAiStreamResponse */.yU)(streamState, response.responseText || "");
    const currentLength = streamState.text.length;
    if (currentLength <= 0 || currentLength === streamState.lastStatusLength) {
        return;
    }
    const now = Date.now();
    if (now - streamState.lastStatusUpdateAt < 250) {
        return;
    }
    streamState.lastStatusUpdateAt = now;
    streamState.lastStatusLength = currentLength;
    (0,ui/* updateStatusIndicator */.LI)("running", `${operationName}: Streaming response (${currentLength} chars)...`);
}
function resolveStreamedApiResponse(response, streamState) {
    const streamResult = (0,providerConfig/* finalizeOpenAiStreamResponse */.o_)(streamState, response.responseText || "");
    if (!streamResult.isStreamResponse) {
        return null;
    }
    if (streamResult.errorPayload) {
        return streamResult.errorPayload;
    }
    return {
        choices: [
            {
                message: {
                    content: streamResult.text || "",
                },
                finish_reason: streamResult.finishReason,
            },
        ],
    };
}
function getPreservableResults(results) {
    return Array.isArray(results) ? results.filter((result) => result && !result.error && result.concept) : [];
}
function markResultsForReviewAfterEmptyVerification(results) {
    return results.map((result) => {
        if (!result || result.error || !result.concept) {
            return result;
        }
        return {
            ...result,
            isNew: false,
            status: "Needs Review",
            latestVerificationStatus: "empty_verification_pass",
            verificationNote: "Latest verification returned no items; this result was preserved for review.",
        };
    });
}
function markFinalInitialResultsForReview(results) {
    return results.map((result) => {
        if (!result || result.error || !result.concept) {
            return result;
        }
        return {
            ...result,
            isNew: true,
            status: "Needs Review",
            latestVerificationStatus: "final_unverified_discovery",
            verificationNote: "This finding was discovered on the final deep-analysis pass and has not been verified by a later pass.",
        };
    });
}
function preserveResultsAfterEmptyVerification(operationName, fallbackResults = []) {
    const sourceResults = getPreservableResults(state/* appState */.XJ.runtime.cumulativeResults).length
        ? state/* appState */.XJ.runtime.cumulativeResults
        : fallbackResults;
    const preservableCount = getPreservableResults(sourceResults).length;
    if (preservableCount === 0) {
        return false;
    }
    state/* appState */.XJ.runtime.cumulativeResults = markResultsForReviewAfterEmptyVerification(sourceResults);
    (0,utils/* log */.Rm)(`${operationName}: Verification returned no items; preserving ${preservableCount} previous result${preservableCount === 1 ? "" : "s"} as Needs Review to avoid dropping findings from an empty model response.`);
    return true;
}
function hasMatchingConcept(result, candidates) {
    return candidates.some((candidate) => (0,utils/* areSemanticallySimilar */.o3)(result?.concept || "", candidate?.concept || "", { silent: true }));
}
function markUnreturnedPreviousResultsForReview(mergedResults, previousResults, latestResults, operationName) {
    const previousFindings = getPreservableResults(previousResults);
    const latestFindings = getPreservableResults(latestResults);
    if (previousFindings.length === 0 || latestFindings.length === 0) {
        return mergedResults;
    }
    const unreturnedPreviousFindings = previousFindings.filter((previousResult) => !hasMatchingConcept(previousResult, latestFindings));
    if (unreturnedPreviousFindings.length === 0) {
        return mergedResults;
    }
    (0,utils/* log */.Rm)(`${operationName}: Latest verification did not return ${unreturnedPreviousFindings.length} previous result${unreturnedPreviousFindings.length === 1 ? "" : "s"}; preserving them as Needs Review.`);
    return mergedResults.map((result) => {
        if (!result || result.error || !result.concept) {
            return result;
        }
        const wasPreviousButUnreturned = hasMatchingConcept(result, unreturnedPreviousFindings);
        const wasReturnedByLatestVerification = hasMatchingConcept(result, latestFindings);
        if (!wasPreviousButUnreturned || wasReturnedByLatestVerification) {
            return result;
        }
        return {
            ...result,
            isNew: false,
            status: "Needs Review",
            latestVerificationStatus: "not_returned_by_latest_verification",
            verificationNote: "Latest verification did not return this previous finding; it was preserved for review.",
        };
    });
}
/**
 * Main inconsistency analysis function
 * @param {Array} chapterData - Array of chapter objects with text and chapter numbers
 * @param {Array} existingResults - Results from previous analysis for context
 * @param {number} retryCount - Current retry attempt count
 * @param {number} parseRetryCount - Parse retry attempt count
 */
function findInconsistencies(chapterData, existingResults = [], retryCount = 0, parseRetryCount = 0) {
    const operationName = "Analysis";
    const maxTotalRetries = Math.max(1, state/* appState */.XJ.config.apiKeys.length) * MAX_RETRIES_PER_KEY;
    // Initialize or reuse startedAt to enforce a global safety window for this run
    const startedAt = state/* appState */.XJ.runtime.analysisStartedAt || Date.now();
    if (!state/* appState */.XJ.runtime.analysisStartedAt) {
        state/* appState */.XJ.runtime.analysisStartedAt = startedAt;
    }
    // Hard cap by attempts
    if (retryCount >= maxTotalRetries) {
        handleApiError(`${operationName} failed after ${retryCount} attempts across all keys. Please check your API keys or wait a while.`);
        return;
    }
    // Hard cap by duration (5-minute safety net)
    if (Date.now() - startedAt > MAX_TOTAL_RETRY_DURATION_MS) {
        handleApiError(`${operationName} failed after repeated retries over an extended period. Please wait a while before trying again.`);
        return;
    }
    const apiKeyInfo = getAvailableApiKey();
    if (!apiKeyInfo) {
        handleApiError("All API keys are currently rate-limited or failing. Please wait a moment before trying again.");
        return;
    }
    const currentKey = apiKeyInfo.key;
    const currentKeyIndex = apiKeyInfo.index;
    state/* appState */.XJ.runtime.isAnalysisRunning = true;
    (0,ui/* updateStatusIndicator */.LI)("running", `${operationName} (Key ${currentKeyIndex + 1}, Attempt ${retryCount + 1})...`);
    const combinedText = chapterData.map((d) => `--- CHAPTER ${d.chapter} ---\n${d.text}`).join("\n\n");
    (0,utils/* log */.Rm)(`${operationName}: Dispatching request.`, {
        ...getProviderLogContext(),
        keyIndex: currentKeyIndex,
        attempt: retryCount + 1,
        chapterCount: chapterData.length,
        characterCount: combinedText.length,
    });
    const prompt = buildPrompt(combinedText, existingResults, getOfficialGlossaryPromptContext(combinedText, chapterData));
    const requestConfig = buildProviderRequestWithRuntimeMetadata(currentKey, prompt);
    const streamingRequestState = createStreamingRequestState(state/* appState */.XJ.config);
    GM_xmlhttpRequest({
        method: requestConfig.method,
        url: requestConfig.url,
        headers: requestConfig.headers,
        data: requestConfig.data,
        onprogress: function (response) {
            handleStreamingProgress(operationName, streamingRequestState, response);
        },
        onload: function (response) {
            (0,utils/* log */.Rm)(`${operationName}: Received API response.`, {
                ...getProviderLogContext(),
                httpStatus: response.status,
                responseLength: response.responseText?.length || 0,
                responsePreview: (0,utils/* truncateForLog */.eM)(response.responseText || "", 320),
            });
            let apiResponse;
            let parsedResponse;
            // Shell parse errors are treated as retriable (can be transient)
            try {
                const streamedApiResponse = resolveStreamedApiResponse(response, streamingRequestState);
                apiResponse = normalizeApiResponse(response, streamedApiResponse || JSON.parse(response.responseText));
            }
            catch (e) {
                (0,utils/* log */.Rm)(`${operationName}: Failed to parse API response shell: ${e.message}. Retrying immediately with next key.`);
                // Immediate retry with next available key
                findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount);
                return;
            }
            // Handle explicit API error responses
            if (apiResponse.error) {
                const errorClassification = classifyApiError(apiResponse, response.status);
                const isRetriable = errorClassification.retriable;
                if (isRetriable) {
                    (0,utils/* log */.Rm)(`${operationName}: Retriable API Error (Status: ${errorClassification.status}) with key index ${currentKeyIndex}. Putting key on cooldown and retrying immediately with next key.`);
                    handleRateLimitError(currentKeyIndex, errorClassification, state/* updateKeyState */.gH);
                    // Immediate retry with next available key
                    findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount);
                    return;
                }
                // Non-retriable API error -> final failure
                const finalError = `API Error (Status: ${errorClassification.status}): ${errorClassification.message}`;
                handleApiError(finalError);
                return;
            }
            const resultText = (0,providerConfig/* extractResponseText */.Qk)(state/* appState */.XJ.config, apiResponse);
            if (!resultText) {
                handleApiError(buildMissingContentError(apiResponse));
                return;
            }
            // Parse the inner content (model JSON); treat malformed JSON as retriable once
            try {
                parsedResponse = analysisEngine_parseApiResponse(resultText);
                (0,utils/* log */.Rm)(`${operationName}: Parsed API response content.`, {
                    ...getProviderLogContext(),
                    ...summarizeParsedResponse(parsedResponse),
                });
            }
            catch (e) {
                if (parseRetryCount < 1) {
                    (0,utils/* log */.Rm)(`${operationName}: Failed to parse AI response content, retrying immediately with next key. Error: ${e.message}`);
                    (0,ui/* updateStatusIndicator */.LI)("running", "AI response malformed. Retrying...");
                    // Immediate retry with next available key
                    findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount + 1);
                    return;
                }
                const error = `${operationName} failed to process AI response content after retry: ${e.message}`;
                handleApiError(error);
                return;
            }
            // Success: rotate key index for next invocation
            state/* appState */.XJ.runtime.currentApiKeyIndex = (currentKeyIndex + 1) % state/* appState */.XJ.config.apiKeys.length;
            state/* appState */.XJ.runtime.isAnalysisRunning = false;
            state/* appState */.XJ.runtime.analysisStartedAt = null;
            const isVerificationRun = existingResults.length > 0;
            if (isVerificationRun) {
                if (!parsedResponse.verified_inconsistencies || !parsedResponse.new_inconsistencies) {
                    handleApiError("Invalid response format for verification run. Expected 'verified_inconsistencies' and 'new_inconsistencies' keys.");
                    return;
                }
                const verifiedItems = filterOfficialAliasOnlyFindings(parsedResponse.verified_inconsistencies || [], operationName);
                const newItems = filterOfficialAliasOnlyFindings(parsedResponse.new_inconsistencies || [], operationName);
                verifiedItems.forEach((item) => {
                    item.isNew = false;
                    item.status = "Verified";
                });
                newItems.forEach((item) => {
                    item.isNew = true;
                });
                (0,utils/* log */.Rm)(`Verification complete. ${verifiedItems.length} concepts re-verified. ${newItems.length} new concepts found.`);
                const allVerifiedItems = [...verifiedItems, ...newItems];
                if (allVerifiedItems.length === 0 &&
                    preserveResultsAfterEmptyVerification(operationName, existingResults)) {
                    // Preserve existing findings explicitly when the verifier returns an empty pass.
                }
                else {
                    const mergedVerificationResults = (0,utils/* mergeAnalysisResults */.bd)(existingResults, allVerifiedItems);
                    state/* appState */.XJ.runtime.cumulativeResults = markUnreturnedPreviousResultsForReview(mergedVerificationResults, existingResults, allVerifiedItems, operationName);
                }
            }
            else {
                if (!Array.isArray(parsedResponse)) {
                    handleApiError("Invalid response format for initial run. Expected a JSON array.");
                    return;
                }
                const filteredInitialResults = filterOfficialAliasOnlyFindings(parsedResponse, operationName);
                filteredInitialResults.forEach((r) => (r.isNew = true));
                state/* appState */.XJ.runtime.cumulativeResults = filteredInitialResults;
            }
            state/* appState */.XJ.runtime.cumulativeResults = normalizeActionableSuggestions(state/* appState */.XJ.runtime.cumulativeResults, operationName);
            state/* appState */.XJ.runtime.cumulativeResults = markPlaceholderArtifactResultsForReview(state/* appState */.XJ.runtime.cumulativeResults, operationName);
            state/* appState */.XJ.runtime.cumulativeResults = markLowEvidenceResultsForReview(state/* appState */.XJ.runtime.cumulativeResults, operationName);
            logResultSummary(operationName, state/* appState */.XJ.runtime.cumulativeResults);
            (0,state/* saveSessionResults */.I6)();
            (0,ui/* updateStatusIndicator */.LI)("complete", "Complete!");
            const continueBtn = document.getElementById("wtr-if-continue-btn");
            if (continueBtn) {
                continueBtn.disabled = false;
            }
            (0,ui/* displayResults */.Hv)(state/* appState */.XJ.runtime.cumulativeResults);
        },
        onerror: function (error) {
            console.error("Inconsistency Finder: Network error:", error);
            (0,utils/* log */.Rm)(`${operationName}: Network error with key index ${currentKeyIndex}. Putting key on cooldown and retrying immediately with next key.`);
            state/* appState */.XJ.runtime.apiKeyCooldowns.set(currentKey, Date.now() + 1000); // 1-second cooldown
            // Immediate retry with next available key
            findInconsistencies(chapterData, existingResults, retryCount + 1, parseRetryCount);
        },
    });
}
/**
 * Deep analysis coordinator function
 * @param {Array} chapterData - Array of chapter objects with text and chapter numbers
 * @param {Array} existingResults - Results from previous analysis for context
 * @param {number} targetDepth - Target depth for deep analysis
 * @param {number} currentDepth - Current depth in analysis
 */
function findInconsistenciesDeepAnalysis(chapterData, existingResults = [], targetDepth = 1, currentDepth = 1) {
    if (currentDepth > targetDepth) {
        // Deep analysis complete
        state/* appState */.XJ.runtime.currentIteration = targetDepth;
        state/* appState */.XJ.runtime.isAnalysisRunning = false;
        const statusMessage = targetDepth > 1 ? `Complete! (Deep Analysis: ${targetDepth} iterations)` : "Complete!";
        (0,ui/* updateStatusIndicator */.LI)("complete", statusMessage);
        document.getElementById("wtr-if-continue-btn").disabled = false;
        (0,ui/* displayResults */.Hv)(state/* appState */.XJ.runtime.cumulativeResults);
        return;
    }
    (0,utils/* log */.Rm)(`Starting deep analysis iteration ${currentDepth}/${targetDepth}`);
    // Update status to show iteration progress
    if (targetDepth > 1) {
        (0,ui/* updateStatusIndicator */.LI)("running", `Deep Analysis (${currentDepth}/${targetDepth})...`);
    }
    else {
        (0,ui/* updateStatusIndicator */.LI)("running", currentDepth > 1 ? `Deep Analysis (${currentDepth}/${targetDepth})...` : "Analyzing...");
    }
    // Standardized context selection - always use cumulative results for deep analysis
    const contextResults = state/* appState */.XJ.runtime.cumulativeResults.length > 0 ? state/* appState */.XJ.runtime.cumulativeResults : existingResults;
    // Run iteration only if we have a real deep analysis (depth > 1)
    if (targetDepth > 1) {
        findInconsistenciesIteration(chapterData, contextResults, targetDepth, currentDepth);
    }
    else {
        // For normal analysis (depth = 1), use the regular analysis function
        findInconsistencies(chapterData, contextResults);
    }
}
/**
 * Single iteration of deep analysis
 * @param {Array} chapterData - Array of chapter objects with text and chapter numbers
 * @param {Array} existingResults - Results from previous analysis iterations
 * @param {number} targetDepth - Target depth for deep analysis
 * @param {number} currentDepth - Current depth in analysis
 */
function findInconsistenciesIteration(chapterData, existingResults, targetDepth, currentDepth) {
    const maxTotalRetries = Math.max(1, state/* appState */.XJ.config.apiKeys.length) * MAX_RETRIES_PER_KEY;
    let retryCount = 0;
    let parseRetryCount = 0;
    // Track when this deep analysis iteration started to enforce a safety window
    const iterationKey = `deep_${currentDepth}`;
    const now = Date.now();
    if (!state/* appState */.XJ.runtime.deepAnalysisStartTimes) {
        state/* appState */.XJ.runtime.deepAnalysisStartTimes = {};
    }
    if (!state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey]) {
        state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey] = now;
    }
    const startedAt = state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey];
    const operationName = `Deep analysis iteration ${currentDepth}/${targetDepth}`;
    const executeIteration = () => {
        // Attempt-based ceiling
        if (retryCount >= maxTotalRetries) {
            handleApiError(`${operationName} failed after ${retryCount} attempts. Please check your API keys or wait a while.`);
            delete state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey];
            return;
        }
        // Time-based safety ceiling
        if (Date.now() - startedAt > MAX_TOTAL_RETRY_DURATION_MS) {
            handleApiError(`${operationName} failed after repeated retries over an extended period. Please wait a while before trying again.`);
            delete state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey];
            return;
        }
        const apiKeyInfo = getAvailableApiKey();
        if (!apiKeyInfo) {
            handleApiError("All API keys are currently rate-limited or failing. Please wait a moment before trying again.");
            delete state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey];
            return;
        }
        const currentKey = apiKeyInfo.key;
        const currentKeyIndex = apiKeyInfo.index;
        const combinedText = chapterData.map((d) => `--- CHAPTER ${d.chapter} ---\n${d.text}`).join("\n\n");
        (0,utils/* log */.Rm)(`${operationName}: Dispatching request.`, {
            ...getProviderLogContext(),
            keyIndex: currentKeyIndex,
            attempt: retryCount + 1,
            chapterCount: chapterData.length,
            characterCount: combinedText.length,
        });
        const prompt = buildDeepAnalysisPrompt(combinedText, existingResults, getOfficialGlossaryPromptContext(combinedText, chapterData));
        const requestConfig = buildProviderRequestWithRuntimeMetadata(currentKey, prompt);
        const streamingRequestState = createStreamingRequestState(state/* appState */.XJ.config);
        GM_xmlhttpRequest({
            method: requestConfig.method,
            url: requestConfig.url,
            headers: requestConfig.headers,
            data: requestConfig.data,
            onprogress: function (response) {
                handleStreamingProgress(operationName, streamingRequestState, response);
            },
            onload: function (response) {
                (0,utils/* log */.Rm)(`${operationName}: Received API response.`, {
                    ...getProviderLogContext(),
                    httpStatus: response.status,
                    responseLength: response.responseText?.length || 0,
                    responsePreview: (0,utils/* truncateForLog */.eM)(response.responseText || "", 320),
                });
                let apiResponse;
                let parsedResponse;
                // Shell parse: treat as retriable (can be transient / truncation)
                try {
                    const streamedApiResponse = resolveStreamedApiResponse(response, streamingRequestState);
                    apiResponse = normalizeApiResponse(response, streamedApiResponse || JSON.parse(response.responseText));
                }
                catch (e) {
                    (0,utils/* log */.Rm)(`${operationName}: Failed to parse API response shell: ${e.message}. Retrying immediately with next key.`);
                    // Immediate retry with next available key
                    retryCount++;
                    executeIteration();
                    return;
                }
                if (apiResponse.error) {
                    const errorClassification = classifyApiError(apiResponse, response.status);
                    const isRetriable = errorClassification.retriable;
                    if (isRetriable) {
                        (0,utils/* log */.Rm)(`${operationName}: Retriable API Error (Status: ${errorClassification.status}) with key index ${currentKeyIndex}. Putting key on cooldown and retrying immediately with next key.`);
                        handleRateLimitError(currentKeyIndex, errorClassification, state/* updateKeyState */.gH);
                        // Immediate retry with next available key
                        retryCount++;
                        executeIteration();
                        return;
                    }
                    const finalError = `API Error (Status: ${errorClassification.status}): ${errorClassification.message}`;
                    handleApiError(finalError);
                    delete state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey];
                    return;
                }
                const resultText = (0,providerConfig/* extractResponseText */.Qk)(state/* appState */.XJ.config, apiResponse);
                if (!resultText) {
                    handleApiError(buildMissingContentError(apiResponse));
                    delete state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey];
                    return;
                }
                try {
                    parsedResponse = analysisEngine_parseApiResponse(resultText);
                    (0,utils/* log */.Rm)(`${operationName}: Parsed API response content.`, {
                        ...getProviderLogContext(),
                        ...summarizeParsedResponse(parsedResponse),
                    });
                }
                catch (e) {
                    if (parseRetryCount < 1) {
                        (0,utils/* log */.Rm)(`${operationName}: Failed to parse AI response content, retrying immediately with next key. Error: ${e.message}`);
                        (0,ui/* updateStatusIndicator */.LI)("running", "AI response malformed. Retrying...");
                        // Immediate retry with next available key
                        retryCount++;
                        parseRetryCount++;
                        executeIteration();
                        return;
                    }
                    const error = `${operationName} failed to process AI response content after retry: ${e.message}`;
                    handleApiError(error);
                    delete state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey];
                    return;
                }
                // On success, advance the key index for the next run
                state/* appState */.XJ.runtime.currentApiKeyIndex = (currentKeyIndex + 1) % state/* appState */.XJ.config.apiKeys.length;
                const isVerificationRun = existingResults.length > 0;
                if (isVerificationRun) {
                    if (!parsedResponse.verified_inconsistencies || !parsedResponse.new_inconsistencies) {
                        handleApiError("Invalid response format for verification run. Expected 'verified_inconsistencies' and 'new_inconsistencies' keys.");
                        delete state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey];
                        return;
                    }
                    const verifiedItems = filterOfficialAliasOnlyFindings(parsedResponse.verified_inconsistencies || [], operationName);
                    let newItems = filterOfficialAliasOnlyFindings(parsedResponse.new_inconsistencies || [], operationName);
                    verifiedItems.forEach((item) => {
                        item.isNew = false;
                        item.status = "Verified";
                    });
                    newItems.forEach((item) => {
                        item.isNew = true;
                    });
                    if (currentDepth >= targetDepth) {
                        newItems = markFinalVerificationNewItemsForReview(newItems, operationName);
                    }
                    (0,utils/* log */.Rm)(`${operationName}: ${verifiedItems.length} concepts re-verified. ${newItems.length} new concepts found.`);
                    const allNewItems = [...verifiedItems, ...newItems];
                    if (allNewItems.length === 0 &&
                        preserveResultsAfterEmptyVerification(operationName, existingResults)) {
                        // Preserve existing findings explicitly when the verifier returns an empty pass.
                    }
                    else {
                        const mergedVerificationResults = (0,utils/* mergeAnalysisResults */.bd)(state/* appState */.XJ.runtime.cumulativeResults, allNewItems);
                        state/* appState */.XJ.runtime.cumulativeResults = markUnreturnedPreviousResultsForReview(mergedVerificationResults, existingResults, allNewItems, operationName);
                    }
                }
                else {
                    if (!Array.isArray(parsedResponse)) {
                        handleApiError("Invalid response format for initial run. Expected a JSON array.");
                        delete state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey];
                        return;
                    }
                    const filteredInitialResults = filterOfficialAliasOnlyFindings(parsedResponse, operationName);
                    filteredInitialResults.forEach((r) => (r.isNew = true));
                    const resultsToMerge = currentDepth >= targetDepth && filteredInitialResults.length > 0
                        ? markFinalInitialResultsForReview(filteredInitialResults)
                        : filteredInitialResults;
                    if (resultsToMerge !== filteredInitialResults) {
                        (0,utils/* log */.Rm)(`${operationName}: Final iteration produced ${filteredInitialResults.length} new unverified result${filteredInitialResults.length === 1 ? "" : "s"}; marking as Needs Review because no verification pass remains.`);
                    }
                    state/* appState */.XJ.runtime.cumulativeResults = (0,utils/* mergeAnalysisResults */.bd)(state/* appState */.XJ.runtime.cumulativeResults, resultsToMerge);
                }
                state/* appState */.XJ.runtime.cumulativeResults = normalizeActionableSuggestions(state/* appState */.XJ.runtime.cumulativeResults, operationName);
                state/* appState */.XJ.runtime.cumulativeResults = markPlaceholderArtifactResultsForReview(state/* appState */.XJ.runtime.cumulativeResults, operationName);
                state/* appState */.XJ.runtime.cumulativeResults = markLowEvidenceResultsForReview(state/* appState */.XJ.runtime.cumulativeResults, operationName);
                logResultSummary(operationName, state/* appState */.XJ.runtime.cumulativeResults);
                // Save session results after each iteration
                (0,state/* saveSessionResults */.I6)();
                // Continue to next iteration or complete
                state/* appState */.XJ.runtime.currentIteration = currentDepth < targetDepth ? currentDepth + 1 : targetDepth;
                if (currentDepth < targetDepth) {
                    // Next iteration; we keep per-iteration timing, so do not reset deepAnalysisStartTimes
                    setTimeout(() => {
                        findInconsistenciesDeepAnalysis(chapterData, state/* appState */.XJ.runtime.cumulativeResults, targetDepth, currentDepth + 1);
                    }, 1000);
                }
                else {
                    // Deep analysis complete for this path
                    delete state/* appState */.XJ.runtime.deepAnalysisStartTimes[iterationKey];
                    state/* appState */.XJ.runtime.isAnalysisRunning = false;
                    (0,ui/* updateStatusIndicator */.LI)("complete", `Complete! (Deep Analysis: ${targetDepth} iterations)`);
                    const continueBtn = document.getElementById("wtr-if-continue-btn");
                    if (continueBtn) {
                        continueBtn.disabled = false;
                    }
                    (0,ui/* displayResults */.Hv)(state/* appState */.XJ.runtime.cumulativeResults);
                }
            },
            onerror: function (error) {
                console.error("Inconsistency Finder: Network error:", error);
                (0,utils/* log */.Rm)(`${operationName}: Network error with key index ${currentKeyIndex}. Putting key on cooldown and retrying immediately with next key.`);
                state/* appState */.XJ.runtime.apiKeyCooldowns.set(currentKey, Date.now() + 1000); // 1-second cooldown
                // Immediate retry with next available key
                retryCount++;
                executeIteration();
            },
        });
    };
    executeIteration();
}

;// ./src/modules/geminiApi.ts
/* unused harmony import specifier */ var geminiApi_handleApiError;
/* unused harmony import specifier */ var geminiApi_buildPrompt;
/**
 * Gemini API Facade Module
 * Maintains 100% backward compatibility by re-exporting functions from modular submodules
 *
 * This module serves as a backward-compatible facade that delegates to the new modular structure:
 * - retryLogic.ts: Exponential backoff and retry scheduling
 * - promptManager.ts: AI prompt generation and management
 * - apiErrorHandler.ts: Centralized error handling
 * - analysisEngine.ts: Core analysis logic and API communication
 */



// ===== BACKWARD COMPATIBILITY RE-EXPORTS =====
// Re-export analysis engine functions for backward compatibility

// Re-export retry logic constants and functions

// Re-export prompt management functions

// Re-export error handling functions

// ===== BACKWARD COMPATIBILITY ALIASES =====
/**
 * Legacy alias for buildPrompt - maintains exact backward compatibility
 * @param {string} chapterText - The chapter text to analyze
 * @param {Array} existingResults - Results from previous analysis for context
 * @returns {string} - Generated prompt for the AI
 */
function generatePrompt(chapterText, existingResults = []) {
    return geminiApi_buildPrompt(chapterText, existingResults);
}
// ===== DEPRECATED FUNCTIONS (maintained for compatibility) =====
/**
 * Deprecated: This function is now handled internally by analysisEngine
 * Kept for backward compatibility but not recommended for new code
 * @param {string} errorMessage - The error message to handle
 * @deprecated Use handleApiError from apiErrorHandler module directly
 */
function deprecatedHandleApiError(errorMessage) {
    console.warn("deprecatedHandleApiError is deprecated. Use handleApiError from apiErrorHandler module directly.");
    geminiApi_handleApiError(errorMessage);
}
// ===== MODULE INITIALIZATION =====
// Log successful modular structure initialization when module loads
(0,utils/* log */.Rm)("Modular Gemini API structure loaded successfully");
(0,utils/* log */.Rm)("├── retryLogic.ts: Exponential backoff and retry scheduling");
(0,utils/* log */.Rm)("├── promptManager.ts: AI prompt generation and management");
(0,utils/* log */.Rm)("├── apiErrorHandler.ts: Centralized error handling");
(0,utils/* log */.Rm)("├── analysisEngine.ts: Core analysis logic and API communication");
(0,utils/* log */.Rm)("└── geminiApi.ts: Backward compatibility facade");


/***/ },

/***/ 980
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   $i: () => (/* binding */ getResponseFinishReason),
/* harmony export */   Bx: () => (/* binding */ buildModelsRequests),
/* harmony export */   Q2: () => (/* binding */ AI_PROVIDERS),
/* harmony export */   QQ: () => (/* binding */ isManualPathConfig),
/* harmony export */   Qk: () => (/* binding */ extractResponseText),
/* harmony export */   V1: () => (/* binding */ DEFAULT_PROVIDER_TYPE),
/* harmony export */   Zi: () => (/* binding */ parseModelsResponse),
/* harmony export */   _C: () => (/* binding */ providerUsesStreaming),
/* harmony export */   ac: () => (/* binding */ createOpenAiStreamState),
/* harmony export */   g: () => (/* binding */ buildAnalysisRequest),
/* harmony export */   gL: () => (/* binding */ parseModelCatalogEntries),
/* harmony export */   hV: () => (/* binding */ PROVIDER_DEFAULTS),
/* harmony export */   o_: () => (/* binding */ finalizeOpenAiStreamResponse),
/* harmony export */   tl: () => (/* binding */ getProviderDefaultTemperature),
/* harmony export */   uJ: () => (/* binding */ buildModelCatalogMetadata),
/* harmony export */   vy: () => (/* binding */ resolveProviderSettings),
/* harmony export */   yU: () => (/* binding */ consumeOpenAiStreamResponse)
/* harmony export */ });
/* unused harmony exports normalizeBaseUrl, normalizeApiPath, getProviderDefaults, getOpenAiCompatibleEndpointCandidates, buildModelsRequest, parseModelIdsFromCatalogPayload */
/**
 * Provider configuration and request helpers.
 */
const AI_PROVIDERS = Object.freeze({
    OPENAI_COMPATIBLE: "openai-compatible",
    GEMINI: "gemini",
});
const DEFAULT_PROVIDER_TYPE = AI_PROVIDERS.OPENAI_COMPATIBLE;
const PROVIDER_DEFAULTS = Object.freeze({
    [AI_PROVIDERS.OPENAI_COMPATIBLE]: Object.freeze({
        baseUrl: "https://api.openai.com/v1",
        chatCompletionsPath: "/chat/completions",
        modelsPath: "/models",
        modelLabel: "OpenAI-Compatible Model",
        apiKeyLabel: "[REDACTED] Keys",
        defaultTemperature: 0.5,
    }),
    [AI_PROVIDERS.GEMINI]: Object.freeze({
        baseUrl: "https://generativelanguage.googleapis.com/v1beta",
        chatCompletionsPath: "/chat/completions",
        modelsPath: "/models",
        modelLabel: "Gemini Model",
        apiKeyLabel: "[REDACTED] API Keys",
        defaultTemperature: 1.0,
    }),
});
const COMMON_VERSIONED_PREFIXES = ["/v1", "/api/v1", "/openai/v1", "/v1beta/openai"];
const OPENAI_STYLE_CHAT_PATH = "/chat/completions";
const OPENAI_STYLE_MODELS_PATH = "/models";
function ensureProviderType(providerType) {
    return providerType === AI_PROVIDERS.GEMINI ? AI_PROVIDERS.GEMINI : AI_PROVIDERS.OPENAI_COMPATIBLE;
}
function normalizeBaseUrl(value, fallback) {
    const candidate = typeof value === "string" ? value.trim() : "";
    return (candidate || fallback).replace(/\/+$/, "");
}
function normalizeApiPath(value, fallback) {
    const candidate = typeof value === "string" ? value.trim() : "";
    const normalized = candidate || fallback;
    const withLeadingSlash = normalized.startsWith("/") ? normalized : `/${normalized}`;
    return withLeadingSlash === "/" ? fallback : withLeadingSlash.replace(/\/+$/, "");
}
function getProviderDefaults(providerType) {
    return PROVIDER_DEFAULTS[ensureProviderType(providerType)];
}
function getProviderDefaultTemperature(providerType) {
    return getProviderDefaults(providerType).defaultTemperature;
}
function parseUrl(value) {
    try {
        return new URL(value);
    }
    catch {
        return null;
    }
}
function normalizeReasoningMode(value) {
    return value === "low" || value === "medium" || value === "high" ? value : "off";
}
function normalizeTemperature(value, providerType) {
    const fallback = getProviderDefaultTemperature(providerType);
    const parsed = typeof value === "number" ? value : Number.parseFloat(String(value ?? ""));
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.min(2, Math.max(0, parsed));
}
function isDeepSeekBase(url) {
    return Boolean(url?.hostname.toLowerCase().endsWith("deepseek.com"));
}
function isOllamaBase(url) {
    const host = url?.hostname.toLowerCase() || "";
    return host === "localhost" || host === "127.0.0.1" || host.includes("ollama");
}
function isAnthropicBase(url) {
    return Boolean(url?.hostname.toLowerCase().includes("anthropic"));
}
function hasKnownOpenAiPrefix(url) {
    const path = (url?.pathname || "").replace(/\/+$/, "");
    return COMMON_VERSIONED_PREFIXES.some((prefix) => path.endsWith(prefix)) || isDeepSeekBase(url);
}
function getCompatibilityPrefix(baseUrl) {
    const url = parseUrl(baseUrl);
    if (hasKnownOpenAiPrefix(url)) {
        return "";
    }
    return "/v1";
}
function deriveAutomaticPath(baseUrl, endpointType) {
    const suffix = endpointType === "chat" ? OPENAI_STYLE_CHAT_PATH : OPENAI_STYLE_MODELS_PATH;
    return `${getCompatibilityPrefix(baseUrl)}${suffix}`;
}
function pathMatchesAutomaticBase(baseUrl, path, endpointType) {
    return normalizeApiPath(path, "") === normalizeApiPath(deriveAutomaticPath(baseUrl, endpointType), "");
}
function isManualPathConfig(config = {}) {
    if (config.providerUseManualPaths === true) {
        return true;
    }
    if (config.providerType === AI_PROVIDERS.GEMINI) {
        return false;
    }
    const baseUrl = normalizeBaseUrl(config.providerBaseUrl, PROVIDER_DEFAULTS[AI_PROVIDERS.OPENAI_COMPATIBLE].baseUrl);
    const chatPath = config.providerChatCompletionsPath;
    const modelsPath = config.providerModelsPath;
    return Boolean((chatPath && !pathMatchesAutomaticBase(baseUrl, chatPath, "chat")) ||
        (modelsPath && !pathMatchesAutomaticBase(baseUrl, modelsPath, "models")));
}
function resolveProviderSettings(config = {}) {
    const providerType = ensureProviderType(config.providerType);
    const defaults = getProviderDefaults(providerType);
    const baseUrl = normalizeBaseUrl(config.providerBaseUrl, defaults.baseUrl);
    const useManualPaths = providerType === AI_PROVIDERS.OPENAI_COMPATIBLE && isManualPathConfig(config);
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
        defaultTemperature: defaults.defaultTemperature,
        useManualPaths,
    };
}
function createEndpointCandidate(baseUrl, path, description, isManual) {
    return {
        url: `${baseUrl}${path}`,
        path,
        description,
        isManual,
    };
}
function getOpenAiCompatibleEndpointCandidates(config = {}, endpointType) {
    const provider = resolveProviderSettings(config);
    const suffix = endpointType === "chat" ? OPENAI_STYLE_CHAT_PATH : OPENAI_STYLE_MODELS_PATH;
    if (provider.providerType !== AI_PROVIDERS.OPENAI_COMPATIBLE) {
        return [];
    }
    if (provider.useManualPaths) {
        const path = endpointType === "chat" ? provider.chatCompletionsPath : provider.modelsPath;
        return [createEndpointCandidate(provider.baseUrl, path, "manual advanced override", true)];
    }
    const candidates = [deriveAutomaticPath(provider.baseUrl, endpointType)];
    const url = parseUrl(provider.baseUrl);
    if (!hasKnownOpenAiPrefix(url)) {
        candidates.push(`/v1${suffix}`, `/api/v1${suffix}`, `/openai/v1${suffix}`, `/v1beta/openai${suffix}`, suffix);
    }
    const seen = new Set();
    return candidates
        .map((path) => normalizeApiPath(path, `${getCompatibilityPrefix(provider.baseUrl)}${suffix}`))
        .filter((path) => {
        const key = `${provider.baseUrl}${path}`;
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    })
        .map((path, index) => createEndpointCandidate(provider.baseUrl, path, index === 0 ? "automatic provider path" : "fallback probe path", false));
}
function providerUsesStreaming(config) {
    const provider = resolveProviderSettings(config);
    return provider.providerType === AI_PROVIDERS.OPENAI_COMPATIBLE;
}
function getConfiguredModelMetadata(config) {
    const modelId = typeof config.model === "string" ? config.model : "";
    if (!modelId || !config.providerModelMetadata) {
        return null;
    }
    return (config.providerModelMetadata[modelId] || config.providerModelMetadata[modelId.replace(/^models\//, "")] || null);
}
function getSupportedParameters(metadata) {
    if (!metadata || !Array.isArray(metadata.supportedParameters) || metadata.supportedParameters.length === 0) {
        return null;
    }
    return new Set(metadata.supportedParameters.map((parameter) => parameter.toLowerCase()));
}
function supportsOpenAiParameter(metadata, parameter) {
    const supportedParameters = getSupportedParameters(metadata);
    return supportedParameters ? supportedParameters.has(parameter.toLowerCase()) : null;
}
function modelSupportsTemperature(metadata) {
    if (metadata?.capabilities?.temperature === false) {
        return false;
    }
    return supportsOpenAiParameter(metadata, "temperature") !== false;
}
function modelSupportsReasoningEffort(model, metadata = null) {
    const parameterSupport = supportsOpenAiParameter(metadata, "reasoning_effort");
    if (metadata?.capabilities?.reasoning === true || parameterSupport === true) {
        return true;
    }
    if (metadata?.capabilities?.reasoning === false || parameterSupport === false) {
        return false;
    }
    const modelId = typeof model === "string" ? model.toLowerCase() : "";
    return /(^|[-_/])(o1|o3|o4|gpt-5|r1|qwq|qwen3|reasoning)([-_/]|$)/i.test(modelId);
}
function modelSupportsGeminiThinking(model) {
    const modelId = typeof model === "string" ? model.toLowerCase() : "";
    return modelId.includes("gemini-2.5") || modelId.includes("thinking");
}
function thinkingBudgetForEffort(reasoningMode) {
    switch (reasoningMode) {
        case "low":
            return 1024;
        case "medium":
            return 4096;
        case "high":
            return 8192;
        default:
            return 0;
    }
}
function buildGeminiGenerationConfig(config) {
    const reasoningMode = normalizeReasoningMode(config.reasoningMode);
    const generationConfig = {
        temperature: normalizeTemperature(config.temperature, AI_PROVIDERS.GEMINI),
    };
    if (reasoningMode !== "off" && modelSupportsGeminiThinking(config.model)) {
        generationConfig.thinkingConfig = {
            thinkingBudget: thinkingBudgetForEffort(reasoningMode),
        };
    }
    return generationConfig;
}
function buildOpenAiCompatibleBody(config) {
    const provider = resolveProviderSettings(config);
    const providerUrl = parseUrl(provider.baseUrl);
    const reasoningMode = normalizeReasoningMode(config.reasoningMode);
    const modelMetadata = getConfiguredModelMetadata(config);
    const metadataAllowsReasoning = modelSupportsReasoningEffort(config.model, modelMetadata);
    const supportsReasoning = reasoningMode !== "off" &&
        !isAnthropicBase(providerUrl) &&
        (metadataAllowsReasoning || isOllamaBase(providerUrl));
    const body = {
        model: config.model,
        stream: true,
        messages: [],
    };
    if (modelSupportsTemperature(modelMetadata) && !(supportsReasoning && metadataAllowsReasoning)) {
        body.temperature = normalizeTemperature(config.temperature, AI_PROVIDERS.OPENAI_COMPATIBLE);
    }
    if (supportsReasoning) {
        body.reasoning_effort = reasoningMode;
        if (isOllamaBase(providerUrl)) {
            body.reasoning = { effort: reasoningMode };
        }
    }
    return body;
}
function buildAnalysisRequest(config, apiKey, prompt) {
    const provider = resolveProviderSettings(config);
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
        };
    }
    const body = buildOpenAiCompatibleBody(config);
    body.messages = [{ role: "user", content: prompt }];
    return {
        method: "POST",
        url: `${provider.baseUrl}${provider.chatCompletionsPath}`,
        headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
        },
        data: JSON.stringify(body),
        endpointDescription: provider.useManualPaths ? "manual advanced override" : "automatic provider path",
    };
}
function extractOpenAiMessageText(content) {
    if (typeof content === "string") {
        return content;
    }
    if (!Array.isArray(content)) {
        return null;
    }
    const textParts = content
        .map((item) => {
        if (typeof item === "string") {
            return item;
        }
        if (!item || typeof item !== "object") {
            return "";
        }
        const record = item;
        if (typeof record.text === "string") {
            return record.text;
        }
        if (typeof record.content === "string") {
            return record.content;
        }
        return "";
    })
        .filter(Boolean);
    return textParts.length > 0 ? textParts.join("\n") : null;
}
function getRecord(value) {
    return value && typeof value === "object" ? value : null;
}
function getFirstArrayRecord(value) {
    return Array.isArray(value) ? getRecord(value[0]) : null;
}
function extractOpenAiDeltaText(delta) {
    return extractOpenAiMessageText(getRecord(delta)?.content);
}
function consumeOpenAiStreamLine(streamState, line) {
    const trimmedLine = typeof line === "string" ? line.trim() : "";
    if (!trimmedLine || trimmedLine.startsWith(":")) {
        return;
    }
    if (!trimmedLine.startsWith("data:")) {
        return;
    }
    const payloadText = trimmedLine.slice(5).trim();
    if (!payloadText) {
        return;
    }
    if (payloadText === "[DONE]") {
        streamState.done = true;
        return;
    }
    let payload;
    try {
        payload = JSON.parse(payloadText);
    }
    catch {
        return;
    }
    streamState.eventCount = Number(streamState.eventCount || 0) + 1;
    const payloadRecord = getRecord(payload);
    if (payloadRecord?.error) {
        streamState.errorPayload = payload;
        return;
    }
    const choice = getFirstArrayRecord(payloadRecord?.choices);
    const deltaText = extractOpenAiDeltaText(choice?.delta);
    if (deltaText) {
        streamState.text = `${String(streamState.text || "")}${deltaText}`;
    }
    if (choice?.finish_reason) {
        streamState.finishReason = choice.finish_reason;
    }
}
function createOpenAiStreamState() {
    return {
        processedLength: 0,
        pendingLine: "",
        text: "",
        finishReason: null,
        done: false,
        eventCount: 0,
        errorPayload: null,
    };
}
function consumeOpenAiStreamResponse(streamState, responseText) {
    if (!streamState || typeof responseText !== "string" || responseText.length === 0) {
        return streamState;
    }
    const processedLength = Number(streamState.processedLength || 0);
    const nextChunk = responseText.slice(processedLength);
    if (!nextChunk) {
        return streamState;
    }
    streamState.processedLength = responseText.length;
    const bufferedChunk = `${String(streamState.pendingLine || "")}${nextChunk}`;
    const lines = bufferedChunk.split(/\r?\n/);
    streamState.pendingLine = lines.pop() || "";
    lines.forEach((line) => consumeOpenAiStreamLine(streamState, line));
    return streamState;
}
function finalizeOpenAiStreamResponse(streamState, responseText) {
    if (!streamState) {
        return {
            isStreamResponse: false,
            text: null,
            finishReason: null,
            errorPayload: null,
        };
    }
    consumeOpenAiStreamResponse(streamState, responseText);
    if (String(streamState.pendingLine || "").trim()) {
        consumeOpenAiStreamLine(streamState, streamState.pendingLine);
        streamState.pendingLine = "";
    }
    return {
        isStreamResponse: Number(streamState.eventCount || 0) > 0 || Boolean(streamState.done),
        text: streamState.text || null,
        finishReason: streamState.finishReason || null,
        errorPayload: streamState.errorPayload,
    };
}
function extractResponseText(config, apiResponse) {
    const provider = resolveProviderSettings(config);
    const response = getRecord(apiResponse);
    if (provider.providerType === AI_PROVIDERS.GEMINI) {
        const candidate = getFirstArrayRecord(response?.candidates);
        const content = getRecord(candidate?.content);
        const part = getFirstArrayRecord(content?.parts);
        return typeof part?.text === "string" ? part.text : null;
    }
    const choice = getFirstArrayRecord(response?.choices);
    if (!choice) {
        return null;
    }
    if (typeof choice.text === "string") {
        return choice.text;
    }
    return extractOpenAiMessageText(getRecord(choice.message)?.content);
}
function getResponseFinishReason(config, apiResponse) {
    const provider = resolveProviderSettings(config);
    const response = getRecord(apiResponse);
    if (provider.providerType === AI_PROVIDERS.GEMINI) {
        return getFirstArrayRecord(response?.candidates)?.finishReason ?? null;
    }
    return getFirstArrayRecord(response?.choices)?.finish_reason ?? null;
}
function buildModelsRequest(config, apiKey) {
    const provider = resolveProviderSettings(config);
    if (provider.providerType === AI_PROVIDERS.GEMINI) {
        return {
            method: "GET",
            url: `${provider.baseUrl}/models?key=${encodeURIComponent(apiKey)}`,
            headers: {},
        };
    }
    const candidate = getOpenAiCompatibleEndpointCandidates(config, "models")[0];
    return {
        method: "GET",
        url: candidate.url,
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        endpointDescription: candidate.description,
    };
}
function buildModelsRequests(config, apiKey) {
    const provider = resolveProviderSettings(config);
    if (provider.providerType === AI_PROVIDERS.GEMINI) {
        return [buildModelsRequest(config, apiKey)];
    }
    return getOpenAiCompatibleEndpointCandidates(config, "models").map((candidate) => ({
        method: "GET",
        url: candidate.url,
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
        endpointDescription: candidate.description,
    }));
}
function toFiniteNumber(value) {
    const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}
function normalizeSupportedParameters(value) {
    if (!Array.isArray(value)) {
        return undefined;
    }
    const parameters = Array.from(new Set(value.filter((entry) => typeof entry === "string" && Boolean(entry.trim())))).map((entry) => entry.trim());
    return parameters.length > 0 ? parameters : undefined;
}
function modelCatalogEntryFromValue(value) {
    if (typeof value === "string") {
        const id = value.trim();
        return id ? { id } : null;
    }
    const record = getRecord(value);
    const rawId = record?.id || record?.name || record?.model;
    if (typeof rawId !== "string" || !rawId.trim()) {
        return null;
    }
    const contextLength = toFiniteNumber(record.context_length) ||
        toFiniteNumber(record.context_window) ||
        toFiniteNumber(record.max_context_tokens) ||
        toFiniteNumber(getRecord(record.limits)?.context_window);
    const maxCompletionTokens = toFiniteNumber(record.max_completion_tokens) ||
        toFiniteNumber(record.max_output_tokens) ||
        toFiniteNumber(getRecord(record.limits)?.max_output);
    return {
        id: rawId.trim(),
        displayName: typeof record.display_name === "string" ? record.display_name : undefined,
        ownedBy: typeof record.owned_by === "string" ? record.owned_by : undefined,
        description: typeof record.description === "string" ? record.description : undefined,
        contextLength,
        maxCompletionTokens,
        pricing: getRecord(record.pricing) || undefined,
        capabilities: getRecord(record.capabilities) || undefined,
        supportedParameters: normalizeSupportedParameters(record.supported_parameters),
        latestAliasFor: typeof record.latest_alias_for === "string" ? record.latest_alias_for : undefined,
    };
}
function parseModelCatalogEntries(payload) {
    let source = [];
    if (Array.isArray(payload)) {
        source = payload;
    }
    else {
        const record = getRecord(payload);
        if (Array.isArray(record?.data)) {
            source = record.data;
        }
        else if (Array.isArray(record?.models)) {
            source = record.models;
        }
    }
    const entriesById = new Map();
    source.forEach((entry) => {
        const normalizedEntry = modelCatalogEntryFromValue(entry);
        if (normalizedEntry) {
            entriesById.set(normalizedEntry.id, normalizedEntry);
        }
    });
    return Array.from(entriesById.values());
}
function buildModelCatalogMetadata(entries) {
    return entries.reduce((metadata, entry) => {
        metadata[entry.id] = entry;
        return metadata;
    }, {});
}
function parseModelIdsFromCatalogPayload(payload) {
    return parseModelCatalogEntries(payload).map((entry) => entry.id);
}
function parseModelsResponse(config, payload) {
    const provider = resolveProviderSettings(config);
    const response = getRecord(payload);
    if (provider.providerType === AI_PROVIDERS.GEMINI) {
        return Array.isArray(response?.models)
            ? response.models
                .filter((model) => {
                const modelRecord = getRecord(model);
                return (Array.isArray(modelRecord?.supportedGenerationMethods) &&
                    modelRecord.supportedGenerationMethods.includes("generateContent"));
            })
                .map((model) => getRecord(model)?.name)
                .filter((model) => typeof model === "string")
            : [];
    }
    return parseModelIdsFromCatalogPayload(payload);
}


/***/ },

/***/ 654
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ES: () => (/* binding */ MODELS_CACHE_KEY),
/* harmony export */   I6: () => (/* binding */ saveSessionResults),
/* harmony export */   XJ: () => (/* binding */ appState),
/* harmony export */   Z9: () => (/* binding */ loadConfig),
/* harmony export */   gH: () => (/* binding */ updateKeyState),
/* harmony export */   gb: () => (/* binding */ getNextAvailableKey),
/* harmony export */   ne: () => (/* binding */ getModelsCacheBucket),
/* harmony export */   qk: () => (/* binding */ clearSessionResults),
/* harmony export */   ql: () => (/* binding */ saveConfig)
/* harmony export */ });
/* unused harmony exports CONFIG_KEY, SESSION_RESULTS_KEY, KEY_STATE_KEY, loadKeyStates, saveKeyStates, initializeKeyStates */
/* harmony import */ var _providerConfig__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(980);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(158);
// src/modules/state.ts


const SCRIPT_PREFIX = "wtr_inconsistency_finder_";
const CONFIG_KEY = `${SCRIPT_PREFIX}config`;
const MODELS_CACHE_KEY = `${SCRIPT_PREFIX}models_cache`;
const SESSION_RESULTS_KEY = `${SCRIPT_PREFIX}session_results`;
const KEY_STATE_KEY = `${SCRIPT_PREFIX}key_states`; // Persistent key state tracking
const appState = {
    // Configuration
    config: {
        apiKeys: [],
        providerType: _providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .DEFAULT_PROVIDER_TYPE */ .V1,
        providerBaseUrl: _providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .PROVIDER_DEFAULTS */ .hV[_providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .DEFAULT_PROVIDER_TYPE */ .V1].baseUrl,
        providerChatCompletionsPath: _providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .PROVIDER_DEFAULTS */ .hV[_providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .DEFAULT_PROVIDER_TYPE */ .V1].chatCompletionsPath,
        providerModelsPath: _providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .PROVIDER_DEFAULTS */ .hV[_providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .DEFAULT_PROVIDER_TYPE */ .V1].modelsPath,
        providerUseManualPaths: false,
        model: "",
        useJson: false,
        useLiveTermReplacerSync: true,
        chapterSource: "page",
        wtrApiRangeMode: "nearby",
        wtrApiPreviousChapters: 2,
        wtrApiNextChapters: 2,
        wtrApiStartChapter: "",
        wtrApiEndChapter: "",
        useOfficialWtrGlossary: true,
        loggingEnabled: false,
        temperature: _providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .PROVIDER_DEFAULTS */ .hV[_providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .DEFAULT_PROVIDER_TYPE */ .V1].defaultTemperature,
        reasoningMode: "off",
        activeTab: "finder",
        activeFilter: "all",
        deepAnalysisDepth: 1,
    },
    // Runtime state
    runtime: {
        isAnalysisRunning: false,
        cumulativeResults: [],
        currentApiKeyIndex: 0,
        apiKeyCooldowns: new Map(),
        failedKeys: new Set(), // Track keys that have failed due to quota exhaustion
        providerModelMetadata: {},
        officialGlossaryContext: null,
        currentIteration: 1,
        totalIterations: 1,
    },
    // Session data
    session: {
        hasSavedResults: false,
        lastAnalysisTime: null,
    },
    // User preferences
    preferences: {
        autoRestoreResults: true,
    },
};
// --- DATA SANITIZATION ---
function sanitizeSuggestionData(suggestion) {
    // Enhanced suggestion sanitization with multiple fallback strategies
    const sanitized = { ...suggestion };
    // Fix missing or invalid suggestion field
    if (!sanitized.suggestion || typeof sanitized.suggestion !== "string" || sanitized.suggestion.trim() === "") {
        // Try to extract from display_text
        if (sanitized.display_text && typeof sanitized.display_text === "string") {
            // Remove common prefixes and extract the actual suggestion
            const cleaned = sanitized.display_text
                .replace(/^(standardize to|use|change to|replace with|update to)\s*/i, "")
                .replace(/^['"`]|['"`]$/g, "") // Remove surrounding quotes
                .trim();
            if (cleaned && cleaned !== sanitized.display_text) {
                sanitized.suggestion = cleaned;
            }
            else if (cleaned) {
                sanitized.suggestion = cleaned;
            }
        }
    }
    // Ensure suggestion field is valid
    if (!sanitized.suggestion || typeof sanitized.suggestion !== "string" || sanitized.suggestion.trim() === "") {
        // Last resort: use concept name or mark as non-actionable
        sanitized.suggestion = sanitized.display_text || "[Informational]";
    }
    // Clean up other fields
    sanitized.display_text = sanitized.display_text || `Use "${sanitized.suggestion}"`;
    sanitized.reasoning = sanitized.reasoning || "AI-generated suggestion";
    return sanitized;
}
function sanitizeResultsData(results) {
    // Sanitize all results to fix corrupted suggestion data from restored sessions
    return results.map((result) => {
        if (!result.suggestions || !Array.isArray(result.suggestions)) {
            return result;
        }
        return {
            ...result,
            suggestions: result.suggestions.map(sanitizeSuggestionData),
        };
    });
}
// --- STATE MANAGEMENT FUNCTIONS ---
async function loadConfig() {
    const savedConfig = (await GM_getValue(CONFIG_KEY, {}));
    // --- Migration for single API key to multiple ---
    if (savedConfig.apiKey && !savedConfig.apiKeys) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("Migrating legacy single API key to new array format.");
        savedConfig.apiKeys = [savedConfig.apiKey];
        delete savedConfig.apiKey;
    }
    // --- End Migration ---
    const looksLikeLegacyGeminiConfig = !savedConfig.providerType &&
        (Array.isArray(savedConfig.apiKeys) ||
            typeof savedConfig.apiKey === "string" ||
            typeof savedConfig.model === "string");
    if (looksLikeLegacyGeminiConfig) {
        savedConfig.providerType = _providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .AI_PROVIDERS */ .Q2.GEMINI;
        (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("Migrating legacy Gemini configuration to provider-aware settings.");
    }
    const providerType = savedConfig.providerType || _providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .DEFAULT_PROVIDER_TYPE */ .V1;
    const providerDefaults = _providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .PROVIDER_DEFAULTS */ .hV[providerType === _providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .AI_PROVIDERS */ .Q2.GEMINI ? _providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .AI_PROVIDERS */ .Q2.GEMINI : _providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .DEFAULT_PROVIDER_TYPE */ .V1];
    if (!savedConfig.providerBaseUrl) {
        savedConfig.providerBaseUrl = providerDefaults.baseUrl;
    }
    if (!savedConfig.providerChatCompletionsPath) {
        savedConfig.providerChatCompletionsPath = providerDefaults.chatCompletionsPath;
    }
    if (!savedConfig.providerModelsPath) {
        savedConfig.providerModelsPath = providerDefaults.modelsPath;
    }
    if (typeof savedConfig.providerUseManualPaths !== "boolean") {
        savedConfig.providerUseManualPaths = (0,_providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .isManualPathConfig */ .QQ)(savedConfig);
    }
    if (typeof savedConfig.reasoningMode !== "string") {
        savedConfig.reasoningMode = "off";
    }
    if (savedConfig.chapterSource !== "wtr-api") {
        savedConfig.chapterSource = "page";
    }
    if (savedConfig.wtrApiRangeMode !== "custom") {
        savedConfig.wtrApiRangeMode = "nearby";
    }
    if (typeof savedConfig.wtrApiPreviousChapters !== "number") {
        savedConfig.wtrApiPreviousChapters = 2;
    }
    if (typeof savedConfig.wtrApiNextChapters !== "number") {
        savedConfig.wtrApiNextChapters = 2;
    }
    if (typeof savedConfig.wtrApiStartChapter !== "string" && typeof savedConfig.wtrApiStartChapter !== "number") {
        savedConfig.wtrApiStartChapter = "";
    }
    if (typeof savedConfig.wtrApiEndChapter !== "string" && typeof savedConfig.wtrApiEndChapter !== "number") {
        savedConfig.wtrApiEndChapter = "";
    }
    if (typeof savedConfig.useOfficialWtrGlossary !== "boolean") {
        savedConfig.useOfficialWtrGlossary = true;
    }
    if (typeof savedConfig.temperature !== "number") {
        savedConfig.temperature = providerDefaults.defaultTemperature;
    }
    // Load preferences from saved config if they exist
    if (savedConfig.preferences) {
        appState.preferences = {
            ...appState.preferences,
            ...savedConfig.preferences,
        };
        (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("Loaded preferences from config:", appState.preferences);
    }
    appState.config = {
        ...appState.config,
        ...savedConfig,
    };
    const resolvedProvider = (0,_providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .resolveProviderSettings */ .vy)(appState.config);
    appState.config.providerType = resolvedProvider.providerType;
    appState.config.providerBaseUrl = resolvedProvider.baseUrl;
    appState.config.providerChatCompletionsPath = resolvedProvider.chatCompletionsPath;
    appState.config.providerModelsPath = resolvedProvider.modelsPath;
    appState.config.providerUseManualPaths = resolvedProvider.useManualPaths;
    // Load session results if available
    const sessionResults = sessionStorage.getItem(SESSION_RESULTS_KEY);
    if (sessionResults) {
        try {
            const parsed = JSON.parse(sessionResults);
            const rawResults = parsed.results || [];
            // CRITICAL: Sanitize restored results to fix corrupted suggestion data
            const sanitizedResults = sanitizeResultsData(rawResults);
            appState.runtime.cumulativeResults = sanitizedResults;
            appState.session.hasSavedResults = true;
            appState.session.lastAnalysisTime = parsed.timestamp;
            (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("Session results loaded and sanitized:", appState.runtime.cumulativeResults.length, "items");
            // Log any sanitization that was performed
            if (sanitizedResults.length !== rawResults.length) {
                (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("🔧 Data sanitization: Results count changed during cleanup");
            }
            else {
                // Check if any suggestions were modified
                let modifiedSuggestions = 0;
                for (let i = 0; i < sanitizedResults.length; i++) {
                    const original = rawResults[i];
                    const sanitized = sanitizedResults[i];
                    if (original.suggestions && sanitized.suggestions) {
                        for (let j = 0; j < sanitized.suggestions.length; j++) {
                            if (original.suggestions[j]?.suggestion !== sanitized.suggestions[j]?.suggestion) {
                                modifiedSuggestions++;
                            }
                        }
                    }
                }
                if (modifiedSuggestions > 0) {
                    (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)(`🔧 Data sanitization: Fixed ${modifiedSuggestions} corrupted suggestion fields`);
                }
            }
        }
        catch (e) {
            (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("Failed to parse session results:", e);
        }
    }
}
async function saveConfig() {
    try {
        const resolvedProvider = (0,_providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .resolveProviderSettings */ .vy)(appState.config);
        const configToSave = {
            ...appState.config,
            providerType: resolvedProvider.providerType,
            providerBaseUrl: resolvedProvider.baseUrl,
            providerChatCompletionsPath: resolvedProvider.chatCompletionsPath,
            providerModelsPath: resolvedProvider.modelsPath,
            providerUseManualPaths: resolvedProvider.useManualPaths,
            preferences: appState.preferences,
        };
        await GM_setValue(CONFIG_KEY, configToSave);
        return true;
    }
    catch (e) {
        console.error("Inconsistency Finder: Error saving config:", e);
        return false;
    }
}
function getModelsCacheBucket(config = appState.config) {
    const provider = (0,_providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .resolveProviderSettings */ .vy)(config);
    return [provider.providerType, provider.baseUrl.toLowerCase(), provider.modelsPath].join("|");
}
function getKeyStateScope(config = appState.config) {
    const provider = (0,_providerConfig__WEBPACK_IMPORTED_MODULE_0__/* .resolveProviderSettings */ .vy)(config);
    return [
        provider.providerType,
        provider.baseUrl.toLowerCase(),
        provider.chatCompletionsPath,
        provider.modelsPath,
    ].join("|");
}
function getKeyFingerprint(apiKey) {
    const normalizedKey = typeof apiKey === "string" ? apiKey.trim() : "";
    if (!normalizedKey) {
        return "empty";
    }
    let hash = 5381;
    for (let i = 0; i < normalizedKey.length; i++) {
        hash = (hash * 33) ^ normalizedKey.charCodeAt(i);
    }
    return `${normalizedKey.length}:${(hash >>> 0).toString(16)}`;
}
function createInitialKeyState(apiKey, scope, now = Date.now()) {
    return {
        status: "AVAILABLE",
        unlockTime: 0,
        lastUsed: null,
        failureCount: 0,
        lastReset: now,
        keyFingerprint: getKeyFingerprint(apiKey),
        scope,
    };
}
function saveSessionResults() {
    try {
        const sessionData = {
            results: appState.runtime.cumulativeResults,
            timestamp: Date.now(),
            config: {
                model: appState.config.model,
                temperature: appState.config.temperature,
            },
        };
        sessionStorage.setItem(SESSION_RESULTS_KEY, JSON.stringify(sessionData));
        appState.session.hasSavedResults = true;
        appState.session.lastAnalysisTime = sessionData.timestamp;
        (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("Session results saved");
    }
    catch (e) {
        console.error("Inconsistency Finder: Error saving session results:", e);
    }
}
function clearSessionResults() {
    try {
        sessionStorage.removeItem(SESSION_RESULTS_KEY);
        appState.session.hasSavedResults = false;
        appState.session.lastAnalysisTime = null;
        (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("Session results cleared");
    }
    catch (e) {
        console.error("Inconsistency Finder: Error clearing session results:", e);
    }
}
// --- KEY STATE MANAGEMENT ---
/**
 * Load persisted key states from localStorage
 * States: AVAILABLE, ON_COOLDOWN, EXHAUSTED, INVALID
 */
function loadKeyStates() {
    try {
        const savedStates = GM_getValue(KEY_STATE_KEY, {}) || {};
        const now = Date.now();
        const normalizedStates = {};
        Object.keys(savedStates).forEach((key) => {
            const parsedIndex = parseInt(key, 10);
            const index = Number.isNaN(parsedIndex) ? key : parsedIndex;
            const raw = savedStates[key] || {};
            // Defensive normalization
            const status = raw.status || "AVAILABLE";
            const unlockTime = typeof raw.unlockTime === "number" && Number.isFinite(raw.unlockTime) ? raw.unlockTime : 0;
            const failureCount = typeof raw.failureCount === "number" && raw.failureCount >= 0 ? raw.failureCount : 0;
            const keyFingerprint = typeof raw.keyFingerprint === "string" ? raw.keyFingerprint : null;
            const scope = typeof raw.scope === "string" ? raw.scope : null;
            let normalizedStatus = status;
            let normalizedUnlockTime = unlockTime;
            // Auto-refresh cooldown expiry on load to avoid stale "ON_COOLDOWN"
            if (normalizedStatus === "ON_COOLDOWN" && now > normalizedUnlockTime) {
                normalizedStatus = "AVAILABLE";
                normalizedUnlockTime = 0;
            }
            normalizedStates[index] = {
                status: normalizedStatus,
                unlockTime: normalizedUnlockTime,
                lastUsed: typeof raw.lastUsed === "number" && Number.isFinite(raw.lastUsed) ? raw.lastUsed : null,
                failureCount,
                lastReset: typeof raw.lastReset === "number" && Number.isFinite(raw.lastReset)
                    ? raw.lastReset
                    : raw.lastReset || null,
                keyFingerprint,
                scope,
            };
        });
        // Persist normalized states if any structural or semantic differences exist.
        const serializedOriginal = JSON.stringify(savedStates);
        const serializedNormalized = JSON.stringify(normalizedStates);
        if (serializedOriginal !== serializedNormalized) {
            saveKeyStates(normalizedStates);
            (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("Normalized API key states on load to prevent stale cooldown or invalid metadata.");
        }
        return normalizedStates;
    }
    catch (e) {
        console.error("Inconsistency Finder: Error loading key states:", e);
        return {};
    }
}
/**
 * Save key states to localStorage for persistence across page reloads
 */
function saveKeyStates(keyStates) {
    try {
        GM_setValue(KEY_STATE_KEY, keyStates);
    }
    catch (e) {
        console.error("Inconsistency Finder: Error saving key states:", e);
    }
}
/**
 * Initialize key states for all available keys
 */
function initializeKeyStates() {
    const keyStates = loadKeyStates();
    const now = Date.now();
    const scope = getKeyStateScope();
    let hasChanges = false;
    if (appState.config.apiKeys) {
        appState.config.apiKeys.forEach((key, index) => {
            const expectedFingerprint = getKeyFingerprint(key);
            const existingState = keyStates[index];
            const keyIdentityChanged = !existingState || existingState.scope !== scope || existingState.keyFingerprint !== expectedFingerprint;
            if (keyIdentityChanged) {
                keyStates[index] = createInitialKeyState(key, scope, now);
                hasChanges = true;
                if (existingState) {
                    (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)(`Reset API key state for slot ${index + 1} after key/provider change.`);
                }
                return;
            }
            // Check if cooldown has expired
            if (keyStates[index].status === "ON_COOLDOWN" && now > keyStates[index].unlockTime) {
                keyStates[index].status = "AVAILABLE";
                keyStates[index].unlockTime = 0;
                keyStates[index].failureCount = 0;
                hasChanges = true;
            }
            // Check if daily reset has occurred (for exhausted keys)
            if (keyStates[index].status === "EXHAUSTED") {
                const lastReset = keyStates[index].lastReset || now;
                const daysSinceReset = Math.floor((now - lastReset) / (24 * 60 * 60 * 1000));
                if (daysSinceReset >= 1) {
                    keyStates[index] = createInitialKeyState(key, scope, now);
                    hasChanges = true;
                }
            }
        });
    }
    if (hasChanges) {
        saveKeyStates(keyStates);
    }
    return keyStates;
}
/**
 * Update the state of a specific key
 */
function updateKeyState(keyIndex, status, unlockTime = null, failureCount = 0) {
    const keyStates = loadKeyStates();
    const now = Date.now();
    const scope = getKeyStateScope();
    const apiKey = appState.config.apiKeys?.[keyIndex] || "";
    const keyFingerprint = getKeyFingerprint(apiKey);
    if (!keyStates[keyIndex] ||
        keyStates[keyIndex].scope !== scope ||
        keyStates[keyIndex].keyFingerprint !== keyFingerprint) {
        keyStates[keyIndex] = createInitialKeyState(apiKey, scope, now);
    }
    // Ensure unlockTime is numeric
    const safeUnlockTime = typeof unlockTime === "number" && Number.isFinite(unlockTime) ? unlockTime : 0;
    // Normalize: if setting ON_COOLDOWN with past unlockTime (time drift), treat as AVAILABLE.
    let nextStatus = status;
    let nextUnlockTime = safeUnlockTime;
    if (nextStatus === "ON_COOLDOWN" && now > safeUnlockTime) {
        nextStatus = "AVAILABLE";
        nextUnlockTime = 0;
    }
    const prevFailureCount = typeof keyStates[keyIndex].failureCount === "number" ? keyStates[keyIndex].failureCount : 0;
    const nextFailureCount = nextStatus === "AVAILABLE"
        ? 0
        : nextStatus === "INVALID"
            ? Math.max(1, prevFailureCount + failureCount)
            : Math.max(0, prevFailureCount + failureCount);
    keyStates[keyIndex] = {
        ...keyStates[keyIndex],
        status: nextStatus,
        unlockTime: nextUnlockTime,
        lastUsed: now,
        failureCount: nextFailureCount,
        lastReset: nextStatus === "EXHAUSTED" ? now : keyStates[keyIndex].lastReset,
        keyFingerprint,
        scope,
    };
    saveKeyStates(keyStates);
    return keyStates[keyIndex];
}
/**
 * Get the next available key according to state management rules
 */
function getNextAvailableKey() {
    const keyStates = initializeKeyStates();
    const now = Date.now();
    if (!appState.config.apiKeys || appState.config.apiKeys.length === 0) {
        return null;
    }
    // Proactively refresh any keys whose cooldown has expired based on real-time clock.
    // This ensures that after inactivity, the first attempt sees available keys
    // without requiring a prior failure to trigger a state refresh.
    let refreshNeeded = false;
    for (let i = 0; i < appState.config.apiKeys.length; i++) {
        const state = keyStates[i];
        if (state &&
            state.status === "ON_COOLDOWN" &&
            typeof state.unlockTime === "number" &&
            Number.isFinite(state.unlockTime) &&
            now > state.unlockTime) {
            keyStates[i] = {
                ...state,
                status: "AVAILABLE",
                unlockTime: 0,
            };
            refreshNeeded = true;
        }
    }
    if (refreshNeeded) {
        saveKeyStates(keyStates);
        (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("Inconsistency Finder: Refreshed API key cooldown states before selection.");
    }
    // First pass: look for AVAILABLE keys
    for (let i = 0; i < appState.config.apiKeys.length; i++) {
        const keyIndex = (appState.runtime.currentApiKeyIndex + i) % appState.config.apiKeys.length;
        const keyState = keyStates[keyIndex];
        if (keyState && keyState.status === "AVAILABLE") {
            // Found an available key
            updateKeyState(keyIndex, "AVAILABLE", 0, -1); // Reset failure count
            appState.runtime.currentApiKeyIndex = (keyIndex + 1) % appState.config.apiKeys.length;
            return {
                key: appState.config.apiKeys[keyIndex],
                index: keyIndex,
                state: keyState,
            };
        }
    }
    // Second pass: check for keys whose cooldown has expired
    for (let i = 0; i < appState.config.apiKeys.length; i++) {
        const keyIndex = (appState.runtime.currentApiKeyIndex + i) % appState.config.apiKeys.length;
        const keyState = keyStates[keyIndex];
        if (keyState && keyState.status === "ON_COOLDOWN" && now > keyState.unlockTime) {
            // Cooldown expired, make it available
            updateKeyState(keyIndex, "AVAILABLE", 0, -1);
            appState.runtime.currentApiKeyIndex = (keyIndex + 1) % appState.config.apiKeys.length;
            return {
                key: appState.config.apiKeys[keyIndex],
                index: keyIndex,
                state: keyStates[keyIndex],
            };
        }
    }
    // No keys available, find the one that will be available soonest
    let soonestKey = null;
    let soonestTime = Infinity;
    for (let i = 0; i < appState.config.apiKeys.length; i++) {
        const keyState = keyStates[i];
        if (keyState && keyState.status === "ON_COOLDOWN" && keyState.unlockTime < soonestTime) {
            soonestKey = i;
            soonestTime = keyState.unlockTime;
        }
    }
    if (soonestKey !== null) {
        const waitTime = Math.max(0, soonestTime - now);
        const minutes = Math.ceil(waitTime / (60 * 1000));
        (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)(`All keys are currently unavailable. Next key (index ${soonestKey}) will be available in ${minutes} minutes.`);
    }
    else {
        (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("All available API keys are permanently invalid or exhausted.");
    }
    return null; // No keys currently available
}


/***/ },

/***/ 200
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   H: () => (/* binding */ displayResults)
/* harmony export */ });
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(654);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(158);
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(753);
// src/modules/ui/display.ts



const loggedNonActionableSuggestions = new Set();
function getStatusBadge(group) {
    if (group.status === "Verified") {
        return '<span class="wtr-if-verified-badge">Verified</span>';
    }
    if (group.status === "Needs Review") {
        return '<span class="wtr-if-review-badge" title="Latest verification returned no items, so this finding was preserved for review.">Needs Review</span>';
    }
    return "";
}
function displayResults(results) {
    // Ensure we render only into the dedicated results container inside Finder tab.
    const finderTab = document.getElementById("wtr-if-tab-finder");
    const resultsContainer = (finderTab && finderTab.querySelector("#wtr-if-results")) || document.getElementById("wtr-if-results");
    if (!resultsContainer) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)("displayResults: No #wtr-if-results container found; aborting render.");
        return;
    }
    // Only clear the dynamic results area, never the entire Finder tab wrapper.
    resultsContainer.innerHTML = "";
    const filterValue = document.getElementById("wtr-if-filter-select")?.value || "all";
    let displayedResults = results.filter((r) => !r.error && r.concept);
    const errors = results.filter((r) => r.error);
    if (filterValue === "new") {
        displayedResults = displayedResults.filter((r) => r.isNew);
    }
    else if (filterValue === "verified") {
        displayedResults = displayedResults.filter((r) => r.status === "Verified");
    }
    else if (filterValue !== "all") {
        displayedResults = displayedResults.filter((r) => r.priority === filterValue);
    }
    if (displayedResults.length === 0 && errors.length === 0) {
        resultsContainer.innerHTML =
            '<div class="wtr-if-no-results">No inconsistencies found matching the current filter.</div>';
        return;
    }
    const priorityOrder = {
        CRITICAL: 1,
        HIGH: 2,
        MEDIUM: 3,
        LOW: 4,
        STYLISTIC: 5,
        INFO: 6,
    };
    displayedResults.sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));
    // Append successful results first
    const successFragment = document.createDocumentFragment();
    displayedResults.forEach((group) => {
        const groupEl = document.createElement("div");
        groupEl.className = "wtr-if-result-group";
        const uniqueVariations = [...new Set(group.variations.map((v) => v.phrase))];
        const variationsJson = JSON.stringify(uniqueVariations);
        const suggestionsHtml = (group.suggestions || [])
            .map((sugg, suggIndex) => {
            // ENHANCED VALIDATION & FALLBACK LOGIC
            const rawSuggestion = sugg.suggestion;
            const suggestionType = typeof rawSuggestion;
            const isValidSuggestion = suggestionType === "string" && rawSuggestion && rawSuggestion.trim() !== "";
            // FALLBACK HIERARCHY: suggestion -> cleaned display_text -> skip
            let finalSuggestionValue = "";
            let isActionable = false;
            if (isValidSuggestion) {
                // Primary: Use raw suggestion if valid
                finalSuggestionValue = rawSuggestion.trim();
                isActionable = true;
            }
            else if (sugg.display_text && sugg.display_text.trim()) {
                // Secondary: Extract actionable text from display_text
                const cleanedDisplayText = sugg.display_text
                    .replace(/^(standardize to|use|change to|replace with|update to)\s*/i, "")
                    .replace(/^['"`]|['"`]$/g, "") // Remove surrounding quotes
                    .trim();
                if (cleanedDisplayText && cleanedDisplayText !== sugg.display_text) {
                    finalSuggestionValue = cleanedDisplayText;
                    isActionable = true;
                }
            }
            // Debug logging for suggestion validation (only if enabled)
            if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.loggingEnabled && !isActionable) {
                const suggestionLogKey = [group.concept, suggIndex, sugg.display_text || rawSuggestion || ""]
                    .map((part) => part || "")
                    .join("|");
                if (!loggedNonActionableSuggestions.has(suggestionLogKey)) {
                    loggedNonActionableSuggestions.add(suggestionLogKey);
                    (0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .log */ .Rm)(`Suggestion validation skipped actionable output for "${group.concept}" #${suggIndex}.`, {
                        originalSuggestion: rawSuggestion,
                        displayText: sugg.display_text,
                    });
                }
            }
            const replacementText = isActionable
                ? `<code>${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(finalSuggestionValue)}</code>`
                : "<em>(Informational, no replacement)</em>";
            const buttonState = isActionable ? "" : "disabled";
            const applyTitle = isActionable
                ? `Apply '${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(finalSuggestionValue)}'`
                : "No direct replacement";
            const recommendedBadge = sugg.is_recommended
                ? '<span class="wtr-if-recommended-badge">Recommended</span>'
                : "";
            return `
             <div class="wtr-if-suggestion-item">
                 <div class="wtr-if-suggestion-header">
                     <span class="wtr-if-correct">${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(sugg.display_text || rawSuggestion || "No suggestion available")} ${recommendedBadge}</span>
                     <div class="wtr-if-suggestion-actions">
                         <button class="wtr-if-apply-btn" data-action="apply-selected" data-suggestion="${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(finalSuggestionValue)}" title="${applyTitle} to selected variations" ${buttonState}>Apply Selected</button>
                         <button class="wtr-if-apply-btn" data-action="apply-all" data-suggestion="${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(finalSuggestionValue)}" data-variations='${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(variationsJson)}' title="${applyTitle} to all variations" ${buttonState}>Apply All</button>
                     </div>
                 </div>
                 <p class="wtr-if-replacement-info"><strong>Replacement:</strong> ${replacementText}</p>
                 <p class="wtr-if-reasoning">${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(sugg.reasoning)}</p>
             </div>
             `;
        })
            .join("");
        groupEl.innerHTML = `
                <div class="wtr-if-group-header">
                    <h3>
                        <span class="wtr-if-priority wtr-if-priority-${(group.priority || "info").toLowerCase()}">${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(group.priority || "INFO")}</span>
                        Concept: <span class="wtr-if-concept">${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(group.concept)}</span>
                        ${getStatusBadge(group)}
                    </h3>
                    <p class="wtr-if-explanation">${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(group.explanation)}</p>
                </div>
                <div class="wtr-if-details-section">
                    <h4>Variations Found</h4>
                    <div class="wtr-if-variations">
                        ${(group.variations || [])
            .map((item) => `
                        <div class="wtr-if-variation-item">
                            <div class="wtr-if-variation-header">
                                <input type="checkbox" class="wtr-if-variation-checkbox" value="${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(item.phrase)}" title="Select this variation">
                                <button class="wtr-if-copy-variation-btn" data-text="${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(item.phrase)}" title="Copy variation text">📋</button>
                                <span class="wtr-if-incorrect">"${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(item.phrase)}"</span>
                                <span class="wtr-if-chapter">Chapter ${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(item.chapter)}</span>
                            </div>
                            <p class="wtr-if-context"><strong>Context:</strong> <em>"...${(0,_utils__WEBPACK_IMPORTED_MODULE_1__/* .escapeHtml */ .ZD)(item.context_snippet)}..."</em></p>
                        </div>
                        `)
            .join("")}
                    </div>
                </div>
                <div class="wtr-if-details-section">
                    <h4>Suggestions</h4>
                    <div class="wtr-if-suggestions">
                        ${suggestionsHtml}
                    </div>
                </div>
            `;
        successFragment.appendChild(groupEl);
    });
    resultsContainer.appendChild(successFragment);
    // Prepend errors to the top
    errors
        .slice()
        .reverse()
        .forEach((err) => {
        const errorEl = document.createElement("div");
        errorEl.className = "wtr-if-error";
        errorEl.textContent = err.error;
        resultsContainer.prepend(errorEl);
    });
    // Wire up Apply/Copy buttons for each suggestion group
    const finderScope = document.getElementById("wtr-if-tab-finder") || resultsContainer;
    if (finderScope) {
        finderScope.querySelectorAll(".wtr-if-apply-btn").forEach((btn) => {
            // Ensure per-result buttons are reliably discoverable for mode switching
            if (!btn.dataset.role) {
                btn.dataset.role = "wtr-if-apply-action";
            }
            if (!btn.dataset.scope) {
                const action = btn.dataset.action || "";
                if (action.endsWith("-selected")) {
                    btn.dataset.scope = "selected";
                }
                else if (action.endsWith("-all")) {
                    btn.dataset.scope = "all";
                }
            }
            btn.addEventListener("click", _events__WEBPACK_IMPORTED_MODULE_2__/* .handleApplyClick */ .B7);
        });
    }
    // Wire up individual variation copy buttons
    resultsContainer
        .querySelectorAll(".wtr-if-copy-variation-btn")
        .forEach((btn) => btn.addEventListener("click", _events__WEBPACK_IMPORTED_MODULE_2__/* .handleCopyVariationClick */ .pS));
    // Ensure Apply/Copy button modes are synchronized after results are rendered
    (0,_events__WEBPACK_IMPORTED_MODULE_2__.updateApplyCopyButtonsMode)();
}


/***/ },

/***/ 753
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   B7: () => (/* binding */ handleApplyClick),
/* harmony export */   Zo: () => (/* binding */ handleRestoreSession),
/* harmony export */   lQ: () => (/* binding */ addEventListeners),
/* harmony export */   pS: () => (/* binding */ handleCopyVariationClick),
/* harmony export */   updateApplyCopyButtonsMode: () => (/* binding */ updateApplyCopyButtonsMode)
/* harmony export */ });
/* unused harmony exports handleSaveConfig, handleFindInconsistencies, handleContinueAnalysis, handleFileImportAndAnalyze, handleClearSession, handleStatusClick */
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(654);
/* harmony import */ var _providerConfig__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(980);
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(158);
/* harmony import */ var _geminiApi__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(598);
/* harmony import */ var _panel__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(675);
/* harmony import */ var _display__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(200);
/* harmony import */ var _wtrLabApi__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(41);
// src/modules/ui/events.ts







function summarizeChapterCollection(chapterData) {
    return (Array.isArray(chapterData) ? chapterData : []).map((chapter) => ({
        chapter: chapter.chapter,
        title: chapter.title || "",
        textLength: typeof chapter.text === "string" ? chapter.text.length : 0,
        charCount: chapter.charCount || null,
        placeholderCount: chapter.placeholderCount || 0,
        glossaryTermCount: Array.isArray(chapter.glossaryTerms) ? chapter.glossaryTerms.length : 0,
    }));
}
function summarizeUnresolvedPlaceholders(chapterData) {
    return (Array.isArray(chapterData) ? chapterData : [])
        .map((chapter) => {
        const text = typeof chapter.text === "string" ? chapter.text : "";
        const matches = [...text.matchAll(/※\d+[⛬〓]?/g)].map((match) => match[0]);
        return {
            chapter: chapter.chapter,
            count: matches.length,
            markers: [...new Set(matches)].slice(0, 10),
        };
    })
        .filter((summary) => summary.count > 0);
}
function logUnresolvedPlaceholderAudit(stage, chapterData) {
    const summaries = summarizeUnresolvedPlaceholders(chapterData);
    if (summaries.length === 0) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)(`${stage}: No unresolved WTR placeholders detected after preprocessing.`);
        return;
    }
    (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)(`${stage}: Unresolved WTR placeholders remain after preprocessing.`, {
        chapterCount: summaries.length,
        totalMarkers: summaries.reduce((total, summary) => total + summary.count, 0),
        chapters: summaries,
    });
}
async function collectChapterDataForAnalysis(liveTerms) {
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.officialGlossaryContext = null;
    const pageContext = (0,_wtrLabApi__WEBPACK_IMPORTED_MODULE_6__/* .getWtrPageContext */ .Yj)();
    if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useOfficialWtrGlossary && pageContext) {
        (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateStatusIndicator */ .LI)("running", "Loading WTR official glossary...");
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.officialGlossaryContext = await (0,_wtrLabApi__WEBPACK_IMPORTED_MODULE_6__/* .fetchOfficialWtrGlossaryContext */ .sp)(pageContext.rawId);
    }
    if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.chapterSource === "wtr-api" && pageContext) {
        const chapterRange = (0,_wtrLabApi__WEBPACK_IMPORTED_MODULE_6__/* .buildWtrApiChapterRange */ .OO)(pageContext, _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config);
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("WTR reader API chapter request prepared.", {
            rawId: pageContext.rawId,
            serieSlug: pageContext.serieSlug,
            currentChapter: pageContext.chapterNo,
            rangeMode: _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiRangeMode || "nearby",
            requestedChapters: chapterRange,
        });
        const fetchedChapters = [];
        for (let index = 0; index < chapterRange.length; index++) {
            const chapterNo = chapterRange[index];
            (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateStatusIndicator */ .LI)("running", `Fetching WTR chapter ${chapterNo} (${index + 1}/${chapterRange.length})...`);
            fetchedChapters.push(await (0,_wtrLabApi__WEBPACK_IMPORTED_MODULE_6__/* .fetchWtrChapter */ .vm)(pageContext, chapterNo));
        }
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)(`Collected ${fetchedChapters.length} chapter${fetchedChapters.length === 1 ? "" : "s"} from WTR Lab reader API.`, summarizeChapterCollection(fetchedChapters));
        logUnresolvedPlaceholderAudit("WTR API fetch", fetchedChapters);
        const processedChapters = (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .applyTermReplacements */ .sz)(fetchedChapters, liveTerms);
        logUnresolvedPlaceholderAudit("Term replacement preprocessing", processedChapters);
        return processedChapters;
    }
    if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.chapterSource === "wtr-api" && !pageContext) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("WTR reader API source was selected, but the current page URL did not expose raw_id/chapter metadata. Falling back to loaded page chapters.");
    }
    const chapterData = (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .crawlChapterData */ .bn)();
    (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("Collected loaded page chapters for analysis.", summarizeChapterCollection(chapterData));
    logUnresolvedPlaceholderAudit("Loaded page crawl", chapterData);
    const processedChapters = (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .applyTermReplacements */ .sz)(chapterData, liveTerms);
    logUnresolvedPlaceholderAudit("Term replacement preprocessing", processedChapters);
    return processedChapters;
}
async function startAnalysis(isContinuation = false) {
    try {
        if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.isAnalysisRunning) {
            alert("An analysis is already in progress.");
            return;
        }
        if (!_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.apiKeys || _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.apiKeys.length === 0 || !_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.model) {
            alert("Please add at least one API key and select a model in the Configuration tab first.");
            document.querySelector('.wtr-if-tab-btn[data-tab="config"]').click();
            (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .togglePanel */ .Pj)(true);
            return;
        }
        const deepAnalysisDepth = Math.max(1, parseInt(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.deepAnalysisDepth) || 1);
        if (!isContinuation) {
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.cumulativeResults = [];
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.apiKeyCooldowns.clear();
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.currentApiKeyIndex = 0;
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.currentIteration = 1;
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.totalIterations = deepAnalysisDepth;
            document.getElementById("wtr-if-results").innerHTML = "";
            document.getElementById("wtr-if-continue-btn").disabled = true;
            document.getElementById("wtr-if-filter-select").value = "all";
            // Clear session results only when starting a completely new analysis
            (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .clearSessionResults */ .qk)();
        }
        if (isContinuation && _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.session.hasSavedResults) {
            document.getElementById("wtr-if-continue-btn").disabled = false;
        }
        if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useJson) {
            document.getElementById("wtr-if-file-input").dataset.continuation = String(isContinuation);
            document.getElementById("wtr-if-file-input").click();
            return;
        }
        let liveTerms = [];
        if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useLiveTermReplacerSync && (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .isWTRLabTermReplacerLoaded */ .mT)()) {
            const novelSlug = (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .getNovelSlug */ .Ir)();
            const syncedTerms = await (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .requestTermsFromWTRLabTermReplacer */ .dH)(novelSlug);
            if (Array.isArray(syncedTerms)) {
                liveTerms = syncedTerms;
                (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)(`Using ${liveTerms.length} live terms from WTR Lab Term Replacer for analysis.`);
            }
            else {
                (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("Live term sync from WTR Lab Term Replacer was unavailable. Continuing without preloaded replacements.");
                const statusEl = document.getElementById("wtr-if-status");
                if (statusEl) {
                    statusEl.textContent =
                        "Live Term Replacer sync unavailable; analyzing without preloaded replacements.";
                    setTimeout(() => {
                        if (statusEl) {
                            statusEl.textContent = "";
                        }
                    }, 3500);
                }
            }
        }
        let processedData;
        try {
            processedData = await collectChapterDataForAnalysis(liveTerms);
        }
        catch (error) {
            if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.chapterSource !== "wtr-api") {
                throw error;
            }
            (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("WTR reader API collection failed. Falling back to loaded page chapters.", error);
            const statusEl = document.getElementById("wtr-if-status");
            if (statusEl) {
                statusEl.textContent = "WTR API fetch failed; using loaded page chapters instead.";
                setTimeout(() => {
                    if (statusEl) {
                        statusEl.textContent = "";
                    }
                }, 4500);
            }
            const chapterData = (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .crawlChapterData */ .bn)();
            processedData = (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .applyTermReplacements */ .sz)(chapterData, liveTerms);
        }
        if (!processedData.length) {
            throw new Error("No chapter text was available for analysis.");
        }
        (0,_geminiApi__WEBPACK_IMPORTED_MODULE_3__/* .findInconsistenciesDeepAnalysis */ .Nz)(processedData, isContinuation ? _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.cumulativeResults : [], deepAnalysisDepth);
        (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .togglePanel */ .Pj)(false);
    }
    catch (error) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("Failed to start analysis.", error);
        alert(`Failed to start analysis. ${error instanceof Error ? error.message : String(error)}`);
    }
}
function safeSetStyle(element, property, value) {
    if (element && element.style && property) {
        element.style[property] = value;
        return true;
    }
    return false;
}
async function handleSaveConfig() {
    const keyInputs = document.querySelectorAll(".wtr-if-api-key-input");
    const newApiKeys = [];
    keyInputs.forEach((input) => {
        const key = input.value.trim();
        if (key) {
            newApiKeys.push(key);
        }
    });
    const providerSettings = (0,_providerConfig__WEBPACK_IMPORTED_MODULE_1__/* .resolveProviderSettings */ .vy)({
        providerType: document.getElementById("wtr-if-provider-type").value,
        providerBaseUrl: document.getElementById("wtr-if-provider-base-url").value,
        providerChatCompletionsPath: document.getElementById("wtr-if-provider-chat-path").value,
        providerModelsPath: document.getElementById("wtr-if-provider-models-path").value,
        providerUseManualPaths: document.getElementById("wtr-if-provider-use-manual-paths").checked,
    });
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.apiKeys = newApiKeys;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerType = providerSettings.providerType;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerBaseUrl = providerSettings.baseUrl;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerChatCompletionsPath = providerSettings.chatCompletionsPath;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerModelsPath = providerSettings.modelsPath;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerUseManualPaths = providerSettings.useManualPaths;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.model = document.getElementById("wtr-if-model").value;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useLiveTermReplacerSync = document.getElementById("wtr-if-use-live-term-replacer-sync").checked;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useJson = document.getElementById("wtr-if-use-json").checked;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.chapterSource = document.getElementById("wtr-if-chapter-source").value;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiRangeMode = document.getElementById("wtr-if-wtr-api-range-mode").value;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiPreviousChapters = parseInt(document.getElementById("wtr-if-wtr-api-previous").value, 10) || 0;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiNextChapters = parseInt(document.getElementById("wtr-if-wtr-api-next").value, 10) || 0;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiStartChapter = document.getElementById("wtr-if-wtr-api-start").value.trim();
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiEndChapter = document.getElementById("wtr-if-wtr-api-end").value.trim();
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useOfficialWtrGlossary = document.getElementById("wtr-if-use-official-wtr-glossary").checked;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.loggingEnabled = document.getElementById("wtr-if-logging-enabled").checked;
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.temperature = parseFloat(document.getElementById("wtr-if-temperature").value);
    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.reasoningMode = document.getElementById("wtr-if-reasoning-mode").value;
    const statusEl = document.getElementById("wtr-if-status");
    statusEl.textContent = "Saving...";
    const success = await (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
    statusEl.textContent = success ? "Configuration saved successfully!" : "Failed to save configuration.";
    setTimeout(() => (statusEl.textContent = ""), 3000);
}
function handleFindInconsistencies() {
    startAnalysis(false);
}
function handleContinueAnalysis() {
    startAnalysis(true);
}
function handleFileImportAndAnalyze(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }
    const isContinuation = event.target.dataset.continuation === "true";
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = JSON.parse(String(e.target.result));
            const novelSlug = (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .getNovelSlug */ .Ir)();
            (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)(`Detected novel slug: "${novelSlug}"`);
            // --- JSON Validation ---
            if (!data || typeof data !== "object") {
                throw new Error("File is not a valid JSON object.");
            }
            if (!data.terms || typeof data.terms !== "object") {
                throw new Error("JSON must contain a top-level 'terms' object.");
            }
            const terms = data.terms[novelSlug];
            if (terms === undefined) {
                (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)(`No replacement terms found for novel slug "${novelSlug}" in the JSON file.`);
                alert(`No terms found for the current novel ("${novelSlug}") in this file. Analysis will proceed without replacements.`);
            }
            else if (!Array.isArray(terms)) {
                throw new Error(`The entry for "${novelSlug}" must be an array of term objects.`);
            }
            else if (terms.length > 0 &&
                (!Object.prototype.hasOwnProperty.call(terms[0], "original") ||
                    !Object.prototype.hasOwnProperty.call(terms[0], "replacement"))) {
                throw new Error(`Term objects for "${novelSlug}" must contain 'original' and 'replacement' properties.`);
            }
            // --- End Validation ---
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.officialGlossaryContext = null;
            const pageContext = (0,_wtrLabApi__WEBPACK_IMPORTED_MODULE_6__/* .getWtrPageContext */ .Yj)();
            if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useOfficialWtrGlossary && pageContext) {
                _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.officialGlossaryContext = await (0,_wtrLabApi__WEBPACK_IMPORTED_MODULE_6__/* .fetchOfficialWtrGlossaryContext */ .sp)(pageContext.rawId);
            }
            const chapterData = (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .crawlChapterData */ .bn)();
            const processedData = (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .applyTermReplacements */ .sz)(chapterData, terms || []);
            const deepAnalysisDepth = Math.max(1, parseInt(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.deepAnalysisDepth) || 1);
            (0,_geminiApi__WEBPACK_IMPORTED_MODULE_3__/* .findInconsistenciesDeepAnalysis */ .Nz)(processedData, isContinuation ? _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.cumulativeResults : [], deepAnalysisDepth);
            (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .togglePanel */ .Pj)(false);
        }
        catch (err) {
            alert("Failed to read or parse the JSON file. Error: " + err.message);
        }
        finally {
            event.target.value = "";
        }
    };
    reader.readAsText(file);
}
function handleRestoreSession() {
    if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.session.hasSavedResults) {
        // 1) Build Finder UI for restored results
        (0,_display__WEBPACK_IMPORTED_MODULE_5__/* .displayResults */ .H)(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.cumulativeResults);
        // 2) Immediately sync Apply/Copy mode on the actual rendered Finder buttons
        //    This ensures restored sessions respect the current external integration state.
        updateApplyCopyButtonsMode();
        // Hide session restore element if it exists (removed UI section)
        const sessionRestoreEl = document.getElementById("wtr-if-session-restore");
        if (sessionRestoreEl) {
            safeSetStyle(sessionRestoreEl, "display", "none");
        }
        // Enable continue button after restoring results
        const continueBtn = document.getElementById("wtr-if-continue-btn");
        if (continueBtn) {
            continueBtn.disabled = false;
        }
        const statusEl = document.getElementById("wtr-if-status");
        if (statusEl) {
            statusEl.textContent = `Restored ${_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.cumulativeResults.length} results from previous session`;
            setTimeout(() => {
                if (statusEl) {
                    statusEl.textContent = "";
                }
            }, 3000);
        }
    }
}
function handleClearSession() {
    (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .clearSessionResults */ .qk)();
    // Hide session restore element if it exists (removed UI section)
    const sessionRestoreEl = document.getElementById("wtr-if-session-restore");
    if (sessionRestoreEl) {
        safeSetStyle(sessionRestoreEl, "display", "none");
    }
    // Disable continue button when clearing results
    const continueBtn = document.getElementById("wtr-if-continue-btn");
    if (continueBtn) {
        continueBtn.disabled = true;
    }
    const statusEl = document.getElementById("wtr-if-status");
    if (statusEl) {
        statusEl.textContent = "Saved session results cleared";
        setTimeout(() => {
            if (statusEl) {
                statusEl.textContent = "";
            }
        }, 3000);
    }
}
function handleStatusClick() {
    const indicator = document.getElementById("wtr-if-status-indicator");
    if (indicator.classList.contains("complete") || indicator.classList.contains("error")) {
        // Show panel
        (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .togglePanel */ .Pj)(true);
        // Activate Finder tab
        const finderTabBtn = document.querySelector('.wtr-if-tab-btn[data-tab="finder"]');
        if (finderTabBtn) {
            finderTabBtn.click();
        }
        // Re-render results (if any) into Finder tab
        if (Array.isArray(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.cumulativeResults) && _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.cumulativeResults.length > 0) {
            (0,_display__WEBPACK_IMPORTED_MODULE_5__/* .displayResults */ .H)(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.cumulativeResults);
        }
        // Ensure status indicator is hidden after navigation
        (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateStatusIndicator */ .LI)("hidden");
        // IMPORTANT:
        // Run after Finder DOM is present so button modes match current detection state.
        updateApplyCopyButtonsMode();
    }
}
/**
 * Single source of truth for Finder Apply/Copy button mode.
 *
 * This helper:
 * - Checks isWTRLabTermReplacerLoaded()
 * - Updates Finder tab Apply/Copy buttons:
 *     - #wtr-if-apply-selected
 *     - #wtr-if-apply-all
 *   or any matching .wtr-if-apply-action buttons with data-scope attributes.
 * - When external detected:
 *     - Labels: "Apply Selected" / "Apply All"
 *     - data-action: "apply-selected" / "apply-all"
 * - When external NOT detected:
 *     - Labels: "Copy Selected" / "Copy All"
 *     - data-action: "copy-selected" / "copy-all"
 *
 * Idempotent, cheap, and safe if elements are missing.
 */
function updateApplyCopyButtonsMode() {
    let externalAvailable = false;
    try {
        externalAvailable = (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .isWTRLabTermReplacerLoaded */ .mT)();
    }
    catch (err) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("WTR Lab Term Replacer detection failed in updateApplyCopyButtonsMode; falling back to safe copy mode.", err);
        externalAvailable = false;
    }
    // Scope to the Finder tab content to avoid touching any non-related buttons.
    const finderTab = document.getElementById("wtr-if-tab-finder");
    if (!finderTab) {
        return;
    }
    // Helper to keep labels/actions in sync for a given scope.
    function syncButton(btn, scope) {
        if (!btn) {
            return;
        }
        const isSelected = scope === "selected";
        const applyLabel = isSelected ? "Apply Selected" : "Apply All";
        const copyLabel = isSelected ? "Copy Selected" : "Copy All";
        const applyAction = isSelected ? "apply-selected" : "apply-all";
        const copyAction = isSelected ? "copy-selected" : "copy-all";
        btn.textContent = externalAvailable ? applyLabel : copyLabel;
        btn.dataset.action = externalAvailable ? applyAction : copyAction;
    }
    // Explicit Finder tab buttons.
    syncButton(finderTab.querySelector("#wtr-if-apply-selected"), "selected");
    syncButton(finderTab.querySelector("#wtr-if-apply-all"), "all");
    // Also support any dynamically rendered action buttons inside result groups.
    // Be robust:
    // - Prefer [data-role='wtr-if-apply-action'] with data-scope.
    // - Fallback to plain .wtr-if-apply-btn (e.g., from restored sessions) and
    //   infer scope from existing data.
    const groupButtons = finderTab.querySelectorAll("[data-role='wtr-if-apply-action'], .wtr-if-apply-btn");
    groupButtons.forEach((btn) => {
        let scope = btn.dataset.scope || btn.getAttribute("data-scope");
        if (!scope) {
            const a = btn.dataset.action || "";
            if (a.endsWith("-selected")) {
                scope = "selected";
            }
            else if (a.endsWith("-all")) {
                scope = "all";
            }
        }
        if (scope === "selected" || scope === "all") {
            syncButton(btn, scope);
        }
    });
}
/**
 * Handle Apply/Copy actions for a group of variations.
 *
 * Behavior is dynamic:
 * - If WTR Lab Term Replacer is detected:
 *     - Dispatches "wtr:addTerm" with aggregated term(s) for external script.
 *     - Buttons represent "Apply Selected"/"Apply All" semantics.
 * - If not detected (safe mode):
 *     - Copies variations or suggestion text to clipboard instead.
 *     - Buttons represent "Copy Selected"/"Copy All" semantics.
 */
function handleApplyClick(event) {
    const button = event.currentTarget;
    const action = button.dataset.action || "";
    const replacement = button.dataset.suggestion || "";
    let variationsToApply = [];
    let externalAvailable = false;
    try {
        externalAvailable = (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .isWTRLabTermReplacerLoaded */ .mT)();
    }
    catch {
        // If detection explodes for any reason, treat as not available for safety.
        externalAvailable = false;
    }
    if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.loggingEnabled) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("Apply/Copy button click", {
            action,
            replacementValue: replacement,
            replacementLength: replacement ? replacement.length : "empty",
            buttonDataset: { ...button.dataset },
            externalAvailable,
        });
    }
    // Resolve variations based on the button scope, mirroring existing apply selection semantics.
    if (action === "apply-all" || action === "copy-all") {
        try {
            variationsToApply = JSON.parse(button.dataset.variations || "[]");
        }
        catch (e) {
            (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("Failed to parse variations for apply-all/copy-all.", e);
            variationsToApply = [];
        }
    }
    else if (action === "apply-selected" || action === "copy-selected") {
        const groupEl = button.closest(".wtr-if-result-group");
        if (groupEl) {
            const checkedBoxes = groupEl.querySelectorAll(".wtr-if-variation-checkbox:checked");
            checkedBoxes.forEach((box) => variationsToApply.push(box.value));
        }
    }
    const uniqueVariations = [...new Set(variationsToApply)];
    if (uniqueVariations.length === 0) {
        const originalText = button.textContent;
        button.textContent = "None Selected!";
        setTimeout(() => {
            if (button) {
                button.textContent = originalText;
            }
        }, 2000);
        return;
    }
    // Helper to compute final replacement text.
    const finalReplacement = replacement && replacement.trim() !== "" ? replacement.trim() : null;
    // Handle Copy Selected / Copy All (safe mode semantics) WITHOUT mutating content or dispatching events.
    if (action === "copy-selected" || action === "copy-all") {
        // For copy, we reuse the same conceptual resolution:
        // - uniqueVariations is the set of variations for this concept (no cross-concept mixing).
        // - finalReplacement is the chosen suggestion (if available).
        if (!finalReplacement) {
            // If we somehow lack a valid suggestion, degrade gracefully and use variations only.
            if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.loggingEnabled) {
                (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("Copy action invoked without a valid suggestion; falling back to variations-only output.", {
                    uniqueVariations,
                });
            }
        }
        const termPart = uniqueVariations.join("|");
        const replacedPart = finalReplacement || "";
        let output = "";
        if (termPart) {
            output += `Term: ${termPart}\n`;
        }
        if (replacedPart) {
            output += `Replaced: ${replacedPart}\n`;
        }
        if (!output) {
            const originalText = button.textContent;
            button.textContent = "Nothing to Copy";
            setTimeout(() => {
                if (button) {
                    button.textContent = originalText;
                }
            }, 1500);
            return;
        }
        const writeToClipboard = (text) => {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                return navigator.clipboard.writeText(text);
            }
            // Fallback using a temporary textarea for environments without navigator.clipboard
            return new Promise((resolve, reject) => {
                try {
                    const textarea = document.createElement("textarea");
                    textarea.value = text;
                    safeSetStyle(textarea, "position", "fixed");
                    safeSetStyle(textarea, "opacity", "0");
                    document.body.appendChild(textarea);
                    textarea.select();
                    const successful = document.execCommand("copy");
                    if (textarea && textarea.parentNode) {
                        textarea.parentNode.removeChild(textarea);
                    }
                    if (!successful) {
                        reject(new Error("execCommand copy failed"));
                    }
                    else {
                        resolve(undefined);
                    }
                }
                catch (err) {
                    reject(err);
                }
            });
        };
        const originalText = button.textContent;
        writeToClipboard(output.trimEnd())
            .then(() => {
            if (!button) {
                return;
            }
            button.textContent = "Copied!";
            setTimeout(() => {
                if (button) {
                    button.textContent = originalText;
                }
            }, 1500);
        })
            .catch((err) => {
            (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("Failed to copy terms payload.", err);
            if (!button) {
                return;
            }
            button.textContent = "Copy Failed";
            setTimeout(() => {
                if (button) {
                    button.textContent = originalText;
                }
            }, 1500);
        });
        return;
    }
    // From here on, handle Apply Selected / Apply All semantics.
    if (action !== "apply-selected" && action !== "apply-all") {
        // Unknown action; do nothing for safety.
        return;
    }
    // Apply actions must only operate when the external replacer is available.
    if (!externalAvailable) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("Apply action attempted while external replacer is not available; ignoring.", { action, uniqueVariations });
        return;
    }
    if (!finalReplacement) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("ERROR: Empty or invalid replacement value detected. Aborting term addition.", {
            originalReplacement: replacement,
            variations: uniqueVariations,
        });
        const originalText = button.textContent;
        button.textContent = "Invalid Suggestion!";
        safeSetStyle(button, "backgroundColor", "#dc3545");
        setTimeout(() => {
            if (button) {
                button.textContent = originalText;
                safeSetStyle(button, "backgroundColor", "");
            }
        }, 3000);
        return;
    }
    // External replacer IS available -> preserve original apply behavior semantics.
    let originalTerm;
    let isRegex;
    if (uniqueVariations.length > 1) {
        uniqueVariations.sort((a, b) => b.length - a.length);
        originalTerm = uniqueVariations.map((v) => (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .escapeRegExp */ .Nt)(v)).join("|");
        isRegex = true;
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)(`Applying suggestion "${finalReplacement}" via multi-term regex: /${originalTerm}/gi`);
    }
    else {
        originalTerm = uniqueVariations[0];
        isRegex = false;
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)(`Applying suggestion "${finalReplacement}" via simple replacement for: "${originalTerm}"`);
    }
    const customEvent = new CustomEvent("wtr:addTerm", {
        detail: {
            original: originalTerm,
            replacement: finalReplacement,
            isRegex: isRegex,
        },
    });
    window.dispatchEvent(customEvent);
    const originalText = button.textContent;
    button.classList.add("sent");
    button.textContent = "Applied!";
    setTimeout(() => {
        button.classList.remove("sent");
        button.textContent = originalText;
    }, 2000);
}
function handleCopyVariationClick(event) {
    const button = event.currentTarget;
    const textToCopy = button.dataset.text;
    if (!textToCopy) {
        return;
    }
    navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
        const originalContent = button.innerHTML;
        button.innerHTML = "✅";
        button.disabled = true;
        setTimeout(() => {
            if (button) {
                button.innerHTML = originalContent;
                button.disabled = false;
            }
        }, 1500);
    })
        .catch((err) => {
        console.error("Inconsistency Finder: Failed to copy text:", err);
        const originalContent = button.innerHTML;
        button.innerHTML = "❌";
        setTimeout(() => {
            if (button) {
                button.innerHTML = originalContent;
            }
        }, 1500);
    });
}
function exportConfiguration() {
    const configData = {
        version: "5.2",
        timestamp: new Date().toISOString(),
        config: _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config,
        preferences: {
            autoRestoreResults: _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.preferences.autoRestoreResults,
        },
    };
    const blob = new Blob([JSON.stringify(configData, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `WTR Lab Term Inconsistency Finder-5.2-config-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    const statusEl = document.getElementById("wtr-if-status");
    statusEl.textContent = "Configuration exported successfully";
    setTimeout(() => (statusEl.textContent = ""), 3000);
}
function importConfiguration() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(String(e.target.result));
                if (!data.config || !data.version) {
                    throw new Error("Invalid configuration file format");
                }
                // Backup current config
                const _backup = { ..._state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config };
                // Import new config
                _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config = {
                    ..._state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config,
                    ...data.config,
                };
                const importedProviderSettings = (0,_providerConfig__WEBPACK_IMPORTED_MODULE_1__/* .resolveProviderSettings */ .vy)(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config);
                _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerType = importedProviderSettings.providerType;
                _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerBaseUrl = importedProviderSettings.baseUrl;
                _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerChatCompletionsPath = importedProviderSettings.chatCompletionsPath;
                _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerModelsPath = importedProviderSettings.modelsPath;
                _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerUseManualPaths = importedProviderSettings.useManualPaths;
                if (data.preferences) {
                    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.preferences = {
                        ..._state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.preferences,
                        ...data.preferences,
                    };
                }
                (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
                // Refresh UI
                (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .renderApiKeysUI */ .jH)();
                document.getElementById("wtr-if-provider-type").value = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerType;
                document.getElementById("wtr-if-provider-base-url").value = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerBaseUrl;
                document.getElementById("wtr-if-provider-chat-path").value = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerChatCompletionsPath;
                document.getElementById("wtr-if-provider-models-path").value = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerModelsPath;
                document.getElementById("wtr-if-provider-use-manual-paths").checked = Boolean(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerUseManualPaths);
                (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .syncProviderConfigUI */ .Nh)();
                (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .populateModelSelector */ .rT)();
                // Update form fields
                document.getElementById("wtr-if-use-live-term-replacer-sync").checked =
                    _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useLiveTermReplacerSync;
                document.getElementById("wtr-if-use-json").checked = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useJson;
                document.getElementById("wtr-if-use-official-wtr-glossary").checked = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useOfficialWtrGlossary;
                document.getElementById("wtr-if-chapter-source").value = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.chapterSource || "page";
                document.getElementById("wtr-if-wtr-api-range-mode").value = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiRangeMode || "nearby";
                document.getElementById("wtr-if-wtr-api-previous").value = String(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiPreviousChapters ?? 2);
                document.getElementById("wtr-if-wtr-api-next").value = String(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiNextChapters ?? 2);
                document.getElementById("wtr-if-wtr-api-start").value = String(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiStartChapter || "");
                document.getElementById("wtr-if-wtr-api-end").value = String(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiEndChapter || "");
                (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateChapterSourceUI */ .ku)();
                document.getElementById("wtr-if-logging-enabled").checked = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.loggingEnabled;
                (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateDebugLoggingUI */ .o_)();
                (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateTermReplacerIntegrationUI */ .cB)();
                document.getElementById("wtr-if-auto-restore").checked = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.preferences.autoRestoreResults;
                document.getElementById("wtr-if-temperature").value = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.temperature;
                document.getElementById("wtr-if-temp-value").textContent = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.temperature;
                document.getElementById("wtr-if-reasoning-mode").value = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.reasoningMode || "off";
                (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateAIControlHints */ .jg)();
                const statusEl = document.getElementById("wtr-if-status");
                statusEl.textContent = "Configuration imported successfully";
                setTimeout(() => (statusEl.textContent = ""), 3000);
            }
            catch (err) {
                alert("Failed to import configuration: " + err.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}
function copyTextToClipboard(text) {
    if (navigator.clipboard?.writeText) {
        return navigator.clipboard.writeText(text);
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "true");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    return copied ? Promise.resolve() : Promise.reject(new Error("Clipboard copy failed"));
}
function setConfigStatus(message, timeout = 3000) {
    const statusEl = document.getElementById("wtr-if-status");
    if (!statusEl) {
        return;
    }
    statusEl.textContent = message;
    if (timeout > 0) {
        setTimeout(() => {
            if (statusEl.textContent === message) {
                statusEl.textContent = "";
            }
        }, timeout);
    }
}
async function handleCopyDebugReport() {
    try {
        await copyTextToClipboard((0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .getDebugLogReport */ .Q)());
        setConfigStatus("Debug report copied. Paste it into your issue report.");
    }
    catch (error) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("Failed to copy debug report.", error);
        setConfigStatus("Failed to copy debug report. Check clipboard permissions.", 5000);
    }
}
function handleClearDebugLogs() {
    (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .clearDebugLogs */ .o_)();
    (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateDebugLoggingUI */ .o_)();
    setConfigStatus("Debug logs cleared.");
}
function addEventListeners() {
    const panel = document.getElementById("wtr-if-panel");
    if (!panel) {
        return;
    }
    panel.querySelector(".wtr-if-close-btn").addEventListener("click", () => (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .togglePanel */ .Pj)(false));
    panel.querySelector("#wtr-if-save-config-btn").addEventListener("click", () => {
        handleSaveConfig();
    });
    panel.querySelector("#wtr-if-find-btn").addEventListener("click", handleFindInconsistencies);
    panel.querySelector("#wtr-if-continue-btn").addEventListener("click", handleContinueAnalysis);
    panel.querySelector("#wtr-if-refresh-models-btn").addEventListener("click", _panel__WEBPACK_IMPORTED_MODULE_4__/* .fetchAndCacheModels */ .mc);
    panel.querySelector("#wtr-if-file-input").addEventListener("change", handleFileImportAndAnalyze);
    panel.querySelector("#wtr-if-export-config-btn").addEventListener("click", exportConfiguration);
    panel.querySelector("#wtr-if-import-config-btn").addEventListener("click", importConfiguration);
    panel.querySelector("#wtr-if-copy-debug-report-btn").addEventListener("click", handleCopyDebugReport);
    panel.querySelector("#wtr-if-clear-debug-logs-btn").addEventListener("click", handleClearDebugLogs);
    panel.querySelector("#wtr-if-restore-btn")?.addEventListener("click", handleRestoreSession);
    panel.querySelector("#wtr-if-clear-session-btn")?.addEventListener("click", handleClearSession);
    const filterSelect = panel.querySelector("#wtr-if-filter-select");
    filterSelect.addEventListener("change", () => {
        (0,_display__WEBPACK_IMPORTED_MODULE_5__/* .displayResults */ .H)(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.cumulativeResults);
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.activeFilter = filterSelect.value;
        (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
        // Ensure Apply/Copy button modes are synchronized after filter change and result re-render
        updateApplyCopyButtonsMode();
    });
    document.getElementById("wtr-if-status-indicator").addEventListener("click", handleStatusClick);
    panel.querySelector("#wtr-if-temperature").addEventListener("input", (e) => {
        document.getElementById("wtr-if-temp-value").textContent = e.target.value;
    });
    panel.querySelector("#wtr-if-reasoning-mode").addEventListener("change", _panel__WEBPACK_IMPORTED_MODULE_4__/* .updateAIControlHints */ .jg);
    panel.querySelector("#wtr-if-chapter-source").addEventListener("change", (e) => {
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.chapterSource = e.target.value;
        (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateChapterSourceUI */ .ku)();
        (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
    });
    panel.querySelector("#wtr-if-wtr-api-range-mode").addEventListener("change", (e) => {
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiRangeMode = e.target.value;
        (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateChapterSourceUI */ .ku)();
        (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
    });
    panel.querySelectorAll("#wtr-if-wtr-api-previous, #wtr-if-wtr-api-next, #wtr-if-wtr-api-start, #wtr-if-wtr-api-end").forEach((input) => {
        input.addEventListener("change", () => {
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiPreviousChapters = parseInt(document.getElementById("wtr-if-wtr-api-previous").value, 10) || 0;
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiNextChapters = parseInt(document.getElementById("wtr-if-wtr-api-next").value, 10) || 0;
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiStartChapter = document.getElementById("wtr-if-wtr-api-start").value.trim();
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.wtrApiEndChapter = document.getElementById("wtr-if-wtr-api-end").value.trim();
            (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
        });
    });
    panel.querySelector("#wtr-if-use-official-wtr-glossary").addEventListener("change", (e) => {
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useOfficialWtrGlossary = e.target.checked;
        (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
    });
    panel.querySelector("#wtr-if-logging-enabled").addEventListener("change", (e) => {
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.loggingEnabled = e.target.checked;
        (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateDebugLoggingUI */ .o_)();
        (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
    });
    panel.querySelector("#wtr-if-provider-use-manual-paths").addEventListener("change", (e) => {
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerUseManualPaths = e.target.checked;
        (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .syncProviderConfigUI */ .Nh)();
    });
    panel.querySelector("#wtr-if-auto-restore").addEventListener("change", (e) => {
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.preferences.autoRestoreResults = e.target.checked;
        (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
    });
    panel.querySelector("#wtr-if-provider-type").addEventListener("change", (e) => {
        const providerType = e.target.value === _providerConfig__WEBPACK_IMPORTED_MODULE_1__/* .AI_PROVIDERS */ .Q2.GEMINI ? _providerConfig__WEBPACK_IMPORTED_MODULE_1__/* .AI_PROVIDERS */ .Q2.GEMINI : _providerConfig__WEBPACK_IMPORTED_MODULE_1__/* .AI_PROVIDERS */ .Q2.OPENAI_COMPATIBLE;
        const defaults = _providerConfig__WEBPACK_IMPORTED_MODULE_1__/* .PROVIDER_DEFAULTS */ .hV[providerType];
        document.getElementById("wtr-if-provider-base-url").value = defaults.baseUrl;
        document.getElementById("wtr-if-provider-chat-path").value = defaults.chatCompletionsPath;
        document.getElementById("wtr-if-provider-models-path").value = defaults.modelsPath;
        document.getElementById("wtr-if-provider-use-manual-paths").checked = false;
        const defaultTemperature = (0,_providerConfig__WEBPACK_IMPORTED_MODULE_1__/* .getProviderDefaultTemperature */ .tl)(providerType);
        document.getElementById("wtr-if-temperature").value = String(defaultTemperature);
        document.getElementById("wtr-if-temp-value").textContent = String(defaultTemperature);
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerType = providerType;
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerBaseUrl = defaults.baseUrl;
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerChatCompletionsPath = defaults.chatCompletionsPath;
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerModelsPath = defaults.modelsPath;
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerUseManualPaths = false;
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.temperature = defaultTemperature;
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.reasoningMode = "off";
        document.getElementById("wtr-if-reasoning-mode").value = "off";
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.model = "";
        (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .syncProviderConfigUI */ .Nh)();
        (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .populateModelSelector */ .rT)();
    });
    panel.querySelector("#wtr-if-deep-analysis-depth").addEventListener("change", (e) => {
        _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.deepAnalysisDepth = parseInt(e.target.value) || 1;
        (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
    });
    panel.querySelectorAll(".wtr-if-tab-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const targetTab = e.target.dataset.tab;
            panel.querySelectorAll(".wtr-if-tab-btn").forEach((b) => b.classList.remove("active"));
            e.target.classList.add("active");
            panel.querySelectorAll(".wtr-if-tab-content").forEach((c) => c.classList.remove("active"));
            panel.querySelector(`#wtr-if-tab-${targetTab}`).classList.add("active");
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.activeTab = targetTab;
            (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
            // When switching to Finder tab, (re)sync Apply/Copy labels and actions.
            if (targetTab === "finder") {
                updateApplyCopyButtonsMode();
            }
            // When switching to config tab, re-evaluate WTR Lab Term Replacer state
            if (targetTab === "config") {
                (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateTermReplacerIntegrationUI */ .cB)();
            }
        });
    });
    panel.querySelector("#wtr-if-add-key-btn").addEventListener("click", _panel__WEBPACK_IMPORTED_MODULE_4__/* .addApiKeyRow */ .$1);
    panel.querySelector("#wtr-if-toggle-keys-btn").addEventListener("click", _panel__WEBPACK_IMPORTED_MODULE_4__/* .toggleApiKeyVisibility */ .ah);
    panel.querySelector("#wtr-if-api-keys-container").addEventListener("click", (e) => {
        if (e.target.classList.contains("wtr-if-remove-key-btn")) {
            if (panel.querySelectorAll(".wtr-if-key-row").length > 1) {
                e.target.closest(".wtr-if-key-row").remove();
            }
            else {
                e.target.closest(".wtr-if-key-row").querySelector("input").value = "";
            }
        }
    });
    const liveSyncCheckbox = panel.querySelector("#wtr-if-use-live-term-replacer-sync");
    if (liveSyncCheckbox) {
        liveSyncCheckbox.addEventListener("change", (e) => {
            _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useLiveTermReplacerSync = e.target.checked;
            (0,_state__WEBPACK_IMPORTED_MODULE_0__/* .saveConfig */ .ql)();
            (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateTermReplacerIntegrationUI */ .cB)();
        });
    }
    // Delayed-load handling: re-check external userscript presence shortly after init.
    // This is allowed to call updateApplyCopyButtonsMode(), which no-ops if Finder DOM
    // is not yet present, so it does not create stale wiring.
    setTimeout(() => {
        try {
            (0,_panel__WEBPACK_IMPORTED_MODULE_4__/* .updateTermReplacerIntegrationUI */ .cB)();
            updateApplyCopyButtonsMode();
        }
        catch (err) {
            (0,_utils__WEBPACK_IMPORTED_MODULE_2__/* .log */ .Rm)("WTR Lab Term Replacer delayed detection check failed; continuing safely.", err);
        }
    }, 2000);
}


/***/ },

/***/ 782
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Hv: () => (/* reexport safe */ _display__WEBPACK_IMPORTED_MODULE_1__.H),
/* harmony export */   LI: () => (/* reexport safe */ _panel__WEBPACK_IMPORTED_MODULE_0__.LI),
/* harmony export */   Pj: () => (/* reexport safe */ _panel__WEBPACK_IMPORTED_MODULE_0__.Pj),
/* harmony export */   RD: () => (/* reexport safe */ _panel__WEBPACK_IMPORTED_MODULE_0__.RD),
/* harmony export */   bp: () => (/* reexport safe */ _panel__WEBPACK_IMPORTED_MODULE_0__.bp),
/* harmony export */   rz: () => (/* reexport safe */ _panel__WEBPACK_IMPORTED_MODULE_0__.rz)
/* harmony export */ });
/* harmony import */ var _panel__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(675);
/* harmony import */ var _display__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(200);
/* harmony import */ var _events__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(753);
// src/modules/ui/index.ts





/***/ },

/***/ 675
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  $1: () => (/* binding */ addApiKeyRow),
  RD: () => (/* binding */ createUI),
  mc: () => (/* binding */ fetchAndCacheModels),
  bp: () => (/* binding */ initializeCollisionAvoidance),
  rz: () => (/* binding */ injectControlButton),
  rT: () => (/* binding */ populateModelSelector),
  jH: () => (/* binding */ renderApiKeysUI),
  Nh: () => (/* binding */ syncProviderConfigUI),
  ah: () => (/* binding */ toggleApiKeyVisibility),
  Pj: () => (/* binding */ togglePanel),
  jg: () => (/* binding */ updateAIControlHints),
  ku: () => (/* binding */ updateChapterSourceUI),
  o_: () => (/* binding */ updateDebugLoggingUI),
  LI: () => (/* binding */ updateStatusIndicator),
  cB: () => (/* binding */ updateTermReplacerIntegrationUI)
});

// UNUSED EXPORTS: getCollisionAvoidanceStatus, setCollisionMonitoring, setupConflictObserver

// EXTERNAL MODULE: ./src/modules/state.ts
var state = __webpack_require__(654);
// EXTERNAL MODULE: ./src/modules/geminiApi.ts + 4 modules
var geminiApi = __webpack_require__(598);
// EXTERNAL MODULE: ./src/modules/providerConfig.ts
var providerConfig = __webpack_require__(980);
// EXTERNAL MODULE: ./src/modules/utils.ts
var utils = __webpack_require__(158);
;// ./src/version.ts
// src/version.ts
// Shared runtime version information for the userscript UI
const VERSION_INFO = {
    SEMANTIC: "5.5.1",
    DISPLAY: "v5.5.1",
    BUILD_ENV: "production",
    BUILD_DATE: "2026-04-30",
    GREASYFORK: "5.5.1",
    NPM: "5.5.1",
    BADGE: "5.5.1",
    CHANGELOG: "5.5.1",
};
const VERSION = VERSION_INFO.SEMANTIC;
if (typeof window !== "undefined") {
    window.WTR_VERSION = VERSION;
    window.WTR_VERSION_INFO = VERSION_INFO;
}

// EXTERNAL MODULE: ./src/modules/ui/events.ts
var events = __webpack_require__(753);
;// ./src/modules/ui/panel.ts
/* unused harmony import specifier */ var log;
// src/modules/ui/panel.ts






let areApiKeysVisible = false;
const getApiKeyInputType = () => (areApiKeysVisible ? "text" : "password");
function updateApiKeyVisibilityButton() {
    const toggleButton = document.getElementById("wtr-if-toggle-keys-btn");
    if (!toggleButton) {
        return;
    }
    toggleButton.textContent = areApiKeysVisible ? "Hide Keys" : "Show Keys";
    toggleButton.setAttribute("aria-pressed", String(areApiKeysVisible));
    toggleButton.setAttribute("title", areApiKeysVisible ? "Hide API keys from view" : "Display API keys in plain text");
}
function createUI() {
    if (document.getElementById("wtr-if-panel")) {
        return;
    }
    const panel = document.createElement("div");
    panel.id = "wtr-if-panel";
    panel.innerHTML = `
            <div class="wtr-if-header">
                <div class="wtr-if-title-group">
                    <h2>Term Inconsistency Finder</h2>
                    <span class="wtr-if-version-badge" title="Build ${(0,utils/* escapeHtml */.ZD)(VERSION_INFO.BUILD_DATE)} (${(0,utils/* escapeHtml */.ZD)(VERSION_INFO.BUILD_ENV)})">
                        ${(0,utils/* escapeHtml */.ZD)(VERSION_INFO.DISPLAY)}
                    </span>
                </div>
                <button class="wtr-if-close-btn" aria-label="Close Term Inconsistency Finder">&times;</button>
            </div>
            <div class="wtr-if-tabs">
                <button class="wtr-if-tab-btn" data-tab="finder">Finder</button>
                <button class="wtr-if-tab-btn" data-tab="config">Configuration</button>
            </div>
            <div class="wtr-if-content">
                <input type="file" id="wtr-if-file-input" accept=".json" style="display: none;">
                <div id="wtr-if-tab-finder" class="wtr-if-tab-content">
                    <!-- Primary Analysis Controls Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Primary Analysis Controls</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-finder-controls">
                                <button id="wtr-if-find-btn" class="wtr-if-btn wtr-if-btn-primary wtr-if-btn-large">Find Inconsistencies</button>
                                <button id="wtr-if-continue-btn" class="wtr-if-btn wtr-if-btn-secondary wtr-if-btn-large" disabled>Continue Analysis</button>
                            </div>
                        </div>
                    </div>

                    <!-- Chapter Source Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Chapter Source</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-chapter-source">Analysis Source</label>
                                <select id="wtr-if-chapter-source">
                                    <option value="page">Loaded page chapters</option>
                                    <option value="wtr-api">WTR Lab reader API</option>
                                </select>
                                <small class="wtr-if-hint">Reader API mode fetches chapters directly from WTR Lab and resolves official glossary placeholders before AI analysis.</small>
                            </div>
                            <div id="wtr-if-wtr-api-range-controls" class="wtr-if-api-range-controls">
                                <div class="wtr-if-form-group">
                                    <label for="wtr-if-wtr-api-range-mode">API Chapter Range</label>
                                    <select id="wtr-if-wtr-api-range-mode">
                                        <option value="nearby">Current chapter with nearby chapters</option>
                                        <option value="custom">Custom chapter range</option>
                                    </select>
                                </div>
                                <div class="wtr-if-range-grid" data-range-mode="nearby">
                                    <div class="wtr-if-form-group">
                                        <label for="wtr-if-wtr-api-previous">Previous chapters</label>
                                        <input type="number" id="wtr-if-wtr-api-previous" min="0" max="25" step="1" value="2">
                                    </div>
                                    <div class="wtr-if-form-group">
                                        <label for="wtr-if-wtr-api-next">Next chapters</label>
                                        <input type="number" id="wtr-if-wtr-api-next" min="0" max="25" step="1" value="2">
                                    </div>
                                </div>
                                <div class="wtr-if-range-grid" data-range-mode="custom">
                                    <div class="wtr-if-form-group">
                                        <label for="wtr-if-wtr-api-start">Start chapter</label>
                                        <input type="number" id="wtr-if-wtr-api-start" min="1" step="1" placeholder="e.g. 390">
                                    </div>
                                    <div class="wtr-if-form-group">
                                        <label for="wtr-if-wtr-api-end">End chapter</label>
                                        <input type="number" id="wtr-if-wtr-api-end" min="1" step="1" placeholder="e.g. 400">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Deep Analysis Configuration Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Deep Analysis Configuration</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-deep-analysis-controls">
                                <div class="wtr-if-form-row">
                                    <label for="wtr-if-deep-analysis-depth" class="wtr-if-form-label">Analysis Depth:</label>
                                    <select id="wtr-if-deep-analysis-depth" class="wtr-if-form-select">
                                        <option value="1">1 (Single Analysis)</option>
                                        <option value="2">2 (Deep Analysis)</option>
                                        <option value="3">3 (Very Deep Analysis)</option>
                                        <option value="4">4 (Maximum Analysis)</option>
                                        <option value="5">5 (Ultra Deep Analysis)</option>
                                    </select>
                                </div>
                                <small class="wtr-if-hint">Run multiple analysis iterations for more comprehensive results. Higher values provide better accuracy but take longer.</small>
                            </div>
                        </div>
                    </div>

                    <!-- Filter and Display Controls Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Filter and Display Controls</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-filter-controls">
                                <div class="wtr-if-form-row">
                                    <label for="wtr-if-filter-select" class="wtr-if-form-label">Filter Results:</label>
                                    <select id="wtr-if-filter-select" class="wtr-if-form-select">
                                        <option value="all">Show All</option>
                                        <option value="new">Show New Only</option>
                                        <option value="verified">Show Verified Only</option>
                                        <option value="CRITICAL">Priority: Critical</option>
                                        <option value="HIGH">Priority: High</option>
                                        <option value="MEDIUM">Priority: Medium</option>
                                        <option value="LOW">Priority: Low</option>
                                        <option value="STYLISTIC">Priority: Stylistic</option>
                                        <option value="INFO">Priority: Info</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Results Display Area Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Results Display Area</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div id="wtr-if-results"></div>
                        </div>
                    </div>
                </div>
                <div id="wtr-if-tab-config" class="wtr-if-tab-content">
                    <!-- Provider & API Keys Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Provider Configuration</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-provider-type">AI Provider</label>
                                <select id="wtr-if-provider-type">
                                    <option value="openai-compatible">OpenAI-Compatible</option>
                                    <option value="gemini">Google Gemini</option>
                                </select>
                                <small id="wtr-if-provider-hint" class="wtr-if-hint"></small>
                            </div>
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-provider-base-url" id="wtr-if-provider-base-url-label">Provider Base URL</label>
                                <input type="text" id="wtr-if-provider-base-url" placeholder="https://api.openai.com/v1" autocomplete="off">
                                <small class="wtr-if-hint">Use the provider base URL only. Finder automatically derives chat and model endpoints for common OpenAI-compatible providers.</small>
                            </div>
                            <details id="wtr-if-openai-compatible-fields" class="wtr-if-advanced-details">
                                <summary>Advanced endpoint troubleshooting</summary>
                                <small class="wtr-if-hint">Only change these paths if model refresh or analysis fails because your provider uses non-standard OpenAI-compatible routes.</small>
                                <div class="wtr-if-form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="wtr-if-provider-use-manual-paths">
                                        Use manual endpoint paths
                                    </label>
                                </div>
                                <div class="wtr-if-form-group wtr-if-manual-path-field">
                                    <label for="wtr-if-provider-chat-path">Chat completions path</label>
                                    <input type="text" id="wtr-if-provider-chat-path" placeholder="/chat/completions" autocomplete="off">
                                </div>
                                <div class="wtr-if-form-group wtr-if-manual-path-field">
                                    <label for="wtr-if-provider-models-path">Models path</label>
                                    <input type="text" id="wtr-if-provider-models-path" placeholder="/models" autocomplete="off">
                                </div>
                            </details>
                            <div class="wtr-if-form-group">
                                <div class="wtr-if-api-key-header">
                                    <label id="wtr-if-api-key-label">API Keys</label>
                                    <button type="button" id="wtr-if-toggle-keys-btn" class="wtr-if-key-visibility-btn" aria-pressed="false" title="Display API keys in plain text">Show Keys</button>
                                </div>
                                <div class="wtr-if-api-keys-container-wrapper">
                                    <div id="wtr-if-api-keys-container"></div>
                                </div>
                                <button id="wtr-if-add-key-btn" class="wtr-if-btn wtr-if-btn-secondary" style="margin-top: 8px; width: auto; padding: 5px 10px; font-size: 12px;">+ Add Key</button>
                            </div>
                        </div>
                    </div>

                    <!-- Model Configuration Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Model Configuration</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-model" id="wtr-if-model-label">OpenAI-Compatible Model</label>
                                <div class="wtr-if-model-controls">
                                    <select id="wtr-if-model"></select>
                                    <button id="wtr-if-refresh-models-btn" class="wtr-if-btn wtr-if-btn-secondary">Refresh List</button>
                                </div>
                            </div>
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-temperature">AI Temperature (<span id="wtr-if-temp-value">0.5</span>)</label>
                                <input type="range" id="wtr-if-temperature" min="0" max="2" step="0.1" value="0.5">
                                <small id="wtr-if-temperature-hint" class="wtr-if-hint">Lower is more predictable, higher is more creative.</small>
                            </div>
                            <div class="wtr-if-form-group">
                                <label for="wtr-if-reasoning-mode">Reasoning / Thinking</label>
                                <select id="wtr-if-reasoning-mode">
                                    <option value="off">Off</option>
                                    <option value="low">Low effort</option>
                                    <option value="medium">Medium effort</option>
                                    <option value="high">High effort</option>
                                </select>
                                <small id="wtr-if-reasoning-hint" class="wtr-if-hint">Used only for models/providers that advertise reasoning or thinking controls.</small>
                            </div>
                        </div>
                    </div>

                    <!-- Advanced Settings Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Advanced Settings</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group" id="wtr-if-use-live-term-replacer-sync-container">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="wtr-if-use-live-term-replacer-sync">
                                    Use Live Term Replacer Terms Automatically During Analysis
                                </label>
                            </div>
                            <div class="wtr-if-form-group" id="wtr-if-use-json-container">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="wtr-if-use-json">
                                    Use Imported Term Replacer JSON File (Optional Override)
                                </label>
                            </div>
                            <div class="wtr-if-form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="wtr-if-use-official-wtr-glossary">
                                    Use WTR Lab Official Glossary Context
                                </label>
                                <small class="wtr-if-hint">Fetches WTR Lab's novel glossary to suppress official alias false positives and improve AI suggestions.</small>
                            </div>
                            <div class="wtr-if-form-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="wtr-if-logging-enabled">
                                    Enable Debug Logging
                                </label>
                                <small class="wtr-if-hint">Outputs detailed script operations to the browser console and keeps a redacted report buffer.</small>
                                <div id="wtr-if-debug-log-actions" class="wtr-if-debug-log-actions" style="display: none;">
                                    <div class="wtr-if-debug-log-copy">
                                        <button type="button" id="wtr-if-copy-debug-report-btn" class="wtr-if-btn wtr-if-btn-secondary">Copy Debug Report</button>
                                        <button type="button" id="wtr-if-clear-debug-logs-btn" class="wtr-if-btn wtr-if-btn-secondary">Clear Logs</button>
                                    </div>
                                    <small id="wtr-if-debug-log-hint" class="wtr-if-hint">No debug logs captured yet.</small>
                                </div>
                            </div>
                            <div class="wtr-if-form-group">
                                <div class="wtr-if-hint">
                                    If you do not want to use the original site term replacer, you may use the external userscript from:
                                    <a href="https://github.com/MasuRii/wtr-lab-term-replacer/tree/main/dist" target="_blank" rel="noopener noreferrer">
                                        WTR Lab Term Replacer (GitHub)
                                    </a>.
                                    Navigate to this URL to install the supported userscript.
                                </div>
                                <small id="wtr-if-term-replacer-mode-hint" class="wtr-if-hint"></small>
                            </div>
                        </div>
                    </div>

                    <!-- Data Management Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-header">
                            <h3>Data Management</h3>
                        </div>
                        <div class="wtr-if-section-content">
                            <div class="wtr-if-form-group">
                                <label class="checkbox-label"><input type="checkbox" id="wtr-if-auto-restore"> Auto-restore saved results on panel open</label>
                                <small class="wtr-if-hint">Automatically offer to restore previous analysis results when opening the panel.</small>
                            </div>
                            <div class="wtr-if-import-export">
                                <div class="wtr-if-form-row">
                                    <button id="wtr-if-export-config-btn" class="wtr-if-btn wtr-if-btn-secondary">Export Configuration</button>
                                    <button id="wtr-if-import-config-btn" class="wtr-if-btn wtr-if-btn-secondary">Import Configuration</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Action Section -->
                    <div class="wtr-if-section">
                        <div class="wtr-if-section-content">
                            <button id="wtr-if-save-config-btn" class="wtr-if-btn wtr-if-btn-primary">Save Configuration</button>
                            <div id="wtr-if-status" class="wtr-if-status"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    document.body.appendChild(panel);
    const statusIndicator = document.createElement("div");
    statusIndicator.id = "wtr-if-status-indicator";
    // Base fixed positioning; dynamic system will adjust bottom and keep z-index stable
    statusIndicator.style.position = "fixed";
    statusIndicator.style.left = "20px";
    statusIndicator.style.bottom = POSITION.BASE;
    statusIndicator.style.zIndex = "1025";
    statusIndicator.innerHTML = '<div class="wtr-if-status-icon"></div><span class="wtr-if-status-text"></span>';
    document.body.appendChild(statusIndicator);
    // Call addEventListeners instead of defining them inline
    (0,events/* addEventListeners */.lQ)();
}
function getCachedModelMetadata(cachedData) {
    return cachedData?.metadata && typeof cachedData.metadata === "object" ? cachedData.metadata : {};
}
function formatTokenCount(value) {
    const count = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(count) || count <= 0) {
        return null;
    }
    return count >= 1000 ? `${Math.round(count / 1000)}k` : String(count);
}
function formatPricing(metadata) {
    const prompt = metadata.pricing?.prompt;
    const completion = metadata.pricing?.completion;
    if (prompt === undefined && completion === undefined) {
        return null;
    }
    return `pricing in/out: ${prompt ?? "?"}/${completion ?? "?"}`;
}
function formatModelOptionTitle(modelId, metadata) {
    if (!metadata) {
        return modelId;
    }
    const details = [modelId];
    if (metadata.displayName && metadata.displayName !== modelId) {
        details.push(metadata.displayName);
    }
    if (metadata.ownedBy) {
        details.push(`owned by ${metadata.ownedBy}`);
    }
    const contextLength = formatTokenCount(metadata.contextLength);
    if (contextLength) {
        details.push(`${contextLength} context`);
    }
    const maxOutput = formatTokenCount(metadata.maxCompletionTokens);
    if (maxOutput) {
        details.push(`${maxOutput} max output`);
    }
    if (metadata.capabilities?.reasoning === true) {
        details.push("reasoning");
    }
    if (metadata.capabilities?.temperature === false) {
        details.push("temperature disabled");
    }
    if (metadata.latestAliasFor) {
        details.push(`resolves to ${metadata.latestAliasFor}`);
    }
    const pricing = formatPricing(metadata);
    if (pricing) {
        details.push(pricing);
    }
    return details.join(" - ");
}
function getCachedModelsData(cacheState, providerBucket) {
    if (cacheState && Array.isArray(cacheState.models)) {
        return cacheState;
    }
    if (!cacheState || typeof cacheState !== "object") {
        return null;
    }
    return cacheState[providerBucket] || null;
}
function syncProviderConfigUI() {
    const providerType = document.getElementById("wtr-if-provider-type")?.value || providerConfig/* AI_PROVIDERS */.Q2.OPENAI_COMPATIBLE;
    const defaults = providerConfig/* PROVIDER_DEFAULTS */.hV[providerType] || providerConfig/* PROVIDER_DEFAULTS */.hV[providerConfig/* AI_PROVIDERS */.Q2.OPENAI_COMPATIBLE];
    const apiKeyLabel = document.getElementById("wtr-if-api-key-label");
    const modelLabel = document.getElementById("wtr-if-model-label");
    const baseUrlLabel = document.getElementById("wtr-if-provider-base-url-label");
    const baseUrlInput = document.getElementById("wtr-if-provider-base-url");
    const providerHint = document.getElementById("wtr-if-provider-hint");
    const chatPathInput = document.getElementById("wtr-if-provider-chat-path");
    const modelsPathInput = document.getElementById("wtr-if-provider-models-path");
    const manualPathCheckbox = document.getElementById("wtr-if-provider-use-manual-paths");
    const manualPathFields = document.querySelectorAll(".wtr-if-manual-path-field");
    const openAiFields = document.getElementById("wtr-if-openai-compatible-fields");
    const isGemini = providerType === providerConfig/* AI_PROVIDERS */.Q2.GEMINI;
    if (apiKeyLabel) {
        apiKeyLabel.textContent = defaults.apiKeyLabel;
    }
    if (modelLabel) {
        modelLabel.textContent = defaults.modelLabel;
    }
    if (baseUrlLabel) {
        baseUrlLabel.textContent = isGemini ? "Gemini Base URL" : "Provider Base URL";
    }
    if (baseUrlInput) {
        baseUrlInput.placeholder = defaults.baseUrl;
    }
    if (providerHint) {
        providerHint.textContent = isGemini
            ? "Uses Gemini's native generateContent endpoint and Gemini model catalog. Temperature defaults to 1.0 for Gemini."
            : "Enter only the base URL, such as https://api.openai.com/v1, http://localhost:11434/v1, or https://openrouter.ai/api/v1.";
    }
    if (chatPathInput) {
        chatPathInput.placeholder = defaults.chatCompletionsPath;
    }
    if (modelsPathInput) {
        modelsPathInput.placeholder = defaults.modelsPath;
    }
    if (manualPathCheckbox) {
        manualPathCheckbox.checked = Boolean(state/* appState */.XJ.config.providerUseManualPaths);
    }
    manualPathFields.forEach((field) => {
        field.style.display = manualPathCheckbox?.checked ? "" : "none";
    });
    if (openAiFields) {
        openAiFields.style.display = isGemini ? "none" : "block";
        if (!isGemini) {
            openAiFields.open = Boolean(state/* appState */.XJ.config.providerUseManualPaths);
        }
    }
    updateAIControlHints();
}
function updateChapterSourceUI() {
    const sourceEl = document.getElementById("wtr-if-chapter-source");
    const rangeControls = document.getElementById("wtr-if-wtr-api-range-controls");
    const rangeModeEl = document.getElementById("wtr-if-wtr-api-range-mode");
    const source = sourceEl?.value || state/* appState */.XJ.config.chapterSource || "page";
    const rangeMode = rangeModeEl?.value || state/* appState */.XJ.config.wtrApiRangeMode || "nearby";
    if (rangeControls) {
        rangeControls.style.display = source === "wtr-api" ? "" : "none";
    }
    document.querySelectorAll(".wtr-if-range-grid[data-range-mode]").forEach((group) => {
        group.style.display = source === "wtr-api" && group.dataset.rangeMode === rangeMode ? "grid" : "none";
    });
}
function updateAIControlHints() {
    const providerType = document.getElementById("wtr-if-provider-type")?.value || state/* appState */.XJ.config.providerType;
    const temperatureHint = document.getElementById("wtr-if-temperature-hint");
    const reasoningHint = document.getElementById("wtr-if-reasoning-hint");
    const isGemini = providerType === providerConfig/* AI_PROVIDERS */.Q2.GEMINI;
    if (temperatureHint) {
        temperatureHint.textContent = isGemini
            ? "Gemini usually works best near 1.0. Thinking models may ignore custom sampling settings."
            : "Lower is more predictable, higher is more creative. Reasoning models may ignore or reject custom temperature.";
    }
    if (reasoningHint) {
        reasoningHint.textContent = isGemini
            ? "Gemini thinking is sent only for likely thinking-capable Gemini models."
            : "Reasoning effort is sent only for known reasoning models or Ollama-compatible local models.";
    }
}
async function populateModelSelector() {
    const selectEl = document.getElementById("wtr-if-model");
    if (!selectEl) {
        return;
    }
    selectEl.innerHTML = "<option>Loading from cache...</option>";
    selectEl.disabled = true;
    const providerBucket = (0,state/* getModelsCacheBucket */.ne)(state/* appState */.XJ.config);
    const cacheState = await GM_getValue(state/* MODELS_CACHE_KEY */.ES, null);
    const cachedData = getCachedModelsData(cacheState, providerBucket);
    const cachedModels = Array.isArray(cachedData?.models) ? [...cachedData.models] : [];
    const cachedMetadata = getCachedModelMetadata(cachedData);
    state/* appState */.XJ.runtime.providerModelMetadata = cachedMetadata;
    if (cachedModels.length > 0 && state/* appState */.XJ.config.model && !cachedModels.includes(state/* appState */.XJ.config.model)) {
        cachedModels.unshift(state/* appState */.XJ.config.model);
    }
    if (cachedModels.length > 0) {
        selectEl.innerHTML = cachedModels
            .map((modelId) => {
            const metadata = cachedMetadata[modelId];
            const title = formatModelOptionTitle(modelId, metadata);
            return `<option value="${(0,utils/* escapeHtml */.ZD)(modelId)}" title="${(0,utils/* escapeHtml */.ZD)(title)}">${(0,utils/* escapeHtml */.ZD)(modelId.replace(/^models\//, ""))}</option>`;
        })
            .join("");
        selectEl.value = state/* appState */.XJ.config.model || cachedModels[0];
    }
    else {
        selectEl.innerHTML = '<option value="">No models cached. Please refresh.</option>';
    }
    selectEl.disabled = false;
}
function requestModelCatalog(requestConfig) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: requestConfig.method,
            url: requestConfig.url,
            headers: requestConfig.headers,
            onload: function (response) {
                try {
                    const data = JSON.parse(response.responseText);
                    if (response.status >= 400) {
                        throw new Error(data?.error?.message || response.statusText || `HTTP ${response.status}`);
                    }
                    if (data.error) {
                        throw new Error(data.error.message || "Failed to fetch models");
                    }
                    resolve({ data, url: requestConfig.url });
                }
                catch (e) {
                    reject(e);
                }
            },
            onerror: function (error) {
                console.error("Model fetch error:", error);
                reject(new Error("Network error while fetching models."));
            },
        });
    });
}
async function fetchAndCacheModels() {
    const apiKeyInfo = (0,geminiApi/* getAvailableApiKey */.Rq)();
    const statusEl = document.getElementById("wtr-if-status");
    const refreshButton = document.getElementById("wtr-if-refresh-models-btn");
    if (!apiKeyInfo) {
        statusEl.textContent = "Error: No available API keys. Add one or wait for cooldowns.";
        setTimeout(() => (statusEl.textContent = ""), 4000);
        return;
    }
    const apiKey = apiKeyInfo.key;
    const providerBucket = (0,state/* getModelsCacheBucket */.ne)(state/* appState */.XJ.config);
    const requestConfigs = (0,providerConfig/* buildModelsRequests */.Bx)(state/* appState */.XJ.config, apiKey);
    statusEl.textContent = "Fetching model list...";
    refreshButton.disabled = true;
    try {
        let lastError = null;
        for (let index = 0; index < requestConfigs.length; index++) {
            const requestConfig = requestConfigs[index];
            if (index > 0) {
                statusEl.textContent = `Trying alternate model endpoint ${index + 1}/${requestConfigs.length}...`;
            }
            try {
                const { data, url } = await requestModelCatalog(requestConfig);
                const modelEntries = (0,providerConfig/* parseModelCatalogEntries */.gL)(data);
                const filteredModels = (0,providerConfig/* parseModelsResponse */.Zi)(state/* appState */.XJ.config, data);
                if (filteredModels.length === 0) {
                    lastError = new Error("No compatible models found.");
                    continue;
                }
                const modelMetadata = (0,providerConfig/* buildModelCatalogMetadata */.uJ)(modelEntries.filter((entry) => filteredModels.includes(entry.id)));
                const existingCache = await GM_getValue(state/* MODELS_CACHE_KEY */.ES, null);
                const nextCacheState = existingCache && typeof existingCache === "object" && !Array.isArray(existingCache.models)
                    ? existingCache
                    : {};
                nextCacheState[providerBucket] = {
                    timestamp: Date.now(),
                    models: filteredModels,
                    metadata: modelMetadata,
                };
                state/* appState */.XJ.runtime.providerModelMetadata = modelMetadata;
                await GM_setValue(state/* MODELS_CACHE_KEY */.ES, nextCacheState);
                statusEl.textContent = `Success! Found ${filteredModels.length} models.`;
                (0,utils/* log */.Rm)(`Fetched model catalog from ${url}`, { metadataCount: Object.keys(modelMetadata).length });
                await populateModelSelector();
                return;
            }
            catch (e) {
                lastError = e;
            }
        }
        const advancedDetails = document.getElementById("wtr-if-openai-compatible-fields");
        if (advancedDetails && state/* appState */.XJ.config.providerType !== providerConfig/* AI_PROVIDERS */.Q2.GEMINI) {
            advancedDetails.open = true;
        }
        statusEl.textContent = `Error: ${lastError?.message || "Unable to fetch models"}. See advanced endpoint troubleshooting.`;
    }
    finally {
        setTimeout(() => (statusEl.textContent = ""), 6000);
        refreshButton.disabled = false;
    }
}
function renderApiKeysUI() {
    const container = document.getElementById("wtr-if-api-keys-container");
    if (!container) {
        return;
    }
    container.innerHTML = ""; // Clear existing
    const keys = state/* appState */.XJ.config.apiKeys.length > 0 ? state/* appState */.XJ.config.apiKeys : [""]; // Show at least one empty input
    const inputType = getApiKeyInputType();
    keys.forEach((key) => {
        const keyRow = document.createElement("div");
        keyRow.className = "wtr-if-key-row";
        keyRow.innerHTML = `
            <input type="${inputType}" class="wtr-if-api-key-input" value="${(0,utils/* escapeHtml */.ZD)(key)}" placeholder="Enter your API key">
            <button class="wtr-if-remove-key-btn" title="Remove this key">&times;</button>
        `;
        container.appendChild(keyRow);
    });
    updateApiKeyVisibilityButton();
}
function addApiKeyRow() {
    const container = document.getElementById("wtr-if-api-keys-container");
    const keyRow = document.createElement("div");
    keyRow.className = "wtr-if-key-row";
    keyRow.innerHTML = `
        <input type="${getApiKeyInputType()}" class="wtr-if-api-key-input" placeholder="Enter your API key">
        <button class="wtr-if-remove-key-btn" title="Remove this key">&times;</button>
    `;
    container.appendChild(keyRow);
    keyRow.querySelector("input").focus();
}
function toggleApiKeyVisibility() {
    areApiKeysVisible = !areApiKeysVisible;
    document.querySelectorAll(".wtr-if-api-key-input").forEach((input) => {
        input.type = getApiKeyInputType();
    });
    updateApiKeyVisibilityButton();
}
function updateDebugLoggingUI() {
    const loggingCheckbox = document.getElementById("wtr-if-logging-enabled");
    const debugActions = document.getElementById("wtr-if-debug-log-actions");
    const debugHint = document.getElementById("wtr-if-debug-log-hint");
    const isEnabled = Boolean(loggingCheckbox?.checked || state/* appState */.XJ.config.loggingEnabled);
    if (debugActions) {
        debugActions.style.display = isEnabled ? "" : "none";
    }
    if (debugHint) {
        const logCount = (0,utils/* getDebugLogCount */.JX)();
        debugHint.textContent =
            logCount > 0
                ? `${logCount} debug log entr${logCount === 1 ? "y" : "ies"} ready to copy. API keys are redacted from the report.`
                : "No debug logs captured yet. Reproduce the issue, then copy the report.";
    }
}
function updateTermReplacerIntegrationUI() {
    try {
        const isExternalReplacerAvailable = (0,utils/* isWTRLabTermReplacerLoaded */.mT)();
        const liveSyncContainer = document.getElementById("wtr-if-use-live-term-replacer-sync-container");
        const liveSyncCheckbox = document.getElementById("wtr-if-use-live-term-replacer-sync");
        const useJsonContainer = document.getElementById("wtr-if-use-json-container");
        const useJsonCheckbox = document.getElementById("wtr-if-use-json");
        const modeHint = document.getElementById("wtr-if-term-replacer-mode-hint");
        if (!liveSyncContainer || !liveSyncCheckbox || !useJsonContainer || !useJsonCheckbox || !modeHint) {
            return;
        }
        if (isExternalReplacerAvailable) {
            liveSyncContainer.style.display = "";
            liveSyncCheckbox.disabled = false;
            liveSyncCheckbox.checked = Boolean(state/* appState */.XJ.config.useLiveTermReplacerSync);
            useJsonContainer.style.display = "";
            useJsonCheckbox.disabled = false;
            modeHint.textContent = state/* appState */.XJ.config.useLiveTermReplacerSync
                ? "Detected WTR Lab Term Replacer userscript. Finder will automatically use its live term list during analysis. Enable JSON mode only if you want to import a backup file instead."
                : "Detected WTR Lab Term Replacer userscript, but automatic live-term sync is disabled. Finder will ignore Term Replacer terms during analysis unless you enable JSON mode or turn live sync back on.";
        }
        else {
            liveSyncContainer.style.display = "none";
            useJsonContainer.style.display = "none";
            useJsonCheckbox.checked = false;
            if (state/* appState */.XJ.config.useJson) {
                state/* appState */.XJ.config.useJson = false;
            }
            modeHint.textContent =
                "External WTR Lab Term Replacer userscript not detected. Using built-in term inconsistency finder behavior only. Install the external userscript if you want tight integration.";
        }
    }
    catch (e) {
        (0,utils/* log */.Rm)("WTR Lab Term Replacer UI integration update failed; continuing in safe mode.", e);
    }
}
async function togglePanel(show = null) {
    const panel = document.getElementById("wtr-if-panel");
    if (!panel) {
        return;
    }
    const isVisible = panel.style.display === "flex";
    const shouldShow = show !== null ? show : !isVisible;
    panel.style.display = shouldShow ? "flex" : "none";
    if (shouldShow) {
        // Restore UI state from config
        renderApiKeysUI();
        document.getElementById("wtr-if-provider-type").value = state/* appState */.XJ.config.providerType;
        document.getElementById("wtr-if-provider-base-url").value = state/* appState */.XJ.config.providerBaseUrl;
        document.getElementById("wtr-if-provider-chat-path").value = state/* appState */.XJ.config.providerChatCompletionsPath;
        document.getElementById("wtr-if-provider-models-path").value = state/* appState */.XJ.config.providerModelsPath;
        document.getElementById("wtr-if-provider-use-manual-paths").checked = Boolean(state/* appState */.XJ.config.providerUseManualPaths);
        syncProviderConfigUI();
        document.getElementById("wtr-if-use-live-term-replacer-sync").checked = state/* appState */.XJ.config.useLiveTermReplacerSync;
        document.getElementById("wtr-if-use-json").checked = state/* appState */.XJ.config.useJson;
        document.getElementById("wtr-if-use-official-wtr-glossary").checked = state/* appState */.XJ.config.useOfficialWtrGlossary;
        document.getElementById("wtr-if-chapter-source").value = state/* appState */.XJ.config.chapterSource || "page";
        document.getElementById("wtr-if-wtr-api-range-mode").value = state/* appState */.XJ.config.wtrApiRangeMode || "nearby";
        document.getElementById("wtr-if-wtr-api-previous").value = String(state/* appState */.XJ.config.wtrApiPreviousChapters ?? 2);
        document.getElementById("wtr-if-wtr-api-next").value = String(state/* appState */.XJ.config.wtrApiNextChapters ?? 2);
        document.getElementById("wtr-if-wtr-api-start").value = String(state/* appState */.XJ.config.wtrApiStartChapter || "");
        document.getElementById("wtr-if-wtr-api-end").value = String(state/* appState */.XJ.config.wtrApiEndChapter || "");
        updateChapterSourceUI();
        document.getElementById("wtr-if-logging-enabled").checked = state/* appState */.XJ.config.loggingEnabled;
        updateDebugLoggingUI();
        document.getElementById("wtr-if-auto-restore").checked = state/* appState */.XJ.preferences.autoRestoreResults;
        const tempSlider = document.getElementById("wtr-if-temperature");
        const tempValue = document.getElementById("wtr-if-temp-value");
        tempSlider.value = state/* appState */.XJ.config.temperature ?? (0,providerConfig/* getProviderDefaultTemperature */.tl)(state/* appState */.XJ.config.providerType);
        tempValue.textContent = tempSlider.value;
        document.getElementById("wtr-if-reasoning-mode").value = state/* appState */.XJ.config.reasoningMode || "off";
        // Restore tab
        panel.querySelectorAll(".wtr-if-tab-btn").forEach((b) => b.classList.remove("active"));
        panel.querySelectorAll(".wtr-if-tab-content").forEach((c) => c.classList.remove("active"));
        const activeTabBtn = panel.querySelector(`.wtr-if-tab-btn[data-tab="${state/* appState */.XJ.config.activeTab}"]`);
        const activeTabContent = panel.querySelector(`#wtr-if-tab-${state/* appState */.XJ.config.activeTab}`);
        if (activeTabBtn) {
            activeTabBtn.classList.add("active");
        }
        if (activeTabContent) {
            activeTabContent.classList.add("active");
        }
        // Restore deep analysis depth
        document.getElementById("wtr-if-deep-analysis-depth").value = state/* appState */.XJ.config.deepAnalysisDepth.toString();
        // Restore filter
        document.getElementById("wtr-if-filter-select").value = state/* appState */.XJ.config.activeFilter;
        await populateModelSelector();
        // Apply dynamic UI based on WTR Lab Term Replacer detection
        updateTermReplacerIntegrationUI();
        // Check for session results and show restore option if available
        const sessionRestore = document.getElementById("wtr-if-session-restore");
        if (state/* appState */.XJ.session.hasSavedResults && state/* appState */.XJ.preferences.autoRestoreResults) {
            // Auto-restore if enabled:
            // - Restores results
            // - Immediately syncs Finder Apply/Copy buttons for restored DOM
            (0,events/* handleRestoreSession */.Zo)();
        }
        else if (sessionRestore) {
            sessionRestore.style.display = state/* appState */.XJ.session.hasSavedResults ? "block" : "none";
        }
        // Ensure Apply/Copy button modes are synchronized after panel initialization
        try {
            const { updateApplyCopyButtonsMode } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 753));
            updateApplyCopyButtonsMode();
        }
        catch (error) {
            (0,utils/* log */.Rm)("Failed to sync Apply/Copy button modes after panel initialization:", error);
        }
    }
}
function updateStatusIndicator(state, message = "") {
    const indicator = document.getElementById("wtr-if-status-indicator");
    if (!indicator) {
        return;
    }
    const iconEl = indicator.querySelector(".wtr-if-status-icon");
    const textEl = indicator.querySelector(".wtr-if-status-text");
    indicator.className = state;
    textEl.textContent = message;
    iconEl.textContent = ""; // Clear any previous icon content
    indicator.style.display = state === "hidden" ? "none" : "flex";
    adjustIndicatorPosition();
}
/**
 * Dynamic Collision Avoidance System for WTR Status Indicator
 *
 * This system provides intelligent, real-time collision detection and avoidance
 * for the WTR Term Inconsistency Finder status widget.
 */
// Position constants
const POSITION = {
    BASE: "var(--nig-space-xl, 20px)", // Default baseline above page bottom
    NIG_CONFLICT: "80px", // Move up when conflicting widget present
    SAFE_DEFAULT: "60px", // Fallback position
};
// Collision detection state
const collisionState = {
    isMonitoringActive: false,
    lastNigWidgetState: null,
    currentPosition: null,
    lastZIndex: null,
    debounceTimer: null,
    lastAppliedBottom: null,
};
/**
 * Get the current computed bottom position of an element
 */
function _getElementBottomPosition(element) {
    if (!element) {
        return null;
    }
    const computed = getComputedStyle(element);
    const bottom = computed.bottom;
    // Extract numeric value from bottom position
    if (bottom && bottom !== "auto") {
        return parseFloat(bottom.replace("px", "")) || 0;
    }
    return 0;
}
/**
 * Check if two elements would collide vertically
 */
function isVisibleElement(el) {
    if (!el) {
        return false;
    }
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
        return false;
    }
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
}
/**
 * Check if two elements would collide vertically (and generally overlap)
 * Only considers collisions when both elements are visible in the viewport.
 */
function _wouldCollide(element1, element2, spacing = 10) {
    if (!element1 || !element2) {
        return false;
    }
    if (!isVisibleElement(element1) || !isVisibleElement(element2)) {
        return false;
    }
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    // Basic overlap check: vertical spacing plus horizontal intersection
    const verticalOverlap = rect1.bottom + spacing > rect2.top;
    const horizontalOverlap = rect1.right > rect2.left && rect1.left < rect2.right;
    return verticalOverlap && horizontalOverlap;
}
/**
 * Determine optimal position based on current collision state
 */
function calculateOptimalPosition(nigWidget, indicator) {
    const isNigVisible = isVisibleElement(nigWidget);
    const nigState = isNigVisible ? "present" : "absent";
    const conflictStates = {
        nig: nigState,
    };
    const newZIndex = 1025;
    if (!indicator) {
        return {
            position: POSITION.BASE,
            zIndex: newZIndex,
            states: conflictStates,
        };
    }
    let hasNigConflict = false;
    if (isNigVisible && nigWidget) {
        // Virtually test the indicator at BASE position against the NIG widget
        const indicatorRect = indicator.getBoundingClientRect();
        const nigRect = nigWidget.getBoundingClientRect();
        // Construct a virtual rect for the indicator as if it were at BASE (20px)
        const baseOffsetPx = 20;
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const virtualBottom = baseOffsetPx;
        const virtualTop = viewportHeight - virtualBottom - indicatorRect.height;
        const virtualRect = {
            top: virtualTop,
            bottom: virtualTop + indicatorRect.height,
            left: indicatorRect.left,
            right: indicatorRect.right,
        };
        const verticalOverlap = virtualRect.bottom > nigRect.top;
        const horizontalOverlap = virtualRect.right > nigRect.left && virtualRect.left < nigRect.right;
        if (verticalOverlap && horizontalOverlap) {
            hasNigConflict = true;
        }
    }
    const position = hasNigConflict ? POSITION.NIG_CONFLICT : POSITION.BASE;
    return {
        position,
        zIndex: newZIndex,
        states: conflictStates,
    };
}
/**
 * Apply position changes with smooth transitions
 */
function applyPosition(indicator, position, zIndex) {
    if (!indicator) {
        return;
    }
    const nextBottom = position;
    const nextZ = zIndex || 1025;
    // Avoid unnecessary writes to prevent jitter
    if (collisionState.lastAppliedBottom === nextBottom && collisionState.lastZIndex === nextZ) {
        return;
    }
    collisionState.currentPosition = nextBottom;
    collisionState.lastAppliedBottom = nextBottom;
    collisionState.lastZIndex = nextZ;
    indicator.style.bottom = nextBottom;
    indicator.style.zIndex = String(nextZ);
    (0,utils/* log */.Rm)(`Position updated to: ${nextBottom}, Z-index: ${nextZ}`);
}
/**
 * Main collision detection function - dynamically monitors and adjusts position
 */
function adjustIndicatorPosition() {
    const indicator = document.getElementById("wtr-if-status-indicator");
    if (!indicator) {
        return;
    }
    // Ensure stable fixed positioning; never toggle between fixed/other
    const computed = getComputedStyle(indicator);
    if (computed.position !== "fixed") {
        indicator.style.position = "fixed";
        if (!indicator.style.left) {
            indicator.style.left = "20px";
        }
    }
    const nigWidget = document.querySelector(".nig-status-widget, #nig-status-widget");
    const { position, zIndex, states } = calculateOptimalPosition(nigWidget, indicator);
    applyPosition(indicator, position, zIndex);
    collisionState.lastNigWidgetState = states.nig;
}
function injectControlButton() {
    const mainObserver = new MutationObserver((mutations, mainObs) => {
        const navBar = document.querySelector("nav.bottom-reader-nav");
        if (navBar) {
            (0,utils/* log */.Rm)("Bottom navigation bar found. Attaching persistent observer.");
            mainObs.disconnect();
            const navObserver = new MutationObserver(() => {
                const targetContainer = navBar.querySelector('div[role="group"].btn-group');
                if (targetContainer && !document.getElementById("wtr-if-analyze-btn")) {
                    (0,utils/* log */.Rm)("Button container found. Injecting button.");
                    const analyzeButton = document.createElement("button");
                    analyzeButton.id = "wtr-if-analyze-btn";
                    analyzeButton.className = "wtr btn btn-outline-dark btn-sm";
                    analyzeButton.type = "button";
                    analyzeButton.title = "Analyze Inconsistencies";
                    analyzeButton.innerHTML =
                        '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4V6a4 4 0 0 0-4-4Z"/><path d="M12 2v20"/><path d="M12 12h8"/><path d="M12 12H4"/><path d="M12 6h6"/><path d="M12 6H6"/><path d="M12 18h6"/><path d="M12 18H6"/></svg>';
                    analyzeButton.addEventListener("click", () => togglePanel(true));
                    targetContainer.appendChild(analyzeButton);
                }
            });
            navObserver.observe(navBar, {
                childList: true,
                subtree: true,
            });
            // Initial check
            const initialTarget = navBar.querySelector('div[role="group"].btn-group');
            if (initialTarget && !document.getElementById("wtr-if-analyze-btn")) {
                const analyzeButton = document.createElement("button");
                analyzeButton.id = "wtr-if-analyze-btn";
                analyzeButton.className = "wtr btn btn-outline-dark btn-sm";
                analyzeButton.type = "button";
                analyzeButton.title = "Analyze Inconsistencies";
                analyzeButton.innerHTML =
                    '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-2a4 4 0 0 0-4-4V6a4 4 0 0 0-4-4Z"/><path d="M12 2v20"/><path d="M12 12h8"/><path d="M12 12H4"/><path d="M12 6h6"/><path d="M12 6H6"/><path d="M12 18h6"/><path d="M12 18H6"/></svg>';
                analyzeButton.addEventListener("click", () => togglePanel(true));
                initialTarget.appendChild(analyzeButton);
            }
        }
    });
    mainObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });
}
/**
 * Initialize the dynamic collision avoidance system
 */
function initializeCollisionAvoidance() {
    // Start monitoring
    collisionState.isMonitoringActive = true;
    // Initial position check
    adjustIndicatorPosition();
    // Set up comprehensive observers for dynamic collision detection
    setupConflictObserver();
    setupScrollListener();
    setupResizeListener();
    (0,utils/* log */.Rm)("Dynamic collision avoidance system initialized.");
}
/**
 * Enhanced conflict observer with debounced updates and comprehensive monitoring
 */
function setupConflictObserver() {
    // Debounced observer to prevent excessive updates and oscillation
    const debouncedAdjustPosition = debounce(() => {
        if (collisionState.isMonitoringActive) {
            adjustIndicatorPosition();
        }
    }, 150);
    const observer = new MutationObserver((mutations) => {
        const relevantMutations = mutations.some((mutation) => {
            if (mutation.type === "childList") {
                return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
            }
            if (mutation.type === "attributes") {
                return ["style", "class", "display"].includes(mutation.attributeName);
            }
            return false;
        });
        if (relevantMutations) {
            debouncedAdjustPosition();
        }
    });
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["style", "class", "id", "display"],
    });
    // Observe key conflict-prone elements directly when present
    const nigWidget = document.querySelector(".nig-status-widget, #nig-status-widget");
    if (nigWidget) {
        observer.observe(nigWidget, {
            attributes: true,
            attributeFilter: ["style", "class", "display"],
        });
    }
    const bottomNav = document.querySelector("nav.bottom-reader-nav") ||
        document.querySelector(".bottom-reader-nav") ||
        document.querySelector(".fixed-bottom");
    if (bottomNav) {
        observer.observe(bottomNav, {
            attributes: true,
            childList: true,
            subtree: true,
        });
    }
    (0,utils/* log */.Rm)("Enhanced conflict observer initialized (NIG widget, bottom reader nav, and related widgets).");
}
/**
 * Monitor scroll events to detect position changes
 */
function setupScrollListener() {
    let scrollTimeout;
    const handleScroll = () => {
        if (!collisionState.isMonitoringActive) {
            return;
        }
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            adjustIndicatorPosition();
        }, 150); // Debounce scroll events
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    (0,utils/* log */.Rm)("Scroll listener initialized for collision detection.");
}
/**
 * Monitor window resize events
 */
function setupResizeListener() {
    let resizeTimeout;
    const handleResize = () => {
        if (!collisionState.isMonitoringActive) {
            return;
        }
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            adjustIndicatorPosition();
        }, 250); // Debounce resize events
    };
    window.addEventListener("resize", handleResize);
    (0,utils/* log */.Rm)("Resize listener initialized for collision detection.");
}
/**
 * Debounce utility function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
/**
 * Enable/disable collision monitoring
 */
function setCollisionMonitoring(enabled) {
    collisionState.isMonitoringActive = enabled;
    log(`Collision monitoring ${enabled ? "enabled" : "disabled"}.`);
    if (enabled) {
        adjustIndicatorPosition(); // Immediate update when re-enabling
    }
}
/**
 * Get current collision avoidance status for debugging
 */
function getCollisionAvoidanceStatus() {
    const indicator = document.getElementById("wtr-if-status-indicator");
    const nigWidget = document.querySelector(".nig-status-widget, #nig-status-widget");
    return {
        isMonitoring: collisionState.isMonitoringActive,
        currentPosition: collisionState.currentPosition,
        lastNigState: collisionState.lastNigWidgetState,
        indicatorRect: indicator ? indicator.getBoundingClientRect() : null,
        nigWidgetVisible: nigWidget ? getComputedStyle(nigWidget).display !== "none" : false,
    };
}


/***/ },

/***/ 158
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ir: () => (/* binding */ getNovelSlug),
/* harmony export */   JX: () => (/* binding */ getDebugLogCount),
/* harmony export */   Nt: () => (/* binding */ escapeRegExp),
/* harmony export */   Q: () => (/* binding */ getDebugLogReport),
/* harmony export */   Rm: () => (/* binding */ log),
/* harmony export */   ZD: () => (/* binding */ escapeHtml),
/* harmony export */   bd: () => (/* binding */ mergeAnalysisResults),
/* harmony export */   bn: () => (/* binding */ crawlChapterData),
/* harmony export */   dH: () => (/* binding */ requestTermsFromWTRLabTermReplacer),
/* harmony export */   eM: () => (/* binding */ truncateForLog),
/* harmony export */   fN: () => (/* binding */ summarizeContextResults),
/* harmony export */   mT: () => (/* binding */ isWTRLabTermReplacerLoaded),
/* harmony export */   o3: () => (/* binding */ areSemanticallySimilar),
/* harmony export */   oV: () => (/* binding */ validateResultForContext),
/* harmony export */   o_: () => (/* binding */ clearDebugLogs),
/* harmony export */   sz: () => (/* binding */ applyTermReplacements),
/* harmony export */   zF: () => (/* binding */ extractJsonFromString)
/* harmony export */ });
/* unused harmony exports summarizeForLog, calculateResultQuality */
/* harmony import */ var _state__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(654);
// src/modules/utils.ts

// --- UTILITY FUNCTIONS ---
const MAX_DEBUG_LOG_ENTRIES = 300;
const debugLogEntries = [];
function redactSensitiveText(value) {
    if (typeof value !== "string") {
        return value;
    }
    return value
        .replace(/Bearer\s+[A-Za-z0-9._~+/=:-]+/gi, "Bearer [REDACTED]")
        .replace(/(api[_-]?key|authorization|token|key)(["'`\s:=]+)([^"'`\s,}]+)/gi, "$1$2[REDACTED]")
        .replace(/sk-[A-Za-z0-9_-]{12,}/g, "sk-[REDACTED]");
}
function normalizeDebugLogValue(value) {
    const summarized = summarizeForLog(value);
    if (typeof summarized === "string") {
        return redactSensitiveText(summarized);
    }
    try {
        return JSON.parse(redactSensitiveText(JSON.stringify(summarized)));
    }
    catch {
        return redactSensitiveText(String(summarized));
    }
}
function appendDebugLogEntry(args) {
    debugLogEntries.push({
        timestamp: new Date().toISOString(),
        args: args.map((arg) => normalizeDebugLogValue(arg)),
    });
    if (debugLogEntries.length > MAX_DEBUG_LOG_ENTRIES) {
        debugLogEntries.splice(0, debugLogEntries.length - MAX_DEBUG_LOG_ENTRIES);
    }
}
function formatDebugLogValue(value) {
    if (typeof value === "string") {
        return value;
    }
    try {
        return JSON.stringify(value, null, 2);
    }
    catch {
        return String(value);
    }
}
function getDebugLogCount() {
    return debugLogEntries.length;
}
function clearDebugLogs() {
    debugLogEntries.length = 0;
}
function getDebugLogReport() {
    const providerBaseUrl = _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerBaseUrl || "not configured";
    const reportLines = [
        "# WTR Lab Term Inconsistency Finder Debug Report",
        "",
        `Generated: ${new Date().toISOString()}`,
        `Script version: ${window.WTR_VERSION || "unknown"}`,
        `Page: ${window.location.href}`,
        "",
        "## Configuration",
        `- Provider: ${_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.providerType || "unknown"}`,
        `- Base URL: ${providerBaseUrl}`,
        `- Model: ${_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.model || "not selected"}`,
        `- Temperature: ${_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.temperature ?? "default"}`,
        `- Reasoning mode: ${_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.reasoningMode || "off"}`,
        `- Deep analysis depth: ${_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.deepAnalysisDepth || 1}`,
        `- Chapter source: ${_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.chapterSource || "page"}`,
        `- WTR official glossary context: ${_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.useOfficialWtrGlossary ? "enabled" : "disabled"}`,
        `- API key count: ${Array.isArray(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.apiKeys) ? _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.apiKeys.filter(Boolean).length : 0}`,
        "",
        "## Runtime",
        `- Analysis running: ${Boolean(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.isAnalysisRunning)}`,
        `- Current iteration: ${_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.currentIteration || 1}/${_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.totalIterations || 1}`,
        `- Result count: ${Array.isArray(_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.cumulativeResults) ? _state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.runtime.cumulativeResults.length : 0}`,
        `- Log entries: ${debugLogEntries.length}`,
        "",
        "## Logs",
    ];
    if (debugLogEntries.length === 0) {
        reportLines.push("No debug log entries were captured yet.");
    }
    else {
        debugLogEntries.forEach((entry, index) => {
            reportLines.push("", `### ${index + 1}. ${entry.timestamp}`);
            entry.args.forEach((arg) => {
                reportLines.push("```", formatDebugLogValue(arg), "```");
            });
        });
    }
    return reportLines.join("\n");
}
function truncateForLog(value, maxLength = 280) {
    if (typeof value !== "string") {
        return value;
    }
    if (value.length <= maxLength) {
        return value;
    }
    return `${value.slice(0, maxLength)}… [truncated ${value.length - maxLength} chars]`;
}
function summarizeForLog(value, maxStringLength = 280) {
    if (typeof value === "string") {
        return truncateForLog(value, maxStringLength);
    }
    if (Array.isArray(value)) {
        return {
            type: "array",
            length: value.length,
            preview: value.slice(0, 3),
        };
    }
    if (value && typeof value === "object") {
        return value;
    }
    return value;
}
function log(...args) {
    if (_state__WEBPACK_IMPORTED_MODULE_0__/* .appState */ .XJ.config.loggingEnabled) {
        appendDebugLogEntry(args);
        console.log("Inconsistency Finder:", ...args.map((arg) => summarizeForLog(arg)));
    }
}
function getNovelSlug() {
    const match = window.location.pathname.match(/novel\/\d+\/([^/]+)/);
    return match ? match[1] : null;
}
function crawlChapterData() {
    const chapterTrackers = document.querySelectorAll(".chapter-tracker");
    log(`Found ${chapterTrackers.length} potential chapter elements.`);
    const chapterData = [];
    chapterTrackers.forEach((tracker, index) => {
        const chapterBody = tracker.querySelector(".chapter-body");
        const chapterNo = tracker.dataset.chapterNo;
        if (chapterBody && chapterNo) {
            log(`Processing chapter #${chapterNo}...`);
            chapterData.push({
                chapter: chapterNo,
                text: chapterBody.innerText,
                tracker: tracker,
            });
        }
        else {
            log(`Skipping element at index ${index}: missing chapter number or body. Chapter No: ${chapterNo || "not found"}`);
        }
    });
    log(`Successfully collected data for ${chapterData.length} chapters: [${chapterData.map((d) => d.chapter).join(", ")}]`);
    return chapterData;
}
function applyTermReplacements(chapterData, terms = []) {
    if (!terms || terms.length === 0) {
        log("No terms provided. Skipping replacement step.");
        return chapterData;
    }
    log(`Applying ${terms.length} replacement terms using advanced logic.`);
    // 1. Categorize and compile terms ONCE for efficiency.
    const simple_cs_partial = new Map();
    const simple_cs_whole = new Map();
    const simple_ci_partial = new Map();
    const simple_ci_whole = new Map();
    const regex_terms = [];
    for (const term of terms) {
        if (!term.original) {
            continue;
        }
        term.wholeWord = term.wholeWord ?? false;
        if (term.isRegex) {
            try {
                const flags = term.caseSensitive ? "g" : "gi";
                regex_terms.push({
                    pattern: new RegExp(term.original, flags),
                    replacement: term.replacement,
                });
            }
            catch (e) {
                console.error(`Inconsistency Finder: Skipping invalid regex for term "${term.original}":`, e);
            }
        }
        else {
            const key = term.caseSensitive ? term.original : term.original.toLowerCase();
            const value = term.replacement;
            if (term.caseSensitive) {
                if (term.wholeWord) {
                    simple_cs_whole.set(key, value);
                }
                else {
                    simple_cs_partial.set(key, value);
                }
            }
            else {
                if (term.wholeWord) {
                    simple_ci_whole.set(key, value);
                }
                else {
                    simple_ci_partial.set(key, value);
                }
            }
        }
    }
    const compiledTerms = [...regex_terms];
    const addSimpleGroup = (map, flags, wholeWord, caseSensitive) => {
        if (map.size > 0) {
            const sortedKeys = [...map.keys()].sort((a, b) => b.length - a.length);
            const patterns = sortedKeys.map((k) => {
                const escaped = escapeRegExp(k);
                return wholeWord ? `\\b${escaped}\\b` : escaped;
            });
            const combined = patterns.join("|");
            compiledTerms.push({
                pattern: new RegExp(combined, flags),
                replacement_map: map,
                is_simple: true,
                case_sensitive: caseSensitive,
            });
        }
    };
    addSimpleGroup(simple_cs_partial, "g", false, true);
    addSimpleGroup(simple_cs_whole, "g", true, true);
    addSimpleGroup(simple_ci_partial, "gi", false, false);
    addSimpleGroup(simple_ci_whole, "gi", true, false);
    const replacementStats = {
        chapterCount: chapterData.length,
        compiledPatternCount: compiledTerms.length,
        rawMatchCount: 0,
        appliedMatchCount: 0,
        chapterSummaries: [],
    };
    // 2. Process each chapter's text.
    const processedChapterData = chapterData.map((data) => {
        // Skip processing if this is the active chapter
        if (data.tracker && data.tracker.classList.contains("chapter-tracker active")) {
            log(`Skipping term replacements on active chapter #${data.chapter} to avoid conflicts`);
            return data;
        }
        let fullText = data.text;
        // 3. Find ALL possible matches from all compiled terms.
        const allMatches = [];
        for (const comp of compiledTerms) {
            for (const match of fullText.matchAll(comp.pattern)) {
                if (match[0].length === 0) {
                    continue;
                } // Skip zero-length matches
                let replacementText;
                if (comp.is_simple) {
                    const key = comp.case_sensitive ? match[0] : match[0].toLowerCase();
                    replacementText = comp.replacement_map.get(key);
                }
                else {
                    replacementText = comp.replacement; // Match the Term Replacer's logic
                }
                if (replacementText !== undefined) {
                    allMatches.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        replacement: replacementText,
                    });
                }
            }
        }
        // 4. Resolve overlaps: Sort by start index, then by end index descending (longest match wins).
        allMatches.sort((a, b) => {
            if (a.start !== b.start) {
                return a.start - b.start;
            }
            return b.end - a.end;
        });
        // 5. Select the non-overlapping "winning" matches.
        const winningMatches = [];
        let lastEnd = -1;
        for (const match of allMatches) {
            if (match.start >= lastEnd) {
                winningMatches.push(match);
                lastEnd = match.end;
            }
        }
        // 6. Apply winning matches to the string, from last to first to avoid index issues.
        replacementStats.rawMatchCount += allMatches.length;
        replacementStats.appliedMatchCount += winningMatches.length;
        if (allMatches.length > 0 || winningMatches.length > 0) {
            replacementStats.chapterSummaries.push({
                chapter: data.chapter,
                rawMatches: allMatches.length,
                appliedMatches: winningMatches.length,
                skippedOverlaps: allMatches.length - winningMatches.length,
            });
        }
        for (let i = winningMatches.length - 1; i >= 0; i--) {
            const match = winningMatches[i];
            fullText = fullText.substring(0, match.start) + match.replacement + fullText.substring(match.end);
        }
        return { ...data, text: fullText };
    });
    log("Completed replacement preprocessing for analysis.", replacementStats);
    return processedChapterData;
}
function summarizeContextResults(existingResults, maxItems = 50) {
    // Implement context summarization to prevent exponential growth
    if (existingResults.length <= maxItems) {
        return existingResults;
    }
    // Sort by quality score (highest first)
    const sortedResults = existingResults
        .map((result) => ({
        ...result,
        qualityScore: calculateResultQuality(result),
    }))
        .sort((a, b) => b.qualityScore - a.qualityScore);
    // Take top items by quality score
    const topResults = sortedResults.slice(0, maxItems);
    // Summarize the rest into a brief overview
    const summarizedCount = existingResults.length - maxItems;
    const summarizedOverview = {
        concept: `[${summarizedCount} Additional Items Summarized]`,
        priority: "INFO",
        explanation: `Additional ${summarizedCount} items from previous analysis are summarized. Focus verification on the detailed items below.`,
        suggestions: [],
        variations: [],
    };
    log(`Context summarization: ${existingResults.length} items reduced to ${maxItems} detailed + 1 summarized`);
    return [...topResults, summarizedOverview];
}
function validateResultForContext(result) {
    // Validate individual result before including in context
    if (!result || typeof result !== "object") {
        return false;
    }
    // Check required fields
    if (!result.concept || typeof result.concept !== "string" || result.concept.trim() === "") {
        return false;
    }
    if (!result.explanation || typeof result.explanation !== "string" || result.explanation.trim() === "") {
        return false;
    }
    if (!result.variations || !Array.isArray(result.variations) || result.variations.length === 0) {
        return false;
    }
    // Validate variations structure
    for (const variation of result.variations) {
        if (!variation.phrase || typeof variation.phrase !== "string" || variation.phrase.trim() === "") {
            return false;
        }
        if (!variation.chapter || typeof variation.chapter !== "string" || variation.chapter.trim() === "") {
            return false;
        }
        if (!variation.context_snippet || typeof variation.context_snippet !== "string") {
            return false;
        }
    }
    return true;
}
function calculateResultQuality(result) {
    // Quality scoring for merge conflict resolution
    let quality = 0;
    // Priority-based scoring (higher priority = higher quality)
    const priorityScores = {
        CRITICAL: 100,
        HIGH: 80,
        MEDIUM: 60,
        LOW: 40,
        STYLISTIC: 20,
        INFO: 10,
    };
    quality += priorityScores[result.priority] || 10;
    // Variation count bonus (more variations = more thorough analysis)
    quality += (result.variations?.length || 0) * 5;
    // Suggestion count bonus (more suggestions = better analysis)
    quality += (result.suggestions?.length || 0) * 3;
    // Verified status bonus (verified items are more reliable)
    if (result.status === "Verified") {
        quality += 20;
    }
    // New item penalty (new items need verification)
    if (result.isNew) {
        quality -= 10;
    }
    // Penalize clearly low-signal / noisy contexts to avoid them dominating merges.
    const concept = (result.concept || "").toString();
    if (/^\s*$/.test(concept)) {
        quality -= 30;
    }
    return quality;
}
/**
 * Lightweight script detection helpers for semantic safeguards.
 * These are conservative and only used to block obviously invalid merges.
 */
function detectScriptCategory(text) {
    if (!text || typeof text !== "string") {
        return "unknown";
    }
    let hasLatin = false;
    let hasCJK = false;
    let hasCyrillic = false;
    let hasOther = false;
    for (const ch of text) {
        const code = ch.codePointAt(0);
        // Latin (basic + extended)
        if ((code >= 0x0041 && code <= 0x005a) || // A-Z
            (code >= 0x0061 && code <= 0x007a) || // a-z
            (code >= 0x00c0 && code <= 0x024f) // Latin Extended
        ) {
            hasLatin = true;
            continue;
        }
        // CJK Unified, Hiragana, Katakana, etc.
        if ((code >= 0x3040 && code <= 0x30ff) || // Hiragana & Katakana
            (code >= 0x3400 && code <= 0x9fff) || // CJK Unified Ideographs
            (code >= 0xf900 && code <= 0xfaff) // CJK Compatibility Ideographs
        ) {
            hasCJK = true;
            continue;
        }
        // Cyrillic
        if (code >= 0x0400 && code <= 0x04ff) {
            hasCyrillic = true;
            continue;
        }
        // Skip punctuation, spaces, digits for classification
        if ((code >= 0x0030 && code <= 0x0039) || // 0-9
            /\s/.test(ch) ||
            /[.,!?'"`:;()[\]{}\-_/\\]/.test(ch)) {
            continue;
        }
        hasOther = true;
    }
    if (hasCJK && !hasLatin && !hasCyrillic && !hasOther) {
        return "cjk";
    }
    if (hasCyrillic && !hasLatin && !hasCJK && !hasOther) {
        return "cyrillic";
    }
    if (hasLatin && !hasCJK && !hasCyrillic && !hasOther) {
        return "latin";
    }
    // Mixed or unknown scripts; treat conservatively.
    return "mixed";
}
function stripParentheticalAnnotations(value) {
    if (!value || typeof value !== "string") {
        return "";
    }
    const stripped = value
        .replace(/\s*[([{][^\])}]*[\])}]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    // Only drop annotations when a meaningful base remains. This avoids erasing concepts
    // that are intentionally just a bracketed name.
    return stripped || value.trim();
}
function getComparableConceptText(value) {
    return stripParentheticalAnnotations(value);
}
function splitConceptVariants(concept) {
    if (!concept || typeof concept !== "string") {
        return [];
    }
    const trimmed = concept.trim();
    if (!trimmed) {
        return [];
    }
    const annotationStripped = stripParentheticalAnnotations(trimmed);
    const variants = [
        trimmed,
        annotationStripped,
        ...trimmed.split(/\s*(?:\/|\||;|\bvs\.?\b|\bversus\b)\s*/i),
        ...annotationStripped.split(/\s*(?:\/|\||;|\bvs\.?\b|\bversus\b)\s*/i),
    ];
    const seen = new Set();
    return variants
        .map((variant) => variant.trim())
        .filter((variant) => {
        if (!variant || seen.has(variant.toLowerCase())) {
            return false;
        }
        seen.add(variant.toLowerCase());
        return true;
    });
}
function normalizeConceptForComparison(str) {
    return getComparableConceptText(str)
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function getNormalizedConceptVariants(concept) {
    return splitConceptVariants(concept)
        .map((variant) => normalizeConceptForComparison(variant))
        .filter(Boolean);
}
function hasUsefulConceptAnnotation(concept) {
    return /[([{][^\])}]*([\u3400-\u9fff]|\balias\b|\bsource\b|\bcharacter\b|\btitle\b)[^\])}]*[\])}]/i.test(concept || "");
}
function chooseMergedConcept(existingConcept, newConcept, existingQuality, newQuality) {
    const existingNorm = normalizeConceptForComparison(existingConcept || "");
    const newNorm = normalizeConceptForComparison(newConcept || "");
    if (existingNorm && existingNorm === newNorm) {
        if (hasUsefulConceptAnnotation(existingConcept)) {
            return existingConcept;
        }
        if (hasUsefulConceptAnnotation(newConcept)) {
            return newConcept;
        }
    }
    return newQuality > existingQuality ? newConcept : existingConcept;
}
function mergeUniqueVariations(existingVariations = [], newVariations = []) {
    return [...existingVariations, ...newVariations].filter((variation, index, arr) => arr.findIndex((candidate) => candidate.phrase === variation.phrase && candidate.chapter === variation.chapter) ===
        index);
}
function mergeUniqueSuggestions(existingSuggestions = [], newSuggestions = []) {
    return [...existingSuggestions, ...newSuggestions].filter((suggestion, index, arr) => arr.findIndex((candidate) => candidate.suggestion === suggestion.suggestion) === index);
}
function areNormalizedConceptsSimilar(norm1, norm2) {
    if (!norm1 || !norm2) {
        return false;
    }
    if (norm1 === norm2) {
        return true;
    }
    if (norm1.length <= 3 || norm2.length <= 3) {
        return false;
    }
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
        return true;
    }
    const words1 = norm1.split(/\s+/).filter(Boolean);
    const words2 = norm2.split(/\s+/).filter(Boolean);
    if (!words1.length || !words2.length) {
        return false;
    }
    const commonWords = words1.filter((word) => words2.includes(word));
    const overlapRatio = commonWords.length / Math.max(words1.length, words2.length);
    return overlapRatio >= 0.8 && commonWords.length > 0;
}
function isVariantProperNameLike(variant) {
    const tokens = variant.match(/[A-Za-z][A-Za-z0-9'-]*/g) || [];
    if (tokens.length === 0) {
        return false;
    }
    const connectorWords = new Set([
        "a",
        "an",
        "and",
        "at",
        "by",
        "de",
        "for",
        "from",
        "in",
        "la",
        "of",
        "on",
        "the",
        "to",
    ]);
    const meaningfulTokens = tokens.filter((token) => !connectorWords.has(token.toLowerCase()));
    if (meaningfulTokens.length === 0) {
        return false;
    }
    const capitalizedTokens = meaningfulTokens.filter((token) => /^[A-Z][a-zA-Z0-9'-]*$/.test(token));
    if (meaningfulTokens.length === 1) {
        return capitalizedTokens.length === 1 && meaningfulTokens[0].toUpperCase() !== meaningfulTokens[0];
    }
    return capitalizedTokens.length >= 2 && capitalizedTokens.length / meaningfulTokens.length >= 0.6;
}
function isProperNameLike(concept) {
    return splitConceptVariants(concept).some((variant) => isVariantProperNameLike(variant));
}
/**
 * More conservative semantic similarity with script & contextual safeguards.
 */
function areSemanticallySimilar(concept1, concept2, options = {}) {
    const shouldLog = !options?.silent;
    if (!concept1 || !concept2) {
        return false;
    }
    const c1 = concept1.toString();
    const c2 = concept2.toString();
    const comparable1 = getComparableConceptText(c1);
    const comparable2 = getComparableConceptText(c2);
    const script1 = detectScriptCategory(comparable1);
    const script2 = detectScriptCategory(comparable2);
    // Hard rule: do not treat clearly different scripts as similar.
    if (script1 !== "unknown" && script2 !== "unknown" && script1 !== script2) {
        if (shouldLog) {
            log(`Semantic similarity blocked by script mismatch: "${c1}" [${script1}] vs "${c2}" [${script2}]`);
        }
        return false;
    }
    const norm1 = normalizeConceptForComparison(c1);
    const norm2 = normalizeConceptForComparison(c2);
    // If both normalizations are empty (e.g., pure CJK) and scripts are same non-latin,
    // fall back to strict exact match only.
    if (!norm1 && !norm2) {
        const exact = c1.trim() === c2.trim();
        if (!exact && shouldLog) {
            log(`Semantic similarity rejected for non-Latin pair (no normalized content): "${c1}" vs "${c2}"`);
        }
        return exact;
    }
    // Block merging clearly unrelated when one looks like a proper name and the other does not.
    // Composite concepts like "A / B" are evaluated per variant so proper-name alternates stay mergeable.
    const proper1 = isProperNameLike(comparable1);
    const proper2 = isProperNameLike(comparable2);
    if (proper1 !== proper2) {
        if (shouldLog) {
            log(`Semantic similarity rejected due to proper-name mismatch: "${c1}" (proper=${proper1}) vs "${c2}" (proper=${proper2})`);
        }
        return false;
    }
    const normalizedVariants1 = getNormalizedConceptVariants(c1);
    const normalizedVariants2 = getNormalizedConceptVariants(c2);
    for (const variant1 of normalizedVariants1) {
        for (const variant2 of normalizedVariants2) {
            if (areNormalizedConceptsSimilar(variant1, variant2)) {
                return true;
            }
        }
    }
    if (shouldLog) {
        log(`Semantic similarity not strong enough: "${c1}" [${script1}] vs "${c2}" [${script2}] (norm1="${norm1}", norm2="${norm2}")`);
    }
    return false;
}
/**
 * Merge analysis results with strict semantic & script-aware safeguards.
 */
function mergeAnalysisResults(existingResults, newResults) {
    const merged = [...existingResults];
    newResults.forEach((newResult) => {
        if (!newResult || typeof newResult !== "object") {
            return;
        }
        const newConcept = newResult.concept || "";
        const newScript = detectScriptCategory(newConcept);
        // Find potential semantic duplicates (script-aware via areSemanticallySimilar)
        const duplicateIndex = merged.findIndex((existing) => {
            if (!existing || !existing.concept) {
                return false;
            }
            return areSemanticallySimilar(existing.concept, newConcept, { silent: true });
        });
        if (duplicateIndex === -1) {
            // No duplicate found, add as new entry
            merged.push(newResult);
            return;
        }
        // Found potential duplicate, perform stricter merge validation
        const existing = merged[duplicateIndex];
        const existingConcept = existing.concept || "";
        const existingScript = detectScriptCategory(existingConcept);
        const existingQuality = calculateResultQuality(existing);
        const newQuality = calculateResultQuality(newResult);
        // Ensure scripts are compatible before merging (defensive double-check)
        if (existingScript !== "unknown" && newScript !== "unknown" && existingScript !== newScript) {
            log(`Merge prevented: script mismatch between "${existingConcept}" [${existingScript}] and "${newConcept}" [${newScript}].`);
            // Treat as distinct concepts despite prior similarity signal.
            merged.push(newResult);
            return;
        }
        // Extra safeguard: prevent merging clearly different-language or mixed-script terms.
        if ((existingScript === "mixed" && newScript !== "mixed") ||
            (newScript === "mixed" && existingScript !== "mixed")) {
            log(`Merge prevented: mixed/ambiguous script conflict between "${existingConcept}" [${existingScript}] and "${newConcept}" [${newScript}].`);
            merged.push(newResult);
            return;
        }
        log(`Semantic duplicate candidate: "${existingConcept}" vs "${newConcept}". Quality scores: ${existingQuality} vs ${newQuality}`);
        // Require at least one side to be reasonably strong to allow merge.
        const MIN_QUALITY_FOR_MERGE = 40;
        if (existingQuality < MIN_QUALITY_FOR_MERGE && newQuality < MIN_QUALITY_FOR_MERGE) {
            log(`Merge prevented: both candidates have low quality (${existingQuality}, ${newQuality}). Keeping as separate concepts.`);
            merged.push(newResult);
            return;
        }
        if (newQuality > existingQuality) {
            merged[duplicateIndex] = {
                ...newResult,
                concept: chooseMergedConcept(existing.concept, newResult.concept, existingQuality, newQuality),
                variations: mergeUniqueVariations(existing.variations || [], newResult.variations || []),
                suggestions: mergeUniqueSuggestions(existing.suggestions || [], newResult.suggestions || []),
                isNew: Boolean(existing.isNew && newResult.isNew),
            };
            log("Merged duplicate results by favoring higher quality new result while preserving useful concept annotations.");
        }
        else {
            // Existing result has equal or higher quality, merge intelligently INTO existing.
            const mergedResult = {
                ...existing,
                concept: chooseMergedConcept(existing.concept, newResult.concept, existingQuality, newQuality),
                priority: existing.priority,
                explanation: existing.explanation,
                variations: mergeUniqueVariations(existing.variations || [], newResult.variations || []),
                suggestions: mergeUniqueSuggestions(existing.suggestions || [], newResult.suggestions || []),
                // Preserve status flags from higher quality result
                status: existing.status || newResult.status,
                isNew: Boolean(existing.isNew && newResult.isNew),
            };
            merged[duplicateIndex] = mergedResult;
            log("Merged duplicate results, preserving higher or equal quality concept and safely aggregating variations/suggestions.");
        }
    });
    return merged;
}
function extractJsonFromString(text) {
    // First, try to find a JSON markdown block
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        log("Extracted JSON from markdown block.");
        return markdownMatch[1];
    }
    // Fallback: find the first '{' or '[' and the last '}' or ']'
    const firstBrace = text.indexOf("{");
    const firstBracket = text.indexOf("[");
    let startIndex = -1;
    if (firstBrace === -1) {
        startIndex = firstBracket;
    }
    else if (firstBracket === -1) {
        startIndex = firstBrace;
    }
    else {
        startIndex = Math.min(firstBrace, firstBracket);
    }
    if (startIndex !== -1) {
        const lastBrace = text.lastIndexOf("}");
        const lastBracket = text.lastIndexOf("]");
        const endIndex = Math.max(lastBrace, lastBracket);
        if (endIndex > startIndex) {
            log("Extracted JSON using fallback brace/bracket matching.");
            return text.substring(startIndex, endIndex + 1);
        }
    }
    log("No JSON structure found, returning raw text.");
    return text;
}
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function escapeHtml(unsafe) {
    if (typeof unsafe !== "string") {
        return "";
    }
    return unsafe.replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, '"').replace(/'/g, "&#039;");
}
/**
 * Detect whether the external "WTR Lab Term Replacer" userscript is loaded.
 *
 * This function is designed to be:
 * - Defensive: never throws, always falls back to `false` on errors.
 * - Heuristic-based: checks multiple non-breaking indicators.
 * - Side-effect free: does not modify any external state.
 */
let _wtrReplacerDetectionCache = {
    lastResult: false,
    lastCheck: 0,
};
function normalizeLiveTermReplacerTerms(terms) {
    if (!Array.isArray(terms)) {
        return [];
    }
    return terms
        .filter((term) => term &&
        typeof term === "object" &&
        typeof term.original === "string" &&
        Object.prototype.hasOwnProperty.call(term, "replacement"))
        .map((term) => ({
        ...term,
        wholeWord: term.wholeWord ?? false,
    }));
}
/**
 * Detect whether the external "WTR Lab Term Replacer" userscript is loaded.
 *
 * Detection heuristics (any passing => detected):
 * - Presence of a well-known global integration marker
 * - Presence of the injected settings button used by the replacer UI
 *
 * Behavior:
 * - Defensive: exceptions are caught and logged; returns false on error.
 * - Cached: repeated calls within a short window reuse the last result to avoid DOM thrash.
 * - Side-effect free: does not modify external script state.
 */
function isWTRLabTermReplacerLoaded() {
    try {
        const now = Date.now();
        const CACHE_WINDOW_MS = 3000;
        if (now - _wtrReplacerDetectionCache.lastCheck < CACHE_WINDOW_MS) {
            return _wtrReplacerDetectionCache.lastResult;
        }
        const globalMarker = window.WTR_LAB_TERM_REPLACER;
        const marker = document.querySelector(".replacer-settings-btn.term-edit-btn.menu-button.small.btn.btn-outline-dark.btn-sm");
        const detected = Boolean(globalMarker?.ready || marker);
        _wtrReplacerDetectionCache = {
            lastResult: detected,
            lastCheck: now,
        };
        if (detected) {
            log("WTR Lab Term Replacer detection: positive via global marker or settings button marker.");
        }
        return detected;
    }
    catch (error) {
        log("WTR Lab Term Replacer detection error; defaulting to safe mode (not loaded).", error);
        _wtrReplacerDetectionCache = {
            lastResult: false,
            lastCheck: Date.now(),
        };
        return false;
    }
}
/**
 * Request the live term list for the current novel from the external WTR Lab Term Replacer userscript.
 *
 * Returns:
 * - `Array` of normalized term objects on success (including empty array if no terms exist)
 * - `null` if the bridge is unavailable, times out, or responds with an error
 */
function requestTermsFromWTRLabTermReplacer(novelSlug, options = {}) {
    if (!novelSlug || !isWTRLabTermReplacerLoaded()) {
        return Promise.resolve(null);
    }
    const timeoutMs = Math.max(250, Number(options.timeoutMs) || 1500);
    const requestId = `wtr-if-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return new Promise((resolve) => {
        let isSettled = false;
        let timeoutId = null;
        const cleanup = () => {
            window.removeEventListener("wtr:termsResponse", handleResponse);
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
            }
        };
        const finish = (value) => {
            if (isSettled) {
                return;
            }
            isSettled = true;
            cleanup();
            resolve(value);
        };
        const handleResponse = (event) => {
            const detail = event?.detail || {};
            if (detail.requestId !== requestId) {
                return;
            }
            if (detail.success === false) {
                log("WTR Lab Term Replacer live term request failed.", detail.error || "Unknown bridge error");
                finish(null);
                return;
            }
            finish(normalizeLiveTermReplacerTerms(detail.terms));
        };
        window.addEventListener("wtr:termsResponse", handleResponse);
        timeoutId = window.setTimeout(() => {
            log(`Timed out after ${timeoutMs}ms while requesting live terms from WTR Lab Term Replacer.`);
            finish(null);
        }, timeoutMs);
        try {
            window.dispatchEvent(new CustomEvent("wtr:requestTerms", {
                detail: {
                    requestId,
                    novelSlug,
                },
            }));
        }
        catch (error) {
            log("Failed to dispatch live term request to WTR Lab Term Replacer.", error);
            finish(null);
        }
    });
}


/***/ },

/***/ 41
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CO: () => (/* binding */ formatOfficialGlossaryPromptContext),
/* harmony export */   OO: () => (/* binding */ buildWtrApiChapterRange),
/* harmony export */   Yj: () => (/* binding */ getWtrPageContext),
/* harmony export */   sp: () => (/* binding */ fetchOfficialWtrGlossaryContext),
/* harmony export */   t0: () => (/* binding */ getOfficialAliasOnlyMatch),
/* harmony export */   vm: () => (/* binding */ fetchWtrChapter)
/* harmony export */ });
/* unused harmony exports resolveWtrGlossaryPlaceholders, isOfficialAliasOnlyFinding */
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(158);

const WTR_API_GLOSSARY_CACHE_KEY = "wtr_inconsistency_finder_wtr_glossary_cache";
const GLOSSARY_CACHE_TTL_MS = 6 * 60 * 60 * 1000;
const MAX_ALIAS_GROUPS_FOR_PROMPT = 20;
const MAX_CANONICAL_TERMS_FOR_PROMPT = 40;
const MAX_REPLACEMENTS_FOR_PROMPT = 25;
const MAX_CORRECTIONS_FOR_PROMPT = 15;
const MAX_CORRECTION_REASON_CHARS = 160;
function parseNonNegativeInteger(value, fallback) {
    const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : fallback;
}
function parseOptionalInteger(value) {
    const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
    return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;
}
function wtrApiRequest(config) {
    return new Promise((resolve, reject) => {
        GM_xmlhttpRequest({
            method: config.method,
            url: config.url,
            headers: {
                Accept: "application/json",
                ...(config.data ? { "Content-Type": "application/json" } : {}),
            },
            data: config.data,
            onload: (response) => {
                try {
                    const data = JSON.parse(response.responseText || "{}");
                    if (response.status >= 400 || data?.success === false) {
                        reject(new Error(data?.message || data?.error || response.statusText || `HTTP ${response.status}`));
                        return;
                    }
                    resolve(data);
                }
                catch (error) {
                    reject(error);
                }
            },
            onerror: () => reject(new Error("WTR Lab API network request failed.")),
        });
    });
}
function getWtrPageContext() {
    const match = window.location.pathname.match(/^\/(en)\/novel\/(\d+)\/([^/]+)\/chapter-(\d+)/);
    if (!match) {
        return null;
    }
    return {
        language: match[1],
        rawId: Number.parseInt(match[2], 10),
        serieSlug: match[3],
        chapterNo: Number.parseInt(match[4], 10),
    };
}
function buildWtrApiChapterRange(pageContext, config) {
    const mode = config.wtrApiRangeMode === "custom" ? "custom" : "nearby";
    let startChapter;
    let endChapter;
    if (mode === "custom") {
        startChapter = parseOptionalInteger(config.wtrApiStartChapter) || pageContext.chapterNo;
        endChapter = parseOptionalInteger(config.wtrApiEndChapter) || startChapter;
        if (endChapter < startChapter) {
            const previousStart = startChapter;
            startChapter = endChapter;
            endChapter = previousStart;
        }
    }
    else {
        const previousCount = Math.min(25, parseNonNegativeInteger(config.wtrApiPreviousChapters, 2));
        const nextCount = Math.min(25, parseNonNegativeInteger(config.wtrApiNextChapters, 2));
        startChapter = Math.max(1, pageContext.chapterNo - previousCount);
        endChapter = pageContext.chapterNo + nextCount;
    }
    const chapters = [];
    for (let chapterNo = startChapter; chapterNo <= endChapter; chapterNo++) {
        chapters.push(chapterNo);
    }
    return chapters;
}
function normalizeChapterGlossaryTerm(rawTerm, index) {
    if (!Array.isArray(rawTerm) || rawTerm.length < 2) {
        return null;
    }
    const termValue = Array.isArray(rawTerm[0]) ? rawTerm[0][0] : rawTerm[0];
    const sourceValue = rawTerm[1];
    const term = typeof termValue === "string" ? termValue.trim() : "";
    const source = typeof sourceValue === "string" ? sourceValue.trim() : "";
    if (!term) {
        return null;
    }
    return { index, term, source };
}
function resolveWtrGlossaryPlaceholders(text, glossaryTerms) {
    if (!text || glossaryTerms.length === 0) {
        return text || "";
    }
    const termsByIndex = new Map(glossaryTerms.map((term) => [term.index, term.term]));
    return text.replace(/※(\d+)[⛬〓]/g, (match, indexValue) => {
        const index = Number.parseInt(indexValue, 10);
        return termsByIndex.get(index) || match;
    });
}
async function fetchWtrChapter(pageContext, chapterNo) {
    const response = await wtrApiRequest({
        method: "POST",
        url: `${window.location.origin}/api/reader/get`,
        data: JSON.stringify({
            translate: "ai",
            language: pageContext.language,
            raw_id: pageContext.rawId,
            chapter_no: chapterNo,
            retry: false,
            force_retry: false,
        }),
    });
    const chapter = response?.chapter || {};
    const payload = response?.data?.data || {};
    const rawBody = Array.isArray(payload.body) ? payload.body.join("\n\n") : "";
    const rawTitle = payload.title || chapter.title || "";
    const placeholderCount = ((`${rawTitle}\n${rawBody}`).match(/※\d+[⛬〓]/g) || []).length;
    const glossaryTerms = Array.isArray(payload.glossary_data?.terms)
        ? payload.glossary_data.terms
            .map((term, index) => normalizeChapterGlossaryTerm(term, index))
            .filter(Boolean)
        : [];
    const resolvedTitle = resolveWtrGlossaryPlaceholders(rawTitle, glossaryTerms);
    const resolvedBody = resolveWtrGlossaryPlaceholders(rawBody, glossaryTerms);
    const titlePrefix = resolvedTitle ? `Title: ${resolvedTitle}\n\n` : "";
    if (!resolvedBody.trim()) {
        throw new Error(`Chapter ${chapterNo} returned no readable body text.`);
    }
    return {
        chapter: String(chapter.order || chapterNo),
        text: `${titlePrefix}${resolvedBody}`,
        title: resolvedTitle,
        chapterId: typeof chapter.id === "number" ? chapter.id : undefined,
        charCount: typeof chapter.char_count === "number" ? chapter.char_count : resolvedBody.length,
        placeholderCount,
        source: "wtr-api",
        glossaryTerms,
    };
}
function getTermAliases(rawTerm) {
    if (!Array.isArray(rawTerm) || rawTerm.length === 0) {
        return [];
    }
    const rawAliases = Array.isArray(rawTerm[0]) ? rawTerm[0] : [rawTerm[0]];
    return rawAliases.filter((alias) => typeof alias === "string").map((alias) => alias.trim()).filter(Boolean);
}
function getTermSource(rawTerm) {
    return Array.isArray(rawTerm) && typeof rawTerm[1] === "string" ? rawTerm[1].trim() : "";
}
function getTermCount(rawTerm) {
    if (!Array.isArray(rawTerm)) {
        return 0;
    }
    return rawTerm.slice(2).reduce((highest, value) => {
        if (typeof value === "number" && Number.isFinite(value)) {
            return Math.max(highest, value);
        }
        return highest;
    }, 0);
}
function createOfficialTermGroup(rawTerm) {
    const aliases = getTermAliases(rawTerm);
    if (aliases.length === 0) {
        return null;
    }
    return {
        canonical: aliases[0],
        aliases: [...new Set(aliases)],
        source: getTermSource(rawTerm),
        count: getTermCount(rawTerm),
    };
}
function compareOfficialGroups(a, b) {
    if (b.count !== a.count) {
        return b.count - a.count;
    }
    return b.aliases.length - a.aliases.length;
}
function dedupeOfficialGroups(groups) {
    const seen = new Set();
    return groups.filter((group) => {
        const key = `${group.source}|${group.aliases.join("|")}`.toLowerCase();
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
function buildOfficialGlossaryContext(rawId, response) {
    const glossaries = Array.isArray(response?.glossaries) ? response.glossaries : [];
    const allTerms = [];
    const allReplacements = [];
    const allCorrections = [];
    let updatedAt = "";
    glossaries.forEach((glossary) => {
        if (typeof glossary?.updated_at === "string" && glossary.updated_at > updatedAt) {
            updatedAt = glossary.updated_at;
        }
        const data = glossary?.data || {};
        if (Array.isArray(data.terms)) {
            data.terms.forEach((term) => {
                const group = createOfficialTermGroup(term);
                if (group) {
                    allTerms.push(group);
                }
            });
        }
        if (Array.isArray(data.replacements)) {
            data.replacements.forEach((term) => {
                const group = createOfficialTermGroup(term);
                if (group) {
                    allReplacements.push(group);
                }
            });
        }
        if (Array.isArray(data.ai_run?.incorrect)) {
            data.ai_run.incorrect.forEach((item) => {
                if (!item || typeof item !== "object") {
                    return;
                }
                const source = typeof item.zh === "string" ? item.zh.trim() : "";
                const corrected = typeof item.corrected_en === "string" ? item.corrected_en.trim() : "";
                if (!source || !corrected) {
                    return;
                }
                allCorrections.push({
                    source,
                    corrected,
                    reason: typeof item.reason === "string" ? item.reason : "",
                    type: typeof item.corrected_type === "string" ? item.corrected_type : undefined,
                });
            });
        }
    });
    const canonicalTerms = dedupeOfficialGroups(allTerms).sort(compareOfficialGroups);
    const aliasGroups = canonicalTerms.filter((group) => group.aliases.length > 1);
    const replacements = dedupeOfficialGroups(allReplacements).sort(compareOfficialGroups);
    return {
        rawId,
        updatedAt,
        aliasGroups,
        canonicalTerms,
        replacements,
        corrections: allCorrections,
        summary: {
            glossaryCount: glossaries.length,
            termCount: allTerms.length,
            replacementCount: allReplacements.length,
            correctionCount: allCorrections.length,
        },
    };
}
async function getGlossaryCache() {
    const cache = await GM_getValue(WTR_API_GLOSSARY_CACHE_KEY, {});
    return cache && typeof cache === "object" ? cache : {};
}
async function fetchOfficialWtrGlossaryContext(rawId) {
    const cache = await getGlossaryCache();
    const cacheKey = String(rawId);
    const cached = cache[cacheKey];
    const now = Date.now();
    if (cached?.timestamp && cached?.context && now - cached.timestamp < GLOSSARY_CACHE_TTL_MS) {
        (0,_utils__WEBPACK_IMPORTED_MODULE_0__/* .log */ .Rm)(`Using cached WTR official glossary for raw_id ${rawId}.`, cached.context.summary);
        return cached.context;
    }
    try {
        const response = await wtrApiRequest({
            method: "GET",
            url: `${window.location.origin}/api/v2/reader/terms/${rawId}.json`,
        });
        const context = buildOfficialGlossaryContext(rawId, response);
        cache[cacheKey] = {
            timestamp: now,
            context,
        };
        await GM_setValue(WTR_API_GLOSSARY_CACHE_KEY, cache);
        (0,_utils__WEBPACK_IMPORTED_MODULE_0__/* .log */ .Rm)(`Fetched WTR official glossary for raw_id ${rawId}.`, context.summary);
        return context;
    }
    catch (error) {
        if (cached?.context) {
            (0,_utils__WEBPACK_IMPORTED_MODULE_0__/* .log */ .Rm)(`Failed to refresh WTR official glossary for raw_id ${rawId}; using stale cache.`, error);
            return cached.context;
        }
        (0,_utils__WEBPACK_IMPORTED_MODULE_0__/* .log */ .Rm)(`Failed to fetch WTR official glossary for raw_id ${rawId}.`, error);
        return null;
    }
}
function escapeRegExpForSearch(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function containsCjk(value) {
    return /[\u3400-\u9fff]/.test(value);
}
function phraseAppearsInText(phrase, sourceText) {
    const normalizedPhrase = phrase.trim();
    if (normalizedPhrase.length < 3 || !sourceText) {
        return false;
    }
    if (containsCjk(normalizedPhrase)) {
        return sourceText.includes(normalizedPhrase);
    }
    const escapedPhrase = escapeRegExpForSearch(normalizedPhrase);
    return new RegExp(`(^|[^A-Za-z0-9])${escapedPhrase}([^A-Za-z0-9]|$)`, "i").test(sourceText);
}
function normalizeIndexTerm(value) {
    return typeof value === "string" ? value.trim().toLowerCase() : "";
}
function buildChapterGlossaryIndex(chapterData = []) {
    const sourceTerms = new Set();
    const englishTerms = new Set();
    chapterData.forEach((chapter) => {
        if (!Array.isArray(chapter.glossaryTerms)) {
            return;
        }
        chapter.glossaryTerms.forEach((term) => {
            const source = normalizeIndexTerm(term.source);
            const english = normalizeIndexTerm(term.term);
            if (source) {
                sourceTerms.add(source);
            }
            if (english) {
                englishTerms.add(english);
            }
        });
    });
    return { sourceTerms, englishTerms };
}
function calculateGroupRelevance(group, sourceText, chapterIndex) {
    const normalizedSource = normalizeIndexTerm(group.source);
    const normalizedAliases = group.aliases.map(normalizeIndexTerm).filter(Boolean);
    let score = 0;
    if (normalizedSource && chapterIndex.sourceTerms.has(normalizedSource)) {
        score += 1_000_000;
    }
    if (normalizedAliases.some((alias) => chapterIndex.englishTerms.has(alias))) {
        score += 500_000;
    }
    if (group.source && phraseAppearsInText(group.source, sourceText)) {
        score += 100_000;
    }
    if (group.aliases.some((alias) => phraseAppearsInText(alias, sourceText))) {
        score += 50_000;
    }
    return score > 0 ? score + Math.min(group.count || 0, 10_000) : 0;
}
function getRelevantGroups(groups, sourceText, chapterIndex) {
    return groups
        .map((group) => ({
        group,
        relevance: calculateGroupRelevance(group, sourceText, chapterIndex),
    }))
        .filter((item) => item.relevance > 0)
        .sort((a, b) => b.relevance - a.relevance || compareOfficialGroups(a.group, b.group))
        .map((item) => item.group);
}
function formatAliasGroupForPrompt(group) {
    return [group.canonical, group.aliases.filter((alias) => alias !== group.canonical), group.source, group.count];
}
function formatCanonicalTermForPrompt(group) {
    return [group.canonical, group.source, group.count];
}
function formatCorrectionForPrompt(correction) {
    const reason = correction.reason.length > MAX_CORRECTION_REASON_CHARS
        ? `${correction.reason.slice(0, MAX_CORRECTION_REASON_CHARS)}…`
        : correction.reason;
    return [correction.source, correction.corrected, correction.type || "", reason];
}
function correctionIsRelevant(correction, sourceText, chapterIndex) {
    const normalizedSource = normalizeIndexTerm(correction.source);
    const normalizedCorrected = normalizeIndexTerm(correction.corrected);
    return Boolean((normalizedSource && chapterIndex.sourceTerms.has(normalizedSource)) ||
        (normalizedCorrected && chapterIndex.englishTerms.has(normalizedCorrected)) ||
        phraseAppearsInText(correction.source, sourceText) ||
        phraseAppearsInText(correction.corrected, sourceText));
}
function formatOfficialGlossaryPromptContext(context, sourceText = "", chapterData = []) {
    if (!context) {
        return "";
    }
    const chapterIndex = buildChapterGlossaryIndex(chapterData);
    const relevantAliasGroups = getRelevantGroups(context.aliasGroups, sourceText, chapterIndex);
    const relevantCanonicalTerms = getRelevantGroups(context.canonicalTerms, sourceText, chapterIndex);
    const relevantReplacements = getRelevantGroups(context.replacements, sourceText, chapterIndex);
    const relevantCorrections = context.corrections.filter((correction) => correctionIsRelevant(correction, sourceText, chapterIndex));
    if (relevantAliasGroups.length === 0 &&
        relevantCanonicalTerms.length === 0 &&
        relevantReplacements.length === 0 &&
        relevantCorrections.length === 0) {
        return "";
    }
    const included = {
        aliases: Math.min(relevantAliasGroups.length, MAX_ALIAS_GROUPS_FOR_PROMPT),
        terms: Math.min(relevantCanonicalTerms.length, MAX_CANONICAL_TERMS_FOR_PROMPT),
        replacements: Math.min(relevantReplacements.length, MAX_REPLACEMENTS_FOR_PROMPT),
        corrections: Math.min(relevantCorrections.length, MAX_CORRECTIONS_FOR_PROMPT),
    };
    const payload = {
        total: context.summary,
        included,
        aliases: relevantAliasGroups.slice(0, MAX_ALIAS_GROUPS_FOR_PROMPT).map(formatAliasGroupForPrompt),
        terms: relevantCanonicalTerms.slice(0, MAX_CANONICAL_TERMS_FOR_PROMPT).map(formatCanonicalTermForPrompt),
        replacements: relevantReplacements.slice(0, MAX_REPLACEMENTS_FOR_PROMPT).map(formatAliasGroupForPrompt),
        corrections: relevantCorrections.slice(0, MAX_CORRECTIONS_FOR_PROMPT).map(formatCorrectionForPrompt),
    };
    const serialized = JSON.stringify(payload);
    (0,_utils__WEBPACK_IMPORTED_MODULE_0__/* .log */ .Rm)("Prepared WTR official glossary prompt context.", {
        included,
        relevantBeforeCaps: {
            aliases: relevantAliasGroups.length,
            terms: relevantCanonicalTerms.length,
            replacements: relevantReplacements.length,
            corrections: relevantCorrections.length,
        },
        contextLength: serialized.length,
        sourceTextLength: sourceText.length,
        chapterGlossaryTermCount: chapterIndex.sourceTerms.size,
    });
    return serialized;
}
function getOfficialAliasOnlyMatch(result, context) {
    if (!result || !context || !Array.isArray(result.variations) || result.variations.length < 2) {
        return null;
    }
    const phrases = [
        ...new Set(result.variations
            .map((variation) => (typeof variation?.phrase === "string" ? variation.phrase.trim().toLowerCase() : ""))
            .filter((phrase) => Boolean(phrase))),
    ];
    if (phrases.length < 2) {
        return null;
    }
    const matchingGroup = context.aliasGroups.find((group) => {
        const aliasSet = new Set(group.aliases.map((alias) => alias.trim().toLowerCase()).filter(Boolean));
        return phrases.every((phrase) => aliasSet.has(phrase));
    });
    return matchingGroup ? { group: matchingGroup, phrases } : null;
}
function isOfficialAliasOnlyFinding(result, context) {
    return Boolean(getOfficialAliasOnlyMatch(result, context));
}


/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
var injectStylesIntoStyleTag = __webpack_require__(72);
var injectStylesIntoStyleTag_default = /*#__PURE__*/__webpack_require__.n(injectStylesIntoStyleTag);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleDomAPI.js
var styleDomAPI = __webpack_require__(825);
var styleDomAPI_default = /*#__PURE__*/__webpack_require__.n(styleDomAPI);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertBySelector.js
var insertBySelector = __webpack_require__(659);
var insertBySelector_default = /*#__PURE__*/__webpack_require__.n(insertBySelector);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js
var setAttributesWithoutAttributes = __webpack_require__(56);
var setAttributesWithoutAttributes_default = /*#__PURE__*/__webpack_require__.n(setAttributesWithoutAttributes);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertStyleElement.js
var insertStyleElement = __webpack_require__(540);
var insertStyleElement_default = /*#__PURE__*/__webpack_require__.n(insertStyleElement);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleTagTransform.js
var styleTagTransform = __webpack_require__(113);
var styleTagTransform_default = /*#__PURE__*/__webpack_require__.n(styleTagTransform);
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./src/styles/main.css
var main = __webpack_require__(249);
;// ./src/styles/main.css

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (styleTagTransform_default());
options.setAttributes = (setAttributesWithoutAttributes_default());
options.insert = insertBySelector_default().bind(null, "head");
options.domAPI = (styleDomAPI_default());
options.insertStyleElement = (insertStyleElement_default());

var update = injectStylesIntoStyleTag_default()(main/* default */.A, options);




       /* harmony default export */ const styles_main = (main/* default */.A && main/* default */.A.locals ? main/* default */.A.locals : undefined);

// EXTERNAL MODULE: ./src/modules/state.ts
var state = __webpack_require__(654);
// EXTERNAL MODULE: ./src/modules/ui/index.ts
var ui = __webpack_require__(782);
// EXTERNAL MODULE: ./src/modules/utils.ts
var utils = __webpack_require__(158);
;// ./src/index.ts
// src/index.ts
// Import styles - Webpack will handle injection

// Import version information (fallback for build time)
// import { VERSION } from "./version";
// Import core modules



// --- INITIALIZATION ---
async function src_main() {
    try {
        await (0,state/* loadConfig */.Z9)();
        (0,utils/* log */.Rm)("Configuration loaded.");
        (0,ui/* createUI */.RD)();
        (0,ui/* injectControlButton */.rz)();
        (0,ui/* initializeCollisionAvoidance */.bp)();
        GM_registerMenuCommand("Term Inconsistency Finder", () => (0,ui/* togglePanel */.Pj)(true));
        (0,utils/* log */.Rm)("WTR Term Inconsistency Finder initialized successfully.");
    }
    catch (error) {
        console.error("Failed to initialize WTR Term Inconsistency Finder:", error);
    }
}
// Run the script
src_main();

/******/ })()
;