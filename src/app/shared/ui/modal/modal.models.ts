import { ComponentRef } from '@angular/core';
import { Subject } from 'rxjs';

export interface Options {
  modal?: {
    enter?: string;
    leave?: string;
    top?: string;
    left?: string;
  };
  overlay?: {
    enter?: string;
    leave?: string;
    backgroundColor?: string;
  };
  size?: {
    height?: string;
    maxHeight?: string;
    width?: string;
    maxWidth?: string;
    padding?: string;
  };
  actions?: {
    escape?: boolean;
    click?: boolean;
  };
  data?: Record<string, unknown>;
}

export const ModalDefaultOptions: Options = {
  modal: {
    enter: 'enter-scale-down .4s ease-out',
  },
  overlay: {
    leave: 'fade-out 0.3s',
  },
  size: {
    width: '400px',
    height: 'auto',
    maxWidth: '600px',
  },
};
export interface SubjectModal {
  subject: Subject<unknown>;
  contentCpRef: ComponentRef<any>;
}
