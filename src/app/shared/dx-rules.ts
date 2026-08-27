/**
 * The house style, as plain data.
 *
 * This is the file a shared configuration library would export. Note that the
 * DevExtreme imports are `import type` - the compiler erases them, so this module
 * is fully typed but contributes nothing to any bundle and never pulls widget
 * runtime code into the chunk that imports it.
 */
import type { Properties as DataGridProperties } from 'devextreme/ui/data_grid';
import type { Properties as DateBoxProperties } from 'devextreme/ui/date_box';

export const dataGridDefaults: DataGridProperties = {
  showBorders: true,
  rowAlternationEnabled: true,
  columnAutoWidth: true,
  hoverStateEnabled: true,
  filterRow: { visible: true, applyFilter: 'auto' },
  headerFilter: { visible: true },
  searchPanel: { visible: true, width: 240 },
  paging: { pageSize: 5 },
  pager: { showPageSizeSelector: true, allowedPageSizes: [5, 10, 20], showInfo: true },
};

export const dateBoxDefaults: DateBoxProperties = {
  displayFormat: 'yyyy-MM-dd',
  useMaskBehavior: true,
  showClearButton: true,
  stylingMode: 'filled',
};
