/**
 * AI Excellence Framework - Validate Command
 *
 * Validates the framework configuration and setup.
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Validation rules and their configurations
 */
const VALIDATION_RULES = [
  {
    id: 'claude-md-exists',
    name: 'CLAUDE.md exists',
    category: 'core',
    check: (cwd) => existsSync(join(cwd, 'CLAUDE.md')),
    fix: null,
    severity: 'error'
  },
  {
    id: 'claude-md-has-overview',
    name: 'CLAUDE.md has Overview section',
    category: 'core',
    check: (cwd) => {
      const path = join(cwd, 'CLAUDE.md');
      if (!existsSync(path)) return false;
      const content = readFileSync(path, 'utf-8');
      return /## Overview/i.test(content);
    },
    severity: 'warning'
  },
  {
    id: 'claude-md-has-tech-stack',
    name: 'CLAUDE.md has Tech Stack section',
    category: 'core',
    check: (cwd) => {
      const path = join(cwd, 'CLAUDE.md');
      if (!existsSync(path)) return false;
      const content = readFileSync(path, 'utf-8');
      return /## Tech Stack/i.test(content);
    },
    severity: 'warning'
  },
  {
    id: 'claude-md-has-current-state',
    name: 'CLAUDE.md has Current State section',
    category: 'core',
    check: (cwd) => {
      const path = join(cwd, 'CLAUDE.md');
      if (!existsSync(path)) return false;
      const content = readFileSync(path, 'utf-8');
      return /## Current State/i.test(content);
    },
    severity: 'warning'
  },
  {
    id: 'commands-dir-exists',
    name: '.claude/commands directory exists',
    category: 'commands',
    check: (cwd) => existsSync(join(cwd, '.claude', 'commands')),
    severity: 'info'
  },
  {
    id: 'plan-command-exists',
    name: '/plan command exists',
    category: 'commands',
    check: (cwd) => existsSync(join(cwd, '.claude', 'commands', 'plan.md')),
    severity: 'warning'
  },
  {
    id: 'verify-command-exists',
    name: '/verify command exists',
    category: 'commands',
    check: (cwd) => existsSync(join(cwd, '.claude', 'commands', 'verify.md')),
    severity: 'warning'
  },
  {
    id: 'pre-commit-config',
    name: 'Pre-commit configuration exists',
    category: 'security',
    check: (cwd) => existsSync(join(cwd, '.pre-commit-config.yaml')),
    severity: 'info'
  },
  {
    id: 'gitignore-has-tmp',
    name: '.gitignore ignores .tmp/',
    category: 'security',
    check: (cwd) => {
      const path = join(cwd, '.gitignore');
      if (!existsSync(path)) return false;
      const content = readFileSync(path, 'utf-8');
      return content.includes('.tmp/') || content.includes('.tmp');
    },
    severity: 'warning'
  },
  {
    id: 'gitignore-has-secrets',
    name: '.gitignore ignores .secrets.baseline',
    category: 'security',
    check: (cwd) => {
      const path = join(cwd, '.gitignore');
      if (!existsSync(path)) return false;
      const content = readFileSync(path, 'utf-8');
      return content.includes('.secrets.baseline');
    },
    severity: 'info'
  },
  {
    id: 'session-notes-dir',
    name: 'Session notes directory exists',
    category: 'workflow',
    check: (cwd) => existsSync(join(cwd, 'docs', 'session-notes')),
    severity: 'info'
  },
  {
    id: 'no-hardcoded-secrets',
    name: 'No obvious hardcoded secrets in CLAUDE.md',
    category: 'security',
    check: (cwd) => {
      const path = join(cwd, 'CLAUDE.md');
      if (!existsSync(path)) return true;
      const content = readFileSync(path, 'utf-8');
      const patterns = [
        /password\s*[:=]\s*["'][^"']{8,}["']/i,
        /api[_-]?key\s*[:=]\s*["'][^"']{16,}["']/i,
        /secret\s*[:=]\s*["'][^"']{8,}["']/i,
        /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/
      ];
      return !patterns.some(p => p.test(content));
    },
    severity: 'error'
  }
];

/**
 * Main validate command handler
 */
export async function validateCommand(options) {
  const cwd = process.cwd();

  console.log(chalk.cyan('\n  AI Excellence Framework Validator\n'));

  const spinner = ora('Running validation checks...').start();

  const results = {
    passed: [],
    warnings: [],
    errors: [],
    info: []
  };

  // Run all validation rules
  for (const rule of VALIDATION_RULES) {
    try {
      const passed = await rule.check(cwd);

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
        }
      }
    } catch (error) {
      results.errors.push({
        ...rule,
        error: error.message
      });
    }
  }

  spinner.stop();

  // Print results
  printValidationResults(results);

  // Return appropriate exit code
  if (results.errors.length > 0) {
    process.exit(1);
  }
}

/**
 * Print validation results
 */
function printValidationResults(results) {
  const total = VALIDATION_RULES.length;
  const passedCount = results.passed.length;

  // Summary
  console.log(chalk.white(`  Validation Results: ${passedCount}/${total} checks passed\n`));

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
    });
    console.log('');
  }

  // Warnings
  if (results.warnings.length > 0) {
    console.log(chalk.yellow('  ⚠ Warnings (should fix):'));
    results.warnings.forEach(r => {
      console.log(chalk.yellow(`    ⚠ ${r.name}`));
    });
    console.log('');
  }

  // Info
  if (results.info.length > 0) {
    console.log(chalk.blue('  ℹ Info (optional):'));
    results.info.forEach(r => {
      console.log(chalk.gray(`    ℹ ${r.name}`));
    });
    console.log('');
  }

  // Overall status
  if (results.errors.length === 0 && results.warnings.length === 0) {
    console.log(chalk.green('  ✓ All critical checks passed!\n'));
  } else if (results.errors.length === 0) {
    console.log(chalk.yellow('  ⚠ Framework is functional but has warnings to address.\n'));
  } else {
    console.log(chalk.red('  ✗ Framework has errors that need to be fixed.\n'));
    console.log(chalk.gray('  Run "npx ai-excellence init" to fix core issues.\n'));
  }
}
