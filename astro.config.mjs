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
          label: 'Reference Model 0.1',
          items: [
            { slug: 'overview' },
            { slug: 'principles' },
            { slug: 'model' },
            { slug: 'governance' },
            { slug: 'landscape' },
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
