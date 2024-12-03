export type WindowPlacement = 'bottom-left' | 'bottom-center' | 'bottom-right';

export interface WindowConfig {
  title: string;
  isClosable?: boolean;
  isMaximizable?: boolean;
  isMinimizable?: boolean;
  placement?: WindowPlacement;
}

export interface WindowPosition {
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}
