import { Meta, StoryObj, argsToTemplate } from '@storybook/angular';
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
    size: 'md',
    type: 'primary',
  },
};

export const Secondary = {
  args: {
    type: 'secondary',
  },
};

export const PrimaryAndLarge = {
  args: {
    size: 'lg',
    type: 'primary',
  },
};
