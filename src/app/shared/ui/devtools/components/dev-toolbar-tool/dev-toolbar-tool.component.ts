import { CdkConnectedOverlay, OverlayModule } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ElementRef,
  ViewChild,
  input,
  signal,
} from '@angular/core';
import { DevToolbarButtonComponent } from '../dev-toolbar-button/dev-toolbar-button.component';
import { DevToolbarWindowComponent } from '../dev-toolbar-window/dev-toolbar-window.component';
import { WindowConfig } from '../dev-toolbar-window/dev-toolbar-window.models';
import { DevToolbarIconComponent, IconName } from '../icons';

@Component({
  selector: 'ngx-dev-toolbar-tool',
  standalone: true,
  imports: [
    CdkConnectedOverlay,
    OverlayModule,
    DevToolbarWindowComponent,
    DevToolbarButtonComponent,
    DevToolbarIconComponent,
  ],
  template: `
    <div #trigger="cdkOverlayOrigin" class="dev-toolbar-tool" cdkOverlayOrigin>
      <div class="dev-toolbar-tool__icon" (click)="onOpen()">
        <div [attr.data-tooltip]="title()">
          @if (icon()) {
            <ngx-dev-toolbar-button [title]="title()">
              <ngx-dev-toolbar-icon [name]="icon()" />
            </ngx-dev-toolbar-button>
          } @else {
            <ng-content select="ngx-dev-toolbar-button"></ng-content>
          }
        </div>
      </div>

      <ng-template
        #contentTemplate
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayOpen]="isActive()"
        [cdkConnectedOverlayPositions]="positions"
        [cdkConnectedOverlayWidth]="640"
        [cdkConnectedOverlayMinWidth]="400"
        [cdkConnectedOverlayMinHeight]="300"
        [cdkConnectedOverlayHeight]="420"
        cdkConnectedOverlay
      >
        <ngx-dev-toolbar-window [config]="windowConfig()" (close)="onClose()">
          <ng-content />
        </ngx-dev-toolbar-window>
      </ng-template>
    </div>
  `,
  styleUrl: './dev-toolbar-tool.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevToolbarToolComponent {
  @ViewChild('trigger') trigger!: ElementRef;

  @ContentChild(DevToolbarButtonComponent)
  buttonComponent!: DevToolbarButtonComponent;

  windowConfig = input.required<WindowConfig>();
  icon = input.required<IconName>();
  title = input.required<string>();
  isActive = signal(false);
  positions = [
    {
      originX: 'center' as const,
      originY: 'top' as const,
      overlayX: 'center' as const,
      overlayY: 'bottom' as const,
      offsetY: -16,
    },
  ];

  onOpen(): void {
    const isActive = this.isActive();

    this.isActive.set(!isActive);
    if (this.buttonComponent) {
      this.buttonComponent.isActive = signal(!isActive);
    }
  }

  onClose(): void {
    this.isActive.set(false);
  }
}
