import {
  CdkConnectedOverlay,
  Overlay,
  OverlayModule,
  OverlayRef,
} from '@angular/cdk/overlay';
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
import { IconComponent, IconName } from '../icons';

@Component({
  selector: 'ngx-dev-toolbar-tool',
  standalone: true,
  imports: [
    CdkConnectedOverlay,
    OverlayModule,
    DevToolbarWindowComponent,
    DevToolbarButtonComponent,
    IconComponent,
  ],
  template: `
    <div #trigger="cdkOverlayOrigin" class="tool" cdkOverlayOrigin>
      <div class="trigger" (click)="onOpen()">
        <div [attr.data-tooltip]="title()">
          <ngx-dev-toolbar-button [title]="title()">
            <ngx-dev-toolbar-icon [name]="icon()" />
          </ngx-dev-toolbar-button>
          <ng-content select="ngx-dev-toolbar-button"></ng-content>
        </div>
      </div>

      <ng-template
        #contentTemplate
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayOpen]="isActive()"
        [cdkConnectedOverlayPositions]="positions"
        [cdkConnectedOverlayWidth]="400"
        [cdkConnectedOverlayMinWidth]="300"
        [cdkConnectedOverlayMinHeight]="200"
        [cdkConnectedOverlayHeight]="300"
        cdkConnectedOverlay
      >
        <ngx-dev-toolbar-window [title]="title()" (close)="onClose()">
          <ng-content select="ngx-devtool-content" />
        </ngx-dev-toolbar-window>

        <!-- <div class="overlay">
          <div class="header">
            <h3 class="title">{{ title() }} s</h3>
            <button class="close-btn" (click)="onClose()">×</button>
          </div>

          <div class="content">
          </div>
        </div> -->
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

  icon = input.required<IconName>();
  title = input.required<string>();
  component = input.required<any>();

  isActive = signal(false);
  positions = [
    {
      originX: 'center' as const,
      originY: 'top' as const,
      overlayX: 'center' as const,
      overlayY: 'bottom' as const,
      offsetY: -26,
    },
  ];
  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay) {}

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
