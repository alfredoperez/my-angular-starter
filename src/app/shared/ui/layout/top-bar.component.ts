import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BadgeModule } from 'primeng/badge';
import { StyleClassModule } from 'primeng/styleclass';
import { RippleModule } from 'primeng/ripple';
import { NavItem } from './top-bar.models';

@Component({
  selector: 'ui-top-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, BadgeModule, StyleClassModule, RippleModule],
  template: `
    <nav class="h-16 sticky top-0 z-50 flex items-center justify-between gap-8 px-8 lg:px-20 bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 shadow-sm">
      <!-- Logo Section -->
      <div class="flex items-center gap-4">
        <a routerLink="/" class="flex items-center gap-3">
          <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">N</span>
          </div>
          <div class="text-surface-900 dark:text-surface-0 font-semibold text-lg">ng-starter</div>
        </a>
      </div>

      <!-- Mobile Menu Toggle -->
      <a
        pStyleClass="@next"
        enterFromClass="hidden"
        leaveToClass="hidden"
        [hideOnOutsideClick]="true"
        [hideOnResize]="true"
        class="cursor-pointer block lg:hidden text-surface-700 dark:text-surface-0"
        pRipple
      >
        <i class="pi pi-bars text-xl"></i>
      </a>

      <!-- Mobile Menu -->
      <div class="hidden lg:hidden bg-surface-0 dark:bg-surface-900 shadow-lg absolute left-0 right-0 top-16 z-20">
        <div class="flex-1 flex flex-col gap-0 px-0 py-4">
          @for (item of navItems(); track item.label) {
            <a
              [routerLink]="item.route"
              [class]="
                'flex items-center gap-2 px-6 py-3 cursor-pointer transition-all duration-150 border-l-2 relative overflow-hidden ' +
                (selectedNav() === item.label
                  ? 'border-primary-500 dark:border-primary-400 bg-primary-50 dark:bg-surface-800'
                  : 'border-transparent hover:border-primary-500 dark:hover:border-primary-400 hover:bg-surface-50 dark:hover:bg-surface-800')
              "
              (click)="setSelectedNav(item.label)"
              pRipple
            >
              <i [class]="item.icon + ' text-base'"
                 [ngClass]="selectedNav() === item.label ? 'text-primary-600 dark:text-primary-400' : 'text-surface-500 dark:text-surface-400'"></i>
              <span [ngClass]="selectedNav() === item.label ? 'text-surface-900 dark:text-surface-0 font-medium' : 'text-surface-600 dark:text-surface-300'">
                {{ item.label }}
              </span>
              @if (item.badge) {
                <p-badge [value]="item.badge" severity="info" styleClass="ml-auto"></p-badge>
              }
            </a>
          }
        </div>
        <div class="flex items-center justify-between px-6 py-4 border-t border-surface-200 dark:border-surface-700">
          <a class="cursor-pointer relative overflow-hidden p-2 -m-2 rounded-full" pRipple>
            <i class="pi pi-bell text-xl text-surface-600 dark:text-surface-300"></i>
            <span class="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </a>
          <div class="flex items-center gap-3">
            <img
              src="https://api.dicebear.com/9.x/adventurer/svg?seed=Alfredo"
              alt="User Avatar"
              class="w-8 h-8 rounded-full"
            />
            <div class="text-surface-900 dark:text-surface-0 font-medium">Alfredo</div>
          </div>
        </div>
      </div>

      <!-- Desktop Menu -->
      <div class="flex-1 h-full items-center justify-between hidden lg:flex">
        <div class="flex items-center gap-2 h-full ml-8">
          @for (item of navItems(); track item.label) {
            <a
              [routerLink]="item.route"
              [class]="
                'flex items-center gap-2 h-full px-4 cursor-pointer transition-all duration-150 border-b-2 relative overflow-hidden ' +
                (selectedNav() === item.label
                  ? 'border-primary-500 dark:border-primary-400'
                  : 'border-transparent hover:border-primary-500 dark:hover:border-primary-400')
              "
              (click)="setSelectedNav(item.label)"
              pRipple
            >
              <i [class]="item.icon + ' text-base'"
                 [ngClass]="selectedNav() === item.label ? 'text-surface-900 dark:text-surface-0' : 'text-surface-500 dark:text-surface-400'"></i>
              <span [ngClass]="selectedNav() === item.label ? 'text-surface-900 dark:text-surface-0 font-medium' : 'text-surface-600 dark:text-surface-300'">
                {{ item.label }}
              </span>
              @if (item.badge) {
                <p-badge [value]="item.badge" severity="info"></p-badge>
              }
            </a>
          }
        </div>
        <div class="flex items-center gap-6">
          <a class="cursor-pointer relative overflow-hidden p-2 -m-2 rounded-full" pRipple>
            <i class="pi pi-bell text-xl text-surface-600 dark:text-surface-300 hover:text-surface-900 dark:hover:text-surface-100 transition-colors"></i>
            <span class="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </a>
          <img
            src="https://api.dicebear.com/9.x/adventurer/svg?seed=Alfredo"
            alt="User Avatar"
            class="w-9 h-9 rounded-full cursor-pointer border-2 border-transparent hover:border-primary-400 transition-all"
          />
        </div>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 50;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopBarComponent {
  navItems = signal<NavItem[]>([
    {
      label: 'Home',
      icon: 'pi pi-home',
      route: '/home'
    },
    {
      label: 'Users',
      icon: 'pi pi-users',
      route: '/users'
    }
  ]);

  selectedNav = signal<string>('Home');

  constructor(private router: Router) {
    // Set selected nav based on current route
    this.updateSelectedNavFromRoute();
  }

  setSelectedNav(navLabel: string): void {
    this.selectedNav.set(navLabel);
  }

  private updateSelectedNavFromRoute(): void {
    const currentRoute = this.router.url;
    if (currentRoute === '/' || currentRoute === '/home') {
      this.selectedNav.set('Home');
    } else if (currentRoute.startsWith('/users')) {
      this.selectedNav.set('Users');
    }
  }
}