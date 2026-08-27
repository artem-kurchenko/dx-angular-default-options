import { BaseNestedOption, NestedOptionHost } from 'devextreme-angular/core';

/**
 * Makes projected `dxo-*` configuration components usable inside a wrapper.
 *
 * THE PROBLEM
 *
 * A wrapper renders `<dx-data-grid><ng-content></ng-content></dx-data-grid>`, and
 * the consumer projects `<dxo-data-grid-filter-row>` into it. Projected nodes
 * belong to the CONSUMER's view, so they are constructed during the consumer's
 * creation pass - before the wrapper's own view exists, and therefore before the
 * inner `<dx-data-grid>` exists.
 *
 * Each nested option's constructor calls `NestedOptionHost.setNestedOption(this)`,
 * which forwards `this._host` immediately and subscribes to its
 * `optionChangedHandlers`. With no host yet, that throws:
 *
 *     TypeError: Cannot read properties of undefined (reading 'subscribe')
 *
 * THE FIX
 *
 * Nothing requires the forwarding to be immediate. This host queues nested options
 * that arrive early and replays them once the real host is known. The ordering
 * then works out on its own:
 *
 *   1. consumer creation pass - projected options constructed, queued here
 *   2. wrapper's view created - the inner component now exists
 *   3. consumer update pass   - projected options' inputs land in their own
 *                               `_initialOptions`, since they are not linked yet
 *   4. wrapper's ngOnInit     - flush; each option assigns itself onto the inner
 *                               component, which buffers it in turn
 *   5. inner component's ngOnInit - the widget is built with the complete option set
 *
 * So the configuration is applied at creation, before the first render.
 *
 * NOTE: this covers `dxo-*` only. Collection items (`dxi-column`, `dxi-item`, ...)
 * are gathered by the inner component's own `@ContentChildren` query, which matches
 * by declaration view and therefore never sees projected nodes. See
 * `dx-grid-card.component.ts` for how collections are handled instead.
 */
export class DeferredNestedOptionHost extends NestedOptionHost {
  private readonly pending: BaseNestedOption[] = [];

  private hostReady = false;

  override setNestedOption(nestedOption: BaseNestedOption): void {
    if (!this.hostReady) {
      this.pending.push(nestedOption);
      return;
    }

    super.setNestedOption(nestedOption);
  }

  override setHost(
    host: Parameters<NestedOptionHost['setHost']>[0],
    optionPath?: Parameters<NestedOptionHost['setHost']>[1],
  ): void {
    super.setHost(host, optionPath);
    this.hostReady = true;

    let next = this.pending.shift();
    while (next) {
      super.setNestedOption(next);
      next = this.pending.shift();
    }
  }
}
