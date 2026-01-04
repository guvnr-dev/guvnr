/**
 * Guvnr - TypeScript Declarations
 *
 * Provides type definitions for the main module exports.
 */

// ============================================
// Version and Constants
// ============================================

/** Current framework version (semver) */
export const VERSION: string;

/** Available preset names */
export const PRESETS: readonly string[];

/** Available slash command names */
export const COMMANDS: readonly string[];

/** Available subagent names */
export const AGENTS: readonly string[];

// ============================================
// Configuration Types
// ============================================

/** Hook configuration */
export interface HooksConfig {
  /** Post-edit hook timeout in ms */
  postEditTimeout?: number;
  /** Verify deps hook timeout in ms */
  verifyDepsTimeout?: number;
}

/** MCP server limits */
export interface McpLimits {
  /** Maximum stored decisions */
  maxDecisions?: number;
  /** Maximum stored patterns */
  maxPatterns?: number;
  /** Maximum context keys */
  maxContextKeys?: number;
}

/** MCP configuration */
export interface McpConfig {
  /** Enable MCP server */
  enabled?: boolean;
  /** Storage backend: 'sqlite' or 'postgres' */
  storage?: 'sqlite' | 'postgres';
  /** Resource limits */
  limits?: McpLimits;
}

/** Security configuration */
export interface SecurityConfig {
  /** Enable pre-commit hooks */
  preCommit?: boolean;
  /** Enable secrets detection */
  secretsDetection?: boolean;
  /** Enable dependency scanning */
  dependencyScanning?: boolean;
  /** Enable AI-specific pattern checks */
  aiPatternChecks?: boolean;
}

/** Metrics configuration */
export interface MetricsConfig {
  /** Enable metrics collection */
  enabled?: boolean;
  /** Auto-collect metrics at session end */
  autoCollect?: boolean;
  /** Metrics storage directory */
  directory?: string;
}

/** Team configuration */
export interface TeamConfig {
  /** Enable team features */
  enabled?: boolean;
  /** Enable shared memory */
  sharedMemory?: boolean;
  /** Enforce team conventions */
  enforceConventions?: boolean;
}

/** Project configuration */
export interface ProjectConfig {
  /** Project name */
  name?: string;
  /** Primary language */
  language?: 'typescript' | 'javascript' | 'python' | 'go' | 'rust' | 'java' | 'other';
}

/** Framework configuration */
export interface FrameworkConfig {
  /** Configuration version (semver) */
  version: string;
  /** Preset name */
  preset: 'minimal' | 'standard' | 'full' | 'team' | 'custom';
  /** Enabled commands */
  commands?: string[];
  /** Enabled agents */
  agents?: string[];
  /** Hooks configuration */
  hooks?: boolean | HooksConfig;
  /** MCP configuration */
  mcp?: boolean | McpConfig;
  /** Security configuration */
  security?: boolean | SecurityConfig;
  /** Metrics configuration */
  metrics?: boolean | MetricsConfig;
  /** Team configuration */
  team?: boolean | TeamConfig;
  /** Project configuration */
  project?: ProjectConfig;
  /** Enable federation for team memory */
  federation?: boolean;
}

/** Preset configuration (extends FrameworkConfig with description) */
export interface PresetConfig extends FrameworkConfig {
  /** Human-readable description */
  description: string;
}

/** Default configuration object */
export const DEFAULT_CONFIG: FrameworkConfig;

/** All preset configurations */
export const PRESET_CONFIGS: Record<string, PresetConfig>;

// ============================================
// Configuration Functions
// ============================================

/**
 * Get configuration for a specific preset
 * @param presetName - Name of the preset
 * @returns Preset configuration or undefined if not found
 */
export function getPresetConfig(presetName: string): PresetConfig | undefined;

/**
 * Deep merge two configuration objects
 * @param base - Base configuration
 * @param override - Override configuration
 * @returns Merged configuration
 */
export function mergeConfig(base: Partial<FrameworkConfig>, override: Partial<FrameworkConfig>): FrameworkConfig;

// ============================================
// Installation Types
// ============================================

/** Installation check result */
export interface InstallationCheck {
  /** Whether framework is installed */
  installed: boolean;
  /** Whether CLAUDE.md exists */
  hasClaudeMd: boolean;
  /** Whether commands directory exists */
  hasCommands: boolean;
  /** Whether agents directory exists */
  hasAgents: boolean;
  /** Whether configuration file exists */
  hasConfig: boolean;
  /** Configuration file path if exists */
  configPath?: string;
}

