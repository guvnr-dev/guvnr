/**
 * Tests for the generate command
 */

import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { mkdtempSync, rmSync, writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Test directory setup
let testDir;

beforeEach(() => {
  testDir = mkdtempSync(join(tmpdir(), 'aix-generate-test-'));
});

afterEach(() => {
  if (testDir && existsSync(testDir)) {
    rmSync(testDir, { recursive: true, force: true });
  }
});

describe('generate command', () => {
  test('SUPPORTED_TOOLS includes all major AI tools', async () => {
    const { SUPPORTED_TOOLS } = await import('../src/commands/generate.js');

    assert.ok(SUPPORTED_TOOLS.includes('agents'), 'Should support AGENTS.md');
    assert.ok(SUPPORTED_TOOLS.includes('cursor'), 'Should support Cursor');
    assert.ok(SUPPORTED_TOOLS.includes('copilot'), 'Should support Copilot');
    assert.ok(SUPPORTED_TOOLS.includes('windsurf'), 'Should support Windsurf');
    assert.ok(SUPPORTED_TOOLS.includes('aider'), 'Should support Aider');
    assert.ok(SUPPORTED_TOOLS.includes('claude'), 'Should support Claude');
    assert.ok(SUPPORTED_TOOLS.includes('all'), 'Should support all');
  });

  test('generates AGENTS.md with required sections', async () => {
    // Create a CLAUDE.md as source
    const claudeMd = `# Project: Test Project

## Overview

A test project for validation.

## Tech Stack

- **Language**: JavaScript
- **Runtime**: Node.js 20

## Architecture

Standard structure.

## Conventions

Follow best practices.

## Common Commands

\`\`\`bash
npm test
\`\`\`
`;

    writeFileSync(join(testDir, 'CLAUDE.md'), claudeMd);

    // Import and run generate
    const { generateCommand } = await import('../src/commands/generate.js');

    const originalCwd = process.cwd();
    const originalExit = process.exit;
    const originalLog = console.log;

    try {
      process.chdir(testDir);
      process.exit = () => {};
      console.log = () => {};

      await generateCommand({ tools: 'agents', force: true });

      const agentsPath = join(testDir, 'AGENTS.md');
      assert.ok(existsSync(agentsPath), 'AGENTS.md should be created');

      const content = readFileSync(agentsPath, 'utf-8');

      // Check required sections per AGENTS.md spec
      assert.ok(content.includes('## Build & Test'), 'Should have Build & Test section');
      assert.ok(content.includes('## Architecture'), 'Should have Architecture section');
      assert.ok(content.includes('## Security'), 'Should have Security section');
      assert.ok(content.includes('## Git Workflow'), 'Should have Git Workflow section');
      assert.ok(content.includes('## Boundaries'), 'Should have Boundaries section');
      assert.ok(content.includes('## Verification Commands'), 'Should have Verification section');
    } finally {
      process.chdir(originalCwd);
      process.exit = originalExit;
      console.log = originalLog;
    }
  });

  test('generates Cursor rules in .mdc format', async () => {
    writeFileSync(
      join(testDir, 'CLAUDE.md'),
      '# Project\n\n## Overview\n\nTest\n\n## Tech Stack\n\n- JS'
    );

    const { generateCommand } = await import('../src/commands/generate.js');

    const originalCwd = process.cwd();
    const originalExit = process.exit;
    const originalLog = console.log;

    try {
      process.chdir(testDir);
      process.exit = () => {};
      console.log = () => {};

      await generateCommand({ tools: 'cursor', force: true });

      // Check .cursor directory created
      const cursorDir = join(testDir, '.cursor');
      assert.ok(existsSync(cursorDir), '.cursor/ should be created');

      // Check index.mdc
      const indexPath = join(cursorDir, 'index.mdc');
      assert.ok(existsSync(indexPath), 'index.mdc should be created');

      const indexContent = readFileSync(indexPath, 'utf-8');
      assert.ok(indexContent.startsWith('---'), 'Should have YAML frontmatter');
      assert.ok(indexContent.includes('alwaysApply: true'), 'Should have alwaysApply');

      // Check rules directory
      const rulesDir = join(cursorDir, 'rules');
      assert.ok(existsSync(rulesDir), '.cursor/rules/ should be created');

      // Check security rules
      const securityPath = join(rulesDir, 'security.mdc');
      assert.ok(existsSync(securityPath), 'security.mdc should be created');

      const securityContent = readFileSync(securityPath, 'utf-8');
      assert.ok(securityContent.includes('OWASP'), 'Should reference OWASP');
    } finally {
      process.chdir(originalCwd);
      process.exit = originalExit;
      console.log = originalLog;
    }
  });

  test('generates GitHub Copilot instructions', async () => {
    writeFileSync(
      join(testDir, 'CLAUDE.md'),
      '# Project\n\n## Overview\n\nTest\n\n## Tech Stack\n\n- TS'
    );

    const { generateCommand } = await import('../src/commands/generate.js');

    const originalCwd = process.cwd();
    const originalExit = process.exit;
    const originalLog = console.log;

    try {
      process.chdir(testDir);
      process.exit = () => {};
      console.log = () => {};

      await generateCommand({ tools: 'copilot', force: true });

      const copilotPath = join(testDir, '.github', 'copilot-instructions.md');
      assert.ok(existsSync(copilotPath), 'copilot-instructions.md should be created');

      const content = readFileSync(copilotPath, 'utf-8');
      assert.ok(content.includes('Security'), 'Should have security section');
      assert.ok(content.includes('conventional commit'), 'Should have commit guidance');
    } finally {
      process.chdir(originalCwd);
      process.exit = originalExit;
      console.log = originalLog;
    }
  });

  test('generates Windsurf rules within char limit', async () => {
    writeFileSync(
      join(testDir, 'CLAUDE.md'),
      '# Project\n\n## Overview\n\nTest\n\n## Tech Stack\n\n- Go'
    );

    const { generateCommand } = await import('../src/commands/generate.js');

    const originalCwd = process.cwd();
    const originalExit = process.exit;
    const originalLog = console.log;

    try {
      process.chdir(testDir);
      process.exit = () => {};
      console.log = () => {};

      await generateCommand({ tools: 'windsurf', force: true });

      const windsurfDir = join(testDir, '.windsurf', 'rules');
      assert.ok(existsSync(windsurfDir), '.windsurf/rules/ should be created');

      // Check char limit (6000 per file)
      const projectPath = join(windsurfDir, 'project.md');
      const content = readFileSync(projectPath, 'utf-8');
      assert.ok(content.length <= 6000, `Should be under 6000 chars (got ${content.length})`);
    } finally {
      process.chdir(originalCwd);
      process.exit = originalExit;
      console.log = originalLog;
    }
  });

  test('generates Aider configuration', async () => {
    writeFileSync(
      join(testDir, 'CLAUDE.md'),
      '# Project\n\n## Overview\n\nTest\n\n## Tech Stack\n\n- Python'
    );

    const { generateCommand } = await import('../src/commands/generate.js');

    const originalCwd = process.cwd();
    const originalExit = process.exit;
    const originalLog = console.log;

    try {
      process.chdir(testDir);
      process.exit = () => {};
      console.log = () => {};

      await generateCommand({ tools: 'aider', force: true });

      const aiderPath = join(testDir, '.aider.conf.yml');
      assert.ok(existsSync(aiderPath), '.aider.conf.yml should be created');

      const content = readFileSync(aiderPath, 'utf-8');
      assert.ok(content.includes('auto-commits'), 'Should have auto-commits');
      assert.ok(content.includes('auto-lint'), 'Should have auto-lint');
      assert.ok(content.includes('auto-test'), 'Should have auto-test');
      assert.ok(content.includes('read-only'), 'Should have read-only patterns');
    } finally {
      process.chdir(originalCwd);
      process.exit = originalExit;
      console.log = originalLog;
    }
  });

  test('dry-run mode does not create files', async () => {
    writeFileSync(
      join(testDir, 'CLAUDE.md'),
      '# Project\n\n## Overview\n\nTest\n\n## Tech Stack\n\n- Rust'
    );

    const { generateCommand } = await import('../src/commands/generate.js');

    const originalCwd = process.cwd();
    const originalExit = process.exit;
    const originalLog = console.log;

    try {
      process.chdir(testDir);
      process.exit = () => {};
      console.log = () => {};

      await generateCommand({ tools: 'all', dryRun: true, force: true });

      // Nothing should be created
      assert.ok(
        !existsSync(join(testDir, 'AGENTS.md')),
        'AGENTS.md should not be created in dry-run'
      );
      assert.ok(!existsSync(join(testDir, '.cursor')), '.cursor/ should not be created in dry-run');
      assert.ok(
        !existsSync(join(testDir, '.github', 'copilot-instructions.md')),
        'copilot-instructions.md should not be created in dry-run'
      );
    } finally {
      process.chdir(originalCwd);
      process.exit = originalExit;
      console.log = originalLog;
    }
  });

  test('respects existing files without --force', async () => {
    writeFileSync(
      join(testDir, 'CLAUDE.md'),
      '# Project\n\n## Overview\n\nTest\n\n## Tech Stack\n\n- C'
    );
    writeFileSync(join(testDir, 'AGENTS.md'), '# Existing Content');

    const { generateCommand } = await import('../src/commands/generate.js');

    const originalCwd = process.cwd();
    const originalExit = process.exit;
    const originalLog = console.log;

    try {
      process.chdir(testDir);
      process.exit = () => {};
      console.log = () => {};

      await generateCommand({ tools: 'agents', force: false });

      // Original content should be preserved
      const content = readFileSync(join(testDir, 'AGENTS.md'), 'utf-8');
      assert.strictEqual(content, '# Existing Content', 'Existing content should be preserved');
    } finally {
      process.chdir(originalCwd);
      process.exit = originalExit;
      console.log = originalLog;
    }
  });
});

describe('project context parsing', () => {
  test('extracts tech stack from CLAUDE.md', async () => {
    const claudeMd = `# Project: Test

## Overview

A test project.

## Tech Stack

- **Language**: TypeScript 5.3
- **Runtime**: Node.js 20
- **Framework**: Express 4.x
- **Database**: PostgreSQL 15
`;

    writeFileSync(join(testDir, 'CLAUDE.md'), claudeMd);

    const { generateCommand } = await import('../src/commands/generate.js');

    const originalCwd = process.cwd();
    const originalExit = process.exit;
    const originalLog = console.log;

    try {
      process.chdir(testDir);
      process.exit = () => {};
      console.log = () => {};

      await generateCommand({ tools: 'agents', force: true });

      const content = readFileSync(join(testDir, 'AGENTS.md'), 'utf-8');

      assert.ok(content.includes('TypeScript'), 'Should include TypeScript');
      assert.ok(content.includes('Node.js'), 'Should include Node.js');
    } finally {
      process.chdir(originalCwd);
      process.exit = originalExit;
      console.log = originalLog;
    }
  });

  test('extracts security checklist from CLAUDE.md', async () => {
    const claudeMd = `# Project: Test

## Overview

Test.

## Tech Stack

- JS

## Session Instructions

### Security Checklist
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] XSS protection
`;

    writeFileSync(join(testDir, 'CLAUDE.md'), claudeMd);

    const { generateCommand } = await import('../src/commands/generate.js');

    const originalCwd = process.cwd();
    const originalExit = process.exit;
    const originalLog = console.log;

    try {
      process.chdir(testDir);
      process.exit = () => {};
      console.log = () => {};

      await generateCommand({ tools: 'agents', force: true });

      const content = readFileSync(join(testDir, 'AGENTS.md'), 'utf-8');

      assert.ok(
        content.includes('hardcoded secrets') || content.includes('credentials'),
        'Should include security guidance'
      );
    } finally {
      process.chdir(originalCwd);
      process.exit = originalExit;
      console.log = originalLog;
    }
  });
});
