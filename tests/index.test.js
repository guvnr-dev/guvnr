/**
 * Core Index Module Tests for AI Excellence Framework
 *
 * Tests the main src/index.js exports including:
 * - Configuration utilities (getPresetConfig, mergeConfig)
 * - Installation checks (checkInstallation, listInstalledCommands, listInstalledAgents)
 * - CLAUDE.md parsing (parseClaudeMd, validateClaudeMdStructure, readClaudeMdAsync)
 * - Abort signal utilities (checkAbortSignal, withAbortSignal)
 * - Package paths (getPackageRoot, getPresetPath)
 *
 * Run with: node --test tests/index.test.js
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  VERSION,
  PRESETS,
  COMMANDS,
  AGENTS,
  DEFAULT_CONFIG,
  PRESET_CONFIGS,
  getPresetConfig,
  mergeConfig,
  checkInstallation,
  listInstalledCommands,
  listInstalledAgents,
  parseClaudeMd,
  validateClaudeMdStructure,
  readClaudeMdAsync,
  getPackageRoot,
  getPresetPath,
  checkAbortSignal,
  withAbortSignal,
  getAllSecretPatterns
} from '../src/index.js';

// ============================================
// HELPER FUNCTIONS
// ============================================

function createTempDir() {
  const tempDir = join(
    tmpdir(),
    `ai-excellence-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
  mkdirSync(tempDir, { recursive: true });
  return tempDir;
}

function cleanupTempDir(dir) {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ============================================
// CONSTANTS TESTS
// ============================================

describe('Module Constants', () => {
  it('VERSION should be a valid semver string', () => {
    assert.ok(VERSION, 'VERSION should be defined');
    assert.match(VERSION, /^\d+\.\d+\.\d+/, 'VERSION should match semver pattern');
  });

  it('PRESETS should contain all expected presets', () => {
    assert.ok(Array.isArray(PRESETS), 'PRESETS should be an array');
    assert.ok(PRESETS.includes('minimal'), 'Should include minimal');
    assert.ok(PRESETS.includes('standard'), 'Should include standard');
    assert.ok(PRESETS.includes('full'), 'Should include full');
    assert.ok(PRESETS.includes('team'), 'Should include team');
  });

  it('COMMANDS should contain all expected commands', () => {
    assert.ok(Array.isArray(COMMANDS), 'COMMANDS should be an array');
    assert.ok(COMMANDS.includes('plan'), 'Should include plan');
    assert.ok(COMMANDS.includes('verify'), 'Should include verify');
    assert.ok(COMMANDS.includes('handoff'), 'Should include handoff');
    assert.ok(COMMANDS.includes('security-review'), 'Should include security-review');
  });

  it('AGENTS should contain all expected agents', () => {
    assert.ok(Array.isArray(AGENTS), 'AGENTS should be an array');
    assert.ok(AGENTS.includes('explorer'), 'Should include explorer');
    assert.ok(AGENTS.includes('reviewer'), 'Should include reviewer');
    assert.ok(AGENTS.includes('tester'), 'Should include tester');
  });

  it('DEFAULT_CONFIG should have required fields', () => {
    assert.ok(DEFAULT_CONFIG.version, 'Should have version');
    assert.ok(DEFAULT_CONFIG.preset, 'Should have preset');
    assert.ok(Array.isArray(DEFAULT_CONFIG.commands), 'Should have commands array');
    assert.ok(Array.isArray(DEFAULT_CONFIG.agents), 'Should have agents array');
    assert.strictEqual(typeof DEFAULT_CONFIG.hooks, 'boolean', 'hooks should be boolean');
    assert.strictEqual(typeof DEFAULT_CONFIG.mcp, 'boolean', 'mcp should be boolean');
  });

  it('PRESET_CONFIGS should have all preset definitions', () => {
    for (const preset of PRESETS) {
      assert.ok(PRESET_CONFIGS[preset], `Should have config for ${preset}`);
      assert.ok(PRESET_CONFIGS[preset].description, `${preset} should have description`);
    }
  });
});

// ============================================
// CONFIGURATION UTILITIES TESTS
// ============================================

describe('getPresetConfig', () => {
  it('should return config for valid preset', () => {
    const config = getPresetConfig('minimal');
    assert.ok(config, 'Should return a config');
    assert.strictEqual(config.description, 'CLAUDE.md + essential commands only');
  });

  it('should return standard config for unknown preset', () => {
    const config = getPresetConfig('nonexistent');
    assert.deepStrictEqual(config, PRESET_CONFIGS.standard);
  });

  it('should return full config with MCP enabled', () => {
    const config = getPresetConfig('full');
    assert.strictEqual(config.mcp, true, 'Full preset should have MCP enabled');
    assert.ok(config.metrics, 'Full preset should have metrics');
  });

  it('should return team config with federation', () => {
    const config = getPresetConfig('team');
    assert.strictEqual(config.federation, true, 'Team preset should have federation');
    assert.ok(config.mcpConfig, 'Team preset should have mcpConfig');
  });
});

describe('mergeConfig', () => {
  it('should return DEFAULT_CONFIG when no user config provided', () => {
    const merged = mergeConfig();
    assert.strictEqual(merged.preset, DEFAULT_CONFIG.preset);
    assert.strictEqual(merged.version, DEFAULT_CONFIG.version);
  });

  it('should merge user config with preset base', () => {
    const merged = mergeConfig({ preset: 'full' });
    assert.strictEqual(merged.mcp, true, 'Should inherit mcp from full preset');
  });

  it('should override nested values correctly', () => {
    const merged = mergeConfig({
      preset: 'full',
      metrics: { autoCollect: false }
    });
    assert.strictEqual(merged.metrics.enabled, true, 'Should keep enabled from preset');
    assert.strictEqual(merged.metrics.autoCollect, false, 'Should override autoCollect');
  });

  it('should handle arrays by replacing not merging', () => {
    const merged = mergeConfig({
      commands: ['plan']
    });
    assert.deepStrictEqual(merged.commands, ['plan'], 'Should replace array entirely');
  });
});

// ============================================
// INSTALLATION CHECKS TESTS
// ============================================

describe('checkInstallation', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it('should detect no installation when empty', () => {
    const status = checkInstallation(tempDir);
    assert.strictEqual(status.installed, false);
    assert.strictEqual(status.preset, null);
    assert.strictEqual(status.checks.claudeMd, false);
  });

  it('should detect minimal installation', () => {
    // Create minimal setup
    writeFileSync(join(tempDir, 'CLAUDE.md'), '# Test');
    mkdirSync(join(tempDir, '.claude', 'commands'), { recursive: true });

    const status = checkInstallation(tempDir);
    assert.strictEqual(status.installed, true);
    assert.strictEqual(status.preset, 'minimal');
    assert.strictEqual(status.checks.claudeMd, true);
    assert.strictEqual(status.checks.commandsDir, true);
  });

  it('should detect standard installation', () => {
    // Create standard setup
    writeFileSync(join(tempDir, 'CLAUDE.md'), '# Test');
    mkdirSync(join(tempDir, '.claude', 'commands'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'agents'), { recursive: true });
    writeFileSync(join(tempDir, '.pre-commit-config.yaml'), 'repos: []');

    const status = checkInstallation(tempDir);
    assert.strictEqual(status.installed, true);
    assert.strictEqual(status.preset, 'standard');
  });

  it('should detect full installation', () => {
    // Create full setup
    writeFileSync(join(tempDir, 'CLAUDE.md'), '# Test');
    mkdirSync(join(tempDir, '.claude', 'commands'), { recursive: true });
    mkdirSync(join(tempDir, '.claude', 'agents'), { recursive: true });
    mkdirSync(join(tempDir, 'scripts', 'mcp'), { recursive: true });
    writeFileSync(join(tempDir, 'scripts', 'mcp', 'project-memory-server.py'), '# MCP');

    const status = checkInstallation(tempDir);
    assert.strictEqual(status.installed, true);
    assert.strictEqual(status.preset, 'full');
    assert.strictEqual(status.checks.mcpServer, true);
  });
});

describe('listInstalledCommands', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it('should return empty array when no commands directory', () => {
    const commands = listInstalledCommands(tempDir);
    assert.deepStrictEqual(commands, []);
  });

  it('should list installed commands', () => {
    const commandsDir = join(tempDir, '.claude', 'commands');
    mkdirSync(commandsDir, { recursive: true });
    writeFileSync(join(commandsDir, 'plan.md'), '# Plan');
    writeFileSync(join(commandsDir, 'verify.md'), '# Verify');
    writeFileSync(join(commandsDir, 'not-a-command.txt'), 'text file');

    const commands = listInstalledCommands(tempDir);
    assert.ok(commands.includes('plan'), 'Should include plan');
    assert.ok(commands.includes('verify'), 'Should include verify');
    assert.ok(!commands.includes('not-a-command'), 'Should not include non-md files');
  });
});

describe('listInstalledAgents', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it('should return empty array when no agents directory', () => {
    const agents = listInstalledAgents(tempDir);
    assert.deepStrictEqual(agents, []);
  });

  it('should list installed agents', () => {
    const agentsDir = join(tempDir, '.claude', 'agents');
    mkdirSync(agentsDir, { recursive: true });
    writeFileSync(join(agentsDir, 'explorer.md'), '# Explorer');
    writeFileSync(join(agentsDir, 'reviewer.md'), '# Reviewer');

    const agents = listInstalledAgents(tempDir);
    assert.ok(agents.includes('explorer'), 'Should include explorer');
    assert.ok(agents.includes('reviewer'), 'Should include reviewer');
  });
});

// ============================================
// CLAUDE.MD PARSING TESTS
// ============================================

describe('parseClaudeMd', () => {
  it('should parse markdown with sections', () => {
    const content = `# Project

## Overview
This is the overview.

## Tech Stack
- Language: JavaScript

## Current State
Initial setup
`;
    const parsed = parseClaudeMd(content);

    assert.ok(parsed.raw, 'Should have raw content');
    assert.ok(parsed.sections, 'Should have sections object');
    assert.ok(parsed.sections.Overview.includes('This is the overview'), 'Should parse Overview');
    assert.ok(parsed.sections['Tech Stack'].includes('JavaScript'), 'Should parse Tech Stack');
    assert.ok(
      parsed.sections['Current State'].includes('Initial setup'),
      'Should parse Current State'
    );
  });

  it('should handle empty content', () => {
    const parsed = parseClaudeMd('');
    assert.strictEqual(parsed.raw, '');
    assert.deepStrictEqual(parsed.sections, {});
  });

  it('should handle content with no sections', () => {
    const parsed = parseClaudeMd('Just some text without any headings');
    assert.ok(parsed.raw.includes('Just some text'));
    assert.deepStrictEqual(parsed.sections, {});
  });
});

describe('validateClaudeMdStructure', () => {
  it('should pass valid CLAUDE.md', () => {
    const content = `# Project

## Overview
Description here.

## Tech Stack
- Node.js

## Current State
Active
`;
    const result = validateClaudeMdStructure(content);
    assert.strictEqual(result.valid, true);
    assert.deepStrictEqual(result.missingRequired, []);
  });

  it('should fail when missing required sections', () => {
    const content = `# Project

## Overview
Just overview
`;
    const result = validateClaudeMdStructure(content);
    assert.strictEqual(result.valid, false);
    assert.ok(result.missingRequired.includes('Tech Stack'), 'Should report missing Tech Stack');
    assert.ok(
      result.missingRequired.includes('Current State'),
      'Should report missing Current State'
    );
  });

  it('should report missing recommended sections', () => {
    const content = `# Project

## Overview
X

## Tech Stack
X

## Current State
X
`;
    const result = validateClaudeMdStructure(content);
    assert.strictEqual(result.valid, true, 'Should be valid even without recommended');
    assert.ok(
      result.missingRecommended.includes('Architecture'),
      'Should note missing Architecture'
    );
    assert.ok(result.missingRecommended.includes('Conventions'), 'Should note missing Conventions');
  });
});

describe('readClaudeMdAsync', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  it('should return null when CLAUDE.md does not exist', async () => {
    const result = await readClaudeMdAsync(tempDir);
    assert.strictEqual(result, null);
  });

  it('should read and parse existing CLAUDE.md', async () => {
    const content = `# Project

## Overview
Test project

## Tech Stack
- JS

## Current State
Done
`;
    writeFileSync(join(tempDir, 'CLAUDE.md'), content);

    const result = await readClaudeMdAsync(tempDir);
    assert.ok(result, 'Should return parsed content');
    assert.ok(result.sections.Overview.includes('Test project'));
  });
});

// ============================================
// ABORT SIGNAL UTILITIES TESTS
// ============================================

describe('checkAbortSignal', () => {
  it('should not throw when signal is undefined', () => {
    assert.doesNotThrow(() => checkAbortSignal(undefined));
  });

  it('should not throw when signal is not aborted', () => {
    const controller = new AbortController();
    assert.doesNotThrow(() => checkAbortSignal(controller.signal));
  });

  it('should throw when signal is aborted', () => {
    const controller = new AbortController();
    controller.abort(new Error('Test abort'));

    assert.throws(
      () => checkAbortSignal(controller.signal, 'Test operation'),
      err => {
        assert.strictEqual(err.name, 'AbortError');
        assert.ok(err.message.includes('Test operation'));
        return true;
      }
    );
  });
});

describe('withAbortSignal', () => {
  it('should resolve promise when no signal provided', async () => {
    const result = await withAbortSignal(Promise.resolve('success'), undefined);
    assert.strictEqual(result, 'success');
  });

  it('should resolve promise when signal not aborted', async () => {
    const controller = new AbortController();
    const result = await withAbortSignal(Promise.resolve('success'), controller.signal);
    assert.strictEqual(result, 'success');
  });

  it('should reject when signal already aborted', async () => {
    const controller = new AbortController();
    controller.abort(new Error('Already aborted'));

    await assert.rejects(
      withAbortSignal(Promise.resolve('success'), controller.signal, 'Test'),
      err => {
        assert.strictEqual(err.name, 'AbortError');
        return true;
      }
    );
  });

  it('should reject when signal aborted during operation', async () => {
    const controller = new AbortController();

    // Create a slow promise
    const slowPromise = new Promise(resolve => {
      setTimeout(() => resolve('success'), 1000);
    });

    // Abort after a short delay
    setTimeout(() => controller.abort(new Error('Aborted mid-operation')), 10);

    await assert.rejects(withAbortSignal(slowPromise, controller.signal, 'Slow op'), err => {
      assert.strictEqual(err.name, 'AbortError');
      return true;
    });
  });
});

// ============================================
// PACKAGE PATHS TESTS
// ============================================

describe('getPackageRoot', () => {
  it('should return a valid path', () => {
    const root = getPackageRoot();
    assert.ok(root, 'Should return a path');
    assert.ok(existsSync(root), 'Path should exist');
    assert.ok(existsSync(join(root, 'package.json')), 'Should contain package.json');
  });
});

describe('getPresetPath', () => {
  it('should return path for valid presets', () => {
    for (const preset of PRESETS) {
      const path = getPresetPath(preset);
      // Path may or may not exist depending on build state
      // but function should return a string
      assert.ok(
        typeof path === 'string' || path === null,
        `Should return string or null for ${preset}`
      );
    }
  });

  it('should return null for invalid preset', () => {
    const path = getPresetPath('nonexistent');
    assert.strictEqual(path, null);
  });
});

// ============================================
// SECRET PATTERNS UTILITY TESTS
// ============================================

describe('getAllSecretPatterns', () => {
  it('should return flat array of all patterns', () => {
    const patterns = getAllSecretPatterns();
    assert.ok(Array.isArray(patterns), 'Should return an array');
    assert.ok(patterns.length > 0, 'Should have patterns');

    // Each pattern should have name, pattern, and category
    for (const p of patterns) {
      assert.ok(p.name, 'Should have name');
      assert.ok(p.pattern instanceof RegExp, 'Should have RegExp pattern');
      assert.ok(p.category, 'Should have category');
    }
  });

  it('should include patterns from all categories', () => {
    const patterns = getAllSecretPatterns();
    const categories = new Set(patterns.map(p => p.category));

    assert.ok(categories.has('generic'), 'Should have generic category');
    assert.ok(categories.has('ai_ml'), 'Should have ai_ml category');
    assert.ok(categories.has('cloud'), 'Should have cloud category');
    assert.ok(categories.has('vcs'), 'Should have vcs category');
  });
});
