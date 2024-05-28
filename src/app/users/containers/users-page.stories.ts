import { Meta, StoryObj } from '@storybook/angular';
import { setApiRequestMocks } from '../../../../.storybook';
import { UsersPageComponent } from './users-page.component';
import { usersPageMocks } from './users-page.mocks';

const meta: Meta<UsersPageComponent> = {
  title: 'Users/Users Page',
  component: UsersPageComponent,
  tags: ['!autodocs'],
};

export default meta;
type Story = StoryObj<UsersPageComponent>;

export const Default: Story = {
  decorators: [setApiRequestMocks([usersPageMocks.requests.users])],
};
