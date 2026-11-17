import { DOCUMENT } from '@angular/common';
import { Injector, afterNextRender, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

/**
 * Scrolls to the element matching the URL fragment (e.g. `#about`) once `ready()`
 * is true, i.e. after the async content above it has rendered.
 * Must be called in an injection context.
 */
export function scrollToFragmentWhenReady(ready: () => boolean = () => true): void {
  const injector = inject(Injector);
  const document = inject(DOCUMENT);
  const fragment = toSignal(inject(ActivatedRoute).fragment);

  effect(() => {
    const id = fragment();
    if (!id || !ready()) return;
    afterNextRender(
      () => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }),
      { injector },
    );
  });
}
