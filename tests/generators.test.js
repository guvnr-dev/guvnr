/**
 * Generator Base Utilities Tests for Guvnr
 *
 * Tests the generator utilities from src/generators/base.js including:
 * - Project context parsing
 * - Section extraction
 * - Tech stack parsing
 * - Security checklist extraction
 * - Caching mechanisms
 *
 * Run with: node --test tests/generators.test.js
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';

import {
  parseProjectContext,
  extractSections,
  extractTechStack,
  extractSecurityChecklist,
  getProjectName,
  formatTechStack,
  clearParseCache,
  getCacheStats
} from '../src/generators/base.js';

// ============================================
// EXTRACT SECTIONS TESTS
// ============================================

describe('extractSections', () => {
  it('should extract level-2 headings', () => {
    const content = `# Title

## Section One
Content for section one.

## Section Two
Content for section two.
Multi-line content.

## Section Three
Final section.
`;
    const sections = extractSections(content);

    assert.ok(sections['Section One']);
    assert.ok(sections['Section Two']);
    assert.ok(sections['Section Three']);
  });

  it('should capture content between headings', () => {
    const content = `## Overview
This is the overview content.
It spans multiple lines.

## Tech Stack
- Node.js
- TypeScript
`;
    const sections = extractSections(content);

    assert.ok(sections.Overview.includes('overview content'));
    assert.ok(sections.Overview.includes('multiple lines'));
    assert.ok(sections['Tech Stack'].includes('Node.js'));
    assert.ok(sections['Tech Stack'].includes('TypeScript'));
  });

  it('should handle empty content', () => {
    const sections = extractSections('');
    assert.deepStrictEqual(sections, {});
  });

  it('should handle content with no sections', () => {
    const sections = extractSections('Just some plain text without any headings.');
    assert.deepStrictEqual(sections, {});
  });

  it('should ignore level-1 and level-3+ headings', () => {
    const content = `# Main Title

## Valid Section
Some content.

### Subsection
This is a subsection.

#### Deep nesting
Very deep.
`;
    const sections = extractSections(content);

    assert.ok(sections['Valid Section']);
    assert.ok(!sections['Main Title']);
    assert.ok(!sections.Subsection);
    assert.ok(!sections['Deep nesting']);
    // Subsection content should be part of Valid Section
    assert.ok(sections['Valid Section'].includes('Subsection'));
  });

  it('should trim section content', () => {
    const content = `## Section

   Content with extra whitespace.

`;
    const sections = extractSections(content);

    assert.strictEqual(sections.Section, 'Content with extra whitespace.');
  });
});

// ============================================
// EXTRACT TECH STACK TESTS
// ============================================

describe('extractTechStack', () => {
  it('should extract tech stack items from list', () => {
    const content = `- **Primary**: Node.js
- **Framework**: Express
- Testing: Jest
`;
    const stack = extractTechStack(content);

    assert.ok(Array.isArray(stack));
    assert.ok(stack.some(s => s.category === 'Primary' && s.value === 'Node.js'));
    assert.ok(stack.some(s => s.category === 'Framework' && s.value === 'Express'));
    assert.ok(stack.some(s => s.category === 'Testing' && s.value === 'Jest'));
  });

  it('should handle bold and non-bold categories', () => {
    const content = `- **Bold Category**: Value 1
- Regular Category: Value 2
`;
    const stack = extractTechStack(content);

    assert.strictEqual(stack.length, 2);
    assert.ok(stack.some(s => s.category === 'Bold Category'));
    assert.ok(stack.some(s => s.category === 'Regular Category'));
  });

  it('should return empty array for invalid format', () => {
    const content = `Just some text
without any proper list items.
`;
    const stack = extractTechStack(content);

    assert.deepStrictEqual(stack, []);
  });

  it('should handle empty content', () => {
    const stack = extractTechStack('');
    assert.deepStrictEqual(stack, []);
  });

  it('should trim category and value', () => {
    const content = `-   Category  :   Value with spaces   `;
    const stack = extractTechStack(content);

    if (stack.length > 0) {
      assert.ok(!stack[0].category.startsWith(' '));
      assert.ok(!stack[0].value.endsWith(' '));
    }
  });
});

// ============================================
// EXTRACT SECURITY CHECKLIST TESTS
// ============================================

describe('extractSecurityChecklist', () => {
  it('should extract security checklist items', () => {
    const content = `# CLAUDE.md

## Overview
Some overview.

### Security Checklist

- [ ] No hardcoded secrets
- [ ] Input validation present
- [x] Dependencies verified
- [ ] Error handling secure
`;
    const items = extractSecurityChecklist(content);

    assert.ok(Array.isArray(items));
    assert.ok(items.includes('No hardcoded secrets'));
    assert.ok(items.includes('Input validation present'));
    assert.ok(items.includes('Dependencies verified'));
    assert.ok(items.includes('Error handling secure'));
  });

  it('should return empty array when no checklist', () => {
    const content = `# CLAUDE.md

## Overview
No security checklist here.
`;
    const items = extractSecurityChecklist(content);

    assert.deepStrictEqual(items, []);
  });

  it('should handle checked and unchecked items', () => {
    const content = `### Security Checklist
- [x] Checked item
- [ ] Unchecked item
- [X] Also checked
`;
    const items = extractSecurityChecklist(content);

    assert.ok(items.length >= 2);
  });
});

// ============================================
// PARSE PROJECT CONTEXT TESTS
// ============================================

describe('parseProjectContext', () => {
  beforeEach(() => {
    clearParseCache();
  });

  it('should parse complete CLAUDE.md', () => {
    const content = `# Project: My App

## Overview
A sample application for testing.

## Tech Stack
- **Language**: TypeScript
- **Runtime**: Node.js

## Architecture
Modular architecture.

## Current State
In development.

## Session Instructions
Follow best practices.
`;
    const context = parseProjectContext(content);

    assert.strictEqual(context.projectName, 'My App');
    assert.ok(context.overview.includes('sample application'));
    assert.ok(context.techStack.length > 0);
    assert.ok(context.architecture.includes('Modular'));
    assert.ok(context.currentState.includes('development'));
    assert.ok(context.sessionInstructions.includes('best practices'));
    assert.strictEqual(context.raw, content);
  });

  it('should extract project name from title', () => {
    const content = `# Project: Test App

## Overview
`;
    const context = parseProjectContext(content);
    assert.strictEqual(context.projectName, 'Test App');
  });

  it('should handle missing sections gracefully', () => {
    const content = `# Project

## Overview
Just overview.
`;
    const context = parseProjectContext(content);

    assert.strictEqual(context.overview, 'Just overview.');
    assert.strictEqual(context.architecture, '');
    assert.strictEqual(context.conventions, '');
    assert.deepStrictEqual(context.techStack, []);
  });

  it('should use cache on repeated calls', () => {
    const content = `# Project

## Overview
Cached content.
`;
    // First call
    const context1 = parseProjectContext(content);

    // Second call - should return cached result
    const context2 = parseProjectContext(content);

    assert.deepStrictEqual(context1, context2);

    // Check cache has an entry
    const stats = getCacheStats();
    assert.ok(stats.size > 0);
  });

  it('should skip cache when requested', () => {
    const content = `# Project

## Overview
Fresh parse.
`;
    // Parse with caching
    parseProjectContext(content);
    const statsAfterFirst = getCacheStats();

    // Parse with skipCache - should not increase cache size
    parseProjectContext(content, true);
    const statsAfterSkip = getCacheStats();

    // Cache size should remain the same since we skipped
    assert.strictEqual(statsAfterFirst.size, statsAfterSkip.size);
  });
});

// ============================================
// GET PROJECT NAME TESTS
// ============================================

describe('getProjectName', () => {
  it('should return projectName from context', () => {
    const context = { projectName: 'My Project' };
    assert.strictEqual(getProjectName(context), 'My Project');
  });

  it('should return directory name when context is null', () => {
    const name = getProjectName(null);
    assert.ok(name); // Should return something (current directory name)
    assert.strictEqual(typeof name, 'string');
  });

  it('should return directory name when projectName is empty', () => {
    const name = getProjectName({ projectName: '' });
    assert.ok(name);
    assert.strictEqual(typeof name, 'string');
  });
});

// ============================================
// FORMAT TECH STACK TESTS
// ============================================

describe('formatTechStack', () => {
  it('should format tech stack as comma-separated string', () => {
    const context = {
      techStack: [
        { category: 'Language', value: 'TypeScript' },
        { category: 'Runtime', value: 'Node.js' }
      ]
    };
    const formatted = formatTechStack(context);

    assert.strictEqual(formatted, 'Language: TypeScript, Runtime: Node.js');
  });

  it('should return "Not specified" when context is null', () => {
    assert.strictEqual(formatTechStack(null), 'Not specified');
  });

  it('should return "Not specified" when techStack is empty', () => {
    assert.strictEqual(formatTechStack({ techStack: [] }), 'Not specified');
  });

  it('should return "Not specified" when techStack is undefined', () => {
    assert.strictEqual(formatTechStack({}), 'Not specified');
  });
});

// ============================================
// CACHE MANAGEMENT TESTS
// ============================================

describe('Cache Management', () => {
  beforeEach(() => {
    clearParseCache();
  });

  it('clearParseCache should empty the cache', () => {
    // Add something to cache
    parseProjectContext('# Test\n\n## Overview\nContent');

    const beforeClear = getCacheStats();
    assert.ok(beforeClear.size > 0);

    clearParseCache();

    const afterClear = getCacheStats();
    assert.strictEqual(afterClear.size, 0);
  });

  it('getCacheStats should return cache information', () => {
    const stats = getCacheStats();

    assert.ok('size' in stats);
    assert.ok('maxSize' in stats);
    assert.ok('ttlMs' in stats);
    assert.strictEqual(typeof stats.size, 'number');
    assert.strictEqual(typeof stats.maxSize, 'number');
    assert.strictEqual(typeof stats.ttlMs, 'number');
  });

  it('cache should handle different content correctly', () => {
    const content1 = '# Project 1\n\n## Overview\nFirst';
    const content2 = '# Project 2\n\n## Overview\nSecond';

    parseProjectContext(content1);
    parseProjectContext(content2);

    const stats = getCacheStats();
    assert.strictEqual(stats.size, 2);
  });

  it('cache should return same result for same content', () => {
    const content = '# Project\n\n## Overview\nSame content';

    const result1 = parseProjectContext(content);
    const result2 = parseProjectContext(content);

    assert.strictEqual(result1.projectName, result2.projectName);
    assert.strictEqual(result1.overview, result2.overview);
  });
});

// ============================================
// EDGE CASES
// ============================================

describe('Edge Cases', () => {
  beforeEach(() => {
    clearParseCache();
  });

  it('should handle content with special characters', () => {
    const content = `# Project: Test™ App®

## Overview
Special chars: ñ, é, 中文, 日本語, emoji 🚀

## Tech Stack
- Framework: Vue.js 3.x
`;
    const context = parseProjectContext(content);

    assert.ok(context.projectName.includes('Test'));
    assert.ok(context.overview.includes('🚀'));
  });

  it('should handle content with code blocks', () => {
    const content = `# Project

## Overview
Has code:

\`\`\`javascript
const x = 1;
\`\`\`

## Tech Stack
- Language: JavaScript
`;
    const context = parseProjectContext(content);

    assert.ok(context.overview.includes('const x = 1'));
  });

  it('should handle content with tables', () => {
    const content = `# Project

## Overview
Has a table:

| Header | Value |
|--------|-------|
| Row 1  | Data  |
`;
    const context = parseProjectContext(content);

    assert.ok(context.overview.includes('Header'));
    assert.ok(context.overview.includes('Row 1'));
  });

  it('should handle very long content', () => {
    const longOverview = 'A'.repeat(10000);
    const content = `# Large Project

## Overview
${longOverview}

## Tech Stack
- Size: Large
`;
    const context = parseProjectContext(content);

    assert.ok(context.overview.length >= 10000);
  });

  it('should handle content with only title', () => {
    const context = parseProjectContext('# Just a Title');

    assert.strictEqual(context.projectName, 'Just a Title');
    assert.strictEqual(context.overview, '');
  });

  it('should handle empty content', () => {
    const context = parseProjectContext('');

    assert.strictEqual(context.projectName, '');
    assert.strictEqual(context.overview, '');
    assert.deepStrictEqual(context.techStack, []);
  });
});
