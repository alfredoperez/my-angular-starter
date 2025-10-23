# Implementation Plan

## Overview

This implementation plan provides step-by-step tasks to build the abstract CRUD repository that merges HTTP operations and TanStack Query integration. Tasks are ordered to build incrementally, starting with core infrastructure and progressing to full CRUD functionality.

## Tasks

- [x] 1. Install and configure @ngneat/query package
  - Install `@ngneat/query` package via pnpm
  - Add provider configuration in app.config.ts or main application providers
  - Verify package is properly installed and imported
  - _Requirements: 2.1, 2.2_

- [x] 2. Create base CrudRepository abstract class structure
  - Create `src/app/shared/data/crud-repository.ts` file
  - Define abstract class `CrudRepository<T>` with generic type parameter
  - Add abstract `entityName` property
  - Add HttpClient injection using `inject(HttpClient)`
  - Add @ngneat/query injections: `injectQuery()`, `injectMutation()`, `injectQueryClient()`
  - Add default configuration properties (defaultStaleTime, defaultGcTime)
  - _Requirements: 1.1, 1.2, 1.3, 11.1, 11.2, 11.3, 11.4_

- [x] 3. Implement query key factory in CrudRepository
  - Create protected `queryKeys` object with factory methods
  - Implement `all()` method returning `[entityName]`
  - Implement `list(requestOptions)` method returning `[entityName, 'list', requestOptions]`
  - Implement `details(id)` method returning `[entityName, 'details', id]`
  - Ensure query keys reflect pagination, sorting, and filtering parameters
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [x] 4. Implement private HTTP helper methods
  - [ ] 4.1. Create private `#getUrl(id?: string)` method
    - Build URL using pattern `http://localhost:3000/${entityName}${idPath}`
    - Support optional ID parameter for detail endpoints
    - _Requirements: 10.1, 10.2_

  - [ ] 4.2. Create private `#getOptions(options?, body?)` method
    - Map `RequestOptions.pagination` to query parameters (_limit, _page, _sort)
    - Handle orderBy and orderDirection for sorting
    - Support observe option (body, response, events)
    - Return object with params, body, and observe properties
    - _Requirements: 9.1, 9.4, 9.5, 9.6, 10.2, 10.5_

  - [ ] 4.3. Create private `#request<TResult>()` method
    - Accept method (GET, POST, PUT, DELETE, PATCH), requestOptions, body, and id parameters
    - Call `#getUrl()` to build URL
    - Call `#getOptions()` to prepare options
    - Use `this.#httpClient.request<TResult>(method, url, options)`
    - Use `lastValueFrom()` to convert Observable to Promise
    - _Requirements: 10.3, 10.4_

  - [ ] 4.4. Create private `#mapListResponse()` method
    - Extract total count from X-Total-Count header
    - Calculate hasMore based on pagination parameters
    - Return ListResponse<T> with items, total, hasMore, pagination properties
    - Handle missing headers gracefully
    - _Requirements: 9.8, 9.9, 10.4_

- [x] 5. Implement fetchPage query method
  - Create public `fetchPage(requestOptions)` method returning `QueryObserverResult<ListResponse<T>, Error>`
  - Use `this.#query()` to create TanStack Query
  - Set queryKey to `this.queryKeys.list(requestOptions)`
  - Implement queryFn that calls `#request<Array<T>>('GET', ...)` with observe: 'response'
  - Call `#mapListResponse()` to transform response
  - Configure placeholderData with `keepPreviousData`
  - Map `RequestOptions.staleTime` to query staleTime option
  - Map `RequestOptions.select` to query select option
  - Use defaultStaleTime and defaultGcTime for cache configuration
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 6.1, 6.2, 6.3, 6.4, 6.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.8_

