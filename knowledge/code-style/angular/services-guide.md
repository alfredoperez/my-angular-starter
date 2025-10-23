# Angular Services

## Purpose
Service architecture patterns and dependency injection best practices for Angular applications.

## Critical Rules

- ALWAYS design services around a single responsibility
- ALWAYS use `providedIn: 'root'` for singleton services
- ALWAYS use `inject()` function instead of constructor injection
- ALWAYS expose state as readonly signals
- NEVER expose mutable signals directly

## Service Structure

<pattern context="basic-service">
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';

  getUsers() {
    return this.http.get<User[]>(this.apiUrl);
  }

  createUser(user: Omit<User, 'id'>) {
    return this.http.post<User>(this.apiUrl, user);
  }

  deleteUser(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
</pattern>

## State Management

<pattern context="service-state">
import { signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class CartService {
  // Private state
  private items = signal<CartItem[]>([]);

  // Public readonly state
  readonly cartItems = this.items.asReadonly();
  readonly itemCount = computed(() => this.items().length);
  readonly total = computed(() =>
    this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  addItem(product: Product) {
    this.items.update(items => [...items, {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    }]);
  }

  clear() {
    this.items.set([]);
  }
}
</pattern>

## Anti-patterns

<avoid>
// DON'T use constructor injection
export class BadService {
  constructor(
    private http: HttpClient,
    private router: Router
  ) {} // Use inject() instead
}

// DON'T expose mutable state
export class BadStateService {
  items = signal<Item[]>([]); // Should be private or readonly
}

// DON'T call inject() in methods
export class BadTimingService {
  doSomething() {
    const http = inject(HttpClient); // WRONG - must be at top level
  }
}

// DON'T forget providedIn
@Injectable() // Missing providedIn
export class BadService {}
</avoid>
