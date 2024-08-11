import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-dev-tools-overlay',
  standalone: true,
  imports: [],
  template: `
    <div class="overlay">
      <button class="close-btn" (click)="handleCloseOverlay()">X</button>
      <div [style.margin-top.em]="2" [style.color]="'black'">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styles: [
    `
      .overlay {
        padding: 20px;
        position: fixed;
        top: 0;
        right: 0;
        height: 100%;
        width: 400px;
        max-width: 90%;
        background-color: white;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        z-index: 9999999;
        border: 1px solid #e0e0e0;
        box-shadow:
          0 4px 6px rgba(0, 0, 0, 0.1),
          0 1px 3px rgba(0, 0, 0, 0.08);
        border-radius: 8px;
      }

      .close-btn {
        position: absolute;
        top: 20px;
        right: 20px;
        border: none;
        font-size: 14px;
        cursor: pointer;
        background-color: white;
        color: black;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 24px;
        height: 24px;
      }

      .close-btn:hover {
        text-shadow: gray 0 0 2px;
      }
    `,
  ],
})
export class DevToolsOverlayComponent implements OnInit {
  @Output() closeTools = new EventEmitter<void>();
  isVisible = false;

  ngOnInit(): void {
    this.isVisible = true;
  }

  handleCloseOverlay() {
    this.isVisible = false;
    this.closeTools.emit();
  }
}
