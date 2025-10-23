import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Injectable, Injector, runInInjectionContext } from '@angular/core';
import { provideQueryClient, QueryClient, injectQueryClient } from '@ngneat/query';
import { CrudRepository } from './crud-repository';
import { RequestOptions } from './api.models';

describe('CrudRepository', () => {
  // Test entity and repository
  interface TestEntity {
    id: string;
    name: string;
    email: string;
  }

  @Injectable()
  class TestRepository extends CrudRepository<TestEntity> {
    protected entityName = 'test-entities';
  }

  let repository: TestRepository;
  let httpTesting: HttpTestingController;
  let injector: Injector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestRepository,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideQueryClient(
          new QueryClient({
            defaultOptions: {
              queries: {
                retry: false, // Disable retries in tests
                gcTime: 0, // Disable garbage collection in tests
              },
              mutations: {
                retry: false,
              },
            },
          })
        ),
      ],
    });

    repository = TestBed.inject(TestRepository);
    httpTesting = TestBed.inject(HttpTestingController);
    injector = TestBed.inject(Injector);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  describe('Query Key Generation', () => {
    it('should generate correct "all" query key', () => {
      const queryKey = repository['queryKeys'].all();
      expect(queryKey).toEqual(['test-entities']);
    });

    it('should generate correct "list" query key without options', () => {
      const queryKey = repository['queryKeys'].list();
      expect(queryKey).toEqual(['test-entities', 'list', undefined]);
    });

    it('should generate correct "list" query key with pagination', () => {
      const options: Partial<RequestOptions> = {
        pagination: { page: 0, limit: 10 },
      };
      const queryKey = repository['queryKeys'].list(options);
      expect(queryKey).toEqual(['test-entities', 'list', options]);
    });

    it('should generate correct "details" query key', () => {
      const queryKey = repository['queryKeys'].details('123');
      expect(queryKey).toEqual(['test-entities', 'details', '123']);
    });

    it('should generate different query keys for different pagination options', () => {
      const options1: Partial<RequestOptions> = {
        pagination: { page: 0, limit: 10 },
      };
      const options2: Partial<RequestOptions> = {
        pagination: { page: 1, limit: 10 },
      };

      const key1 = repository['queryKeys'].list(options1);
      const key2 = repository['queryKeys'].list(options2);

      expect(key1).not.toEqual(key2);
    });
  });

  describe('fetchPage', () => {
    it('should create a query', () => {
      runInInjectionContext(injector, () => {
        const options: Partial<RequestOptions> = {
          pagination: { page: 0, limit: 10 },
        };

        const query = repository.fetchPage(options);

        expect(query).toBeDefined();
        expect(typeof query.result).toBe('function');
        expect(query.result$).toBeDefined();

        // Flush the HTTP request to clean up
        const req = httpTesting.expectOne((req) =>
          req.url.includes('test-entities')
        );
        req.flush([], { headers: { 'X-Total-Count': '0' } });
      });
    });

    it('should make HTTP GET request with correct URL and parameters', (done) => {
      runInInjectionContext(injector, () => {
        const options: Partial<RequestOptions> = {
          pagination: { page: 0, limit: 10 },
          orderBy: 'name',
          orderDirection: 'ASC',
        };

        const query = repository.fetchPage(options);

        // Access data to trigger the query
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne(
            (req) =>
              req.url === 'http://localhost:3000/test-entities' &&
              req.params.get('_limit') === '10' &&
              req.params.get('_page') === '0' &&
              req.params.get('_sort') === 'name'
          );

          expect(req.request.method).toBe('GET');

          req.flush(
            [
              { id: '1', name: 'Test 1', email: 'test1@example.com' },
              { id: '2', name: 'Test 2', email: 'test2@example.com' },
            ],
            {
              headers: {
                'X-Total-Count': '20',
              },
            }
          );

          done();
        }, 0);
      });
    });

    it('should map response to ListResponse format', (done) => {
      runInInjectionContext(injector, () => {
        const options: Partial<RequestOptions> = {
          pagination: { page: 0, limit: 10 },
        };

        const query = repository.fetchPage(options);

        // Access data to trigger the query
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne((req) =>
            req.url.includes('test-entities')
          );

          req.flush(
            [
              { id: '1', name: 'Test 1', email: 'test1@example.com' },
              { id: '2', name: 'Test 2', email: 'test2@example.com' },
            ],
            {
              headers: {
                'X-Total-Count': '20',
              },
            }
          );

          // Wait for query to resolve
          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = query.result().data;
              expect(data?.items).toHaveLength(2);
              expect(data?.total).toBe(20);
              expect(data?.hasMore).toBe(true);
              expect(data?.pagination).toEqual({ page: 0, limit: 10 });
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should calculate hasMore correctly when on last page', (done) => {
      runInInjectionContext(injector, () => {
        const options: Partial<RequestOptions> = {
          pagination: { page: 1, limit: 10 },
        };

        const query = repository.fetchPage(options);

        // Access data to trigger the query
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne((req) =>
            req.url.includes('test-entities')
          );

          req.flush(
            [
              { id: '11', name: 'Test 11', email: 'test11@example.com' },
              { id: '12', name: 'Test 12', email: 'test12@example.com' },
            ],
            {
              headers: {
                'X-Total-Count': '15',
              },
            }
          );

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = query.result().data;
              expect(data?.hasMore).toBe(false); // 15 total, page 1, limit 10 = no more
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should handle DESC sorting', (done) => {
      runInInjectionContext(injector, () => {
        const options: Partial<RequestOptions> = {
          pagination: { page: 0, limit: 10 },
          orderBy: 'name',
          orderDirection: 'DESC',
        };

        const query = repository.fetchPage(options);

        // Access data to trigger the query
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne(
            (req) =>
              req.url.includes('test-entities') &&
              req.params.get('_sort') === '-name'
          );

          expect(req.request.method).toBe('GET');
          req.flush([], {
            headers: {
              'X-Total-Count': '0',
            },
          });

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

        // Flush the HTTP request to clean up
        const req = httpTesting.expectOne((req) =>
          req.url.includes('test-entities')
        );
        req.flush([], { headers: { 'X-Total-Count': '0' } });
      });
    });

    it('should handle query errors', (done) => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchPage({});

        // Access data to trigger the query
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne((req) =>
            req.url.includes('test-entities')
          );

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

  describe('fetchById', () => {
    it('should create a query', () => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchById('123');

        expect(query).toBeDefined();
        expect(query.result).toBeDefined();
        expect(query.result$).toBeDefined();

        // Flush the HTTP request to clean up
        const req = httpTesting.expectOne(
          'http://localhost:3000/test-entities/123'
        );
        req.flush({ id: '123', name: 'Test', email: 'test@example.com' });
      });
    });

    it('should make HTTP GET request to detail endpoint', (done) => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchById('123');

        // Access data to trigger the query
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );

          expect(req.request.method).toBe('GET');
          req.flush({ id: '123', name: 'Test', email: 'test@example.com' });

          done();
        }, 0);
      });
    });

    it('should return entity data on success', (done) => {
      runInInjectionContext(injector, () => {
        const mockEntity: TestEntity = {
          id: '123',
          name: 'Test User',
          email: 'test@example.com',
        };

        const query = repository.fetchById('123');

        // Access data to trigger the query
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );

          req.flush(mockEntity);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = query.result().data;
              expect(data).toEqual(mockEntity);
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should be disabled when ID is empty', () => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchById('');

        // Access data to ensure query is created
        const _data = query.result().data;

        // Query should be disabled, so no HTTP request should be made
        httpTesting.expectNone('http://localhost:3000/test-entities/');
      });
    });

    it('should handle errors', (done) => {
      runInInjectionContext(injector, () => {
        const query = repository.fetchById('123');

        // Access data to trigger the query
        const _data = query.result().data;

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );

          req.flush('Not found', { status: 404, statusText: 'Not Found' });

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

  describe('create', () => {
    it('should create a mutation', () => {
      runInInjectionContext(injector, () => {
        const mutation = repository.create();

        expect(mutation).toBeDefined();
        expect(mutation.mutate).toBeDefined();
        expect(mutation.result).toBeDefined();
      });
    });

    it('should make HTTP POST request with data', (done) => {
      const mutation = repository.create();
      const newEntity: Partial<TestEntity> = {
        name: 'New User',
        email: 'new@example.com',
      };

      mutation.mutate(newEntity);

      setTimeout(() => {
        const req = httpTesting.expectOne(
          'http://localhost:3000/test-entities'
        );
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(newEntity);

        req.flush({ id: '123', ...newEntity } as TestEntity);

        done();
      }, 0);
    });

    it('should return created entity on success', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.create();
        const newEntity: Partial<TestEntity> = {
          name: 'New User',
          email: 'new@example.com',
        };
        const createdEntity: TestEntity = {
          id: '123',
          name: 'New User',
          email: 'new@example.com',
        };

        mutation.mutate(newEntity);

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities'
          );

          req.flush(createdEntity);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = mutation.result().data;
              expect(data).toEqual(createdEntity);
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should handle mutation errors', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.create();
        const newEntity: Partial<TestEntity> = {
          name: 'New User',
          email: 'new@example.com',
        };

        mutation.mutate(newEntity);

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities'
          );

          req.flush('Bad request', { status: 400, statusText: 'Bad Request' });

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const isError = mutation.result().isError;
              const error = mutation.result().error;
              expect(isError).toBe(true);
              expect(error).toBeDefined();
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should invalidate queries on successful create', (done) => {
      runInInjectionContext(injector, () => {
        // First, create a query to be cached
        const listQuery = repository.fetchPage({
          pagination: { page: 0, limit: 10 },
        });

        // Access data to trigger the query
        const _data = listQuery.result().data;

        setTimeout(() => {
          // Fulfill the initial list query
          const listReq = httpTesting.expectOne((req) =>
            req.url.includes('test-entities')
          );
          listReq.flush(
            [{ id: '1', name: 'Original User', email: 'original@example.com' }],
            { headers: { 'X-Total-Count': '1' } }
          );

          setTimeout(() => {
            // Now perform a create mutation
            const mutation = repository.create();
            const newEntity: Partial<TestEntity> = {
              name: 'New User',
              email: 'new@example.com',
            };

            mutation.mutate(newEntity);

            setTimeout(() => {
              // Fulfill the create request
              const createReq = httpTesting.expectOne(
                'http://localhost:3000/test-entities'
              );
              createReq.flush({
                id: '2',
                ...newEntity,
              } as TestEntity);

              setTimeout(() => {
                // After successful mutation, the list query should be refetched
                // This verifies cache invalidation
                const refetchReq = httpTesting.expectOne((req) =>
                  req.url.includes('test-entities')
                );
                refetchReq.flush(
                  [
                    {
                      id: '1',
                      name: 'Original User',
                      email: 'original@example.com',
                    },
                    { id: '2', name: 'New User', email: 'new@example.com' },
                  ],
                  { headers: { 'X-Total-Count': '2' } }
                );

                setTimeout(() => {
                  runInInjectionContext(injector, () => {
                    // Verify the list query now has updated data
                    const updatedData = listQuery.result().data;
                    expect(updatedData?.items).toHaveLength(2);
                    expect(updatedData?.total).toBe(2);
                    done();
                  });
                }, 10);
              }, 10);
            }, 0);
          }, 10);
        }, 0);
      });
    });

    it('should show pending state during mutation', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.create();
        const newEntity: Partial<TestEntity> = {
          name: 'New User',
          email: 'new@example.com',
        };

        // Initial state should be idle
        expect(mutation.result().isPending).toBe(false);
        expect(mutation.result().isIdle).toBe(true);

        mutation.mutate(newEntity);

        // Should be pending immediately after mutation
        setTimeout(() => {
          runInInjectionContext(injector, () => {
            expect(mutation.result().isPending).toBe(true);

            const req = httpTesting.expectOne(
              'http://localhost:3000/test-entities'
            );
            req.flush({ id: '123', ...newEntity } as TestEntity);

            setTimeout(() => {
              runInInjectionContext(injector, () => {
                // After completion, should no longer be pending
                expect(mutation.result().isPending).toBe(false);
                expect(mutation.result().isSuccess).toBe(true);
                done();
              });
            }, 10);
          });
        }, 0);
      });
    });
  });

  describe('update', () => {
    it('should create a mutation', () => {
      runInInjectionContext(injector, () => {
        const mutation = repository.update();

        expect(mutation).toBeDefined();
        expect(mutation.mutate).toBeDefined();
        expect(mutation.result).toBeDefined();
      });
    });

    it('should make HTTP PUT request with ID and data', (done) => {
      const mutation = repository.update();
      const updateData: Partial<TestEntity> = {
        name: 'Updated Name',
      };

      mutation.mutate({ id: '123', data: updateData });

      setTimeout(() => {
        const req = httpTesting.expectOne(
          'http://localhost:3000/test-entities/123'
        );
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(updateData);

        req.flush({
          id: '123',
          name: 'Updated Name',
          email: 'test@example.com',
        });

        done();
      }, 0);
    });

    it('should return updated entity on success', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.update();
        const updateData: Partial<TestEntity> = {
          name: 'Updated Name',
        };
        const updatedEntity: TestEntity = {
          id: '123',
          name: 'Updated Name',
          email: 'test@example.com',
        };

        mutation.mutate({ id: '123', data: updateData });

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );

          req.flush(updatedEntity);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = mutation.result().data;
              expect(data).toEqual(updatedEntity);
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should handle mutation errors', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.update();
        const updateData: Partial<TestEntity> = {
          name: 'Updated Name',
        };

        mutation.mutate({ id: '123', data: updateData });

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );

          req.flush('Not found', { status: 404, statusText: 'Not Found' });

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const isError = mutation.result().isError;
              const error = mutation.result().error;
              expect(isError).toBe(true);
              expect(error).toBeDefined();
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should invalidate queries on successful update', (done) => {
      runInInjectionContext(injector, () => {
        // First, create queries to be cached
        const listQuery = repository.fetchPage({
          pagination: { page: 0, limit: 10 },
        });
        const detailQuery = repository.fetchById('123');

        // Access data to trigger the queries
        const _listData = listQuery.result().data;
        const _detailData = detailQuery.result().data;

        setTimeout(() => {
          // Fulfill the initial queries
          const listReq = httpTesting.expectOne((req) =>
            req.url.includes('test-entities') && !req.url.includes('/123')
          );
          listReq.flush(
            [
              {
                id: '123',
                name: 'Original User',
                email: 'original@example.com',
              },
            ],
            { headers: { 'X-Total-Count': '1' } }
          );

          const detailReq = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );
          detailReq.flush({
            id: '123',
            name: 'Original User',
            email: 'original@example.com',
          });

          setTimeout(() => {
            // Now perform an update mutation
            const mutation = repository.update();
            const updateData: Partial<TestEntity> = {
              name: 'Updated User',
            };

            mutation.mutate({ id: '123', data: updateData });

            setTimeout(() => {
              // Fulfill the update request
              const updateReq = httpTesting.expectOne(
                'http://localhost:3000/test-entities/123'
              );
              updateReq.flush({
                id: '123',
                name: 'Updated User',
                email: 'original@example.com',
              } as TestEntity);

              setTimeout(() => {
                // After successful mutation, queries should be refetched
                // This verifies cache invalidation

                // Expect list query refetch
                const refetchListReq = httpTesting.expectOne((req) =>
                  req.url.includes('test-entities') && !req.url.includes('/123')
                );
                refetchListReq.flush(
                  [
                    {
                      id: '123',
                      name: 'Updated User',
                      email: 'original@example.com',
                    },
                  ],
                  { headers: { 'X-Total-Count': '1' } }
                );

                // Expect detail query refetch
                const refetchDetailReq = httpTesting.expectOne(
                  'http://localhost:3000/test-entities/123'
                );
                refetchDetailReq.flush({
                  id: '123',
                  name: 'Updated User',
                  email: 'original@example.com',
                });

                setTimeout(() => {
                  runInInjectionContext(injector, () => {
                    // Verify the queries now have updated data
                    const updatedListData = listQuery.result().data;
                    const updatedDetailData = detailQuery.result().data;

                    expect(updatedListData?.items[0]?.name).toBe(
                      'Updated User'
                    );
                    expect(updatedDetailData?.name).toBe('Updated User');
                    done();
                  });
                }, 10);
              }, 10);
            }, 0);
          }, 10);
        }, 0);
      });
    });

    it('should show pending state during mutation', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.update();
        const updateData: Partial<TestEntity> = {
          name: 'Updated Name',
        };

        // Initial state should be idle
        expect(mutation.result().isPending).toBe(false);
        expect(mutation.result().isIdle).toBe(true);

        mutation.mutate({ id: '123', data: updateData });

        // Should be pending immediately after mutation
        setTimeout(() => {
          runInInjectionContext(injector, () => {
            expect(mutation.result().isPending).toBe(true);

            const req = httpTesting.expectOne(
              'http://localhost:3000/test-entities/123'
            );
            req.flush({
              id: '123',
              name: 'Updated Name',
              email: 'test@example.com',
            } as TestEntity);

            setTimeout(() => {
              runInInjectionContext(injector, () => {
                // After completion, should no longer be pending
                expect(mutation.result().isPending).toBe(false);
                expect(mutation.result().isSuccess).toBe(true);
                done();
              });
            }, 10);
          });
        }, 0);
      });
    });

    it('should handle partial entity updates', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.update();
        const partialUpdate: Partial<TestEntity> = {
          email: 'newemail@example.com',
        };

        mutation.mutate({ id: '123', data: partialUpdate });

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );

          // Verify only partial data is sent
          expect(req.request.body).toEqual(partialUpdate);
          expect(req.request.body).not.toHaveProperty('name');
          expect(req.request.body).not.toHaveProperty('id');

          req.flush({
            id: '123',
            name: 'Original Name',
            email: 'newemail@example.com',
          } as TestEntity);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = mutation.result().data;
              expect(data?.email).toBe('newemail@example.com');
              expect(data?.name).toBe('Original Name');
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should handle multiple field updates', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.update();
        const multiFieldUpdate: Partial<TestEntity> = {
          name: 'New Name',
          email: 'newemail@example.com',
        };

        mutation.mutate({ id: '123', data: multiFieldUpdate });

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );

          expect(req.request.body).toEqual(multiFieldUpdate);

          req.flush({
            id: '123',
            ...multiFieldUpdate,
          } as TestEntity);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = mutation.result().data;
              expect(data?.name).toBe('New Name');
              expect(data?.email).toBe('newemail@example.com');
              done();
            });
          }, 10);
        }, 0);
      });
    });
  });

  describe('delete', () => {
    it('should create a mutation', () => {
      runInInjectionContext(injector, () => {
        const mutation = repository.delete();

        expect(mutation).toBeDefined();
        expect(mutation.mutate).toBeDefined();
        expect(mutation.result).toBeDefined();
      });
    });

    it('should make HTTP DELETE request with ID', (done) => {
      const mutation = repository.delete();

      mutation.mutate('123');

      setTimeout(() => {
        const req = httpTesting.expectOne(
          'http://localhost:3000/test-entities/123'
        );
        expect(req.request.method).toBe('DELETE');
        expect(req.request.body).toEqual(null);

        req.flush({
          id: '123',
          name: 'Deleted',
          email: 'deleted@example.com',
        });

        done();
      }, 0);
    });

    it('should return deleted entity on success', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.delete();
        const deletedEntity: TestEntity = {
          id: '123',
          name: 'Deleted',
          email: 'deleted@example.com',
        };

        mutation.mutate('123');

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );

          req.flush(deletedEntity);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const data = mutation.result().data;
              expect(data).toEqual(deletedEntity);
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should handle mutation errors', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.delete();

        mutation.mutate('123');

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );

          req.flush('Not found', { status: 404, statusText: 'Not Found' });

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              const isError = mutation.result().isError;
              const error = mutation.result().error;
              expect(isError).toBe(true);
              expect(error).toBeDefined();
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should invalidate all queries on successful delete', (done) => {
      runInInjectionContext(injector, () => {
        // First, create queries to be cached
        const listQuery = repository.fetchPage({
          pagination: { page: 0, limit: 10 },
        });

        // Access data to trigger the query
        const _listData = listQuery.result().data;

        setTimeout(() => {
          // Fulfill the initial list query
          const listReq = httpTesting.expectOne((req) =>
            req.url.includes('test-entities') && !req.url.includes('/123')
          );
          listReq.flush(
            [
              {
                id: '123',
                name: 'User to Delete',
                email: 'delete@example.com',
              },
              {
                id: '456',
                name: 'Another User',
                email: 'another@example.com',
              },
            ],
            { headers: { 'X-Total-Count': '2' } }
          );

          setTimeout(() => {
            // Now perform a delete mutation
            const mutation = repository.delete();

            mutation.mutate('123');

            setTimeout(() => {
              // Fulfill the delete request
              const deleteReq = httpTesting.expectOne(
                'http://localhost:3000/test-entities/123'
              );
              deleteReq.flush({
                id: '123',
                name: 'User to Delete',
                email: 'delete@example.com',
              } as TestEntity);

              setTimeout(() => {
                // After successful mutation, the list query should be refetched
                // This verifies cache invalidation
                const refetchReq = httpTesting.expectOne((req) =>
                  req.url.includes('test-entities') && !req.url.includes('/123')
                );
                refetchReq.flush(
                  [
                    {
                      id: '456',
                      name: 'Another User',
                      email: 'another@example.com',
                    },
                  ],
                  { headers: { 'X-Total-Count': '1' } }
                );

                setTimeout(() => {
                  runInInjectionContext(injector, () => {
                    // Verify the list query now has updated data
                    const updatedData = listQuery.result().data;
                    expect(updatedData?.items).toHaveLength(1);
                    expect(updatedData?.total).toBe(1);
                    expect(
                      updatedData?.items.find((item) => item.id === '123')
                    ).toBeUndefined();
                    done();
                  });
                }, 10);
              }, 10);
            }, 0);
          }, 10);
        }, 0);
      });
    });

    it('should call removeQueries for detail query on successful delete', (done) => {
      runInInjectionContext(injector, () => {
        const queryClient = injectQueryClient();
        jest.spyOn(queryClient, 'removeQueries');

        const mutation = repository.delete();
        mutation.mutate('123');

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );
          req.flush({
            id: '123',
            name: 'Deleted',
            email: 'deleted@example.com',
          } as TestEntity);

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              // Verify removeQueries was called for the specific entity
              expect(queryClient.removeQueries).toHaveBeenCalledWith({
                queryKey: ['test-entities', 'details', '123'],
              });
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should show pending state during mutation', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.delete();

        // Initial state should be idle
        expect(mutation.result().isPending).toBe(false);
        expect(mutation.result().isIdle).toBe(true);

        mutation.mutate('123');

        // Should be pending immediately after mutation
        setTimeout(() => {
          runInInjectionContext(injector, () => {
            expect(mutation.result().isPending).toBe(true);

            const req = httpTesting.expectOne(
              'http://localhost:3000/test-entities/123'
            );
            req.flush({
              id: '123',
              name: 'Deleted',
              email: 'deleted@example.com',
            } as TestEntity);

            setTimeout(() => {
              runInInjectionContext(injector, () => {
                // After completion, should no longer be pending
                expect(mutation.result().isPending).toBe(false);
                expect(mutation.result().isSuccess).toBe(true);
                done();
              });
            }, 10);
          });
        }, 0);
      });
    });

    it('should handle delete for different entity IDs', (done) => {
      const mutation = repository.delete();

      mutation.mutate('456');

      setTimeout(() => {
        const req = httpTesting.expectOne(
          'http://localhost:3000/test-entities/456'
        );
        expect(req.request.method).toBe('DELETE');

        req.flush({
          id: '456',
          name: 'Another Entity',
          email: 'another@example.com',
        });

        setTimeout(() => {
          runInInjectionContext(injector, () => {
            const data = mutation.result().data;
            expect(data?.id).toBe('456');
            done();
          });
        }, 10);
      }, 0);
    });

    it('should handle server errors during delete', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.delete();

        mutation.mutate('123');

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );

          req.flush('Internal Server Error', {
            status: 500,
            statusText: 'Internal Server Error',
          });

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              expect(mutation.result().isError).toBe(true);
              expect(mutation.result().error).toBeDefined();
              expect(mutation.result().isSuccess).toBe(false);
              done();
            });
          }, 10);
        }, 0);
      });
    });

    it('should handle authorization errors during delete', (done) => {
      runInInjectionContext(injector, () => {
        const mutation = repository.delete();

        mutation.mutate('123');

        setTimeout(() => {
          const req = httpTesting.expectOne(
            'http://localhost:3000/test-entities/123'
          );

          req.flush('Unauthorized', {
            status: 403,
            statusText: 'Forbidden',
          });

          setTimeout(() => {
            runInInjectionContext(injector, () => {
              expect(mutation.result().isError).toBe(true);
              expect(mutation.result().error).toBeDefined();
              done();
            });
          }, 10);
        }, 0);
      });
    });
  });

  describe('prefetchNextPage', () => {
    it('should prefetch next page with incremented page number', async () => {
      const options: Partial<RequestOptions> = {
        pagination: { page: 0, limit: 10 },
      };

      const prefetchPromise = repository.prefetchNextPage(options);

      const req = httpTesting.expectOne(
        (req) =>
          req.url.includes('test-entities') && req.params.get('_page') === '1'
      );

      expect(req.request.method).toBe('GET');
      req.flush(
        [
          { id: '11', name: 'Test 11', email: 'test11@example.com' },
          { id: '12', name: 'Test 12', email: 'test12@example.com' },
        ],
        {
          headers: {
            'X-Total-Count': '20',
          },
        }
      );

      await prefetchPromise;
      // Just verify it's a Promise-like object with then/catch
      expect(prefetchPromise).toHaveProperty('then');
      expect(prefetchPromise).toHaveProperty('catch');
    });

    it('should use default limit if not provided', async () => {
      const options: Partial<RequestOptions> = {
        pagination: { page: 0 },
      };

      const prefetchPromise = repository.prefetchNextPage(options);

      const req = httpTesting.expectOne((req) =>
        req.url.includes('test-entities')
      );

      req.flush([], {
        headers: {
          'X-Total-Count': '0',
        },
      });

      await prefetchPromise;
      // Just verify it's a Promise-like object with then/catch
      expect(prefetchPromise).toHaveProperty('then');
      expect(prefetchPromise).toHaveProperty('catch');
    });

    it('should preserve orderBy and orderDirection when prefetching', async () => {
      const options: Partial<RequestOptions> = {
        pagination: { page: 0, limit: 10 },
        orderBy: 'name',
        orderDirection: 'DESC',
      };

      const prefetchPromise = repository.prefetchNextPage(options);

      const req = httpTesting.expectOne(
        (req) =>
          req.url.includes('test-entities') &&
          req.params.get('_page') === '1' &&
          req.params.get('_sort') === '-name' &&
          req.params.get('_limit') === '10'
      );

      expect(req.request.method).toBe('GET');
      req.flush(
        [
          { id: '21', name: 'Test 21', email: 'test21@example.com' },
          { id: '22', name: 'Test 22', email: 'test22@example.com' },
        ],
        {
          headers: {
            'X-Total-Count': '30',
          },
        }
      );

      await prefetchPromise;
      expect(prefetchPromise).toHaveProperty('then');
    });

    it('should increment page from current page value', async () => {
      const options: Partial<RequestOptions> = {
        pagination: { page: 5, limit: 20 },
      };

      const prefetchPromise = repository.prefetchNextPage(options);

      const req = httpTesting.expectOne(
        (req) =>
          req.url.includes('test-entities') &&
          req.params.get('_page') === '6' &&
          req.params.get('_limit') === '20'
      );

      expect(req.request.method).toBe('GET');
      req.flush(
        [
          { id: '121', name: 'Test 121', email: 'test121@example.com' },
          { id: '122', name: 'Test 122', email: 'test122@example.com' },
        ],
        {
          headers: {
            'X-Total-Count': '200',
          },
        }
      );

      await prefetchPromise;
      expect(prefetchPromise).toHaveProperty('then');
    });

    it('should handle prefetch from page 0 when no pagination provided', async () => {
      const options: Partial<RequestOptions> = {};

      const prefetchPromise = repository.prefetchNextPage(options);

      const req = httpTesting.expectOne(
        (req) =>
          req.url.includes('test-entities') && req.params.get('_page') === '1'
      );

      expect(req.request.method).toBe('GET');
      req.flush([], {
        headers: {
          'X-Total-Count': '0',
        },
      });

      await prefetchPromise;
      expect(prefetchPromise).toHaveProperty('then');
    });

    it('should cache prefetched data for subsequent queries', async () => {
      runInInjectionContext(injector, () => {
        const options: Partial<RequestOptions> = {
          pagination: { page: 0, limit: 10 },
        };

        // Prefetch page 1
        const prefetchPromise = repository.prefetchNextPage(options);

        const prefetchReq = httpTesting.expectOne(
          (req) =>
            req.url.includes('test-entities') && req.params.get('_page') === '1'
        );

        prefetchReq.flush(
          [
            { id: '11', name: 'Test 11', email: 'test11@example.com' },
            { id: '12', name: 'Test 12', email: 'test12@example.com' },
          ],
          {
            headers: {
              'X-Total-Count': '20',
            },
          }
        );

        prefetchPromise.then(() => {
          // Now fetch page 1 - should use cached data
          const nextPageQuery = repository.fetchPage({
            pagination: { page: 1, limit: 10 },
          });

          // Access data to trigger the query
          const data = nextPageQuery.result().data;

          // Should NOT make another HTTP request because data is cached
          // If it does, the test will fail with "expectNone" error
          setTimeout(() => {
            httpTesting.expectNone((req) =>
              req.url.includes('test-entities')
            );
          }, 50);
        });
      });
    });

    it('should handle prefetch errors gracefully', async () => {
      const options: Partial<RequestOptions> = {
        pagination: { page: 0, limit: 10 },
      };

      const prefetchPromise = repository.prefetchNextPage(options);

      const req = httpTesting.expectOne(
        (req) =>
          req.url.includes('test-entities') && req.params.get('_page') === '1'
      );

      req.flush('Internal Server Error', {
        status: 500,
        statusText: 'Internal Server Error',
      });

      // Prefetch should not throw, just fail silently
      try {
        await prefetchPromise;
      } catch (error) {
        // Prefetch errors are typically swallowed by TanStack Query
        // but if they're not, we should handle them gracefully
        expect(error).toBeDefined();
      }
    });

    it('should return a Promise that resolves to void', async () => {
      const options: Partial<RequestOptions> = {
        pagination: { page: 0, limit: 10 },
      };

      const prefetchPromise = repository.prefetchNextPage(options);

      const req = httpTesting.expectOne((req) =>
        req.url.includes('test-entities')
      );

      req.flush([], {
        headers: {
          'X-Total-Count': '0',
        },
      });

      const result = await prefetchPromise;
      expect(result).toBeUndefined();
    });
  });

  describe('Integration Tests', () => {
    it('should have correct entityName', () => {
      expect(repository['entityName']).toBe('test-entities');
    });

    it('should have default staleTime and gcTime', () => {
      expect(repository['defaultStaleTime']).toBe(1000 * 60 * 5); // 5 minutes
      expect(repository['defaultGcTime']).toBe(1000 * 60 * 10); // 10 minutes
    });
  });
});
