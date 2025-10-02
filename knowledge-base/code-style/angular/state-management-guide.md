# State Management with Signals

## Purpose
Signals-based reactive state management patterns for Angular applications.

## Critical Rules

- ALWAYS use signals for local component state
- ALWAYS use `computed()` for derived state
- ALWAYS keep state transformations pure and immutable
- NEVER use `mutate()` on signals - use `update()` or `set()` instead
- NEVER mutate objects/arrays directly - always create new instances

## Updating Signals

<pattern context="signal-updates">
// Use set() for complete replacement
formData = signal({ name: '', email: '' });
resetForm() {
  this.formData.set({ name: '', email: '' });
}

// Use update() for transformations
todos = signal<Todo[]>([]);
addTodo(title: string) {
  this.todos.update(todos => [
    ...todos,
    { id: Date.now(), title, completed: false }
  ]);
}
</pattern>

<pattern context="computed-signals">
// Computed signals for derived state
items = signal<CartItem[]>([]);
subtotal = computed(() =>
  this.items().reduce((sum, item) => sum + item.price * item.quantity, 0)
);
</pattern>

## Anti-patterns

<avoid>
// NEVER use mutate()
items = signal([1, 2, 3]);
addItem(item: number) {
  this.items.mutate(arr => arr.push(item)); // DON'T
}

// NEVER mutate directly
user = signal({ name: 'John', age: 30 });
updateAge() {
  const u = this.user();
  u.age = 31; // WRONG
  this.user.set(u);
}

// NEVER create side effects in computed
computed(() => {
  const data = this.data();
  this.service.save(data); // WRONG - use effect()
  return data;
});
</avoid>
