# Design Document

## Overview

This design introduces an abstract CRUD repository that **merges HTTP operations and TanStack Query integration** into a single abstraction. The repository combines the responsibilities of the existing `ApiService` (HTTP calls) with TanStack Query via @ngneat/query (caching, state management) to provide a unified, type-safe data access layer.

By merging these concerns, we eliminate the need for separate HTTP and query layers, providing a simpler architecture where developers only need to extend one abstract class to get both HTTP operations and intelligent caching.

### Key Design Goals

1. **Unified Abstraction**: Merge HTTP operations and query management into one class
2. **Zero TanStack Query Exposure**: Concrete repositories have no knowledge of TanStack Query APIs
3. **Simple Extension Pattern**: Extend and provide only the entity name
4. **Type Safety**: Full TypeScript support through generics
5. **Consistency**: Leverage existing `RequestOptions` and `ListResponse<T>` types
6. **Signal-Based**: Align with Angular's signal-based reactivity
7. **Automatic Cache Management**: Built-in query invalidation and cache key generation
8. **Drop-in Replacement**: Can replace existing `ApiService<T>` usage

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Component/Service Layer                      │
│  - Injects concrete repository (e.g., UsersRepository)          │
│  - Calls CRUD methods                                           │
│  - Receives query/mutation results                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ injects
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│              Concrete Repository (e.g., UsersRepository)        │
│  @Injectable({ providedIn: 'root' })                           │
│  extends CrudRepository<User>                                   │
│  constructor() { super('users'); }                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           │ extends
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CrudRepository<T> (Abstract)                  │
│                                                                 │
│  HTTP OPERATIONS (built-in, private)                           │
│  - #httpClient = inject(HttpClient)                            │
│  - #request() - handles HTTP calls                             │
│  - #getUrl() - builds URLs                                     │
│  - #getOptions() - prepares request options                    │
│                                                                 │
│  QUERY/MUTATION OPERATIONS (public API)                        │
│  - #query = injectQuery()                                      │
│  - #mutation = injectMutation()                                │
│  - #queryClient = injectQueryClient()                          │
│  - fetchPage() - returns QueryObserverResult                   │
│  - fetchById() - returns QueryObserverResult                   │
│  - create() - returns MutationObserverResult                   │
│  - update() - returns MutationObserverResult                   │
│  - delete() - returns MutationObserverResult                   │
│                                                                 │
│  CACHE MANAGEMENT (automatic)                                   │
│  - queryKeys factory                                            │
│  - Auto-invalidation on mutations                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
┌───────────────────────┐  ┌──────────────────────────┐
│   HttpClient          │  │  @ngneat/query           │
│   (Angular)           │  │  - injectQuery()         │
│   - request()         │  │  - injectMutation()      │
│   - get()             │  │  - injectQueryClient()   │
│   - post()            │  │  - keepPreviousData      │
│   - put()             │  │                          │
│   - delete()          │  │                          │
└───────────────────────┘  └──────────────────────────┘
```

### Design Pattern

The repository **merges HTTP operations and query management**:
- **Inherits** from nothing (standalone abstract class)
- **Injects** `HttpClient` directly for HTTP operations (replicates `ApiService` logic)
- **Injects** `injectQuery()` and `injectMutation()` for TanStack Query integration
- **Exposes** only query/mutation results, hiding both HTTP and query implementation details

This eliminates the need for a separate `ApiService<T>` class. All HTTP logic from `ApiService` is incorporated into `CrudRepository` as private methods.

## Components and Interfaces

### 1. CrudRepository<T> (Abstract Class)

The core abstract repository that **merges HTTP operations and TanStack Query integration** into a single class.

```typescript
import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import {
  injectQuery,
  injectMutation,
  injectQueryClient,
  keepPreviousData,
  QueryObserverResult,
  MutationObserverResult,
} from '@ngneat/query';
import { RequestOptions, ListResponse, Pagination } from '@my/shared/data/api.models';

