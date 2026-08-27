# Angular-level ways to share DevExtreme configuration

Two working approaches to giving every DevExtreme component a shared "house style" **without
importing widget classes at application startup**, so `devextreme/ui/*` stays out of the initial
bundle and lazy-loaded features keep their code in their own chunks.

```bash
npm install
npm start          # http://localhost:4200
npm run build
```

`npm start` and `npm run build` both run `devextreme-license` first, which generates
`src/devextreme-license.ts` from your registered DevExtreme licence. That file is deliberately not in
source control; without a licence you will see the usual trial banner, and everything still runs.

Both pages are lazy-loaded. In a production build the initial JavaScript is around **250 kB**, and it
contains no DevExtreme widget runtime at all — every widget lands in the page chunks.

## Which approach is which

| | Page **Directive** | Page **Projection** |
| --- | --- | --- |
| Where the style comes from | a directive matching `dx-*` elements | `defaultOptions`, in a lazily imported module |
| Consumer writes | ordinary DevExtreme markup | `<app-dx-grid-card>`, `<app-dx-date-field>` |
| Customisation | template bindings | projected `dxo-*` + `@Input()`s |
| Uses DevExtreme internals | yes, one field | **no** |
| Best when | you want existing markup styled with no rewrite | you want a genuinely reusable building block |

They are not mutually exclusive — the directive can style loose components while wrappers cover
repeated compositions.

## Page 1 — Directive

[`directive/dx-shared-defaults.directive.ts`](src/app/directive/dx-shared-defaults.directive.ts)

```ts
imports: [DxDataGridModule, DxDateBoxModule, DxSharedDefaultsDirective],
```

That is the whole integration. Every `dx-data-grid` and `dx-date-box` in the template picks up the
shared configuration, and template bindings still override it:

```
DateBox, nothing set          -> displayFormat "yyyy-MM-dd", stylingMode "filled"
DateBox, displayFormat set    -> "MM/dd/yyyy" wins, stylingMode still "filled"
DataGrid, showBorders="false" -> false wins, search panel / filter row / paging from the house style
```

It works because a `devextreme-angular` component registers itself with its element-level
`NestedOptionHost` inside its own constructor, while the widget is not built until `ngOnInit`.
A directive constructed in between can write the widget's initial `defaultOptionsRules`, which
DevExtreme applies as real defaults:

```
widget's own defaults  <  these rules  <  your template bindings
```

## Page 2 — Projection

[`projection/dx-grid-card.component.ts`](src/app/projection/dx-grid-card.component.ts),
[`projection/dx-date-field.component.ts`](src/app/projection/dx-date-field.component.ts),
[`projection/house-style.ts`](src/app/projection/house-style.ts)

The house style here comes from the **public** `defaultOptions` API, kept in its own side-effect
module that only the lazy page imports — so the widget classes stay out of the startup bundle while
the defaults remain fully supported. The wrappers themselves contain no DevExtreme internals; they
only wire up projection support through the publicly typed `NestedOptionHost`.

```html
<app-dx-grid-card
  title="Recent orders"
  [dataSource]="orders"
  [columns]="columns"
  [alternateRows]="false">
  <dxo-data-grid-search-panel [visible]="true" [width]="400" placeholder="Find an order...">
  </dxo-data-grid-search-panel>
</app-dx-grid-card>
```

The projected search panel overrides only the keys it sets — `filterRow.applyFilter` still comes from
the house style, because DevExtreme merges a default rule with a partial override. `alternateRows` is
an ordinary `@Input()` that the card binds straight through to the grid.

### Decide per option path who owns it

Simple scalar options are safe to bind on the inner component. `rowAlternationEnabled` has no
`dxo-*` counterpart, so nothing a consumer projects can target it — bind it, expose it as an
`@Input()`, done.

Option paths that **do** have a nested configuration component (`filterRow`, `searchPanel`, `paging`,
`editing`, …) are the ones to be careful with, and there are two measured ways to get them wrong:

| What the wrapper does | What the consumer projects | Result |
| --- | --- | --- |
| binds `[searchPanel]="…"` | `<dxo-data-grid-search-panel>` | **the binding wins**, the projection is silently discarded |
| declares `<dxo-data-grid-filter-row>` in its own template | `<dxo-data-grid-filter-row>` | **neither wins** — the grid falls back to the `defaultOptions` house style and discards both |
| nothing (leaves the path to the house style) | `<dxo-data-grid-search-panel>` | the projection wins, merged over the defaults |

