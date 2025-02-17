import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.ts',
    '../.storybook/stories/**/*.mdx',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@chromatic-com/storybook',
    '@storybook/addon-mdx-gfm'
  ],
  docs: {
    defaultName: 'Documentation'
  },
  framework: {
    name: '@storybook/angular',
    options: {},
  },
};
export default config;
