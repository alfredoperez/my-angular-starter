import { Component, ChangeDetectionStrategy, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTitleStat } from './page-title.models';

@Component({
  selector: 'ui-page-title',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h1 class="page-title">
      {{ title() }}
    </h1>
    @if (stats().length > 0) {
      <div class="flex items-center text-surface-700 dark:text-surface-300 flex-wrap gap-8 mt-4">
        @for (stat of stats(); track stat.label) {
          <div class="flex items-center gap-2">
            <i [class]="'pi ' + stat.icon + ' text-base! leading-normal!'"></i>
            <span>{{ stat.value }} {{ stat.label }}</span>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    :host {
      display: flex;
      align-items: center;
      height: 36px;
    }
    .page-title {
      font-family: 'Inter', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: var(--surface-900);
      margin: 0;
      line-height: 36px;
    }
    :host-context(.dark) .page-title {
      color: var(--surface-0);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageTitleComponent {
  title = input.required<string>();
  stats = input<PageTitleStat[]>([]);
}