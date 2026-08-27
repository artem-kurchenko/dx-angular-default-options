import DataGrid from 'devextreme/ui/data_grid';
import DateBox from 'devextreme/ui/date_box';
import { dataGridDefaults, dateBoxDefaults } from '../shared/dx-rules';

/**
 * The house style for this page, registered through the public `defaultOptions`
 * API. Importing this module is what applies it.
 *
 * WHY THIS FILE EXISTS SEPARATELY
 *
 * `defaultOptions` is the supported way to set global defaults, and it needs the
 * widget class - which is exactly what you do not want at application startup.
 * Keeping the call in its own side-effect module solves that: the module is
 * imported by the lazy page that renders these widgets, so the widget code stays
 * in that page's chunk. Nothing here is reachable from `main.ts`.
 *
 * Because these are defaults rather than bindings, anything the consumer projects
 * into a wrapper still wins - and DevExtreme merges a rule with a partial
 * override, so projecting `<dxo-data-grid-search-panel [width]="400">` changes the
 * width while leaving the rest of the house style in place.
 *
 * Two things to keep in mind about `defaultOptions` in a real application:
 *
 * - It is global and permanent. Once this chunk has loaded, these defaults apply
 *   to every DataGrid and DateBox created afterwards, anywhere in the session -
 *   but not to instances that already exist. Import the defaults from every entry
 *   point that renders the widget, including the eager shell, so the application
 *   cannot look different before and after a navigation.
 * - It reaches editors that a component creates internally - a grid's filter row
 *   and cell editors - which template-level approaches cannot.
 */
DataGrid.defaultOptions({ device: () => true, options: dataGridDefaults });
DateBox.defaultOptions({ device: () => true, options: dateBoxDefaults });
