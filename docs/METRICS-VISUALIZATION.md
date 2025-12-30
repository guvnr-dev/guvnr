# Metrics Dashboard & Visualization Guide

This guide covers collecting, visualizing, and analyzing AI Excellence Framework metrics to measure the effectiveness of AI-assisted development.

## Overview

The framework collects metrics on:
- Session duration and task completion
- Friction points encountered and mitigated
- AI tool usage patterns
- Code quality indicators
- Security scan results

---

## Quick Start

### Collect Metrics

```bash
# Manual collection at session end
./scripts/metrics/collect-session-metrics.sh

# Auto-collection mode (runs on git commit hook)
./scripts/metrics/collect-session-metrics.sh --auto

# Export to JSON for visualization
./scripts/metrics/collect-session-metrics.sh --export json > metrics.json
```

### View Summary

```bash
# Quick terminal summary
./scripts/metrics/collect-session-metrics.sh --summary

# Detailed breakdown
./scripts/metrics/collect-session-metrics.sh --verbose
```

---

## Metrics Schema

### Session Metrics

```json
{
  "session": {
    "id": "uuid-v4",
    "started_at": "2025-12-30T10:00:00Z",
    "ended_at": "2025-12-30T12:30:00Z",
    "duration_minutes": 150,
    "project": "my-project"
  },
  "tasks": {
    "total": 5,
    "completed": 4,
    "in_progress": 1,
    "blocked": 0
  },
  "ai_interactions": {
    "total_queries": 42,
    "successful": 38,
    "required_retry": 4,
    "context_resets": 1
  },
  "friction_points": {
    "encountered": ["context_loss", "hallucination"],
    "mitigated": ["context_loss"],
    "unresolved": ["hallucination"]
  },
  "quality": {
    "commits": 3,
    "tests_added": 5,
    "tests_passed": true,
    "lint_errors": 0,
    "security_issues": 0
  }
}
```

### Aggregate Metrics (Weekly/Monthly)

```json
{
  "period": {
    "start": "2025-12-01",
    "end": "2025-12-31",
    "type": "monthly"
  },
  "sessions": {
    "count": 45,
    "total_hours": 112.5,
    "avg_session_minutes": 150
  },
  "productivity": {
    "tasks_completed": 187,
    "completion_rate": 0.94,
    "avg_tasks_per_session": 4.16
  },
  "friction": {
    "most_common": [
      {"type": "context_loss", "count": 23, "mitigation_rate": 0.87},
      {"type": "hallucination", "count": 12, "mitigation_rate": 0.67},
      {"type": "outdated_knowledge", "count": 8, "mitigation_rate": 0.75}
    ]
  },
  "quality_trends": {
    "test_coverage": [68, 71, 73, 75],
    "security_issues": [2, 1, 0, 0],
    "lint_errors": [5, 3, 2, 1]
  }
}
```

---

## Visualization Options

### 1. Terminal-Based (Built-in)

The framework includes a terminal dashboard for quick visualization:

```bash
# Live dashboard (updates every 30s)
./scripts/metrics/dashboard.sh --live

# Static summary with ASCII charts
./scripts/metrics/dashboard.sh --charts
```

**Example Output:**

```
╔══════════════════════════════════════════════════════════════╗
║              AI Excellence Framework Dashboard                ║
╠══════════════════════════════════════════════════════════════╣
║ Session: 2h 30m | Tasks: ████████░░ 4/5 (80%)                ║
╠══════════════════════════════════════════════════════════════╣
║ AI Interactions                                               ║
║ ├─ Queries:     42        ██████████████████░░ 90% success   ║
║ ├─ Retries:     4         ████░░░░░░░░░░░░░░░░ 10%           ║
║ └─ Resets:      1                                             ║
╠══════════════════════════════════════════════════════════════╣
║ Friction Points                                               ║
║ ├─ context_loss:      ████████░░ mitigated                   ║
║ ├─ hallucination:     ████░░░░░░ partial                     ║
║ └─ outdated_knowledge: ██████████ mitigated                  ║
╠══════════════════════════════════════════════════════════════╣
║ Quality Metrics                                               ║
║ ├─ Tests:       ✓ 12 passing                                 ║
║ ├─ Coverage:    75%  ███████░░░                              ║
║ ├─ Lint:        ✓ 0 errors                                   ║
║ └─ Security:    ✓ 0 issues                                   ║
╚══════════════════════════════════════════════════════════════╝
```

