import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ui-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div class="h-16 px-6 flex items-center justify-between">
        <!-- Logo Section -->
        <div class="flex items-center">
          <a routerLink="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-lg">N</span>
            </div>
            <span class="text-xl font-semibold text-gray-800">ng-starter</span>
          </a>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 flex items-center justify-center">
          <ul class="flex space-x-8">
            <li>
              <a
                routerLink="/home"
                routerLinkActive="text-indigo-600 border-b-2 border-indigo-600"
                [routerLinkActiveOptions]="{ exact: true }"
                class="text-gray-600 hover:text-indigo-600 px-3 py-4 text-sm font-medium transition-colors">
                Home
              </a>
            </li>
            <li>
              <a
                routerLink="/users"
                routerLinkActive="text-indigo-600 border-b-2 border-indigo-600"
                class="text-gray-600 hover:text-indigo-600 px-3 py-4 text-sm font-medium transition-colors">
                Users
              </a>
            </li>
          </ul>
        </nav>

        <!-- Right Side Icons -->
        <div class="flex items-center space-x-4">
          <!-- Notification Icon -->
          <button
            type="button"
            class="relative p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9">
              </path>
            </svg>
            <!-- Notification badge -->
            <span class="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          <!-- User Avatar -->
          <button
            type="button"
            class="flex items-center">
            <img
              src="https://api.dicebear.com/9.x/adventurer/svg?seed=Alfredo"
              alt="User Avatar"
              class="w-10 h-10 rounded-full border-2 border-gray-200 hover:border-indigo-400 transition-colors"
            />
          </button>
        </div>
      </div>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarComponent {}