import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ui-page-container',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex min-h-screen w-full justify-center">
      <div class="w-full max-w-7xl px-4 py-8">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerComponent {}
