import {
  FullscreenOverlayContainer,
  OverlayContainer,
  OverlayModule,
} from '@angular/cdk/overlay';
import { Component } from '@angular/core';
import { environment } from '../../../../environment/environment';
import { DevToolsButtonComponent } from './components/dev-tools-button.component';
import { DevToolsOverlayComponent } from './components/dev-tools-overlay.component';

@Component({
  selector: 'app-dev-tools',
  standalone: true,
  imports: [OverlayModule, DevToolsButtonComponent, DevToolsOverlayComponent],
  template: `
    @if (!isProduction) {
      <app-dev-tools-button
        #trigger="cdkOverlayOrigin"
        type="button"
        (click)="handleOpenOverlay()"
        cdkOverlayOrigin
      ></app-dev-tools-button>

      <ng-template
        [cdkConnectedOverlayOrigin]="trigger"
        [cdkConnectedOverlayOpen]="isOpen"
        [cdkConnectedOverlayHasBackdrop]="true"
        cdkConnectedOverlay
      >
        <app-dev-tools-overlay (closeTools)="handleCloseOverlay()">
          <ng-content></ng-content>
        </app-dev-tools-overlay>
      </ng-template>
    }
  `,
  providers: [
    { provide: OverlayContainer, useClass: FullscreenOverlayContainer },
  ],
})
export class DevToolsComponent {
  public isProduction = environment.production;
  public isOpen = false;

  handleOpenOverlay() {
    this.isOpen = true;
  }
  handleCloseOverlay() {
    this.isOpen = false;
  }
}
