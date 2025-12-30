import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'AI Excellence Framework',
  description: 'A comprehensive framework for reducing friction in AI-assisted software development',

  // Clean URLs (no .html extension)
  cleanUrls: true,

  // Build output
  outDir: '../dist',

  // Theme configuration
  themeConfig: {
    // Logo and title
    logo: '/logo.svg',
    siteTitle: 'AI Excellence Framework',

    // Navigation bar
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Getting Started', link: '/getting-started' },
      { text: 'Documentation', link: '/docs/' },
      { text: 'Commands', link: '/commands/' },
      {
        text: 'Resources',
        items: [
          { text: 'Quick Reference', link: '/quick-reference' },
          { text: 'Model Selection', link: '/model-selection' },
          { text: 'Troubleshooting', link: '/troubleshooting' }
        ]
      },
      {
        text: 'v1.0.0',
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'GitHub', link: 'https://github.com/ai-excellence-framework/ai-excellence-framework' }
        ]
      }
    ],

    // Sidebar configuration
    sidebar: {
      '/docs/': [
        {
          text: 'Introduction',
          items: [
            { text: 'What is AI Excellence?', link: '/docs/' },
            { text: 'Why This Framework?', link: '/docs/why' },
            { text: 'Core Concepts', link: '/docs/concepts' }
          ]
        },
        {
          text: 'The Friction Problem',
          items: [
            { text: 'Understanding Friction', link: '/docs/friction/' },
            { text: 'Context Management', link: '/docs/friction/context' },
            { text: 'Security Concerns', link: '/docs/friction/security' },
            { text: 'Quality Degradation', link: '/docs/friction/quality' },
            { text: 'Research Findings', link: '/docs/friction/research' }
          ]
        },
        {
          text: 'Mitigation Strategies',
          items: [
            { text: 'Overview', link: '/docs/mitigations/' },
            { text: 'CLAUDE.md Best Practices', link: '/docs/mitigations/claude-md' },
            { text: 'Slash Commands', link: '/docs/mitigations/commands' },
            { text: 'Subagents', link: '/docs/mitigations/agents' },
            { text: 'MCP Server', link: '/docs/mitigations/mcp' },
            { text: 'Git Hooks', link: '/docs/mitigations/hooks' }
          ]
        },
        {
          text: 'Security',
          items: [
            { text: 'Overview', link: '/docs/security/' },
            { text: 'AI-Specific Vulnerabilities', link: '/docs/security/ai-vulns' },
            { text: 'MCP Security', link: '/docs/security/mcp' },
            { text: 'Pre-commit Hooks', link: '/docs/security/hooks' },
            { text: 'Security Checklist', link: '/docs/security/checklist' }
          ]
        },
        {
          text: 'Team Adoption',
          items: [
            { text: 'Team Setup', link: '/docs/team/' },
            { text: 'Shared Memory', link: '/docs/team/memory' },
            { text: 'Convention Enforcement', link: '/docs/team/conventions' },
            { text: 'Metrics & Insights', link: '/docs/team/metrics' }
          ]
        }
      ],
      '/commands/': [
        {
          text: 'Slash Commands',
          items: [
            { text: 'Overview', link: '/commands/' },
            { text: '/plan', link: '/commands/plan' },
            { text: '/verify', link: '/commands/verify' },
            { text: '/handoff', link: '/commands/handoff' },
            { text: '/assumptions', link: '/commands/assumptions' },
            { text: '/review', link: '/commands/review' },
            { text: '/security-review', link: '/commands/security-review' },
            { text: '/refactor', link: '/commands/refactor' },
            { text: '/test-coverage', link: '/commands/test-coverage' }
          ]
        },
        {
          text: 'Subagents',
          items: [
            { text: 'Overview', link: '/commands/agents/' },
            { text: 'Explorer', link: '/commands/agents/explorer' },
            { text: 'Reviewer', link: '/commands/agents/reviewer' },
            { text: 'Tester', link: '/commands/agents/tester' }
          ]
        }
      ]
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ai-excellence-framework/ai-excellence-framework' }
    ],

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024-present AI Excellence Framework Contributors'
    },

    // Edit link
    editLink: {
      pattern: 'https://github.com/ai-excellence-framework/ai-excellence-framework/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    // Last updated
    lastUpdated: {
      text: 'Updated at',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },

    // Search (local)
    search: {
      provider: 'local'
    },

    // Carbon ads (optional - for sustainability)
    // carbonAds: {
    //   code: 'your-carbon-code',
    //   placement: 'your-carbon-placement'
    // }
  },

  // Markdown configuration
  markdown: {
    lineNumbers: true,
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    }
  },

  // Head metadata
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#3eaf7c' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:locale', content: 'en' }],
    ['meta', { name: 'og:site_name', content: 'AI Excellence Framework' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ]
})