### 2. Grafana Dashboard

For teams using Grafana, import our pre-built dashboard.

#### Setup

```bash
# Export metrics to Prometheus format
./scripts/metrics/collect-session-metrics.sh --export prometheus > /var/lib/node_exporter/ai_excellence.prom

# Or push to Pushgateway
./scripts/metrics/collect-session-metrics.sh --export prometheus | curl --data-binary @- http://localhost:9091/metrics/job/ai_excellence
```

#### Dashboard JSON

Create `grafana-dashboard.json`:

```json
{
  "dashboard": {
    "title": "AI Excellence Framework Metrics",
    "panels": [
      {
        "title": "Session Duration Over Time",
        "type": "timeseries",
        "targets": [
          {
            "expr": "ai_excellence_session_duration_minutes",
            "legendFormat": "{{project}}"
          }
        ]
      },
      {
        "title": "Task Completion Rate",
        "type": "gauge",
        "targets": [
          {
            "expr": "ai_excellence_tasks_completed / ai_excellence_tasks_total"
          }
        ],
        "options": {
          "thresholds": [
            {"value": 0.6, "color": "red"},
            {"value": 0.8, "color": "yellow"},
            {"value": 0.9, "color": "green"}
          ]
        }
      },
      {
        "title": "Friction Points by Type",
        "type": "piechart",
        "targets": [
          {
            "expr": "sum by (type) (ai_excellence_friction_encountered)"
          }
        ]
      },
      {
        "title": "AI Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "ai_excellence_ai_successful / ai_excellence_ai_queries"
          }
        ],
        "format": "percent"
      },
      {
        "title": "Quality Trend",
        "type": "timeseries",
        "targets": [
          {
            "expr": "ai_excellence_test_coverage",
            "legendFormat": "Coverage %"
          },
          {
            "expr": "ai_excellence_security_issues",
            "legendFormat": "Security Issues"
          }
        ]
      }
    ]
  }
}
```

### 3. VS Code Extension Dashboard

For VS Code users, view metrics in the IDE:

#### Configuration

Add to `.vscode/settings.json`:

```json
{
  "aiExcellence.metrics.enabled": true,
  "aiExcellence.metrics.showInStatusBar": true,
  "aiExcellence.metrics.autoCollect": true
}
```

#### Webview Dashboard

The VS Code extension includes a webview dashboard accessible via:
- Command Palette: `AI Excellence: Show Metrics Dashboard`
- Status Bar: Click the metrics indicator

### 4. HTML Report

Generate a static HTML report for sharing:

```bash
# Generate report
./scripts/metrics/generate-report.sh > metrics-report.html

# With custom date range
./scripts/metrics/generate-report.sh --from 2025-12-01 --to 2025-12-31 > december-report.html
```

#### Report Template

Create `scripts/metrics/report-template.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>AI Excellence Metrics Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
    .card { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .metric { display: inline-block; margin: 10px 20px; text-align: center; }
    .metric-value { font-size: 2em; font-weight: bold; color: #2563eb; }
    .metric-label { color: #6b7280; }
    .chart-container { height: 300px; }
  </style>
</head>
<body>
  <h1>AI Excellence Framework Metrics</h1>
  <p>Report generated: {{generated_at}}</p>

  <div class="card">
    <h2>Summary</h2>
    <div class="metric">
      <div class="metric-value">{{total_sessions}}</div>
      <div class="metric-label">Sessions</div>
    </div>
    <div class="metric">
      <div class="metric-value">{{total_hours}}h</div>
      <div class="metric-label">Total Time</div>
    </div>
    <div class="metric">
      <div class="metric-value">{{completion_rate}}%</div>
      <div class="metric-label">Completion Rate</div>
    </div>
    <div class="metric">
      <div class="metric-value">{{friction_mitigation_rate}}%</div>
      <div class="metric-label">Friction Mitigated</div>
    </div>
  </div>

  <div class="card">
    <h2>Productivity Trend</h2>
    <div class="chart-container">
      <canvas id="productivityChart"></canvas>
    </div>
  </div>

  <div class="card">
    <h2>Friction Points</h2>
    <div class="chart-container">
      <canvas id="frictionChart"></canvas>
    </div>
  </div>

  <script>
    // Productivity chart
    new Chart(document.getElementById('productivityChart'), {
      type: 'line',
      data: {
        labels: {{date_labels}},
        datasets: [{
          label: 'Tasks Completed',
          data: {{tasks_data}},
          borderColor: '#2563eb',
          tension: 0.1
        }]
      }
    });

    // Friction chart
    new Chart(document.getElementById('frictionChart'), {
      type: 'doughnut',
      data: {
        labels: {{friction_labels}},
        datasets: [{
          data: {{friction_data}},
          backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#6366f1']
        }]
      }
    });
  </script>
</body>
</html>
```

