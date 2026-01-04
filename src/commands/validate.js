/**
 * Guvnr - Validate Command
 *
 * Validates the Guvnr configuration and setup with auto-fix capabilities.
 *
 * Performance: Uses async file I/O to avoid blocking the event loop during
 * validation, which is especially important for large configuration files.
 */

import { readFile, writeFile, mkdir, appendFile, access, constants } from 'fs/promises';
import { existsSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import fse from 'fs-extra';
import yaml from 'js-yaml';
import { detectSecrets, checkAbortSignal } from '../index.js';
import { createError } from '../errors.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, '..', '..');

/**
 * Check if a file exists asynchronously
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if file exists
 */
async function fileExists(filePath) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safely read a file, returning null if it doesn't exist
 * @param {string} filePath - Path to read
 * @returns {Promise<string|null>} File contents or null
 */
async function safeReadFile(filePath) {
  try {
    return await readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Validation rules with auto-fix capabilities.
 * All check and fix functions are async for non-blocking I/O.
 */
const VALIDATION_RULES = [
  {
    id: 'guvnr-yaml-exists',
    name: 'guvnr.yaml exists',
    category: 'core',
    check: async cwd => {
      return (await fileExists(join(cwd, 'guvnr.yaml'))) || (await fileExists(join(cwd, 'guvnr.yml')));
    },
    fix: async cwd => {
      const template = `# Guvnr Configuration
version: "1.0"

project:
  name: "${basename(cwd)}"
  description: "Project description"

tech_stack:
  languages:
    - name: "JavaScript"
      version: "ES2022"
  package_manager: "npm"
  test_framework: "jest"

context:
  overview: |
    Brief description of what this project does.
  current_phase: "development"

conventions:
  style:
    - "Use consistent indentation (2 spaces)"
  naming:
    - "camelCase for variables and functions"
  commit_format: conventional

security:
  rules:
    - "Never commit secrets or API keys"
    - "Validate all user input"

tools:
  generate:
    - claude
    - cursor
    - copilot
`;
      await writeFile(join(cwd, 'guvnr.yaml'), template);
      return true;
    },
    severity: 'error'
  },
  {
    id: 'guvnr-yaml-valid',
    name: 'guvnr.yaml is valid YAML',
    category: 'core',
    check: async cwd => {
      const yamlPath = (await fileExists(join(cwd, 'guvnr.yaml')))
        ? join(cwd, 'guvnr.yaml')
        : join(cwd, 'guvnr.yml');
      const content = await safeReadFile(yamlPath);
      if (content === null) return true; // Skip if no file
      try {
        yaml.load(content);
        return true;
      } catch {
        return false;
      }
    },
    fix: null, // Cannot auto-fix YAML syntax errors
    severity: 'error'
  },
  {
    id: 'guvnr-yaml-has-project',
    name: 'guvnr.yaml has project section',
    category: 'core',
    check: async cwd => {
      const yamlPath = (await fileExists(join(cwd, 'guvnr.yaml')))
        ? join(cwd, 'guvnr.yaml')
        : join(cwd, 'guvnr.yml');
      const content = await safeReadFile(yamlPath);
      if (content === null) return true; // Skip if no file
      try {
        const config = yaml.load(content);
        return config && config.project && config.project.name;
      } catch {
        return false;
      }
    },
    fix: null,
    severity: 'warning'
  },
  {
    id: 'guvnr-yaml-has-version',
    name: 'guvnr.yaml has version field',
    category: 'core',
    check: async cwd => {
      const yamlPath = (await fileExists(join(cwd, 'guvnr.yaml')))
        ? join(cwd, 'guvnr.yaml')
        : join(cwd, 'guvnr.yml');
      const content = await safeReadFile(yamlPath);
      if (content === null) return true; // Skip if no file
      try {
        const config = yaml.load(content);
        return config && config.version;
      } catch {
        return false;
      }
    },
    fix: null,
    severity: 'warning'
  },
  {
    id: 'commands-dir-exists',
    name: '.claude/commands directory exists',
    category: 'commands',
    check: async cwd => fileExists(join(cwd, '.claude', 'commands')),
    fix: async cwd => {
      await mkdir(join(cwd, '.claude', 'commands'), { recursive: true });
      return true;
    },
    severity: 'info'
  },
  {
    id: 'plan-command-exists',
    name: '/plan command exists',
    category: 'commands',
    check: async cwd => fileExists(join(cwd, '.claude', 'commands', 'plan.md')),
    fix: async cwd => {
      const source = join(PACKAGE_ROOT, '.claude', 'commands', 'plan.md');
      const target = join(cwd, '.claude', 'commands', 'plan.md');
      if (existsSync(source)) {
        await mkdir(dirname(target), { recursive: true });
        await fse.copy(source, target);
        return true;
      }
      return false;
    },
    severity: 'warning'
  },
  {
    id: 'verify-command-exists',
    name: '/verify command exists',
    category: 'commands',
    check: async cwd => fileExists(join(cwd, '.claude', 'commands', 'verify.md')),
    fix: async cwd => {
      const source = join(PACKAGE_ROOT, '.claude', 'commands', 'verify.md');
      const target = join(cwd, '.claude', 'commands', 'verify.md');
      if (existsSync(source)) {
        await mkdir(dirname(target), { recursive: true });
        await fse.copy(source, target);
        return true;
      }
      return false;
    },
    severity: 'warning'
  },
  {
    id: 'pre-commit-config',
    name: 'Pre-commit configuration exists',
    category: 'security',
    check: async cwd => fileExists(join(cwd, '.pre-commit-config.yaml')),
    fix: async cwd => {
      const source = join(PACKAGE_ROOT, 'templates', '.pre-commit-config.yaml');
      const target = join(cwd, '.pre-commit-config.yaml');
      if (existsSync(source)) {
        await fse.copy(source, target);
        return true;
      }
      // Create a basic pre-commit config
      const config = `repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-yaml
      - id: check-json
      - id: check-added-large-files
        args: ['--maxkb=1000']
      - id: detect-private-key
      - id: check-merge-conflict
`;
      await writeFile(target, config);
      return true;
    },
    severity: 'info'
  },
  {
    id: 'gitignore-exists',
    name: '.gitignore exists',
    category: 'security',
    check: async cwd => fileExists(join(cwd, '.gitignore')),
    fix: async cwd => {
      const content = `# Guvnr - AI Tool Configs
guvnr.local.yaml
.guvnr/
.tmp/
.secrets.baseline

# Dependencies
node_modules/

# Build
dist/
build/

# Environment
.env
.env.local
*.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`;
      await writeFile(join(cwd, '.gitignore'), content);
      return true;
    },
    severity: 'warning'
  },
  {
    id: 'gitignore-has-tmp',
    name: '.gitignore ignores .tmp/',
    category: 'security',
    check: async cwd => {
      const content = await safeReadFile(join(cwd, '.gitignore'));
      return content !== null && (content.includes('.tmp/') || content.includes('.tmp'));
    },
    fix: async cwd => {
      const path = join(cwd, '.gitignore');
      if (!(await fileExists(path))) {
        return false;
      }
      await appendFile(path, '\n# Guvnr temp files\n.tmp/\n');
      return true;
    },
    severity: 'warning'
  },
  {
    id: 'gitignore-has-secrets',
    name: '.gitignore ignores .secrets.baseline',
    category: 'security',
    check: async cwd => {
      const content = await safeReadFile(join(cwd, '.gitignore'));
      return content !== null && content.includes('.secrets.baseline');
    },
    fix: async cwd => {
      const path = join(cwd, '.gitignore');
      if (!(await fileExists(path))) {
        return false;
      }
      await appendFile(path, '\n.secrets.baseline\n');
      return true;
    },
    severity: 'info'
  },
  {
    id: 'session-notes-dir',
    name: 'Session notes directory exists',
    category: 'workflow',
    check: async cwd => fileExists(join(cwd, 'docs', 'session-notes')),
    fix: async cwd => {
      await mkdir(join(cwd, 'docs', 'session-notes'), { recursive: true });
      await writeFile(join(cwd, 'docs', 'session-notes', '.gitkeep'), '');
      return true;
    },
    severity: 'info'
  },
  {
    id: 'tmp-dir-exists',
    name: '.tmp directory exists',
    category: 'workflow',
    check: async cwd => fileExists(join(cwd, '.tmp')),
    fix: async cwd => {
      await mkdir(join(cwd, '.tmp'), { recursive: true });
      await writeFile(join(cwd, '.tmp', '.gitkeep'), '');
      return true;
    },
    severity: 'info'
  },
  {
    id: 'no-hardcoded-secrets',
    name: 'No obvious hardcoded secrets in CLAUDE.md',
    category: 'security',
    check: async cwd => {
      const content = await safeReadFile(join(cwd, 'CLAUDE.md'));
      if (content === null) {
        return true;
      }
      // Use comprehensive detectSecrets from index.js for consistency
      const result = detectSecrets(content);
      return result.clean;
    },
    fix: null, // Cannot auto-fix secrets - requires manual intervention
    severity: 'error'
  },
  {
    id: 'agents-dir-exists',
    name: '.claude/agents directory exists',
    category: 'agents',
    check: async cwd => fileExists(join(cwd, '.claude', 'agents')),
    fix: async cwd => {
      await mkdir(join(cwd, '.claude', 'agents'), { recursive: true });
      return true;
    },
    severity: 'info'
  }
];

/**
 * Main validate command handler
 *
 * @param {object} options - Command options
 * @param {boolean} [options.fix=false] - Automatically fix issues where possible
 * @param {boolean} [options.json=false] - Output results as JSON
 * @param {AbortSignal} [options._abortSignal] - Signal for cancellation support
 * @returns {Promise<void>} Resolves when validation is complete
 * @throws {FrameworkError} If validation fails with errors
 * @throws {Error} If aborted via signal
 */
export async function validateCommand(options) {
  const cwd = process.cwd();
  const autoFix = options.fix || false;
  const json = options.json || false;
  const signal = options._abortSignal;

  if (!json) {
    console.log(chalk.cyan('\n  Guvnr - Configuration Validator\n'));

    if (autoFix) {
      console.log(chalk.yellow('  Auto-fix mode enabled\n'));
    }
  }

  const spinner = json ? null : ora('Running validation checks...').start();

  const results = {
    passed: [],
    warnings: [],
    errors: [],
    info: [],
    fixed: []
  };

  // Run all validation rules
  for (const rule of VALIDATION_RULES) {
    // Check for abort signal between each rule (cooperative cancellation)
    checkAbortSignal(signal, 'Validation');

    try {
      let passed = await rule.check(cwd);

      if (!passed && autoFix && rule.fix) {
        if (spinner) {
          spinner.text = `Fixing: ${rule.name}...`;
        }
        try {
          const fixed = await rule.fix(cwd);
          if (fixed) {
            passed = await rule.check(cwd);
            if (passed) {
              results.fixed.push(rule);
            }
          }
        } catch (fixError) {
          // Log fix failure for debugging, continue with original result
          if (process.env.DEBUG || process.env.VERBOSE) {
            console.error(`  Auto-fix failed for ${rule.id}: ${fixError.message}`);
          }
        }
      }

      if (passed) {
        results.passed.push(rule);
      } else {
        switch (rule.severity) {
          case 'error':
            results.errors.push(rule);
            break;
          case 'warning':
            results.warnings.push(rule);
            break;
          case 'info':
            results.info.push(rule);
            break;
          default:
            // Unknown severity, treat as warning
            results.warnings.push(rule);
        }
      }
    } catch (error) {
      results.errors.push({
        ...rule,
        error: error.message
      });
    }
  }

  if (spinner) {
    spinner.stop();
  }

  // JSON output
  if (json) {
    const jsonOutput = {
      valid: results.errors.length === 0,
      passed: results.passed.length,
      total: VALIDATION_RULES.length,
      errors: results.errors.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        fixable: !!r.fix
      })),
      warnings: results.warnings.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        fixable: !!r.fix
      })),
      info: results.info.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category,
        fixable: !!r.fix
      })),
      fixed: results.fixed.map(r => ({ id: r.id, name: r.name, category: r.category }))
    };
    console.log(JSON.stringify(jsonOutput, null, 2));
    if (results.errors.length > 0) {
      throw createError(
        'GUVNR-VALID-200',
        `Validation failed with ${results.errors.length} error(s)`
      );
    }
    return;
  }

  // Print results
  printValidationResults(results, autoFix);

  // Throw error if validation failed (CLI will handle exit code)
  if (results.errors.length > 0) {
    throw createError('GUVNR-VALID-200', `Validation failed with ${results.errors.length} error(s)`);
  }
}