export abstract class CrudRepository<T> {
  // HTTP Client (replaces ApiService dependency)
  #httpClient = inject(HttpClient);

  // TanStack Query instances
  #query = injectQuery();
  #mutation = injectMutation();
  #queryClient = injectQueryClient();

  // Must be provided by concrete repository
  protected abstract entityName: string;

  // Default query configuration
  protected defaultStaleTime = 1000 * 60 * 5; // 5 minutes
  protected defaultGcTime = 1000 * 60 * 10; // 10 minutes

  // Query key factory
  protected queryKeys = {
    all: () => [this.entityName],
    list: (requestOptions?: Partial<RequestOptions>) => [
      this.entityName,
      'list',
      requestOptions,
    ],
    details: (id: string) => [this.entityName, 'details', id],
  };

  // ============================================
  // PUBLIC API - Query/Mutation Operations
  // ============================================

  fetchPage(
    requestOptions: Partial<RequestOptions> = {}
  ): QueryObserverResult<ListResponse<T>, Error>;

  fetchById(
    id: string
  ): QueryObserverResult<T, Error>;

  create(): MutationObserverResult<T | null, Error, Partial<T>, unknown>;

  update(): MutationObserverResult<T, Error, { id: string; data: Partial<T> }, unknown>;

  delete(): MutationObserverResult<T, Error, string, unknown>;

  prefetchNextPage(
    requestOptions: Partial<RequestOptions>
  ): Promise<void>;

  // ============================================
  // PRIVATE - HTTP Operations (from ApiService)
  // ============================================

  #request<TResult>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    requestOptions?: Partial<RequestOptions>,
    body?: unknown,
    id?: string,
  ): Promise<TResult>;

  #getUrl(id?: string): string;

  #getOptions(
    options?: Partial<RequestOptions>,
    body?: unknown
  ): { params: any; body?: unknown; observe: any };

  #mapListResponse(
    response: HttpResponse<unknown>,
    pagination?: Partial<Pagination>,
  ): ListResponse<T>;
}
```

### 2. Concrete Repository Example

Concrete repositories are extremely simple - just extend and provide the entity name:

```typescript
import { Injectable } from '@angular/core';
import { CrudRepository } from '@my/shared/data/crud-repository';
import { User } from './users.models';

@Injectable({ providedIn: 'root' })
export class UsersRepository extends CrudRepository<User> {
  protected entityName = 'users';
}
```

That's it! No need to inject `ApiService` or any other dependencies. The repository handles everything internally.

### 3. Query Key Factory

Each repository instance automatically generates query keys based on the entity name:

```typescript
protected queryKeys = {
  all: () => [this.entityName],
  list: (requestOptions?: RequestOptions) => [
    this.entityName,
    'list',
    requestOptions,
  ],
  details: (id: string) => [this.entityName, 'details', id],
};
```

This ensures proper cache segmentation and invalidation.

### 4. Component Usage Example

With @ngneat/query, you can use either Signals or Observables:

**Signal-based approach (recommended):**

```typescript
import { Component, inject } from '@angular/core';
import { UsersRepository } from './data/users.repository';
import { RequestOptions } from '@my/shared/data/api.models';

@Component({
  selector: 'app-users-page',
  template: `
    @if (usersQuery.result().data; as users) {
      <user-list [users]="users.items" />
    }
    @if (usersQuery.result().isLoading) {
      <loading-spinner />
    }
    @if (usersQuery.result().isError) {
      <error-message [error]="usersQuery.result().error" />
    }
  `
})
export class UsersPageComponent {
  private usersRepo = inject(UsersRepository);

  requestOptions: Partial<RequestOptions> = {
    pagination: { page: 0, limit: 10 },
    orderBy: 'name',
    orderDirection: 'ASC',
    staleTime: 1000 * 60 * 5, // 5 minutes
  };

  usersQuery = this.usersRepo.fetchPage(this.requestOptions);
  deleteMutation = this.usersRepo.delete();

