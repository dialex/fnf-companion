#!/usr/bin/env node

/**
 * Script to validate test descriptions follow .cursorrules
 * Checks for forbidden words: "call", function names, method names
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FORBIDDEN_PATTERNS = [
  /\bshould call\b/i,
  /\bcall\s+(on|handle|set|get)[A-Z]/i,
  /\bon[A-Z]\w+/,
  /\bhandle[A-Z]\w+/,
  /\bset[A-Z]\w+/,
  /\bget[A-Z]\w+/,
];

const FORBIDDEN_WORDS = ['call', 'should call'];

function findTestFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findTestFiles(filePath, fileList);
    } else if (/\.test\.(js|jsx|ts|tsx)$/.test(file)) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const issues = [];

  lines.forEach((line, index) => {
    // Check for test descriptions (it('...', ...))
    const itMatch = line.match(/it\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (itMatch) {
      const description = itMatch[1];

      FORBIDDEN_PATTERNS.forEach((pattern) => {
        if (pattern.test(description)) {
          issues.push({
            file: filePath,
            line: index + 1,
            description,
            issue: `Contains forbidden pattern: ${pattern}`,
          });
        }
      });

      FORBIDDEN_WORDS.forEach((word) => {
        if (description.toLowerCase().includes(word)) {
          issues.push({
            file: filePath,
            line: index + 1,
            description,
            issue: `Contains forbidden word: "${word}"`,
          });
        }
      });
    }
  });

  return issues;
}

function main() {
  const testDir = path.join(__dirname, '../src/__tests__');
  const testFiles = findTestFiles(testDir);
  const allIssues = [];

  testFiles.forEach((file) => {
    const issues = checkFile(file);
    allIssues.push(...issues);
  });

  if (allIssues.length > 0) {
    console.error('\n❌ Test description violations found:\n');
    allIssues.forEach((issue) => {
      console.error(
        `  ${issue.file}:${issue.line}\n    "${issue.description}"\n    → ${issue.issue}\n`
      );
    });
    console.error(
      '\nTest descriptions must describe user-visible behavior, not implementation details.\n' +
        'See .cursorrules for guidelines.\n'
    );
    process.exit(1);
  } else {
    console.log('✅ All test descriptions follow .cursorrules');
    process.exit(0);
  }
}

main();
