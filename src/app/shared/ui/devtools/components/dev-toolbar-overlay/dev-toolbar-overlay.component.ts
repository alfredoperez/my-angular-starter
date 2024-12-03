import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'ngx-dev-toolbar-overlay',
  standalone: true,
  imports: [],
  template: ` <ng-content /> `,
  styleUrl: './dev-toolbar-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarOverlayComponent {
  close = output<void>();

  title = input<string>('');
  showHeader = input<boolean>(true);
  resizable = input<boolean>(true);
  width = input<number>(400);
  height = input<number>(600);

  onClose() {
    this.close.emit();
  }
}
