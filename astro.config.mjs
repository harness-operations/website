import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import starlight from '@astrojs/starlight';
import { remarkSpecLinks } from './scripts/remark-spec-links.mjs';

export default defineConfig({
  site: 'https://harness-operations.com',
  markdown: {
    processor: unified({
      remarkPlugins: [remarkSpecLinks],
    }),
  },
  integrations: [
    starlight({
      title: 'Harness Operations',
      description: 'The canonical reference for operating agent Harnesses in real systems.',
      customCss: ['./src/styles/custom.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/harness-operations/specification',
        },
      ],
      sidebar: [
        {
          label: 'Systems',
          items: [
            { label: 'Systems overview', slug: 'systems' },
            { label: 'Operating arrangements', slug: 'systems/operating-arrangements' },
            {
              label: 'Coding & orchestration',
              items: [
                { label: 'OpenAI Codex', slug: 'systems/openai-codex' },
                { label: 'Anthropic Claude Code', slug: 'systems/anthropic-claude-code' },
                { label: 'Claude Projects (beta)', slug: 'systems/claude-projects' },
                { label: 'Coding comparison', slug: 'systems/coding-harnesses' },
              ],
            },
            {
              label: 'Security & testing',
              items: [
                { label: 'Antares models', slug: 'systems/antares-models' },
                { label: 'Antares CLI', slug: 'systems/antares-cli' },
                { label: 'Cisco Foundry Security Spec', slug: 'systems/cisco-foundry-security-spec' },
                { label: 'Playwright Test Agents', slug: 'systems/playwright-test-agents' },
              ],
            },
            {
              label: 'Execution surfaces',
              items: [
                { label: 'Browser Use', slug: 'systems/browser-use' },
                { label: 'Computer Use', slug: 'systems/computer-use' },
                { label: 'Realtime Voice', slug: 'systems/realtime-voice' },
                { label: 'Background Execution', slug: 'systems/background-execution' },
              ],
            },
            {
              label: 'Applications & evaluation',
              items: [
                { label: 'FireRed-OpenStoryline', slug: 'systems/firered-openstoryline' },
                { label: 'Agent Evaluation', slug: 'systems/agent-evaluation' },
              ],
            },
          ],
        },
        {
          label: 'Compare & validate',
          items: [
            { label: 'System Comparisons', slug: 'apply/matrix' },
            { label: 'Comparison methodology', slug: 'apply/comparison-methodology' },
            { label: 'Approved handoff example', slug: 'apply/example' },
            {
              label: 'Operational patterns',
              items: [
                { label: 'Approval at execution time', slug: 'apply/patterns/approval-valid-at-execution-time' },
                { label: 'Stop, revoke, and recover', slug: 'apply/patterns/stop-revoke-and-recover' },
                { label: 'Model-informed decisions', slug: 'apply/patterns/model-informed-decisions' },
              ],
            },
          ],
        },
        {
          label: 'Reference Model',
          items: [
            { slug: 'overview' },
            { slug: 'principles' },
            { slug: 'model' },
            { slug: 'governance' },
            { label: 'Standards and Boundaries', slug: 'standards' },
            { slug: 'terminology' },
          ],
        },
        {
          label: 'Project',
          items: [
            {
              label: 'Releases',
              link: 'https://github.com/harness-operations/specification/releases',
            },
            {
              label: 'Proposals',
              link: 'https://github.com/harness-operations/specification/tree/main/proposals',
            },
            {
              label: 'Community',
              link: 'https://github.com/harness-operations/specification/issues',
            },
          ],
        },
      ],
    }),
  ],
});
