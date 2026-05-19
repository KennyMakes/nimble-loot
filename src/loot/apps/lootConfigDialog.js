function nimbleLootConfigAttr(value) {
  return nimbleLootEscape(value).replace(/"/g, "&quot;");
}

function nimbleLootConfigChecked(value) {
  return value ? " checked" : "";
}

function nimbleLootConfigSelected(value, selected) {
  return String(value ?? "") === String(selected ?? "") ? " selected" : "";
}

function nimbleLootConfigHidden(value) {
  return value ? " hidden" : "";
}

function nimbleLootConfigOptions(options = [], selected = "") {
  return options.map((option) => {
    const value = typeof option === "object" ? option.value : option;
    const label = typeof option === "object" ? option.label : nimbleLootTitleCase(option);
    return `<option value="${nimbleLootConfigAttr(value)}"${nimbleLootConfigSelected(value, selected)}>${nimbleLootEscape(label)}</option>`;
  }).join("");
}

function nimbleLootConfigTypeOptions(types = [], selected = "") {
  return types.map((option) => `<option value="${nimbleLootConfigAttr(option.value)}"${nimbleLootConfigSelected(option.value, selected)}>${nimbleLootEscape(option.label)}</option>`).join("");
}

function nimbleLootRenderConfigItemRows(items = [], hasItems = false) {
  if (!hasItems) return `<p class="nimble-loot-muted">No items stored yet.</p>`;
  return items.map((item) => `
    <article class="nimble-loot-config-item-row nimble-loot-config-item-row-v2">
      <img src="${nimbleLootConfigAttr(item.img)}" alt="${nimbleLootConfigAttr(item.name)}">
      <strong>${nimbleLootEscape(item.name)}</strong>
      <label class="nimble-loot-qty-inline">Qty
        <input type="number" min="1" step="1" value="${nimbleLootConfigAttr(item.quantity)}" data-quantity-for="${nimbleLootConfigAttr(item.id)}">
      </label>
      <button type="button" title="Update quantity" aria-label="Update quantity" data-action="updateConfigItemQuantity" data-item-id="${nimbleLootConfigAttr(item.id)}"><i class="fas fa-check"></i></button>
      <button type="button" title="Delete item" aria-label="Delete item" class="nimble-loot-danger" data-action="deleteConfigItem" data-item-id="${nimbleLootConfigAttr(item.id)}"><i class="fas fa-trash"></i></button>
    </article>
  `).join("");
}

function nimbleLootRenderTrapConfig({ type, title, data, skills, trapStates, trapTables }) {
  const trap = data.config.traps[type];
  const status = data.state.trapStatus[type];
  const disarmSkill = data.config.access[`${type}DisarmSkill`];
  return `
    <section class="nimble-loot-tab-panel" data-tab-panel="${type}" data-container-only>
      <section class="nimble-loot-config-section" data-container-only>
        <h3>${nimbleLootEscape(title)}</h3>
        <div class="nimble-loot-trap-card nimble-loot-trap-card-full">
          <div class="nimble-loot-trap-toggles">
            <label><input type="checkbox" name="${type}TrapEnabled"${nimbleLootConfigChecked(trap.enabled)}> Enabled</label>
            <label><input type="checkbox" name="${type}TrapOneShot"${nimbleLootConfigChecked(trap.oneShot)}> Fires only once</label>
          </div>
          <div class="nimble-loot-trap-page-grid">
            <div class="nimble-loot-trigger-box">
              <div class="nimble-loot-mini-title">Trigger on:</div>
              <label><input type="checkbox" name="${type}TriggerOnFailedPick"${nimbleLootConfigChecked(trap.triggerOnFailedPick)}> failed pick</label>
              <label><input type="checkbox" name="${type}TriggerOnFailedDisarm"${nimbleLootConfigChecked(trap.triggerOnFailedDisarm)}> failed disarm</label>
              <label><input type="checkbox" name="${type}TriggerOnFailedForce"${nimbleLootConfigChecked(trap.triggerOnFailedForce)}> failed force</label>
              <label><input type="checkbox" name="${type}TriggerOnOpenIfArmed"${nimbleLootConfigChecked(trap.triggerOnOpenIfArmed)}> open if armed</label>
            </div>
            <div class="nimble-loot-trap-fields nimble-loot-trap-fields-grid">
              <label>Status
                <select name="${type}TrapStatus">${nimbleLootConfigOptions(trapStates, status)}</select>
              </label>
              <label>Detect DC <input type="number" name="${type}TrapDetectDc" value="${nimbleLootConfigAttr(trap.detectDc)}"></label>
              <label>Disarm Skill
                <select name="${type}DisarmSkill">${nimbleLootConfigOptions(skills, disarmSkill)}</select>
              </label>
              <label>Disarm DC <input type="number" name="${type}TrapDisarmDc" value="${nimbleLootConfigAttr(trap.disarmDc)}"></label>
              <label class="span-2">RollTable
                <select name="${type}TrapTableName">${nimbleLootConfigOptions(trapTables, trap.tableName)}</select>
              </label>
            </div>
          </div>
        </div>
      </section>
    </section>
  `;
}

function nimbleLootRenderConfigDialog(context) {
  const { data, currency, items, hasItems, isPile, types, skills, trapStates, trapTables, presets, maxPickAttempts, maxForceAttempts, maxInspectAttempts } = context;
  const isContainer = !isPile;
  return `
    <form class="nimble-loot-config-form nimble-loot-panel" autocomplete="off">
      <nav class="nimble-loot-config-tabs" aria-label="Nimble Loot configuration tabs">
        <div class="nimble-loot-config-tab-buttons">
          <button type="button" class="nimble-loot-tab-button active" data-tab-button="main">Setup</button>
          <button type="button" class="nimble-loot-tab-button" data-tab-button="contents">Contents</button>
          <button type="button" class="nimble-loot-tab-button" data-tab-button="mechanical" data-container-only${nimbleLootConfigHidden(isPile)}>Mechanical Trap</button>
          <button type="button" class="nimble-loot-tab-button" data-tab-button="magical" data-container-only${nimbleLootConfigHidden(isPile)}>Magical Trap</button>
        </div>
        <button type="button" class="nimble-loot-actor-sheet-button" data-action="openActorSheet"><i class="fas fa-user"></i> Open Actor Sheet</button>
      </nav>

      <div class="nimble-loot-config-scroll">
        <section class="nimble-loot-tab-panel active" data-tab-panel="main">
          <section class="nimble-loot-config-section nimble-loot-preset-section">
            <h3>Quick Configs</h3>
            <div class="nimble-loot-grid three">
              <label>Apply Quick Config
                <select name="presetSelect">${nimbleLootConfigOptions(presets, "")}</select>
              </label>
              <label>Save Current As
                <input type="text" name="presetName" placeholder="Quick config name">
              </label>
              <div class="nimble-loot-inline-actions">
                <button type="button" data-action="applyPreset">Apply</button>
                <button type="button" data-action="savePreset">Save</button>
                <button type="button" class="nimble-loot-danger" data-action="deletePreset">Delete</button>
              </div>
            </div>
          </section>

          <section class="nimble-loot-config-section nimble-loot-identity-layout">
            <h3>Identity</h3>
            <div class="nimble-loot-identity-grid nimble-loot-identity-grid-v3">
              <label class="identity-name">Display Name
                <input type="text" name="label" value="${nimbleLootConfigAttr(data.config.label)}" placeholder="Use token name if blank">
              </label>
              <label class="identity-description">Description
                <textarea name="description" rows="3">${nimbleLootEscape(data.config.description)}</textarea>
              </label>
              <label class="identity-type">Loot Type
                <select name="type">${nimbleLootConfigTypeOptions(types, data.type)}</select>
              </label>
              <div class="identity-grid-options" data-grid-only${nimbleLootConfigHidden(data.type !== NIMBLE_LOOT_TYPES.CONTAINER_GRID)}>
                <label>Grid Rows
                  <input type="number" name="gridRows" value="${nimbleLootConfigAttr(data.config.grid.rows)}" min="1" max="10" step="1">
                </label>
                <label>Grid Columns
                  <input type="number" name="gridColumns" value="${nimbleLootConfigAttr(data.config.grid.columns)}" min="1" max="10" step="1">
                </label>
              </div>
              <div class="identity-toggles nimble-loot-toggle-row">
                <label><input type="checkbox" name="opened"${nimbleLootConfigChecked(data.state.opened)}> Opened</label>
                <label><input type="checkbox" name="locked"${nimbleLootConfigChecked(data.config.access.locked)}> Locked</label>
                <label><input type="checkbox" name="jammed"${nimbleLootConfigChecked(data.state.jammed)}> Jammed</label>
                <label><input type="checkbox" name="highlightEnabled"${nimbleLootConfigChecked(data.config.highlight.enabled)}> Border Highlight</label>
              </div>
            </div>
          </section>

          <section class="nimble-loot-config-section nimble-loot-access-layout" data-container-only${nimbleLootConfigHidden(!isContainer)}>
            <h3>Access</h3>
            <div class="nimble-loot-access-grid nimble-loot-access-grid-v4">
              <label class="access-inspect-skill">Inspect Skill
                <select name="inspectSkill">${nimbleLootConfigOptions(skills, data.config.access.inspectSkill)}</select>
              </label>
              <label class="access-force-skill">Force Skill
                <select name="forceSkill">${nimbleLootConfigOptions(skills, data.config.access.forceSkill)}</select>
              </label>
              <label class="access-pick-skill">Pick Skill
                <select name="pickSkill">${nimbleLootConfigOptions(skills, data.config.access.pickSkill)}</select>
              </label>

              <label class="access-max-inspect">Max Inspect Attempts
                <input type="number" name="maxInspectAttempts" value="${nimbleLootConfigAttr(maxInspectAttempts)}" min="0" max="99" placeholder="blank = infinite, 0 = disabled">
              </label>
              <label class="access-force-dc">Force DC
                <input type="number" name="forceDc" value="${nimbleLootConfigAttr(data.config.access.forceDc)}" min="1" max="40">
              </label>
              <label class="access-pick-dc">Pick DC
                <input type="number" name="pickDc" value="${nimbleLootConfigAttr(data.config.access.pickDc)}" min="1" max="40">
              </label>

              <label class="access-key-code">Key Code
                <input type="text" name="keyCode" value="${nimbleLootConfigAttr(data.config.access.keyCode)}" placeholder="Blank = no key/code option">
              </label>
              <label class="access-max-force">Max Force Attempts
                <input type="number" name="maxForceAttempts" value="${nimbleLootConfigAttr(maxForceAttempts)}" min="0" max="99" placeholder="blank = infinite, 0 = disabled">
              </label>
              <label class="access-max-pick">Max Pick Attempts
                <input type="number" name="maxPickAttempts" value="${nimbleLootConfigAttr(maxPickAttempts)}" min="0" max="99" placeholder="blank = infinite, 0 = disabled">
              </label>
            </div>
          </section>
        </section>

        <section class="nimble-loot-tab-panel" data-tab-panel="contents">
          <section class="nimble-loot-config-section">
            <h3>Contents</h3>
            <div class="nimble-loot-grid three nimble-loot-currency-edit">
              <label>Gold Pieces
                <input type="number" name="currencyGp" value="${nimbleLootConfigAttr(currency.gp)}" min="0" step="1">
              </label>
              <label>Silver Pieces
                <input type="number" name="currencySp" value="${nimbleLootConfigAttr(currency.sp)}" min="0" step="1">
              </label>
              <label>Copper Pieces
                <input type="number" name="currencyCp" value="${nimbleLootConfigAttr(currency.cp)}" min="0" step="1">
              </label>
            </div>

            <div class="nimble-loot-config-items" data-drop-zone="items">
              <div class="nimble-loot-drop-hint">Drag Nimble object items here to add them to this loot token.</div>
              ${nimbleLootRenderConfigItemRows(items, hasItems)}
            </div>
          </section>
        </section>

        ${nimbleLootRenderTrapConfig({ type: "mechanical", title: "Mechanical Trap", data, skills, trapStates, trapTables })}
        ${nimbleLootRenderTrapConfig({ type: "magical", title: "Magical Trap", data, skills, trapStates, trapTables })}
      </div>

      <footer class="nimble-loot-footer nimble-loot-footer--split">
        <div class="nimble-loot-footer-left">
          <button type="button" data-action="showPlayerDialog"><i class="fas fa-eye"></i> Show Player Dialog</button>
          <button type="button" data-action="clearStates"><i class="fas fa-eraser"></i> Clear States</button>
        </div>
        <div class="nimble-loot-footer-right">
          <span class="nimble-loot-save-status" data-save-status>No changes</span>
          <button type="button" data-action="saveConfig" class="nimble-loot-primary"><i class="fas fa-save"></i> Save Configuration</button>
        </div>
      </footer>
    </form>
  `;
}

function NimbleLootSvelteConfigComponent({ target, props }) {
  const root = document.createElement("section");
  root.className = "nimble-loot-svelte-config-root";
  target.appendChild(root);

  const render = (nextProps = props) => {
    props = nextProps;
    root.innerHTML = nimbleLootRenderConfigDialog(props ?? {});
  };

  render(props);

  return {
    update: render,
    destroy: () => root.remove()
  };
}

class NimbleLootConfigDialog extends NimbleLootSvelteApplicationMixin(NimbleLootApplicationBase) {
  static DEFAULT_OPTIONS = foundry.utils.mergeObject(foundry.utils.deepClone(super.DEFAULT_OPTIONS), {
    id: "nimble-loot-config-dialog",
    tag: "section",
    classes: ["nimble-loot-app", "nimble-loot-config"],
    position: { width: 1040, height: 820 },
    form: { closeOnSubmit: false, submitOnChange: false },
    window: {
      title: "Configure Nimble Loot",
      icon: "fas fa-toolbox",
      resizable: true,
      contentClasses: ["standard-form", "nimble-loot-config-window"]
    }
  });

  static PARTS = {};

  constructor({ token } = {}, options = {}) {
    const savedPosition = NimbleLootConfigDialog._getSavedPosition();
    const mergedOptions = foundry.utils.mergeObject(options ?? {}, savedPosition ? { position: savedPosition } : {}, {
      inplace: false,
      insertKeys: true,
      insertValues: true,
      overwrite: false,
      recursive: true
    });
    super(mergedOptions);
    this.root = NimbleLootSvelteConfigComponent;
    this.token = token;
    this._activeTab = "main";
    this._scrollTop = 0;
  }

  static _getPositionStorageKey() {
    return `${NIMBLE_LOOT_MODULE_ID}.configDialogPosition`;
  }

  static _getSavedPosition() {
    try {
      const raw = globalThis.localStorage?.getItem?.(NimbleLootConfigDialog._getPositionStorageKey());
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const width = Number(parsed?.width);
      const height = Number(parsed?.height);
      if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
      return {
        width: Math.max(680, Math.floor(width)),
        height: Math.max(540, Math.floor(height))
      };
    } catch (_error) {
      return null;
    }
  }

  _savePositionState() {
    try {
      const position = this.position ?? {};
      const width = Math.floor(Number(position.width) || 0);
      const height = Math.floor(Number(position.height) || 0);
      if (width && height) {
        globalThis.localStorage?.setItem?.(NimbleLootConfigDialog._getPositionStorageKey(), JSON.stringify({ width, height }));
      }
    } catch (_error) {
      // Non-critical UI preference only.
    }
  }

  async close(options = {}) {
    this._savePositionState();
    return super.close(options);
  }

  get title() {
    return `Configure: ${nimbleLootGetDisplayName(this.token, nimbleLootGetData(this.token))}`;
  }

  async _prepareContext(options) {
    const data = nimbleLootGetData(this.token) ?? nimbleLootCreateDefaultData();
    const currency = nimbleLootGetLootCurrency(data);
    const items = nimbleLootGetLootActor(this.token)?.items?.filter((item) => nimbleLootIsLootItem(item)).map((item) => ({
      id: item.id,
      name: item.name,
      img: nimbleLootGetItemImage(item),
      quantity: nimbleLootGetItemQuantity(item)
    })) ?? [];
    const isPile = data.type === NIMBLE_LOOT_TYPES.PILE;
    const presets = this._getPresetOptions();
    const trapTables = this._getTrapTableOptions();

    const context = {
      tokenName: nimbleLootTokenDocument(this.token)?.name ?? "Selected Token",
      data,
      currency,
      items,
      hasItems: items.length > 0,
      isPile,
      isContainer: !isPile,
      types: NIMBLE_LOOT_CONFIG_TYPES.map((value) => ({ value, label: NIMBLE_LOOT_TYPE_LABELS[value], selected: data.type === value })),
      skills: NIMBLE_LOOT_SKILLS.map((value) => ({ value, label: nimbleLootTitleCase(value) })),
      trapStates: Object.values(NIMBLE_LOOT_TRAP_STATES).map((value) => ({ value, label: nimbleLootTitleCase(value) })),
      trapTables,
      presets,
      statusLabel: nimbleLootStatusLabel(data),
      trapLabel: nimbleLootGetTrapDisplayLabel(data),
      maxPickAttempts: data.config.access.maxPickAttempts ?? "",
      maxForceAttempts: data.config.access.maxForceAttempts ?? "",
      maxInspectAttempts: data.config.access.maxInspectAttempts ?? "",
      maxDisarmAttempts: data.config.access.maxDisarmAttempts ?? ""
    };
    return context;
  }

  _getFormElement() {
    const root = this.element;
    if (!root) return null;
    if (root instanceof HTMLFormElement) return root;
    const form = root.querySelector?.("form");
    if (form) return form;
    if (root.querySelector?.('[name="type"]')) return root;
    return null;
  }

  _getTrapTableOptions() {
    const setting = String(nimbleLootSetting("trapRollTableFolder") ?? "").trim();
    let tables = Array.from(game.tables ?? []);
    if (setting) {
      tables = tables.filter((table) => {
        const folder = table.folder;
        return folder?.id === setting || folder?.name === setting || table.folder?.name === setting;
      });
    }
    return [
      { value: "", label: "None" },
      ...tables.sort((a, b) => a.name.localeCompare(b.name)).map((table) => ({ value: table.name, label: table.name }))
    ];
  }

  _getSavedPresets() {
    const presets = nimbleLootSetting("savedPresets");
    return presets && typeof presets === "object" ? foundry.utils.deepClone(presets) : {};
  }

  _getDeletedBuiltInPresets() {
    const deleted = nimbleLootSetting("deletedBuiltInPresets");
    return deleted && typeof deleted === "object" ? foundry.utils.deepClone(deleted) : {};
  }

  _getPresetOptions() {
    const saved = this._getSavedPresets();
    const deletedBuiltIns = this._getDeletedBuiltInPresets();
    const builtIns = Object.entries(NIMBLE_LOOT_PRESETS)
      .filter(([id]) => deletedBuiltIns[id] !== true)
      .map(([id, preset]) => ({ value: `builtin:${id}`, label: preset.label }));
    const custom = Object.entries(saved).map(([id, preset]) => ({ value: `custom:${id}`, label: preset.label ?? id }));
    return [{ value: "", label: "Choose quick config..." }, ...builtIns, ...custom];
  }

  _resolvePreset(value) {
    const selected = String(value ?? "").trim();
    if (!selected) return null;
    const [kind, id] = selected.split(":");
    if (kind === "builtin") return NIMBLE_LOOT_PRESETS[id] ?? null;
    if (kind === "custom") return this._getSavedPresets()[id] ?? null;
    return null;
  }

  _onRender(context, options) {
    super._onRender(context, options);
    const root = this.element;
    if (!root) return;
    const form = this._getFormElement();

    if (form instanceof HTMLFormElement) form.addEventListener("submit", (event) => this._onSubmit(event));
    form?.addEventListener("change", () => this._setSaveState("dirty"));
    form?.addEventListener("input", () => this._setSaveState("dirty"));

    const scroll = this._getScrollElement();
    if (scroll) {
      scroll.scrollTop = this._scrollTop ?? 0;
      scroll.addEventListener("scroll", () => {
        this._scrollTop = scroll.scrollTop;
      });
    }

    const updateTypeVisibility = () => {
      const type = root.querySelector('[name="type"]')?.value;
      const isPile = type === NIMBLE_LOOT_TYPES.PILE;
      root.querySelectorAll("[data-container-only]").forEach((section) => {
        section.hidden = isPile;
      });
      root.querySelectorAll("[data-grid-only]").forEach((section) => {
        section.hidden = type !== NIMBLE_LOOT_TYPES.CONTAINER_GRID;
      });
      if (isPile && ["mechanical", "magical"].includes(this._activeTab)) this._activeTab = "main";
      this._applyActiveTab();
    };
    root.querySelector('[name="type"]')?.addEventListener("change", updateTypeVisibility);
    updateTypeVisibility();

    root.querySelectorAll("[data-tab-button]").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        this._activeTab = button.dataset.tabButton || "main";
        this._applyActiveTab();
      });
    });
    this._applyActiveTab();

    const dropZone = root.querySelector("[data-drop-zone='items']");
    if (dropZone) {
      dropZone.addEventListener("dragover", (event) => event.preventDefault());
      dropZone.addEventListener("drop", (event) => this._onDropItem(event));
    }

    root.querySelectorAll("[data-action]").forEach((element) => {
      element.addEventListener("click", (event) => this._handleAction(event));
    });

    this._setSaveState("clean");
  }

  _getScrollElement() {
    return this.element?.querySelector?.(".nimble-loot-config-scroll") ?? null;
  }

  _rememberScroll() {
    const scroll = this._getScrollElement();
    if (scroll) this._scrollTop = scroll.scrollTop;
  }

  async _renderPreservingView(options = { force: true }) {
    this._rememberScroll();
    await this.render(options);
  }

  _applyActiveTab() {
    const root = this.element;
    if (!root) return;
    const type = root.querySelector('[name="type"]')?.value;
    if (type === NIMBLE_LOOT_TYPES.PILE && ["mechanical", "magical"].includes(this._activeTab)) this._activeTab = "main";

    root.querySelectorAll("[data-tab-button]").forEach((button) => {
      const isActive = button.dataset.tabButton === this._activeTab;
      button.classList.toggle("active", isActive);
    });

    root.querySelectorAll("[data-tab-panel]").forEach((panel) => {
      const isActive = panel.dataset.tabPanel === this._activeTab;
      panel.classList.toggle("active", isActive);
      panel.hidden = !isActive;
    });
  }

  _setSaveState(state, message = "") {
    const root = this.element;
    if (!root) return;
    const status = root.querySelector("[data-save-status]");
    const button = root.querySelector('[data-action="saveConfig"]');
    if (!status || !button) return;

    if (state === "saving") {
      status.textContent = "Saving…";
      status.dataset.state = "saving";
      button.disabled = true;
      return;
    }

    button.disabled = false;

    if (state === "saved") {
      status.textContent = message || "Saved";
      status.dataset.state = "saved";
      return;
    }

    if (state === "dirty") {
      status.textContent = "Unsaved changes";
      status.dataset.state = "dirty";
      return;
    }

    status.textContent = "No changes";
    status.dataset.state = "clean";
  }

  _buildDataFromForm(form) {
    const type = nimbleLootValidateType(nimbleLootReadFormString(form, "type", NIMBLE_LOOT_TYPES.CONTAINER_LIST));
    const current = nimbleLootGetData(this.token);
    const typeChanged = current?.type !== type;
    const data = typeChanged ? nimbleLootCreateDefaultData(type) : (current ?? nimbleLootCreateDefaultData(type));
    const next = foundry.utils.mergeObject(nimbleLootCreateDefaultData(type), data, {
      inplace: false,
      insertKeys: true,
      insertValues: true,
      overwrite: true,
      recursive: true
    });

    next.type = type;
    next.config.label = nimbleLootReadFormString(form, "label");
    next.config.description = nimbleLootReadFormString(form, "description");
    next.config.contentsHiddenUntilOpen = type !== NIMBLE_LOOT_TYPES.PILE;

    // Discovery is now handled by Foundry token visibility; keep legacy state true for migrations.
    next.state.discovered = true;
    next.state.opened = nimbleLootReadFormBoolean(form, "opened");
    next.state.depleted = false;
    next.state.jammed = nimbleLootReadFormBoolean(form, "jammed");
    if (!next.config.grid || typeof next.config.grid !== "object") next.config.grid = { rows: 3, columns: 4 };
    next.config.grid.rows = nimbleLootReadFormNumber(form, "gridRows", 3);
    next.config.grid.columns = nimbleLootReadFormNumber(form, "gridColumns", 4);
    if (!next.config.highlight || typeof next.config.highlight !== "object") next.config.highlight = { enabled: false };
    next.config.highlight.enabled = nimbleLootReadFormBoolean(form, "highlightEnabled");

    const access = next.config.access;
    access.locked = nimbleLootReadFormBoolean(form, "locked");
    access.sealed = false;
    access.keyCode = nimbleLootReadFormString(form, "keyCode");
    access.pickSkill = nimbleLootReadFormString(form, "pickSkill", "finesse");
    access.forceSkill = nimbleLootReadFormString(form, "forceSkill", "might");
    access.inspectSkill = nimbleLootReadFormString(form, "inspectSkill", "examination");
    access.mechanicalDisarmSkill = nimbleLootReadFormString(form, "mechanicalDisarmSkill", "finesse");
    access.magicalDisarmSkill = nimbleLootReadFormString(form, "magicalDisarmSkill", "arcana");
    access.pickDc = nimbleLootReadFormNumber(form, "pickDc", 15);
    access.forceDc = nimbleLootReadFormNumber(form, "forceDc", 18);
    access.inspectDc = nimbleLootReadFormNumber(form, "inspectDc", 15);
    access.mechanicalDisarmDc = nimbleLootReadFormNumber(form, "mechanicalDisarmDc", 15);
    access.magicalDisarmDc = nimbleLootReadFormNumber(form, "magicalDisarmDc", 15);
    access.maxPickAttempts = nimbleLootReadFormNullableNumber(form, "maxPickAttempts", null);
    access.maxForceAttempts = nimbleLootReadFormNullableNumber(form, "maxForceAttempts", null);
    access.maxInspectAttempts = nimbleLootReadFormNullableNumber(form, "maxInspectAttempts", null);
    access.maxDisarmAttempts = null;
    access.jamOnFailedAttempts = true;
    access.allowOpen = true;
    access.allowInspect = nimbleLootAttemptsAllowed(access.maxInspectAttempts);
    access.allowPick = nimbleLootAttemptsAllowed(access.maxPickAttempts);
    access.allowForce = nimbleLootAttemptsAllowed(access.maxForceAttempts);
    access.allowDisarm = true;
    access.allowUseKeyCode = access.keyCode.length > 0;

    next.state.currency = {
      gp: nimbleLootReadFormNumber(form, "currencyGp", 0),
      sp: nimbleLootReadFormNumber(form, "currencySp", 0),
      cp: nimbleLootReadFormNumber(form, "currencyCp", 0)
    };

    for (const trapType of Object.values(NIMBLE_LOOT_TRAP_TYPES)) {
      const trap = next.config.traps[trapType];
      trap.enabled = nimbleLootReadFormBoolean(form, `${trapType}TrapEnabled`);
      trap.tier = "solid";
      trap.detectDc = nimbleLootReadFormNumber(form, `${trapType}TrapDetectDc`, 15);
      trap.disarmDc = nimbleLootReadFormNumber(form, `${trapType}TrapDisarmDc`, 15);
      trap.triggerOnFailedPick = nimbleLootReadFormBoolean(form, `${trapType}TriggerOnFailedPick`);
      trap.triggerOnFailedForce = nimbleLootReadFormBoolean(form, `${trapType}TriggerOnFailedForce`);
      trap.triggerOnFailedDisarm = nimbleLootReadFormBoolean(form, `${trapType}TriggerOnFailedDisarm`);
      trap.triggerOnOpenIfArmed = nimbleLootReadFormBoolean(form, `${trapType}TriggerOnOpenIfArmed`);
      trap.oneShot = nimbleLootReadFormBoolean(form, `${trapType}TrapOneShot`);
      trap.tableName = nimbleLootReadFormString(form, `${trapType}TrapTableName`);
      next.state.trapStatus[trapType] = nimbleLootReadFormString(form, `${trapType}TrapStatus`, "unknown");
    }

    return nimbleLootValidateData(next);
  }

  async _saveConfigFromForm(form) {
    form = form ?? this._getFormElement();
    if (!form) throw new Error("Configuration form was not found.");
    this._setSaveState("saving");
    const data = this._buildDataFromForm(form);
    await nimbleLootSetData(this.token, data);

    this._setSaveState("saved", "Saved");
    nimbleLootNotify("Nimble Loot configuration saved.");
    return data;
  }

  async _onSubmit(event) {
    // Do not save on implicit form submission or window close.
    // Only the explicit Save Configuration button is allowed to write token state.
    event.preventDefault();
    event.stopPropagation();
    this._setSaveState("dirty");
  }

  async _onDropItem(event) {
    event.preventDefault();
    try {
      const dropData = TextEditor.getDragEventData(event);
      const item = await nimbleLootResolveDroppedItem(dropData);
      if (!item) throw new Error("Dropped data did not resolve to an item.");
      if (!nimbleLootIsLootItem(item)) throw new Error("Only Nimble object items can be stored as loot.");
      const actor = nimbleLootGetLootActor(this.token);
      if (!actor) throw new Error("This loot token does not have an actor for item storage.");
      await nimbleLootAddItemToActor(actor, item, nimbleLootGetItemQuantity(item));
      nimbleLootNotify(`Added ${item.name} to loot.`);
      this._activeTab = "contents";
      await this._renderPreservingView({ force: true });
    } catch (error) {
      nimbleLootNotify(error.message ?? String(error), "error");
      nimbleLootError("Failed to add dropped item to loot", error);
    }
  }

  async _applyPreset(form) {
    const selected = nimbleLootReadFormString(form, "presetSelect");
    const preset = this._resolvePreset(selected);
    if (!preset?.data) throw new Error("Choose a quick config first.");
    const current = this._buildDataFromForm(form);
    const next = foundry.utils.mergeObject(current, foundry.utils.deepClone(preset.data), {
      inplace: false,
      insertKeys: true,
      insertValues: true,
      overwrite: true,
      recursive: true
    });
    next.config.label = current.config.label;
    next.config.description = current.config.description;
    next.state.currency = current.state.currency;
    await nimbleLootSetData(this.token, next);
    nimbleLootNotify(`Applied quick config: ${preset.label}`);
    await this._renderPreservingView({ force: true });
  }

  async _saveCurrentAsPreset(form) {
    const name = nimbleLootReadFormString(form, "presetName");
    if (!name) throw new Error("Enter a quick config name first.");
    const data = this._buildDataFromForm(form);
    const presetData = foundry.utils.deepClone(data);
    presetData.config.label = "";
    presetData.config.description = "";
    presetData.state.currency = { gp: 0, sp: 0, cp: 0 };
    presetData.state.openedBy = null;
    presetData.state.openedAt = null;
    presetData.state.lastInteractedBy = null;
    const saved = this._getSavedPresets();
    const id = name.slugify ? name.slugify({ strict: true }) : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    saved[id || foundry.utils.randomID()] = { label: name, data: presetData };
    await nimbleLootSetSetting("savedPresets", saved);
    nimbleLootNotify(`Saved quick config: ${name}`);
    await this._renderPreservingView({ force: true });
  }


  async _deleteSelectedPreset(form) {
    const selected = nimbleLootReadFormString(form, "presetSelect");
    const [kind, id] = String(selected || "").split(":");
    if (!kind || !id) throw new Error("Choose a quick config to delete.");

    let label = id;
    if (kind === "builtin") {
      const preset = NIMBLE_LOOT_PRESETS[id];
      if (!preset) throw new Error("That built-in quick config could not be found.");
      label = preset.label ?? id;
    } else if (kind === "custom") {
      const saved = this._getSavedPresets();
      if (!saved[id]) throw new Error("That saved quick config could not be found.");
      label = saved[id]?.label ?? id;
    } else {
      throw new Error("Choose a quick config to delete.");
    }

    const content = `<p>Delete the Nimble Loot quick config <strong>${foundry.utils.escapeHTML(label)}</strong>?</p>`;
    const DialogV2 = foundry.applications?.api?.DialogV2;
    const confirmed = DialogV2
      ? await DialogV2.confirm({
          window: { title: "Delete Quick Config" },
          content,
          yes: { label: "Delete" },
          no: { label: "Cancel" },
          modal: true,
          rejectClose: false
        })
      : await Dialog.confirm({
          title: "Delete Quick Config",
          content,
          yes: () => true,
          no: () => false,
          defaultYes: false
        });
    if (!confirmed) return;

    if (kind === "builtin") {
      const deleted = this._getDeletedBuiltInPresets();
      deleted[id] = true;
      await nimbleLootSetSetting("deletedBuiltInPresets", deleted);
    } else {
      const saved = this._getSavedPresets();
      delete saved[id];
      await nimbleLootSetSetting("savedPresets", saved);
    }

    nimbleLootNotify(`Deleted quick config: ${label}`);
    await this._renderPreservingView({ force: true });
  }



  async _clearRuntimeState() {
    const data = nimbleLootGetData(this.token);
    if (!data) throw new Error("This token is not configured as Nimble Loot.");
    const next = foundry.utils.deepClone(data);
    const isPile = next.type === NIMBLE_LOOT_TYPES.PILE;
    next.state.opened = isPile;
    next.state.depleted = false;
    next.state.jammed = false;
    next.state.pickAttempts = 0;
    next.state.forceAttempts = 0;
    next.state.inspectAttempts = 0;
    next.state.disarmAttempts = 0;
    next.state.carefulOpenAttempted = false;
    next.state.trapStatus = {
      mechanical: NIMBLE_LOOT_TRAP_STATES.UNKNOWN,
      magical: NIMBLE_LOOT_TRAP_STATES.UNKNOWN
    };
    next.state.playerLog = { inspection: [], opening: [] };
    next.state.openedBy = null;
    next.state.openedAt = null;
    next.state.lastInteractedBy = null;
    next.state.activityLog = [];
    await nimbleLootSetData(this.token, next);
    nimbleLootNotify("Nimble Loot states cleared.");
    await this._renderPreservingView({ force: true });
  }

  async _handleAction(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button.dataset.action;
    button.disabled = true;
    try {
      const form = this._getFormElement();
      if (action === "saveConfig") {
        await this._saveConfigFromForm(form);
        return;
      }
      if (action === "applyPreset") {
        await this._applyPreset(form);
        return;
      }
      if (action === "savePreset") {
        await this._saveCurrentAsPreset(form);
        return;
      }
      if (action === "deletePreset") {
        await this._deleteSelectedPreset(form);
        return;
      }
      if (action === "clearStates") {
        await this._clearRuntimeState();
        return;
      }
      if (action === "deleteConfigItem") {
        const actor = nimbleLootGetLootActor(this.token);
        const item = actor?.items?.get(button.dataset.itemId);
        if (item) await item.delete();
        nimbleLootNotify("Loot item deleted.");
        this._activeTab = "contents";
        await this._renderPreservingView({ force: true });
        return;
      }
      if (action === "updateConfigItemQuantity") {
        const actor = nimbleLootGetLootActor(this.token);
        const item = actor?.items?.get(button.dataset.itemId);
        const input = this.element?.querySelector?.(`[data-quantity-for="${nimbleLootCssEscape(button.dataset.itemId)}"]`);
        const quantity = Math.max(1, Math.floor(Number(input?.value ?? 1) || 1));
        if (item) await item.update({ [NIMBLE_LOOT_ITEM_QUANTITY_PATH]: quantity });
        nimbleLootNotify("Loot item quantity updated.");
        this._activeTab = "contents";
        await this._renderPreservingView({ force: true });
        return;
      }

      if (action === "showPlayerDialog") {
        new NimbleLootDialog({ token: this.token, actor: nimbleLootResolveActorForUser(game.user) }).render({ force: true });
        return;
      }

      if (action === "openActorSheet") {
        const actor = nimbleLootGetLootActor(this.token);
        if (!actor) throw new Error("This loot token does not have an actor sheet to open.");
        nimbleLootAllowActorSheetForToken(this.token, 2500);
        actor.sheet?.render?.(true);
        return;
      }

      if (action === "deleteLootData") {
        await nimbleLootClearData(this.token);
        nimbleLootNotify("Nimble Loot data removed from token.");
        await this.close();
        return;
      }
    } catch (error) {
      nimbleLootNotify(error.message ?? String(error), "error");
      nimbleLootError("Config action failed", error);
    } finally {
      button.disabled = false;
    }
  }
}