---

## Team Metrics

### Aggregating Across Developers

For teams, aggregate individual metrics:

```bash
# Collect team metrics (requires MCP server running)
./scripts/metrics/collect-team-metrics.sh --team my-team --period weekly

# Export to shared location
./scripts/metrics/collect-team-metrics.sh --export > /shared/metrics/team-weekly.json
```

### Team Dashboard Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Avg Session Length | Mean session duration | 90-150 min |
| Task Completion Rate | Tasks done / tasks started | >90% |
| Friction Mitigation Rate | Friction mitigated / encountered | >80% |
| AI Success Rate | Successful queries / total | >85% |
| Context Reset Frequency | Resets per session | <2 |
| Security Issues Found | By SAST tools | 0 |
| Test Coverage | % of code tested | >70% |

### Leaderboards (Optional)

Track team achievements (opt-in):

```json
{
  "leaderboard": {
    "period": "2025-12",
    "categories": {
      "most_productive": [
        {"developer": "alice", "tasks": 45},
        {"developer": "bob", "tasks": 38}
      ],
      "best_quality": [
        {"developer": "charlie", "coverage": 92},
        {"developer": "alice", "coverage": 88}
      ],
      "friction_fighter": [
        {"developer": "diana", "mitigation_rate": 95},
        {"developer": "bob", "mitigation_rate": 91}
      ]
    }
  }
}
```

---

## Alerts & Thresholds

### Configuring Alerts

Create `ai-excellence.config.json`:

```json
{
  "metrics": {
    "alerts": {
      "session_too_long": {
        "threshold": 240,
        "unit": "minutes",
        "action": "notify",
        "message": "Consider taking a break or using /handoff"
      },
      "low_completion_rate": {
        "threshold": 0.7,
        "window": "weekly",
        "action": "notify",
        "message": "Task completion rate below target"
      },
      "high_friction": {
        "threshold": 5,
        "window": "session",
        "action": "suggest",
        "message": "Multiple friction points - consider /verify"
      },
      "security_issues": {
        "threshold": 1,
        "action": "block",
        "message": "Security issues must be resolved before commit"
      }
    }
  }
}
```

### Integration with CI/CD

Add metrics check to CI:

```yaml
- name: Check metrics thresholds
  run: |
    COMPLETION_RATE=$(jq '.productivity.completion_rate' metrics.json)
    if (( $(echo "$COMPLETION_RATE < 0.8" | bc -l) )); then
      echo "⚠️ Completion rate $COMPLETION_RATE below threshold 0.8"
    fi
```

---

## Privacy & Data Handling

### What We Collect

- Session duration and timestamps
- Task counts (not content)
- Friction point types (not details)
- Quality metrics (coverage %, lint count)
- Aggregate patterns

### What We Don't Collect

- Code content or snippets
- Specific file names
- Query content
- Personal information
- Repository URLs

### Data Storage

```bash
# Local storage only (default)
~/.claude/metrics/

# Team storage (optional, requires explicit setup)
# Configure MCP server for shared metrics
```

### Opt-Out

```bash
# Disable metrics collection
export AI_EXCELLENCE_METRICS_DISABLED=true

# Or in config
{
  "metrics": {
    "enabled": false
  }
}
```

---

## Best Practices

1. **Review weekly**: Schedule 10 minutes weekly to review metrics trends
2. **Focus on trends**: Individual data points matter less than direction
3. **Share insights**: Use team dashboards to identify common friction points
4. **Iterate on mitigations**: If a friction point keeps appearing, enhance mitigation
5. **Celebrate progress**: Acknowledge improvements in completion and quality rates

---

## Sources

- [Grafana Dashboard Documentation](https://grafana.com/docs/grafana/latest/dashboards/)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Prometheus Metrics Format](https://prometheus.io/docs/instrumenting/exposition_formats/)
