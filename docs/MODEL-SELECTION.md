# Model Selection Guide

Choosing the right AI model for different coding tasks maximizes quality while minimizing cost and latency. This guide covers models from all major providers supported by the framework.

## TL;DR - Quick Recommendations

| Task Type | Best Choice | Alternative |
| --- | --- | --- |
| Daily coding, bug fixes | Claude Sonnet 4.5 | GPT-5-Codex |
| Quick scaffolding, small fixes | Claude Haiku 4.5 | Gemini 2.5 Flash |
| Complex architecture, deep review | Claude Opus 4.5 | GPT-5.1-Codex-Max |
| Large codebase analysis | Gemini 2.5 Pro | Claude Opus 4.5 |
| Cost-optimized batch processing | Gemini 2.5 Flash | Claude Haiku 4.5 |
| Final review before merge | Claude Opus 4.5 | GPT-5.2-Codex |

---

## Benchmark Comparison (December 2025)

### SWE-Bench Verified Rankings

The industry-standard benchmark for real-world coding tasks:

| Model | Score | Notes |
| --- | --- | --- |
| Claude Sonnet 4.5 | 82.0% | Current leader |
| Claude Opus 4.5 | 80.9% | Extended reasoning |
| GPT-5.2-Codex | 80.0% | OpenAI's latest |
| GPT-5.1-Codex-Max | 76.3% | Best efficiency |
| Gemini 3 Pro | 76.2% | 1M token context |
| Grok 4.1 | 74.9% | X.AI offering |

### Context Window Comparison

| Model | Context Window | Best For |
| --- | --- | --- |
| Gemini 2.5 Pro | 1,000,000 tokens | Entire codebase analysis |
| Claude Opus 4.5 | 200,000 tokens | Large file analysis |
| GPT-5-Codex | 128,000 tokens | Standard projects |
| Claude Sonnet 4.5 | 200,000 tokens | Daily development |

---

## Claude Models (Anthropic)

### Claude Haiku 4.5 — The Speed Demon

**Best for:**

- Quick iterations and rapid feedback
- UI scaffolding and boilerplate generation
- Simple bug fixes
- Chat assistants and worker agents
- High-frequency, low-complexity tasks

**Characteristics:**

- Fastest response time (~2x faster than Sonnet)
- 90% of Sonnet's coding capability
- 3x more cost-effective than Sonnet
- Ideal for multi-agent systems where speed matters

**When to use in this framework:**

- Running parallel exploration tasks
- Quick `/plan` iterations
- Simple validation checks
- Subagent worker tasks

**API Pricing:** $1/$5 per million tokens (input/output)

---

### Claude Sonnet 4.5 — The All-Rounder

**Best for:**

- Daily coding tasks
- Writing and refactoring code
- Bug fixes and debugging
- Writing tests and documentation
- Code reviews and explanations
- Managing state and connecting APIs

**Characteristics:**

- Best balance of intelligence, speed, and cost
- #1 on SWE-Bench Verified (82%)
- Reliable and consistent
- Handles multiple files well
- Doesn't freeze on complex contexts

**When to use in this framework:**

- Default for most `/plan` and `/verify` operations
- Code generation and refactoring
- Most subagent tasks (reviewer, tester)
- Session work and implementation

**API Pricing:** $3/$15 per million tokens (input/output)

---

### Claude Opus 4.5 — The Deep Thinker

**Best for:**

- Complex architectural decisions
- Large-scale refactoring across many files
- Final pre-merge reviews
- Catching async bugs, memory leaks, subtle logic errors
- Full codebase analysis
- Enterprise R&D and research tasks

**Characteristics:**

- Highest capability, most thorough
- Extended reasoning capability
- Outperforms human candidates on coding assessments
- Catches issues other models miss
- Slower but worth it for high-stakes work

**When to use in this framework:**

- `/security-review` on critical code
- Final `/verify` before major releases
- Complex `/refactor` operations
- Architecture design decisions

**API Pricing:** $15/$75 per million tokens (input/output)

---

## OpenAI Models

### GPT-5-Codex — Optimized for Agentic Coding

**Best for:**

- Terminal-based coding workflows
- GitHub integration
- IDE extension usage
- Agentic coding tasks

**Characteristics:**

- Purpose-built for Codex CLI and IDE extensions
- Optimized for agentic coding patterns
- Default model on macOS/Linux

**Configuration:**

```bash
# Set in ~/.codex/config.toml
model = "gpt-5-codex"

# Or specify at runtime
codex -m gpt-5-codex
```

**Codex CLI Pricing:** Included with ChatGPT Pro subscription

---

### GPT-5-Codex-Mini — Cost-Effective Option

**Best for:**

- High-volume, simpler tasks
- Budget-conscious development
- Quick iterations

**Characteristics:**

- ~4x more usage per subscription
- Less capable but much cheaper
- Good for scaffolding and simple fixes

**Configuration:**

```bash
codex --model gpt-5-codex-mini
```

---

### GPT-5.1-Codex-Max — Maximum Capability

**Best for:**

- Complex engineering tasks
- Final code reviews
- Architecture decisions

**Characteristics:**

- OpenAI's best agentic coding model
- Advances frontier of intelligence and efficiency
- Higher cost, highest quality

