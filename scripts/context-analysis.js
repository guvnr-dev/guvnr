#!/usr/bin/env node
/**
 * Guvnr - Context Window Analysis
 *
 * Measures and validates context window optimization, token efficiency,
 * and framework overhead to ensure optimal AI assistant performance.
 *
 * Based on research from:
 * - Anthropic Claude Documentation (2025)
 * - Context Engineering Best Practices
 * - https://docs.claude.com/en/docs/build-with-claude/context-windows
 *
 * Usage:
 *   node context-analysis.js                # Run full analysis
 *   node context-analysis.js --json         # Output as JSON
 *   node context-analysis.js --verbose      # Show detailed breakdown
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Configuration based on 2025 best practices
// Source: https://docs.claude.com/en/docs/build-with-claude/context-windows
const CONFIG = {
  // Token estimation: ~4 characters per token (conservative estimate for mixed content)
  CHARS_PER_TOKEN: 4,

  // Context window limits (Claude Sonnet 4 / 4.5 standard)
  MAX_CONTEXT_TOKENS: 200000,

  // CLAUDE.md best practice limits
  // Keep CLAUDE.md under 5000 tokens (~20KB) for optimal loading
  // Source: Context quality over quantity principle
  RECOMMENDED_CLAUDE_MD_TOKENS: 5000,
  MAX_CLAUDE_MD_TOKENS: 10000,

  // Command file limits - keep commands focused and concise
  RECOMMENDED_COMMAND_TOKENS: 1000,
  MAX_COMMAND_TOKENS: 2000,

  // Agent file limits
  RECOMMENDED_AGENT_TOKENS: 1500,
  MAX_AGENT_TOKENS: 3000,

  // Total framework overhead target
  // Framework files should consume <5% of context window
  // This leaves >95% for actual conversation and code
  MAX_FRAMEWORK_PERCENT: 5
};

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Estimate tokens from text content
 * Uses conservative 4 chars/token estimate for mixed markdown/code content
 */
function estimateTokens(text) {
  if (!text) return 0;
  // Conservative estimate: ~4 chars per token
  // This accounts for code, markdown formatting, etc.
  return Math.ceil(text.length / CONFIG.CHARS_PER_TOKEN);
}

/**
 * Analyze a single file
 */
function analyzeFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  const content = readFileSync(filePath, 'utf-8');
  const stats = statSync(filePath);

  return {
    path: filePath,
    name: basename(filePath),
    sizeBytes: stats.size,
    sizeKB: parseFloat((stats.size / 1024).toFixed(2)),
    characters: content.length,
    lines: content.split('\n').length,
    tokens: estimateTokens(content),
    content // Keep for further analysis
  };
}

/**
 * Analyze CLAUDE.md structure and sections
 */
