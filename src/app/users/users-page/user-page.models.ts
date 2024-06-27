import { ColDef } from 'ag-grid-community';

function dateFormatter(params: { value: string }) {
  return new Date(params.value).toLocaleDateString();
}

export const columnDefs: Array<ColDef> = [
  { field: 'name' },
  { field: 'age' },
  { field: 'createdAt', valueFormatter: dateFormatter },
  { field: 'email' },
  { field: 'company' },
  { field: 'title' },
  { field: 'updatedAt', valueFormatter: dateFormatter },
];
