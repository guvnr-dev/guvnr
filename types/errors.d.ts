/**
 * Guvnr - Error Types
 *
 * Provides type definitions for the error system.
 */

// ============================================
// Error Codes
// ============================================

/** Error code categories */
export type ErrorCategory =
  | 'INIT'     // Initialization errors (100-199)
  | 'VALID'    // Validation errors (200-299)
  | 'CONFIG'   // Configuration errors (300-399)
  | 'FS'       // Filesystem errors (400-499)
  | 'NET'      // Network errors (500-599)
  | 'MCP'      // MCP server errors (600-699)
  | 'HOOK'     // Git hook errors (700-799)
  | 'GEN';     // General errors (900-999)

/** Error code record */
export interface ErrorCodeRecord {
  /** Error code (e.g., 'AIX-INIT-100') */
  code: string;
  /** Error category */
  category: ErrorCategory;
  /** Numeric code within category */
  numericCode: number;
  /** Default error message */
  message: string;
  /** Suggested fix or next steps */
  suggestion?: string;
}

/** All registered error codes */
export const ERROR_CODES: Record<string, ErrorCodeRecord>;

// ============================================
// Exit Codes
// ============================================

/** Process exit codes */
export const EXIT_CODES: {
  SUCCESS: 0;
  GENERAL_ERROR: 1;
  USAGE_ERROR: 2;
  CONFIG_ERROR: 3;
  VALIDATION_ERROR: 4;
  NETWORK_ERROR: 5;
  PERMISSION_ERROR: 6;
  NOT_FOUND: 7;
};

/**
 * Get exit code for an error code
 * @param errorCode - Framework error code (e.g., 'AIX-INIT-100')
 * @returns Appropriate exit code
 */
export function getExitCode(errorCode: string): number;

// ============================================
// FrameworkError Class
// ============================================

/** Error options for FrameworkError */
export interface FrameworkErrorOptions {
  /** Original error that caused this error */
  cause?: Error;
  /** Additional context for debugging */
  context?: Record<string, unknown>;
  /** Suggested fix or next steps */
  suggestion?: string;
}

/** JSON representation of FrameworkError */
export interface FrameworkErrorJSON {
  /** Error code */
  code: string;
  /** Error message */
  message: string;
  /** Error context */
  context?: Record<string, unknown>;
  /** Suggested fix */
  suggestion?: string;
  /** Stack trace (if available) */
  stack?: string;
  /** Cause error (if available) */
  cause?: FrameworkErrorJSON | { message: string; stack?: string };
}

/**
 * Framework-specific error class with structured error codes and context.
 */
export class FrameworkError extends Error {
  /** Error code (e.g., 'AIX-INIT-100') */
  readonly code: string;

  /** Additional context for debugging */
  readonly context?: Record<string, unknown>;

  /** Suggested fix or next steps */
  readonly suggestion?: string;

  constructor(code: string, message: string, options?: FrameworkErrorOptions);

  /**
   * Format error for display
   * @param verbose - Include stack trace and additional details
   * @returns Formatted error string
   */
  format(verbose?: boolean): string;

  /**
   * Convert error to JSON representation
   * @returns JSON-serializable object
   */
  toJSON(): FrameworkErrorJSON;
}

// ============================================
// Error Creation Functions
// ============================================

/**
 * Create a FrameworkError with the given code and message
 * @param code - Error code (e.g., 'AIX-INIT-100')
 * @param message - Error message
 * @param options - Additional error options
 * @returns New FrameworkError instance
 */
export function createError(
  code: string,
  message: string,
  options?: FrameworkErrorOptions
): FrameworkError;

/**
 * Create a validation error
 * @param message - Error message
 * @param context - Validation context
 * @returns FrameworkError with validation error code
 */
export function createValidationError(
  message: string,
  context?: Record<string, unknown>
): FrameworkError;

/**
 * Create a configuration error
 * @param message - Error message
 * @param context - Configuration context
 * @returns FrameworkError with configuration error code
 */
export function createConfigError(
  message: string,
  context?: Record<string, unknown>
): FrameworkError;

/**
 * Create a filesystem error
 * @param message - Error message
 * @param context - Filesystem context
 * @returns FrameworkError with filesystem error code
 */
export function createFsError(
  message: string,
  context?: Record<string, unknown>
): FrameworkError;

// ============================================
// Error Handling Utilities
// ============================================

/**
 * Wrap an async function with error handling
 * Catches errors and formats them appropriately for CLI output
 * @param fn - Async function to wrap
 * @returns Wrapped function that handles errors
 */
export function asyncHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T
): T;

/**
 * Assert a condition, throwing a FrameworkError if false
 * @param condition - Condition to check
 * @param code - Error code if condition is false
 * @param message - Error message if condition is false
 * @param context - Additional context
 */
export function invariant(
  condition: unknown,
  code: string,
  message: string,
  context?: Record<string, unknown>
): asserts condition;

/**
 * Check if an error is a FrameworkError
 * @param error - Error to check
 * @returns True if error is a FrameworkError
 */
export function isFrameworkError(error: unknown): error is FrameworkError;

/**
 * Sanitize a path for display in error messages
 * Replaces home directory with ~ and removes sensitive information
 * @param path - Path to sanitize
 * @returns Sanitized path string
 */
export function sanitizePath(path: string): string;

/**
 * Redact sensitive values from an object for logging
 * @param obj - Object to redact
 * @returns Object with sensitive values redacted
 */
export function redactSensitive(obj: Record<string, unknown>): Record<string, unknown>;

// ============================================
// Default Export
// ============================================

declare const _default: {
  FrameworkError: typeof FrameworkError;
  ERROR_CODES: typeof ERROR_CODES;
  EXIT_CODES: typeof EXIT_CODES;
  createError: typeof createError;
  createValidationError: typeof createValidationError;
  createConfigError: typeof createConfigError;
  createFsError: typeof createFsError;
  getExitCode: typeof getExitCode;
  asyncHandler: typeof asyncHandler;
  invariant: typeof invariant;
  isFrameworkError: typeof isFrameworkError;
  sanitizePath: typeof sanitizePath;
  redactSensitive: typeof redactSensitive;
};

export default _default;