  onDelete(user: User) {
    this.deleteMutation.mutate(user.id);
  }
}
```

**Observable-based approach:**

```typescript
export class UsersPageComponent {
  private usersRepo = inject(UsersRepository);

  usersQuery = this.usersRepo.fetchPage({
    pagination: { page: 0, limit: 10 }
  });

  // Use result$ for Observable streams
  users$ = this.usersQuery.result$.pipe(
    map(result => result.data?.items ?? [])
  );

  isLoading$ = this.usersQuery.result$.pipe(
    map(result => result.isLoading)
  );
}
```

## Data Models

### Query Result Types

Based on @ngneat/query, query results provide both Observable and Signal access:

```typescript
interface QueryObserverResult<TData, TError> {
  // Signal-based access (recommended for templates)
  result: Signal<QueryResult<TData, TError>>;

  // Observable-based access (for reactive streams)
  result$: Observable<QueryResult<TData, TError>>;
}

interface QueryResult<TData, TError> {
  data: TData | undefined;
  error: TError | null;
  isError: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isFetching: boolean;
  status: 'pending' | 'error' | 'success';
  refetch: () => void;
}
```

### Mutation Result Types

Mutation results also provide both Observable and Signal access:

```typescript
interface MutationObserverResult<TData, TError, TVariables, TContext> {
  // Signal-based access
  result: Signal<MutationResult<TData, TError, TVariables>>;

  // Observable-based access
  result$: Observable<MutationResult<TData, TError, TVariables>>;

  // Mutation trigger functions
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
}

interface MutationResult<TData, TError, TVariables> {
  data: TData | undefined;
  error: TError | null;
  isError: boolean;
  isIdle: boolean;
  isPending: boolean;
  isSuccess: boolean;
  status: 'idle' | 'pending' | 'error' | 'success';
  reset: () => void;
}
```

### RequestOptions Integration

The repository accepts `Partial<RequestOptions>` and maps options to TanStack Query configuration:

| RequestOptions Property | Maps To | Description |
|------------------------|---------|-------------|
| `staleTime` | `staleTime` | How long data stays fresh |
| `select` | `select` | Transform query data |
| `pagination` | `queryKey` | Part of cache key |
| `orderBy` | `queryKey` | Part of cache key |
| `orderDirection` | `queryKey` | Part of cache key |
| `searchQuery` | `queryKey` | Part of cache key |
| `url` | Passed to `ApiService` | Custom endpoint override |

## Implementation Details

### 1. Query Implementation Pattern

Queries use @ngneat/query and call private HTTP methods:

```typescript
fetchPage(requestOptions: Partial<RequestOptions> = {}): QueryObserverResult<ListResponse<T>, Error> {
  return this.#query({
    queryKey: this.queryKeys.list(requestOptions),
    queryFn: async () => {
      // Use private HTTP method (replaces ApiService.fetchPage)
      const result = await this.#request<Array<T>>('GET', {
        ...requestOptions,
        observe: 'response',
      });
      return this.#mapListResponse(
        result as unknown as HttpResponse<T>,
        requestOptions.pagination,
      );
    },
    placeholderData: keepPreviousData,
    staleTime: requestOptions.staleTime ?? this.defaultStaleTime,
    gcTime: this.defaultGcTime,
    select: requestOptions.select as any,
  });
}

fetchById(id: string): QueryObserverResult<T, Error> {
  return this.#query({
    queryKey: this.queryKeys.details(id),
    queryFn: () => this.#request<T>('GET', undefined, undefined, id),
    staleTime: this.defaultStaleTime,
    gcTime: this.defaultGcTime,
    enabled: !!id, // Only run query if ID is provided
  });
}
```

### 1.1 Private HTTP Methods (from ApiService)

The private HTTP methods replicate the logic from `ApiService`:

```typescript
#request<TResult>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  requestOptions?: Partial<RequestOptions>,
  body?: unknown,
  id?: string,
): Promise<TResult> {
  const url = this.#getUrl(id);
  const options = this.#getOptions(requestOptions, body);

  return lastValueFrom(
    this.#httpClient.request<TResult>(method, url, options)
  );
}

