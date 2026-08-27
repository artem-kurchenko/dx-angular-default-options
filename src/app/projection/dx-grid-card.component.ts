import { ChangeDetectionStrategy, Component, Host, Input, OnInit, ViewChild } from '@angular/core';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxiDataGridColumnComponent } from 'devextreme-angular/ui/data-grid/nested';
import { DxTemplateHost, NestedOptionHost } from 'devextreme-angular/core';
import type { Column } from 'devextreme/ui/data_grid';
import { DeferredNestedOptionHost } from './deferred-nested-option-host';

/**
 * A reusable "grid card": the house style baked in, a title, and two ways for the
 * consumer to customise it.
 *
 * The house style itself is NOT applied here - it comes from `defaultOptions`, see
 * ./house-style.ts. That keeps this wrapper free of any DevExtreme internals: it
 * only wires up projection support, using the publicly typed `NestedOptionHost`.
 *
 * 1. PROJECTED `dxo-*` CONFIGURATION - write it as you would inside a real grid:
 *
 *      <app-dx-grid-card [columns]="cols">
 *        <dxo-data-grid-search-panel [visible]="false"></dxo-data-grid-search-panel>
 *      </app-dx-grid-card>
 *
 *    This works because of DeferredNestedOptionHost. Use the NAMED components
 *    (`dxo-data-grid-search-panel`), not the legacy unprefixed ones - the latter
 *    log warning W3001.
 *
 * 2. PLAIN @Input()s for the card's own concerns - title, data source, columns, and
 *    simple scalar options such as `rowAlternationEnabled`.
 *
 * DECIDE PER OPTION PATH WHO OWNS IT
 *
 * Scalar options with no `dxo-*` counterpart are safe to bind here. Option paths
 * that HAVE one are not, and there are two ways to get them wrong:
 *
 *   - Binding the path here (`[searchPanel]="..."`) silently beats anything the
 *     consumer projects: this wrapper's view is refreshed after the projected
 *     options are flushed, so the binding lands last and replaces the object.
 *   - Declaring `<dxo-data-grid-filter-row>` here AND letting a consumer project
 *     one produces neither value - measured, the grid fell back to the
 *     `defaultOptions` house style and discarded both.
 *
 * So pick an owner per path. Either the wrapper owns it - declare the `dxo-*` here
 * and do not document it as customisable - or the consumer owns it, in which case
 * leave it to the house style and let projection override it.
 *
 * WHY COLUMNS COME IN AS DATA AND ARE RENDERED HERE
 *
 * Collection items (`dxi-*`) do not travel through NestedOptionHost. The grid
 * collects them with its own content query, and Angular queries match by
 * DECLARATION view: a `<dxi-data-grid-column>` written by the consumer inside
 * `<app-dx-grid-card>` is a content child of this card, never of the inner grid,
 * and `<ng-content>` does not change that. Forwarding such columns by hand is
 * worse than leaving them alone - the grid's own query then resolves empty and
 * overwrites the forwarded list, leaving a grid with no columns and no error.
 *
 * The fix is to take columns as data and render real `<dxi-data-grid-column>`
 * components HERE, in the card's own template. They are then declared inside
 * `<dx-data-grid>`, so the grid's content query finds them normally - no internal
 * plumbing involved, and columns behave exactly as they would in hand-written
 * markup, auto-generated captions included.
 *
 * Bind whichever column properties your applications need; the list below is a
 * common starting set.
 */
@Component({
  selector: 'app-dx-grid-card',
  imports: [DxDataGridModule, DxiDataGridColumnComponent],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <div class="card">
      <h4>{{ title }}</h4>
      <dx-data-grid
        #grid
        [dataSource]="dataSource"
        [rowAlternationEnabled]="alternateRows">
        @for (column of columns; track $index) {
          <dxi-data-grid-column
            [dataField]="column.dataField"
            [caption]="column.caption"
            [dataType]="column.dataType"
            [format]="column.format"
            [width]="column.width"
            [alignment]="column.alignment">
          </dxi-data-grid-column>
        }
        <ng-content></ng-content>
      </dx-data-grid>
    </div>
  `,
  styles: `
    .card {
      border: 1px solid #dcdcdc;
      border-radius: 6px;
      padding: 16px;
      background: #fff;
    }

    h4 {
      margin: 0 0 12px;
      font-size: 14px;
      font-weight: 600;
    }
  `,
  providers: [
    { provide: NestedOptionHost, useClass: DeferredNestedOptionHost },
    DxTemplateHost,
  ],
})
export class DxGridCardComponent implements OnInit {
  @Input() title = '';

  @Input() dataSource: unknown[] = [];

  @Input() columns: Column[] = [];

  /**
   * A plain scalar option is safe to bind on the inner grid: `rowAlternationEnabled`
   * has no `dxo-*` counterpart, so nothing a consumer projects can target it and
   * there is no conflict to worry about. Option paths that DO have a nested
   * configuration component - filterRow, searchPanel, paging, editing - are the ones
   * to leave alone; see the class comment.
   */
  @Input() alternateRows = true;

  @ViewChild('grid', { static: true }) grid!: DxDataGridComponent;

  constructor(
    @Host() private readonly optionHost: NestedOptionHost,
    @Host() private readonly templateHost: DxTemplateHost,
  ) {}

  ngOnInit(): void {
    // Static ViewChild, so the inner grid already exists here - and this runs before
    // the grid's own ngOnInit creates the widget, which is what lets the queued
    // projected options arrive in time to count as initial configuration.
    this.optionHost.setHost(this.grid);
    this.templateHost.setHost(this.grid);
  }
}
