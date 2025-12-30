/**
 * AI Excellence Framework - Doctor Command
 *
 * Diagnoses common issues and verifies system setup.
 */

import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import chalk from 'chalk';
import ora from 'ora';

/**
 * Diagnostic checks to run
 */
const DIAGNOSTICS = [
  {
    id: 'node-version',
    name: 'Node.js version',
    category: 'environment',
    check: async () => {
      const { version } = process;
      const major = parseInt(version.slice(1).split('.')[0], 10);
      return {
        passed: major >= 18,
        value: version,
        required: '>=18.0.0'
      };
    }
  },
  {
    id: 'python-version',
    name: 'Python version',
    category: 'environment',
    check: async () => {
      try {
        const output = execSync('python3 --version', { encoding: 'utf-8' });
        const version = output.trim().split(' ')[1];
        const [major, minor] = version.split('.').map(Number);
        return {
          passed: major >= 3 && minor >= 9,
          value: version,
          required: '>=3.9'
        };
      } catch {
        return {
          passed: false,
          value: 'Not found',
          required: '>=3.9'
        };
      }
    }
  },
  {
    id: 'git-available',
    name: 'Git available',
    category: 'environment',
    check: async () => {
      try {
        const output = execSync('git --version', { encoding: 'utf-8' });
        return {
          passed: true,
          value: output.trim().split(' ').pop()
        };
      } catch {
        return {
          passed: false,
          value: 'Not found'
        };
      }
    }
  },
  {
    id: 'pre-commit-available',
    name: 'pre-commit available',
    category: 'tools',
    check: async () => {
      try {
        const output = execSync('pre-commit --version', { encoding: 'utf-8' });
        return {
          passed: true,
          value: output.trim().split(' ').pop()
        };
      } catch {
        return {
          passed: false,
          value: 'Not installed',
          hint: 'Run: pip install pre-commit'
        };
      }
    }
  },
  {
    id: 'claude-available',
    name: 'Claude CLI available',
    category: 'tools',
    check: async () => {
      try {
        const output = execSync('claude --version', { encoding: 'utf-8' });
        return {
          passed: true,
          value: output.trim()
        };
      } catch {
        return {
          passed: false,
          value: 'Not found',
          hint: 'Install Claude Code from Anthropic'
        };
      }
    }
  },
  {
    id: 'mcp-sdk-available',
    name: 'MCP SDK available',
    category: 'tools',
    check: async () => {
      try {
        execSync('python3 -c "import mcp"', { encoding: 'utf-8' });
        return {
          passed: true,
          value: 'Installed'
        };
      } catch {
        return {
          passed: false,
          value: 'Not installed',
          hint: 'Run: pip install mcp'
        };
      }
    }
  },
  {
    id: 'framework-installed',
    name: 'Framework installed',
    category: 'framework',
    check: async () => {
      const cwd = process.cwd();
      const hasClaudeMd = existsSync(join(cwd, 'CLAUDE.md'));
      const hasCommands = existsSync(join(cwd, '.claude', 'commands'));

      return {
        passed: hasClaudeMd && hasCommands,
        value: hasClaudeMd && hasCommands ? 'Yes' : 'Partial',
        hint: !hasClaudeMd ? 'Run: npx ai-excellence init' : undefined
      };
    }
  },
  {
    id: 'pre-commit-hooks',
    name: 'Pre-commit hooks installed',
    category: 'framework',
    check: async () => {
      const cwd = process.cwd();
      const hookPath = join(cwd, '.git', 'hooks', 'pre-commit');

      if (!existsSync(join(cwd, '.git'))) {
        return {
          passed: false,
          value: 'Not a git repository'
        };
      }

      if (!existsSync(hookPath)) {
        return {
          passed: false,
          value: 'Not installed',
          hint: 'Run: pre-commit install'
        };
      }

      return {
        passed: true,
        value: 'Installed'
      };
    }
  },
  {
    id: 'claude-md-freshness',
    name: 'CLAUDE.md freshness',
    category: 'health',
    check: async () => {
      const cwd = process.cwd();
      const claudeMdPath = join(cwd, 'CLAUDE.md');

      if (!existsSync(claudeMdPath)) {
        return {
          passed: false,
          value: 'Not found'
        };
      }

      const stats = statSync(claudeMdPath);
      const daysSinceModified =
        (Date.now() - stats.mtime) / (1000 * 60 * 60 * 24);

      return {
        passed: daysSinceModified < 7,
        value: `${Math.floor(daysSinceModified)} days old`,
        hint:
          daysSinceModified >= 7
            ? 'Consider updating Current State section'
            : undefined
      };
    }
  },
  {
    id: 'tmp-directory',
    name: '.tmp directory exists',
    category: 'health',
    check: async () => {
      const cwd = process.cwd();
      const tmpPath = join(cwd, '.tmp');

      return {
        passed: existsSync(tmpPath),
        value: existsSync(tmpPath) ? 'Yes' : 'No',
        hint: !existsSync(tmpPath) ? 'Will be created when needed' : undefined
      };
    }
  }
];

/**
 * Main doctor command handler
 */
export async function doctorCommand(options) {
  console.log(chalk.cyan('\n  AI Excellence Framework Doctor\n'));

  const spinner = ora('Running diagnostics...').start();

  const results = {
    environment: [],
    tools: [],
    framework: [],
    health: []
  };

  // Run all diagnostics
  for (const diagnostic of DIAGNOSTICS) {
    try {
      const result = await diagnostic.check();
      results[diagnostic.category].push({
        ...diagnostic,
        result
      });
    } catch (error) {
      results[diagnostic.category].push({
        ...diagnostic,
        result: {
          passed: false,
          value: 'Error',
          error: error.message
        }
      });
    }
  }

  spinner.stop();

  // Print results by category
  printDiagnosticResults(results, options.verbose);

  // Summary
  const totalPassed = Object.values(results)
    .flat()
    .filter(r => r.result.passed).length;
  const total = DIAGNOSTICS.length;

  console.log(
    chalk.white(`\n  Summary: ${totalPassed}/${total} checks passed\n`)
  );

  if (totalPassed === total) {
    console.log(chalk.green('  ✓ All systems operational!\n'));
  } else {
    console.log(chalk.yellow('  ⚠ Some issues detected. See hints above.\n'));
  }
}

/**
 * Print diagnostic results by category
 */
function printDiagnosticResults(results, verbose) {
  const categories = [
    { key: 'environment', name: 'Environment' },
    { key: 'tools', name: 'Tools' },
    { key: 'framework', name: 'Framework' },
    { key: 'health', name: 'Health' }
  ];

  for (const category of categories) {
    const items = results[category.key];
    if (items.length === 0) {
      continue;
    }

    console.log(chalk.white(`  ${category.name}:`));

    for (const item of items) {
      const icon = item.result.passed ? chalk.green('✓') : chalk.red('✗');
      const value = item.result.passed
        ? chalk.green(item.result.value)
        : chalk.yellow(item.result.value);

      console.log(`    ${icon} ${item.name}: ${value}`);

      if (!item.result.passed && item.result.hint && verbose) {
        console.log(chalk.gray(`      └─ ${item.result.hint}`));
      }

      if (!item.result.passed && item.result.hint && !verbose) {
        console.log(chalk.gray(`      Hint: ${item.result.hint}`));
      }

      if (item.result.required && !item.result.passed) {
        console.log(chalk.gray(`      Required: ${item.result.required}`));
      }
    }

    console.log('');
  }
}
