import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { applicationConfig } from '@storybook/angular';
import { mocksInterceptor } from '../../src/app/shared/utils/api-mocks/api-mocks.interceptor';
import { ApiRequestMock } from '../../src/app/shared/utils/api-mocks/api-mocks.models';

/**
 * Set API request mocks for the story, by providing a list of mocks to the HttpClient provider
 * with the mocksInterceptor.
 * @param requestMocks
 */
export const setApiMocks = (requestMocks: Array<ApiRequestMock>) =>
  applicationConfig({

    providers: [
      provideHttpClient(withInterceptors([mocksInterceptor(requestMocks)])),
    ],
  });
