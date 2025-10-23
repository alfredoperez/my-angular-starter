import { TestBed } from '@angular/core/testing';
import { provideQueryClient, injectQueryClient, QueryClient } from '@ngneat/query';

describe('Query Configuration', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideQueryClient(new QueryClient({
          defaultOptions: {
            queries: {
              staleTime: 1000 * 60 * 5, // 5 minutes
              gcTime: 1000 * 60 * 10, // 10 minutes
              retry: 1,
              refetchOnWindowFocus: false,
            },
          },
        })),
      ],
    });
  });

  it('should provide QueryClient', () => {
    TestBed.runInInjectionContext(() => {
      const queryClient = injectQueryClient();
      expect(queryClient).toBeDefined();
      expect(queryClient).toBeInstanceOf(QueryClient);
    });
  });

  it('should have correct default query options', () => {
    TestBed.runInInjectionContext(() => {
      const queryClient = injectQueryClient();
      const defaultOptions = queryClient.getDefaultOptions();

      expect(defaultOptions.queries?.staleTime).toBe(1000 * 60 * 5); // 5 minutes
      expect(defaultOptions.queries?.gcTime).toBe(1000 * 60 * 10); // 10 minutes
      expect(defaultOptions.queries?.retry).toBe(1);
      expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(false);
    });
  });

  it('should allow query client operations', () => {
    TestBed.runInInjectionContext(() => {
      const queryClient = injectQueryClient();

      // Verify basic QueryClient methods are available
      expect(typeof queryClient.setQueryData).toBe('function');
      expect(typeof queryClient.getQueryData).toBe('function');
      expect(typeof queryClient.invalidateQueries).toBe('function');
      expect(typeof queryClient.prefetchQuery).toBe('function');
    });
  });
});
