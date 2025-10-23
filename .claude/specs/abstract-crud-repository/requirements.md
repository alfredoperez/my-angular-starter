# Requirements Document

## Introduction

This feature introduces an abstract CRUD repository pattern that integrates @ngneat/query (TanStack Query for Angular) while maintaining a clean separation of concerns. Similar to the existing `ApiService<T>` pattern, developers will be able to create entity-specific repositories by simply extending an abstract class and providing an entity model type. The abstract repository will encapsulate all @ngneat/query implementation details, automatically providing CRUD operations with built-in query management, caching, loading states, and error handling.

The goal is to eliminate boilerplate code when creating data access layers for entities, while leveraging the powerful features of TanStack Query without exposing its complexity to concrete repository implementations.

## Requirements

### Requirement 1: Abstract Repository Pattern

**User Story:** As a developer, I want to create entity-specific repositories by extending an abstract repository class and providing only the entity name, so that I can get full CRUD operations with TanStack Query integration without writing repetitive code.

#### Acceptance Criteria

1. WHEN a developer creates a concrete repository class THEN the repository SHALL extend an abstract repository base class
2. WHEN creating a concrete repository THEN the developer SHALL only need to provide the entity name (e.g., 'users') in the constructor
3. WHEN a concrete repository is instantiated THEN it SHALL automatically inherit all CRUD operation methods
4. WHEN a concrete repository is created THEN it SHALL follow the same simple pattern as the existing `ApiService<T>` (extending a base class with minimal code)
5. IF the entity type is provided as a generic parameter THEN all CRUD operations SHALL be properly typed for that entity

### Requirement 2: Query Integration Abstraction

**User Story:** As a developer, I want the abstract repository to hide all @ngneat/query implementation details, so that concrete repositories remain simple and focused on business logic without needing to understand TanStack Query internals.

#### Acceptance Criteria

1. WHEN a concrete repository is created THEN it SHALL NOT contain any direct references to @ngneat/query APIs
2. WHEN the abstract repository implementation changes THEN concrete repositories SHALL NOT require code modifications
3. WHEN @ngneat/query is configured in the abstract repository THEN all query keys, cache management, and query client configuration SHALL be handled internally
4. WHEN a developer examines a concrete repository THEN they SHALL see only the entity name and inherited CRUD methods, similar to `UsersApiService` extending `ApiService<User>`

### Requirement 3: Read Operations with Query Support

**User Story:** As a developer, I want read operations (fetch by ID and fetch paginated lists) to use TanStack Query, so that I automatically get caching, background refetching, and loading states.

#### Acceptance Criteria

1. WHEN `fetchById` is called THEN the system SHALL use a TanStack Query query for the operation
2. WHEN `fetchPage` is called with pagination options THEN the system SHALL use a TanStack Query query for the list operation
3. WHEN a query is executed THEN the system SHALL return query state including data, loading status, and error status
4. WHEN the same query is called multiple times THEN TanStack Query SHALL use cached data when appropriate
5. WHEN pagination parameters change THEN the system SHALL generate unique query keys for each page
6. IF request options include sorting or filtering THEN the query keys SHALL reflect these parameters for proper caching

### Requirement 4: Mutation Operations for Create, Update, Delete

**User Story:** As a developer, I want create, update, and delete operations to use TanStack Query mutations, so that I get optimistic updates, automatic cache invalidation, and consistent error handling.

#### Acceptance Criteria

1. WHEN `create` is called with entity data THEN the system SHALL use a TanStack Query mutation
2. WHEN `update` is called with an ID and entity data THEN the system SHALL use a TanStack Query mutation
3. WHEN `delete` is called with an ID THEN the system SHALL use a TanStack Query mutation
4. WHEN a mutation succeeds THEN the system SHALL automatically invalidate related queries to refresh cached data
5. WHEN a mutation is in progress THEN the system SHALL provide loading state information
6. WHEN a mutation fails THEN the system SHALL provide error information through the mutation state

### Requirement 5: Type Safety with Generic Entity Models

**User Story:** As a developer, I want the repository to be generic over entity types, so that I get full TypeScript type safety for all CRUD operations specific to my entity model.

#### Acceptance Criteria

1. WHEN an entity type is provided as a generic parameter THEN all method signatures SHALL use that type
2. WHEN `fetchById` returns data THEN it SHALL be typed as the entity type
3. WHEN `fetchPage` returns data THEN the items SHALL be typed as an array of the entity type
4. WHEN `create` accepts data THEN the parameter SHALL be typed as Partial of the entity type
5. WHEN `update` accepts data THEN the parameter SHALL be typed as Partial of the entity type
6. WHEN TypeScript compilation occurs THEN type mismatches SHALL be caught at compile time

