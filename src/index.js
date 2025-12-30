/**
 * AI Excellence Framework
 *
 * A comprehensive framework for reducing friction in AI-assisted software development.
 *
 * @module ai-excellence-framework
 */

export { initCommand } from './commands/init.js';
export { validateCommand } from './commands/validate.js';
export { updateCommand } from './commands/update.js';
export { doctorCommand } from './commands/doctor.js';

/**
 * Framework version
 */
export const VERSION = '1.0.0';

/**
 * Available presets for initialization
 */
export const PRESETS = ['minimal', 'standard', 'full', 'team'];

/**
 * Default configuration
 */
export const DEFAULT_CONFIG = {
  preset: 'standard',
  commands: ['plan', 'verify', 'handoff', 'assumptions', 'review', 'security-review'],
  agents: ['reviewer', 'explorer', 'tester'],
  hooks: true,
  mcp: false,
  preCommit: true
};
