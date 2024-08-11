import { Component } from '@angular/core';

@Component({
  selector: 'app-dev-tools-button',
  standalone: true,
  imports: [],
  template: `
    <button class="dev-tools__button">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="4 17 10 11 4 5" />
        <line x1="12" x2="20" y1="19" y2="19" />
      </svg>
    </button>
  `,
  styles: [
    `
      .dev-tools__button {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #0f0c29;
        color: #00ffea;
        border: 1px solid #e0e0e0;
        box-shadow:
          0 4px 6px rgba(0, 0, 0, 0.1),
          0 1px 3px rgba(0, 0, 0, 0.08);
        border-radius: 8px;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.2;
        transition: opacity 0.3s ease;
      }
      .dev-tools__button:hover {
        opacity: 1;
      }
    `,
  ],
})
export class DevToolsButtonComponent {}
