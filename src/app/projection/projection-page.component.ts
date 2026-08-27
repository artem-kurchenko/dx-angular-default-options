import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { DxoDataGridSearchPanelComponent } from 'devextreme-angular/ui/data-grid/nested';
import { DxoDateBoxCalendarOptionsComponent } from 'devextreme-angular/ui/date-box/nested';
import type { Column } from 'devextreme/ui/data_grid';
import './house-style';
import { DxDateFieldComponent } from './dx-date-field.component';
import { DxGridCardComponent } from './dx-grid-card.component';
import { Order, orders } from '../shared/sample-data';

/**
 * Approach 2 - reusable wrapper components that accept projected `dxo-*`
 * configuration alongside ordinary `@Input()`s.
 *
 * Note which customisations go through which channel: nested configuration is
 * projected, collections (columns) are passed as data. See dx-grid-card.component.ts
 * for why that split is necessary rather than stylistic.
 */
@Component({
  selector: 'app-projection-page',
  imports: [
    DxGridCardComponent,
    DxDateFieldComponent,
    DxoDataGridSearchPanelComponent,
    DxoDateBoxCalendarOptionsComponent,
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './projection-page.component.html',
  styleUrl: './projection-page.component.scss',
})
export class ProjectionPageComponent implements AfterViewInit {
  @ViewChild('plainCard') plainCard!: DxGridCardComponent;

  @ViewChild('customisedCard') customisedCard!: DxGridCardComponent;

  @ViewChild('plainField') plainField!: DxDateFieldComponent;

  @ViewChild('customisedField') customisedField!: DxDateFieldComponent;

  orders: Order[] = orders;

  today = new Date();

  columns: Column[] = [
    { dataField: 'orderNumber', caption: 'Order #' },
    { dataField: 'customerName', caption: 'Customer' },
    { dataField: 'orderDate', dataType: 'date' },
    { dataField: 'totalAmount', format: 'currency' },
  ];

  resolved = '';

  ngAfterViewInit(): void {
    this.resolved = JSON.stringify(
      {
        'Card with nothing projected': {
          columnCount: this.plainCard.grid.instance.columnCount(),
          captions: [0, 1, 2, 3].map((i) => this.plainCard.grid.instance.columnOption(i, 'caption')),
          'searchPanel.visible': this.plainCard.grid.instance.option('searchPanel.visible'),
          'filterRow.applyFilter': this.plainCard.grid.instance.option('filterRow.applyFilter'),
          rowAlternationEnabled: this.plainCard.grid.instance.option('rowAlternationEnabled'),
        },
        'Card with a projected dxo-data-grid-search-panel': {
          'searchPanel.visible': this.customisedCard.grid.instance.option('searchPanel.visible'),
          'searchPanel.placeholder': this.customisedCard.grid.instance.option('searchPanel.placeholder'),
          'filterRow.visible': this.customisedCard.grid.instance.option('filterRow.visible'),
          'filterRow.applyFilter (still from the house style)':
            this.customisedCard.grid.instance.option('filterRow.applyFilter'),
          'rowAlternationEnabled (simple @Input, overrides the house style)':
            this.customisedCard.grid.instance.option('rowAlternationEnabled'),
        },
        'Date field with nothing projected': {
          displayFormat: this.plainField.box.instance.option('displayFormat'),
          stylingMode: this.plainField.box.instance.option('stylingMode'),
          'calendarOptions.firstDayOfWeek': this.plainField.box.instance.option('calendarOptions.firstDayOfWeek'),
        },
        'Date field with projected dxo-date-box-calendar-options': {
          displayFormat: this.customisedField.box.instance.option('displayFormat'),
          'calendarOptions.firstDayOfWeek': this.customisedField.box.instance.option('calendarOptions.firstDayOfWeek'),
        },
      },
      null,
      2,
    );
  }
}
