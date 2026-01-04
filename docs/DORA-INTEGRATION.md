# DORA Metrics Integration Guide

This guide explains how to integrate DORA metrics with Guvnr to measure and improve AI-assisted software delivery performance.

## Overview

The 2025 DORA Report (now titled "State of AI-Assisted Software Development") reveals a critical insight: **AI amplifies what's already there**. Strong teams use AI to become more effective; struggling teams find AI intensifies their problems.

This framework helps you build the foundation that makes AI adoption successful.

## The Four Key DORA Metrics

| Metric                    | Definition                            | AI Impact (2025)                  |
| ------------------------- | ------------------------------------- | --------------------------------- |
| **Deployment Frequency**  | How often code deploys to production  | ↑ 21% with AI adoption            |
| **Lead Time for Changes** | Time from commit to production        | ↑ Faster initially, then plateaus |
| **Change Failure Rate**   | % of deployments causing failures     | ↑ Higher with AI (7.2%)           |
| **Mean Time to Recovery** | Time to restore service after failure | → Unchanged                       |

**Key Finding**: AI boosts throughput but increases instability. The framework's verification and security protocols address this.

## The AI Productivity Paradox

From the 2025 DORA Report:

```
Individual Metrics:         Team Metrics:
├─ 21% more tasks          ├─ Delivery velocity: Flat
├─ 98% more PRs merged     ├─ Lead time: Flat
├─ 47% more PRs touched    └─ Stability: Declining
└─ 9% more context switches
```

**What this means**: AI makes individuals faster at producing code, but organizational delivery metrics stay flat because:

1. PR review becomes the bottleneck (91% increase in review time)
2. More code means more bugs to fix
3. Context switching increases cognitive load

**How the framework helps**: The `/verify` command and security hooks catch issues before they enter the review queue.

## Seven Capabilities That Amplify AI Benefits

The 2025 DORA research identifies seven capabilities that multiply AI's positive impact:

### 1. Clear AI Policy (Psychological Safety)

```markdown
## AI Usage Policy (add to CLAUDE.md)

### Acceptable Uses

- Code generation with human review
- Test generation
- Documentation drafts
- Refactoring suggestions

### Requires Human Approval

- Security-sensitive code
- Database migrations
- API contract changes
- Production deployments

### Not Permitted

- Committing without review
- Bypassing CI/CD
- Disabling security hooks
```

### 2. User-Centric Focus

Teams without user focus see **negative** AI impact. Add to your CLAUDE.md:

```markdown
## User Focus

### Primary Users

- [Describe your users]

### User Metrics We Track

- [Key user satisfaction metrics]

### Before Implementing

- Ask: "Does this serve the user?"
- Use /assumptions to surface user impact
```

### 3. High-Quality Platform

90% of organizations have adopted internal platforms. Quality matters:

| Platform Quality | AI Benefit |
| ---------------- | ---------- |
| High             | Amplified  |
| Medium           | Moderate   |
| Low              | Negligible |

The framework's MCP server provides a quality foundation for AI context.

### 4. Healthy Data Ecosystem

AI is only as good as its data. Ensure:

- Clean training data (no secrets in context)
- Accurate project documentation (CLAUDE.md)
- Historical decision records (MCP memory)

### 5. Code Review Excellence

AI increases PR volume by 98%. Optimize reviews:

```bash
# Use /review before submitting PRs
/review path/to/changed/files

# Run security review for AI-generated code
/security-review path/to/new/code
```

### 6. Test Automation

AI-generated code has higher defect rates. Compensate with testing:

```bash
# Generate tests for AI code
/test-coverage path/to/ai-generated-code

# Target: 80%+ coverage for AI-generated components
```

### 7. Deployment Automation

Reduce manual deployment steps to contain AI-introduced instability:

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    steps:
      - uses: actions/checkout@v4
      - run: npm test
      - run: npm run lint
      - run: npx guvnr validate
      - run: npm run deploy
```

## Measuring AI Impact on DORA Metrics

### Tracking Setup

Add metrics collection to your workflow:

```bash
# Enable framework metrics
npx guvnr init --preset full

# Collect session metrics
./scripts/metrics/collect-session-metrics.sh --auto
```

### Dashboard Integration

#### Grafana

```promql
# AI Productivity Ratio
rate(ai_tasks_completed[1h]) / rate(total_tasks_completed[1h])

# AI Code Quality
1 - (rate(ai_code_failures[1d]) / rate(ai_code_deployments[1d]))

# Verification Effectiveness
rate(issues_caught_by_verify[1w]) / rate(total_issues_found[1w])
```

#### Custom Metrics

Track framework-specific metrics:

| Metric                      | Source        | Target    |
| --------------------------- | ------------- | --------- |
| `/verify` catch rate        | Session logs  | > 30%     |
| `/security-review` findings | Security logs | Declining |
| Session handoff quality     | Handoff docs  | 100%      |
| Context retention           | MCP queries   | > 80%     |

## Team Archetypes (2025 DORA Model)

The 2025 DORA Report introduces seven team archetypes replacing the traditional elite/high/medium/low model:

| Archetype        | Characteristics                          | Framework Focus          |
| ---------------- | ---------------------------------------- | ------------------------ |
| **Thriving**     | High performance + high well-being       | Maintain with automation |
| **Accelerating** | Improving performance, stable well-being | Add `/plan` discipline   |
| **Coasting**     | Stable but not improving                 | Introduce `/verify`      |
| **Stressed**     | High performance, low well-being         | Reduce toil with AI      |
| **Recovering**   | Improving from burnout                   | Focus on `/handoff`      |
| **Struggling**   | Low performance, low well-being          | Start with CLAUDE.md     |
| **Starting**     | New team, establishing baseline          | Full framework adoption  |

## Integration Checklist

### Phase 1: Foundation (Week 1)

- [ ] Install framework: `npx guvnr init`
- [ ] Create CLAUDE.md with AI policy section
- [ ] Enable pre-commit hooks
- [ ] Document current DORA baseline

### Phase 2: Measurement (Week 2-3)

- [ ] Set up metrics collection
- [ ] Create dashboard for tracking
- [ ] Establish AI usage tracking
- [ ] Define success criteria

### Phase 3: Optimization (Week 4+)

- [ ] Analyze AI impact on each DORA metric
- [ ] Identify bottlenecks (likely PR review)
- [ ] Implement targeted improvements
- [ ] Iterate based on data

## Research References

- [2025 DORA Report](https://cloud.google.com/resources/content/2025-dora-ai-assisted-software-development-report) - State of AI-Assisted Software Development
- [DORA Capabilities](https://dora.dev/capabilities/) - Full capability catalog
- [AI Productivity Paradox](https://www.faros.ai/blog/key-takeaways-from-the-dora-report-2025) - Analysis of 2025 findings

## Related Documentation

- [Metrics Visualization Guide](./METRICS-VISUALIZATION.md)
- [Enterprise Deployment Guide](./guides/enterprise.md)
- [When AI Helps](./WHEN-AI-HELPS.md)

---

_Last Updated: December 2025_
_Based on: 2025 DORA Report, ~5,000 respondents, 100+ hours qualitative research_