### Requirement 6: Query State Management

**User Story:** As a developer, I want read operations to return comprehensive query state information, so that I can handle loading states, errors, and data display in my components.

#### Acceptance Criteria

1. WHEN a query operation is called THEN the return type SHALL include data, isLoading, isError, and error properties
2. WHEN a query is fetching THEN the isLoading state SHALL be true
3. WHEN a query completes successfully THEN the data SHALL be available and isLoading SHALL be false
4. WHEN a query fails THEN isError SHALL be true and error information SHALL be provided
5. WHEN a query is refetching in the background THEN the system SHALL provide isFetching status

### Requirement 7: Mutation State Management

**User Story:** As a developer, I want mutation operations to return mutation state information, so that I can show loading indicators, handle success, and display error messages in the UI.

#### Acceptance Criteria

1. WHEN a mutation operation is called THEN the return type SHALL include mutation state properties
2. WHEN a mutation is in progress THEN the isPending state SHALL be true
3. WHEN a mutation succeeds THEN the success state SHALL be available
4. WHEN a mutation fails THEN error information SHALL be provided
5. WHEN a mutation completes THEN the mutate function SHALL be available for retrying the operation

### Requirement 8: Automatic Cache Key Generation

**User Story:** As a developer, I want the repository to automatically generate appropriate cache keys for queries, so that caching works correctly without manual key management.

#### Acceptance Criteria

1. WHEN `fetchById` is called with an ID THEN the query key SHALL include the entity name and the ID
2. WHEN `fetchPage` is called with pagination options THEN the query key SHALL include the entity name and pagination parameters
3. WHEN request options change THEN the query key SHALL reflect the changes
4. WHEN two queries have identical parameters THEN they SHALL use the same cache key
5. WHEN pagination or filtering parameters differ THEN separate cache keys SHALL be generated

### Requirement 9: Request Options and Response Types

**User Story:** As a developer, I want the repository to use the existing `RequestOptions` interface from `api.models.ts`, so that I can control query behavior (like staleTime, select, pagination) and get consistent, typed responses across all CRUD operations.

#### Acceptance Criteria

1. WHEN any CRUD operation accepts options THEN it SHALL use `Partial<RequestOptions>` from `src/app/shared/data/api.models.ts`
2. WHEN `RequestOptions.staleTime` is provided THEN it SHALL configure the TanStack Query stale time for that specific query
3. WHEN `RequestOptions.select` is provided THEN it SHALL transform the query data using the select function
4. WHEN `RequestOptions.pagination` is provided THEN it SHALL be used for paginated queries
5. WHEN `RequestOptions.orderBy` and `RequestOptions.orderDirection` are provided THEN they SHALL be used for sorting
6. WHEN `RequestOptions.searchQuery` is provided THEN it SHALL be included in the query parameters
7. WHEN `RequestOptions.url` is provided THEN it SHALL override the default entity URL
8. WHEN `fetchPage` returns data THEN it SHALL return the `ListResponse<T>` type from `api.models.ts`
9. WHEN `ListResponse<T>` is returned THEN it SHALL include total, items, hasMore, and pagination properties

### Requirement 10: API Integration Consistency

**User Story:** As a developer, I want the repository to integrate with the same API infrastructure as the existing `ApiService`, so that it uses consistent URL patterns and HTTP client configuration.

#### Acceptance Criteria

1. WHEN the repository makes HTTP requests THEN it SHALL use the same URL pattern as `ApiService` (e.g., `http://localhost:3000/{entityName}`)
2. WHEN pagination is provided THEN the system SHALL use the same pagination parameters as `ApiService` (_limit, _page, _sort)
3. WHEN making HTTP calls THEN the system SHALL use Angular's HttpClient
4. WHEN processing list responses THEN the system SHALL map HTTP headers (X-Total-Count) to `ListResponse<T>` format
5. WHEN request options are processed THEN they SHALL be handled consistently with the existing `ApiService` implementation

### Requirement 11: Dependency Injection Support

**User Story:** As a developer, I want concrete repositories to work with Angular's dependency injection system, so that I can inject them into components and services like any other Angular service.

#### Acceptance Criteria

1. WHEN a concrete repository is defined THEN it SHALL be marked with `@Injectable` decorator
2. WHEN `providedIn: 'root'` is specified THEN the repository SHALL be available application-wide
3. WHEN a repository is injected THEN it SHALL be instantiated with proper dependency injection
4. WHEN the abstract repository requires dependencies (like HttpClient) THEN they SHALL be injected using Angular's DI system
