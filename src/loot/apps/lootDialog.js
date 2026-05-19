const NimbleLootApplicationBase = foundry.applications?.api?.ApplicationV2;

function nimbleLootPlayerEsc(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function nimbleLootPlayerAttr(value) {
  return nimbleLootPlayerEsc(value).replace(/"/g, "&quot;");
}

async function nimbleLootDialogV2Confirm({ title, content, yesLabel = "Yes", noLabel = "No" } = {}) {
  const DialogV2 = foundry.applications?.api?.DialogV2;
  if (DialogV2) {
    return DialogV2.confirm({
      window: { title },
      content,
      yes: { label: yesLabel },
      no: { label: noLabel },
      modal: true,
      rejectClose: false
    });
  }
  return Dialog.confirm({ title, content, yes: () => true, no: () => false, defaultYes: false });
}

function nimbleLootReadDialogElementValue(button, name, fallback = "") {
  return button?.form?.elements?.[name]?.value ?? button?.form?.querySelector?.(`[name="${name}"]`)?.value ?? fallback;
}

function NimbleLootSveltePlayerComponent({ target, props }) {
  const root = document.createElement("section");
  root.className = "nimble-loot-svelte-player-root";
  target.appendChild(root);

  const render = (nextProps = props) => {
    props = nextProps;
    root.innerHTML = nimbleLootRenderPlayerDialogHtml(props ?? {});
  };

  render(props);

  return {
    update: render,
    destroy: () => root.remove()
  };
}

function nimbleLootRenderPlayerDialogHtml(context) {
  const description = context.description ? `<section class="nimble-loot-description">${nimbleLootPlayerEsc(context.description)}</section>` : "";
  const closed = context.isSealedMode ? nimbleLootRenderClosedPlayerDialog(context) : "";
  const open = context.isOpenMode ? nimbleLootRenderOpenPlayerDialog(context) : "";
  const undiscovered = "";
  const depleted = context.isDepletedMode ? `<section class="nimble-loot-empty"><i class="fas fa-box-open"></i><p>This has already been picked clean.</p></section>` : "";

  return `
    <form class="nimble-loot-panel nimble-loot-player-panel nimble-loot-svelte-player-panel">
      ${description}
      ${undiscovered}
      ${depleted}
      ${closed}
      ${open}
      <footer class="nimble-loot-footer nimble-loot-footer--right">
        <button type="button" data-action="close">Close</button>
      </footer>
    </form>
  `;
}

function nimbleLootRenderClosedPlayerDialog(context) {
  const inspectButton = context.canInspect ? `<button type="button" data-action="inspect"><i class="fas fa-search"></i> Inspect</button>` : "";
  const carefulOpenButton = context.canCarefullyOpen ? `<button type="button" data-action="carefulOpen"><i class="fas fa-hand-sparkles"></i> Carefully Open</button>` : "";
  const openingAttempts = context.showOpeningAttempts ? nimbleLootRenderOpeningAttempts(context) : "";
  return `
    <section class="nimble-loot-section nimble-loot-interaction-section">
      <div class="nimble-loot-section-title">Inspections</div>
      <div class="nimble-loot-interaction-controls">
        ${inspectButton}
        ${carefulOpenButton}
        <label class="nimble-loot-bonus-field">Bonus
          <input type="number" name="inspectBonus" value="0" step="1">
        </label>
      </div>
      ${nimbleLootRenderStatusLog(context.inspectionLogLines, "No inspection attempts yet.")}
    </section>
    ${openingAttempts}
  `;
}

function nimbleLootRenderOpeningAttempts(context) {
  const buttons = [];
  if (context.canPick) buttons.push(`<button type="button" data-action="pick"><i class="fas fa-key"></i> Pick Lock</button>`);
  if (context.canForce) buttons.push(`<button type="button" data-action="force"><i class="fas fa-hammer"></i> Force Open</button>`);
  if (context.canDisarm) {
    for (const trap of context.detectedTrapTypes ?? []) {
      buttons.push(`<button type="button" data-action="disarm" data-trap-type="${nimbleLootPlayerAttr(trap.type)}"><i class="fas fa-screwdriver-wrench"></i> Disarm ${nimbleLootPlayerEsc(trap.label)}</button>`);
    }
  }

  const keyCode = context.canUseKeyCode ? `
    <label class="nimble-loot-keycode-field">Key / Code
      <input type="text" name="keyCodeEntry" autocomplete="off">
    </label>
    <button type="button" data-action="useKeyCode"><i class="fas fa-unlock-keyhole"></i> Use Key / Code</button>
  ` : "";

  return `
    <section class="nimble-loot-section nimble-loot-interaction-section">
      <div class="nimble-loot-section-title">Opening Attempts</div>
      <div class="nimble-loot-interaction-controls">
        ${buttons.join("")}
        <label class="nimble-loot-bonus-field">Bonus
          <input type="number" name="attemptBonus" value="0" step="1">
        </label>
        ${keyCode}
      </div>
      ${nimbleLootRenderStatusLog(context.openingLogLines, "No opening attempts yet.")}
    </section>
  `;
}

function nimbleLootRenderStatusLog(lines, emptyText) {
  const safeLines = Array.isArray(lines) ? lines : [];
  if (!safeLines.length) return `<div class="nimble-loot-status-log"><div class="nimble-loot-status-line nimble-loot-status-line--empty">${nimbleLootPlayerEsc(emptyText)}</div></div>`;
  return `<div class="nimble-loot-status-log">${safeLines.map((entry) => `<div class="nimble-loot-status-line">${nimbleLootPlayerEsc(entry.line ?? entry)}</div>`).join("")}</div>`;
}

function nimbleLootRenderOpenPlayerDialog(context) {
  return `
    ${nimbleLootRenderCurrencySection(context)}
    ${nimbleLootRenderItemsSection(context)}
    ${context.canTake ? `<footer class="nimble-loot-footer"><button type="button" class="nimble-loot-primary nimble-loot-take-all-visible" data-action="takeAll"><img src="icons/svg/item-bag.svg" alt="" aria-hidden="true"> Take All Visible Loot</button></footer>` : ""}
  `;
}

function nimbleLootRenderCurrencySection(context) {
  const pills = (context.currencyPills ?? []).map((pill) => {
    const keyClass = `nimble-loot-currency-pill--${nimbleLootPlayerAttr(pill.key ?? String(pill.label ?? "").toLowerCase())}`;
    return `<span class="nimble-loot-currency-pill ${keyClass} ${pill.hasValue ? "" : "nimble-loot-currency-pill--empty"}"><i class="fas fa-coins"></i> <span>${Number(pill.value ?? 0)} ${nimbleLootPlayerEsc(pill.label)}</span></span>`;
  }).join("");
  const currency = context.currency ?? { gp: 0, sp: 0, cp: 0 };
  const actionButtons = [];
  if (context.hasCurrency) {
    actionButtons.push(`<button type="button" data-action="takeCurrency" data-gp="${Number(currency.gp ?? 0)}" data-sp="${Number(currency.sp ?? 0)}" data-cp="${Number(currency.cp ?? 0)}">Take All Currency</button>`);
    actionButtons.push(`<button type="button" data-action="splitCurrency"><i class="fas fa-people-arrows"></i> Split Evenly</button>`);
    actionButtons.push(`<button type="button" data-action="takeCurrencyPortion">Take Portion</button>`);
  }
  if (context.canLeaveCurrency) actionButtons.push(`<button type="button" data-action="leaveCurrencyPortion">Leave Portion</button>`);
  const currencyActions = actionButtons.length ? `<div class="nimble-loot-currency-actions">${actionButtons.join("")}</div>` : "";

  return `
    <section class="nimble-loot-section">
      <div class="nimble-loot-section-title">Currency</div>
      <div class="nimble-loot-currency-pills">${pills}</div>
      ${currencyActions}
    </section>
  `;
}

function nimbleLootRenderItemsSection(context) {
  const body = context.hasItems
    ? `<div class="nimble-loot-items-scroll">${context.displayAsGrid ? nimbleLootRenderGridItems(context) : nimbleLootRenderListItems(context)}</div>`
    : `<p class="nimble-loot-muted">No items visible.</p>`;

  return `
    <section class="nimble-loot-section nimble-loot-open-items-section" data-drop-zone="player-items">
      <div class="nimble-loot-section-title nimble-loot-section-title-row">
        <span>Items</span>
        <button type="button" data-action="addFromInventory"><i class="fas fa-plus"></i> Add From Inventory</button>
      </div>
      <p class="nimble-loot-drop-hint"><i class="fas fa-arrow-down"></i> Drag your own Nimble object items here, or use Add From Inventory to leave items without opening your sheet.</p>
      ${body}
    </section>
  `;
}

function nimbleLootRenderGridItems(context) {
  const slots = (context.gridSlots ?? []).map((slot) => {
    if (!slot.item) return `<article class="nimble-loot-grid-slot" data-grid-slot="${Number(slot.index ?? 0)}"><div class="nimble-loot-empty-slot" title="Drop an item here">+</div></article>`;
    const item = slot.item;
    return `
      <article class="nimble-loot-grid-slot" data-grid-slot="${Number(slot.index ?? 0)}">
        <button type="button" class="nimble-loot-item-tile nimble-loot-grid-take-tile" title="${nimbleLootPlayerAttr(item.name)}" data-action="takeGridItem" data-item-id="${nimbleLootPlayerAttr(item.id)}" data-loot-drag-item-id="${nimbleLootPlayerAttr(item.id)}">
          <img src="${nimbleLootPlayerAttr(item.img)}" alt="${nimbleLootPlayerAttr(item.name)}">
          <span class="nimble-loot-item-qty">${Number(item.quantity ?? 1)}</span>
        </button>
      </article>
    `;
  }).join("");
  return `<div class="nimble-loot-item-grid nimble-loot-static-grid" style="${nimbleLootPlayerAttr(context.gridStyle ?? "")}">${slots}</div>`;
}

function nimbleLootRenderListItems(context) {
  const items = (context.items ?? []).map((item) => {
    return `
      <article class="nimble-loot-item-row" data-loot-drag-item-id="${nimbleLootPlayerAttr(item.id)}" title="Drag ${nimbleLootPlayerAttr(item.name)} to a character sheet or the canvas">
        <img src="${nimbleLootPlayerAttr(item.img)}" alt="${nimbleLootPlayerAttr(item.name)}">
        <div class="nimble-loot-item-main">
          <strong>${nimbleLootPlayerEsc(item.name)}</strong>
          <span>Qty: ${Number(item.quantity ?? 1)}</span>
        </div>
        <div class="nimble-loot-item-actions">
          <button type="button" data-action="takeListItem" data-item-id="${nimbleLootPlayerAttr(item.id)}">Take</button>
        </div>
      </article>
    `;
  }).join("");
  return `<div class="nimble-loot-items">${items}</div>`;
}

class NimbleLootDialog extends NimbleLootSvelteApplicationMixin(NimbleLootApplicationBase) {
  static OPEN_DIALOGS = new Set();

  static DEFAULT_OPTIONS = foundry.utils.mergeObject(foundry.utils.deepClone(super.DEFAULT_OPTIONS), {
    id: "nimble-loot-dialog",
    tag: "section",
    classes: ["nimble-loot-app", "nimble-loot-dialog", "nimble-loot-svelte-player-app"],
    position: { width: 720, height: 760 },
    window: {
      title: "Nimble Loot",
      icon: "fas fa-box-open",
      resizable: true,
      contentClasses: ["standard-form", "nimble-loot-window"]
    }
  });

  constructor({ token, actor = null } = {}, options = {}) {
    const savedPosition = NimbleLootDialog._getSavedPosition();
    const mergedOptions = foundry.utils.mergeObject(options ?? {}, savedPosition ? { position: savedPosition } : {}, {
      inplace: false,
      insertKeys: true,
      insertValues: true,
      overwrite: false,
      recursive: true
    });
    super(mergedOptions);
    this.root = NimbleLootSveltePlayerComponent;
    this.token = token;
    this.actor = actor;
  }

  static _getPositionStorageKey() {
    return `${NIMBLE_LOOT_MODULE_ID}.playerDialogPosition`;
  }

  static _getSavedPosition() {
    try {
      const raw = globalThis.localStorage?.getItem?.(NimbleLootDialog._getPositionStorageKey());
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const width = Number(parsed?.width);
      const height = Number(parsed?.height);
      if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
      return { width: Math.max(520, Math.floor(width)), height: Math.max(420, Math.floor(height)) };
    } catch (_error) {
      return null;
    }
  }

  static refreshForToken(tokenOrDocument) {
    const tokenDoc = nimbleLootTokenDocument(tokenOrDocument);
    if (!tokenDoc) return;
    const tokenUuid = tokenDoc.uuid ?? tokenDoc.id;
    for (const app of Array.from(NimbleLootDialog.OPEN_DIALOGS)) {
      const appTokenDoc = nimbleLootTokenDocument(app.token);
      const appUuid = appTokenDoc?.uuid ?? appTokenDoc?.id;
      if (appUuid === tokenUuid) app.render({ force: true });
    }
  }

  _savePositionState() {
    try {
      const position = this.position ?? {};
      const width = Math.floor(Number(position.width) || 0);
      const height = Math.floor(Number(position.height) || 0);
      if (width && height) {
        globalThis.localStorage?.setItem?.(NimbleLootDialog._getPositionStorageKey(), JSON.stringify({ width, height }));
      }
    } catch (_error) {
      // Non-critical UI preference only.
    }
  }

  async close(options = {}) {
    NimbleLootDialog.OPEN_DIALOGS.delete(this);
    this._savePositionState();
    return super.close(options);
  }

  get title() {
    return nimbleLootGetDisplayName(this.token, nimbleLootGetData(this.token));
  }

  async _prepareContext(options) {
    const lootData = nimbleLootGetData(this.token);
    const actor = this.actor ?? nimbleLootResolveActorForUser(game.user);
    const mode = nimbleLootMode(lootData);
    const currency = nimbleLootCanShowContents(lootData) ? nimbleLootGetLootCurrency(lootData) : { gp: 0, sp: 0, cp: 0 };
    const actorCurrency = actor ? nimbleLootGetCurrency(actor) : { gp: 0, sp: 0, cp: 0 };
    const items = nimbleLootGetVisibleLootItems(this.token, lootData).map((item) => {
      const quantity = nimbleLootGetItemQuantity(item);
      return {
        id: item.id,
        name: item.name,
        img: nimbleLootGetItemImage(item),
        quantity,
        hasMultiple: quantity > 1,
        description: ""
      };
    });
    const grid = nimbleLootBuildGridSlotsForContext(items, lootData);
    const detectedTrapTypes = nimbleLootDetectedTrapTypes(lootData);
    const inspectionLogLines = nimbleLootBuildPlayerLogLines(lootData, "inspection");
    const openingLogLines = nimbleLootBuildPlayerLogLines(lootData, "opening");
    const showOpeningAttempts = inspectionLogLines.length > 0 || openingLogLines.length > 0;

    return {
      tokenName: nimbleLootGetDisplayName(this.token, lootData),
      actorName: actor?.name ?? "No hero selected",
      typeLabel: NIMBLE_LOOT_TYPE_LABELS[lootData?.type] ?? "Loot",
      displayAsGrid: nimbleLootIsGridDisplay(lootData),
      description: lootData?.config?.description ?? "",
      statusLabel: nimbleLootStatusLabel(lootData),
      trapLabel: nimbleLootGetTrapDisplayLabel(lootData),
      mode,
      isOpenMode: mode === "open",
      isSealedMode: mode === "sealed",
      isDepletedMode: mode === "depleted",
      isUndiscoveredMode: false,
      canShowContents: nimbleLootCanShowContents(lootData),
      canInspect: lootData?.type !== NIMBLE_LOOT_TYPES.PILE && nimbleLootAttemptsAllowed(lootData?.config?.access?.maxInspectAttempts) && (lootData?.config?.access?.maxInspectAttempts === null || Number(lootData?.state?.inspectAttempts ?? 0) < Number(lootData?.config?.access?.maxInspectAttempts ?? 0)),
      canCarefullyOpen: lootData?.type !== NIMBLE_LOOT_TYPES.PILE && lootData?.state?.carefulOpenAttempted !== true,
      canPick: nimbleLootAttemptsAllowed(lootData?.config?.access?.maxPickAttempts) && lootData?.config?.access?.locked,
      canForce: nimbleLootCanPlayerForceOpen(lootData) && (lootData?.config?.access?.locked || !lootData?.state?.opened),
      canTake: nimbleLootCanTakeContents(this.token, lootData),
      canDisarm: detectedTrapTypes.length > 0,
      canUseKeyCode: String(lootData?.config?.access?.keyCode ?? "").trim().length > 0 && !lootData?.state?.opened,
      detectedTrapTypes: detectedTrapTypes.map((trapType) => ({ type: trapType, label: nimbleLootTitleCase(trapType) })),
      showOpeningAttempts,
      inspectionLogLines,
      hasInspectionLog: inspectionLogLines.length > 0,
      openingLogLines,
      hasOpeningLog: openingLogLines.length > 0,
      currency,
      actorCurrency,
      hasCurrency: !nimbleLootIsCurrencyEmpty(currency),
      canLeaveCurrency: actor && !nimbleLootIsCurrencyEmpty(actorCurrency),
      currencyLabel: nimbleLootFormatCurrency(currency),
      currencyPills: NIMBLE_LOOT_CURRENCY_KEYS.map((key) => ({ key, label: key.toUpperCase(), value: currency[key] ?? 0, hasValue: (currency[key] ?? 0) > 0 })),
      actorCurrencyLabel: actor ? nimbleLootFormatCurrency(actorCurrency) : "No hero selected",
      items,
      gridRows: grid.rows,
      gridColumns: grid.columns,
      gridSlots: grid.slots,
      gridStyle: `grid-template-columns: repeat(${grid.columns}, 64px);`,
      hasItems: items.length > 0,
      isGm: game.user?.isGM === true
    };
  }

  _onRender(context, options) {
    super._onRender(context, options);
    NimbleLootDialog.OPEN_DIALOGS.add(this);
    const root = this.element;
    if (!root) return;
    root.querySelectorAll("[data-action]").forEach((element) => {
      element.addEventListener("click", (event) => this._handleAction(event));
    });
    const dropZone = root.querySelector("[data-drop-zone='player-items']");
    if (dropZone) {
      dropZone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropZone.classList.add("nimble-loot-drop-active");
      });
      dropZone.addEventListener("dragleave", () => dropZone.classList.remove("nimble-loot-drop-active"));
      dropZone.addEventListener("drop", (event) => this._onDropItem(event));
    }

    root.querySelectorAll("[data-grid-slot]").forEach((slot) => {
      slot.addEventListener("dragover", (event) => {
        event.preventDefault();
        slot.classList.add("nimble-loot-drop-active");
      });
      slot.addEventListener("dragleave", () => slot.classList.remove("nimble-loot-drop-active"));
      slot.addEventListener("drop", (event) => this._onDropGridSlot(event));
    });

    root.querySelectorAll("[data-loot-drag-item-id]").forEach((tile) => {
      tile.setAttribute("draggable", "true");
      tile.querySelectorAll?.("img").forEach((img) => img.setAttribute("draggable", "false"));
      tile.addEventListener("dragstart", (event) => this._onDragContainerItem(event, tile));
    });
  }

  _readFlatBonus(name) {
    const value = Number(this.element?.querySelector?.(`[name="${name}"]`)?.value ?? 0);
    if (!Number.isFinite(value)) return 0;
    return Math.max(-20, Math.min(20, Math.floor(value)));
  }

  async _rollLocallyForAction(action, actor, extra = {}) {
    const data = nimbleLootGetData(this.token);
    if (!data) throw new Error("This token is not configured as Nimble Loot.");

    if (action === "inspect") {
      const flatBonus = this._readFlatBonus("inspectBonus");
      return nimbleLootRollSkillToChat(actor, data.config.access.inspectSkill, data.config.access.inspectDc, "Inspect", { flatBonus });
    }

    if (action === "pick") {
      const flatBonus = this._readFlatBonus("attemptBonus");
      return nimbleLootRollSkillToChat(actor, data.config.access.pickSkill, data.config.access.pickDc, "Pick Lock", { flatBonus });
    }

    if (action === "force") {
      const flatBonus = this._readFlatBonus("attemptBonus");
      return nimbleLootRollSkillToChat(actor, data.config.access.forceSkill, data.config.access.forceDc, "Force Open", { flatBonus });
    }

    if (action === "disarm") {
      const flatBonus = this._readFlatBonus("attemptBonus");
      const trapType = extra.trapType;
      const skill = trapType === NIMBLE_LOOT_TRAP_TYPES.MAGICAL ? data.config.access.magicalDisarmSkill : data.config.access.mechanicalDisarmSkill;
      const dc = trapType === NIMBLE_LOOT_TRAP_TYPES.MAGICAL ? data.config.access.magicalDisarmDc : data.config.access.mechanicalDisarmDc;
      return nimbleLootRollSkillToChat(actor, skill, dc, `Disarm ${nimbleLootTitleCase(trapType)} Trap`, { flatBonus });
    }

    return null;
  }

  _serializeRollResult(roll) {
    if (!roll) return null;
    return {
      total: Number.isFinite(Number(roll.total)) ? Math.floor(Number(roll.total)) : 0,
      dc: Number.isFinite(Number(roll.dc)) ? Math.floor(Number(roll.dc)) : 0,
      success: roll.success === true,
      skill: roll.skill ?? null,
      native: roll.native === true,
      bonus: Number.isFinite(Number(roll.bonus)) ? Math.floor(Number(roll.bonus)) : 0,
      flatBonus: Number.isFinite(Number(roll.flatBonus)) ? Math.floor(Number(roll.flatBonus)) : 0,
      natural: Number.isFinite(Number(roll.natural)) ? Math.floor(Number(roll.natural)) : null,
      isNat1: roll.isNat1 === true,
      isNat20: roll.isNat20 === true
    };
  }

  _readCurrencyPortion() {
    const root = this.element;
    return {
      gp: Math.max(0, Math.floor(Number(root?.querySelector?.('[name="takeGp"]')?.value ?? 0) || 0)),
      sp: Math.max(0, Math.floor(Number(root?.querySelector?.('[name="takeSp"]')?.value ?? 0) || 0)),
      cp: Math.max(0, Math.floor(Number(root?.querySelector?.('[name="takeCp"]')?.value ?? 0) || 0))
    };
  }

  _readTakeQuantity(itemId) {
    const input = this.element?.querySelector?.(`[name="takeQty-${itemId}"]`);
    const value = Math.floor(Number(input?.value ?? 1) || 1);
    return Math.max(1, value);
  }


  _containerItemDragPayload(itemId) {
    const tokenDoc = nimbleLootTokenDocument(this.token);
    const item = nimbleLootGetLootActor(this.token)?.items?.get(itemId);
    if (!tokenDoc || !item) return null;
    return {
      type: "NimbleLootContainerItem",
      name: item.name,
      img: item.img,
      uuid: item.uuid ?? null,
      sourceContainer: {
        sceneId: tokenDoc.parent?.id ?? canvas?.scene?.id ?? null,
        tokenId: tokenDoc.id,
        itemId: item.id
      },
      flags: {
        [NIMBLE_LOOT_MODULE_ID]: {
          sourceContainer: {
            sceneId: tokenDoc.parent?.id ?? canvas?.scene?.id ?? null,
            tokenId: tokenDoc.id,
            itemId: item.id
          }
        }
      }
    };
  }

  _onDragContainerItem(event, element) {
    const itemId = element?.dataset?.lootDragItemId;
    const payload = this._containerItemDragPayload(itemId);
    if (!payload) return;
    this._lastDragStartedAt = Date.now();
    event.dataTransfer.effectAllowed = "copyMove";
    event.dataTransfer?.setData?.("application/json", JSON.stringify(payload));
    event.dataTransfer?.setData?.("text/plain", JSON.stringify(payload));
    const tokenDoc = nimbleLootTokenDocument(this.token);
    event.dataTransfer?.setData?.("application/x-nimble-loot-grid-item", JSON.stringify({ type: "NimbleLootGridItem", itemId, tokenId: tokenDoc?.id ?? null, sceneId: tokenDoc?.parent?.id ?? canvas?.scene?.id ?? null }));
  }

  async _promptQuantity({ itemName, max, title = "Choose Quantity" } = {}) {
    const safeMax = Math.max(1, Math.floor(Number(max) || 1));
    if (safeMax <= 1) return 1;

    const content = `<form class="nimble-loot-quantity-dialog nimble-loot-dialogv2-form"><p>How many <strong>${foundry.utils.escapeHTML(itemName)}</strong>?</p><input type="number" name="quantity" min="1" max="${safeMax}" value="1" autofocus></form>`;
    const DialogV2 = foundry.applications?.api?.DialogV2;
    if (DialogV2) {
      try {
        return await DialogV2.prompt({
          window: { title },
          content,
          modal: true,
          rejectClose: false,
          ok: {
            label: "Amount",
            callback: (_event, button) => Math.max(1, Math.min(safeMax, Math.floor(Number(nimbleLootReadDialogElementValue(button, "quantity", 1)) || 1)))
          }
        });
      } catch (_error) {
        return null;
      }
    }

    if (typeof Dialog !== "undefined") {
      return new Promise((resolve) => {
        new Dialog({
          title,
          content,
          buttons: {
            ok: {
              icon: '<i class="fas fa-check"></i>',
              label: "Amount",
              callback: (html) => {
                const raw = html?.find?.('[name="quantity"]')?.val?.() ?? html?.querySelector?.('[name="quantity"]')?.value ?? 1;
                const quantity = Math.max(1, Math.min(safeMax, Math.floor(Number(raw) || 1)));
                resolve(quantity);
              }
            },
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: "Cancel",
              callback: () => resolve(null)
            }
          },
          default: "ok",
          close: () => resolve(null)
        }).render(true);
      });
    }

    const raw = globalThis.prompt?.(`How many ${itemName}?`, "1");
    if (raw === null) return null;
    return Math.max(1, Math.min(safeMax, Math.floor(Number(raw) || 1)));
  }

  async _promptTakeQuantity({ itemName, max } = {}) {
    const safeMax = Math.max(1, Math.floor(Number(max) || 1));
    if (safeMax <= 1) return 1;

    const content = `<form class="nimble-loot-quantity-dialog nimble-loot-dialogv2-form"><p>How many <strong>${foundry.utils.escapeHTML(itemName)}</strong> do you want to take?</p><p class="nimble-loot-muted nimble-loot-small-note">Available: ${safeMax}</p><input type="number" name="quantity" min="1" max="${safeMax}" value="1" autofocus></form>`;
    const readQuantity = (buttonOrHtml) => {
      const raw = nimbleLootReadDialogElementValue(buttonOrHtml, "quantity", buttonOrHtml?.find?.('[name="quantity"]')?.val?.() ?? buttonOrHtml?.querySelector?.('[name="quantity"]')?.value ?? 1);
      return Math.max(1, Math.min(safeMax, Math.floor(Number(raw) || 1)));
    };
    const DialogV2 = foundry.applications?.api?.DialogV2;
    if (DialogV2) {
      return new Promise((resolve) => {
        let settled = false;
        const done = (value) => {
          if (settled) return;
          settled = true;
          resolve(value);
        };
        const dialog = new DialogV2({
          window: { title: "Take Item" },
          content,
          modal: true,
          buttons: [{
            action: "amount",
            label: "Amount",
            icon: "fas fa-hand-holding",
            default: true,
            callback: (_event, button) => done(readQuantity(button))
          }, {
            action: "all",
            label: "All",
            icon: "fas fa-box-open",
            callback: () => done(safeMax)
          }, {
            action: "cancel",
            label: "Cancel",
            icon: "fas fa-times",
            callback: () => done(null)
          }],
          close: () => done(null)
        });
        dialog.render({ force: true });
      });
    }

    if (typeof Dialog !== "undefined") {
      return new Promise((resolve) => {
        let settled = false;
        const done = (value) => {
          if (settled) return;
          settled = true;
          resolve(value);
        };
        new Dialog({
          title: "Take Item",
          content,
          buttons: {
            take: {
              icon: '<i class="fas fa-hand-holding"></i>',
              label: "Amount",
              callback: (html) => done(readQuantity(html))
            },
            all: {
              icon: '<i class="fas fa-box-open"></i>',
              label: "All",
              callback: () => done(safeMax)
            },
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: "Cancel",
              callback: () => done(null)
            }
          },
          default: "take",
          close: () => done(null)
        }).render(true);
      });
    }

    const raw = globalThis.prompt?.(`How many ${itemName} do you want to take? Available: ${safeMax}`, "1");
    if (raw === null) return null;
    return Math.max(1, Math.min(safeMax, Math.floor(Number(raw) || 1)));
  }

  async _promptCurrencyPortion({ title, note, maxCurrency } = {}) {
    const max = {
      gp: Math.max(0, Math.floor(Number(maxCurrency?.gp ?? 0) || 0)),
      sp: Math.max(0, Math.floor(Number(maxCurrency?.sp ?? 0) || 0)),
      cp: Math.max(0, Math.floor(Number(maxCurrency?.cp ?? 0) || 0))
    };
    const content = `
      <form class="nimble-loot-currency-dialog nimble-loot-dialogv2-form">
        <p>${foundry.utils.escapeHTML(note ?? "Choose currency amounts.")}</p>
        <div class="nimble-loot-currency-dialog-grid">
          <label>GP<input type="number" name="gp" min="0" max="${max.gp}" value="0"></label>
          <label>SP<input type="number" name="sp" min="0" max="${max.sp}" value="0"></label>
          <label>CP<input type="number" name="cp" min="0" max="${max.cp}" value="0"></label>
        </div>
      </form>`;
    const readCurrency = (buttonOrHtml) => {
      const read = (key) => Math.max(0, Math.min(max[key], Math.floor(Number(nimbleLootReadDialogElementValue(buttonOrHtml, key, buttonOrHtml?.find?.(`[name="${key}"]`)?.val?.() ?? buttonOrHtml?.querySelector?.(`[name="${key}"]`)?.value ?? 0)) || 0)));
      return { gp: read("gp"), sp: read("sp"), cp: read("cp") };
    };
    const DialogV2 = foundry.applications?.api?.DialogV2;
    if (DialogV2) {
      return new Promise((resolve) => {
        let settled = false;
        const done = (value) => {
          if (settled) return;
          settled = true;
          resolve(value);
        };
        const dialog = new DialogV2({
          window: { title },
          content,
          modal: true,
          buttons: [{
            action: "amount",
            label: "Amount",
            icon: "fas fa-hand-holding",
            default: true,
            callback: (_event, button) => done(readCurrency(button))
          }, {
            action: "cancel",
            label: "Cancel",
            icon: "fas fa-times",
            callback: () => done(null)
          }],
          close: () => done(null)
        });
        dialog.render({ force: true });
      });
    }
    if (typeof Dialog !== "undefined") {
      return new Promise((resolve) => {
        let settled = false;
        const done = (value) => {
          if (settled) return;
          settled = true;
          resolve(value);
        };
        new Dialog({
          title,
          content,
          buttons: {
            amount: { icon: '<i class="fas fa-hand-holding"></i>', label: "Amount", callback: (html) => done(readCurrency(html)) },
            cancel: { icon: '<i class="fas fa-times"></i>', label: "Cancel", callback: () => done(null) }
          },
          default: "amount",
          close: () => done(null)
        }).render(true);
      });
    }
    return null;
  }

  async _onDropItem(event) {
    event.preventDefault();
    event.stopPropagation?.();
    const dropZone = event.currentTarget;
    dropZone?.classList?.remove?.("nimble-loot-drop-active");

    try {
      const data = nimbleLootGetData(this.token);
      if (!nimbleLootCanTakeContents(this.token, data)) throw new Error("The container must be open before you can leave items in it.");

      const gridText = event.dataTransfer?.getData?.("application/x-nimble-loot-grid-item") || "";
      const plainText = event.dataTransfer?.getData?.("text/plain") || "";
      let customData = null;
      try { customData = gridText ? JSON.parse(gridText) : (plainText ? JSON.parse(plainText) : null); } catch (_error) { customData = null; }
      if (customData?.type === "NimbleLootGridItem" || customData?.type === "NimbleLootContainerItem") return;

      const dropData = TextEditor.getDragEventData(event);
      const item = await nimbleLootResolveDroppedItem(dropData);
      if (!item) throw new Error("Dropped data did not resolve to an item.");
      if (!nimbleLootIsLootItem(item)) throw new Error("Only Nimble object items can be stored as loot.");

      const actor = item.parent?.documentName === "Actor" ? item.parent : (this.actor ?? nimbleLootRequireActor(game.user));
      if (!actor) throw new Error("No source actor found.");
      if (!actor.items?.get(item.id)) throw new Error("That item must come from one of your actor inventories.");
      if (!game.user?.isGM && actor.isOwner !== true) throw new Error("You can only leave items from an actor you own.");

      const available = nimbleLootGetItemQuantity(item);
      const quantity = await this._promptQuantity({ itemName: item.name, max: available, title: "Leave Item" });
      if (!quantity) return;

      const tokenId = nimbleLootTokenDocument(this.token)?.id;
      const sceneId = canvas?.scene?.id;
      const payload = { sceneId, tokenId, actorId: actor.id, actorUuid: actor.uuid, itemId: item.id, quantity };
      const result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.DEPOSIT_ITEM, payload, () => nimbleLootDepositItem({ token: this.token, actor, itemId: item.id, quantity, user: game.user }));
      if (result?.message) nimbleLootNotify(result.message);
      await this.render({ force: true });
    } catch (error) {
      nimbleLootNotify(error.message ?? String(error), "warn");
      nimbleLootError("Item deposit failed", error);
    }
  }


  async _onDropGridSlot(event) {
    event.preventDefault();
    event.stopPropagation?.();
    const slot = event.currentTarget;
    slot?.classList?.remove?.("nimble-loot-drop-active");
    const slotIndex = Math.max(0, Math.floor(Number(slot?.dataset?.gridSlot ?? 0) || 0));

    try {
      const gridText = event.dataTransfer?.getData?.("application/x-nimble-loot-grid-item") || "";
      const plainText = event.dataTransfer?.getData?.("text/plain") || "";
      let customData = null;
      try { customData = gridText ? JSON.parse(gridText) : (plainText ? JSON.parse(plainText) : null); } catch (_error) { customData = null; }

      const tokenId = nimbleLootTokenDocument(this.token)?.id;
      const sceneId = canvas?.scene?.id;

      if (customData?.type === "NimbleLootGridItem" && customData.itemId && (!customData.tokenId || customData.tokenId === tokenId)) {
        await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.MOVE_GRID_ITEM, { sceneId, tokenId, itemId: customData.itemId, slotIndex }, () => nimbleLootMoveGridItem({ token: this.token, itemId: customData.itemId, slotIndex }));
        await this.render({ force: true });
        return;
      }

      const data = nimbleLootGetData(this.token);
      if (!nimbleLootCanTakeContents(this.token, data)) throw new Error("The container must be open before you can leave items in it.");

      const dropData = TextEditor.getDragEventData(event);
      const item = await nimbleLootResolveDroppedItem(dropData);
      if (!item) throw new Error("Dropped data did not resolve to an item.");
      if (!nimbleLootIsLootItem(item)) throw new Error("Only Nimble object items can be stored as loot.");

      const actor = item.parent?.documentName === "Actor" ? item.parent : (this.actor ?? nimbleLootRequireActor(game.user));
      if (!actor) throw new Error("No source actor found.");
      if (!actor.items?.get(item.id)) throw new Error("That item must come from one of your actor inventories.");
      if (!game.user?.isGM && actor.isOwner !== true) throw new Error("You can only leave items from an actor you own.");

      const available = nimbleLootGetItemQuantity(item);
      const quantity = await this._promptQuantity({ itemName: item.name, max: available, title: "Leave Item" });
      if (!quantity) return;

      const payload = { sceneId, tokenId, actorId: actor.id, actorUuid: actor.uuid, itemId: item.id, quantity, slotIndex };
      const result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.DEPOSIT_ITEM, payload, () => nimbleLootDepositItem({ token: this.token, actor, itemId: item.id, quantity, user: game.user, slotIndex }));
      if (result?.message) nimbleLootNotify(result.message);
      await this.render({ force: true });
    } catch (error) {
      nimbleLootNotify(error.message ?? String(error), "warn");
      nimbleLootError("Grid drop failed", error);
    }
  }

  _actorInventoryChoices(actor) {
    return Array.from(actor?.items ?? [])
      .filter((item) => nimbleLootIsLootItem(item) && nimbleLootGetItemQuantity(item) > 0)
      .map((item) => ({ id: item.id, name: item.name, quantity: nimbleLootGetItemQuantity(item), img: nimbleLootGetItemImage(item) }));
  }

  async _openAddFromInventoryDialog(actor) {
    if (!actor) throw new Error("No actor found.");
    const choices = this._actorInventoryChoices(actor);
    if (!choices.length) throw new Error(`${actor.name} has no Nimble object items to leave.`);

    const options = choices.map((item) => `<option value="${item.id}">${foundry.utils.escapeHTML(item.name)} (Qty: ${item.quantity})</option>`).join("");
    const first = choices[0];
    const content = `
      <form class="nimble-loot-inventory-add-dialog nimble-loot-dialogv2-form">
        <p>Choose an item from <strong>${foundry.utils.escapeHTML(actor.name)}</strong> to leave in this container.</p>
        <label>Item
          <select name="itemId">${options}</select>
        </label>
        <label class="nimble-loot-compact-number-label">Amount
          <input type="number" name="quantity" min="1" max="${first.quantity}" value="1" step="1">
        </label>
      </form>`;

    const resolveSelection = (button) => {
      const itemId = nimbleLootReadDialogElementValue(button, "itemId", choices[0]?.id);
      const item = choices.find((candidate) => candidate.id === itemId) ?? choices[0];
      const raw = nimbleLootReadDialogElementValue(button, "quantity", 1);
      const quantity = Math.max(1, Math.min(item.quantity, Math.floor(Number(raw) || 1)));
      return { itemId: item.id, quantity };
    };

    const DialogV2 = foundry.applications?.api?.DialogV2;
    if (DialogV2) {
      return new Promise((resolve) => {
        const dialog = new DialogV2({
          window: { title: "Add From Inventory" },
          content,
          modal: true,
          buttons: [{
            action: "amount",
            label: "Amount",
            icon: "fas fa-plus",
            default: true,
            callback: (_event, button) => resolveSelection(button)
          }, {
            action: "all",
            label: "All",
            icon: "fas fa-box-open",
            callback: (_event, button) => {
              const itemId = nimbleLootReadDialogElementValue(button, "itemId", choices[0]?.id);
              const item = choices.find((candidate) => candidate.id === itemId) ?? choices[0];
              return { itemId: item.id, quantity: item.quantity };
            }
          }, {
            action: "cancel",
            label: "Cancel",
            icon: "fas fa-times",
            callback: () => null
          }],
          submit: (result) => resolve(result ?? null),
          close: () => resolve(null)
        });
        dialog.render({ force: true }).then(() => {
          const root = dialog.element;
          const select = root?.querySelector?.('[name="itemId"]');
          const input = root?.querySelector?.('[name="quantity"]');
          const updateMax = () => {
            const item = choices.find((candidate) => candidate.id === select?.value) ?? choices[0];
            if (!input || !item) return;
            input.max = String(item.quantity);
            if (Number(input.value) > item.quantity) input.value = String(item.quantity);
          };
          select?.addEventListener?.("change", updateMax);
          updateMax();
        });
      });
    }

    const selection = await new Promise((resolve) => {
      const dialog = new Dialog({
        title: "Add From Inventory",
        content,
        buttons: {
          amount: {
            icon: '<i class="fas fa-plus"></i>',
            label: "Amount",
            callback: (html) => {
              const root = html?.[0] ?? html;
              const itemId = root?.querySelector?.('[name="itemId"]')?.value ?? html?.find?.('[name="itemId"]')?.val?.();
              const item = choices.find((candidate) => candidate.id === itemId) ?? choices[0];
              const raw = root?.querySelector?.('[name="quantity"]')?.value ?? html?.find?.('[name="quantity"]')?.val?.() ?? 1;
              const quantity = Math.max(1, Math.min(item.quantity, Math.floor(Number(raw) || 1)));
              resolve({ itemId: item.id, quantity });
            }
          },
          all: {
            icon: '<i class="fas fa-box-open"></i>',
            label: "All",
            callback: (html) => {
              const root = html?.[0] ?? html;
              const itemId = root?.querySelector?.('[name="itemId"]')?.value ?? html?.find?.('[name="itemId"]')?.val?.();
              const item = choices.find((candidate) => candidate.id === itemId) ?? choices[0];
              resolve({ itemId: item.id, quantity: item.quantity });
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => resolve(null)
          }
        },
        default: "amount",
        close: () => resolve(null),
        render: (html) => {
          const root = html?.[0] ?? html;
          const select = root?.querySelector?.('[name="itemId"]') ?? html?.find?.('[name="itemId"]')?.[0];
          const input = root?.querySelector?.('[name="quantity"]') ?? html?.find?.('[name="quantity"]')?.[0];
          const updateMax = () => {
            const item = choices.find((candidate) => candidate.id === select?.value) ?? choices[0];
            if (!input || !item) return;
            input.max = String(item.quantity);
            if (Number(input.value) > item.quantity) input.value = String(item.quantity);
          };
          select?.addEventListener?.("change", updateMax);
          updateMax();
        }
      });
      dialog.render(true);
    });

    return selection;
  }

  async _handleAction(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button?.dataset?.action;

    if (action === "close") {
      button.disabled = true;
      this.element?.classList?.add?.("nimble-loot-closing");
      try {
        await this.close({ animate: false });
      } catch (_error) {
        await this.close();
      }
      return;
    }

    button.disabled = true;
    try {
      const actorOptionalActions = ["splitCurrency"];
      const actor = this.actor ?? (actorOptionalActions.includes(action) ? nimbleLootResolveActorForUser(game.user) : nimbleLootRequireActor(game.user));
      if (!actor && !actorOptionalActions.includes(action)) return;
      const tokenId = nimbleLootTokenDocument(this.token)?.id;
      const sceneId = canvas?.scene?.id;
      const basePayload = { sceneId, tokenId, actorId: actor?.id, actorUuid: actor?.uuid };
      let result;

      if (action !== "close" && !nimbleLootAssertInteractionDistance(this.token, actor, game.user)) return;

      if (action === "takeGridItem" || action === "takeListItem") {
        const itemId = button.dataset.itemId;
        const item = nimbleLootGetLootActor(this.token)?.items?.get(itemId);
        if (!item) throw new Error("That item could not be found.");
        const available = nimbleLootGetItemQuantity(item);
        const quantity = available > 1 ? await this._promptTakeQuantity({ itemName: item.name, max: available }) : 1;
        if (!quantity) return;
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.TRANSFER_ITEM, { ...basePayload, itemId, quantity }, () => nimbleLootTakeItem({ token: this.token, actor, itemId, quantity, user: game.user }));
      }

      if (action === "takeItem") {
        const itemId = button.dataset.itemId;
        const quantity = button.dataset.quantity === "input" ? this._readTakeQuantity(itemId) : (Number(button.dataset.quantity ?? 1) || 1);
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.TRANSFER_ITEM, { ...basePayload, itemId, quantity }, () => nimbleLootTakeItem({ token: this.token, actor, itemId, quantity, user: game.user }));
      }

      if (action === "takeAllItem") {
        const itemId = button.dataset.itemId;
        const item = nimbleLootGetLootActor(this.token)?.items?.get(itemId);
        const quantity = nimbleLootGetItemQuantity(item);
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.TRANSFER_ITEM, { ...basePayload, itemId, quantity }, () => nimbleLootTakeItem({ token: this.token, actor, itemId, quantity, user: game.user }));
      }

      if (action === "takeCurrency") {
        const currency = { gp: Number(button.dataset.gp ?? 0), sp: Number(button.dataset.sp ?? 0), cp: Number(button.dataset.cp ?? 0) };
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.TRANSFER_CURRENCY, { ...basePayload, currency }, () => nimbleLootTakeCurrency({ token: this.token, actor, currency, user: game.user }));
      }

      if (action === "takeCurrencyPortion") {
        const lootCurrency = nimbleLootGetLootCurrency(nimbleLootGetData(this.token));
        const currency = await this._promptCurrencyPortion({
          title: "Take Currency",
          note: `Your hero currently has ${nimbleLootFormatCurrency(nimbleLootGetCurrency(actor))}. Available in container: ${nimbleLootFormatCurrency(lootCurrency)}.`,
          maxCurrency: lootCurrency
        });
        if (!currency || nimbleLootIsCurrencyEmpty(currency)) return;
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.TRANSFER_CURRENCY, { ...basePayload, currency }, () => nimbleLootTakeCurrency({ token: this.token, actor, currency, user: game.user }));
      }

      if (action === "leaveCurrencyPortion") {
        const actorCurrency = nimbleLootGetCurrency(actor);
        const currency = await this._promptCurrencyPortion({
          title: "Leave Currency",
          note: `Your hero currently has ${nimbleLootFormatCurrency(actorCurrency)}. Choose how much to leave in this container.`,
          maxCurrency: actorCurrency
        });
        if (!currency || nimbleLootIsCurrencyEmpty(currency)) return;
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.LEAVE_CURRENCY, { ...basePayload, currency }, () => nimbleLootLeaveCurrency({ token: this.token, actor, currency, user: game.user }));
      }

      if (action === "addFromInventory") {
        const selection = await this._openAddFromInventoryDialog(actor);
        if (!selection) return;
        result = await nimbleLootRunMaybeViaGm(
          NIMBLE_LOOT_SOCKET_ACTIONS.DEPOSIT_ITEM,
          { ...basePayload, itemId: selection.itemId, quantity: selection.quantity },
          () => nimbleLootDepositItem({ token: this.token, actor, itemId: selection.itemId, quantity: selection.quantity, user: game.user })
        );
      }

      if (action === "useKeyCode") {
        const code = String(this.element?.querySelector?.('[name="keyCodeEntry"]')?.value ?? "").trim();
        if (!code) throw new Error("Enter a key/code first.");
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.USE_KEY_CODE, { ...basePayload, code }, () => nimbleLootUseKeyCode({ token: this.token, actor, user: game.user, code }));
      }

      if (action === "splitCurrency") {
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.SPLIT_CURRENCY, basePayload, () => nimbleLootSplitCurrencyEvenlyBetweenParty({ token: this.token, user: game.user, sceneId }));
      }

      if (action === "takeAll") {
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.TAKE_ALL, basePayload, () => nimbleLootTakeAllVisibleLoot({ token: this.token, actor, user: game.user }));
      }

      if (action === "carefulOpen") {
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.CAREFUL_OPEN, basePayload, () => nimbleLootCarefullyOpenContainer({ token: this.token, actor, user: game.user }));
      }

      if (action === "inspect") {
        const localRoll = await this._rollLocallyForAction(action, actor);
        if (!localRoll) return;
        const rollResult = this._serializeRollResult(localRoll);
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.INSPECT, { ...basePayload, rollResult }, () => nimbleLootInspectForTraps({ token: this.token, actor, user: game.user, rollResult }));
      }

      if (action === "pick") {
        const localRoll = await this._rollLocallyForAction(action, actor);
        if (!localRoll) return;
        const rollResult = this._serializeRollResult(localRoll);
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.PICK_LOCK, { ...basePayload, rollResult }, () => nimbleLootPickLock({ token: this.token, actor, user: game.user, rollResult }));
      }

      if (action === "force") {
        const localRoll = await this._rollLocallyForAction(action, actor);
        if (!localRoll) return;
        const rollResult = this._serializeRollResult(localRoll);
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.FORCE_OPEN, { ...basePayload, rollResult }, () => nimbleLootForceOpen({ token: this.token, actor, user: game.user, rollResult }));
      }

      if (action === "disarm") {
        const trapType = button.dataset.trapType;
        const localRoll = await this._rollLocallyForAction(action, actor, { trapType });
        if (!localRoll) return;
        const rollResult = this._serializeRollResult(localRoll);
        result = await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.DISARM_TRAP, { ...basePayload, trapType, rollResult }, () => nimbleLootDisarmTrap({ token: this.token, actor, trapType, user: game.user, rollResult }));
      }

      if (result?.message) nimbleLootNotify(result.message);
      if (result?.lootData?._deleted) {
        await this.close({ animate: false });
        return;
      }
      if (action === "takeAll") {
        await this.close();
        return;
      }
      await this.render({ force: true });
    } catch (error) {
      nimbleLootNotify(error.message ?? String(error), "warn");
      nimbleLootError("Dialog action failed", error);
    } finally {
      button.disabled = false;
    }
  }
}

function nimbleLootRefreshOpenDialogsForToken(tokenOrDocument) {
  NimbleLootDialog.refreshForToken(tokenOrDocument);
}

function nimbleLootRegisterDialogRefreshHooks() {
  Hooks.on("updateToken", (tokenDocument) => {
    if (nimbleLootHasData(tokenDocument)) nimbleLootRefreshOpenDialogsForToken(tokenDocument);
  });

  for (const hookName of ["createItem", "updateItem", "deleteItem"]) {
    Hooks.on(hookName, (item) => {
      const actor = item?.parent;
      if (!actor) return;
      for (const app of Array.from(NimbleLootDialog.OPEN_DIALOGS)) {
        const lootActor = nimbleLootGetLootActor(app.token);
        if (lootActor?.uuid === actor.uuid || lootActor?.id === actor.id) app.render({ force: true });
      }
    });
  }
}
