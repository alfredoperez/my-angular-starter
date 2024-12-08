import { WindowConfig } from '../dev-toolbar-window/dev-toolbar-window.models';
import { IconName } from '../icons';

export interface DevToolbarToolConfig {
  icon: IconName;
  name: string;
  windowConfig: WindowConfig;
}
