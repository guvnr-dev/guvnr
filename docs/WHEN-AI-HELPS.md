# When AI Coding Assistants Help: A Balanced Perspective

This document provides evidence-based guidance on when AI coding assistants deliver the most value. While the AI Excellence Framework focuses on mitigating friction, it's equally important to understand when to lean into AI assistance.

---

## TL;DR

**AI helps most when:**

- You're new to a codebase, language, or framework
- Tasks involve boilerplate, repetitive patterns, or well-documented APIs
- You're learning or exploring rather than producing final code
- Context is clear and well-defined (small scope, clear requirements)

**AI helps least when:**

- You're an expert in a large, familiar codebase (METR: 19% slowdown)
- Tasks require deep architectural understanding
- Security is critical (45% vulnerability rate)
- Novel problem-solving without established patterns

---

## Research Summary

### Who Benefits Most?

| Developer Type                | Productivity Gain | Source                                                                                                                                                         |
| ----------------------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Junior developers             | 27-39%            | [MIT/NBER Study](https://itrevolution.com/articles/new-research-reveals-ai-coding-assistants-boost-developer-productivity-by-26-what-it-leaders-need-to-know/) |
| Short-tenure developers       | 21-40%            | MIT/NBER Study                                                                                                                                                 |
| Recent hires                  | 27-39%            | MIT/NBER Study                                                                                                                                                 |
| Average across all devs       | 26%               | MIT/NBER Study                                                                                                                                                 |
| Senior developers             | 7-16%             | MIT/NBER Study                                                                                                                                                 |
| Experts in familiar codebases | -19% (slowdown)   | [METR Study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)                                                                         |

### Why the Difference?

1. **Context Mismatch**: Experienced developers already know their codebase. AI suggestions often don't match existing patterns, requiring review and rejection.

2. **Overhead Cost**: Time spent prompting, reviewing, and correcting AI output exceeds time saved for tasks experts could do quickly.

3. **Learning Curve Advantage**: Less experienced developers benefit from AI's ability to surface patterns, syntax, and APIs they'd otherwise need to look up.

4. **Familiarity Threshold**: In unfamiliar codebases, even experts benefit from AI assistance—the METR study specifically notes this.

---

## Optimal Use Cases

### High-Value AI Tasks

| Task Type                   | Why AI Helps                          | Evidence                                                                                                                                                          |
| --------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Boilerplate code**        | Repetitive patterns are AI's strength | 70% reduced mental effort ([Accenture](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/)) |
| **API exploration**         | Faster than reading docs              | 54% less time searching ([Accenture](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/))   |
| **Learning new frameworks** | Interactive tutorials                 | 44% of devs use AI to learn ([Stack Overflow 2025](https://survey.stackoverflow.co/2025/ai))                                                                      |
| **Test generation**         | Pattern-based generation              | Effective for happy-path tests                                                                                                                                    |
| **Documentation**           | Summarization and formatting          | Reduces friction in doc maintenance                                                                                                                               |
| **Code explanation**        | Understanding unfamiliar code         | Faster onboarding                                                                                                                                                 |
| **Refactoring suggestions** | Pattern recognition                   | Good for obvious improvements                                                                                                                                     |
| **Regex and formatting**    | Syntax-heavy tasks                    | High accuracy for well-defined patterns                                                                                                                           |

### Low-Value AI Tasks (Apply Caution)

| Task Type                    | Why AI Struggles                | Evidence                                                                                                             |
| ---------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Security-critical code**   | 45% vulnerability rate          | [Veracode 2025](https://www.veracode.com/blog/genai-code-security-report/)                                           |
| **Architecture decisions**   | 153% more design flaws          | [Apiiro 2025](https://apiiro.com/blog/4x-velocity-10x-vulnerabilities-ai-coding-assistants-are-shipping-more-risks/) |
| **Performance optimization** | Lacks runtime context           | Theoretical knowledge only                                                                                           |
| **Business logic**           | Domain-specific requirements    | No context on your business                                                                                          |
| **Debugging complex issues** | Needs full system understanding | Root cause analysis requires context                                                                                 |
| **Large-scale refactoring**  | Context window limits           | 65% cite context loss ([Second Talent](https://www.secondtalent.com/resources/ai-coding-assistant-statistics/))      |

---

## Context-Dependent Guidance

### For Junior Developers

**Embrace AI for:**

- Learning syntax and patterns
- Understanding unfamiliar codebases
- Generating initial drafts of code
- Exploring APIs and libraries

**Be cautious with:**

- Security-sensitive code (always get senior review)
- Copying without understanding (technical debt)
- Skipping fundamentals (you need to learn, not just produce)

**Recommended approach:**

1. Use AI to generate initial code
2. Study the generated code to understand it
3. Refactor to match project patterns
4. Get code review from experienced developers

### For Senior Developers

**Embrace AI for:**

- Unfamiliar languages or frameworks
- Boilerplate you'd delegate anyway
- Documentation and comments
- Exploring alternative approaches

**Be cautious with:**

- Your core expertise areas (may slow you down)
- Code you'll need to maintain long-term
- Architectural decisions (153% more flaws)
- Production-critical paths

**Recommended approach:**

1. Use AI as a starting point, not final output
2. Apply your expertise to refine and secure
3. Focus AI on the boring parts, not the creative parts
4. Maintain your direct coding skills

### For Teams

**Embrace AI for:**

- Onboarding new team members
- Cross-training on unfamiliar modules
- Generating documentation
- Reducing bus factor

**Be cautious with:**

- Letting AI output bypass code review
- Heavy AI use increasing review burden on seniors
- Security-critical shared code
- Inconsistent patterns from different AI suggestions

**Recommended approach:**

1. Establish team patterns in CLAUDE.md
2. Require human review for all AI code
3. Track AI-introduced bugs to calibrate trust
4. Use the productivity paradox as input: junior gains may create senior review burden

---

## The Productivity Paradox

Research from [Faros AI](https://www.faros.ai/blog/ai-software-engineering) identifies a critical issue:

> "AI coding assistants increase developer output, but not company productivity."

**The mechanism:**

1. Junior developers produce 27-39% more code
2. This code requires senior developer review
3. Senior developers are already at capacity
4. Code review becomes the bottleneck
5. Overall team velocity may not increase

**Mitigation:**

- Use AI for quality (tests, docs) not just quantity
- Invest in automated review tools (linting, SAST)
- Track team-level metrics, not just individual output
- Balance AI adoption with review capacity

---

## Practical Guidelines

### The Decision Matrix

```
Should I use AI for this task?

    ┌───────────────────────────────────────┐
    │           FAMILIARITY WITH TASK        │
    │                                        │
    │    Low ◄────────────────────► High     │
    │                                        │
    │    Use AI        │    Maybe skip AI    │
    │    heavily       │    or use sparingly │
  C │                  │                     │
  R ├──────────────────┼─────────────────────┤
  I │                  │                     │
  T │    Use AI        │    Skip AI          │
  I │    with heavy    │    (you're faster   │
  C │    review        │    without it)      │
  A │                  │                     │
  L │                  │    METR: 19%        │
  I │    45% vuln      │    slowdown zone    │
  T │    rate zone     │                     │
  Y │                  │                     │
    └───────────────────────────────────────┘
         High ▲                     ▲ Low
              │                     │
              └─────────────────────┘
                  RISK LEVEL
```

### The 10-Second Rule

Before using AI for a task:

1. **Do I know how to do this?**
   - Yes → AI might slow you down
   - No → AI can help you learn

2. **Is this security-critical?**
   - Yes → Extra review required (45% vuln rate)
   - No → Standard workflow

3. **Is this boilerplate or creative?**
   - Boilerplate → AI excels
   - Creative/novel → AI struggles

4. **Do I have clear requirements?**
   - Yes → AI can help
   - No → Clarify first, then AI

---

## Key Statistics to Remember

| Metric                  | Value     | Implication                       |
| ----------------------- | --------- | --------------------------------- |
| Junior dev boost        | 27-39%    | Invest AI in onboarding           |
| Senior dev slowdown     | up to 19% | Let experts work directly         |
| Vulnerability rate      | 45%       | Always review security            |
| Task completion speedup | 55.8%     | Real gains for appropriate tasks  |
| Time saved weekly       | 1-8 hours | Meaningful but variable           |
| Code acceptance rate    | <44%      | Expect to reject most suggestions |
| AI code in production   | 41%       | The new normal—prepare for it     |

---

## Integration with AI Excellence Framework

This document complements the friction-focused core of the framework:

| Framework Component  | How It Relates                          |
| -------------------- | --------------------------------------- |
| **CLAUDE.md**        | Provides context to improve AI accuracy |
| **/plan**            | Helps AI understand complex tasks       |
| **/verify**          | Catches the 45% of vulnerable AI code   |
| **/security-review** | Addresses AI-specific vulnerabilities   |
| **verify-deps.sh**   | Catches hallucinated packages           |
| **Session handoffs** | Maintains context across sessions       |

**The framework doesn't discourage AI use—it makes AI use safer and more effective.**

---

## References

- [MIT/NBER GitHub Copilot Study](https://itrevolution.com/articles/new-research-reveals-ai-coding-assistants-boost-developer-productivity-by-26-what-it-leaders-need-to-know/)
- [METR Experienced Developer Study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)
- [Accenture/GitHub Enterprise Study](https://github.blog/news-insights/research/research-quantifying-github-copilots-impact-in-the-enterprise-with-accenture/)
- [JetBrains State of Developer Ecosystem 2025](https://blog.jetbrains.com/research/2025/10/state-of-developer-ecosystem-2025/)
- [Stack Overflow Developer Survey 2025](https://survey.stackoverflow.co/2025/ai)
- [Veracode GenAI Code Security Report 2025](https://www.veracode.com/blog/genai-code-security-report/)
- [Apiiro Fortune 50 AI Coding Study](https://apiiro.com/blog/4x-velocity-10x-vulnerabilities-ai-coding-assistants-are-shipping-more-risks/)
- [Faros AI Productivity Paradox Report](https://www.faros.ai/blog/ai-software-engineering)

---

_Last Updated: December 2024_