function analyzeClaudeMd(filePath) {
  const analysis = analyzeFile(filePath);
  if (!analysis) {
    return null;
  }

  const content = analysis.content;
  delete analysis.content; // Don't include raw content in output

  // Parse sections
  const sections = {};
  let currentSection = '_preamble';
  let currentContent = [];

  for (const line of content.split('\n')) {
    const h2Match = line.match(/^## (.+)$/);
    if (h2Match) {
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n');
      }
      currentSection = h2Match[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n');
  }

  // Analyze each section
  const totalTokens = analysis.tokens;
  const sectionAnalysis = Object.entries(sections)
    .map(([name, sectionContent]) => {
      const tokens = estimateTokens(sectionContent);
      return {
        name: name === '_preamble' ? '(Title/Preamble)' : name,
        tokens,
        percent: parseFloat(((tokens / totalTokens) * 100).toFixed(1)),
        lines: sectionContent.split('\n').length
      };
    })
    .sort((a, b) => b.tokens - a.tokens);

  // Check for TL;DR (best practice for long documents)
  const hasTldr =
    content.toLowerCase().includes('## tl;dr') ||
    content.toLowerCase().includes('## tldr') ||
    content.toLowerCase().includes('## summary');

  return {
    ...analysis,
    sectionCount: Object.keys(sections).length,
    sections: sectionAnalysis,
    hasTldr,
    withinRecommended: totalTokens <= CONFIG.RECOMMENDED_CLAUDE_MD_TOKENS,
    withinMax: totalTokens <= CONFIG.MAX_CLAUDE_MD_TOKENS,
    recommendation: `<${CONFIG.RECOMMENDED_CLAUDE_MD_TOKENS.toLocaleString()} tokens`
  };
}

/**
 * Analyze all command files
 */
function analyzeCommands(commandsDir) {
  if (!existsSync(commandsDir)) {
    return null;
  }

  const files = readdirSync(commandsDir).filter(f => f.endsWith('.md'));
  const results = [];
  let totalTokens = 0;

  for (const file of files) {
    const analysis = analyzeFile(join(commandsDir, file));
    if (analysis) {
      delete analysis.content;
      analysis.withinRecommended = analysis.tokens <= CONFIG.RECOMMENDED_COMMAND_TOKENS;
      analysis.withinMax = analysis.tokens <= CONFIG.MAX_COMMAND_TOKENS;
      results.push(analysis);
      totalTokens += analysis.tokens;
    }
  }

  return {
    fileCount: results.length,
    totalTokens,
    avgTokensPerCommand: results.length > 0 ? Math.round(totalTokens / results.length) : 0,
    files: results.sort((a, b) => b.tokens - a.tokens),
    recommendation: `<${CONFIG.RECOMMENDED_COMMAND_TOKENS.toLocaleString()} tokens each`
  };
}

/**
 * Analyze all agent files
 */
function analyzeAgents(agentsDir) {
  if (!existsSync(agentsDir)) {
    return null;
  }

  const files = readdirSync(agentsDir).filter(f => f.endsWith('.md'));
  const results = [];
  let totalTokens = 0;

  for (const file of files) {
    const analysis = analyzeFile(join(agentsDir, file));
    if (analysis) {
      delete analysis.content;
      analysis.withinRecommended = analysis.tokens <= CONFIG.RECOMMENDED_AGENT_TOKENS;
      analysis.withinMax = analysis.tokens <= CONFIG.MAX_AGENT_TOKENS;
      results.push(analysis);
      totalTokens += analysis.tokens;
    }
  }

  return {
    fileCount: results.length,
    totalTokens,
    avgTokensPerAgent: results.length > 0 ? Math.round(totalTokens / results.length) : 0,
    files: results.sort((a, b) => b.tokens - a.tokens),
    recommendation: `<${CONFIG.RECOMMENDED_AGENT_TOKENS.toLocaleString()} tokens each`
  };
}

/**
 * Calculate total framework context overhead
 */
function calculateOverhead(claudeMd, commands, agents) {
  let total = 0;
  const breakdown = {};

  if (claudeMd) {
    total += claudeMd.tokens;
    breakdown.claudeMd = claudeMd.tokens;
  }
  if (commands) {
    total += commands.totalTokens;
    breakdown.commands = commands.totalTokens;
  }
  if (agents) {
    total += agents.totalTokens;
    breakdown.agents = agents.totalTokens;
  }

  const percentOfContext = parseFloat(((total / CONFIG.MAX_CONTEXT_TOKENS) * 100).toFixed(2));
  const remainingTokens = CONFIG.MAX_CONTEXT_TOKENS - total;

  return {
    totalTokens: total,
    breakdown,
    contextWindow: CONFIG.MAX_CONTEXT_TOKENS,
    percentOfContext,
    remainingTokens,
    remainingPercent: parseFloat((100 - percentOfContext).toFixed(2)),
    withinTarget: percentOfContext <= CONFIG.MAX_FRAMEWORK_PERCENT,
    target: `<${CONFIG.MAX_FRAMEWORK_PERCENT}%`
  };
}

/**
 * Generate optimization suggestions based on analysis
 */
function generateSuggestions(claudeMd, commands, agents, overhead) {
  const suggestions = [];

  // CLAUDE.md suggestions
  if (claudeMd) {
    if (!claudeMd.withinRecommended) {
      suggestions.push({
        severity: claudeMd.withinMax ? 'warning' : 'error',
        category: 'CLAUDE.md',
        message: `CLAUDE.md is ${claudeMd.tokens.toLocaleString()} tokens (recommended: <${CONFIG.RECOMMENDED_CLAUDE_MD_TOKENS.toLocaleString()})`,
        suggestion:
          'Consider moving verbose sections to separate docs and linking them. Add a TL;DR section summarizing key points.'
      });
    }

    if (!claudeMd.hasTldr && claudeMd.tokens > 2000) {
      suggestions.push({
        severity: 'info',
        category: 'CLAUDE.md',
        message: 'No TL;DR section found in CLAUDE.md',
        suggestion:
          'Adding a TL;DR section helps AI assistants quickly understand project context without processing the full document.'
      });
    }

    // Identify large sections
    const largeSections = claudeMd.sections.filter(s => s.tokens > 800);
    if (largeSections.length > 0) {
      suggestions.push({
        severity: 'info',
        category: 'CLAUDE.md',
        message: `Largest sections: ${largeSections
          .slice(0, 3)
          .map(s => `${s.name} (${s.tokens} tokens)`)
          .join(', ')}`,
        suggestion:
          'Review these sections for potential condensation or extraction to separate files.'
      });
    }
  }

  // Command suggestions
  if (commands) {
    const largeCommands = commands.files.filter(f => !f.withinRecommended);
    if (largeCommands.length > 0) {
      suggestions.push({
        severity: 'warning',
        category: 'Commands',
        message: `${largeCommands.length} command(s) exceed recommended token limit (${CONFIG.RECOMMENDED_COMMAND_TOKENS})`,
        suggestion: `Large commands: ${largeCommands.map(c => `${c.name} (${c.tokens})`).join(', ')}. Consider splitting into sub-commands or removing verbose examples.`
      });
    }
  }

  // Agent suggestions
  if (agents) {
    const largeAgents = agents.files.filter(f => !f.withinRecommended);
    if (largeAgents.length > 0) {
      suggestions.push({
        severity: 'warning',
        category: 'Agents',
        message: `${largeAgents.length} agent(s) exceed recommended token limit (${CONFIG.RECOMMENDED_AGENT_TOKENS})`,
        suggestion: `Large agents: ${largeAgents.map(a => `${a.name} (${a.tokens})`).join(', ')}`
      });
    }
  }

  // Overhead suggestions
  if (overhead && !overhead.withinTarget) {
    suggestions.push({
      severity: 'error',
      category: 'Overhead',
      message: `Framework overhead is ${overhead.percentOfContext}% of context window (target: <${CONFIG.MAX_FRAMEWORK_PERCENT}%)`,
      suggestion: `This leaves only ${overhead.remainingPercent}% for conversation. Reduce verbosity to improve context efficiency.`
    });
  }

  // Add success message if no issues
  if (suggestions.length === 0) {
    suggestions.push({
      severity: 'success',
      category: 'Overall',
      message: 'Context optimization is within best practice guidelines',
      suggestion: `Framework uses ${overhead?.percentOfContext || 0}% of context, leaving ${overhead?.remainingPercent || 100}% for conversation.`
    });
  }

  return suggestions;
}

/**
 * Print results to console
 */
function printResults(results, verbose = false) {
  const { claudeMd, commands, agents, overhead, suggestions, timestamp } = results;

  console.log('');
  console.log(
    `${colors.bold}${colors.blue}Guvnr - Context Window Analysis${colors.reset}`
  );
  console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);
  console.log(`${colors.dim}Analyzed: ${timestamp}${colors.reset}`);
  console.log('');

  // Context Budget Summary
  console.log(`${colors.cyan}${colors.bold}Context Budget${colors.reset}`);
  console.log(`  Total Context Window: ${CONFIG.MAX_CONTEXT_TOKENS.toLocaleString()} tokens`);
  if (overhead) {
    const statusIcon = overhead.withinTarget
      ? `${colors.green}✓${colors.reset}`
      : `${colors.red}✗${colors.reset}`;
    console.log(
      `  Framework Overhead:   ${overhead.totalTokens.toLocaleString()} tokens (${overhead.percentOfContext}%) ${statusIcon}`
    );
    console.log(
      `  Available for Chat:   ${overhead.remainingTokens.toLocaleString()} tokens (${overhead.remainingPercent}%)`
    );
    console.log(`  Target: ${overhead.target}`);
  }
  console.log('');

  // CLAUDE.md Analysis
  console.log(`${colors.cyan}${colors.bold}CLAUDE.md${colors.reset}`);
  if (claudeMd) {
    const statusIcon = claudeMd.withinRecommended
      ? `${colors.green}✓${colors.reset}`
      : claudeMd.withinMax
        ? `${colors.yellow}⚠${colors.reset}`
        : `${colors.red}✗${colors.reset}`;

    console.log(`  Tokens: ${claudeMd.tokens.toLocaleString()} ${statusIcon}`);
    console.log(`  Size: ${claudeMd.sizeKB} KB (${claudeMd.lines} lines)`);
    console.log(`  Sections: ${claudeMd.sectionCount}`);
    console.log(
      `  Has TL;DR: ${claudeMd.hasTldr ? `${colors.green}Yes${colors.reset}` : `${colors.dim}No${colors.reset}`}`
    );
    console.log(`  Recommendation: ${claudeMd.recommendation}`);

    if (verbose && claudeMd.sections.length > 0) {
      console.log(`  ${colors.dim}Top sections:${colors.reset}`);
      for (const section of claudeMd.sections.slice(0, 5)) {
        console.log(`    - ${section.name}: ${section.tokens} tokens (${section.percent}%)`);
      }
    }
  } else {
    console.log(`  ${colors.yellow}Not found${colors.reset}`);
  }
  console.log('');

  // Commands Analysis
  console.log(`${colors.cyan}${colors.bold}Commands${colors.reset}`);
  if (commands) {
    console.log(`  Count: ${commands.fileCount}`);
    console.log(`  Total Tokens: ${commands.totalTokens.toLocaleString()}`);
    console.log(`  Avg per Command: ${commands.avgTokensPerCommand.toLocaleString()}`);
    console.log(`  Recommendation: ${commands.recommendation}`);

    if (verbose && commands.files.length > 0) {
      console.log(`  ${colors.dim}Files:${colors.reset}`);
      for (const file of commands.files) {
        const icon = file.withinRecommended
          ? `${colors.green}✓${colors.reset}`
          : `${colors.yellow}⚠${colors.reset}`;
        console.log(`    ${icon} ${file.name}: ${file.tokens} tokens`);
      }
    }
  } else {
    console.log(`  ${colors.yellow}Not found${colors.reset}`);
  }
  console.log('');

  // Agents Analysis
  console.log(`${colors.cyan}${colors.bold}Agents${colors.reset}`);
  if (agents) {
    console.log(`  Count: ${agents.fileCount}`);
    console.log(`  Total Tokens: ${agents.totalTokens.toLocaleString()}`);
    console.log(`  Avg per Agent: ${agents.avgTokensPerAgent.toLocaleString()}`);
    console.log(`  Recommendation: ${agents.recommendation}`);

    if (verbose && agents.files.length > 0) {
      console.log(`  ${colors.dim}Files:${colors.reset}`);
      for (const file of agents.files) {
        const icon = file.withinRecommended
          ? `${colors.green}✓${colors.reset}`
          : `${colors.yellow}⚠${colors.reset}`;
        console.log(`    ${icon} ${file.name}: ${file.tokens} tokens`);
      }
    }
  } else {
    console.log(`  ${colors.yellow}Not found${colors.reset}`);
  }
  console.log('');

  // Suggestions
  console.log(`${colors.cyan}${colors.bold}Recommendations${colors.reset}`);
  for (const suggestion of suggestions) {
    const icon =
      suggestion.severity === 'success'
        ? `${colors.green}✓`
        : suggestion.severity === 'error'
          ? `${colors.red}✗`
          : suggestion.severity === 'warning'
            ? `${colors.yellow}⚠`
            : `${colors.blue}ℹ`;

    console.log(`  ${icon} [${suggestion.category}] ${suggestion.message}${colors.reset}`);
    if (suggestion.suggestion && suggestion.severity !== 'success') {
      console.log(`    ${colors.dim}→ ${suggestion.suggestion}${colors.reset}`);
    }
  }
  console.log('');

  // Summary
  const hasErrors = suggestions.some(s => s.severity === 'error');
  const hasWarnings = suggestions.some(s => s.severity === 'warning');
  console.log(`${colors.dim}${'─'.repeat(60)}${colors.reset}`);

  if (!hasErrors && !hasWarnings) {
    console.log(`${colors.green}${colors.bold}✓ Context Optimization: EXCELLENT${colors.reset}`);
  } else if (!hasErrors) {
    console.log(
      `${colors.yellow}${colors.bold}⚠ Context Optimization: GOOD (minor improvements possible)${colors.reset}`
    );
  } else {
    console.log(
      `${colors.red}${colors.bold}✗ Context Optimization: NEEDS ATTENTION${colors.reset}`
    );
  }
  console.log('');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes('--json');
  const verbose = args.includes('--verbose') || args.includes('-v');

  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: node context-analysis.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --json      Output results as JSON');
    console.log('  --verbose   Show detailed breakdown of all files');
    console.log('  --help      Show this help message');
    console.log('');
    console.log('Configuration (based on 2025 best practices):');
    console.log(`  Max context window: ${CONFIG.MAX_CONTEXT_TOKENS.toLocaleString()} tokens`);
    console.log(
      `  CLAUDE.md limit: ${CONFIG.RECOMMENDED_CLAUDE_MD_TOKENS.toLocaleString()} tokens (recommended)`
    );
    console.log(
      `  Command limit: ${CONFIG.RECOMMENDED_COMMAND_TOKENS.toLocaleString()} tokens each`
    );
    console.log(`  Framework overhead target: <${CONFIG.MAX_FRAMEWORK_PERCENT}%`);
    process.exit(0);
  }

  // Analyze files
  const claudeMdPath = join(PROJECT_ROOT, 'CLAUDE.md');
  const commandsPath = join(PROJECT_ROOT, '.claude', 'commands');
  const agentsPath = join(PROJECT_ROOT, '.claude', 'agents');

  const claudeMd = analyzeClaudeMd(claudeMdPath);
  const commands = analyzeCommands(commandsPath);
  const agents = analyzeAgents(agentsPath);
  const overhead = calculateOverhead(claudeMd, commands, agents);
  const suggestions = generateSuggestions(claudeMd, commands, agents, overhead);

  const results = {
    timestamp: new Date().toISOString(),
    config: CONFIG,
    claudeMd,
    commands,
    agents,
    overhead,
    suggestions
  };

  if (jsonOutput) {
    console.log(JSON.stringify(results, null, 2));
  } else {
    printResults(results, verbose);
  }

  // Exit with error if critical issues found
  const hasErrors = suggestions.some(s => s.severity === 'error');
  process.exit(hasErrors ? 1 : 0);
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