/**
 * Print validation results
 */
function printValidationResults(results, autoFix) {
  const total = VALIDATION_RULES.length;
  const passedCount = results.passed.length;

  // Summary
  console.log(chalk.white(`  Validation Results: ${passedCount}/${total} checks passed\n`));

  // Fixed (if any)
  if (results.fixed.length > 0) {
    console.log(chalk.green('  🔧 Auto-fixed:'));
    results.fixed.forEach(r => {
      console.log(chalk.green(`    ✓ ${r.name}`));
    });
    console.log('');
  }

  // Passed
  if (results.passed.length > 0) {
    console.log(chalk.green('  ✓ Passed:'));
    results.passed.forEach(r => {
      console.log(chalk.gray(`    ✓ ${r.name}`));
    });
    console.log('');
  }

  // Errors
  if (results.errors.length > 0) {
    console.log(chalk.red('  ✗ Errors (must fix):'));
    results.errors.forEach(r => {
      console.log(chalk.red(`    ✗ ${r.name}`));
      if (r.error) {
        console.log(chalk.gray(`      Error: ${r.error}`));
      }
      if (r.fix && !autoFix) {
        console.log(chalk.gray('      Run with --fix to auto-repair'));
      }
    });
    console.log('');
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log(chalk.yellow('  ⚠ Warnings (should fix):'));
    results.warnings.forEach(r => {
      console.log(chalk.yellow(`    ⚠ ${r.name}`));
      if (r.fix && !autoFix) {
        console.log(chalk.gray('      Run with --fix to auto-repair'));
      }
    });
    console.log('');
  }

  // Info
  if (results.info.length > 0) {
    console.log(chalk.blue('  ℹ Info (optional):'));
    results.info.forEach(r => {
      console.log(chalk.gray(`    ℹ ${r.name}`));
      if (r.fix && !autoFix) {
        console.log(chalk.gray('      Run with --fix to auto-repair'));
      }
    });
    console.log('');
  }

  // Overall status
  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log(chalk.green('  ✓ All critical checks passed!\n'));
  } else if (results.errors.length === 0) {
    console.log(chalk.yellow('  ⚠ Configuration is functional but has warnings to address.\n'));
    if (!autoFix) {
      console.log(chalk.gray('  Run "guvnr validate --fix" to auto-fix issues.\n'));
    }
  } else {
    console.log(chalk.red('  ✗ Configuration has errors that need to be fixed.\n'));
    if (!autoFix) {
      console.log(chalk.gray('  Run "guvnr validate --fix" to auto-fix issues.\n'));
      console.log(chalk.gray('  Or run "guvnr init" to reinitialize.\n'));
    }
  }
}
