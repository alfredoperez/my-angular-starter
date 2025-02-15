import { isPlatformBrowser } from '@angular/common';
import {
  ApplicationRef,
  ComponentRef,
  EnvironmentInjector,
  Inject,
  Injectable,
  PLATFORM_ID,
  Type,
  createComponent,
} from '@angular/core';
import { Subject } from 'rxjs';
import { ModalComponent } from './modal.component';
import { Options, SubjectModal, ModalDefaultOptions } from './modal.models';
import './modal.models';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private newModalComponent!: ComponentRef<ModalComponent>;
  private newComponent!: ComponentRef<any>;
  private modalSubject!: Subject<any>;
  /**
   * Internal use only.
   */
  options!: Options | undefined;
  /**
   * Internal use only.
   */
  modalInstances: ModalComponent[] = [];
  /**
   * Internal use only.
   */
  layerLevel = 0;
  private isBrowser = true;
  private modalSubjects: SubjectModal[] = [];

  constructor(
    private appRef: ApplicationRef,
    private injector: EnvironmentInjector,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Opens a custom component within a modal.
   * @param componentToCreate The custom component to display within the modal.
   * @param options Additional options for configuring the modal appearance and animations.
   * @returns A RxJs Subject that will emit custom data on closing the modal.
   * ```
   * this.modalService.open(ModalContentComponent, {
   *   modal: {
   *     enter: 'enter-scale-down 0.1s ease-out',
   *     leave: 'fade-out 0.5s',
   *   },
   *   overlay: {
   *     leave: 'fade-out 0.3s',
   *   },
   *   data: {
   *     type: 'Angular modal library',
   *   },
   * })
   * .subscribe((dataFromComponent) => {
   *    ...
   * });
   * ```
   */
  open<C>(componentToCreate: Type<C>, options: Options = ModalDefaultOptions) {
    this.options = options;

    this.modalSubject = new Subject();
    this.openComponent(componentToCreate, options);
    return this.modalSubject;
  }

  private openComponent<C>(componentToCreate: Type<C>, options?: Options) {
    if (!this.isBrowser) return;

    this.newComponent = createComponent(componentToCreate, {
      environmentInjector: this.injector,
    });

    this.newModalComponent = createComponent(ModalComponent, {
      environmentInjector: this.injector,
      projectableNodes: [[this.newComponent.location.nativeElement]],
    });

    this.instantiateProps(options?.data);
    this.modalSubjects.push({
      subject: this.modalSubject,
      contentCpRef: this.newComponent,
    });

    document.body.appendChild(this.newModalComponent.location.nativeElement);

    this.appRef.attachView(this.newComponent.hostView);
    this.appRef.attachView(this.newModalComponent.hostView);
  }

  private instantiateProps(data: Options['data'] = {}) {
    for (const key of Object.keys(data)) {
      this.newComponent.instance[key] = data[key];
    }
  }

  /**
   * Close the current modal.
   * @param data The optional data to emit on closing the modal (communication from modal to caller).
   */
  close(data?: unknown) {
    this.modalInstances.pop()?.close();

    if (this.modalSubjects.length === 0) return;

    const modalSubject = this.modalSubjects.pop() as SubjectModal;
    modalSubject.contentCpRef.destroy();
    modalSubject.subject.next(data);
    modalSubject.subject.complete();
  }

  /**
   * Close all modal instances.
   * Respective animations will be applied.
   */
  closeAll() {
    for (let i = this.modalInstances.length - 1; i > -1; i--) {
      this.close();
    }
  }
}
