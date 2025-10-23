import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Injector, runInInjectionContext } from '@angular/core';
import { provideQueryClient, QueryClient, injectQueryClient } from '@ngneat/query';
import { UsersRepository } from './users.repository';
import { User } from './users.models';
import { RequestOptions } from '../../shared/data/api.models';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let httpTesting: HttpTestingController;
  let injector: Injector;

  const mockUser: User = {
    id: '1',
    name: 'Alice Smith',
    age: 30,
    email: 'alice@example.com',
    company: 'Acme Corp',
    title: 'Senior Developer',
    department: 'Engineering',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-15'),
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsersRepository,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideQueryClient(
          new QueryClient({
            defaultOptions: {
              queries: {
                retry: false,
                gcTime: 0,
              },
              mutations: {
                retry: false,
              },
            },
          })
        ),
      ],
    });

    repository = TestBed.inject(UsersRepository);
    httpTesting = TestBed.inject(HttpTestingController);
    injector = TestBed.inject(Injector);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('Repository Instantiation', () => {
    it('should be created', () => {
      expect(repository).toBeTruthy();
    });

    it('should have entityName set to "users"', () => {
      expect(repository['entityName']).toBe('users');
    });

    it('should inherit all CRUD methods from CrudRepository', () => {
      expect(repository.fetchPage).toBeDefined();
      expect(repository.fetchById).toBeDefined();
      expect(repository.create).toBeDefined();
      expect(repository.update).toBeDefined();
      expect(repository.delete).toBeDefined();
      expect(repository.prefetchNextPage).toBeDefined();
    });
  });

  describe('Type Safety', () => {
    it('should be properly typed for User entity', () => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchPage();
        const result = query.result();

        // These type checks should compile without errors
        const data: User[] | undefined = result.data?.items;
        const isLoading: boolean = result.isLoading;
        const error: Error | null = result.error;

        expect(typeof isLoading).toBe('boolean');

        // Clean up
        const req = httpTesting.expectOne((req) => req.url.includes('users'));
        req.flush([], { headers: { 'X-Total-Count': '0' } });
      });
    });
  });

  describe('fetchPage Query', () => {
    it('should create a query and make HTTP GET request', (done) => {
      runInInjectionContext(injector, () => {
        const options: Partial<RequestOptions> = {
          pagination: { page: 0, limit: 10 },
          orderBy: 'name',
          orderDirection: 'ASC',
        };

        const query = repository.fetchPage(options);
        const _data = query.result().data; // Trigger query

        setTimeout(() => {
          const req = httpTesting.expectOne(
            (req) =>
              req.url === 'http://localhost:3000/users' &&
              req.params.get('_limit') === '10' &&
              req.params.get('_page') === '0' &&
              req.params.get('_sort') === 'name'
          );

          expect(req.request.method).toBe('GET');

          req.flush([mockUser], {
            headers: { 'X-Total-Count': '50' },
          });

          done();
        }, 0);
      });
    });

    it('should handle DESC sorting', (done) => {
      runInInjectionContext(injector, () => {
        const options: Partial<RequestOptions> = {
          pagination: { page: 0, limit: 10 },
          orderBy: 'createdAt',
          orderDirection: 'DESC',
        };

        const query = repository.fetchPage(options);
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne(
            (req) =>
              req.url.includes('users') && req.params.get('_sort') === '-createdAt'
          );

          expect(req.request.method).toBe('GET');
          req.flush([], { headers: { 'X-Total-Count': '0' } });

          done();
        }, 0);
      });
    });

    it('should return loading state initially', () => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchPage({});

        const isLoading = query.result().isLoading;
        const data = query.result().data;

        expect(isLoading).toBe(true);
        expect(data).toBeUndefined();

        // Clean up
        const req = httpTesting.expectOne((req) => req.url.includes('users'));
        req.flush([], { headers: { 'X-Total-Count': '0' } });
      });
    });

    it('should handle query errors', (done) => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchPage({});
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne((req) => req.url.includes('users'));
          req.flush('Server error', {
            status: 500,
            statusText: 'Internal Server Error',
          });

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const isError = query.result().isError;
              const error = query.result().error;
              expect(isError).toBe(true);
              expect(error).toBeDefined();
              done();
            });
          }, 10);
        }, 0);
      });
    });
  });

  describe('fetchById Query', () => {
    it('should create a query and make HTTP GET request to detail endpoint', (done) => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchById('123');
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne('http://localhost:3000/users/123');
          expect(req.request.method).toBe('GET');

          req.flush(mockUser);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = query.result().data;
              expect(data).toEqual(mockUser);
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should be disabled when ID is empty', () => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchById('');
        const _data = query.result().data;

        // Query should be disabled, so no HTTP request should be made
        httpTesting.expectNone('http://localhost:3000/users/');
      });
    });

    it('should handle errors', (done) => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchById('123');
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne('http://localhost:3000/users/123');
          req.flush('Not found', { status: 404, statusText: 'Not Found' });

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const isError = query.result().isError;
              expect(isError).toBe(true);
              done();
            });
          }, 10);
        }, 0);
      });
    });
  });

  describe('create Mutation', () => {
    it('should create a mutation and make HTTP POST request', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.create();
        const newUser: Partial<User> = {
          name: 'John Doe',
          email: 'john@example.com',
          age: 25,
        };

        mutation.mutate(newUser);

        setTimeout(() => {
          const req = httpTesting.expectOne('http://localhost:3000/users');
          expect(req.request.method).toBe('POST');
          expect(req.request.body).toEqual(newUser);

          req.flush({ ...newUser, id: '123' } as User);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = mutation.result().data;
              expect(data?.id).toBe('123');
              expect(data?.name).toBe('John Doe');
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should invalidate queries on success', (done) => {
      runInInjectionContext(injector, () => {
        const queryClient = injectQueryClient();
        jest.spyOn(queryClient, 'invalidateQueries');

        const mutation = repository.create();
        mutation.mutate({ name: 'John' });

        setTimeout(() => {
          const req = httpTesting.expectOne('http://localhost:3000/users');
          req.flush({ id: '1', name: 'John' } as User);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['users'],
              });
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should handle mutation errors', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.create();
        mutation.mutate({ name: 'John' });

        setTimeout(() => {
          const req = httpTesting.expectOne('http://localhost:3000/users');
          req.flush('Server Error', { status: 500, statusText: 'Server Error' });

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const result = mutation.result();
              expect(result.isError).toBe(true);
              expect(result.error).toBeTruthy();
              done();
            });
          }, 10);
        }, 0);
      });
    });
  });

  describe('update Mutation', () => {
    it('should create a mutation and make HTTP PUT request', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.update();
        const updateData = {
          id: '123',
          data: { name: 'Jane Doe' },
        };

        mutation.mutate(updateData);

        setTimeout(() => {
          const req = httpTesting.expectOne('http://localhost:3000/users/123');
          expect(req.request.method).toBe('PUT');
          expect(req.request.body).toEqual({ name: 'Jane Doe' });

          req.flush({ id: '123', name: 'Jane Doe' } as User);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = mutation.result().data;
              expect(data?.name).toBe('Jane Doe');
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should invalidate queries on success', (done) => {
      runInInjectionContext(injector, () => {
        const queryClient = injectQueryClient();
        jest.spyOn(queryClient, 'invalidateQueries');

        const mutation = repository.update();
        mutation.mutate({ id: '123', data: { name: 'Jane' } });

        setTimeout(() => {
          const req = httpTesting.expectOne('http://localhost:3000/users/123');
          req.flush({ id: '123', name: 'Jane' } as User);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['users'],
              });
              done();
            });
          }, 10);
        }, 0);
      });
    });
  });

  describe('delete Mutation', () => {
    it('should create a mutation and make HTTP DELETE request', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.delete();

        mutation.mutate('123');

        setTimeout(() => {
          const req = httpTesting.expectOne('http://localhost:3000/users/123');
          expect(req.request.method).toBe('DELETE');

          req.flush({ id: '123' } as User);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = mutation.result().data;
              expect(data?.id).toBe('123');
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should invalidate queries and remove detail query on success', (done) => {
      runInInjectionContext(injector, () => {
        const queryClient = injectQueryClient();
        jest.spyOn(queryClient, 'invalidateQueries');
        jest.spyOn(queryClient, 'removeQueries');

        const mutation = repository.delete();
        mutation.mutate('123');

        setTimeout(() => {
          const req = httpTesting.expectOne('http://localhost:3000/users/123');
          req.flush({ id: '123' } as User);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
                queryKey: ['users'],
              });
              expect(queryClient.removeQueries).toHaveBeenCalledWith({
                queryKey: ['users', 'details', '123'],
              });
              done();
            });
          }, 10);
        }, 0);
      });
    });
  });

  describe('prefetchNextPage Utility', () => {
    it('should prefetch next page with incremented page number', async () => {
      const options: Partial<RequestOptions> = {
        pagination: { page: 0, limit: 10 },
      };

      const prefetchPromise = repository.prefetchNextPage(options);

      const req = httpTesting.expectOne(
        (req) => req.url.includes('users') && req.params.get('_page') === '1'
      );

      expect(req.request.method).toBe('GET');
      req.flush([mockUser], {
        headers: { 'X-Total-Count': '20' },
      });

      await prefetchPromise;
      expect(prefetchPromise).toHaveProperty('then');
    });
  });

  describe('Integration Tests', () => {
    it('should verify all methods are available', () => {
      expect(repository.fetchPage).toBeDefined();
      expect(repository.fetchById).toBeDefined();
      expect(repository.create).toBeDefined();
      expect(repository.update).toBeDefined();
      expect(repository.delete).toBeDefined();
      expect(repository.prefetchNextPage).toBeDefined();
    });

    it('should work with User entity type throughout CRUD operations', (done) => {
      runInInjectionContext(injector, () => {
        // Demonstrate type safety and full CRUD methods
        const listQuery = repository.fetchPage({
          pagination: { page: 0, limit: 10 },
        });

        // All methods return properly typed results
        expect(listQuery.result).toBeDefined();

        // Clean up
        const req = httpTesting.expectOne((req) => req.url.includes('users'));
        req.flush([], { headers: { 'X-Total-Count': '0' } });

        done();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network errors in queries', (done) => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchPage();
        query.result();

        setTimeout(() => {
          const req = httpTesting.expectOne('http://localhost:3000/users');
          req.error(new ProgressEvent('Network error'));

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const result = query.result();
              expect(result.isError).toBe(true);
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should handle authorization errors', (done) => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchById('123');
        query.result();

        setTimeout(() => {
          const req = httpTesting.expectOne('http://localhost:3000/users/123');
          req.flush('Unauthorized', { status: 403, statusText: 'Forbidden' });

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const result = query.result();
              expect(result.isError).toBe(true);
              done();
            });
          }, 10);
        }, 0);
      });
    });
  });
});
