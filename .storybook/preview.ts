import { setCompodocJson } from '@storybook/addon-docs/angular';
import { Preview, applicationConfig } from '@storybook/angular';
import {
  QueryClient,
  provideAngularQuery,
} from '@tanstack/angular-query-experimental';
import docJson from '../documentation.json';

setCompodocJson(docJson);

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [provideAngularQuery(new QueryClient())],
    }),
  ],
};

export default preview;
