import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { DevToolbarStateService } from '../../dev-toolbar-state.service';
import { AngularIconComponent } from './angular-icon.component';
import { BugIconComponent } from './bug-icon.component';
import { CodeIconComponent } from './code-icon.component';
import { DatabaseIconComponent } from './database-icon.component';
import { GaugeIconComponent } from './gauge-icon.component';
import { GearIconComponent } from './gear-icon.component';
import { GitBranchIconComponent } from './git-branch-icon.component';
import { IconName } from './icon.models';
import { LayoutIconComponent } from './layout-icon.component';
import { LightingIconComponent } from './lighting-icon.component';
import { MoonIconComponent } from './moon-icon.component';
import { NetworkIconComponent } from './network-icon.component';
import { PuzzleIconComponent } from './puzzle-icon.component';
import { RefreshIconComponent } from './refresh-icon.component';
import { StarIconComponent } from './star-icon.component';
import { SunIconComponent } from './sun-icon.component';
import { TerminalIconComponent } from './terminal-icon.component';
import { ToggleLeftIconComponent } from './toggle-left-icon.component';
import { UsersIconComponent } from './users-icon.component';

@Component({
  selector: 'ngx-dev-toolbar-icon',
  standalone: true,
  imports: [
    AngularIconComponent,
    BugIconComponent,
    CodeIconComponent,
    DatabaseIconComponent,
    GaugeIconComponent,
    GearIconComponent,
    GitBranchIconComponent,
    LayoutIconComponent,
    LightingIconComponent,
    NetworkIconComponent,
    PuzzleIconComponent,
    RefreshIconComponent,
    StarIconComponent,
    TerminalIconComponent,
    ToggleLeftIconComponent,
    UsersIconComponent,
    SunIconComponent,
    MoonIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (name()) {
      @case ('angular') {
        <ngx-dev-toolbar-angular-icon />
      }
      @case ('bug') {
        <ngx-dev-toolbar-bug-icon [fill]="fill()" />
      }
      @case ('code') {
        <ngx-dev-toolbar-code-icon [fill]="fill()" />
      }
      @case ('database') {
        <ngx-dev-toolbar-database-icon [fill]="fill()" />
      }
      @case ('gauge') {
        <ngx-dev-toolbar-gauge-icon [fill]="fill()" />
      }
      @case ('gear') {
        <ngx-dev-toolbar-gear-icon [fill]="fill()" />
      }
      @case ('git-branch') {
        <ngx-dev-toolbar-git-branch-icon [fill]="fill()" />
      }
      @case ('layout') {
        <ngx-dev-toolbar-layout-icon [fill]="fill()" />
      }
      @case ('lighting') {
        <ngx-dev-toolbar-lighting-icon [fill]="fill()" />
      }
      @case ('network') {
        <ngx-dev-toolbar-network-icon [fill]="fill()" />
      }
      @case ('puzzle') {
        <ngx-dev-toolbar-puzzle-icon [fill]="fill()" />
      }
      @case ('refresh') {
        <ngx-dev-toolbar-refresh-icon [fill]="fill()" />
      }
      @case ('star') {
        <ngx-dev-toolbar-star-icon [fill]="fill()" />
      }
      @case ('terminal') {
        <ngx-dev-toolbar-terminal-icon [fill]="fill()" />
      }
      @case ('toggle-left') {
        <ngx-dev-toolbar-toggle-left-icon [fill]="fill()" />
      }
      @case ('user') {
        <ngx-dev-toolbar-users-icon [fill]="fill()" />
      }
      @case ('sun') {
        <ngx-dev-toolbar-sun-icon [fill]="fill()" />
      }
      @case ('moon') {
        <ngx-dev-toolbar-moon-icon [fill]="fill()" />
      }
    }
  `,
})
export class DevToolbarIconComponent {
  private readonly stateService = inject(DevToolbarStateService);

  name = input.required<IconName>();

  fill = computed(() =>
    this.stateService.theme() === 'dark' ? '#FFFFFF' : '#000000',
  );
}
