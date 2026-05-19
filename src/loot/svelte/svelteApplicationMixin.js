/**
 * Nimble Loot Svelte-compatible ApplicationV2 bridge.
 *
 * Nimble core uses SvelteApplicationMixin(ApplicationV2), but that mixin and the
 * Svelte runtime are bundled inside the Nimble system and are not exposed as a
 * public API. This bridge mirrors the same ApplicationV2 lifecycle shape while
 * keeping Nimble Loot self-contained. It accepts components that implement one
 * of these lightweight contracts:
 *
 *   component.mount({ target, props }) -> { update?, destroy? }
 *   component({ target, props }) -> { update?, destroy? } | HTMLElement | void
 *
 * Production Nimble Loot dialogs use this contract for component-style rendering.
 * Later, this bridge can be swapped for a true Svelte bundle if we add a Svelte
 * compiler/build step.
 */
function NimbleLootSvelteApplicationMixin(Base) {
  return class NimbleLootSvelteApplication extends Base {
    static DEFAULT_OPTIONS = foundry.utils.mergeObject(foundry.utils.deepClone(super.DEFAULT_OPTIONS ?? {}), {
      classes: ["nimble-sheet", "nimble-dialog", "nimble-loot-svelte-app"],
      window: { resizable: true },
      position: { height: "auto" },
      actions: {}
    });

    constructor(...args) {
      super(...args);
      this.$state = {};
      this._nimbleLootSvelteMount = null;
    }

    async _renderHTML(context) {
      return context;
    }

    _replaceHTML(result, content, options = {}) {
      const renderResult = result ?? {};
      const nextState = renderResult.state ?? {};
      this.$state = foundry.utils.mergeObject(this.$state ?? {}, nextState, {
        inplace: false,
        insertKeys: true,
        insertValues: true,
        overwrite: true,
        recursive: true
      });

      const props = {
        ...renderResult,
        state: this.$state,
        foundryApp: this
      };

      const shouldMount = options.isFirstRender || !this._nimbleLootSvelteMount || content.childElementCount === 0;
      if (shouldMount) {
        this._nimbleLootDestroySvelteMount();
        content.innerHTML = "";
        this._nimbleLootSvelteMount = nimbleLootMountSvelteCompatibleComponent(this.root, content, props);
        return;
      }

      if (typeof this._nimbleLootSvelteMount?.update === "function") {
        this._nimbleLootSvelteMount.update(props);
        return;
      }

      // If the component does not support update, remount cleanly.
      this._nimbleLootDestroySvelteMount();
      content.innerHTML = "";
      this._nimbleLootSvelteMount = nimbleLootMountSvelteCompatibleComponent(this.root, content, props);
    }

    _onClose(options) {
      this._nimbleLootDestroySvelteMount();
      if (typeof super._onClose === "function") super._onClose(options);
    }

    _nimbleLootDestroySvelteMount() {
      const mount = this._nimbleLootSvelteMount;
      this._nimbleLootSvelteMount = null;
      if (!mount) return;
      try {
        if (typeof mount.destroy === "function") mount.destroy();
        else if (typeof mount.$destroy === "function") mount.$destroy();
        else if (mount instanceof HTMLElement) mount.remove();
      } catch (error) {
        nimbleLootWarn("Svelte-compatible component cleanup failed.", error);
      }
    }
  };
}

function nimbleLootMountSvelteCompatibleComponent(component, target, props) {
  if (!component) {
    target.innerHTML = `<section class="nimble-loot-svelte-placeholder"><p>No component root configured.</p></section>`;
    return { destroy: () => target.replaceChildren() };
  }

  if (typeof component.mount === "function") {
    const mounted = component.mount({ target, props });
    return nimbleLootNormalizeSvelteCompatibleMount(mounted, target);
  }

  if (typeof component === "function") {
    const mounted = component({ target, props });
    return nimbleLootNormalizeSvelteCompatibleMount(mounted, target);
  }

  target.innerHTML = `<section class="nimble-loot-svelte-placeholder"><p>Unsupported component root.</p></section>`;
  return { destroy: () => target.replaceChildren() };
}

function nimbleLootNormalizeSvelteCompatibleMount(mounted, target) {
  if (mounted && typeof mounted === "object") {
    if (typeof mounted.update === "function" || typeof mounted.destroy === "function" || typeof mounted.$destroy === "function") {
      return {
        update: typeof mounted.update === "function" ? mounted.update.bind(mounted) : undefined,
        destroy: typeof mounted.destroy === "function"
          ? mounted.destroy.bind(mounted)
          : typeof mounted.$destroy === "function"
            ? mounted.$destroy.bind(mounted)
            : undefined
      };
    }

    if (mounted instanceof HTMLElement) {
      if (!mounted.parentElement) target.appendChild(mounted);
      return { destroy: () => mounted.remove() };
    }
  }

  return { destroy: () => target.replaceChildren() };
}