#getUrl(id?: string): string {
  const idPath = !id ? '' : `/${id}`;
  return `http://localhost:3000/${this.entityName}${idPath}`;
}

#getOptions(options?: Partial<RequestOptions>, body?: unknown) {
  let params = {};
  if (options?.pagination) {
    const { orderBy, orderDirection } = options;
    const { limit, page } = options.pagination;
    const paginationParams = {
      _limit: limit?.toString(),
      _page: (page ?? 0).toString(),
      _sort: `${orderDirection === 'ASC' ? '' : '-'}${orderBy}`,
    };
    params = { ...paginationParams };
  }

  return {
    params,
    body,
    observe: options?.observe || 'body',
  };
}

#mapListResponse(
  response: HttpResponse<unknown>,
  pagination?: Partial<Pagination>,
): ListResponse<T> {
  if (!response.headers) {
    return {} as ListResponse<T>;
  }
  const total = Number(response.headers.get('X-Total-Count'));
  let hasMore = false;

  if (pagination) {
    const { limit, page } = pagination;
    if (limit && page !== undefined) {
      hasMore = total > limit * (page + 1);
    }
  }

  return {
    items: response.body,
    total,
    hasMore,
    pagination,
  } as ListResponse<T>;
}
```

### 2. Mutation Implementation Pattern

Mutations use @ngneat/query and call private HTTP methods:

```typescript
create(): MutationObserverResult<T | null, Error, Partial<T>, unknown> {
  return this.#mutation({
    mutationKey: [this.entityName, 'create'],
    mutationFn: (data: Partial<T>) => {
      // Use private HTTP method (replaces ApiService.create)
      return this.#request<T | null>('POST', undefined, data);
    },
    onSuccess: () => {
      this.#queryClient.invalidateQueries({ queryKey: this.queryKeys.all() });
    },
  });
}

update(): MutationObserverResult<T, Error, { id: string; data: Partial<T> }, unknown> {
  return this.#mutation({
    mutationKey: [this.entityName, 'update'],
    mutationFn: ({ id, data }: { id: string; data: Partial<T> }) => {
      // Use private HTTP method (replaces ApiService.update)
      return this.#request<T>('PUT', undefined, data, id);
    },
    onSuccess: () => {
      this.#queryClient.invalidateQueries({ queryKey: this.queryKeys.all() });
    },
  });
}

delete(): MutationObserverResult<T, Error, string, unknown> {
  return this.#mutation({
    mutationKey: [this.entityName, 'delete'],
    mutationFn: (id: string) => {
      // Use private HTTP method (replaces ApiService.delete)
      return this.#request<T>('DELETE', undefined, null, id);
    },
    onSuccess: (_data, id) => {
      this.#queryClient.invalidateQueries({ queryKey: this.queryKeys.all() });
      this.#queryClient.removeQueries({
        queryKey: this.queryKeys.details(id)
      });
    },
  });
}
```

**Note**: Mutations call the same private `#request()` method that queries use. This ensures consistent HTTP handling across all operations.

### 3. Prefetching Support

For pagination optimization:

```typescript
async prefetchNextPage(requestOptions: Partial<RequestOptions>): Promise<void> {
  const currentPage = requestOptions.pagination?.page ?? 0;
  const nextOptions: Partial<RequestOptions> = {
    ...requestOptions,
    pagination: {
      ...(requestOptions.pagination ?? { limit: 10 }),
      page: currentPage + 1,
    },
  };

  return this.#queryClient.prefetchQuery({
    queryKey: this.queryKeys.list(nextOptions),
    queryFn: async () => {
      const result = await this.#request<Array<T>>('GET', {
        ...nextOptions,
        observe: 'response',
      });
      return this.#mapListResponse(
        result as unknown as HttpResponse<T>,
        nextOptions.pagination,
      );
    },
  });
}
```

### 4. Default Configuration

Default query options can be set at the abstract class level:

```typescript
protected defaultStaleTime = 1000 * 60 * 5; // 5 minutes
protected defaultGcTime = 1000 * 60 * 10; // 10 minutes
```

These can be overridden by `RequestOptions.staleTime` on a per-query basis.

## Error Handling

### Query Error Handling

Queries automatically handle errors through @ngneat/query:

```typescript
const query = usersRepo.fetchPage(options);

// Component template (Signal-based)
@if (query.result().isError) {
  <div class="error">
    Error: {{ query.result().error?.message }}
  </div>
}

// Or Observable-based
@if (query.result$ | async; as result) {
  @if (result.isError) {
    <div class="error">{{ result.error?.message }}</div>
  }
}
```

### Mutation Error Handling

Mutations provide error states and can be handled in components:

```typescript
const createMutation = usersRepo.create();

onSubmit(user: User) {
  createMutation.mutate(user);
}

// Template (Signal-based)
@if (createMutation.result().isError) {
  <div class="error">
    {{ createMutation.result().error?.message }}
  </div>
}
```

### HTTP Error Propagation

HTTP errors from the internal `#request()` method are automatically caught by TanStack Query and exposed through query/mutation error states. No additional error handling is needed in the repository layer.

The `#request()` method uses `lastValueFrom()` which will throw errors from HTTP operations, and TanStack Query will catch and manage these errors automatically.

## Testing Strategy

### 1. Unit Testing CrudRepository

Test the abstract repository by creating a test concrete implementation:

```typescript
import { provideNgNeatQuery, QueryClientService } from '@ngneat/query';

describe('CrudRepository', () => {
  class TestEntity {
    id = '';
    name = '';
  }

  @Injectable()
  class TestRepository extends CrudRepository<TestEntity> {
    protected entityName = 'test-entities';
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TestRepository,
        provideHttpClient(),
        provideNgNeatQuery(new QueryClientService()),
      ],
    });
  });

  it('should create query for fetchPage', () => {
    const repo = TestBed.inject(TestRepository);
    const options: Partial<RequestOptions> = {
      pagination: { page: 0, limit: 10 },
    };

    const result = repo.fetchPage(options);

    // Access via Signal
    expect(result.result().isLoading).toBe(true);
    // Additional assertions...
  });
});
```

### 2. Testing Query Key Generation

```typescript
it('should generate correct query keys', () => {
  const repo = TestBed.inject(TestRepository);

  expect(repo['queryKeys'].all()).toEqual(['test-entities']);
  expect(repo['queryKeys'].details('123')).toEqual([
    'test-entities',
    'details',
    '123',
  ]);
});
```

### 3. Testing Concrete Repositories

Test concrete repositories by mocking HttpClient:

```typescript
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UsersRepository,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideNgNeatQuery(new QueryClientService()),
      ],
    });

    repository = TestBed.inject(UsersRepository);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should make HTTP request when query is accessed', () => {
    const options: Partial<RequestOptions> = {
      pagination: { page: 0, limit: 10 }
    };

    const query = repository.fetchPage(options);

    // Trigger the query
    query.result();

    // Verify HTTP request
    const req = httpTesting.expectOne('http://localhost:3000/users?_limit=10&_page=0');
    expect(req.request.method).toBe('GET');

    req.flush({ items: [], total: 0 });
  });

  afterEach(() => {
    httpTesting.verify();
  });
});
```

### 4. Integration Testing with Components

Test repositories integrated with components:

```typescript
describe('UsersPageComponent with UsersRepository', () => {
  it('should display users from repository', async () => {
    const fixture = TestBed.createComponent(UsersPageComponent);
    fixture.detectChanges();

    // Wait for query to resolve
    await fixture.whenStable();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('user-list')).toBeTruthy();
  });
});
```

### 5. Testing Cache Invalidation

```typescript
it('should invalidate queries on mutation success', fakeAsync(() => {
  const queryClient = TestBed.inject(QueryClientService);
  spyOn(queryClient, 'invalidateQueries');

  const deleteMutation = repository.delete();

  deleteMutation.mutate('123');
  tick();

  expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
    queryKey: ['test-entities'],
  });
}));
```