---

## Google Gemini Models

### Gemini 2.5 Flash — Budget Champion

**Best for:**

- Cost-sensitive applications
- High-volume processing
- Quick responses needed

**Characteristics:**

- Most cost-effective major model
- ~20x cheaper than Claude Sonnet
- Good performance for price
- Fast response times

**When to use:**

- Building cost-sensitive AI products
- High-frequency, lower-complexity tasks
- Development and testing phases

---

### Gemini 2.5 Pro — Context King

**Best for:**

- Analyzing entire codebases
- Large file processing
- Long document understanding
- Projects with extensive context needs

**Characteristics:**

- 1 million token context window
- Can process large codebases without chunking
- Leads WebDev Arena for aesthetically pleasing web apps
- Strong balanced performance

**Configuration with Gemini CLI:**

```bash
# In GEMINI.md or gemini config
model: gemini-2.5-pro
```

---

## Multi-Provider Strategy

### Recommended Workflow

```
1. Planning Phase → Claude Sonnet 4.5 or Gemini 2.5 Pro
   - Understand requirements
   - Design architecture
   - Break down tasks

2. Implementation Phase → Claude Sonnet 4.5 (quality) or Gemini Flash (cost)
   - Write code
   - Fix bugs
   - Run tests

3. Review Phase → Claude Opus 4.5
   - Final deep review
   - Security analysis
   - Architecture validation
```

### Cost Optimization Matrix

| Phase | Budget Mode | Balanced Mode | Quality Mode |
| --- | --- | --- | --- |
| Exploration | Gemini Flash | Claude Haiku | Claude Sonnet |
| Implementation | Gemini Flash | Claude Sonnet | Claude Sonnet |
| Review | Claude Sonnet | Claude Opus | Claude Opus |
| **Est. Cost** | $10/day | $30/day | $75/day |

### When to Use Each Provider

| Provider | Strength | Use When |
| --- | --- | --- |
| **Claude** | Coding accuracy, safety | Quality is paramount |
| **OpenAI/Codex** | IDE integration, ecosystem | Working in VS Code, GitHub |
| **Gemini** | Context size, cost | Budget matters or large codebases |

---

## Tool-Specific Configuration

### Claude Code

```bash
# Switch models during session
/model sonnet  # or haiku, opus
```

### Cursor IDE

```json
// In .cursor/settings.json
{
  "model": "claude-sonnet-4-5"
}
```

### Aider CLI

```yaml
# In .aider.conf.yml
model: claude-sonnet-4-5-20251101
```

### Codex CLI

```toml
# In ~/.codex/config.toml
model = "gpt-5-codex"
```

### Gemini CLI

```yaml
# In GEMINI.md or config
model: gemini-2.5-pro
```

### Zed Editor

```
// In .rules
Preferred model: claude-sonnet-4-5
```

### Amp (Sourcegraph)

```toml
# In amp.toml
[model]
default = "claude-sonnet-4-5"
```

---

## Decision Matrix

| Factor | Haiku/Flash | Sonnet/Codex | Opus/Max |
| --- | --- | --- | --- |
| Speed | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Cost | ⭐⭐⭐ | ⭐⭐ | ⭐ |
| Code Quality | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Complex Reasoning | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| Architecture | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| Security Analysis | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| Context Window | ⭐⭐ | ⭐⭐ | ⭐⭐⭐ |

---

## Common Mistakes

### ❌ Using Premium Models for Everything

- Expensive (15x+ cost difference)
- Slower responses
- Not necessary for most tasks

### ❌ Using Budget Models for Complex Architecture

- May miss subtle issues
- Insufficient for large-scale reasoning
- Save money now, debug extensively later

### ❌ Ignoring Context Window Limits

- Truncated context leads to poor results
- Use Gemini 2.5 Pro for massive codebases
- Split tasks if context exceeds limits

### ❌ Not Matching Model to Task

- Wasted cost on simple tasks
- Insufficient quality on complex tasks

### ✅ Right Approach

- Default to mid-tier models (Sonnet, GPT-5-Codex) for most work
- Use budget models (Haiku, Flash) for speed/cost-sensitive tasks
- Reserve premium models (Opus, Max) for final reviews and complex decisions
- Use high-context models (Gemini Pro) for large codebase analysis

---

## Sources

- [LM Council Benchmarks December 2025](https://lmcouncil.ai/benchmarks)
- [Claude 4 vs GPT-4o vs Gemini 2.5 Pro Comparison](https://www.analyticsvidhya.com/blog/2025/05/best-ai-for-coding/)
- [OpenAI Codex CLI Documentation](https://developers.openai.com/codex/cli/)
- [OpenAI Codex Models](https://developers.openai.com/codex/models/)
- [GPT-5.1-Codex-Max Prompting Guide](https://cookbook.openai.com/examples/gpt-5/gpt-5-1-codex-max_prompting_guide)
- [LLM Leaderboard 2025](https://www.vellum.ai/llm-leaderboard)
- [Anthropic Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview)
- [AI Model Comparison 2025](https://collabnix.com/comparing-top-ai-models-in-2025-claude-grok-gpt-llama-gemini-and-deepseek-the-ultimate-guide/)
