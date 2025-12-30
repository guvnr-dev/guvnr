/**
 * AI Excellence Framework - Update Command
 *
 * Updates framework components to the latest version.
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import fse from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PACKAGE_ROOT = join(__dirname, '..', '..');

/**
 * Components that can be updated
 */
const UPDATABLE_COMPONENTS = [
  {
    id: 'commands',
    name: 'Slash Commands',
    files: [
      { source: '.claude/commands/plan.md', target: '.claude/commands/plan.md' },
      { source: '.claude/commands/verify.md', target: '.claude/commands/verify.md' },
      { source: '.claude/commands/handoff.md', target: '.claude/commands/handoff.md' },
      { source: '.claude/commands/assumptions.md', target: '.claude/commands/assumptions.md' },
      { source: '.claude/commands/review.md', target: '.claude/commands/review.md' },
      { source: '.claude/commands/security-review.md', target: '.claude/commands/security-review.md' }
    ]
  },
  {
    id: 'agents',
    name: 'Subagents',
    files: [
      { source: '.claude/agents/reviewer.md', target: '.claude/agents/reviewer.md' },
      { source: '.claude/agents/explorer.md', target: '.claude/agents/explorer.md' },
      { source: '.claude/agents/tester.md', target: '.claude/agents/tester.md' }
    ]
  },
  {
    id: 'hooks',
    name: 'Hook Scripts',
    files: [
      { source: 'scripts/hooks/verify-deps.sh', target: 'scripts/hooks/verify-deps.sh' },
      { source: 'scripts/hooks/post-edit.sh', target: 'scripts/hooks/post-edit.sh' }
    ]
  },
  {
    id: 'mcp',
    name: 'MCP Server',
    files: [
      { source: 'scripts/mcp/project-memory-server.py', target: 'scripts/mcp/project-memory-server.py' }
    ]
  },
  {
    id: 'pre-commit',
    name: 'Pre-commit Config',
    files: [
      { source: 'templates/.pre-commit-config.yaml', target: '.pre-commit-config.yaml' }
    ]
  }
];

/**
 * Main update command handler
 */
export async function updateCommand(options) {
  const cwd = process.cwd();

  console.log(chalk.cyan('\n  AI Excellence Framework Updater\n'));

  if (options.check) {
    await checkForUpdates(cwd);
    return;
  }

  const spinner = ora('Checking for updates...').start();

  const updates = {
    available: [],
    updated: [],
    skipped: [],
    errors: []
  };

  // Check each component for updates
  for (const component of UPDATABLE_COMPONENTS) {
    for (const file of component.files) {
      const sourcePath = join(PACKAGE_ROOT, file.source);
      const targetPath = join(cwd, file.target);

      if (!existsSync(sourcePath)) {
        continue;
      }

      if (!existsSync(targetPath)) {
        updates.skipped.push({
          file: file.target,
          reason: 'Not installed'
        });
        continue;
      }

      // Compare files
      const sourceContent = readFileSync(sourcePath, 'utf-8');
      const targetContent = readFileSync(targetPath, 'utf-8');

      if (sourceContent !== targetContent) {
        updates.available.push({
          component: component.name,
          file: file.target,
          sourcePath,
          targetPath
        });
      }
    }
  }

  spinner.stop();

  if (updates.available.length === 0) {
    console.log(chalk.green('  ✓ All components are up to date!\n'));
    return;
  }

  console.log(chalk.yellow(`  Found ${updates.available.length} updates available:\n`));
  updates.available.forEach(u => {
    console.log(chalk.gray(`    - ${u.file} (${u.component})`));
  });
  console.log('');

  if (!options.force) {
    console.log(chalk.gray('  Run with --force to apply updates.\n'));
    return;
  }

  // Apply updates
  const updateSpinner = ora('Applying updates...').start();

  for (const update of updates.available) {
    try {
      fse.copySync(update.sourcePath, update.targetPath);
      updates.updated.push(update);
    } catch (error) {
      updates.errors.push({
        file: update.file,
        error: error.message
      });
    }
  }

  updateSpinner.succeed('Updates applied!');

  // Print results
  if (updates.updated.length > 0) {
    console.log(chalk.green(`\n  Updated ${updates.updated.length} files:`));
    updates.updated.forEach(u => {
      console.log(chalk.gray(`    ✓ ${u.file}`));
    });
  }

  if (updates.errors.length > 0) {
    console.log(chalk.red('\n  Errors:'));
    updates.errors.forEach(e => {
      console.log(chalk.red(`    ✗ ${e.file}: ${e.error}`));
    });
  }

  console.log('');
}

/**
 * Check for available updates without applying
 */
async function checkForUpdates(cwd) {
  const spinner = ora('Checking for updates...').start();

  let updatesAvailable = 0;

  for (const component of UPDATABLE_COMPONENTS) {
    for (const file of component.files) {
      const sourcePath = join(PACKAGE_ROOT, file.source);
      const targetPath = join(cwd, file.target);

      if (!existsSync(sourcePath) || !existsSync(targetPath)) {
        continue;
      }

      const sourceContent = readFileSync(sourcePath, 'utf-8');
      const targetContent = readFileSync(targetPath, 'utf-8');

      if (sourceContent !== targetContent) {
        updatesAvailable++;
      }
    }
  }

  spinner.stop();

  if (updatesAvailable === 0) {
    console.log(chalk.green('  ✓ All components are up to date!\n'));
  } else {
    console.log(chalk.yellow(`  ${updatesAvailable} updates available. Run "npx ai-excellence update --force" to apply.\n`));
  }
}
