/**
 * Validation Utilities Tests for AI Excellence Framework
 *
 * Tests the input validation system from src/utils/validation.js including:
 * - Path validation and security
 * - Preset validation
 * - Project name validation
 * - Configuration validation
 * - String sanitization
 * - Secret detection
 *
 * Run with: node --test tests/validation.test.js
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { existsSync, mkdirSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  validatePath,
  validatePreset,
  validateProjectName,
  validateConfig,
  sanitizeString,
  looksLikeSecret
} from '../src/utils/validation.js';

// ============================================
// HELPER FUNCTIONS
// ============================================

function createTempDir() {
  const tempDir = join(
    tmpdir(),
    `ai-excellence-validation-test-${Date.now()}-${Math.random().toString(36).slice(2)}`
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
// VALIDATE PATH TESTS
// ============================================

describe('validatePath', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('Basic validation', () => {
    it('should reject empty path', () => {
      const result = validatePath('');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('non-empty string'));
    });

    it('should reject non-string path', () => {
      const result = validatePath(null);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('non-empty string'));
    });

    it('should reject undefined path', () => {
      const result = validatePath(undefined);
      assert.strictEqual(result.valid, false);
    });

    it('should accept valid path', () => {
      const result = validatePath(tempDir);
      assert.strictEqual(result.valid, true);
      assert.ok(result.path);
    });
  });

  describe('Security checks', () => {
    it('should reject path with null bytes', () => {
      const result = validatePath('/path/with\x00null');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('null bytes'));
    });

    it('should detect path traversal when basePath specified', () => {
      const result = validatePath('../../../etc/passwd', { basePath: tempDir });
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('traversal'));
    });

    it('should allow paths within basePath', () => {
      const subDir = join(tempDir, 'subdir');
      mkdirSync(subDir);

      const result = validatePath(subDir, { basePath: tempDir });
      assert.strictEqual(result.valid, true);
    });
  });

  describe('Existence checks', () => {
    it('should fail when mustExist=true and path does not exist', () => {
      const result = validatePath(join(tempDir, 'nonexistent'), { mustExist: true });
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('does not exist'));
    });

    it('should pass when mustExist=true and path exists', () => {
      const result = validatePath(tempDir, { mustExist: true });
      assert.strictEqual(result.valid, true);
    });
  });

  describe('Type checks', () => {
    it('should fail when mustBeDirectory=true and path is file', () => {
      const filePath = join(tempDir, 'test.txt');
      writeFileSync(filePath, 'content');

      const result = validatePath(filePath, { mustExist: true, mustBeDirectory: true });
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('must be a directory'));
    });

    it('should pass when mustBeDirectory=true and path is directory', () => {
      const result = validatePath(tempDir, { mustExist: true, mustBeDirectory: true });
      assert.strictEqual(result.valid, true);
    });

    it('should fail when mustBeFile=true and path is directory', () => {
      const result = validatePath(tempDir, { mustExist: true, mustBeFile: true });
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('must be a file'));
    });

    it('should pass when mustBeFile=true and path is file', () => {
      const filePath = join(tempDir, 'test.txt');
      writeFileSync(filePath, 'content');

      const result = validatePath(filePath, { mustExist: true, mustBeFile: true });
      assert.strictEqual(result.valid, true);
    });
  });
});

// ============================================
// VALIDATE PRESET TESTS
// ============================================

describe('validatePreset', () => {
  describe('Valid presets', () => {
    const validPresets = ['minimal', 'standard', 'full', 'team', 'custom'];

    for (const preset of validPresets) {
      it(`should accept "${preset}"`, () => {
        const result = validatePreset(preset);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.preset, preset);
      });
    }
  });

  describe('Case insensitivity', () => {
    it('should normalize uppercase to lowercase', () => {
      const result = validatePreset('MINIMAL');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.preset, 'minimal');
    });

    it('should normalize mixed case', () => {
      const result = validatePreset('StAnDaRd');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.preset, 'standard');
    });
  });

  describe('Invalid presets', () => {
    it('should reject empty string', () => {
      const result = validatePreset('');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('non-empty string'));
    });

    it('should reject unknown preset', () => {
      const result = validatePreset('enterprise');
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('Invalid preset'));
    });

    it('should reject non-string', () => {
      const result = validatePreset(123);
      assert.strictEqual(result.valid, false);
    });

    it('should reject null', () => {
      const result = validatePreset(null);
      assert.strictEqual(result.valid, false);
    });
  });

  describe('Whitespace handling', () => {
    it('should trim whitespace', () => {
      const result = validatePreset('  full  ');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.preset, 'full');
    });
  });
});

// ============================================
// VALIDATE PROJECT NAME TESTS
// ============================================

describe('validateProjectName', () => {
  describe('Valid names', () => {
    const validNames = [
      'my-project',
      'project_name',
      'Project123',
      'a',
      'some-really-long-project-name-that-is-still-valid'
    ];

    for (const name of validNames) {
      it(`should accept "${name}"`, () => {
        const result = validateProjectName(name);
        assert.strictEqual(result.valid, true);
        assert.strictEqual(result.name, name);
      });
    }
  });

  describe('Invalid names', () => {
    it('should reject empty string', () => {
      const result = validateProjectName('');
      assert.strictEqual(result.valid, false);
    });

    it('should reject non-string', () => {
      const result = validateProjectName(123);
      assert.strictEqual(result.valid, false);
    });

    it('should reject null', () => {
      const result = validateProjectName(null);
      assert.strictEqual(result.valid, false);
    });
  });

  describe('Invalid characters', () => {
    const invalidChars = ['<', '>', ':', '"', '/', '\\', '|', '?', '*'];

    for (const char of invalidChars) {
      it(`should reject name with "${char}"`, () => {
        const result = validateProjectName(`project${char}name`);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('invalid characters'));
      });
    }

    it('should reject name with null byte', () => {
      const result = validateProjectName('project\x00name');
      assert.strictEqual(result.valid, false);
    });
  });

  describe('Reserved names', () => {
    const reservedNames = ['con', 'prn', 'aux', 'nul', 'com1', 'lpt1'];

    for (const name of reservedNames) {
      it(`should reject reserved name "${name}"`, () => {
        const result = validateProjectName(name);
        assert.strictEqual(result.valid, false);
        assert.ok(result.error.includes('reserved'));
      });
    }

    it('should reject reserved names case-insensitively', () => {
      const result = validateProjectName('CON');
      assert.strictEqual(result.valid, false);
    });
  });

  describe('Length limits', () => {
    it('should reject name longer than 214 characters', () => {
      const longName = 'a'.repeat(215);
      const result = validateProjectName(longName);
      assert.strictEqual(result.valid, false);
      assert.ok(result.error.includes('between 1 and 214'));
    });

    it('should accept name at maximum length', () => {
      const maxName = 'a'.repeat(214);
      const result = validateProjectName(maxName);
      assert.strictEqual(result.valid, true);
    });
  });

  describe('Whitespace handling', () => {
    it('should trim whitespace', () => {
      const result = validateProjectName('  my-project  ');
      assert.strictEqual(result.valid, true);
      assert.strictEqual(result.name, 'my-project');
    });
  });
});

// ============================================
// VALIDATE CONFIG TESTS
// ============================================

describe('validateConfig', () => {
  describe('Basic validation', () => {
    it('should reject non-object', () => {
      const result = validateConfig('string');
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.includes('Configuration must be an object'));
    });

    it('should reject null', () => {
      const result = validateConfig(null);
      assert.strictEqual(result.valid, false);
    });
  });

  describe('Required fields', () => {
    it('should require version field', () => {
      const result = validateConfig({ preset: 'standard' });
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('version')));
    });

    it('should require preset field', () => {
      const result = validateConfig({ version: '1.0.0' });
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('preset')));
    });

    it('should validate version format', () => {
      const result = validateConfig({ version: 'invalid', preset: 'standard' });
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('semver')));
    });

    it('should validate preset value', () => {
      const result = validateConfig({ version: '1.0.0', preset: 'invalid' });
      assert.strictEqual(result.valid, false);
    });
  });

  describe('Optional field types', () => {
    const baseConfig = { version: '1.0.0', preset: 'standard' };

    it('should validate commands as array', () => {
      const result = validateConfig({ ...baseConfig, commands: 'not-array' });
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('commands must be an array')));
    });

    it('should validate agents as array', () => {
      const result = validateConfig({ ...baseConfig, agents: 'not-array' });
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('agents must be an array')));
    });

    it('should accept boolean hooks', () => {
      const result = validateConfig({ ...baseConfig, hooks: true });
      assert.strictEqual(result.valid, true);
    });

    it('should accept object hooks', () => {
      const result = validateConfig({ ...baseConfig, hooks: { enabled: true } });
      assert.strictEqual(result.valid, true);
    });

    it('should reject invalid hooks type', () => {
      const result = validateConfig({ ...baseConfig, hooks: 'string' });
      assert.strictEqual(result.valid, false);
    });

    it('should accept boolean mcp', () => {
      const result = validateConfig({ ...baseConfig, mcp: false });
      assert.strictEqual(result.valid, true);
    });

    it('should validate mcp.storage values', () => {
      const result = validateConfig({ ...baseConfig, mcp: { storage: 'invalid' } });
      assert.strictEqual(result.valid, false);
      assert.ok(result.errors.some(e => e.includes('mcp.storage')));
    });

    it('should accept valid mcp.storage', () => {
      const result = validateConfig({ ...baseConfig, mcp: { storage: 'sqlite' } });
      assert.strictEqual(result.valid, true);
    });
  });

  describe('Nested object validation', () => {
    const baseConfig = { version: '1.0.0', preset: 'standard' };

    it('should validate metrics.enabled as boolean', () => {
      const result = validateConfig({ ...baseConfig, metrics: { enabled: 'yes' } });
      assert.strictEqual(result.valid, false);
    });

    it('should validate metrics.autoCollect as boolean', () => {
      const result = validateConfig({ ...baseConfig, metrics: { autoCollect: 1 } });
      assert.strictEqual(result.valid, false);
    });

    it('should validate security boolean fields', () => {
      const result = validateConfig({ ...baseConfig, security: { preCommit: 'yes' } });
      assert.strictEqual(result.valid, false);
    });

    it('should validate team boolean fields', () => {
      const result = validateConfig({ ...baseConfig, team: { enabled: 'yes' } });
      assert.strictEqual(result.valid, false);
    });

    it('should validate project.language values', () => {
      const result = validateConfig({ ...baseConfig, project: { language: 'brainfuck' } });
      assert.strictEqual(result.valid, false);
    });

    it('should accept valid project.language', () => {
      const result = validateConfig({ ...baseConfig, project: { language: 'typescript' } });
      assert.strictEqual(result.valid, true);
    });
  });

  describe('Valid configurations', () => {
    it('should accept minimal valid config', () => {
      const result = validateConfig({ version: '1.0.0', preset: 'standard' });
      assert.strictEqual(result.valid, true);
      assert.deepStrictEqual(result.errors, []);
    });

    it('should accept full valid config', () => {
      const result = validateConfig({
        version: '1.0.0',
        preset: 'full',
        commands: ['plan', 'verify'],
        agents: ['explorer'],
        hooks: true,
        mcp: { storage: 'sqlite', limits: { maxMemory: 100 } },
        metrics: { enabled: true, autoCollect: false },
        security: { preCommit: true, secretsDetection: true },
        team: { enabled: true, sharedMemory: false },
        project: { name: 'test', language: 'typescript' }
      });
      assert.strictEqual(result.valid, true);
    });
  });
});

// ============================================
// SANITIZE STRING TESTS
// ============================================

describe('sanitizeString', () => {
  describe('Basic sanitization', () => {
    it('should return empty string for null', () => {
      assert.strictEqual(sanitizeString(null), '');
    });

    it('should return empty string for undefined', () => {
      assert.strictEqual(sanitizeString(undefined), '');
    });

    it('should return empty string for non-string', () => {
      assert.strictEqual(sanitizeString(123), '');
    });

    it('should trim whitespace', () => {
      assert.strictEqual(sanitizeString('  test  '), 'test');
    });
  });

  describe('Null byte removal', () => {
    it('should remove null bytes', () => {
      const result = sanitizeString('hello\x00world');
      assert.ok(!result.includes('\x00'));
      assert.strictEqual(result, 'helloworld');
    });
  });

  describe('Length truncation', () => {
    it('should truncate long strings with default maxLength', () => {
      const longString = 'a'.repeat(15000);
      const result = sanitizeString(longString);
      assert.ok(result.length < longString.length);
      assert.ok(result.includes('[truncated]'));
    });

    it('should respect custom maxLength', () => {
      const result = sanitizeString('hello world', { maxLength: 5 });
      assert.ok(result.length <= 20); // 5 + "... [truncated]"
      assert.ok(result.includes('[truncated]'));
    });

    it('should not truncate strings under maxLength', () => {
      const result = sanitizeString('hello', { maxLength: 100 });
      assert.strictEqual(result, 'hello');
    });
  });

  describe('HTML escaping', () => {
    it('should escape HTML by default', () => {
      const result = sanitizeString('<script>alert("xss")</script>');
      assert.ok(!result.includes('<'));
      assert.ok(!result.includes('>'));
      assert.ok(result.includes('&lt;'));
      assert.ok(result.includes('&gt;'));
    });

    it('should escape ampersands', () => {
      const result = sanitizeString('a & b');
      assert.ok(result.includes('&amp;'));
    });

    it('should escape quotes', () => {
      const result = sanitizeString('"test"');
      assert.ok(result.includes('&quot;'));
    });

    it('should not escape HTML when allowHtml=true', () => {
      const result = sanitizeString('<b>bold</b>', { allowHtml: true });
      assert.strictEqual(result, '<b>bold</b>');
    });
  });
});

// ============================================
// LOOKS LIKE SECRET TESTS
// ============================================

describe('looksLikeSecret', () => {
  describe('Should detect secrets', () => {
    const secrets = [
      // OpenAI
      'sk-1234567890abcdefghijklmnopqrstuvwxyz',
      // Anthropic
      'sk-ant-api03-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      // GitHub tokens
      'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'gho_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      // AWS
      'AKIAIOSFODNN7EXAMPLE',
      // Stripe
      'sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      'sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      // Slack
      'xoxb-xxxxxxxxxxxxxxxxxxxx',
      // npm (exactly 36 chars after prefix)
      'npm_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      // SendGrid
      'SG.xxxxxxxxxxxxxxxxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      // Private key header
      '-----BEGIN RSA PRIVATE KEY-----'
    ];

    for (const secret of secrets) {
      it(`should detect: ${secret.substring(0, 20)}...`, () => {
        assert.strictEqual(looksLikeSecret(secret), true);
      });
    }
  });

  describe('Should NOT detect non-secrets', () => {
    const nonSecrets = [
      'short',
      'this is just normal text',
      'const apiVersion = "v2"',
      'function parseSecretKey() {}',
      'PASSWORD_MIN_LENGTH',
      '1234567890123456', // Just numbers, short
      'abcdefghijklmnop', // Just letters, no prefix
      'some-regular-string-here'
    ];

    for (const nonSecret of nonSecrets) {
      it(`should NOT detect: ${nonSecret.substring(0, 30)}`, () => {
        assert.strictEqual(looksLikeSecret(nonSecret), false);
      });
    }
  });

  describe('Edge cases', () => {
    it('should return false for null', () => {
      assert.strictEqual(looksLikeSecret(null), false);
    });

    it('should return false for undefined', () => {
      assert.strictEqual(looksLikeSecret(undefined), false);
    });

    it('should return false for non-string', () => {
      assert.strictEqual(looksLikeSecret(12345678901234567890), false);
    });

    it('should return false for very short strings', () => {
      assert.strictEqual(looksLikeSecret('sk-short'), false);
    });

    it('should trim whitespace before checking', () => {
      assert.strictEqual(looksLikeSecret('  sk-1234567890abcdefghijklmnopqrstuvwxyz  '), true);
    });
  });
});
