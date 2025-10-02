import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mx-auto px-4 py-8">
      <div class="text-center">
        <h1 class="text-4xl font-bold text-surface-900 dark:text-surface-0 mb-4">
          Welcome to Angular Starter
        </h1>
        <p class="text-lg text-surface-600 dark:text-surface-300 mb-8">
          A modern Angular application with PrimeNG components
        </p>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div class="bg-surface-0 dark:bg-surface-800 p-6 rounded-lg shadow-md border border-surface-200 dark:border-surface-700">
            <i class="pi pi-bolt text-4xl text-primary-500 mb-4 block"></i>
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">Fast Development</h3>
            <p class="text-surface-600 dark:text-surface-300">
              Built with modern tools and best practices for rapid development
            </p>
          </div>

          <div class="bg-surface-0 dark:bg-surface-800 p-6 rounded-lg shadow-md border border-surface-200 dark:border-surface-700">
            <i class="pi pi-palette text-4xl text-primary-500 mb-4 block"></i>
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">Beautiful UI</h3>
            <p class="text-surface-600 dark:text-surface-300">
              PrimeNG components with Tailwind CSS for stunning interfaces
            </p>
          </div>

          <div class="bg-surface-0 dark:bg-surface-800 p-6 rounded-lg shadow-md border border-surface-200 dark:border-surface-700">
            <i class="pi pi-shield text-4xl text-primary-500 mb-4 block"></i>
            <h3 class="text-xl font-semibold text-surface-900 dark:text-surface-0 mb-2">Type Safe</h3>
            <p class="text-surface-600 dark:text-surface-300">
              Full TypeScript support for robust and maintainable code
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {}