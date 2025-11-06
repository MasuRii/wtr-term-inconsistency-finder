// src/version.js
// Centralized version configuration for the WTR Lab Term Inconsistency Finder
// This is the SINGLE SOURCE OF TRUTH for all version information

export const VERSION = '5.3.1';
export const VERSION_INFO = {
  major: 5,
  minor: 3,
  patch: 1,
  build: null, // Set to number for build versions, null for release
  channel: 'stable' // 'stable', 'dev', 'performance', 'greasyfork'
};

// Webpack build variants
export const BUILD_VARIANTS = {
  standard: {
    version: VERSION,
    suffix: '',
    description: 'Standard build for Tampermonkey'
  },
  development: {
    version: `${VERSION}-build.[buildNo]`,
    suffix: '-build',
    description: 'Development build with hot reload'
  },
  greasyfork: {
    version: `${VERSION}-greasyfork`,
    suffix: '-greasyfork',
    description: 'GreasyFork compliant build'
  },
  performance: {
    version: `${VERSION}-perf`,
    suffix: '-perf',
    description: 'Performance optimized build'
  }
};

// For runtime version display
export const DISPLAY_VERSION = `v${VERSION}`;