## Migration Path

### From ApiService Pattern

For code currently using `ApiService<T>`:

**Before:**
```typescript
// users-api.service.ts
@Injectable({ providedIn: 'root' })
export class UsersApiService extends ApiService<User> {
  constructor() {
    super('users');
  }
}

// Component
export class UsersComponent {
  private usersApi = inject(UsersApiService);

  async loadUsers() {
    const result = await this.usersApi.fetchPage({
      pagination: { page: 0, limit: 10 }
    });
    this.users = result.items;
  }
}
```

**After:**
```typescript
// users.repository.ts
@Injectable({ providedIn: 'root' })
export class UsersRepository extends CrudRepository<User> {
  protected entityName = 'users';
}

// Component
export class UsersComponent {
  private usersRepo = inject(UsersRepository);

  usersQuery = this.usersRepo.fetchPage({
    pagination: { page: 0, limit: 10 }
  });

  // Access via signals
  users = computed(() => this.usersQuery.result().data?.items ?? []);
  isLoading = computed(() => this.usersQuery.result().isLoading);
}
```

### From Manual Query Functions Pattern

For code using `@tanstack/angular-query-experimental` with manual query functions (like `users.queries.ts`):

**Before:**
```typescript
// users.queries.ts
import { injectQuery } from '@tanstack/angular-query-experimental';

function pageQuery(requestOptions: Signal<RequestOptions>) {
  const usersApi = inject(UsersApiService);
  return injectQuery(() => ({
    queryKey: queryKeys.list(requestOptions()),
    queryFn: () => usersApi.fetchPage(requestOptions()),
  }));
}

export const usersQuery = { page: pageQuery, ... };

// Component
const usersPageQuery = usersQuery.page(requestOptions);
```

**After:**
```typescript
// users.repository.ts - No query functions needed!
@Injectable({ providedIn: 'root' })
export class UsersRepository extends CrudRepository<User> {
  protected entityName = 'users';
}

// Component
const usersRepo = inject(UsersRepository);
const usersQuery = usersRepo.fetchPage(requestOptions);

// Access via .result() signal or .result$ observable
const data = usersQuery.result().data;
```

### Key Migration Benefits

1. **Simpler Architecture**: One class instead of two (`ApiService` + query functions, or just `CrudRepository`)
2. **Less Boilerplate**: No need to create separate API service or query function files
3. **Automatic Caching**: All operations get TanStack Query benefits automatically
4. **Type Safety**: Full TypeScript support with generics
5. **Consistent API**: Same interface for all entities
6. **Drop-in Replacement**: Can coexist with existing `ApiService` during migration

## Performance Considerations

1. **Query Deduplication**: TanStack Query automatically deduplicates identical queries
2. **Background Refetching**: Stale queries refetch in the background without blocking UI
3. **Pagination**: `keepPreviousData` prevents UI flicker when changing pages
4. **Prefetching**: `prefetchNextPage` loads the next page in advance
5. **Garbage Collection**: Unused queries are automatically cleaned up after `gcTime`
6. **Selective Invalidation**: Only invalidate affected queries, not the entire cache

## Security Considerations

1. **No Direct Query Exposure**: Components never interact with TanStack Query directly
2. **Type Safety**: TypeScript ensures only valid entity types are used
3. **Request Validation**: Leverage existing `ApiService` validation and authorization
4. **No Client-Side Filtering**: All data filtering happens server-side through `RequestOptions`

## Future Enhancements

Potential future additions:

1. **Optimistic Updates**: Built-in optimistic update support for mutations
2. **Infinite Queries**: Support for infinite scroll patterns
3. **Dependent Queries**: Helper methods for queries that depend on other queries
4. **Custom Mutations**: Allow concrete repositories to add entity-specific mutations
5. **Query Composition**: Combine multiple queries for complex data requirements
6. **WebSocket Support**: Real-time updates through WebSocket integration
