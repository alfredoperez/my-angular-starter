import { Meta, StoryObj } from '@storybook/angular';
import { setApiMocks } from '../../../../.storybook';
import { UsersPageComponent } from './users-page.component';
import { usersPageMocks as mocks } from './users-page.mocks';

const meta: Meta<UsersPageComponent> = {
  title: 'Users/Users Page',
  component: UsersPageComponent,
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<UsersPageComponent>;

export const Default: Story = {
  decorators: [setApiMocks([mocks.requests.users])],
};

export const WithoutData: Story = {
  decorators: [setApiMocks([mocks.requests.withoutUsers])],
};
