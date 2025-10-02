import {
  RowClickedEvent,
  SortChangedEvent,
  FilterChangedEvent,
  SelectionChangedEvent
} from 'ag-grid-community';

export interface TableRowClickEvent<T = any> {
  data: T;
  rowIndex: number | null;
  event: RowClickedEvent<T>;
}

export interface TableSortEvent {
  columns: Array<{
    colId: string;
    sort: 'asc' | 'desc' | null | undefined;
  }>;
  event: SortChangedEvent;
}

export interface TableFilterEvent {
  filters: Record<string, any>;
  event: FilterChangedEvent;
}

export interface TableSelectionEvent<T = any> {
  selectedRows: T[];
  event: SelectionChangedEvent<T>;
}