export type WindowPlacement =
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'
  | 'top-left'
  | 'top-center'
  | 'top-right';

export type WindowSize = 'medium' | 'tall';
export interface WindowConfig {
  id: string;
  /**
   * The title of the window, this can be different from the name of the tool
   */
  title: string;
  isClosable?: boolean;
  isMaximizable?: boolean;
  isMinimizable?: boolean;
  placement?: WindowPlacement;
  size?: WindowSize;
}

export interface WindowPosition {
  x: number;
  y: number;
}
