import { AfterViewInit, ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxDateBoxComponent, DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxSharedDefaultsDirective } from './dx-shared-defaults.directive';
import { Order, orders } from '../shared/sample-data';

/**
 * Approach 1 - a directive supplies the shared defaults.
 *
 * The markup below is ordinary DevExtreme markup. Adding
 * `DxSharedDefaultsDirective` to `imports` is the entire integration: every
 * dx-data-grid and dx-date-box in this template picks up the house style, and
 * anything set explicitly in the template still wins.
 */
@Component({
  selector: 'app-directive-page',
  imports: [DxDataGridModule, DxDateBoxModule, DxSharedDefaultsDirective],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './directive-page.component.html',
  styleUrl: './directive-page.component.scss',
})
export class DirectivePageComponent implements AfterViewInit {
  @ViewChild('styledBox') styledBox!: DxDateBoxComponent;

  @ViewChild('overriddenBox') overriddenBox!: DxDateBoxComponent;

  @ViewChild('grid') grid!: DxDataGridComponent;

  orders: Order[] = orders;

  today = new Date();

  resolved = '';

  ngAfterViewInit(): void {
    // Purely for the demo: show what each widget actually ended up with.
    this.resolved = JSON.stringify(
      {
        'DateBox (nothing set in template)': {
          displayFormat: this.styledBox.instance.option('displayFormat'),
          stylingMode: this.styledBox.instance.option('stylingMode'),
          showClearButton: this.styledBox.instance.option('showClearButton'),
        },
        'DateBox (displayFormat set in template)': {
          displayFormat: this.overriddenBox.instance.option('displayFormat'),
          stylingMode: this.overriddenBox.instance.option('stylingMode'),
        },
        'DataGrid (showBorders set to false in template)': {
          showBorders: this.grid.instance.option('showBorders'),
          rowAlternationEnabled: this.grid.instance.option('rowAlternationEnabled'),
          'searchPanel.visible': this.grid.instance.option('searchPanel.visible'),
          'paging.pageSize': this.grid.instance.option('paging.pageSize'),
        },
      },
      null,
      2,
    );
  }
}
