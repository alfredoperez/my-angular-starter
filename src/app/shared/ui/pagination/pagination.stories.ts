import { Meta, StoryObj } from '@storybook/angular';
import { PaginationComponent } from '@my/shared/ui';

const meta: Meta<PaginationComponent> = {
  title: 'Shared/Components/Pagination',
  component: PaginationComponent,
  args: {
    totalItems: 100,
    currentPage: 1,
    itemsPerPage: 10,
  },
};

export default meta;
type Story = StoryObj<PaginationComponent>;

export const Default: Story = {
  args: {
    totalItems: 100,
    currentPage: 1,
    itemsPerPage: 10,
  },
};
