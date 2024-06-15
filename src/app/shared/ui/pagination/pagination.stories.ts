import { Meta, StoryObj } from '@storybook/angular';
import { expect, userEvent, within } from '@storybook/test';
import { PaginationComponent } from '@my/shared/ui';

const meta: Meta<PaginationComponent> = {
  title: 'Shared/Components/Pagination',
  component: PaginationComponent,
  tags: ['!autodocs'],
  args: {
    totalItems: 100,
    currentPage: 1,
    itemsPerPage: 10,
  },
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    //  Click the second page
    await userEvent.click(canvas.getByText(2));

    // 👇 Assert that 11 shows up in the screen

    await expect(canvas.getByText(/11/i)).toBeInTheDocument();
  },
};

export const WithFewItems: Story = {
  args: {
    totalItems: 5,
  },
};
