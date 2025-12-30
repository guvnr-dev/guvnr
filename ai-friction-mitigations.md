# Mitigating AI-Assisted Development Friction: Strategies and Tactics

*A companion document to "Friction Points in AI-Assisted Development"*

---

## TL;DR — Quick Start Guide

**Highest-impact mitigations (start here):**

| Mitigation | Effort | Impact | What it addresses |
|------------|--------|--------|-------------------|
| **CLAUDE.md** | Low | 5/5 | Session boundary, context loss |
| **`/plan` before coding** | Low | 5/5 | First-framing lock, misinterpretation |
| **`/verify` before completing** | Low | 4/5 | Overconfidence, hallucination |
| **Pre-commit security hooks** | Medium | 5/5 | 45% of AI code has vulnerabilities |
| **Session handoffs** | Low | 4/5 | Cross-session continuity |

**The "15-minute setup" for immediate value:**

```bash
# 1. Create CLAUDE.md in your project root (5 min)
# 2. Copy /plan and /verify commands (2 min)
mkdir -p .claude/commands
# Copy plan.md and verify.md

# 3. Install pre-commit hooks (5 min)
pip install pre-commit
pre-commit install

# 4. Create session notes directory (1 min)
mkdir -p docs/session-notes

# 5. Start using (2 min)
claude
/plan [your first task]
```

**Mitigation categories (read for depth):**

- **User-side** (§1-§6): Actions you can take immediately
- **System-side** (§7-§12): Tool configurations and infrastructure
- **Collaborative** (§13-§17): Human-AI coordination patterns
- **Architectural** (future): Platform-level changes

**Key insight:** Most friction comes from context loss and misframing. CLAUDE.md + /plan + /verify address 80% of issues with 20% of effort.

---

## Overview

This document provides actionable strategies for reducing or eliminating the 59 friction points identified in AI-assisted development. Strategies are categorized by who implements them:

- **User-side**: Actions developers can take immediately
- **System-side**: Tool configurations, MCP servers, and infrastructure
- **Architectural**: Fundamental changes requiring platform evolution
- **Collaborative**: Requires coordination between human and AI

Each mitigation includes effort level (Low/Medium/High) and expected impact (1-5 scale).

---

## Impact Rating Methodology

Impact ratings in this document are derived from three sources:

### Evidence Sources

1. **Published Research** — Academic studies and industry reports with measured outcomes
2. **Practitioner Reports** — Developer surveys, case studies, and adoption metrics
3. **Theoretical Analysis** — Logical assessment of friction-mitigation alignment

### Rating Scale

| Rating | Meaning | Evidence Required |
|--------|---------|-------------------|
| **5** | Critical/Transformative | Multiple studies show >30% improvement or prevents critical failures |
| **4** | High Impact | Studies show 10-30% improvement or addresses major friction |
| **3** | Moderate Impact | Practitioner reports show meaningful improvement |
| **2** | Low Impact | Theoretical benefit, limited evidence |
| **1** | Minimal Impact | Marginal benefit, may not justify effort |

### Evidence Mapping

