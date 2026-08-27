import { Directive, ElementRef, inject } from '@angular/core';
import { NestedOptionHost } from 'devextreme-angular/core';
import { dataGridDefaults, dateBoxDefaults } from '../shared/dx-rules';

/**
 * Applies the shared configuration to every DevExtreme component it matches,
 * as real defaults, without importing a single `devextreme/ui/*` module.
 *
 * HOW IT WORKS
 *
 * 1. Every devextreme-angular component provides `NestedOptionHost` at element
 *    level and registers itself with it inside its own constructor.
 * 2. Angular constructs the component before the directives on the same element,
 *    so `getHost()` already returns the component here.
 * 3. The component buffers configuration in `_initialOptions` and only builds the
 *    widget in `ngOnInit`, which runs after every directive constructor.
 * 4. DevExtreme applies `defaultOptionsRules` before the options passed to the
 *    constructor, so the result has true defaults precedence:
 *
 *        widget's own defaults  <  these rules  <  your template bindings
 *
 * WHAT TO KNOW BEFORE USING IT
 *
 * - `_initialOptions` and `defaultOptionsRules` are internal to DevExtreme and are
 *   not covered by the public typings or compatibility guarantees. Pin the
 *   behaviour with a test that runs on every DevExtreme upgrade.
 * - It only reaches components written in a template. Editors that a DataGrid
 *   builds for itself (filter row, cell editing) are created by DevExtreme
 *   directly, are never Angular elements, and cannot be matched by any directive.
 *   Use `Widget.defaultOptions(...)` if you need to reach those.
 * - Matching is per template: a component only gets this directive if it lists it
 *   in `imports`. A forgotten import fails silently.
 */
const RULES_BY_TAG: Record<string, object> = {
  'DX-DATA-GRID': dataGridDefaults,
  'DX-DATE-BOX': dateBoxDefaults,
};

interface DxComponentInternals {
  _initialOptions?: Record<string, unknown>;
}

@Directive({ selector: 'dx-data-grid, dx-date-box' })
export class DxSharedDefaultsDirective {
  constructor() {
    const tagName = (inject(ElementRef).nativeElement as HTMLElement).tagName;
    const options = RULES_BY_TAG[tagName];
    if (!options) {
      return;
    }

    const host = inject(NestedOptionHost).getHost() as unknown as DxComponentInternals | undefined;
    if (!host?._initialOptions) {
      return;
    }

    host._initialOptions['defaultOptionsRules'] = [{ device: (): boolean => true, options }];
  }
}
