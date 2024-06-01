import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'ui-page-container',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="h-full w-full p-8">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerComponent {}
