import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Shared/Components/Button',
  component: ButtonComponent,
  render: (args) => ({
    props: args,
    template: `<ui-button ${argsToTemplate(args)}>Button!</ui-button>`,
  }),
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Default: Story = {};

export const Primary = {
  args: {
    color: 'primary',
  },
};

export const Secondary = {
  args: {
    color: 'secondary',
  },
};

export const Tertiary = {
  args: {
    color: 'tertiary',
  },
};

export const Error = {
  args: {
    color: 'error',
  },
};