/**
 * Check if framework is installed in a directory
 * @param cwd - Directory to check (defaults to process.cwd())
 * @returns Installation check result
 */
export function checkInstallation(cwd?: string): InstallationCheck;

/**
 * List installed slash commands
 * @param cwd - Directory to check (defaults to process.cwd())
 * @returns Array of installed command names
 */
export function listInstalledCommands(cwd?: string): string[];

/**
 * List installed subagents
 * @param cwd - Directory to check (defaults to process.cwd())
 * @returns Array of installed agent names
 */
export function listInstalledAgents(cwd?: string): string[];

// ============================================
// CLAUDE.md Types
// ============================================

/** Parsed CLAUDE.md section */
export interface ClaudeMdSection {
  /** Section heading */
  heading: string;
  /** Section level (1-6) */
  level: number;
  /** Section content */
  content: string;
}

/** Parsed CLAUDE.md structure */
export interface ParsedClaudeMd {
  /** Raw file content */
  raw: string;
  /** Parsed sections */
  sections: ClaudeMdSection[];
  /** Project overview (first section) */
  overview?: string;
  /** Tech stack section */
  techStack?: string;
  /** Architecture section */
  architecture?: string;
  /** Conventions section */
  conventions?: string;
  /** Current state section */
  currentState?: string;
}

/**
 * Read CLAUDE.md synchronously
 * @deprecated Use readClaudeMdAsync for non-blocking operation
 * @param cwd - Directory containing CLAUDE.md
 * @returns Parsed CLAUDE.md or null if not found
 */
export function readClaudeMd(cwd?: string): ParsedClaudeMd | null;

/**
 * Read CLAUDE.md asynchronously (recommended)
 * @param cwd - Directory containing CLAUDE.md
 * @returns Promise resolving to parsed CLAUDE.md or null
 */
export function readClaudeMdAsync(cwd?: string): Promise<ParsedClaudeMd | null>;

/**
 * Parse CLAUDE.md content into structured sections
 * @param content - Raw markdown content
 * @returns Parsed structure
 */
export function parseClaudeMd(content: string): ParsedClaudeMd;

