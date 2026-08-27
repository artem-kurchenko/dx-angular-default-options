import { ChangeDetectionStrategy, Component, Host, Input, OnInit, ViewChild } from '@angular/core';
import { DxDateBoxComponent, DxDateBoxModule } from 'devextreme-angular/ui/date-box';
import { DxTemplateHost, NestedOptionHost } from 'devextreme-angular/core';
import { DeferredNestedOptionHost } from './deferred-nested-option-host';

/**
 * The same wrapper pattern applied to a simple editor: a labelled date field.
 * The house style comes from `defaultOptions` (see ./house-style.ts), so this
 * component contains no DevExtreme internals at all.
 *
 * Consumers customise it two ways - plain `@Input()`s for the wrapper's own
 * concerns (label, value), and projected `dxo-*` components for the DateBox's
 * nested configuration, for example:
 *
 *     <app-dx-date-field label="Delivery date">
 *       <dxo-date-box-calendar-options [firstDayOfWeek]="1"></dxo-date-box-calendar-options>
 *     </app-dx-date-field>
 */
@Component({
  selector: 'app-dx-date-field',
  imports: [DxDateBoxModule],
  changeDetection: ChangeDetectionStrategy.Eager,
  template: `
    <label class="field">
      <span class="field__label">{{ label }}</span>
      <dx-date-box #box [value]="value" (valueChange)="value = $event">
        <ng-content></ng-content>
      </dx-date-box>
    </label>
  `,
  styles: `
    .field { display: block; max-width: 320px; }

    .field__label {
      display: block;
      margin-bottom: 4px;
      font-size: 12px;
      font-weight: 600;
      color: #444;
    }
  `,
  providers: [
    { provide: NestedOptionHost, useClass: DeferredNestedOptionHost },
    DxTemplateHost,
  ],
})
export class DxDateFieldComponent implements OnInit {
  @Input() label = '';

  /** DateBox emits string | number | Date, so the field accepts the same. */
  @Input() value: Date | string | number | null = null;

  @ViewChild('box', { static: true }) box!: DxDateBoxComponent;

  constructor(
    @Host() private readonly optionHost: NestedOptionHost,
    @Host() private readonly templateHost: DxTemplateHost,
  ) {}

  ngOnInit(): void {
    this.optionHost.setHost(this.box);
    this.templateHost.setHost(this.box);
  }
}
