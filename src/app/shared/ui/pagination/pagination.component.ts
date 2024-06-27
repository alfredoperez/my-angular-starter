import { NgClass, NgForOf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';

@Component({
  selector: 'ui-pagination',
  standalone: true,
  template: `
    <div
      class="flex items-center justify-between border-t border-gray-200 py-3 "
    >
      <div class="flex flex-1 justify-between sm:hidden">
        <button class="btn btn-secondary btn-sm" (click)="goToPreviousPage()">
          Previous
        </button>
        <button
          class="btn btn-secondary btn-sm"
          (click)="goToNextPage()"
          href="#"
        >
          Next
        </button>
      </div>
      <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p class="hidden text-sm xl:block ">
            Showing <span class=" font-bold">{{ firstPageItem() }}</span> to
            <span class="font-bold">{{ lastPageItem() }}</span>
            of <span class="font-bold">{{ totalItems() }}</span> results
          </p>
        </div>
        <div class="join">
          <button
            class="btn btn-secondary  join-item btn-sm"
            (click)="goToPreviousPage()"
          >
            «
          </button>
          @for (page of visiblePages(); track page) {
            <button
              class="btn btn-secondary join-item btn-sm"
              [ngClass]="{ 'btn-active': currentPage() === page }"
              (click)="goToPage(page)"
            >
              {{ page }}
            </button>
          }
          <button
            class="btn btn-secondary join-item btn-sm "
            (click)="goToNextPage()"
          >
            »
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgForOf, NgClass],
})
export class PaginationComponent {
  itemsPerPage = model(10);
  currentPage = model(1);
  totalItems = input.required<number>();

  numberOfPages = computed(() => {
    return Math.ceil(this.totalItems() / this.itemsPerPage());
  });

  visiblePages = computed(() => {
    return Array.from({ length: this.numberOfPages() }, (_, i) => i + 1);
  });

  firstPageItem = computed(() => {
    return (this.currentPage() - 1) * this.itemsPerPage() + 1;
  });

  lastPageItem = computed(() => {
    return Math.min(
      this.currentPage() * this.itemsPerPage(),
      this.totalItems(),
    );
  });

  // Dummy methods for navigation
  goToPreviousPage() {
    const currentPage = this.currentPage();
    if (currentPage > 1) {
      this.goToPage(currentPage - 1);
    }
  }

  goToNextPage() {
    const totalPages = Math.ceil(this.totalItems() / this.itemsPerPage());
    const currentPage = this.currentPage();
    if (currentPage < totalPages) {
      this.goToPage(currentPage + 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }
}