/** CLAUDE.md validation result */
export interface ClaudeMdValidation {
  /** Whether structure is valid */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

/**
 * Validate CLAUDE.md structure
 * @param content - Raw markdown content or parsed structure
 * @returns Validation result
 */
export function validateClaudeMdStructure(content: string | ParsedClaudeMd): ClaudeMdValidation;

// ============================================
// Security Types
// ============================================

/** Secret detection finding */
export interface SecretFinding {
  /** Type of secret detected */
  type: string;
  /** Pattern that matched */
  pattern: string;
  /** Line number (1-indexed) */
  line: number;
  /** Column offset */
  column: number;
  /** Matched text (redacted) */
  match: string;
  /** Confidence level */
  confidence: 'high' | 'medium' | 'low';
}

/** Secret detection result */
export interface SecretDetectionResult {
  /** Whether any secrets were found */
  hasSecrets: boolean;
  /** Number of findings */
  count: number;
  /** Detailed findings */
  findings: SecretFinding[];
}

/**
 * Detect secrets in file content
 * @param content - File content to scan
 * @param options - Detection options
 * @returns Detection result
 */
export function detectSecrets(
  content: string,
  options?: {
    /** Include low-confidence matches */
    includeLowConfidence?: boolean;
    /** Maximum findings to return */
    maxFindings?: number;
  }
): SecretDetectionResult;

// ============================================
// Abort Signal Utilities
// ============================================

/**
 * Check if an abort signal has been triggered
 * @param signal - AbortSignal to check
 * @throws Error if signal is aborted
 */
export function checkAbortSignal(signal?: AbortSignal): void;

/**
 * Wrap an async function with abort signal support
 * @param fn - Async function to wrap
 * @param signal - AbortSignal to monitor
 * @returns Wrapped function
 */
export function withAbortSignal<T>(
  fn: () => Promise<T>,
  signal?: AbortSignal
): Promise<T>;

// ============================================
// Package Utilities
// ============================================

/**
 * Get the framework package root directory
 * @returns Absolute path to package root
 */
export function getPackageRoot(): string;

/**
 * Get path to a preset template directory
 * @param presetName - Name of the preset
 * @returns Absolute path to preset directory
 */
export function getPresetPath(presetName: string): string;

// ============================================
// Command Exports
// ============================================

/** Init command options */
export interface InitCommandOptions {
  /** Preset to use */
  preset?: string;
  /** Skip confirmation prompts */
  yes?: boolean;
  /** Overwrite existing files */
  force?: boolean;
  /** Dry run (show what would be created) */
  dryRun?: boolean;
  /** Verbose output */
  verbose?: boolean;
  /** JSON output */
  json?: boolean;
}

/**
 * Initialize framework in a directory
 * @param options - Command options
 */
export function initCommand(options?: InitCommandOptions): Promise<void>;

/** Validate command options */
export interface ValidateCommandOptions {
  /** Verbose output */
  verbose?: boolean;
  /** JSON output */
  json?: boolean;
}

/**
 * Validate framework installation
 * @param options - Command options
 */
export function validateCommand(options?: ValidateCommandOptions): Promise<void>;

/** Doctor command options */
export interface DoctorCommandOptions {
  /** Verbose output */
  verbose?: boolean;
  /** JSON output */
  json?: boolean;
}

/**
 * Run diagnostic checks
 * @param options - Command options
 */
export function doctorCommand(options?: DoctorCommandOptions): Promise<void>;

/** Update command options */
export interface UpdateCommandOptions {
  /** Force update even if up-to-date */
  force?: boolean;
  /** Dry run */
  dryRun?: boolean;
  /** JSON output */
  json?: boolean;
}

/**
 * Update framework to latest version
 * @param options - Command options
 */
export function updateCommand(options?: UpdateCommandOptions): Promise<void>;

/** Generate command options */
export interface GenerateCommandOptions {
  /** Tools to generate for (comma-separated or 'all') */
  tools?: string;
  /** Force overwrite existing files */
  force?: boolean;
  /** Verbose output */
  verbose?: boolean;
  /** JSON output */
  json?: boolean;
}

/**
 * Generate tool-specific configuration files
 * @param options - Command options
 */
export function generateCommand(options?: GenerateCommandOptions): Promise<void>;

/** Lint command options */
export interface LintCommandOptions {
  /** Only check specific file types */
  only?: string;
  /** Attempt to fix issues */
  fix?: boolean;
  /** JSON output */
  json?: boolean;
}

/**
 * Lint configuration files
 * @param options - Command options
 */
export function lintCommand(options?: LintCommandOptions): Promise<void>;

/** Uninstall options */
export interface UninstallOptions {
  /** Force removal without confirmation */
  force?: boolean;
  /** Keep configuration file */
  keepConfig?: boolean;
  /** Dry run */
  dryRun?: boolean;
  /** JSON output */
  json?: boolean;
}

/**
 * Uninstall framework from a directory
 * @param options - Command options
 */
export function uninstall(options?: UninstallOptions): Promise<void>;

/** Detect command options */
export interface DetectCommandOptions {
  /** JSON output */
  json?: boolean;
}

/**
 * Detect installed AI coding tools
 * @param options - Command options
 */
export function detectCommand(options?: DetectCommandOptions): Promise<void>;

// ============================================
// Default Export
// ============================================

declare const _default: {
  VERSION: typeof VERSION;
  PRESETS: typeof PRESETS;
  COMMANDS: typeof COMMANDS;
  AGENTS: typeof AGENTS;
  DEFAULT_CONFIG: typeof DEFAULT_CONFIG;
  PRESET_CONFIGS: typeof PRESET_CONFIGS;
  getPresetConfig: typeof getPresetConfig;
  mergeConfig: typeof mergeConfig;
  checkInstallation: typeof checkInstallation;
  listInstalledCommands: typeof listInstalledCommands;
  listInstalledAgents: typeof listInstalledAgents;
  readClaudeMdAsync: typeof readClaudeMdAsync;
  readClaudeMd: typeof readClaudeMd;
  parseClaudeMd: typeof parseClaudeMd;
  validateClaudeMdStructure: typeof validateClaudeMdStructure;
  detectSecrets: typeof detectSecrets;
  checkAbortSignal: typeof checkAbortSignal;
  withAbortSignal: typeof withAbortSignal;
  getPackageRoot: typeof getPackageRoot;
  getPresetPath: typeof getPresetPath;
};

export default _default;
