import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ui-page-container',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-full items-center justify-center p-8">
      <div class="max-w-6xl">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerComponent {}
