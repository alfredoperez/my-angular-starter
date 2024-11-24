import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ui-page-container',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex justify-center items-center p-8 h-full">
      <div class="max-w-6xl">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerComponent {}