- [x] 6. Implement fetchById query method
  - Create public `fetchById(id: string)` method returning `QueryObserverResult<T, Error>`
  - Use `this.#query()` to create TanStack Query
  - Set queryKey to `this.queryKeys.details(id)`
  - Implement queryFn that calls `#request<T>('GET', undefined, undefined, id)`
  - Configure enabled option to `!!id` to prevent empty ID queries
  - Use defaultStaleTime and defaultGcTime for cache configuration
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Implement create mutation method ✅ COMPLETED
  - Create public `create()` method returning `MutationObserverResult<T | null, Error, Partial<T>, unknown>`
  - Use `this.#mutation()` to create TanStack Mutation
  - Set mutationKey to `[this.entityName, 'create']`
  - Implement mutationFn that calls `#request<T | null>('POST', undefined, data)`
  - Add onSuccess callback that invalidates all queries using `this.#queryClient.invalidateQueries({ queryKey: this.queryKeys.all() })`
  - Comprehensive unit tests added including cache invalidation and mutation state tests
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 8. Implement update mutation method ✅ COMPLETED
  - Create public `update()` method returning `MutationObserverResult<T, Error, { id: string; data: Partial<T> }, unknown>`
  - Use `this.#mutation()` to create TanStack Mutation
  - Set mutationKey to `[this.entityName, 'update']`
  - Implement mutationFn that accepts `{ id, data }` and calls `#request<T>('PUT', undefined, data, id)`
  - Add onSuccess callback that invalidates all queries
  - Comprehensive unit tests added including cache invalidation, mutation state tests, partial updates, and multiple field updates
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 9. Implement delete mutation method ✅ COMPLETED
  - Create public `delete()` method returning `MutationObserverResult<T, Error, string, unknown>`
  - Use `this.#mutation()` to create TanStack Mutation
  - Set mutationKey to `[this.entityName, 'delete']`
  - Implement mutationFn that accepts `id` and calls `#request<T>('DELETE', undefined, null, id)`
  - Add onSuccess callback that invalidates all queries AND removes specific detail query
  - Use `this.#queryClient.removeQueries({ queryKey: this.queryKeys.details(id) })`
  - Comprehensive unit tests added including:
    - Basic mutation creation and HTTP DELETE request tests
    - Success and error handling tests
    - Cache invalidation tests (verifying all queries are invalidated)
    - removeQueries verification test (confirming detail query is removed)
    - Mutation state tests (pending, success, error states)
    - Different entity IDs handling tests
    - Server error (500) and authorization error (403) tests
  - All tests passing with 98.21% code coverage
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 10. Implement prefetchNextPage utility method ✅ COMPLETED
  - Create public `prefetchNextPage(requestOptions)` method returning `Promise<void>`
  - Calculate next page number from current pagination
  - Build nextOptions with incremented page number
  - Use `this.#queryClient.prefetchQuery()` to prefetch next page
  - Set queryKey to `this.queryKeys.list(nextOptions)`
  - Implement queryFn that fetches and maps list response for next page
  - Comprehensive unit tests added including:
    - Basic prefetch with incremented page number
    - Default limit handling when not provided
    - Preservation of orderBy and orderDirection parameters
    - Page increment from various starting pages (0, 5, etc.)
    - Handling no pagination provided (defaults to page 0)
    - Cache verification - prefetched data is used by subsequent queries
    - Error handling for failed prefetch requests
    - Promise return type verification (resolves to void)
  - All 8 prefetchNextPage tests passing (100% coverage)
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 11. Create concrete UsersRepository as reference implementation ✅ COMPLETED
  - ✅ Created `src/app/users/data/users.repository.ts` file
  - ✅ Created `UsersRepository` class extending `CrudRepository<User>`
  - ✅ Added `@Injectable({ providedIn: 'root' })` decorator
  - ✅ Set `protected entityName = 'users'`
  - ✅ Verified no other code is needed (all functionality from abstract class)
  - ✅ Added comprehensive JSDoc documentation with usage examples
  - ✅ Exported from barrel export (`src/app/users/data/index.ts`)
  - ✅ Comprehensive unit tests created with 23 test cases:
    - Repository instantiation tests (3 tests)
    - Type safety verification tests (1 test)
    - fetchPage query tests (4 tests)
    - fetchById query tests (3 tests)
    - create mutation tests (3 tests)
    - update mutation tests (2 tests)
    - delete mutation tests (2 tests)
    - prefetchNextPage utility tests (1 test)
    - Integration tests (2 tests)
    - Error handling tests (2 tests)
  - All 23 tests passing with 100% success rate
  - Tests verify:
    - Correct HTTP requests (URLs, methods, parameters)
    - Query and mutation state management
    - Cache invalidation on mutations
    - Type safety throughout CRUD operations
    - Error handling (network errors, server errors, authorization)
    - Loading and error states
    - Full CRUD workflow integration
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 11.1, 11.2_

