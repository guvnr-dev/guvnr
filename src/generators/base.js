/**
 * AI Excellence Framework - Generator Base Utilities
 *
 * Shared utilities for all generator modules.
 */

import { basename } from 'path';
import chalk from 'chalk';

/**
 * Parse CLAUDE.md into structured project context
 * @param {string} content - Raw CLAUDE.md content
 * @returns {object} Parsed project context
 */
export function parseProjectContext(content) {
  const context = {
    projectName: '',
    overview: '',
    techStack: [],
    architecture: '',
    conventions: '',
    commands: '',
    currentState: '',
    sessionInstructions: '',
    securityChecklist: '',
    raw: content
  };

  // Extract project name from first heading
  const nameMatch = content.match(/^#\s+(?:Project:\s*)?(.+)$/m);
  if (nameMatch) {
    context.projectName = nameMatch[1].trim();
  }

  // Extract sections
  const sections = extractSections(content);

  context.overview = sections.Overview || '';
  context.techStack = extractTechStack(sections['Tech Stack'] || '');
  context.architecture = sections.Architecture || '';
  context.conventions = sections.Conventions || '';
  context.commands = sections['Common Commands'] || '';
  context.currentState = sections['Current State'] || '';
  context.sessionInstructions = sections['Session Instructions'] || '';
  context.securityChecklist = extractSecurityChecklist(content);

  return context;
}

/**
 * Extract sections from markdown
 * @param {string} content - Markdown content
 * @returns {object} Sections keyed by heading
 */
export function extractSections(content) {
  const sections = {};
  const lines = content.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = match[1];
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }

  return sections;
}

/**
 * Extract tech stack as array
 * @param {string} content - Tech stack section content
 * @returns {Array<{category: string, value: string}>} Tech stack items
 */
export function extractTechStack(content) {
  const stack = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const match = line.match(/^-\s*\*?\*?(.+?)\*?\*?:\s*(.+)$/);
    if (match) {
      stack.push({
        category: match[1].trim(),
        value: match[2].trim()
      });
    }
  }

  return stack;
}

/**
 * Extract security checklist items
 * @param {string} content - Full CLAUDE.md content
 * @returns {string[]} Security checklist items
 */
export function extractSecurityChecklist(content) {
  const items = [];
  const checklistMatch = content.match(/### Security Checklist[\s\S]*?((?:\n- \[.\].+)+)/);

  if (checklistMatch) {
    const lines = checklistMatch[1].split('\n');
    for (const line of lines) {
      const itemMatch = line.match(/- \[.\]\s*(.+)/);
      if (itemMatch) {
        items.push(itemMatch[1].trim());
      }
    }
  }

  return items;
}

/**
 * Get project name from context or use directory name as fallback
 * @param {object|null} context - Project context
 * @returns {string} Project name
 */
export function getProjectName(context) {
  return context?.projectName || basename(process.cwd());
}

/**
 * Format tech stack as string
 * @param {object|null} context - Project context
 * @returns {string} Formatted tech stack
 */
export function formatTechStack(context) {
  return context?.techStack?.map(t => `${t.category}: ${t.value}`).join(', ') || 'Not specified';
}

/**
 * Print generation results
 * @param {object} results - Results object with created, skipped, errors arrays
 * @param {boolean} dryRun - Whether this was a dry run
 */
export function printResults(results, dryRun) {
  console.log('');

  if (results.created.length > 0) {
    console.log(
      chalk.green(`  ${dryRun ? 'Would create' : 'Created'} ${results.created.length} files:`)
    );
    results.created.forEach(f => console.log(chalk.gray(`    \u2713 ${f}`)));
  }

  if (results.skipped.length > 0) {
    console.log(chalk.yellow(`\n  Skipped ${results.skipped.length} files:`));
    results.skipped.forEach(f => console.log(chalk.gray(`    - ${f}`)));
  }

  if (results.errors.length > 0) {
    console.log(chalk.red('\n  Errors:'));
    results.errors.forEach(e => console.log(chalk.red(`    \u2717 ${e}`)));
  }

  console.log(chalk.cyan('\n  Multi-tool support enabled!'));
  console.log(
    chalk.gray('  Your project now works with: Claude, Cursor, Copilot, Windsurf, Aider,')
  );
  console.log(
    chalk.gray('  Gemini CLI, Codex CLI, Zed, Amp, Roo, Junie, Cline, Goose, Kiro,')
  );
  console.log(
    chalk.gray('  Continue, Augment, Qodo, OpenCode, Zencoder, Tabnine, Amazon Q,')
  );
  console.log(chalk.gray('  Skills, and Plugins (23 tools total)\n'));
}