So pick an owner for each path. Either the *wrapper* owns it — declare the `dxo-*` inside the wrapper
and don't document it as customisable — or the *consumer* owns it, in which case leave it to
`defaultOptions` and let projection override it. A wrapper-declared `dxo-*` works perfectly well on
its own; it only misbehaves when a consumer projects the same path.

This is also why the house style lives in `defaultOptions` rather than in bindings inside the
wrapper: defaults sit underneath everything and merge, so every path stays open to projection.

Projecting `dxo-*` into a wrapper normally throws
`TypeError: Cannot read properties of undefined (reading 'subscribe')`, because projected nodes are
constructed during the *consumer's* creation pass, before the wrapper's inner component exists.
[`DeferredNestedOptionHost`](src/app/projection/deferred-nested-option-host.ts) fixes it by queueing
nested options until the host is known and replaying them — about fifteen lines.

### Why columns come in as data and are rendered by the wrapper

Collection items (`dxi-column`, `dxi-item`, …) do **not** travel through `NestedOptionHost`. The inner
component gathers them with its own content query, and Angular queries match by *declaration* view:
a column written by the consumer inside `<app-dx-grid-card>` is a content child of the card, never of
the grid inside it, and `<ng-content>` does not change that.

Forwarding such columns by hand makes things worse. The forwarding itself succeeds, then the inner
component's own query resolves empty and overwrites it — leaving a grid with **zero** columns and no
error to explain it.

So the card takes columns as data and renders real configuration components in its own template:

```html
<dx-data-grid #grid [dataSource]="dataSource">
  @for (column of columns; track $index) {
    <dxi-data-grid-column
      [dataField]="column.dataField"
      [caption]="column.caption"
      [dataType]="column.dataType"
      [format]="column.format">
    </dxi-data-grid-column>
  }
  <ng-content></ng-content>
</dx-data-grid>
```

Declared there, the columns are content children of `<dx-data-grid>` and its query finds them
normally — no internal plumbing, and they behave exactly as hand-written markup would. Columns
without an explicit `caption` still get one generated (`orderDate` renders as "Order Date"). Bind
whichever column properties your applications need.

## Before you explore either

- **The directive touches one internal field.** `_initialOptions` / `defaultOptionsRules` are not part
  of DevExtreme's public typings or compatibility guarantees. Cover it with a test that runs on every
  DevExtreme upgrade. The Projection page has no such dependency.
- **The directive only reaches components you write in a template.** Editors that a DataGrid creates
  for itself — filter row, cell editing, the edit form — are built by DevExtreme directly, are never
  Angular elements, and no directive can reach them. The Projection page does not have this problem,
  because `defaultOptions` is class-level and applies to those editors too.
- **The directive applies per template.** A component only gets it if it lists it in `imports`, and a
  forgotten import fails silently.
- **`defaultOptions` is global and permanent.** Once the Projection page's chunk has loaded, those
  defaults apply to every DataGrid and DateBox created afterwards in the session — but not to
  instances that already exist. Import the defaults from every entry point that renders the widget,
  eager shell included, so the application cannot look different before and after a navigation.
- **Use the named configuration components** (`dxo-data-grid-search-panel`), not the legacy unprefixed
  ones (`dxo-search-panel`), which log warning W3001.

## Choosing between them

**Start with `defaultOptions` split per widget**, as the Projection page does. It is public API, it
reaches editors that components build internally, and putting each registration in its own
side-effect module keeps widget code out of the startup bundle. Scale it up by giving the shared
library one module per widget and importing only what a feature renders:

```ts
// shared-config/defaults/data-grid.ts
import DataGrid from 'devextreme/ui/data_grid';
import { dataGridDefaults } from '../rules/data-grid';

DataGrid.defaultOptions({ device: () => true, options: dataGridDefaults });
```

**Add wrappers** where several screens repeat the same composition — they give you a named building
block, and projected `dxo-*` keeps per-usage customisation declarative.

**Reach for the directive** only when you specifically want configuration scoped to a template rather
than to the whole application, and you accept the dependency on an internal field. It is the only one
of the three that leaves no global state behind.
