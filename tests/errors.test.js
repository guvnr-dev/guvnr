/**
 * Error System Tests for Guvnr
 *
 * Tests the error handling system from src/errors.js including:
 * - FrameworkError class
 * - Error code catalog
 * - Exit code mapping
 * - Error creation utilities
 * - Path sanitization
 *
 * Run with: node --test tests/errors.test.js
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { homedir } from 'node:os';
import { join } from 'node:path';

import {
  FrameworkError,
  ERROR_CODES,
  EXIT_CODES,
  createError,
  getExitCode,
  asyncHandler,
  assertCondition
} from '../src/errors.js';

// ============================================
// FRAMEWORK ERROR CLASS TESTS
// ============================================

describe('FrameworkError', () => {
  it('should create error with code and message', () => {
    const error = new FrameworkError('AIX-TEST-001', 'Test error message');

    assert.strictEqual(error.code, 'AIX-TEST-001');
    assert.strictEqual(error.message, 'Test error message');
    assert.strictEqual(error.name, 'FrameworkError');
  });

  it('should generate unique errorId', () => {
    const error1 = new FrameworkError('AIX-TEST-001', 'Error 1');
    const error2 = new FrameworkError('AIX-TEST-002', 'Error 2');

    assert.ok(error1.errorId, 'Should have errorId');
    assert.ok(error2.errorId, 'Should have errorId');
    assert.notStrictEqual(error1.errorId, error2.errorId, 'errorIds should be unique');
  });

  it('should accept custom errorId', () => {
    const error = new FrameworkError('AIX-TEST-001', 'Test', {
      errorId: 'custom-id-12345'
    });

    assert.strictEqual(error.errorId, 'custom-id-12345');
  });

  it('should set timestamp', () => {
    const before = new Date().toISOString();
    const error = new FrameworkError('AIX-TEST-001', 'Test');
    const after = new Date().toISOString();

    assert.ok(error.timestamp >= before);
    assert.ok(error.timestamp <= after);
  });

  it('should accept cause option', () => {
    const originalError = new Error('Original error');
    const error = new FrameworkError('AIX-TEST-001', 'Wrapped error', {
      cause: originalError
    });

    assert.strictEqual(error.cause, originalError);
  });

  it('should accept context option', () => {
    const error = new FrameworkError('AIX-TEST-001', 'Test', {
      context: { file: 'test.js', line: 42 }
    });

    assert.deepStrictEqual(error.context, { file: 'test.js', line: 42 });
  });

  it('should default recoverable to true', () => {
    const error = new FrameworkError('AIX-TEST-001', 'Test');
    assert.strictEqual(error.recoverable, true);
  });

  it('should accept recoverable false', () => {
    const error = new FrameworkError('AIX-TEST-001', 'Fatal', {
      recoverable: false
    });

    assert.strictEqual(error.recoverable, false);
  });

  it('should accept suggestion option', () => {
    const error = new FrameworkError('AIX-TEST-001', 'Test', {
      suggestion: 'Try this instead'
    });

    assert.strictEqual(error.suggestion, 'Try this instead');
  });

  describe('toJSON', () => {
    it('should return structured object', () => {
      const error = new FrameworkError('AIX-TEST-001', 'Test message', {
        context: { test: true },
        suggestion: 'Fix it'
      });

      const json = error.toJSON();

      assert.strictEqual(json.name, 'FrameworkError');
      assert.strictEqual(json.code, 'AIX-TEST-001');
      assert.strictEqual(json.message, 'Test message');
      assert.ok(json.errorId);
      assert.ok(json.timestamp);
      assert.strictEqual(json.recoverable, true);
      assert.strictEqual(json.suggestion, 'Fix it');
      assert.ok(json.stack);
    });

    it('should sanitize paths when sanitize=true (default)', () => {
      const home = homedir();
      const error = new FrameworkError('AIX-TEST-001', 'Test', {
        context: { path: join(home, 'project', 'file.js') }
      });

      const json = error.toJSON(true);

      // Home path should be replaced with ~
      assert.ok(!json.context.path.includes(home), 'Should not include raw home path');
      assert.ok(json.context.path.includes('~'), 'Should include ~ for home');
    });

    it('should not sanitize when sanitize=false', () => {
      const home = homedir();
      const error = new FrameworkError('AIX-TEST-001', 'Test', {
        context: { path: join(home, 'project', 'file.js') }
      });

      const json = error.toJSON(false);

      // Should keep original path
      assert.ok(json.context.path.includes(home), 'Should include raw home path');
    });
  });

  describe('format', () => {
    it('should format error for CLI output', () => {
      const error = new FrameworkError('AIX-TEST-001', 'Test message');
      const formatted = error.format();

      assert.ok(formatted.includes('AIX-TEST-001'), 'Should include error code');
      assert.ok(formatted.includes('Test message'), 'Should include message');
      assert.ok(formatted.includes('Documentation:'), 'Should include doc link');
    });

    it('should include suggestion when present', () => {
      const error = new FrameworkError('AIX-TEST-001', 'Test', {
        suggestion: 'Try this fix'
      });
      const formatted = error.format();

      assert.ok(formatted.includes('Suggestion:'), 'Should include Suggestion label');
      assert.ok(formatted.includes('Try this fix'), 'Should include suggestion text');
    });

    it('should include stack in verbose mode', () => {
      const error = new FrameworkError('AIX-TEST-001', 'Test');
      const formatted = error.format(true);

      assert.ok(formatted.includes('Error ID:'), 'Should include Error ID');
      assert.ok(formatted.includes('Stack trace:'), 'Should include stack trace');
    });

    it('should not include stack in non-verbose mode', () => {
      const error = new FrameworkError('AIX-TEST-001', 'Test');
      const formatted = error.format(false);

      assert.ok(!formatted.includes('Stack trace:'), 'Should not include stack trace');
      assert.ok(!formatted.includes('Error ID:'), 'Should not include Error ID');
    });
  });
});

// ============================================
// ERROR CODES CATALOG TESTS
// ============================================

describe('ERROR_CODES', () => {
  it('should have all initialization error codes', () => {
    assert.ok(ERROR_CODES['AIX-INIT-100'], 'Should have AIX-INIT-100');
    assert.ok(ERROR_CODES['AIX-INIT-101'], 'Should have AIX-INIT-101');
    assert.ok(ERROR_CODES['AIX-INIT-102'], 'Should have AIX-INIT-102');
  });

  it('should have all validation error codes', () => {
    assert.ok(ERROR_CODES['AIX-VALID-200'], 'Should have AIX-VALID-200');
    assert.ok(ERROR_CODES['AIX-VALID-201'], 'Should have AIX-VALID-201');
    assert.ok(ERROR_CODES['AIX-VALID-202'], 'Should have AIX-VALID-202');
  });

  it('should have all configuration error codes', () => {
    assert.ok(ERROR_CODES['AIX-CONFIG-300'], 'Should have AIX-CONFIG-300');
    assert.ok(ERROR_CODES['AIX-CONFIG-301'], 'Should have AIX-CONFIG-301');
  });

  it('should have all filesystem error codes', () => {
    assert.ok(ERROR_CODES['AIX-FS-400'], 'Should have AIX-FS-400');
    assert.ok(ERROR_CODES['AIX-FS-401'], 'Should have AIX-FS-401');
    assert.ok(ERROR_CODES['AIX-FS-402'], 'Should have AIX-FS-402');
  });

  it('should have all MCP error codes', () => {
    assert.ok(ERROR_CODES['AIX-MCP-600'], 'Should have AIX-MCP-600');
    assert.ok(ERROR_CODES['AIX-MCP-601'], 'Should have AIX-MCP-601');
    assert.ok(ERROR_CODES['AIX-MCP-602'], 'Should have AIX-MCP-602');
  });

  it('should have all hook error codes', () => {
    assert.ok(ERROR_CODES['AIX-HOOK-700'], 'Should have AIX-HOOK-700');
    assert.ok(ERROR_CODES['AIX-HOOK-701'], 'Should have AIX-HOOK-701');
  });

  it('should have all general error codes', () => {
    assert.ok(ERROR_CODES['AIX-GEN-900'], 'Should have AIX-GEN-900');
    assert.ok(ERROR_CODES['AIX-GEN-901'], 'Should have AIX-GEN-901');
    assert.ok(ERROR_CODES['AIX-GEN-902'], 'Should have AIX-GEN-902');
  });

  it('each error code should have required fields', () => {
    for (const [code, def] of Object.entries(ERROR_CODES)) {
      assert.ok(def.category, `${code} should have category`);
      assert.ok(def.description, `${code} should have description`);
      assert.ok(def.suggestion, `${code} should have suggestion`);
    }
  });
});

// ============================================
// EXIT CODES TESTS
// ============================================

describe('EXIT_CODES', () => {
  it('should have standard Unix exit codes', () => {
    assert.strictEqual(EXIT_CODES.SUCCESS, 0);
    assert.strictEqual(EXIT_CODES.GENERAL_ERROR, 1);
    assert.strictEqual(EXIT_CODES.MISUSE, 2);
    assert.strictEqual(EXIT_CODES.CANNOT_EXECUTE, 126);
    assert.strictEqual(EXIT_CODES.NOT_FOUND, 127);
    assert.strictEqual(EXIT_CODES.CTRL_C, 130);
  });

  it('should have framework-specific exit codes', () => {
    assert.strictEqual(EXIT_CODES.INIT_ERROR, 64);
    assert.strictEqual(EXIT_CODES.VALIDATION_ERROR, 65);
    assert.strictEqual(EXIT_CODES.CONFIG_ERROR, 66);
    assert.strictEqual(EXIT_CODES.IO_ERROR, 74);
    assert.strictEqual(EXIT_CODES.PROTOCOL_ERROR, 76);
    assert.strictEqual(EXIT_CODES.PERMISSION_ERROR, 77);
  });
});

describe('getExitCode', () => {
  it('should map INIT errors to INIT_ERROR', () => {
    assert.strictEqual(getExitCode('AIX-INIT-100'), EXIT_CODES.INIT_ERROR);
    assert.strictEqual(getExitCode('AIX-INIT-101'), EXIT_CODES.INIT_ERROR);
  });

  it('should map VALID errors to VALIDATION_ERROR', () => {
    assert.strictEqual(getExitCode('AIX-VALID-200'), EXIT_CODES.VALIDATION_ERROR);
  });

  it('should map CONFIG errors to CONFIG_ERROR', () => {
    assert.strictEqual(getExitCode('AIX-CONFIG-300'), EXIT_CODES.CONFIG_ERROR);
  });

  it('should map FS errors to IO_ERROR', () => {
    assert.strictEqual(getExitCode('AIX-FS-400'), EXIT_CODES.IO_ERROR);
  });

  it('should map NET errors to TEMP_FAILURE', () => {
    assert.strictEqual(getExitCode('AIX-NET-500'), EXIT_CODES.TEMP_FAILURE);
  });

  it('should map MCP errors to PROTOCOL_ERROR', () => {
    assert.strictEqual(getExitCode('AIX-MCP-600'), EXIT_CODES.PROTOCOL_ERROR);
  });

  it('should map HOOK errors to PERMISSION_ERROR', () => {
    assert.strictEqual(getExitCode('AIX-HOOK-700'), EXIT_CODES.PERMISSION_ERROR);
  });

  it('should default to GENERAL_ERROR for unknown prefixes', () => {
    assert.strictEqual(getExitCode('AIX-UNKNOWN-999'), EXIT_CODES.GENERAL_ERROR);
    assert.strictEqual(getExitCode('AIX-GEN-900'), EXIT_CODES.GENERAL_ERROR);
  });
});

// ============================================
// CREATE ERROR UTILITY TESTS
// ============================================

describe('createError', () => {
  it('should create FrameworkError with predefined suggestion', () => {
    const error = createError('AIX-INIT-101');

    assert.ok(error instanceof FrameworkError);
    assert.strictEqual(error.code, 'AIX-INIT-101');
    assert.ok(error.suggestion.includes('--force'), 'Should have predefined suggestion');
  });

  it('should use custom message when provided', () => {
    const error = createError('AIX-INIT-101', 'Custom message here');

    assert.strictEqual(error.message, 'Custom message here');
  });

  it('should use description as message when no custom message', () => {
    const error = createError('AIX-INIT-101');

    assert.strictEqual(error.message, ERROR_CODES['AIX-INIT-101'].description);
  });

  it('should allow overriding suggestion', () => {
    const error = createError('AIX-INIT-101', 'Test', {
      suggestion: 'Custom suggestion'
    });

    assert.strictEqual(error.suggestion, 'Custom suggestion');
  });

  it('should handle unknown error code', () => {
    const error = createError('AIX-UNKNOWN-999', 'Unknown error');

    assert.strictEqual(error.code, 'AIX-UNKNOWN-999');
    assert.strictEqual(error.message, 'Unknown error');
    // Should use default GEN-900 suggestion
    assert.ok(error.suggestion.includes('--verbose'));
  });
});

// ============================================
// ASSERT CONDITION UTILITY TESTS
// ============================================

describe('assertCondition', () => {
  it('should not throw when condition is true', () => {
    assert.doesNotThrow(() => {
      assertCondition(true, 'AIX-TEST-001', 'Should not happen');
    });
  });

  it('should throw FrameworkError when condition is false', () => {
    assert.throws(
      () => assertCondition(false, 'AIX-TEST-001', 'Condition failed'),
      err => {
        assert.ok(err instanceof FrameworkError);
        assert.strictEqual(err.code, 'AIX-TEST-001');
        assert.strictEqual(err.message, 'Condition failed');
        return true;
      }
    );
  });

  it('should pass options to FrameworkError', () => {
    try {
      assertCondition(false, 'AIX-TEST-001', 'Test', {
        context: { test: true },
        recoverable: false
      });
      assert.fail('Should have thrown');
    } catch (err) {
      assert.deepStrictEqual(err.context, { test: true });
      assert.strictEqual(err.recoverable, false);
    }
  });
});

// ============================================
// ASYNC HANDLER TESTS
// ============================================

describe('asyncHandler', () => {
  // Note: asyncHandler calls process.exit on error, so we need to be careful
  // We can test the wrapping behavior without triggering process.exit

  it('should return wrapped function', () => {
    const fn = async () => 'result';
    const wrapped = asyncHandler(fn);

    assert.strictEqual(typeof wrapped, 'function');
  });

  it('should pass through successful result', async () => {
    const fn = async x => x * 2;
    const wrapped = asyncHandler(fn);

    const result = await wrapped(5);
    assert.strictEqual(result, 10);
  });

  it('should pass arguments to wrapped function', async () => {
    const fn = async (a, b, c) => [a, b, c];
    const wrapped = asyncHandler(fn);

    const result = await wrapped(1, 2, 3);
    assert.deepStrictEqual(result, [1, 2, 3]);
  });
});

// ============================================
// PATH SANITIZATION TESTS
// ============================================

describe('Path Sanitization', () => {
  it('should sanitize home directory in toJSON', () => {
    const home = homedir();
    const error = new FrameworkError('AIX-TEST-001', 'Test', {
      context: {
        absolutePath: join(home, 'projects', 'test', 'file.js'),
        normalPath: 'relative/path.js'
      }
    });

    const json = error.toJSON();

    // Home directory should be replaced
    assert.ok(!json.context.absolutePath.includes(home));
    assert.ok(json.context.absolutePath.startsWith('~'));

    // Relative paths should be unchanged
    assert.strictEqual(json.context.normalPath, 'relative/path.js');
  });

  it('should handle nested objects in context', () => {
    const home = homedir();
    const error = new FrameworkError('AIX-TEST-001', 'Test', {
      context: {
        nested: {
          deep: {
            path: join(home, 'deep', 'path.js')
          }
        }
      }
    });

    const json = error.toJSON();

    assert.ok(!json.context.nested.deep.path.includes(home));
  });

  it('should redact sensitive environment variable names', () => {
    const error = new FrameworkError('AIX-TEST-001', 'Test', {
      context: {
        API_KEY: 'secret-value-here',
        ANTHROPIC_API_KEY: 'another-secret',
        normalValue: 'this is fine'
      }
    });

    const json = error.toJSON();

    assert.strictEqual(json.context.API_KEY, '[REDACTED]');
    assert.strictEqual(json.context.ANTHROPIC_API_KEY, '[REDACTED]');
    assert.strictEqual(json.context.normalValue, 'this is fine');
  });
});
