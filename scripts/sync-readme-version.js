#!/usr/bin/env node

/**
 * README Version Synchronization Script
 * 
 * This script automatically updates the version reference in README.md
 * based on the VERSION constant from src/version.js
 * 
 * Usage: node scripts/sync-readme-version.js
 */

const fs = require('fs');
const path = require('path');

// File paths
const VERSION_FILE_PATH = path.join(__dirname, '..', 'src', 'version.js');
const README_FILE_PATH = path.join(__dirname, '..', 'README.md');

/**
 * Read and parse the version from src/version.js
 */
function readVersionFromFile() {
  try {
    const versionFileContent = fs.readFileSync(VERSION_FILE_PATH, 'utf8');
    
    // Extract VERSION constant using regex
    const versionMatch = versionFileContent.match(/export const VERSION = ["']([^"']+)["']/);
    if (!versionMatch) {
      throw new Error('Could not find VERSION constant in src/version.js');
    }
    
    const version = versionMatch[1];
    console.log(`✓ Found version in src/version.js: ${version}`);
    return version;
  } catch (error) {
    console.error(`✗ Error reading version file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Update version references in README.md
 */
function updateReadmeVersion(version) {
  try {
    const readmeContent = fs.readFileSync(README_FILE_PATH, 'utf8');
    
    // Pattern to match version badges in README
    // Matches: [![Version](https://img.shields.io/badge/version-5.3.3-blue.svg)]
    const versionBadgePattern = /(!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-)[^)]+(\.svg\))/g;
    
    const newVersionBadge = `![Version](https://img.shields.io/badge/version-${version}-blue.svg)`;
    const newBadgeUrl = `https://img.shields.io/badge/version-${version}-blue.svg)`;
    
    // Check if version already matches
    const currentVersionMatch = readmeContent.match(/!\[Version\]\(https:\/\/img\.shields\.io\/badge\/version-([^)]+)\.svg\)/);
    if (currentVersionMatch && currentVersionMatch[1] === version) {
      console.log(`✓ README.md version already up to date: ${version}`);
      return false; // No changes made
    }
    
    // Replace the version badge
    const updatedContent = readmeContent.replace(
      versionBadgePattern, 
      `$1${version}$2`
    );
    
    // Verify the replacement was successful
    if (updatedContent === readmeContent) {
      console.log('✗ Version badge pattern not found in README.md');
      return false;
    }
    
    // Write updated content
    fs.writeFileSync(README_FILE_PATH, updatedContent, 'utf8');
    console.log(`✓ Updated README.md version reference to: ${version}`);
    return true; // Changes made
    
  } catch (error) {
    console.error(`✗ Error updating README.md: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Starting README version synchronization...');
  console.log('');
  
  const version = readVersionFromFile();
  const wasUpdated = updateReadmeVersion(version);
  
  console.log('');
  if (wasUpdated) {
    console.log('✅ README.md version synchronized successfully!');
  } else {
    console.log('✅ README.md version is already up to date!');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  readVersionFromFile,
  updateReadmeVersion
};