import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from '@storybook/jest';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  args: {
    label: 'Click me',
  }
};
export default meta;

type Story = StoryObj<ButtonComponent>;

export const Default: Story = {
  args: {}
};

export const WithIcon: Story = {
  args: {
    icon: 'pi pi-check',
    label: 'Confirm'
  }
};

export const IconOnly: Story = {
  args: {
    icon: 'pi pi-search',
    ariaLabel: 'Search'
  }
};

export const Disabled: Story = {
  args: {
    disabled: true,
    label: 'Disabled Button'
  }
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="flex gap-2">
        <a-button size="small" label="Small" />
        <a-button size="normal" label="Normal" />
        <a-button size="large" label="Large" />
      </div>
    `
  })
};

export const Types: Story = {
  render: () => ({
    template: `
      <div class="flex flex-wrap gap-2">
        <a-button type="primary" label="Primary" />
        <a-button type="secondary" label="Secondary" />
        <a-button type="success" label="Success" />
        <a-button type="warning" label="Warning" />
        <a-button type="danger" label="Danger" />
        <a-button type="info" label="Info" />
        <a-button type="help" label="Help" />
      </div>
    `
  })
};

export const WithTooltip: Story = {
  args: {
    label: 'Hover me',
    tooltip: 'This is a helpful tooltip'
  }
};

export const ClickInteraction: Story = {
  args: {
    label: 'Click me'
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await userEvent.click(button);
    await expect(button).toHaveFocus();
  }
};

export const DisabledInteraction: Story = {
  args: {
    label: 'Disabled',
    disabled: true
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    
    await expect(button).toBeDisabled();
    await userEvent.click(button);
    await expect(button).not.toHaveFocus();
  }
}; 