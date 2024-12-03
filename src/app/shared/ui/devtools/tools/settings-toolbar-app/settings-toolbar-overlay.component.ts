import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ngx-toolbar-settings-overlay',
  standalone: true,
  template: `
    <div class="settings-content">
      <h2 class="mb-4 text-lg font-semibold">Settings</h2>
      <!-- Settings content will go here -->s
    </div>
  `,
  styles: [
    `
      .settings-content {
        min-width: 300px;
        min-height: 200px;
      }
    `,
  ],
})
export class SettingsToolbarOverlayComponent implements OnInit {
  ngOnInit(): void {
    console.log('SettingsToolbarOverlayComponent');
  }
}