- [x] 12. Create unit tests for CrudRepository abstract class
  - Create `src/app/shared/data/crud-repository.spec.ts` file
  - Create test entity and test repository concrete implementation
  - Configure TestBed with `provideHttpClient()`, `provideHttpClientTesting()`, `provideNgNeatQuery()`
  - Write test for query key generation (all, list, details)
  - Write test for fetchPage query creation and HTTP request
  - Write test for fetchById query creation and HTTP request
  - Write test for create mutation and cache invalidation
  - Write test for update mutation and cache invalidation
  - Write test for delete mutation and cache invalidation with query removal
  - Write test for prefetchNextPage functionality
  - Verify HTTP requests use correct URLs, methods, and parameters
  - _Requirements: All requirements (comprehensive test coverage)_

- [ ] 13. Create unit tests for UsersRepository
  - Create `src/app/users/data/users.repository.spec.ts` file
  - Configure TestBed with UsersRepository and necessary providers
  - Test that repository can be instantiated
  - Test that entityName is set correctly
  - Test that all CRUD methods are available and properly typed
  - Use HttpTestingController to verify HTTP calls
  - _Requirements: 1.1, 1.2, 1.3, 5.6, 11.1, 11.2, 11.3_

- [x] 14. Update UsersPageComponent to use UsersRepository
  - Inject `UsersRepository` in users-page.component.ts
  - Replace any existing API service usage with repository methods
  - Use `usersRepo.fetchPage(requestOptions)` for list queries
  - Access query state via `.result()` signal in template
  - Update template to display loading, error, and data states
  - Use `usersRepo.delete()` mutation for delete operations
  - Update delete handler to call `deleteMutation.mutate(id)`
  - _Requirements: 3.1, 3.2, 3.3, 4.1, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3_

- [ ] 15. Update user detail component to use UsersRepository
  - Inject `UsersRepository` in user-detail-page.component.ts
  - Use `usersRepo.fetchById(id)` for detail queries
  - Access query state via `.result()` signal in template
  - Update template to handle loading and error states
  - Use `usersRepo.update()` mutation for edit operations
  - _Requirements: 3.1, 3.2, 4.1, 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.2, 7.3_

- [x] 16. Update user creation modal to use UsersRepository
  - Inject `UsersRepository` in add-user-modal.component.ts
  - Use `usersRepo.create()` mutation
  - Call `createMutation.mutate(userData)` on form submit
  - Handle mutation loading and error states
  - Close modal on successful mutation
  - _Requirements: 4.1, 4.2, 4.3, 7.1, 7.2, 7.3, 7.4_

- [x] 17. Add RequestOptions configuration support in components
  - Update components to pass staleTime in RequestOptions for custom cache durations
  - Test that different staleTime values affect query caching behavior
  - Add select transforms where appropriate (e.g., mapping data in queries)
  - Verify that RequestOptions are properly passed through to queries
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 18. Create barrel export for shared data layer
  - Update `src/app/shared/data/index.ts` to export CrudRepository
  - Ensure RequestOptions, ListResponse, and Pagination types are exported
  - Verify clean imports from `@my/shared/data`
  - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 19. Add JSDoc documentation to CrudRepository
  - Add class-level JSDoc describing the repository pattern
  - Document all public methods with @param and @returns tags
  - Document the purpose of generic type parameter T
  - Add usage examples in JSDoc comments
  - Document the query/mutation result types and how to access them
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 6.1, 7.1_

- [ ] 20. Integration test: End-to-end CRUD flow
  - Create integration test that exercises full CRUD cycle
  - Test: Create new entity, verify it appears in list
  - Test: Update entity, verify changes reflected in list and detail
  - Test: Delete entity, verify it's removed from list
  - Test: Verify cache invalidation works correctly across operations
  - Test: Verify query states (loading, error, success) throughout flow
  - Use real HTTP mocking with HttpTestingController
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 6.1, 7.1, 8.1, 8.2, 8.3, 8.4_
