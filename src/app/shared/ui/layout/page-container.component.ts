import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'page-container',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="p-8 w-full h-full">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerComponent {}
