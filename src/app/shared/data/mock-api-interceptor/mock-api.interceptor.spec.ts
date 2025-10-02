import { HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { mockApiInterceptor } from './mock-api.interceptor';
import { MockApiService } from './mock-api.service';

describe('mockApiInterceptor', () => {
  let mockApiService: MockApiService;
  let nextHandler: { handle: jest.Mock };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MockApiService],
    });

    mockApiService = TestBed.inject(MockApiService);
    nextHandler = { handle: jest.fn() };
  });

  describe('when there is a mocked response', () => {
    const mockResponse = {
      status: 200,
      body: { data: 'test' },
      delay: 100,
    };

    beforeEach(() => {
      jest.spyOn(mockApiService, 'getResponse').mockReturnValue(mockResponse);
    });

    it('should return mocked response with delay', async () => {
      // Arrange
      const request = new HttpRequest('GET', '/test');

      // Act
      const response = (await firstValueFrom(
        TestBed.runInInjectionContext(() =>
          mockApiInterceptor(request, nextHandler as any)
        ),
      )) as HttpResponse<unknown>;

      // Assert
      expect(mockApiService.getResponse).toHaveBeenCalledWith('/test', 'GET');
      expect(response).toBeInstanceOf(HttpResponse);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: 'test' });
      expect(nextHandler.handle).not.toHaveBeenCalled();
    });
  });

  describe('when there is no mocked response', () => {
    beforeEach(() => {
      jest.spyOn(mockApiService, 'getResponse').mockReturnValue(null);
    });

    it('should pass request to next handler', () => {
      // Arrange
      const request = new HttpRequest('POST' as 'GET', '/test');

      // Act
      TestBed.runInInjectionContext(() =>
        mockApiInterceptor(request, nextHandler as any)
      );

      // Assert
      expect(mockApiService.getResponse).toHaveBeenCalledWith('/test', 'POST');
      expect(nextHandler.handle).toHaveBeenCalledWith(request);
    });
  });
});
