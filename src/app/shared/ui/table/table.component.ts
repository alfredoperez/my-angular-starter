import { Component, ChangeDetectionStrategy, input, output, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridOptions,
  RowClickedEvent,
  SortChangedEvent,
  FilterChangedEvent,
  SelectionChangedEvent,
  themeQuartz
} from 'ag-grid-community';
import {
  TableRowClickEvent,
  TableSortEvent,
  TableFilterEvent,
  TableSelectionEvent
} from './table.models';

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [AgGridAngular],
  template: `
    <ag-grid-angular
      [theme]="theme"
      [rowData]="rows()"
      [columnDefs]="columns()"
      [gridOptions]="gridOptions"
      (rowClicked)="onRowClicked($event)"
      (sortChanged)="onSortChanged($event)"
      (filterChanged)="onFilterChanged($event)"
      (selectionChanged)="onSelectionChanged($event)"
      style="height: 100%; width: 100%;"
    />
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent<T = any> implements OnInit {
  rows = input.required<T[]>();
  columns = input.required<ColDef[]>();

  rowClick = output<TableRowClickEvent<T>>();
  sort = output<TableSortEvent>();
  filter = output<TableFilterEvent>();
  select = output<TableSelectionEvent<T>>();

  // Customized Quartz theme with Indigo accent
  theme = themeQuartz.withParams({
    // Sizing for comfortable reading
    rowHeight: 42,
    headerHeight: 44,
    fontSize: 13,
    cellHorizontalPadding: 12,

    // Indigo accent colors
    accentColor: '#4f46e5',

    // Borders and backgrounds
    borderColor: '#e5e7eb',
    headerBackgroundColor: '#f9fafb',
    headerTextColor: '#111827',
    headerFontWeight: 600,

    // Row colors
    backgroundColor: '#ffffff',
    oddRowBackgroundColor: '#ffffff',

    // Hover states
    rowHoverColor: 'rgba(79, 70, 229, 0.05)',
    selectedRowBackgroundColor: 'rgba(79, 70, 229, 0.08)',
  });

  gridOptions: GridOptions = {
    animateRows: true,
    pagination: false,
    defaultColDef: {
      resizable: true,
      sortable: true,
      filter: true
    }
  };

  ngOnInit() {
    console.log('TableComponent initialized');
    console.log('Theme being applied:', this.theme);
    console.log('Rows:', this.rows());
    console.log('Columns:', this.columns());
    console.log('Grid Options:', this.gridOptions);

    // Debug: Check if theme params are applied
    console.log('Theme params:', (this.theme as any).params);
  }

  onRowClicked(event: RowClickedEvent<T>) {
    if (event.data) {
      this.rowClick.emit({
        data: event.data,
        rowIndex: event.rowIndex,
        event
      });
    }
  }

  onSortChanged(event: SortChangedEvent) {
    const columns = event.api.getColumnState()
      .filter(col => col.sort)
      .map(col => ({
        colId: col.colId,
        sort: col.sort
      }));

    this.sort.emit({
      columns,
      event
    });
  }

  onFilterChanged(event: FilterChangedEvent) {
    const filters: Record<string, any> = {};
    event.api.getFilterModel();

    this.filter.emit({
      filters: event.api.getFilterModel(),
      event
    });
  }

  onSelectionChanged(event: SelectionChangedEvent<T>) {
    this.select.emit({
      selectedRows: event.api.getSelectedRows(),
      event
    });
  }
}