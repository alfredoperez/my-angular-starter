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

        <!--        <div>-->
        <!--          <nav-->
        <!--            aria-label="Pagination"-->
        <!--            class="isolate inline-flex -space-x-px rounded-md shadow-sm"-->
        <!--          >-->
        <!--            <a-->
        <!--              class="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"-->
        <!--              (click)="goToPreviousPage()"-->
        <!--            >-->
        <!--              <span class="sr-only">Previous</span>-->
        <!--              <svg-->
        <!--                aria-hidden="true"-->
        <!--                class="h-5 w-5"-->
        <!--                fill="currentColor"-->
        <!--                viewBox="0 0 20 20"-->
        <!--              >-->
        <!--                <path-->
        <!--                  fill-rule="evenodd"-->
        <!--                  d="M12.293 14.707a1 1 0 001.414-1.414L8.414 8l5.293-5.293a1 1 0 00-1.414-1.414l-6 6a1 1 0 000 1.414l6 6z"-->
        <!--                  clip-rule="evenodd"-->
        <!--                />-->
        <!--              </svg>-->
        <!--            </a>-->
        <!--            &lt;!&ndash; Pagination numbers &ndash;&gt;-->
        <!--            <a-->
        <!--              *ngFor="let page of visiblePages()"-->
        <!--              [class]="-->
        <!--                currentPage() === page-->
        <!--                  ? 'relative z-10 inline-flex items-center bg-primary px-4 py-2 text-sm font-semibold  focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary'-->
        <!--                  : 'relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'-->
        <!--              "-->
        <!--              (click)="goToPage(page)"-->
        <!--            >-->
        <!--              {{ page }}-->
        <!--            </a>-->
        <!--            <a-->
        <!--              class="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"-->
        <!--              (click)="goToNextPage()"-->
        <!--            >-->
        <!--              <span class="sr-only">Next</span>-->
        <!--              <svg-->
        <!--                aria-hidden="true"-->
        <!--                class="h-5 w-5"-->
        <!--                fill="currentColor"-->
        <!--                viewBox="0 0 20 20"-->
        <!--              >-->
        <!--                <path-->
        <!--                  fill-rule="evenodd"-->
        <!--                  d="M7.707 14.707a1 1 0 01-1.414-1.414L11.586 8 6.293 2.707a1 1 0 011.414-1.414l6 6a1 1 0 010 1.414l-6 6z"-->
        <!--                  clip-rule="evenodd"-->
        <!--                />-->
        <!--              </svg>-->
        <!--            </a>-->
        <!--          </nav>-->
        <!--        </div>-->
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgForOf, NgClass],
})
export class PaginationComponent {
  currentPage = model(1);
  itemsPerPage = model(10);
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
      this.currentPage.set(currentPage - 1);
    }
  }

  goToNextPage() {
    const totalPages = Math.ceil(this.totalItems() / this.itemsPerPage());
    if (this.currentPage() < totalPages) {
      this.currentPage.update((value) => value + 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }
}