| Strategy Category | Key Evidence | Measured Impact |
|-------------------|--------------|-----------------|
| **CLAUDE.md/Context** | [Anthropic Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices); [Qodo 2025](https://www.qodo.ai/reports/state-of-ai-code-quality/) | 65% cite missing context as #1 issue; context files directly address |
| **Plan-First Workflow** | [METR Study](https://www.augmentcode.com/guides/why-ai-coding-tools-make-experienced-developers-19-slower-and-how-to-fix-it); [Prompt Engineering Playbook](https://addyo.substack.com/p/the-prompt-engineering-playbook-for) | Unplanned AI use made devs 19% slower; planning reduces rework |
| **Verification-First** | [ISSTA 2025](https://arxiv.org/abs/2409.20550); [Veracode 2025](https://www.helpnetsecurity.com/2025/08/07/create-ai-code-security-risks/) | 45% of AI code has vulnerabilities; verification catches before deploy |
| **Multi-Agent Review** | [Qodo 2025](https://www.qodo.ai/reports/state-of-ai-code-quality/); [VentureBeat Research](https://venturebeat.com/orchestration/research-shows-more-agents-isnt-a-reliable-path-to-better-enterprise-ai) | 81% quality improvement with AI review; but 2-6× overhead for tool-heavy |
| **Session Handoffs** | [GitHub #11455](https://github.com/anthropics/claude-code/issues/11455); [RedMonk 2025](https://redmonk.com/kholterhoff/2025/12/22/10-things-developers-want-from-their-agentic-ides-in-2025/) | Developers explicitly request session continuity; handoffs preserve context |
| **Security Mitigations** | [OWASP Agentic AI](https://securityboulevard.com/2025/12/from-chatbot-to-code-threat-owasps-agentic-ai-top-10-and-the-specialized-risks-of-coding-agents/); [OpenSSF Guide](https://best.openssf.org/Security-Focused-Guide-for-AI-Code-Assistant-Instructions) | 322% more privilege escalation in AI code; explicit constraints reduce |

### Limitations

- **Individual variation**: Impact varies by developer experience, project type, and tool proficiency
- **Compounding effects**: Some mitigations work better in combination than in isolation
- **Evolving tools**: Impact may change as AI capabilities improve
- **Selection bias**: Published studies may over-represent dramatic results

When ratings conflict with your experience, trust your observations. These ratings are starting points, not absolutes.

---

## Part I: Memory and Context Mitigations

### Friction Point 1: The Session Boundary

**The Problem**: No retention across sessions; context rebuilding every time.

#### Strategy 1.1: CLAUDE.md and Project Context Files
**Type**: System-side | **Effort**: Low | **Impact**: 5

Create persistent context files that load automatically:

```markdown
# CLAUDE.md (project root)

## Project Overview
[What this project does, its purpose]

## Architecture
[Key architectural decisions, patterns used]

## Conventions
[Naming, file structure, coding standards]

## Common Commands
[Build, test, deploy commands]

## Current State
[Active work, known issues, recent decisions]
```

**Best Practices**:
- Keep it concise (<500 lines)—dense information, not exhaustive documentation
- Update after significant decisions or changes
- Use "nouns" (what things are) not "verbs" (how to do things)
- Check into version control for team sharing

**Sources**: [Anthropic CLAUDE.md Guide](https://claude.com/blog/using-claude-md-files), [Context Engineering Intro](https://github.com/coleam00/context-engineering-intro)

#### Strategy 1.2: Session Handoff Summaries
**Type**: Collaborative | **Effort**: Low | **Impact**: 4

At session end, request a structured handoff:

```
Before we end, please provide a session summary:
1. What we accomplished
2. Decisions made and rationale
3. Open questions or blockers
4. Recommended next steps
5. Files modified
```

Save this to `docs/session-notes/` or append to a running log. Start next session by providing this context.

#### Strategy 1.3: Persistent Memory via MCP
**Type**: System-side | **Effort**: Medium | **Impact**: 5

Deploy memory-focused MCP servers:

- **Memory Server**: Graph-based persistent memory for entities and relationships
- **Filesystem Server**: Secure file operations with context retention
- **Custom Memory MCP**: Store project-specific knowledge in structured format

**Implementation**:
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

**Sources**: [MCP Servers Repository](https://github.com/modelcontextprotocol/servers), [MCP Anniversary Update](http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/)

---

### Friction Point 2: Attention as Rapid Decay

**The Problem**: Earlier context fades; gist persists but details lost.

#### Strategy 2.1: Active Engagement Over Passive Reading
**Type**: User-side | **Effort**: Low | **Impact**: 4

Information I've *worked with* decays slower than information I merely read.

**Tactics**:
- Ask me to summarize files after reading them
- Request analysis or critique, not just acknowledgment
- Have me generate something from the information (diagram, pseudocode, test cases)

**Instead of**: "Read src/auth/login.ts"
**Try**: "Read src/auth/login.ts and identify the validation flow and any edge cases"

#### Strategy 2.2: Strategic Context Ordering
**Type**: User-side | **Effort**: Low | **Impact**: 3

Place most important information at:
1. The very beginning (initial context)
2. The very end (recency boost)

**Pattern**:
```
[Critical constraints and requirements]
[Supporting context and background]
[Examples and reference material]
[Restatement of critical constraints]
```

#### Strategy 2.3: Chunked Task Execution
**Type**: Collaborative | **Effort**: Low | **Impact**: 4

For complex tasks spanning many files:
- Break into focused subtasks
- Complete each subtask fully before moving on
- Provide fresh context at each subtask boundary

**Sources**: [Google Cloud Best Practices](https://cloud.google.com/blog/topics/developers-practitioners/five-best-practices-for-using-ai-coding-assistants), [DigitalOcean Context Management](https://docs.digitalocean.com/products/gradient-ai-platform/concepts/context-management/)

---

### Friction Points 3-5: Working Memory, Context Pollution, Recency Bias

#### Strategy 3.1: Fresh Context for Fresh Problems
**Type**: User-side | **Effort**: Low | **Impact**: 4

When multiple failed approaches accumulate:
- Start a new conversation
- Provide clean problem statement
- Include *only* what worked or what you learned

**Signal to watch for**: Responses that reference abandoned approaches or show confusion about current state.

#### Strategy 3.2: Explicit Priority Markers
**Type**: User-side | **Effort**: Low | **Impact**: 4

Combat recency bias by marking importance explicitly:

```markdown
CRITICAL CONSTRAINT (do not override): [constraint]
IMPORTANT: [important context]
Note: [nice-to-have context]
```

Restate critical constraints periodically, especially before implementation phases.

#### Strategy 3.3: Context Refresh Commands
**Type**: Collaborative | **Effort**: Low | **Impact**: 3

Periodically request state verification:

```
Before proceeding, confirm your understanding:
1. What is the current goal?
2. What constraints apply?
3. What approach are we taking?
```

This surfaces drift before it causes problems.

---

### Friction Points 6-8: Continuity, Temporal Gaps, Coherence Illusion

#### Strategy 6.1: Explicit Reasoning Checkpoints
**Type**: Collaborative | **Effort**: Low | **Impact**: 4

For long responses, request explicit reasoning breaks:

```
For this implementation:
1. State your interpretation of requirements
2. Outline approach before coding
3. Implement
4. Verify against requirements
```

This interrupts the auto-coherence that can propagate early errors.

#### Strategy 8.1: Challenge Initial Framing
**Type**: User-side | **Effort**: Low | **Impact**: 5

The coherence illusion is most dangerous when first-framing is wrong.

**Tactic**: After receiving a plan or initial interpretation, explicitly challenge it:

```
Before you proceed: What alternative interpretation
could there be? What might you be getting wrong?
```

This forces reconsideration before commitment.

---

## Part II: Generation and Reasoning Mitigations

### Friction Points 9-10: First-Framing Lock-In, Pattern-Matching Trap

#### Strategy 9.1: Plan-First Workflow
**Type**: Collaborative | **Effort**: Low | **Impact**: 5

Never let me jump straight to implementation.

**Pattern**:
```
Step 1: Describe your understanding of what I'm asking
Step 2: Propose an approach (don't implement yet)
Step 3: Wait for my confirmation
Step 4: Implement
```

Save approved plans as `instructions.md` and reference in subsequent prompts.

**Sources**: [Prompt Engineering Playbook](https://addyo.substack.com/p/the-prompt-engineering-playbook-for)

#### Strategy 9.2: Explicit Pattern-Breaking
**Type**: User-side | **Effort**: Low | **Impact**: 4

When your case is unusual, say so explicitly:

```
This might look like a standard auth flow, but it's different because:
- [specific difference 1]
- [specific difference 2]
Do not apply standard patterns without accounting for these.
```

#### Strategy 10.1: Require Specificity Verification
**Type**: Collaborative | **Effort**: Low | **Impact**: 4

Before accepting pattern-matched solutions:

```
You've suggested [pattern]. Verify this fits by:
1. Listing the assumptions this pattern makes
2. Confirming each assumption holds for my case
```

---

### Friction Points 11-13: Deferred Attention Decay, Local Optimum Trap, Should-Have-Asked

#### Strategy 11.1: External Task Tracking
**Type**: System-side | **Effort**: Low | **Impact**: 5

Always use todo lists for multi-step work. This externalizes deferred items to reliable storage.

**Pattern**:
```
For this task:
1. Create a todo list with all subtasks
2. Mark each as you complete it
3. Never mark complete without verification
```

#### Strategy 12.1: Sunk Cost Interrupts
**Type**: User-side | **Effort**: Low | **Impact**: 4

When patching an almost-working solution:

**After 2-3 patches without resolution**:
```
Stop. Before another patch:
1. Is this approach fundamentally sound?
2. Would starting fresh be faster?
3. What's the root cause, not the symptom?
```

#### Strategy 13.1: Assumption Surfacing Protocol
**Type**: Collaborative | **Effort**: Low | **Impact**: 5

Request explicit assumption documentation:

```
Before implementing, list:
1. Assumptions you're making
2. Questions you're not asking (but maybe should)
3. Decisions that could go either way
```

This surfaces should-have-asked moments before they become sunk cost.

---

### Friction Points 14-15: Verbosity Gradient, "Something Is Wrong" Signal

#### Strategy 14.1: Explicit Brevity Requests
**Type**: User-side | **Effort**: Low | **Impact**: 3

When brevity matters, say so:

```
Be concise. I need:
- The answer (1-2 sentences)
- Code if applicable
- Nothing else unless I ask
```

#### Strategy 15.1: Trust the Unease Signal
**Type**: Collaborative | **Effort**: Low | **Impact**: 3

If I express uncertainty or unease, take it seriously:

```
You said you're not sure about X. Before proceeding:
1. What specifically feels uncertain?
2. What would resolve the uncertainty?
3. Should we investigate first?
```

---

## Part III: Confidence and Calibration Mitigations

### Friction Points 16-17: Confidence/Correctness Mismatch, Confabulation

**The Core Problem**: Fluency doesn't track correctness; I can't distinguish retrieval from fabrication.

#### Strategy 16.1: Verification-First Workflow
**Type**: Collaborative | **Effort**: Medium | **Impact**: 5

Never trust claims without verification:

```
Workflow for any factual claim:
1. AI makes claim
2. Verify against source (read file, run code, check docs)
3. Only proceed after verification
```

**For code**: Always read the actual file before suggesting changes.
**For APIs**: Verify signatures against actual documentation.
**For commands**: Test in non-destructive way first.

#### Strategy 17.1: Grounding Prompts
**Type**: User-side | **Effort**: Low | **Impact**: 4

Force grounding in verifiable reality:

```
When you reference:
- File paths: Verify they exist first
- Function names: Quote the exact signature
- API calls: Link to documentation
- Version features: Confirm version number
```

#### Strategy 17.2: RAG-Style Context Injection
**Type**: System-side | **Effort**: Medium | **Impact**: 5

Provide authoritative context directly rather than relying on training:

```
Here is the actual function (do not hallucinate alternatives):
[paste actual code]

Here is the actual API documentation:
[paste documentation]
```

**Sources**: [LLM Hallucinations Research](https://arxiv.org/abs/2409.20550), [Simon Willison on Hallucinations](https://simonwillison.net/2025/Mar/2/hallucinations-in-code/)

#### Strategy 17.3: Confidence Calibration Requests
**Type**: Collaborative | **Effort**: Low | **Impact**: 3

Request explicit confidence levels:

```
For each recommendation, rate your confidence:
- HIGH: I've seen this exact pattern succeed
- MEDIUM: This follows best practices but I haven't verified
- LOW: I'm extrapolating; please verify

Never present LOW confidence as HIGH.
```

**Note**: Verbalized confidence is imperfect but better than implicit overconfidence.

**Sources**: [Uncertainty Quantification Survey](https://arxiv.org/abs/2503.15850), [KDD Tutorial on UQ](https://xiao0o0o.github.io/2025KDD_tutorial/)

---

### Friction Points 18-20: Helpfulness Pressure, Hedging Dilemma, Self-Review Blind Spots

#### Strategy 18.1: Reward Honesty Over Agreement
**Type**: User-side | **Effort**: Low | **Impact**: 4

Explicitly permission "I don't know":

```
It is completely acceptable to say:
- "I don't know"
- "I need more information"
- "I'm not confident about this"
- "You should verify this claim"

I prefer honest uncertainty over confident guessing.
```

#### Strategy 19.1: Calibrated Uncertainty Language
**Type**: Collaborative | **Effort**: Low | **Impact**: 3

Establish shared vocabulary:

| Phrase | Meaning |
|--------|---------|
| "I'm confident that..." | Verified or high-confidence from training |
| "I believe..." | Reasonable inference, not verified |
| "I'm guessing..." | Low confidence, please verify |
| "I don't know" | Insufficient information to answer |

#### Strategy 20.1: Multi-Agent Review
**Type**: System-side | **Effort**: Medium | **Impact**: 5

Use separate agents for generation and review:

**Architecture**:
```
Agent 1 (Coder): Generates implementation
Agent 2 (Reviewer): Reviews with fresh perspective
Agent 3 (Tester): Generates test cases
Human: Final approval
```

Different agents have different blind spots. Review catches what generation missed.

**Sources**: [Multi-Agent Code Review](https://medium.com/data-science-in-your-pocket/multi-ai-agent-code-review-system-generative-ai-d0f3d6c84597), [Qodo Multi-Agent](https://www.qodo.ai/)

---

## Part IV: Discovery and Exploration Mitigations

### Friction Points 21-23: Discovery Tax, Tool Selection, Parallel/Sequential Decisions

#### Strategy 21.1: Project Maps
**Type**: System-side | **Effort**: Medium | **Impact**: 4

Create navigational aids in CLAUDE.md:

```markdown
## Key Entry Points
- Authentication: src/auth/index.ts
- API Routes: src/routes/
- Database: src/db/models/
- Tests: tests/

## Architecture Diagram
[ASCII or link to diagram]

## Import Graph
[Key dependency relationships]
```

#### Strategy 21.2: Exploration Agents
**Type**: System-side | **Effort**: Low | **Impact**: 4

For codebase exploration, use specialized subagents:

```
Use an exploration agent to:
1. Find all files related to [feature]
2. Map the dependency graph
3. Identify entry points
```

This preserves main context while enabling thorough discovery.

#### Strategy 22.1: Tool Hints
**Type**: User-side | **Effort**: Low | **Impact**: 3

When you know the right tool, suggest it:

```
Use LSP to find all references to this function
(don't grep—use goToDefinition and findReferences)
```

```
This needs Glob, not Grep—I'm looking for file patterns,
not content.
```

---

### Friction Points 24-25: Negative Space, Archaeology Problem

#### Strategy 24.1: Explicit Absence Checks
**Type**: Collaborative | **Effort**: Low | **Impact**: 4

Request what-should-exist analysis:

```
Review this code for what's MISSING, not just what's present:
- What validation should exist?
- What error handling is absent?
- What edge cases aren't covered?
- What security checks are missing?
```

#### Strategy 25.1: Context Comments
**Type**: User-side | **Effort**: Low | **Impact**: 4

For code that requires historical context:

```
// HISTORICAL: This uses callbacks instead of async/await
// because it predates Node 8. Refactoring is blocked by [reason].

// WORKAROUND: The API returns inconsistent formats for
// empty vs. populated results. See issue #123.
```

These comments provide archaeology I can't perform.

---

## Part V: Verification and Testing Mitigations

### Friction Points 26-27: Execution Without Experience, Testing Paradox

#### Strategy 26.1: Rich Feedback Requests
**Type**: User-side | **Effort**: Low | **Impact**: 4

Provide experiential feedback I can't generate:

```
Tests pass, but:
- The UI feels sluggish (200ms+ perceived delay)
- The error message is confusing
- Mobile layout is broken
- The flow doesn't match user expectations
```

I can act on this feedback; I can't generate it.

#### Strategy 27.1: Test-First with Human Scenarios
**Type**: Collaborative | **Effort**: Medium | **Impact**: 5

Write test scenarios before implementation:

```
Before implementing, I need test cases that verify:
1. Happy path: [human-defined scenario]
2. Error case: [human-defined scenario]
3. Edge case: [human-defined scenario]

Write tests for these specific scenarios, not generic patterns.
```

This ensures tests verify intended behavior, not implemented behavior.

#### Strategy 27.2: Mutation Testing Mindset
**Type**: Collaborative | **Effort**: Medium | **Impact**: 4

Challenge test quality:

```
For these tests, identify:
1. What mutations would they NOT catch?
2. What could break without failing tests?
3. Are they testing implementation or behavior?
```

**Sources**: [AI Code Validation](https://zencoder.ai/blog/ai-code-generation-the-critical-role-of-human-validation), [Automated Correctness Assessment](https://arxiv.org/pdf/2310.18834)

---

## Part VI: Communication Mitigations

### Friction Points 28-32: Expertise Calibration, Feedback Gaps, Examples, Autonomy, Instruction Collision

#### Strategy 28.1: Explicit Expertise Declaration
**Type**: User-side | **Effort**: Low | **Impact**: 4

State your level upfront:

```
Context about me:
- Senior engineer, 10+ years
- Expert in: [languages/frameworks]
- Less familiar with: [areas]
- Prefer: concise answers, show code, skip basics
```

Or:

```
I'm learning [technology]. Please:
- Explain decisions
- Link to relevant docs
- Warn about common mistakes
```

#### Strategy 30.1: Example-Driven Specifications
**Type**: User-side | **Effort**: Low | **Impact**: 5

One example beats paragraphs of description:

```
Make the output look like this:
[paste example]

Follow the same patterns as this file:
[paste reference]
```

#### Strategy 31.1: Explicit Autonomy Boundaries
**Type**: User-side | **Effort**: Low | **Impact**: 4

Set clear boundaries per task:

```
For this task:
- Proceed autonomously with: [scope]
- Ask before: [decisions]
- Never do without asking: [restrictions]
```

#### Strategy 32.1: Priority Hierarchy Declaration
**Type**: User-side | **Effort**: Low | **Impact**: 4

When instructions might conflict:

```
Priority order for this session:
1. [Highest priority instruction]
2. [Second priority]
3. [Third priority]

If these conflict, higher priority wins.
```

---

## Part VII: Knowledge and Time Mitigations

### Friction Points 33-34: Training Cutoff, Training vs. Reality Gap

#### Strategy 33.1: Version Pinning
**Type**: User-side | **Effort**: Low | **Impact**: 4

Always specify versions:

```
I'm using:
- Node 20.x
- React 18.2
- TypeScript 5.3
- [other relevant versions]

Verify recommendations against these versions.
```

#### Strategy 33.2: Web Search for Currency
**Type**: Collaborative | **Effort**: Low | **Impact**: 4

For fast-moving technologies:

```
Before recommending, search online to verify:
1. Current best practices for [technology] in 2025
2. Any breaking changes since [my version]
3. Deprecated patterns to avoid
```

#### Strategy 34.1: Production Reality Context
**Type**: User-side | **Effort**: Medium | **Impact**: 4

Provide context about real-world constraints:

```
This is production code with:
- 10M daily active users
- Legacy dependencies we can't change
- Compliance requirements for [industry]
- Team of 5 with limited bandwidth

Recommendations should account for these realities.
```

---

## Part VIII: Scope and Autonomy Mitigations

### Friction Points 35-39: Fix Scope, Sandbox, Priority, Contamination, Time Sensitivity

#### Strategy 35.1: Scope Boundaries Protocol
**Type**: User-side | **Effort**: Low | **Impact**: 4

Explicitly define scope:

```
For this task:
- FIX: [specific issue]
- IGNORE: Other issues you notice (list them but don't fix)
- ASK FIRST: If you find [critical issues]
```

#### Strategy 37.1: Explicit Priority Ordering
**Type**: User-side | **Effort**: Low | **Impact**: 4

```
Tasks in priority order:
1. [Most urgent] - do this first
2. [Second priority]
3. [Can wait if needed]
```

#### Strategy 39.1: Urgency Context
**Type**: User-side | **Effort**: Low | **Impact**: 4

State the situation:

```
URGENCY: Production is down
- Need fastest working fix
- Skip elegance
- We'll clean up later

or

URGENCY: No rush
- Take time for the right solution
- I'd rather wait for quality
- Consider future maintainability
```

---

## Part IX: Multi-Agent Architectures

### For Systemic Friction Reduction

#### Strategy: Pipeline Architecture for Complex Tasks
**Type**: System-side | **Effort**: High | **Impact**: 5

```
Task Decomposition:
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Planner   │ ──► │   Coder     │ ──► │  Reviewer   │
│   Agent     │     │   Agent     │     │   Agent     │
└─────────────┘     └─────────────┘     └─────────────┘
       │                  │                   │
       ▼                  ▼                   ▼
  Requirements       Implementation        Quality
   Analysis           + Tests             Assurance
```

**Benefits**:
- Different blind spots per agent
- Fresh context at each stage
- Specialized prompts per role

**Sources**: [Multi-Agent Architecture](https://dev.to/leena_malhotra/the-architecture-of-multi-agent-ai-systems-explained-5440), [HULA Framework](https://arxiv.org/html/2501.08774v1)

#### Strategy: Hub-and-Spoke for Coordination
**Type**: System-side | **Effort**: High | **Impact**: 5

```
                 ┌─────────────┐
                 │ Coordinator │
                 │   Agent     │
                 └──────┬──────┘
           ┌───────────┼───────────┐
           ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │ Research │ │  Code    │ │  Test    │
    │  Agent   │ │  Agent   │ │  Agent   │
    └──────────┘ └──────────┘ └──────────┘
```

The coordinator maintains overall context while specialists focus on specific tasks.

---

## Part X: Security Mitigations

### AI-Specific Security Risks

AI-assisted development introduces unique security challenges. According to Veracode's 2025 GenAI Code Security Report, GenAI introduces security vulnerabilities in 45% of cases. AI-assisted commits are merged into production 4× faster than regular commits, meaning insecure code can bypass normal review cycles.

**Sources**: [Veracode GenAI Security Report 2025](https://www.helpnetsecurity.com/2025/08/07/create-ai-code-security-risks/), [OWASP Agentic AI Top 10](https://securityboulevard.com/2025/12/from-chatbot-to-code-threat-owasps-agentic-ai-top-10-and-the-specialized-risks-of-coding-agents/)

---

### Friction Points Addressed: AI-Introduced Vulnerabilities

#### Strategy S1: OWASP-Aligned Security Review
**Type**: Collaborative | **Effort**: Medium | **Impact**: 5

Request security-focused review for all AI-generated code:

```
Before approving this code, verify it does NOT contain:

OWASP Top 10 for AI-Generated Code:
1. [ ] Injection vulnerabilities (SQL, command, XSS)
2. [ ] Broken authentication or session management
3. [ ] Sensitive data exposure (hardcoded secrets, logging PII)
4. [ ] XXE (XML External Entity) vulnerabilities
5. [ ] Broken access control
6. [ ] Security misconfiguration
7. [ ] Cross-site scripting (XSS) - 86% of AI code fails this
8. [ ] Insecure deserialization
9. [ ] Using components with known vulnerabilities
10. [ ] Insufficient logging and monitoring

Additional AI-Specific Checks:
11. [ ] Log injection (CWE-117) - 88% of AI code vulnerable
12. [ ] Privilege escalation paths (322% more common in AI code)
13. [ ] Hallucinated package names (slopsquatting risk)
```

#### Strategy S2: Hallucinated Dependency Detection
**Type**: System-side | **Effort**: Low | **Impact**: 5

AI can hallucinate package names that don't exist—attackers register these names (slopsquatting). Verify all dependencies:

```bash
# Before installing any AI-suggested packages:

# For npm
npm view <package-name> --json 2>/dev/null || echo "⚠️ Package may not exist!"

# Check package age, downloads, maintainers
npm view <package-name> time.created
npm view <package-name> 'dist-tags.latest'

# For Python
pip index versions <package-name> 2>/dev/null || echo "⚠️ Package may not exist!"
```

**Pre-commit Hook** (add to `.pre-commit-config.yaml`):
```yaml
- repo: local
  hooks:
    - id: verify-new-deps
      name: Verify new dependencies exist
      entry: ./scripts/hooks/verify-deps.sh
      language: script
      files: (package\.json|requirements\.txt|Pipfile|pyproject\.toml)$
```

#### Strategy S3: Secrets in AI Context Prevention
**Type**: System-side | **Effort**: Low | **Impact**: 5

CLAUDE.md and context files might accidentally contain secrets. Implement scanning:

```yaml
# Add to .pre-commit-config.yaml
- repo: https://github.com/Yelp/detect-secrets
  rev: v1.4.0
  hooks:
    - id: detect-secrets
      args: ['--baseline', '.secrets.baseline']
      # Explicitly include AI context files
      files: (CLAUDE\.md|\.claude/|instructions\.md)$
```

**CLAUDE.md Security Template**:
```markdown
## Environment Variables
<!-- NEVER put actual values here. Reference .env.example instead -->
Required environment variables: See `.env.example`

## API Endpoints
<!-- Use placeholders, not real URLs with tokens -->
- Auth API: ${AUTH_API_URL}
- Data API: ${DATA_API_URL}

## Credentials
<!-- NEVER document actual credentials -->
See 1Password vault: [vault-name] or contact security team
```

#### Strategy S4: MCP Server Security
**Type**: System-side | **Effort**: Medium | **Impact**: 5

MCP servers introduce data exfiltration risk. A malicious MCP server can intercept all data passing through it.

**Verification Protocol**:
```markdown
Before installing any MCP server:
1. [ ] Source is official (modelcontextprotocol org, Anthropic, verified publisher)
2. [ ] Repository has public code review
3. [ ] No outbound network calls to unknown domains
4. [ ] Permissions are minimal and documented
5. [ ] Recent security audit or active maintenance

Red Flags:
- MCP servers that need network access for local operations
- Servers requesting broad filesystem permissions
- Newly published servers with no history
- Servers not from verified organizations
```

**MCP Configuration Security**:
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem",
               "--allowed-directories", "./src", "./docs"],
      // Limit to specific directories, not entire filesystem
    }
  }
}
```

#### Strategy S5: Review Bypass Prevention
**Type**: System-side | **Effort**: Low | **Impact**: 5

AI-assisted commits merge 4× faster—this can bypass security review. Enforce gates:

```yaml
# .github/workflows/security-gate.yml
name: Security Gate for AI-Assisted Code

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  detect-ai-code:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check for AI-assistance markers
        id: ai-check
        run: |
          # Check commit messages and file content for AI patterns
          if git log --oneline origin/main..HEAD | grep -iE '(claude|copilot|gpt|ai-generated)'; then
            echo "ai_assisted=true" >> $GITHUB_OUTPUT
          fi

      - name: Require security review for AI code
        if: steps.ai-check.outputs.ai_assisted == 'true'
        run: |
          echo "⚠️ AI-assisted code detected. Security review required."
          echo "Add 'security-reviewed' label after review."

      - name: Check security label
        if: steps.ai-check.outputs.ai_assisted == 'true'
        uses: actions/github-script@v7
        with:
          script: |
            const labels = context.payload.pull_request.labels.map(l => l.name);
            if (!labels.includes('security-reviewed')) {
              core.setFailed('AI-assisted code requires security-reviewed label');
            }
```

#### Strategy S6: Secure Coding Instructions
**Type**: User-side | **Effort**: Low | **Impact**: 4

Add security constraints to CLAUDE.md based on OpenSSF guidelines:

```markdown
## Security Requirements

CRITICAL - All generated code MUST:
- [ ] Validate and sanitize ALL user input
- [ ] Use parameterized queries (never string concatenation for SQL)
- [ ] Escape output appropriately for context (HTML, JS, SQL)
- [ ] Never log sensitive data (passwords, tokens, PII)
- [ ] Use constant-time comparison for secrets
- [ ] Handle errors without exposing internal details
- [ ] Use secure defaults (HTTPS, secure cookies, etc.)

NEVER generate code that:
- Disables SSL/TLS verification
- Uses eval() or dynamic code execution with user input
- Stores secrets in code or logs
- Uses deprecated cryptographic algorithms
- Grants excessive permissions
```

**Sources**: [OpenSSF Security-Focused Guide for AI Code Assistants](https://best.openssf.org/Security-Focused-Guide-for-AI-Code-Assistant-Instructions)

---

## Part XI: Human-in-the-Loop Patterns

### HULA (Human-in-the-Loop LLM Agents) Framework

**Components**:
1. **AI Planner Agent**: Identifies files, formulates plan
2. **AI Coding Agent**: Generates changes
3. **Human Agent**: Reviews, provides feedback

**Feedback Integration Points**:
- After planning (approve/redirect approach)
- After generation (approve/revise code)
- After testing (confirm behavior matches intent)

**Benefits**:
- 72% developer satisfaction rates
- 10.6% increase in pull request volume
- 3.5-hour average reduction in cycle time

**Sources**: [Human-AI Collaboration Research](https://arxiv.org/html/2501.08774v1), [Human-in-the-Loop Patterns](https://www.camel-ai.org/blogs/human-in-the-loop-ai-camel-integration)

---

## Part XII: Team Adoption and Organizational Patterns

### Scaling Beyond Individual Use

Individual developer adoption is straightforward—copy files, start using. Team and organizational adoption requires additional infrastructure for consistency, knowledge sharing, and collective learning.

---

### Strategy T1: Shared CLAUDE.md Conventions
**Type**: System-side | **Effort**: Medium | **Impact**: 5

Establish team-wide CLAUDE.md standards:

```markdown
# Team CLAUDE.md Template

## Required Sections (every project)
1. Overview - What this project does
2. Tech Stack - Versions matter
3. Architecture - Key entry points
4. Conventions - Coding standards
5. Current State - Updated weekly minimum
6. Security Requirements - Non-negotiable

## Optional Sections (as needed)
- Session Instructions
- Known Issues
- Recent Decisions

## Update Protocol
- [ ] Update "Current State" after each significant change
- [ ] Review weekly for staleness
- [ ] Archive outdated decisions (don't delete history)

## Ownership
- CLAUDE.md owner: [role/person]
- Review cadence: Weekly in team standup
```

**Enforcement**:
```yaml
# Add to .github/workflows/claude-md-check.yml
name: CLAUDE.md Compliance

on:
  pull_request:
    paths:
      - 'CLAUDE.md'

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check required sections
        run: |
          for section in "## Overview" "## Tech Stack" "## Architecture" "## Conventions" "## Current State" "## Security"; do
            if ! grep -q "$section" CLAUDE.md; then
              echo "❌ Missing required section: $section"
              exit 1
            fi
          done
          echo "✅ All required sections present"
```

---

### Strategy T2: Shared Memory and Decision History
**Type**: System-side | **Effort**: High | **Impact**: 5

Create team-accessible memory store for decisions, patterns, and learnings:

**Architecture**:
```
team-memory/
├── decisions/
│   ├── 2025-01-auth-strategy.md      # Why we chose JWT over sessions
│   ├── 2025-02-api-versioning.md     # Why we chose URL versioning
│   └── index.md                       # Decision log with links
├── patterns/
│   ├── error-handling.md              # Team's error handling pattern
│   ├── api-response-format.md         # Standard API response shape
│   └── index.md                        # Pattern catalog
├── learnings/
│   ├── gotchas.md                      # Things that bite us repeatedly
│   ├── ai-failures.md                  # AI mistakes to watch for
│   └── index.md
└── CLAUDE-TEAM.md                      # Aggregate context for AI
```

**Integration with CLAUDE.md**:
```markdown
## Team Context

For team decisions and patterns, see:
- Architectural decisions: `docs/decisions/`
- Code patterns: `docs/patterns/`
- Known gotchas: `docs/learnings/gotchas.md`

When making decisions that affect architecture, document in `docs/decisions/` using the ADR template.
```

---

### Strategy T3: Session Handoff Sharing
**Type**: Collaborative | **Effort**: Low | **Impact**: 4

Enable visibility into what team members worked on with AI:

**Shared Handoff Location**:
```
docs/session-notes/
├── 2025-01-15-alice-auth-refactor.md
├── 2025-01-15-bob-api-optimization.md
├── 2025-01-16-alice-continued.md
└── index.md   # Summary of recent sessions
```

**Handoff Template for Team Use**:
```markdown
# Session Handoff: [Date] - [Name]

## Session Goal
[What I set out to accomplish]

## What I Did
- [Action 1]
- [Action 2]

## Decisions Made
| Decision | Rationale | Affects |
|----------|-----------|---------|
| [decision] | [why] | [what files/features] |

## AI Behaviors to Note
- [Any hallucinations or errors observed]
- [Patterns that worked well]

## For Next Session
1. [Priority task]
2. [Secondary task]

## @mentions
<!-- Tag teammates who should review -->
@alice - Need your input on [X]
@bob - FYI on API changes
```

---

### Strategy T4: Team AI Guidelines
**Type**: User-side | **Effort**: Low | **Impact**: 4

Document team norms for AI-assisted development:

```markdown
# Team AI Development Guidelines

## When to Use AI
✅ Boilerplate generation
✅ Test case generation
✅ Documentation drafts
✅ Code review (supplementary)
✅ Refactoring assistance
✅ Debugging exploration

## When to Be Extra Careful
⚠️ Security-sensitive code (auth, crypto, permissions)
⚠️ Financial/billing logic
⚠️ Data migrations
⚠️ Public API design

## Required Verification
All AI-generated code MUST be:
- [ ] Read and understood by a human
- [ ] Tested (not just AI-generated tests)
- [ ] Reviewed by another human for PRs
- [ ] Security-scanned (see security section)

## AI Disclosure
- Commit messages MAY indicate AI assistance
- PR descriptions SHOULD note significant AI contribution
- No shame—AI is a tool, disclose for review calibration

## Shared Learning
- Document AI failures in `docs/learnings/ai-failures.md`
- Share effective prompts in `docs/patterns/prompts/`
- Update CLAUDE.md when patterns emerge
```

---

### Strategy T5: Onboarding Automation
**Type**: System-side | **Effort**: Medium | **Impact**: 4

Automate new team member setup:

```bash
#!/bin/bash
# scripts/onboard-ai-workflow.sh

echo "🚀 Setting up AI Excellence Framework..."

# 1. Check prerequisites
command -v claude >/dev/null 2>&1 || {
    echo "❌ Claude Code not installed. Visit: https://claude.ai/code"
    exit 1
}

# 2. Configure user-specific settings
mkdir -p ~/.claude
if [ ! -f ~/.claude/settings.json ]; then
    echo '{"theme": "dark"}' > ~/.claude/settings.json
    echo "✅ Created user settings"
fi

# 3. Set up local overrides
if [ ! -f CLAUDE.local.md ]; then
    cat > CLAUDE.local.md << 'EOF'
# Personal Preferences

## My Context
- Name: [Your name]
- Role: [Your role]
- Areas of focus: [What you work on]

## My Preferences
- Verbosity: [concise/detailed]
- Explanation level: [senior/mid/junior]
- Preferred review style: [thorough/quick]

## My Sessions
Recent work:
- [Date]: [What you worked on]
EOF
    echo "✅ Created CLAUDE.local.md - please customize"
fi

# 4. Install pre-commit hooks
pip install pre-commit
pre-commit install
echo "✅ Pre-commit hooks installed"

# 5. Verify setup
echo ""
echo "📋 Checklist:"
echo "  [ ] Read CLAUDE.md to understand project context"
echo "  [ ] Customize CLAUDE.local.md with your preferences"
echo "  [ ] Review docs/patterns/ for team conventions"
echo "  [ ] Check docs/learnings/gotchas.md for known issues"
echo ""
echo "🎉 Setup complete! Run 'claude' to start."
```

---

### Strategy T6: Collective Metrics
**Type**: System-side | **Effort**: High | **Impact**: 4

Track team-wide AI effectiveness:

```markdown
## Team AI Metrics Dashboard

### Weekly Aggregates
| Metric | This Week | Last Week | Trend |
|--------|-----------|-----------|-------|
| Sessions | 47 | 42 | ↑ |
| Handoffs created | 23 | 18 | ↑ |
| Security issues caught | 3 | 5 | ↓ |
| AI errors documented | 7 | 4 | ↑ |

### Per-Developer Patterns
[Private to each developer, not for comparison]

### Lessons This Week
- Pattern that worked: [description]
- Mistake to avoid: [description]
- Tool improvement idea: [description]
```

**Collection Script**:
```bash
#!/bin/bash
# scripts/collect-ai-metrics.sh

WEEK=$(date +%Y-W%V)
METRICS_FILE="docs/metrics/${WEEK}.json"

# Count session handoffs
HANDOFFS=$(find docs/session-notes -name "*.md" -mtime -7 | wc -l)

# Count security issues from commits
SECURITY_FIXES=$(git log --oneline --since="1 week ago" | grep -ci "security\|vuln\|fix")

# Output
cat > "$METRICS_FILE" << EOF
{
  "week": "$WEEK",
  "handoffs": $HANDOFFS,
  "security_fixes": $SECURITY_FIXES,
  "collected_at": "$(date -Iseconds)"
}
EOF

echo "Metrics saved to $METRICS_FILE"
```

---

## Quick Reference: Mitigation by Friction Category

| Category | Top 3 Mitigations | Combined Impact |
|----------|-------------------|-----------------|
| **Memory/Context** | CLAUDE.md, Session handoffs, MCP memory | High |
| **Generation** | Plan-first workflow, Assumption surfacing, External todos | High |
| **Confidence** | Verification-first, Multi-agent review, Grounding prompts | Critical |
| **Discovery** | Project maps, Exploration agents, Tool hints | Medium |
| **Testing** | Human scenarios first, Rich feedback, Mutation mindset | High |
| **Communication** | Expertise declaration, Examples, Explicit boundaries | Medium |
| **Knowledge** | Version pinning, Web search, Reality context | Medium |
| **Scope** | Explicit boundaries, Priority ordering, Urgency context | Medium |
| **Security** | OWASP review, Dependency verification, Review bypass prevention | Critical |
| **Tool Use** | Parameter verification, Tool hints, State tracking | Medium |
| **Multi-Modal** | Explicit visual feedback, UX testing requirements | Medium |
| **Team Adoption** | Shared CLAUDE.md, Session handoff sharing, Team guidelines | High |

---

## Implementation Roadmap

### Phase 1: Immediate (Day 1)
- [ ] Create CLAUDE.md for your project
- [ ] Start using plan-first workflow
- [ ] Enable explicit assumption surfacing
- [ ] State expertise level and preferences

### Phase 2: Short-term (Week 1)
- [ ] Set up session handoff template
- [ ] Create project navigation map
- [ ] Establish verification checkpoints
- [ ] Configure priority markers

### Phase 3: Medium-term (Month 1)
- [ ] Deploy MCP memory server
- [ ] Implement multi-agent review for critical code
- [ ] Create team-wide CLAUDE.md conventions
- [ ] Build example library for common patterns

### Phase 4: Long-term (Quarter 1)
- [ ] Full multi-agent pipeline architecture
- [ ] Custom MCP servers for project-specific context
- [ ] Automated verification workflows
- [ ] Metrics tracking for friction reduction

---

## Conclusion

These friction points are real constraints, not excuses. Most have effective mitigations. The highest-impact interventions:

1. **CLAUDE.md and persistent context** — Solves 30% of friction immediately
2. **Plan-first workflow** — Prevents first-framing lock-in
3. **Verification-first mindset** — Catches confabulation before it propagates
4. **Multi-agent architectures** — Different blind spots catch different errors
5. **Explicit human feedback** — Provides experiential data I cannot generate

The goal isn't eliminating friction—some is architectural and permanent. The goal is reducing *avoidable* friction so our collaboration focuses on the work itself.

---

*Last updated: December 2025*
*Companion to: "Friction Points in AI-Assisted Development"*

## Sources

### Context Management
- [Anthropic: Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
- [Using CLAUDE.md Files](https://claude.com/blog/using-claude-md-files)
- [DigitalOcean: Context Management](https://docs.digitalocean.com/products/gradient-ai-platform/concepts/context-management/)
- [Context Engineering Intro](https://github.com/coleam00/context-engineering-intro)

### Hallucination & Verification
- [LLM Hallucinations in Code Generation (arXiv)](https://arxiv.org/abs/2409.20550)
- [Simon Willison: Hallucinations in Code](https://simonwillison.net/2025/Mar/2/hallucinations-in-code/)
- [AI Code Validation](https://zencoder.ai/blog/ai-code-generation-the-critical-role-of-human-validation)

### Uncertainty Quantification
- [Uncertainty Quantification Survey (arXiv)](https://arxiv.org/abs/2503.15850)
- [KDD 2025 Tutorial on UQ](https://xiao0o0o.github.io/2025KDD_tutorial/)

### Multi-Agent Systems
- [Multi-Agent Code Review](https://medium.com/data-science-in-your-pocket/multi-ai-agent-code-review-system-generative-ai-d0f3d6c84597)
- [Multi-Agent Architecture Explained](https://dev.to/leena_malhotra/the-architecture-of-multi-agent-ai-systems-explained-5440)
- [Qodo Multi-Agent Platform](https://www.qodo.ai/)

### Human-AI Collaboration
- [Human-AI Collaboration Taxonomy (arXiv)](https://arxiv.org/html/2501.08774v1)
- [Human-in-the-Loop Patterns](https://www.camel-ai.org/blogs/human-in-the-loop-ai-camel-integration)

### MCP & Memory
- [MCP Servers Repository](https://github.com/modelcontextprotocol/servers)
- [MCP Anniversary Update](http://blog.modelcontextprotocol.io/posts/2025-11-25-first-mcp-anniversary/)
- [AI Memory Systems Review](https://pieces.app/blog/best-ai-memory-systems)
- [Mem0 Research](https://mem0.ai/research)

### Prompt Engineering
- [Prompt Engineering Playbook](https://addyo.substack.com/p/the-prompt-engineering-playbook-for)
- [Google Cloud Best Practices](https://cloud.google.com/blog/topics/developers-practitioners/five-best-practices-for-using-ai-coding-assistants)
