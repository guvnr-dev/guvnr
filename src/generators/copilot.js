/**
 * GitHub Copilot Instructions Generator
 * @see https://docs.github.com/copilot/customizing-copilot
 */

import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getProjectName } from './base.js';

/**
 * Generate GitHub Copilot instructions
 * @param {string} cwd - Current working directory
 * @param {object|null} context - Project context
 * @param {object} options - Generation options
 * @param {object} results - Results object
 */
export async function generateCopilotInstructions(cwd, context, options, results) {
  const githubDir = join(cwd, '.github');
  const targetPath = join(githubDir, 'copilot-instructions.md');

  if (!options.dryRun) {
    mkdirSync(githubDir, { recursive: true });
  }

  if (existsSync(targetPath) && !options.force) {
    results.skipped.push('.github/copilot-instructions.md (exists)');
    return;
  }

  const content = generateCopilotContent(context);

  if (!options.dryRun) {
    writeFileSync(targetPath, content);
  }
  results.created.push('.github/copilot-instructions.md');
}

/**
 * Generate Copilot instructions content
 * @param {object|null} context - Project context
 * @returns {string} Generated content
 */
export function generateCopilotContent(context) {
  const projectName = getProjectName(context);

  return `# GitHub Copilot Instructions for ${projectName}

## Project Context

${context?.overview || 'This project uses the AI Excellence Framework for AI-assisted development.'}

## Tech Stack

${context?.techStack?.map(t => `- **${t.category}**: ${t.value}`).join('\n') || 'See package.json for dependencies.'}

## Code Style

${
  context?.conventions ||
  `- Follow existing patterns in the codebase
- Use consistent naming conventions
- Prefer explicit over implicit
- Write self-documenting code`
}

## Security Requirements

When generating code, always:

${
  context?.securityChecklist?.length > 0
    ? context.securityChecklist.map(item => `- ${item}`).join('\n')
    : `- Validate all user inputs
- Use parameterized queries for database operations
- Never hardcode secrets or credentials
- Sanitize output to prevent XSS
- Verify dependencies exist before suggesting them`
}

## Testing

- Write unit tests for new functions
- Include edge cases in test coverage
- Use descriptive test names

## Commit Messages

Use conventional commit format:
- \`feat:\` for new features
- \`fix:\` for bug fixes
- \`docs:\` for documentation
- \`refactor:\` for code improvements
- \`test:\` for test changes

## Files to Avoid Modifying

- \`.env\` files (contain secrets)
- Lock files (package-lock.json, yarn.lock)
- Generated/compiled files
- Migration files (create new ones instead)
`;
}
