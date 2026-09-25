import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import starlight from '@astrojs/starlight';
import { remarkSpecLinks } from './scripts/remark-spec-links.mjs';

const release = JSON.parse(
  readFileSync(new URL('./SPEC_RELEASE.json', import.meta.url), 'utf8'),
);
const displayVersion = release.version.replace(/^v/, '');

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
      description: 'The open discipline and reference model for operating agent harnesses at scale.',
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
          label: `Reference Model ${displayVersion}`,
          items: [
            { slug: 'overview' },
            { slug: 'principles' },
            { slug: 'model' },
            { slug: 'governance' },
            { slug: 'landscape' },
          ],
        },
        {
          label: 'Apply the model',
          items: [
            { label: 'Applied Harness Operations', slug: 'apply' },
            { label: 'Landscape Matrix', slug: 'apply/matrix' },
            { label: 'Approved Handoff Example', slug: 'apply/example' },
            {
              label: 'Patterns',
              items: [
                { label: 'Approval at execution time', slug: 'apply/patterns/approval-valid-at-execution-time' },
                { label: 'Stop, revoke, and recover', slug: 'apply/patterns/stop-revoke-and-recover' },
                { label: 'Model-informed decisions', slug: 'apply/patterns/model-informed-decisions' },
              ],
            },
            {
              label: 'Mappings',
              items: [
                { label: 'Codex App Server 0.157.0', slug: 'apply/mappings/codex-app-server' },
                { label: 'Claude Code CLI 2.1.282', slug: 'apply/mappings/claude-code-cli' },
              ],
            },
            { label: 'Comparison Methodology', slug: 'apply/comparison-methodology' },
            { label: 'External Validation Status', slug: 'apply/external-validation' },
          ],
        },
        {
          label: 'Project',
          items: [
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
