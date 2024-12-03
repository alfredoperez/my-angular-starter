import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { timer } from 'rxjs';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';

@Component({
  selector: 'ngx-dev-toolbar-button',
  standalone: true,
  template: `
    <button
      class="dev-toolbar-button"
      [class.dev-toolbar-button--toolbar-visible]="isToolbarVisible()"
      [class.dev-toolbar-button--active]="isActive()"
      [class.dev-toolbar-button--focus]="isFocused()"
      (mouseenter)="onMouseEnter()"
      (focusin)="onFocus()"
      (focusout)="onDefocus()"
      (mouseleave)="onMouseLeave()"
      (keydown.escape)="onEscape()"
    >
      @if (isTooltipVisible()) {
        <span
          class="dev-toolbar-button__tooltip"
          [@tooltipAnimation]="tooltipState ? 'visible' : 'hidden'"
        >
          {{ tooltip() }}
        </span>
      }
      <ng-content />
    </button>
  `,
  animations: [
    trigger('tooltipAnimation', [
      state(
        'hidden',
        style({
          opacity: 0,
          transform: 'translateX(-50%) translateY(1rem)',
        }),
      ),
      state(
        'visible',
        style({
          opacity: 1,
          transform: 'translateX(-50%) translateY(0)',
        }),
      ),
      transition('hidden => visible', [animate('200ms ease-out')]),
      transition('visible => hidden', [animate('150ms ease-in')]),
    ]),
  ],
  styleUrl: './dev-toolbar-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarButtonComponent {
  state = inject(DevToolbarStateService);

  isToolbarVisible = this.state.isVisible;
  title = input.required<string>();
  isActive = signal(false);
  isFocused = signal(false);
  click = output<void>();

  isTooltipVisible = computed(() => this.tooltip() && !this.isActive());

  tooltipState = false;
  private hideDelay = 3000;
  private readonly elementRef = inject(ElementRef);

  tooltip = computed(
    () =>
      this.elementRef.nativeElement.parentElement?.getAttribute(
        'data-tooltip',
      ) ?? '',
  );

  onClick() {
    this.isFocused.set(false);
    this.click.emit();
    console.log(this.tooltip());
  }

  onMouseEnter(): void {
    this.tooltipState = true;
    // this.isFocused.set(true);
  }

  onMouseLeave(): void {
    this.tooltipState = false;
    timer(this.hideDelay)
      // .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // this.isFocused.set(false);
      });
  }

  onEscape(): void {
    this.isFocused.set(false);
  }

  onFocus(): void {
    this.isFocused.set(true);
  }
  onDefocus(): void {
    this.isFocused.set(false);
  }
}
