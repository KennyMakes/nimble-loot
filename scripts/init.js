// === Nimble Loot: constants ===
const NIMBLE_LOOT_MODULE_ID = "nimble-loot";
const NIMBLE_LOOT_SYSTEM_ID = "nimble";
const NIMBLE_LOOT_FLAG_KEY = "loot";
const NIMBLE_LOOT_FLAG_PATH = `flags.${NIMBLE_LOOT_MODULE_ID}.${NIMBLE_LOOT_FLAG_KEY}`;
const NIMBLE_LOOT_SCHEMA_VERSION = 1;

const NIMBLE_LOOT_TYPES = Object.freeze({
  PILE: "pile",
  CONTAINER_LIST: "container-list",
  CONTAINER_GRID: "container-grid",

  // Legacy profile names kept only so old v0.1.x tokens migrate cleanly.
  CONTAINER: "container",
  STRONGBOX: "strongbox",
  VAULT: "vault"
});

const NIMBLE_LOOT_CONFIG_TYPES = Object.freeze([
  NIMBLE_LOOT_TYPES.PILE,
  NIMBLE_LOOT_TYPES.CONTAINER_LIST,
  NIMBLE_LOOT_TYPES.CONTAINER_GRID
]);

const NIMBLE_LOOT_CONTAINER_TYPES = Object.freeze([
  NIMBLE_LOOT_TYPES.CONTAINER_LIST,
  NIMBLE_LOOT_TYPES.CONTAINER_GRID,
  NIMBLE_LOOT_TYPES.CONTAINER,
  NIMBLE_LOOT_TYPES.STRONGBOX,
  NIMBLE_LOOT_TYPES.VAULT
]);

const NIMBLE_LOOT_TYPE_LABELS = Object.freeze({
  "pile": "Loot Pile",
  "container-list": "Container - List",
  "container-grid": "Container - Grid",
  "container": "Container - List",
  "strongbox": "Container - List",
  "vault": "Container - List"
});

const NIMBLE_LOOT_TRAP_STATES = Object.freeze({
  UNKNOWN: "unknown",
  CLEAR: "clear",
  DETECTED: "detected",
  DISARMED: "disarmed",
  TRIGGERED: "triggered"
});

const NIMBLE_LOOT_TRAP_TYPES = Object.freeze({
  MECHANICAL: "mechanical",
  MAGICAL: "magical"
});

const NIMBLE_LOOT_SKILLS = Object.freeze([
  "arcana",
  "examination",
  "finesse",
  "influence",
  "insight",
  "lore",
  "might",
  "naturecraft",
  "perception",
  "stealth"
]);

const NIMBLE_LOOT_CURRENCY_KEYS = Object.freeze(["gp", "sp", "cp"]);
// Nimble player character sheets store currency as value objects.
// Nimble NPC/loot actors do not expose currency, so loot currency lives on token flags.
// Actor currency writes must use the .value paths used by Nimble Shop.
const NIMBLE_LOOT_CURRENCY_PATHS = Object.freeze({
  gp: "system.currency.gp.value",
  sp: "system.currency.sp.value",
  cp: "system.currency.cp.value"
});

// Read .value first for player characters, then tolerate direct numeric paths
// for older/alternate shapes without writing to those shapes.
const NIMBLE_LOOT_CURRENCY_FALLBACK_PATHS = Object.freeze({
  gp: ["system.currency.gp.value", "system.currency.gp"],
  sp: ["system.currency.sp.value", "system.currency.sp"],
  cp: ["system.currency.cp.value", "system.currency.cp"]
});

const NIMBLE_LOOT_ITEM_QUANTITY_PATH = "system.quantity";
const NIMBLE_LOOT_ALLOWED_ITEM_TYPES = Object.freeze(["object"]);
const NIMBLE_LOOT_SOCKET_NAME = `module.${NIMBLE_LOOT_MODULE_ID}`;
const NIMBLE_LOOT_BASE_ACTOR_FLAG = "baseLootActor";
const NIMBLE_LOOT_BASE_ACTOR_NAME = "Nimble Loot Actor";

const NIMBLE_LOOT_PRESETS = Object.freeze({
  "loot-pile": {
    label: "Loot Pile",
    data: {
      type: "pile",
      config: { contentsHiddenUntilOpen: false, access: { locked: false, maxPickAttempts: 0, maxForceAttempts: 0, maxDisarmAttempts: 0 } },
      state: { discovered: true, opened: true, depleted: false, jammed: false }
    }
  },
  "open-container-list": {
    label: "Open Container - List",
    data: {
      type: "container-list",
      config: { contentsHiddenUntilOpen: false, access: { locked: false, maxPickAttempts: 0, maxForceAttempts: null, maxDisarmAttempts: 0 } },
      state: { discovered: true, opened: true, depleted: false, jammed: false }
    }
  },
  "closed-container-list": {
    label: "Closed Container - List",
    data: {
      type: "container-list",
      config: { contentsHiddenUntilOpen: true, access: { locked: false, maxPickAttempts: 0, maxForceAttempts: null, maxDisarmAttempts: 0 } },
      state: { discovered: true, opened: false, depleted: false, jammed: false }
    }
  },
  "locked-container-list": {
    label: "Locked Container - List",
    data: {
      type: "container-list",
      config: { contentsHiddenUntilOpen: true, access: { locked: true, maxPickAttempts: 3, maxForceAttempts: 3, maxDisarmAttempts: 0 } },
      state: { discovered: true, opened: false, depleted: false, jammed: false }
    }
  },
  "trapped-container-list": {
    label: "Trapped Container - List",
    data: {
      type: "container-list",
      config: {
        contentsHiddenUntilOpen: true,
        access: { locked: true, maxPickAttempts: 3, maxForceAttempts: 3, maxDisarmAttempts: 3 },
        traps: { mechanical: { enabled: true, triggerOnFailedPick: true, triggerOnFailedForce: true, triggerOnFailedDisarm: true } }
      },
      state: { discovered: true, opened: false, depleted: false, jammed: false }
    }
  },
  "closed-container-grid": {
    label: "Closed Container - Grid",
    data: {
      type: "container-grid",
      config: { contentsHiddenUntilOpen: true, access: { locked: false, maxPickAttempts: 0, maxForceAttempts: null, maxDisarmAttempts: 0 } },
      state: { discovered: true, opened: false, depleted: false, jammed: false }
    }
  }
});

const NIMBLE_LOOT_SOCKET_ACTIONS = Object.freeze({
  TRANSFER_ITEM: "transferItem",
  DEPOSIT_ITEM: "depositItem",
  TRANSFER_CURRENCY: "transferCurrency",
  LEAVE_CURRENCY: "leaveCurrency",
  SPLIT_CURRENCY: "splitCurrency",
  TAKE_ALL: "takeAll",
  UPDATE_STATE: "updateState",
  UPDATE_CONFIG: "updateConfig",
  INSPECT: "inspect",
  PICK_LOCK: "pickLock",
  FORCE_OPEN: "forceOpen",
  OPEN: "open",
  CAREFUL_OPEN: "carefulOpen",
  USE_KEY_CODE: "useKeyCode",
  DISARM_TRAP: "disarmTrap",
  TRIGGER_TRAP: "triggerTrap",
  CREATE_PILE_FROM_ITEM: "createPileFromItem",
  CREATE_PILE_FROM_CONTAINER_ITEM: "createPileFromContainerItem",
  MOVE_GRID_ITEM: "moveGridItem"
});

// === Nimble Loot: logger ===
function nimbleLootPrefix(message) {
  return `Nimble Loot | ${message}`;
}

function nimbleLootDebugEnabled() {
  try {
    return game.settings?.get?.(NIMBLE_LOOT_MODULE_ID, "debug") === true;
  } catch (_error) {
    return false;
  }
}

function nimbleLootLog(...args) {
  console.log(nimbleLootPrefix(args.shift() ?? ""), ...args);
}

function nimbleLootDebug(...args) {
  if (!nimbleLootDebugEnabled()) return;
  console.debug(nimbleLootPrefix(args.shift() ?? ""), ...args);
}

function nimbleLootWarn(...args) {
  console.warn(nimbleLootPrefix(args.shift() ?? ""), ...args);
}

function nimbleLootError(...args) {
  console.error(nimbleLootPrefix(args.shift() ?? ""), ...args);
}

function nimbleLootNotify(message, level = "info") {
  const text = String(message ?? "").trim();
  if (!text) return;
  const notifications = ui?.notifications;
  if (level === "error") notifications?.error?.(text);
  else if (level === "warn" || level === "warning") notifications?.warn?.(text);
  else notifications?.info?.(text);
}

function nimbleLootNotifyResult(result) {
  if (!result) return;
  if (result.ok === false) nimbleLootNotify(result.error || result.message || "Nimble Loot action failed.", "warn");
  else if (result.message) nimbleLootNotify(result.message, "info");
}

// === Nimble Loot: settings ===
function registerNimbleLootSettings() {
  game.settings.register(NIMBLE_LOOT_MODULE_ID, "debug", {
    name: "Debug Logging",
    hint: "Log extra Nimble Loot debugging information to the console.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "requireControlledActor", {
    name: "Require Controlled Actor",
    hint: "Players must have a controlled or assigned hero before taking loot.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "allowPlayersToForceOpen", {
    name: "Allow Players to Force Open",
    hint: "Allow player-facing dialogs to show Force Open when the container supports it.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });


  game.settings.register(NIMBLE_LOOT_MODULE_ID, "limitInteractionDistance", {
    name: "Limit Token Interaction Distance",
    hint: "When enabled, non-GM users must have their hero token within the configured number of spaces to open or interact with Nimble Loot tokens.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "interactionDistanceSpaces", {
    name: "Interaction Distance in Spaces",
    hint: "Maximum number of grid spaces a hero token can be from a Nimble Loot token when interaction distance is limited.",
    scope: "world",
    config: true,
    type: Number,
    default: 1
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "postRoutineLootReceiptsToChat", {
    name: "Post Routine Loot Receipts to Chat",
    hint: "When enabled, taking loot posts a small chat receipt. Rolls and traps still post even when this is off.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });



  game.settings.register(NIMBLE_LOOT_MODULE_ID, "tokenActivationMode", {
    name: "Loot Token Interaction",
    hint: "Choose how canvas loot tokens open their Nimble Loot dialog. Shift-click bypass remains available unless Shift-click is the selected activation mode.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "single-click": "Single left-click opens loot",
      "right-click": "Single right-click opens loot",
      "any-click": "Any click / tap opens loot",
      "double-click": "Double left-click opens loot",
      "shift-click": "Shift + left-click opens loot",
      "disabled": "Disabled - no canvas activation"
    },
    default: "single-click"
  });


  game.settings.register(NIMBLE_LOOT_MODULE_ID, "clientTokenActivationMode", {
    name: "My Loot Token Interaction",
    hint: "Per-user override for opening Nimble Loot tokens. Choose 'Use GM/global setting' to follow the world default.",
    scope: "client",
    config: true,
    type: String,
    choices: {
      "world": "Use GM/global setting",
      "single-click": "Single left-click opens loot",
      "right-click": "Single right-click opens loot",
      "any-click": "Any click / tap opens loot",
      "double-click": "Double left-click opens loot",
      "shift-click": "Shift + left-click opens loot",
      "disabled": "Disabled - no canvas activation"
    },
    default: "world"
  });



  game.settings.register(NIMBLE_LOOT_MODULE_ID, "suppressLootActorSheetOnDoubleClick", {
    name: "Suppress Loot Actor Sheet on Double-Click",
    hint: "When enabled, double-clicking a configured Nimble Loot token will not open the underlying Nimble NPC actor sheet. This is useful when loot dialogs are opened by single click, shift-click, or right-click instead.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "enableItemDropToPile", {
    name: "Create Loot Pile When Item Is Dropped on Canvas",
    hint: "When the GM drops a Nimble object item onto the canvas, create a small loot pile token containing that item.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "trapRollTableFolder", {
    name: "Trap RollTable Folder",
    hint: "Optional folder name or folder ID containing the trap RollTables shown in Nimble Loot trap dropdowns. Leave blank to show all RollTables.",
    scope: "world",
    config: true,
    type: String,
    default: ""
  });



  game.settings.register(NIMBLE_LOOT_MODULE_ID, "defaultTokenDisplayName", {
    name: "Default Token Name Display",
    hint: "Default Foundry token name display mode for new Nimble Loot tokens created by item drops.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "0": "Never Displayed",
      "10": "When Controlled",
      "20": "Hovered by Anyone",
      "30": "Hovered by Owner",
      "40": "Always for Owner",
      "50": "Always for Everyone"
    },
    default: "20"
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "defaultTokenDisposition", {
    name: "Default Token Disposition",
    hint: "Default disposition for new Nimble Loot tokens created by item drops.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "-1": "Hostile",
      "0": "Neutral",
      "1": "Friendly"
    },
    default: "0"
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "enableTokenBorder", {
    name: "Enable Loot Token Border",
    hint: "Adds a lightweight animated border to configured Nimble Loot tokens that have border highlighting enabled.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "tokenBorderFadeDuration", {
    name: "Loot Border Fade Duration",
    hint: "Seconds for the Nimble Loot border to fade from fully visible to invisible before looping.",
    scope: "world",
    config: true,
    type: Number,
    default: 2
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "savedPresets", {
    name: "Saved Nimble Loot Quick Configs",
    hint: "Internal storage for Nimble Loot quick configuration presets.",
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "deletedBuiltInPresets", {
    name: "Deleted Built-In Nimble Loot Quick Configs",
    hint: "Internal storage for built-in quick configs the GM has chosen to hide/delete.",
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });
}

function nimbleLootSetting(key) {
  try {
    return game.settings.get(NIMBLE_LOOT_MODULE_ID, key);
  } catch (_error) {
    return undefined;
  }
}

async function nimbleLootSetSetting(key, value) {
  return game.settings.set(NIMBLE_LOOT_MODULE_ID, key, value);
}

// === Nimble Loot: defaults ===
const NIMBLE_LOOT_DEFAULT_DATA = Object.freeze({
  version: NIMBLE_LOOT_SCHEMA_VERSION,
  type: NIMBLE_LOOT_TYPES.CONTAINER_LIST,
  config: {
    enabled: true,
    label: "",
    description: "",
    contentsHiddenUntilOpen: true,
    access: {
      locked: false,
      sealed: false,
      keyCode: "",
      pickSkill: "finesse",
      forceSkill: "might",
      inspectSkill: "examination",
      mechanicalDisarmSkill: "finesse",
      magicalDisarmSkill: "arcana",
      pickDc: 15,
      forceDc: 18,
      inspectDc: 15,
      mechanicalDisarmDc: 15,
      magicalDisarmDc: 15,
      maxPickAttempts: 3,
      maxForceAttempts: 3,
      maxInspectAttempts: null,
      maxDisarmAttempts: null,
      jamOnFailedAttempts: true,
      allowOpen: true,
      allowInspect: true,
      allowPick: true,
      allowForce: true,
      allowDisarm: true,
      allowUseKeyCode: false
    },
    tools: {
      lockPickItemName: "Lock Pick",
      lockPickBonus: 2,
      consumeOnFailedPick: true
    },
    traps: {
      mechanical: {
        enabled: false,
        tier: "solid",
        detectDc: 15,
        disarmDc: 15,
        triggerOnFailedPick: true,
        triggerOnFailedForce: true,
        triggerOnFailedDisarm: true,
        triggerOnOpenIfArmed: false,
        oneShot: true,
        tableName: ""
      },
      magical: {
        enabled: false,
        tier: "solid",
        detectDc: 15,
        disarmDc: 15,
        triggerOnFailedPick: true,
        triggerOnFailedForce: true,
        triggerOnFailedDisarm: true,
        triggerOnOpenIfArmed: false,
        oneShot: true,
        tableName: ""
      }
    },
    permissions: {
      playersCanOpen: true,
      playersCanTake: true,
      requireActor: true
    },
    grid: {
      rows: 3,
      columns: 4
    },
    highlight: {
      enabled: false
    }
  },
  state: {
    discovered: true,
    opened: false,
    depleted: false,
    jammed: false,
    pickAttempts: 0,
    forceAttempts: 0,
    inspectAttempts: 0,
    disarmAttempts: 0,
    carefulOpenAttempted: false,
    currency: {
      gp: 0,
      sp: 0,
      cp: 0
    },
    trapStatus: {
      mechanical: "unknown",
      magical: "unknown"
    },
    playerLog: {
      inspection: [],
      opening: []
    },
    gridSlots: {},
    openedBy: null,
    openedAt: null,
    lastInteractedBy: null,
    activityLog: []
  }
});

function nimbleLootDeepClone(value) {
  return foundry.utils.deepClone(value);
}

function nimbleLootNormalizeTypeForDefaults(type) {
  if (type === NIMBLE_LOOT_TYPES.PILE) return NIMBLE_LOOT_TYPES.PILE;
  if (type === NIMBLE_LOOT_TYPES.CONTAINER_GRID) return NIMBLE_LOOT_TYPES.CONTAINER_GRID;
  return NIMBLE_LOOT_TYPES.CONTAINER_LIST;
}

function nimbleLootApplyTypeDefaults(data) {
  data.type = nimbleLootNormalizeTypeForDefaults(data.type);

  if (data.type === NIMBLE_LOOT_TYPES.PILE) {
    data.config.contentsHiddenUntilOpen = false;
    data.config.access.locked = false;
    data.config.access.sealed = false;
    data.config.access.keyCode = "";
    data.config.access.maxPickAttempts = 0;
    data.config.access.maxForceAttempts = 0;
    data.config.access.maxInspectAttempts = 0;
    data.config.access.maxDisarmAttempts = 0;
    data.config.access.allowOpen = true;
    data.config.access.allowPick = false;
    data.config.access.allowForce = false;
    data.config.access.allowDisarm = false;
    data.config.traps.mechanical.enabled = false;
    data.config.traps.magical.enabled = false;
    data.state.opened = true;
    data.state.jammed = false;
    data.state.trapStatus.mechanical = NIMBLE_LOOT_TRAP_STATES.UNKNOWN;
    data.state.trapStatus.magical = NIMBLE_LOOT_TRAP_STATES.UNKNOWN;
  }

  if (data.type === NIMBLE_LOOT_TYPES.CONTAINER_LIST || data.type === NIMBLE_LOOT_TYPES.CONTAINER_GRID) {
    data.config.access.sealed = false;
  }

  return data;
}

function nimbleLootCreateDefaultData(type = NIMBLE_LOOT_TYPES.CONTAINER_LIST) {
  const data = nimbleLootDeepClone(NIMBLE_LOOT_DEFAULT_DATA);
  data.type = nimbleLootNormalizeTypeForDefaults(type);
  return nimbleLootApplyTypeDefaults(data);
}

// === Nimble Loot: migration ===
function nimbleLootMigrateData(data) {
  if (!data || typeof data !== "object") return null;
  const migratedInput = foundry.utils.deepClone(data);

  // Legacy v0.1.x profile names are now all handled by the container-list profile.
  if (["container", "strongbox", "vault"].includes(migratedInput.type)) {
    migratedInput.type = NIMBLE_LOOT_TYPES.CONTAINER_LIST;
  }

  const migrated = foundry.utils.mergeObject(
    nimbleLootCreateDefaultData(migratedInput.type),
    migratedInput,
    { inplace: false, insertKeys: true, insertValues: true, overwrite: true, recursive: true }
  );

  if (!migrated.version) migrated.version = NIMBLE_LOOT_SCHEMA_VERSION;
  migrated.config.access.sealed = false;

  return nimbleLootValidateData(migrated);
}

// === Nimble Loot: validation ===
function nimbleLootClampInteger(value, fallback = 0, min = 0, max = Number.MAX_SAFE_INTEGER) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(numeric)));
}

function nimbleLootSanitizeNullableInteger(value, fallback = null, min = 0, max = 99) {
  if (value === null || value === undefined || value === "") return fallback;
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(numeric)));
}

function nimbleLootSanitizeBoolean(value, fallback = false) {
  if (typeof value === "boolean") return value;
  if (value === "true" || value === "1" || value === "on") return true;
  if (value === "false" || value === "0" || value == null) return false;
  return fallback;
}

function nimbleLootSanitizeText(value, fallback = "") {
  const text = String(value ?? fallback ?? "").trim();
  return text;
}


function nimbleLootSanitizePlayerLogSection(entries) {
  if (!Array.isArray(entries)) return [];
  return entries.slice(-12).map((entry) => {
    const actors = Array.isArray(entry?.actors) ? entry.actors.slice(0, 8).map((actor) => ({
      id: nimbleLootSanitizeText(actor?.id),
      name: nimbleLootSanitizeText(actor?.name, "Unknown Hero"),
      count: nimbleLootClampInteger(actor?.count, 1, 1, 99)
    })) : [];
    return {
      key: nimbleLootSanitizeText(entry?.key),
      action: nimbleLootSanitizeText(entry?.action),
      outcome: nimbleLootSanitizeText(entry?.outcome),
      message: nimbleLootSanitizeText(entry?.message),
      actors
    };
  }).filter((entry) => entry.key && entry.message);
}

function nimbleLootValidateType(type) {
  const normalized = String(type ?? "").trim().toLowerCase();
  if (normalized === NIMBLE_LOOT_TYPES.PILE) return NIMBLE_LOOT_TYPES.PILE;
  if (normalized === NIMBLE_LOOT_TYPES.CONTAINER_GRID) return NIMBLE_LOOT_TYPES.CONTAINER_GRID;
  return NIMBLE_LOOT_TYPES.CONTAINER_LIST;
}

function nimbleLootIsPileType(type) {
  return nimbleLootValidateType(type) === NIMBLE_LOOT_TYPES.PILE;
}

function nimbleLootIsContainerType(type) {
  return !nimbleLootIsPileType(type);
}

function nimbleLootValidateSkill(skill, fallback = "examination") {
  const normalized = String(skill ?? "").trim().toLowerCase();
  return NIMBLE_LOOT_SKILLS.includes(normalized) ? normalized : fallback;
}

function nimbleLootValidateTrapState(state) {
  const normalized = String(state ?? "").trim().toLowerCase();
  return Object.values(NIMBLE_LOOT_TRAP_STATES).includes(normalized) ? normalized : NIMBLE_LOOT_TRAP_STATES.UNKNOWN;
}

function nimbleLootValidateDc(value, fallback = 15) {
  return nimbleLootClampInteger(value, fallback, 1, 40);
}

function nimbleLootAttemptsAllowed(maxAttempts) {
  return maxAttempts !== 0;
}

function nimbleLootValidateData(data) {
  const normalizedType = nimbleLootValidateType(data?.type);
  const normalized = foundry.utils.mergeObject(
    nimbleLootCreateDefaultData(normalizedType),
    foundry.utils.deepClone(data ?? {}),
    { inplace: false, insertKeys: true, insertValues: true, overwrite: true, recursive: true }
  );

  normalized.version = NIMBLE_LOOT_SCHEMA_VERSION;
  normalized.type = nimbleLootValidateType(normalized.type);
  normalized.config.enabled = nimbleLootSanitizeBoolean(normalized.config.enabled, true);
  normalized.config.label = nimbleLootSanitizeText(normalized.config.label);
  normalized.config.description = nimbleLootSanitizeText(normalized.config.description);
  normalized.config.contentsHiddenUntilOpen = nimbleLootSanitizeBoolean(normalized.config.contentsHiddenUntilOpen, true);
  if (!normalized.config.grid || typeof normalized.config.grid !== "object") normalized.config.grid = { rows: 3, columns: 4 };
  normalized.config.grid.rows = nimbleLootClampInteger(normalized.config.grid.rows, 3, 1, 10);
  normalized.config.grid.columns = nimbleLootClampInteger(normalized.config.grid.columns, 4, 1, 10);
  if (!normalized.config.highlight || typeof normalized.config.highlight !== "object") normalized.config.highlight = { enabled: false };
  normalized.config.highlight.enabled = nimbleLootSanitizeBoolean(normalized.config.highlight.enabled, false);

  const access = normalized.config.access;
  access.locked = nimbleLootSanitizeBoolean(access.locked, false);
  access.sealed = false;
  access.keyCode = nimbleLootSanitizeText(access.keyCode);
  access.pickSkill = nimbleLootValidateSkill(access.pickSkill, "finesse");
  access.forceSkill = nimbleLootValidateSkill(access.forceSkill, "might");
  access.inspectSkill = nimbleLootValidateSkill(access.inspectSkill, "examination");
  access.mechanicalDisarmSkill = nimbleLootValidateSkill(access.mechanicalDisarmSkill, "finesse");
  access.magicalDisarmSkill = nimbleLootValidateSkill(access.magicalDisarmSkill, "arcana");
  access.pickDc = nimbleLootValidateDc(access.pickDc, 15);
  access.forceDc = nimbleLootValidateDc(access.forceDc, 18);
  access.inspectDc = nimbleLootValidateDc(access.inspectDc, 15);
  access.mechanicalDisarmDc = nimbleLootValidateDc(access.mechanicalDisarmDc, 15);
  access.magicalDisarmDc = nimbleLootValidateDc(access.magicalDisarmDc, 15);
  access.maxPickAttempts = nimbleLootSanitizeNullableInteger(access.maxPickAttempts, null, 0, 99);
  access.maxForceAttempts = nimbleLootSanitizeNullableInteger(access.maxForceAttempts, null, 0, 99);
  access.maxInspectAttempts = nimbleLootSanitizeNullableInteger(access.maxInspectAttempts, null, 0, 99);
  access.maxDisarmAttempts = nimbleLootSanitizeNullableInteger(access.maxDisarmAttempts, null, 0, 99);
  access.jamOnFailedAttempts = true;
  // Direct opening is governed by Foundry visibility + unlocked state. Keep legacy allowOpen true.
  access.allowOpen = true;
  access.allowInspect = true;
  access.allowPick = nimbleLootAttemptsAllowed(access.maxPickAttempts);
  access.allowForce = nimbleLootAttemptsAllowed(access.maxForceAttempts);
  access.allowDisarm = true;
  access.allowUseKeyCode = access.keyCode.length > 0;

  for (const trapType of Object.values(NIMBLE_LOOT_TRAP_TYPES)) {
    const trap = normalized.config.traps[trapType];
    trap.enabled = nimbleLootSanitizeBoolean(trap.enabled, false);
    trap.tier = "solid";
    trap.detectDc = nimbleLootValidateDc(trap.detectDc, 15);
    trap.disarmDc = nimbleLootValidateDc(trap.disarmDc, 15);
    trap.triggerOnFailedPick = nimbleLootSanitizeBoolean(trap.triggerOnFailedPick, true);
    trap.triggerOnFailedForce = nimbleLootSanitizeBoolean(trap.triggerOnFailedForce, true);
    trap.triggerOnFailedDisarm = nimbleLootSanitizeBoolean(trap.triggerOnFailedDisarm, true);
    trap.triggerOnOpenIfArmed = nimbleLootSanitizeBoolean(trap.triggerOnOpenIfArmed, false);
    trap.oneShot = nimbleLootSanitizeBoolean(trap.oneShot, true);
    trap.tableName = nimbleLootSanitizeText(trap.tableName);
    normalized.state.trapStatus[trapType] = nimbleLootValidateTrapState(normalized.state.trapStatus[trapType]);
  }

  // Discovery is now handled by Foundry token visibility. Keep legacy field true for older data.
  normalized.state.discovered = true;
  normalized.state.opened = nimbleLootSanitizeBoolean(normalized.state.opened, false);
  // Depleted is no longer a behavior state. Empty loot piles delete themselves; containers stay usable.
  normalized.state.depleted = false;
  normalized.state.jammed = nimbleLootSanitizeBoolean(normalized.state.jammed, false);
  normalized.state.pickAttempts = nimbleLootClampInteger(normalized.state.pickAttempts, 0, 0, 999);
  normalized.state.forceAttempts = nimbleLootClampInteger(normalized.state.forceAttempts, 0, 0, 999);
  normalized.state.inspectAttempts = nimbleLootClampInteger(normalized.state.inspectAttempts, 0, 0, 999);
  normalized.state.disarmAttempts = nimbleLootClampInteger(normalized.state.disarmAttempts, 0, 0, 999);
  normalized.state.carefulOpenAttempted = nimbleLootSanitizeBoolean(normalized.state.carefulOpenAttempted, false);
  if (!normalized.state.currency || typeof normalized.state.currency !== "object") {
    normalized.state.currency = { gp: 0, sp: 0, cp: 0 };
  }
  normalized.state.currency.gp = nimbleLootClampInteger(normalized.state.currency.gp, 0, 0, 999999);
  normalized.state.currency.sp = nimbleLootClampInteger(normalized.state.currency.sp, 0, 0, 999999);
  normalized.state.currency.cp = nimbleLootClampInteger(normalized.state.currency.cp, 0, 0, 999999);
  if (!normalized.state.playerLog || typeof normalized.state.playerLog !== "object") {
    normalized.state.playerLog = { inspection: [], opening: [] };
  }
  normalized.state.playerLog.inspection = nimbleLootSanitizePlayerLogSection(normalized.state.playerLog.inspection);
  normalized.state.playerLog.opening = nimbleLootSanitizePlayerLogSection(normalized.state.playerLog.opening);
  if (!normalized.state.gridSlots || typeof normalized.state.gridSlots !== "object" || Array.isArray(normalized.state.gridSlots)) {
    normalized.state.gridSlots = {};
  } else {
    const cleanGridSlots = {};
    for (const [itemId, slotIndex] of Object.entries(normalized.state.gridSlots)) {
      const cleanId = nimbleLootSanitizeText(itemId);
      const cleanSlot = nimbleLootClampInteger(slotIndex, 0, 0, 999);
      if (cleanId) cleanGridSlots[cleanId] = cleanSlot;
    }
    normalized.state.gridSlots = cleanGridSlots;
  }

  nimbleLootApplyTypeDefaults(normalized);
  return normalized;
}

// === Nimble Loot: flags ===
function nimbleLootTokenDocument(tokenOrDocument) {
  if (!tokenOrDocument) return null;
  if (tokenOrDocument.documentName === "Token") return tokenOrDocument;
  if (tokenOrDocument.document?.documentName === "Token") return tokenOrDocument.document;
  if (tokenOrDocument.object?.document?.documentName === "Token") return tokenOrDocument.object.document;
  return null;
}

function nimbleLootTokenObject(tokenOrDocument) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  return doc?.object ?? tokenOrDocument?.object ?? (tokenOrDocument?.document ? tokenOrDocument : null);
}

function nimbleLootHasData(tokenOrDocument) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  return Boolean(doc?.getFlag?.(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_FLAG_KEY));
}

function nimbleLootGetData(tokenOrDocument) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  if (!doc) return null;
  const raw = doc.getFlag(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_FLAG_KEY);
  if (!raw) return null;
  return nimbleLootMigrateData(raw);
}

async function nimbleLootSetData(tokenOrDocument, data) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  if (!doc) throw new Error("No token document provided.");
  const normalized = nimbleLootValidateData(data);
  await doc.setFlag(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_FLAG_KEY, normalized);
  return normalized;
}

async function nimbleLootUpdateData(tokenOrDocument, updates) {
  const current = nimbleLootGetData(tokenOrDocument) ?? nimbleLootCreateDefaultData();
  const merged = foundry.utils.mergeObject(current, foundry.utils.deepClone(updates ?? {}), {
    inplace: false,
    insertKeys: true,
    insertValues: true,
    overwrite: true,
    recursive: true
  });
  return nimbleLootSetData(tokenOrDocument, merged);
}

async function nimbleLootUpdateConfig(tokenOrDocument, updates) {
  return nimbleLootUpdateData(tokenOrDocument, { config: updates ?? {} });
}

async function nimbleLootUpdateState(tokenOrDocument, updates) {
  return nimbleLootUpdateData(tokenOrDocument, { state: updates ?? {} });
}

async function nimbleLootClearData(tokenOrDocument) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  if (!doc) throw new Error("No token document provided.");
  await doc.unsetFlag(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_FLAG_KEY);
}

function nimbleLootGetDisplayName(tokenOrDocument, lootData = null) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  const data = lootData ?? nimbleLootGetData(doc);
  const configured = String(data?.config?.label ?? "").trim();
  return configured || doc?.name || doc?.actor?.name || "Loot";
}

function nimbleLootGetSceneTokenByIds(sceneId, tokenId) {
  const scene = game.scenes?.get(sceneId) ?? canvas?.scene;
  const tokenDocument = scene?.tokens?.get(tokenId) ?? null;
  return tokenDocument?.object ?? tokenDocument ?? null;
}

// === Nimble Loot: formatting helpers ===
function nimbleLootEscape(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function nimbleLootTitleCase(value) {
  return String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function nimbleLootFormatCurrency(currency) {
  const parts = [];
  for (const key of NIMBLE_LOOT_CURRENCY_KEYS) {
    const value = Math.max(0, Math.floor(Number(currency?.[key] ?? 0) || 0));
    if (value > 0) parts.push(`${value} ${key.toUpperCase()}`);
  }
  return parts.length ? parts.join(" ") : "0 GP";
}

function nimbleLootGetItemImage(item) {
  return String(item?.img || "icons/svg/item-bag.svg");
}

function nimbleLootGetItemDescription(item) {
  const candidates = [
    foundry.utils.getProperty(item, "system.description.public"),
    foundry.utils.getProperty(item, "system.description"),
    foundry.utils.getProperty(item, "system.details.description"),
    foundry.utils.getProperty(item, "system.shortDescription"),
    foundry.utils.getProperty(item, "description")
  ];
  const value = candidates.find((candidate) => typeof candidate === "string" && candidate.trim());
  return String(value ?? "").trim();
}

function nimbleLootCssEscape(value) {
  if (globalThis.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function nimbleLootGetNamedControl(root, name) {
  if (!root || !name) return null;
  if (root.elements?.namedItem) {
    const element = root.elements.namedItem(name);
    if (element) return element;
  }
  return root.querySelector?.(`[name="${nimbleLootCssEscape(name)}"]`) ?? null;
}

function nimbleLootReadFormBoolean(form, name) {
  const element = nimbleLootGetNamedControl(form, name);
  if (!element) return false;
  if (globalThis.RadioNodeList && element instanceof RadioNodeList) return Boolean(element.value);
  if (element.type === "checkbox") return element.checked;
  return Boolean(element.value);
}

function nimbleLootReadFormString(form, name, fallback = "") {
  const element = nimbleLootGetNamedControl(form, name);
  if (!element) return fallback;
  return String(element.value ?? fallback).trim();
}

function nimbleLootReadFormNumber(form, name, fallback = 0) {
  const value = Number(nimbleLootReadFormString(form, name, fallback));
  return Number.isFinite(value) ? value : fallback;
}

function nimbleLootReadFormNullableNumber(form, name, fallback = null) {
  const raw = nimbleLootReadFormString(form, name, "");
  if (raw === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function nimbleLootMaxAttemptLabel(value) {
  if (value === null || value === undefined || value === "") return "∞";
  return String(value);
}

function nimbleLootStatusLabel(lootData) {
  if (lootData?.state?.opened || lootData?.type === NIMBLE_LOOT_TYPES.PILE) return "Open";
  if (lootData?.state?.jammed) return "Jammed";
  if (lootData?.config?.access?.locked) return "Locked";
  return "Closed";
}

function nimbleLootMode(lootData) {
  if (lootData?.state?.opened || lootData?.type === NIMBLE_LOOT_TYPES.PILE) return "open";
  return "sealed";
}

function nimbleLootCanShowContents(lootData) {
  if (lootData?.type === NIMBLE_LOOT_TYPES.PILE) return true;
  if (!lootData?.config?.contentsHiddenUntilOpen) return true;
  return lootData?.state?.opened === true;
}

function nimbleLootIsGridDisplay(lootData) {
  return lootData?.type === NIMBLE_LOOT_TYPES.CONTAINER_GRID;
}

function nimbleLootCanPlayerForceOpen(lootData) {
  if (!nimbleLootSetting("allowPlayersToForceOpen")) return false;
  return nimbleLootAttemptsAllowed(lootData?.config?.access?.maxForceAttempts);
}

function nimbleLootActorLogName(actor) {
  return String(actor?.name ?? "Unknown Hero").trim() || "Unknown Hero";
}

function nimbleLootFormatPlayerLogActorList(actors = []) {
  return actors.map((actor) => `${actor.name}${actor.count > 1 ? ` x${actor.count}` : ""}`).join(", ");
}

function nimbleLootFormatPlayerLogLine(entry) {
  const actorText = nimbleLootFormatPlayerLogActorList(entry?.actors ?? []);
  return `${actorText} — ${entry?.message ?? ""}`.trim();
}

function nimbleLootBuildPlayerLogLines(lootData, section) {
  const entries = lootData?.state?.playerLog?.[section] ?? [];
  return entries.map((entry) => ({ ...entry, line: nimbleLootFormatPlayerLogLine(entry) }));
}

async function nimbleLootAppendPlayerLog(token, { section = "inspection", action = "action", outcome = "done", actor = null, message = "" } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) return null;
  const safeSection = section === "opening" ? "opening" : "inspection";
  const playerLog = foundry.utils.deepClone(data.state.playerLog ?? { inspection: [], opening: [] });
  if (!Array.isArray(playerLog.inspection)) playerLog.inspection = [];
  if (!Array.isArray(playerLog.opening)) playerLog.opening = [];

  const cleanMessage = String(message ?? "").trim();
  if (!cleanMessage) return data;
  const key = `${action}|${outcome}|${cleanMessage}`;
  const actorId = String(actor?.id ?? actor?.uuid ?? game.user?.id ?? "unknown");
  const actorName = nimbleLootActorLogName(actor);
  const entries = playerLog[safeSection];
  let entry = entries.find((candidate) => candidate.key === key);
  if (!entry) {
    entry = { key, action, outcome, message: cleanMessage, actors: [] };
    entries.push(entry);
  }
  let actorEntry = entry.actors.find((candidate) => candidate.id === actorId || candidate.name === actorName);
  if (!actorEntry) {
    actorEntry = { id: actorId, name: actorName, count: 0 };
    entry.actors.push(actorEntry);
  }
  actorEntry.count = Math.min(99, Math.max(1, Number(actorEntry.count ?? 0) + 1));
  playerLog[safeSection] = entries.slice(-12);
  return nimbleLootUpdateState(token, { playerLog });
}


function nimbleLootGridDimensions(lootData) {
  const rows = Math.max(1, Math.min(10, Math.floor(Number(lootData?.config?.grid?.rows ?? 3) || 3)));
  const columns = Math.max(1, Math.min(10, Math.floor(Number(lootData?.config?.grid?.columns ?? 4) || 4)));
  return { rows, columns, total: rows * columns };
}

function nimbleLootBuildGridSlotsForContext(items, lootData) {
  const { rows, columns, total } = nimbleLootGridDimensions(lootData);
  const slotMap = lootData?.state?.gridSlots && typeof lootData.state.gridSlots === "object" ? lootData.state.gridSlots : {};
  const slots = Array.from({ length: total }, (_, index) => ({ index, item: null }));
  const used = new Set();

  for (const item of items) {
    const preferred = Math.floor(Number(slotMap[item.id]));
    if (Number.isFinite(preferred) && preferred >= 0 && preferred < total && !slots[preferred].item) {
      slots[preferred].item = item;
      used.add(item.id);
    }
  }

  for (const item of items) {
    if (used.has(item.id)) continue;
    const openSlot = slots.find((slot) => !slot.item);
    if (openSlot) {
      openSlot.item = item;
      used.add(item.id);
    }
  }

  return { rows, columns, total, slots };
}

// === Nimble Loot: Svelte-compatible application mixin ===
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

// === Nimble Loot: actor resolver ===
function nimbleLootActorIsUsableByUser(actor, user = game.user) {
  if (!actor) return false;
  if (user?.isGM) return true;
  return actor.testUserPermission?.(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) === true;
}

function nimbleLootGetControlledActorForUser(user = game.user) {
  const controlled = canvas?.tokens?.controlled ?? [];
  for (const token of controlled) {
    const actor = token.actor;
    if (nimbleLootActorIsUsableByUser(actor, user)) return actor;
  }
  return null;
}

function nimbleLootGetAssignedCharacterForUser(user = game.user) {
  const character = user?.character ?? null;
  if (nimbleLootActorIsUsableByUser(character, user)) return character;
  return null;
}

function nimbleLootGetOwnedCharacterActors(user = game.user) {
  return (game.actors?.contents ?? []).filter((actor) => {
    return actor.type === "character" && nimbleLootActorIsUsableByUser(actor, user);
  });
}

function nimbleLootResolveActorForUser(user = game.user) {
  return nimbleLootGetControlledActorForUser(user)
    ?? nimbleLootGetAssignedCharacterForUser(user)
    ?? nimbleLootGetOwnedCharacterActors(user)[0]
    ?? null;
}

function nimbleLootGetActorById(actorId) {
  if (!actorId) return null;
  let actor = game.actors?.get(actorId) ?? null;
  if (actor) return actor;

  try {
    actor = fromUuidSync?.(actorId) ?? null;
    if (actor?.documentName === "Actor") return actor;
  } catch (_error) {
    // Continue to token actor scan.
  }

  for (const token of canvas?.tokens?.placeables ?? []) {
    if (token?.actor?.id === actorId || token?.actor?.uuid === actorId) return token.actor;
  }
  return null;
}

function nimbleLootGetActorByUuidOrId(actorUuid, actorId) {
  if (actorUuid) {
    try {
      const actor = fromUuidSync?.(actorUuid) ?? null;
      if (actor?.documentName === "Actor") return actor;
    } catch (_error) {
      // Fall back to id.
    }
    for (const token of canvas?.tokens?.placeables ?? []) {
      if (token?.actor?.uuid === actorUuid) return token.actor;
    }
  }
  return nimbleLootGetActorById(actorId);
}

function nimbleLootRequireActor(user = game.user) {
  const actor = nimbleLootResolveActorForUser(user);
  if (actor) return actor;
  if (nimbleLootSetting("requireControlledActor") !== false) {
    nimbleLootNotify("Select or assign a hero before taking loot.", "warn");
    return null;
  }
  return null;
}

function nimbleLootGetSceneTokenForActor(actor, user = game.user) {
  if (!actor) return null;
  const controlled = Array.from(canvas?.tokens?.controlled ?? []);
  const controlledMatch = controlled.find((token) => token?.actor?.id === actor.id || token?.actor?.uuid === actor.uuid);
  if (controlledMatch) return controlledMatch;

  try {
    const activeTokens = actor.getActiveTokens?.(false, true) ?? [];
    const onScene = activeTokens.find((token) => token?.scene?.id === canvas?.scene?.id || token?.document?.parent?.id === canvas?.scene?.id);
    if (onScene) return onScene;
  } catch (_error) {
    // Fall through to canvas scan.
  }

  return Array.from(canvas?.tokens?.placeables ?? []).find((token) => token?.actor?.id === actor.id || token?.actor?.uuid === actor.uuid) ?? null;
}

function nimbleLootTokenCenterInPixels(tokenOrDocument) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  if (!doc) return null;
  const gridSize = Number(canvas?.grid?.size) || 100;
  const width = Math.max(1, Number(doc.width) || 1) * gridSize;
  const height = Math.max(1, Number(doc.height) || 1) * gridSize;
  return {
    x: (Number(doc.x) || 0) + width / 2,
    y: (Number(doc.y) || 0) + height / 2
  };
}

function nimbleLootDistanceBetweenTokensInSpaces(a, b) {
  const ca = nimbleLootTokenCenterInPixels(a);
  const cb = nimbleLootTokenCenterInPixels(b);
  if (!ca || !cb) return Number.POSITIVE_INFINITY;
  const gridSize = Number(canvas?.grid?.size) || 100;
  const dx = Math.abs(ca.x - cb.x) / gridSize;
  const dy = Math.abs(ca.y - cb.y) / gridSize;
  return Math.max(dx, dy);
}

function nimbleLootInteractionDistanceLimit() {
  const raw = Number(nimbleLootSetting("interactionDistanceSpaces"));
  if (!Number.isFinite(raw) || raw < 0) return 1;
  return raw;
}

function nimbleLootIsActorWithinInteractionDistance(tokenOrDocument, actor, user = game.user) {
  if (user?.isGM) return true;
  if (nimbleLootSetting("limitInteractionDistance") !== true) return true;
  const actorToken = nimbleLootGetSceneTokenForActor(actor, user);
  if (!actorToken) return false;
  const distance = nimbleLootDistanceBetweenTokensInSpaces(actorToken, tokenOrDocument);
  return distance <= nimbleLootInteractionDistanceLimit();
}

function nimbleLootAssertInteractionDistance(tokenOrDocument, actor, user = game.user) {
  if (nimbleLootIsActorWithinInteractionDistance(tokenOrDocument, actor, user)) return true;
  const maxSpaces = nimbleLootInteractionDistanceLimit();
  nimbleLootNotify(`Move your hero within ${maxSpaces} space${maxSpaces === 1 ? "" : "s"} of this loot to interact with it.`, "warn");
  return false;
}

// === Nimble Loot: currency service ===
function nimbleLootReadCurrencyValue(actor, key) {
  const paths = NIMBLE_LOOT_CURRENCY_FALLBACK_PATHS[key] ?? [NIMBLE_LOOT_CURRENCY_PATHS[key]];
  for (const path of paths) {
    const value = foundry.utils.getProperty(actor, path);
    if (value && typeof value === "object") continue;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return Math.max(0, Math.floor(numeric));
  }
  return 0;
}

function nimbleLootGetCurrency(actor) {
  return {
    gp: nimbleLootReadCurrencyValue(actor, "gp"),
    sp: nimbleLootReadCurrencyValue(actor, "sp"),
    cp: nimbleLootReadCurrencyValue(actor, "cp")
  };
}

function nimbleLootNormalizeCurrency(currency) {
  return {
    gp: nimbleLootClampInteger(currency?.gp, 0, 0),
    sp: nimbleLootClampInteger(currency?.sp, 0, 0),
    cp: nimbleLootClampInteger(currency?.cp, 0, 0)
  };
}

function nimbleLootIsCurrencyEmpty(currency) {
  const normalized = nimbleLootNormalizeCurrency(currency);
  return normalized.gp <= 0 && normalized.sp <= 0 && normalized.cp <= 0;
}

function nimbleLootGetLootCurrency(tokenOrData) {
  const data = tokenOrData?.state ? tokenOrData : nimbleLootGetData(tokenOrData);
  return nimbleLootNormalizeCurrency(data?.state?.currency ?? {});
}

async function nimbleLootSetLootCurrency(tokenOrDocument, currency) {
  const normalized = nimbleLootNormalizeCurrency(currency);
  await nimbleLootUpdateState(tokenOrDocument, { currency: normalized });
  return normalized;
}

function nimbleLootHasLootCurrency(tokenOrData, requested) {
  const current = nimbleLootGetLootCurrency(tokenOrData);
  const normalized = nimbleLootNormalizeCurrency(requested);
  return current.gp >= normalized.gp && current.sp >= normalized.sp && current.cp >= normalized.cp;
}

async function nimbleLootSubtractLootCurrency(tokenOrDocument, currency) {
  const current = nimbleLootGetLootCurrency(tokenOrDocument);
  const subtract = nimbleLootNormalizeCurrency(currency);
  if (!nimbleLootHasLootCurrency(tokenOrDocument, subtract)) {
    throw new Error("This loot pile does not have enough currency.");
  }
  const next = {
    gp: current.gp - subtract.gp,
    sp: current.sp - subtract.sp,
    cp: current.cp - subtract.cp
  };
  return nimbleLootSetLootCurrency(tokenOrDocument, next);
}

function nimbleLootHasCurrency(actor, requested) {
  const current = nimbleLootGetCurrency(actor);
  const normalized = nimbleLootNormalizeCurrency(requested);
  return current.gp >= normalized.gp && current.sp >= normalized.sp && current.cp >= normalized.cp;
}

function nimbleLootActorHasCurrencyField(actor, key) {
  const paths = NIMBLE_LOOT_CURRENCY_FALLBACK_PATHS[key] ?? [];
  return paths.some((path) => foundry.utils.getProperty(actor, path) !== undefined);
}

function nimbleLootCurrencyUpdatePayload(currency, actor = null) {
  const normalized = nimbleLootNormalizeCurrency(currency);
  const payload = {};
  for (const key of NIMBLE_LOOT_CURRENCY_KEYS) {
    if (actor && !nimbleLootActorHasCurrencyField(actor, key) && normalized[key] === 0) continue;
    payload[NIMBLE_LOOT_CURRENCY_PATHS[key]] = normalized[key];
  }
  return payload;
}

function nimbleLootAssertCanReceiveCurrency(actor, currency) {
  if (!actor) throw new Error("No actor provided for currency update.");
  const normalized = nimbleLootNormalizeCurrency(currency);
  const missing = NIMBLE_LOOT_CURRENCY_KEYS.filter((key) => normalized[key] > 0 && !nimbleLootActorHasCurrencyField(actor, key));
  if (missing.length) {
    throw new Error(`${actor.name} does not expose ${missing.map((k) => k.toUpperCase()).join("/")} currency fields. Currency was not removed from the loot pile.`);
  }
}

function nimbleLootCurrencyMeetsExpected(actual, expected) {
  const a = nimbleLootNormalizeCurrency(actual);
  const e = nimbleLootNormalizeCurrency(expected);
  return a.gp >= e.gp && a.sp >= e.sp && a.cp >= e.cp;
}

async function nimbleLootAddCurrency(actor, currency) {
  nimbleLootAssertCanReceiveCurrency(actor, currency);
  const current = nimbleLootGetCurrency(actor);
  const add = nimbleLootNormalizeCurrency(currency);
  const next = {
    gp: current.gp + add.gp,
    sp: current.sp + add.sp,
    cp: current.cp + add.cp
  };
  await actor.update(nimbleLootCurrencyUpdatePayload(next, actor));

  // Actor updates against Foundry data models can silently discard invalid paths.
  // Verify before the loot pile currency is removed so coins cannot vanish.
  const after = nimbleLootGetCurrency(actor);
  if (!nimbleLootCurrencyMeetsExpected(after, next)) {
    throw new Error(`Currency update did not persist on ${actor.name}. Expected ${nimbleLootFormatCurrency(next)}, found ${nimbleLootFormatCurrency(after)}.`);
  }
  return next;
}

async function nimbleLootSubtractCurrency(actor, currency) {
  nimbleLootAssertCanReceiveCurrency(actor, currency);
  const current = nimbleLootGetCurrency(actor);
  const subtract = nimbleLootNormalizeCurrency(currency);
  if (!nimbleLootHasCurrency(actor, subtract)) {
    throw new Error(`${actor.name} does not have enough currency.`);
  }
  const next = {
    gp: current.gp - subtract.gp,
    sp: current.sp - subtract.sp,
    cp: current.cp - subtract.cp
  };
  await actor.update(nimbleLootCurrencyUpdatePayload(next, actor));
  return next;
}

async function nimbleLootSetCurrency(actor, currency) {
  nimbleLootAssertCanReceiveCurrency(actor, currency);
  const normalized = nimbleLootNormalizeCurrency(currency);
  await actor.update(nimbleLootCurrencyUpdatePayload(normalized, actor));
  return normalized;
}

// === Nimble Loot: inventory service ===
function nimbleLootActorHasLootContents(actor) {
  if (!actor) return false;
  const items = actor.items;
  if (items?.size > 0) return true;
  if (Array.isArray(actor.itemTypes?.object) && actor.itemTypes.object.length > 0) return true;
  return false;
}

function nimbleLootGetLootActor(tokenOrDocument) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  const tokenObject = nimbleLootTokenObject(tokenOrDocument);

  // Prefer the placeable token's synthetic actor when available. For unlinked
  // loot tokens, Foundry may expose the base world actor on TokenDocument.actor
  // while the actual per-token inventory lives on token.object.actor. If we read
  // the base actor first, player dialogs can appear empty even though the token
  // contains embedded item data.
  const candidates = [
    tokenObject?.actor,
    tokenOrDocument?.actor,
    doc?.object?.actor,
    doc?.actor
  ].filter(Boolean);

  return candidates.find((actor) => nimbleLootActorHasLootContents(actor)) ?? candidates[0] ?? null;
}

function nimbleLootHasQuantityField(item) {
  return foundry.utils.hasProperty(item, NIMBLE_LOOT_ITEM_QUANTITY_PATH);
}

function nimbleLootGetItemQuantity(item) {
  const raw = foundry.utils.getProperty(item, NIMBLE_LOOT_ITEM_QUANTITY_PATH);
  const numeric = Number(raw);
  if (!Number.isFinite(numeric)) return 1;
  return Math.max(0, Math.floor(numeric));
}

function nimbleLootSetItemDataQuantity(itemData, quantity) {
  const clone = foundry.utils.deepClone(itemData);
  if (!clone.system || typeof clone.system !== "object") clone.system = {};
  foundry.utils.setProperty(clone, NIMBLE_LOOT_ITEM_QUANTITY_PATH, Math.max(1, Math.floor(quantity)));
  return clone;
}

function nimbleLootIsLootItem(item) {
  return NIMBLE_LOOT_ALLOWED_ITEM_TYPES.includes(item?.type);
}

function nimbleLootGetVisibleLootItems(tokenOrDocument, lootData = null) {
  const data = lootData ?? nimbleLootGetData(tokenOrDocument);
  if (!nimbleLootCanShowContents(data)) return [];
  const actor = nimbleLootGetLootActor(tokenOrDocument);
  if (!actor) return [];
  return actor.items.filter((item) => nimbleLootIsLootItem(item) && nimbleLootGetItemQuantity(item) > 0);
}

function nimbleLootItemsAreStackCompatible(existingItem, itemData) {
  if (!existingItem || !itemData) return false;
  if (existingItem.type !== itemData.type) return false;
  if (String(existingItem.name ?? "").trim().toLowerCase() !== String(itemData.name ?? "").trim().toLowerCase()) return false;
  if (!nimbleLootHasQuantityField(existingItem)) return false;
  const existingObjectType = String(foundry.utils.getProperty(existingItem, "system.objectType") ?? "");
  const incomingObjectType = String(foundry.utils.getProperty(itemData, "system.objectType") ?? "");
  return existingObjectType === incomingObjectType;
}

function nimbleLootFindMatchingStack(actor, itemData) {
  return actor?.items?.find((item) => nimbleLootItemsAreStackCompatible(item, itemData)) ?? null;
}

async function nimbleLootAddItemToActor(actor, sourceItem, quantity = 1) {
  const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const itemData = sourceItem.toObject ? sourceItem.toObject() : foundry.utils.deepClone(sourceItem);
  const preparedData = nimbleLootSetItemDataQuantity(itemData, normalizedQuantity);
  const existingStack = nimbleLootFindMatchingStack(actor, preparedData);

  if (existingStack) {
    const currentQuantity = nimbleLootGetItemQuantity(existingStack);
    await existingStack.update({ [NIMBLE_LOOT_ITEM_QUANTITY_PATH]: currentQuantity + normalizedQuantity });
    return existingStack;
  }

  const created = await actor.createEmbeddedDocuments("Item", [preparedData]);
  return created?.[0] ?? null;
}

async function nimbleLootReduceSourceItem(item, quantity = 1) {
  const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const currentQuantity = nimbleLootGetItemQuantity(item);
  if (normalizedQuantity > currentQuantity) {
    throw new Error(`Not enough ${item.name} remains.`);
  }

  const remaining = currentQuantity - normalizedQuantity;
  if (remaining <= 0) {
    await item.delete();
    return 0;
  }

  if (nimbleLootHasQuantityField(item)) {
    await item.update({ [NIMBLE_LOOT_ITEM_QUANTITY_PATH]: remaining });
    return remaining;
  }

  await item.delete();
  return 0;
}

function nimbleLootIsDepleted(tokenOrDocument, lootData = null) {
  const data = lootData ?? nimbleLootGetData(tokenOrDocument);
  if (!data) return false;
  const actor = nimbleLootGetLootActor(tokenOrDocument);
  if (!actor) return true;
  const hasItems = actor.items.some((item) => nimbleLootIsLootItem(item) && nimbleLootGetItemQuantity(item) > 0);
  const hasCurrency = !nimbleLootIsCurrencyEmpty(nimbleLootGetLootCurrency(data));
  return !hasItems && !hasCurrency;
}

// === Nimble Loot: roll service ===
function nimbleLootGetSkillBonus(actor, skill) {
  const key = String(skill ?? "").toLowerCase();
  const candidates = [
    `system.skills.${key}.total`,
    `system.skills.${key}.value`,
    `system.skills.${key}.bonus`,
    `system.skills.${key}.mod`,
    `system.skills.${key}`,
    `skills.${key}.total`,
    `skills.${key}.value`,
    `skills.${key}.bonus`,
    `skills.${key}.mod`,
    `skills.${key}`
  ];

  const rollData = actor?.getRollData?.() ?? actor ?? {};
  for (const path of candidates) {
    const direct = foundry.utils.getProperty(actor, path);
    const fromRollData = foundry.utils.getProperty(rollData, path.replace(/^system\./, ""));
    for (const value of [direct, fromRollData]) {
      if (typeof value === "number" && Number.isFinite(value)) return Math.floor(value);
      if (value && typeof value === "object") {
        for (const nested of [value.total, value.value, value.bonus, value.mod, value.modifier]) {
          if (typeof nested === "number" && Number.isFinite(nested)) return Math.floor(nested);
        }
      }
    }
  }

  return 0;
}

function nimbleLootRollSpeaker(actor) {
  return ChatMessage.getSpeaker({ actor });
}

function nimbleLootExtractRollTotal(value) {
  if (!value) return null;
  if (typeof value.total === "number") return value.total;
  if (typeof value._total === "number") return value._total;
  if (typeof value.result === "number") return value.result;
  if (typeof value.roll?.total === "number") return value.roll.total;
  if (Array.isArray(value.rolls) && value.rolls.length) {
    for (const roll of value.rolls) {
      const total = nimbleLootExtractRollTotal(roll);
      if (typeof total === "number") return total;
    }
  }
  if (value.message?.rolls?.length) return nimbleLootExtractRollTotal(value.message);
  return null;
}

function nimbleLootExtractNaturalD20(value) {
  if (!value) return null;
  const candidates = [];
  if (value.roll) candidates.push(value.roll);
  if (Array.isArray(value.rolls)) candidates.push(...value.rolls);
  candidates.push(value);
  for (const candidate of candidates) {
    const dice = candidate?.dice ?? candidate?.terms?.filter?.((term) => term?.faces === 20) ?? [];
    for (const die of dice) {
      if (die?.faces !== 20) continue;
      const result = die.results?.find?.((r) => r.active !== false)?.result;
      if (typeof result === "number" && Number.isFinite(result)) return Math.floor(result);
    }
  }
  return null;
}

function nimbleLootFindRecentRollData(actor, sinceTimestamp = 0) {
  const actorId = actor?.id;
  const messages = Array.from(game.messages?.contents ?? []).reverse();
  for (const message of messages) {
    if ((message.timestamp ?? 0) < sinceTimestamp) continue;
    if (actorId && message.speaker?.actor && message.speaker.actor !== actorId) continue;
    const total = nimbleLootExtractRollTotal(message);
    if (typeof total !== "number" || !Number.isFinite(total)) continue;
    return { total, natural: nimbleLootExtractNaturalD20(message) };
  }
  return null;
}

async function nimbleLootTryNativeSkillRoll(actor, skill, dc, label, options = {}) {
  const native = actor?.rollSkillCheckToChat;
  if (typeof native !== "function") return undefined;

  const normalizedSkill = nimbleLootValidateSkill(skill);
  const normalizedDc = nimbleLootValidateDc(dc, 15);
  const flatBonus = Math.floor(Number(options.flatBonus ?? options.bonus ?? 0) || 0);
  const situationalMods = flatBonus !== 0 ? `${flatBonus >= 0 ? "+" : ""}${flatBonus}` : (options.situationalMods ?? "");

  const payload = {
    ...options,
    prompted: true,
    dc: normalizedDc,
    label,
    flavor: label,
    title: label
  };
  if (situationalMods !== "") payload.situationalMods = situationalMods;

  try {
    const result = await native.call(actor, normalizedSkill, payload);
    if (!result) return null;
    const roll = result?.rolls?.[0] ?? result?.roll ?? null;
    const total = Math.floor(Number((roll?.total ?? nimbleLootExtractRollTotal(result))) || 0);
    const natural = nimbleLootExtractNaturalD20(roll) ?? nimbleLootExtractNaturalD20(result);
    return {
      total,
      dc: normalizedDc,
      success: total >= normalizedDc,
      roll,
      message: result ?? null,
      rollData: result?.rollData ?? null,
      skill: normalizedSkill,
      native: true,
      bonus: null,
      flatBonus,
      natural,
      isNat1: natural === 1,
      isNat20: natural === 20
    };
  } catch (error) {
    nimbleLootDebug("Native Nimble rollSkillCheckToChat attempt failed; using Nimble Loot fallback roll.", error);
    return undefined;
  }
}

async function nimbleLootRollSkillToChat(actor, skill, dc, label, options = {}) {
  if (!actor) throw new Error("No actor provided for roll.");
  const normalizedSkill = nimbleLootValidateSkill(skill);
  const normalizedDc = nimbleLootValidateDc(dc, 15);
  const flatBonus = Math.floor(Number(options.flatBonus ?? options.bonus ?? 0) || 0);

  // Prefer Nimble's native roll-to-chat pathway so the roll uses system behavior,
  // roll modes, modifier handling, and the standard Nimble chat card output.
  const nativeResult = await nimbleLootTryNativeSkillRoll(actor, normalizedSkill, normalizedDc, label, { ...options, flatBonus });
  if (nativeResult === null) return null;
  if (nativeResult !== undefined) return nativeResult;

  const skillBonus = nimbleLootGetSkillBonus(actor, normalizedSkill);
  const totalBonus = skillBonus + flatBonus;
  const formula = totalBonus === 0 ? "1d20" : `1d20 ${totalBonus >= 0 ? "+" : "-"} ${Math.abs(totalBonus)}`;
  const roll = await new Roll(formula).evaluate();
  const total = Math.floor(Number(roll.total) || 0);
  const natural = nimbleLootExtractNaturalD20(roll);
  const success = total >= normalizedDc;
  return { total, dc: normalizedDc, success, roll, skill: normalizedSkill, bonus: totalBonus, flatBonus, natural, isNat1: natural === 1, isNat20: natural === 20, native: false };
}

async function nimbleLootPostSimpleChat(title, body, whisperGm = false) {
  const content = `<div class="nimble-loot-chat-card"><h3>${nimbleLootEscape(title)}</h3><p>${nimbleLootEscape(body)}</p></div>`;
  const data = { content };
  if (whisperGm) data.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
  return ChatMessage.create(data);
}

// === Nimble Loot: trap service ===
function nimbleLootTrapState(lootData, trapType) {
  return nimbleLootValidateTrapState(lootData?.state?.trapStatus?.[trapType]);
}

function nimbleLootGetTrapDisplayLabel(lootData) {
  const mechanical = nimbleLootTrapState(lootData, NIMBLE_LOOT_TRAP_TYPES.MECHANICAL);
  const magical = nimbleLootTrapState(lootData, NIMBLE_LOOT_TRAP_TYPES.MAGICAL);

  if (mechanical === NIMBLE_LOOT_TRAP_STATES.TRIGGERED || magical === NIMBLE_LOOT_TRAP_STATES.TRIGGERED) return "Triggered";
  if (mechanical === NIMBLE_LOOT_TRAP_STATES.DISARMED || magical === NIMBLE_LOOT_TRAP_STATES.DISARMED) return "Disarmed";

  const mechanicalDetected = mechanical === NIMBLE_LOOT_TRAP_STATES.DETECTED;
  const magicalDetected = magical === NIMBLE_LOOT_TRAP_STATES.DETECTED;
  if (mechanicalDetected && magicalDetected) return "Mechanical and magical detected";
  if (mechanicalDetected) return "Mechanical detected";
  if (magicalDetected) return "Magical detected";

  const anyUnknown = mechanical === NIMBLE_LOOT_TRAP_STATES.UNKNOWN || magical === NIMBLE_LOOT_TRAP_STATES.UNKNOWN;
  const allClear = [mechanical, magical].every((state) => state === NIMBLE_LOOT_TRAP_STATES.CLEAR || state === NIMBLE_LOOT_TRAP_STATES.DISARMED || state === NIMBLE_LOOT_TRAP_STATES.TRIGGERED);
  if (allClear && !anyUnknown) return "Clear";
  return "Unknown";
}

function nimbleLootDetectedTrapTypes(lootData) {
  return Object.values(NIMBLE_LOOT_TRAP_TYPES).filter((trapType) => nimbleLootTrapState(lootData, trapType) === NIMBLE_LOOT_TRAP_STATES.DETECTED);
}

function nimbleLootTrapStatusPatch(mechanicalStatus, magicalStatus) {
  return {
    trapStatus: {
      mechanical: mechanicalStatus,
      magical: magicalStatus
    }
  };
}

function nimbleLootTrapTriggerFlagName(reason) {
  if (reason === "failedPick") return "triggerOnFailedPick";
  if (reason === "failedForce") return "triggerOnFailedForce";
  if (reason === "failedDisarm") return "triggerOnFailedDisarm";
  if (reason === "open") return "triggerOnOpenIfArmed";
  return "triggerOnFailedDisarm";
}

function nimbleLootGetRollTableByNameOrId(tableName) {
  const trimmed = String(tableName ?? "").trim();
  if (!trimmed) return null;
  return game.tables?.get(trimmed) ?? game.tables?.find((t) => t.name === trimmed) ?? null;
}

async function nimbleLootTriggerTrap({ token, trapType, reason = "manual", user = game.user } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  const normalizedType = Object.values(NIMBLE_LOOT_TRAP_TYPES).includes(trapType) ? trapType : NIMBLE_LOOT_TRAP_TYPES.MECHANICAL;
  const trap = data.config.traps[normalizedType];
  if (!trap?.enabled) {
    return { ok: true, message: "No trap was armed.", triggered: false };
  }

  const status = foundry.utils.deepClone(data.state.trapStatus);
  status[normalizedType] = trap.oneShot === false ? NIMBLE_LOOT_TRAP_STATES.DETECTED : NIMBLE_LOOT_TRAP_STATES.TRIGGERED;
  const updated = await nimbleLootUpdateState(token, { trapStatus: status, lastInteractedBy: user?.id ?? null });

  const label = normalizedType === NIMBLE_LOOT_TRAP_TYPES.MAGICAL ? "Magical trap" : "Mechanical trap";
  const table = nimbleLootGetRollTableByNameOrId(trap.tableName);
  let postedTable = false;
  if (table) {
    await table.draw({ displayChat: true });
    postedTable = true;
  }
  if (!postedTable) {
    await nimbleLootPostSimpleChat(`${label} triggered!`, `The ${label.toLowerCase()} on ${nimbleLootGetDisplayName(token, data)} has been triggered.`);
  }

  return { ok: true, message: `${label} triggered.`, triggered: true, lootData: updated };
}

async function nimbleLootTriggerEligibleTraps({ token, reason, user = game.user } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) return { ok: false, error: "This token is not configured as Nimble Loot." };
  const flagName = nimbleLootTrapTriggerFlagName(reason);
  const results = [];
  for (const trapType of Object.values(NIMBLE_LOOT_TRAP_TYPES)) {
    const trap = data.config.traps[trapType];
    if (!trap?.enabled || trap?.[flagName] !== true) continue;
    const currentState = nimbleLootTrapState(data, trapType);
    if ([NIMBLE_LOOT_TRAP_STATES.DISARMED, NIMBLE_LOOT_TRAP_STATES.CLEAR].includes(currentState)) continue;
    if (trap.oneShot !== false && currentState === NIMBLE_LOOT_TRAP_STATES.TRIGGERED) continue;
    results.push(await nimbleLootTriggerTrap({ token, trapType, reason, user }));
  }
  return { ok: true, triggered: results.some((r) => r.triggered), results };
}

async function nimbleLootTriggerAllArmedTraps({ token, reason = "manual", user = game.user } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) return { ok: false, error: "This token is not configured as Nimble Loot." };
  const results = [];
  for (const trapType of Object.values(NIMBLE_LOOT_TRAP_TYPES)) {
    const trap = data.config.traps[trapType];
    if (!trap?.enabled) continue;
    const currentState = nimbleLootTrapState(data, trapType);
    if ([NIMBLE_LOOT_TRAP_STATES.DISARMED, NIMBLE_LOOT_TRAP_STATES.CLEAR].includes(currentState)) continue;
    if (trap.oneShot !== false && currentState === NIMBLE_LOOT_TRAP_STATES.TRIGGERED) continue;
    results.push(await nimbleLootTriggerTrap({ token, trapType, reason, user }));
  }
  return { ok: true, triggered: results.some((r) => r.triggered), results };
}

function nimbleLootInspectOutcomeMessage({ token, data, roll, triggered = false } = {}) {
  const containerName = nimbleLootGetDisplayName(token, data);
  const lockText = data.config.access.locked ? "it is locked" : "it is not locked";
  if (triggered) return `inspected ${containerName} carelessly; ${lockText}, and a trap was triggered.`;
  if (!roll?.success) return `inspected ${containerName}; ${lockText}, but no traps were identified.`;

  const mechanical = data.config.traps.mechanical.enabled;
  const magical = data.config.traps.magical.enabled;
  if (mechanical && magical) return `inspected ${containerName}; ${lockText}, and mechanical and magical traps were detected.`;
  if (mechanical) return `inspected ${containerName}; ${lockText}, and a mechanical trap was detected.`;
  if (magical) return `inspected ${containerName}; ${lockText}, and a magical trap was detected.`;
  return `inspected ${containerName}; ${lockText}, and the container looks clear.`;
}

async function nimbleLootInspectForTraps({ token, actor, user = game.user, rollResult = null } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  const maxInspect = data.config.access.maxInspectAttempts;
  const currentInspectAttempts = Number(data.state.inspectAttempts ?? 0);
  if (!nimbleLootAttemptsAllowed(maxInspect)) return { ok: false, error: "This container cannot be inspected." };
  if (maxInspect !== null && maxInspect > 0 && currentInspectAttempts >= maxInspect) return { ok: false, error: "No inspection attempts remain." };
  const inspectAttempts = currentInspectAttempts + 1;
  const roll = rollResult ?? await nimbleLootRollSkillToChat(actor, data.config.access.inspectSkill, data.config.access.inspectDc, "Inspect", { flatBonus: 0 });
  await nimbleLootUpdateState(token, { inspectAttempts, lastInteractedBy: user?.id ?? null });

  if (roll?.isNat1) {
    const triggerResult = await nimbleLootTriggerAllArmedTraps({ token, reason: "carelessInspect", user });
    const updatedAfterTrigger = nimbleLootGetData(token);
    const logged = await nimbleLootAppendPlayerLog(token, {
      section: "inspection",
      action: "inspect",
      outcome: `nat1-${data.config.access.locked ? "locked" : "unlocked"}-${triggerResult.triggered ? "triggered" : "no-trap"}`,
      actor,
      message: nimbleLootInspectOutcomeMessage({ token, data, roll, triggered: triggerResult.triggered })
    });
    return { ok: true, message: triggerResult.triggered ? "Trap triggered." : "Inspection complete.", roll, changed: true, lootData: logged ?? updatedAfterTrigger };
  }

  if (!roll.success) {
    const logged = await nimbleLootAppendPlayerLog(token, {
      section: "inspection",
      action: "inspect",
      outcome: `fail-${data.config.access.locked ? "locked" : "unlocked"}`,
      actor,
      message: nimbleLootInspectOutcomeMessage({ token, data, roll })
    });
    return { ok: true, message: "Inspection complete.", roll, changed: false, lootData: logged };
  }

  const mechanicalStatus = data.config.traps.mechanical.enabled ? NIMBLE_LOOT_TRAP_STATES.DETECTED : NIMBLE_LOOT_TRAP_STATES.CLEAR;
  const magicalStatus = data.config.traps.magical.enabled ? NIMBLE_LOOT_TRAP_STATES.DETECTED : NIMBLE_LOOT_TRAP_STATES.CLEAR;
  const updated = await nimbleLootUpdateState(token, nimbleLootTrapStatusPatch(mechanicalStatus, magicalStatus));
  const logged = await nimbleLootAppendPlayerLog(token, {
    section: "inspection",
    action: "inspect",
    outcome: `success-${data.config.access.locked ? "locked" : "unlocked"}-${mechanicalStatus}-${magicalStatus}`,
    actor,
    message: nimbleLootInspectOutcomeMessage({ token, data, roll })
  });
  return { ok: true, message: `Trap Status: ${nimbleLootGetTrapDisplayLabel(logged ?? updated)}`, roll, changed: true, lootData: logged ?? updated };
}

async function nimbleLootDisarmTrap({ token, actor, trapType, user = game.user, rollResult = null } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  const normalizedType = Object.values(NIMBLE_LOOT_TRAP_TYPES).includes(trapType) ? trapType : nimbleLootDetectedTrapTypes(data)[0];
  if (!normalizedType) return { ok: false, error: "No detected trap is available to disarm." };

  const skill = normalizedType === NIMBLE_LOOT_TRAP_TYPES.MAGICAL ? data.config.access.magicalDisarmSkill : data.config.access.mechanicalDisarmSkill;
  const dc = normalizedType === NIMBLE_LOOT_TRAP_TYPES.MAGICAL ? data.config.access.magicalDisarmDc : data.config.access.mechanicalDisarmDc;
  const roll = rollResult ?? await nimbleLootRollSkillToChat(actor, skill, dc, `Disarm ${nimbleLootTitleCase(normalizedType)} Trap`);
  const containerName = nimbleLootGetDisplayName(token, data);
  if (!roll.success) {
    const disarmAttempts = (data.state.disarmAttempts ?? 0) + 1;
    await nimbleLootUpdateState(token, { disarmAttempts, lastInteractedBy: user?.id ?? null });
    if (data.config.traps[normalizedType]?.triggerOnFailedDisarm) {
      const triggered = await nimbleLootTriggerTrap({ token, trapType: normalizedType, reason: "failedDisarm", user });
      const logged = await nimbleLootAppendPlayerLog(token, {
        section: "opening",
        action: `disarm-${normalizedType}`,
        outcome: "failed-triggered",
        actor,
        message: `failed to disarm the ${normalizedType} trap on ${containerName}, triggering it.`
      });
      return { ...triggered, roll, lootData: logged ?? triggered.lootData };
    }
    const logged = await nimbleLootAppendPlayerLog(token, {
      section: "opening",
      action: `disarm-${normalizedType}`,
      outcome: "failed",
      actor,
      message: `failed to disarm the ${normalizedType} trap on ${containerName}.`
    });
    return { ok: true, message: "Disarm attempt failed.", roll, lootData: logged };
  }

  const status = foundry.utils.deepClone(data.state.trapStatus);
  status[normalizedType] = NIMBLE_LOOT_TRAP_STATES.DISARMED;
  await nimbleLootUpdateState(token, { trapStatus: status, lastInteractedBy: user?.id ?? null });
  const logged = await nimbleLootAppendPlayerLog(token, {
    section: "opening",
    action: `disarm-${normalizedType}`,
    outcome: "success",
    actor,
    message: `disarmed the ${normalizedType} trap on ${containerName}.`
  });
  return { ok: true, message: `${nimbleLootTitleCase(normalizedType)} trap disarmed.`, roll, lootData: logged };
}

// === Nimble Loot: access service ===
function nimbleLootCanOpenDirectly(lootData) {
  if (!lootData) return false;
  if (lootData.state.jammed) return false;
  if (lootData.state.opened || lootData.type === NIMBLE_LOOT_TYPES.PILE) return true;
  if (lootData.config.access.locked) return false;
  return true;
}

async function nimbleLootOpenContainer({ token, actor = null, user = game.user } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  if (data.state.jammed) return { ok: false, error: "This container is jammed." };
  if (!nimbleLootCanOpenDirectly(data)) return { ok: false, error: "This container is locked." };

  await nimbleLootTriggerEligibleTraps({ token, reason: "open", user });
  const updated = await nimbleLootUpdateState(token, {
    opened: true,
    openedBy: user?.id ?? null,
    openedAt: Date.now(),
    lastInteractedBy: user?.id ?? null
  });
  return { ok: true, message: `${nimbleLootGetDisplayName(token, data)} opened.`, lootData: updated };
}

async function nimbleLootCarefullyOpenContainer({ token, actor = null, user = game.user } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  const containerName = nimbleLootGetDisplayName(token, data);
  if (data.state.carefulOpenAttempted) return { ok: false, error: "This container has already been carefully opened or tested." };
  if (data.state.jammed) {
    await nimbleLootUpdateState(token, { carefulOpenAttempted: true, lastInteractedBy: user?.id ?? null });
    const logged = await nimbleLootAppendPlayerLog(token, {
      section: "inspection",
      action: "careful-open",
      outcome: "jammed",
      actor,
      message: `carefully tried to open ${containerName}, but it is jammed.`
    });
    return { ok: true, message: "The container is jammed.", lootData: logged };
  }
  if (data.config.access.locked) {
    await nimbleLootUpdateState(token, { carefulOpenAttempted: true, lastInteractedBy: user?.id ?? null });
    const logged = await nimbleLootAppendPlayerLog(token, {
      section: "inspection",
      action: "careful-open",
      outcome: "locked",
      actor,
      message: `carefully tried to open ${containerName}, but it seems locked.`
    });
    return { ok: true, message: "The container seems locked.", lootData: logged };
  }

  await nimbleLootTriggerEligibleTraps({ token, reason: "open", user });
  await nimbleLootUpdateState(token, {
    carefulOpenAttempted: true,
    opened: true,
    openedBy: user?.id ?? null,
    openedAt: Date.now(),
    lastInteractedBy: user?.id ?? null
  });
  const logged = await nimbleLootAppendPlayerLog(token, {
    section: "inspection",
    action: "careful-open",
    outcome: "opened",
    actor,
    message: `carefully opened ${containerName}.`
  });
  return { ok: true, message: `${containerName} opened.`, lootData: logged };
}

async function nimbleLootPickLock({ token, actor, user = game.user, rollResult = null } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  const containerName = nimbleLootGetDisplayName(token, data);
  if (data.state.jammed) return { ok: false, error: "This lock is jammed." };
  if (!data.config.access.locked) return { ok: false, error: "This container is not locked." };
  if (!nimbleLootAttemptsAllowed(data.config.access.maxPickAttempts)) return { ok: false, error: "This lock cannot be picked." };

  const roll = rollResult ?? await nimbleLootRollSkillToChat(actor, data.config.access.pickSkill, data.config.access.pickDc, "Pick Lock");
  if (roll.success) {
    await nimbleLootUpdateState(token, {
      opened: true,
      jammed: false,
      openedBy: user?.id ?? null,
      openedAt: Date.now(),
      lastInteractedBy: user?.id ?? null
    });
    await nimbleLootTriggerEligibleTraps({ token, reason: "open", user });
    const logged = await nimbleLootAppendPlayerLog(token, {
      section: "opening",
      action: "pick",
      outcome: "success",
      actor,
      message: `picked the lock on ${containerName} and opened it.`
    });
    return { ok: true, message: "Lock picked.", roll, lootData: logged };
  }

  const pickAttempts = (data.state.pickAttempts ?? 0) + 1;
  const max = data.config.access.maxPickAttempts;
  const shouldJam = max !== null && max > 0 && pickAttempts >= max;
  await nimbleLootUpdateState(token, {
    pickAttempts,
    jammed: shouldJam,
    lastInteractedBy: user?.id ?? null
  });
  await nimbleLootTriggerEligibleTraps({ token, reason: "failedPick", user });
  const logged = await nimbleLootAppendPlayerLog(token, {
    section: "opening",
    action: "pick",
    outcome: shouldJam ? "failed-jammed" : "failed",
    actor,
    message: shouldJam ? `failed to pick the lock on ${containerName}, jamming it.` : `failed to pick the lock on ${containerName}.`
  });
  return { ok: true, message: shouldJam ? "The lock jams." : "Lockpick attempt failed.", roll, lootData: logged };
}

async function nimbleLootForceOpen({ token, actor, user = game.user, rollResult = null } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  const containerName = nimbleLootGetDisplayName(token, data);
  if (!nimbleLootAttemptsAllowed(data.config.access.maxForceAttempts)) return { ok: false, error: "This container cannot be forced open." };

  const roll = rollResult ?? await nimbleLootRollSkillToChat(actor, data.config.access.forceSkill, data.config.access.forceDc, "Force Open");
  if (roll.success) {
    await nimbleLootUpdateState(token, {
      opened: true,
      openedBy: user?.id ?? null,
      openedAt: Date.now(),
      lastInteractedBy: user?.id ?? null
    });
    await nimbleLootTriggerEligibleTraps({ token, reason: "open", user });
    const logged = await nimbleLootAppendPlayerLog(token, {
      section: "opening",
      action: "force",
      outcome: "success",
      actor,
      message: `forced open ${containerName}.`
    });
    return { ok: true, message: "Forced open.", roll, lootData: logged };
  }

  const forceAttempts = (data.state.forceAttempts ?? 0) + 1;
  await nimbleLootUpdateState(token, {
    forceAttempts,
    lastInteractedBy: user?.id ?? null
  });
  await nimbleLootTriggerEligibleTraps({ token, reason: "failedForce", user });
  const logged = await nimbleLootAppendPlayerLog(token, {
    section: "opening",
    action: "force",
    outcome: "failed",
    actor,
    message: `failed to force open ${containerName}.`
  });
  return { ok: true, message: "Force open attempt failed.", roll, lootData: logged };
}

async function nimbleLootUseKeyCode({ token, actor = null, user = game.user, code = "" } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  const containerName = nimbleLootGetDisplayName(token, data);
  const expected = nimbleLootSanitizeText(data.config?.access?.keyCode);
  const supplied = nimbleLootSanitizeText(code);

  if (!expected) throw new Error("This container does not have a key/code option configured.");
  if (data.state.jammed) {
    const logged = await nimbleLootAppendPlayerLog(token, {
      section: "opening",
      action: "key-code",
      outcome: "jammed",
      actor,
      message: `tried a key/code on ${containerName}, but it is jammed.`
    });
    return { ok: true, message: "The container is jammed.", lootData: logged };
  }

  if (supplied !== expected) {
    const logged = await nimbleLootAppendPlayerLog(token, {
      section: "opening",
      action: "key-code",
      outcome: "wrong",
      actor,
      message: `tried an incorrect key/code on ${containerName}.`
    });
    return { ok: true, message: "The key/code does not work.", lootData: logged };
  }

  const next = foundry.utils.deepClone(data);
  next.config.access.locked = false;
  next.state.opened = true;
  next.state.openedBy = user?.id ?? null;
  next.state.openedAt = Date.now();
  next.state.lastInteractedBy = user?.id ?? null;
  await nimbleLootSetData(token, next);
  await nimbleLootTriggerEligibleTraps({ token, reason: "open", user });
  const logged = await nimbleLootAppendPlayerLog(token, {
    section: "opening",
    action: "key-code",
    outcome: "success",
    actor,
    message: `used the correct key/code on ${containerName} and opened it.`
  });
  return { ok: true, message: "Key/code accepted.", lootData: logged };
}

async function nimbleLootResealContainer(token) {
  const updated = await nimbleLootUpdateState(token, {
    opened: false,
    jammed: false,
    pickAttempts: 0,
    forceAttempts: 0,
    inspectAttempts: 0,
    disarmAttempts: 0,
    carefulOpenAttempted: false,
    playerLog: { inspection: [], opening: [] },
    openedBy: null,
    openedAt: null
  });
  return { ok: true, message: "Loot state reset.", lootData: updated };
}

async function nimbleLootClearTrapStatus(token) {
  const updated = await nimbleLootUpdateState(token, {
    trapStatus: {
      mechanical: NIMBLE_LOOT_TRAP_STATES.UNKNOWN,
      magical: NIMBLE_LOOT_TRAP_STATES.UNKNOWN
    }
  });
  return { ok: true, message: "Trap status cleared.", lootData: updated };
}

// === Nimble Loot: transfer service ===
function nimbleLootCanTakeContents(token, lootData = null) {
  const data = lootData ?? nimbleLootGetData(token);
  if (!data) return false;
  if (!data.config.permissions.playersCanTake) return false;
  return nimbleLootCanShowContents(data);
}

async function nimbleLootAfterContentsChanged(token) {
  const data = nimbleLootGetData(token);
  if (!data) return null;
  if (data.type === NIMBLE_LOOT_TYPES.PILE && nimbleLootIsDepleted(token, data)) {
    const doc = nimbleLootTokenDocument(token);
    const name = doc?.name ?? data.config?.label ?? "Loot Pile";
    await doc?.delete?.();
    return { ...data, _deleted: true, _deletedName: name };
  }
  if (data.state.depleted) {
    return nimbleLootUpdateState(token, { depleted: false });
  }
  return data;
}

async function nimbleLootMarkDepletedIfEmpty(token) {
  return nimbleLootAfterContentsChanged(token);
}

function nimbleLootSceneTokenDocuments(sceneId = canvas?.scene?.id) {
  const scene = sceneId ? game.scenes?.get(sceneId) : canvas?.scene;
  const tokens = scene?.tokens?.contents ?? scene?.tokens ?? [];
  return Array.from(tokens);
}

function nimbleLootGetScenePartyActors({ sceneId = canvas?.scene?.id, excludeTokenId = null } = {}) {
  const actors = [];
  const seen = new Set();

  for (const tokenDoc of nimbleLootSceneTokenDocuments(sceneId)) {
    if (!tokenDoc) continue;
    if (excludeTokenId && tokenDoc.id === excludeTokenId) continue;
    if (nimbleLootHasData(tokenDoc)) continue;

    const actor = tokenDoc.actor;
    if (!actor) continue;
    if (actor.type !== "character") continue;
    if (actor.hasPlayerOwner !== true) continue;

    const key = actor.uuid ?? actor.id;
    if (seen.has(key)) continue;
    seen.add(key);
    actors.push(actor);
  }

  if (!actors.length) {
    for (const user of game.users ?? []) {
      const actor = user.character;
      if (!actor || actor.type !== "character") continue;
      if (actor.hasPlayerOwner !== true) continue;
      const key = actor.uuid ?? actor.id;
      if (seen.has(key)) continue;
      seen.add(key);
      actors.push(actor);
    }
  }

  return actors;
}

function nimbleLootSplitCurrencyEvenly(currency, actorCount) {
  const available = nimbleLootNormalizeCurrency(currency);
  const count = Math.max(0, Math.floor(Number(actorCount) || 0));
  if (count <= 0) return { share: { gp: 0, sp: 0, cp: 0 }, distributed: { gp: 0, sp: 0, cp: 0 }, remainder: available };

  const share = {
    gp: Math.floor(available.gp / count),
    sp: Math.floor(available.sp / count),
    cp: Math.floor(available.cp / count)
  };

  const distributed = {
    gp: share.gp * count,
    sp: share.sp * count,
    cp: share.cp * count
  };

  const remainder = {
    gp: available.gp - distributed.gp,
    sp: available.sp - distributed.sp,
    cp: available.cp - distributed.cp
  };

  return { share, distributed, remainder };
}

async function nimbleLootTakeItem({ token, actor, itemId, quantity = 1, user = game.user } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  if (!nimbleLootCanTakeContents(token, data)) throw new Error("The contents are not available yet.");
  if (!actor) throw new Error("No receiving actor found.");

  const lootActor = nimbleLootGetLootActor(token);
  const sourceItem = lootActor?.items?.get(itemId);
  if (!sourceItem || !nimbleLootIsLootItem(sourceItem)) throw new Error("That loot item could not be found.");

  const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  await nimbleLootAddItemToActor(actor, sourceItem, normalizedQuantity);
  await nimbleLootReduceSourceItem(sourceItem, normalizedQuantity);
  const updated = await nimbleLootMarkDepletedIfEmpty(token);

  const message = `${actor.name} takes ${normalizedQuantity} × ${sourceItem.name}.`;
  if (nimbleLootSetting("postRoutineLootReceiptsToChat")) await nimbleLootPostSimpleChat("Loot Taken", message);
  return { ok: true, message, lootData: updated };
}

async function nimbleLootTakeCurrency({ token, actor, currency, user = game.user } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  if (!nimbleLootCanTakeContents(token, data)) throw new Error("The contents are not available yet.");
  if (!actor) throw new Error("No receiving actor found.");

  const normalized = nimbleLootNormalizeCurrency(currency);
  if (nimbleLootIsCurrencyEmpty(normalized)) throw new Error("No currency selected.");
  if (!nimbleLootHasLootCurrency(token, normalized)) throw new Error("This loot pile does not have enough currency.");
  await nimbleLootAddCurrency(actor, normalized);
  await nimbleLootSubtractLootCurrency(token, normalized);
  const updated = await nimbleLootMarkDepletedIfEmpty(token);
  const message = `${actor.name} takes ${nimbleLootFormatCurrency(normalized)}.`;
  if (nimbleLootSetting("postRoutineLootReceiptsToChat")) await nimbleLootPostSimpleChat("Currency Taken", message);
  return { ok: true, message, lootData: updated };
}


async function nimbleLootLeaveCurrency({ token, actor, currency, user = game.user } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  if (!nimbleLootCanTakeContents(token, data)) throw new Error("The contents are not available yet.");
  if (!actor) throw new Error("No actor found.");

  const normalized = nimbleLootNormalizeCurrency(currency);
  if (nimbleLootIsCurrencyEmpty(normalized)) throw new Error("No currency selected.");
  if (!nimbleLootHasCurrency(actor, normalized)) throw new Error(`${actor.name} does not have enough currency.`);

  await nimbleLootSubtractCurrency(actor, normalized);
  const currentLoot = nimbleLootGetLootCurrency(token);
  await nimbleLootSetLootCurrency(token, {
    gp: currentLoot.gp + normalized.gp,
    sp: currentLoot.sp + normalized.sp,
    cp: currentLoot.cp + normalized.cp
  });
  const updated = await nimbleLootAfterContentsChanged(token);
  const message = `${actor.name} leaves ${nimbleLootFormatCurrency(normalized)}.`;
  if (nimbleLootSetting("postRoutineLootReceiptsToChat")) await nimbleLootPostSimpleChat("Currency Left", message);
  return { ok: true, message, lootData: updated };
}

async function nimbleLootDepositItem({ token, actor, itemId, quantity = 1, user = game.user, slotIndex = null } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  if (!nimbleLootCanTakeContents(token, data)) throw new Error("The container is not open yet.");
  if (!actor) throw new Error("No source actor found.");

  const sourceItem = actor.items?.get(itemId);
  if (!sourceItem || !nimbleLootIsLootItem(sourceItem)) throw new Error("That item could not be found on your actor.");
  const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const available = nimbleLootGetItemQuantity(sourceItem);
  if (normalizedQuantity > available) throw new Error(`${actor.name} only has ${available} × ${sourceItem.name}.`);

  const lootActor = nimbleLootGetLootActor(token);
  if (!lootActor) throw new Error("This loot token does not have an actor for item storage.");

  const addedItem = await nimbleLootAddItemToActor(lootActor, sourceItem, normalizedQuantity);
  await nimbleLootReduceSourceItem(sourceItem, normalizedQuantity);
  if (addedItem && slotIndex !== null && slotIndex !== undefined && slotIndex !== "") {
    await nimbleLootMoveGridItem({ token, itemId: addedItem.id, slotIndex });
  }
  const updated = await nimbleLootAfterContentsChanged(token);
  const message = `${actor.name} leaves ${normalizedQuantity} × ${sourceItem.name}.`;
  if (nimbleLootSetting("postRoutineLootReceiptsToChat")) await nimbleLootPostSimpleChat("Item Left", message);
  return { ok: true, message, lootData: updated };
}


async function nimbleLootMoveGridItem({ token, itemId, slotIndex } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  const actor = nimbleLootGetLootActor(token);
  const item = actor?.items?.get(itemId);
  if (!item) throw new Error("That item could not be found in this container.");
  const { total } = nimbleLootGridDimensions(data);
  const target = Math.max(0, Math.min(total - 1, Math.floor(Number(slotIndex) || 0)));
  const gridSlots = foundry.utils.deepClone(data.state.gridSlots ?? {});

  const occupyingItemId = Object.entries(gridSlots).find(([otherItemId, otherSlot]) => otherItemId !== itemId && Number(otherSlot) === target)?.[0] ?? null;
  const current = gridSlots[itemId];
  gridSlots[itemId] = target;
  if (occupyingItemId) {
    if (current !== undefined && current !== null && current !== "") gridSlots[occupyingItemId] = current;
    else delete gridSlots[occupyingItemId];
  }

  const updated = await nimbleLootUpdateState(token, { gridSlots });
  return { ok: true, message: "", lootData: updated };
}

async function nimbleLootSplitCurrencyEvenlyBetweenParty({ token, user = game.user, sceneId = canvas?.scene?.id } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  if (!nimbleLootCanTakeContents(token, data)) throw new Error("The contents are not available yet.");

  const partyActors = nimbleLootGetScenePartyActors({ sceneId, excludeTokenId: nimbleLootTokenDocument(token)?.id });
  if (!partyActors.length) throw new Error("No player character actors were found on this scene to split currency between.");

  const available = nimbleLootGetLootCurrency(data);
  if (nimbleLootIsCurrencyEmpty(available)) throw new Error("There is no currency to split.");

  const { share, distributed, remainder } = nimbleLootSplitCurrencyEvenly(available, partyActors.length);
  if (nimbleLootIsCurrencyEmpty(distributed)) {
    throw new Error(`Not enough currency to split evenly between ${partyActors.length} heroes. Use Take Portion instead.`);
  }

  for (const actor of partyActors) {
    await nimbleLootAddCurrency(actor, share);
  }

  await nimbleLootSubtractLootCurrency(token, distributed);
  const updated = await nimbleLootMarkDepletedIfEmpty(token);
  const message = `Split ${nimbleLootFormatCurrency(distributed)} evenly between ${partyActors.length} heroes (${nimbleLootFormatCurrency(share)} each${nimbleLootIsCurrencyEmpty(remainder) ? "" : `, ${nimbleLootFormatCurrency(remainder)} left behind`}).`;
  if (nimbleLootSetting("postRoutineLootReceiptsToChat")) await nimbleLootPostSimpleChat("Currency Split", message);
  return { ok: true, message, lootData: updated, actors: partyActors.map((actor) => actor.name), share, distributed, remainder };
}

async function nimbleLootTakeAllVisibleLoot({ token, actor, user = game.user } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) throw new Error("This token is not configured as Nimble Loot.");
  if (!nimbleLootCanTakeContents(token, data)) throw new Error("The contents are not available yet.");
  if (!actor) throw new Error("No receiving actor found.");

  const lootActor = nimbleLootGetLootActor(token);
  if (!lootActor) throw new Error("This loot token has no actor contents.");

  const items = nimbleLootGetVisibleLootItems(token, data);
  for (const item of items) {
    const quantity = nimbleLootGetItemQuantity(item);
    await nimbleLootAddItemToActor(actor, item, quantity);
    await nimbleLootReduceSourceItem(item, quantity);
  }

  const currency = nimbleLootGetLootCurrency(data);
  if (!nimbleLootIsCurrencyEmpty(currency)) {
    if (!nimbleLootHasLootCurrency(token, currency)) throw new Error("This loot pile does not have enough currency.");
    await nimbleLootAddCurrency(actor, currency);
    await nimbleLootSubtractLootCurrency(token, currency);
  }

  const updated = await nimbleLootMarkDepletedIfEmpty(token);
  const message = `${actor.name} takes all visible loot.`;
  if (nimbleLootSetting("postRoutineLootReceiptsToChat")) await nimbleLootPostSimpleChat("Loot Taken", message);
  return { ok: true, message, lootData: updated };
}

// === Nimble Loot: socket service ===
const nimbleLootPendingSocketResponses = new Map();
let nimbleLootSocketRegistered = false;

function nimbleLootIsPrimaryGm() {
  if (!game.user?.isGM) return false;
  const activeGms = game.users?.filter((u) => u.active && u.isGM).sort((a, b) => String(a.id).localeCompare(String(b.id))) ?? [];
  return activeGms[0]?.id === game.user.id;
}

function nimbleLootBuildSocketRequest(action, payload = {}) {
  return {
    requestId: foundry.utils.randomID(),
    action,
    userId: game.user.id,
    sceneId: canvas?.scene?.id ?? null,
    payload
  };
}

async function nimbleLootResolveSocketContext(request) {
  const sceneId = request.sceneId ?? request.payload?.sceneId;
  const tokenId = request.payload?.tokenId;
  const actorId = request.payload?.actorId;
  const actorUuid = request.payload?.actorUuid;
  const token = nimbleLootGetSceneTokenByIds(sceneId, tokenId);
  const actor = actorUuid || actorId ? nimbleLootGetActorByUuidOrId(actorUuid, actorId) : null;
  const user = game.users?.get(request.userId) ?? null;
  return { token, actor, user };
}

async function nimbleLootHandleSocketRequest(request) {
  if (!game.user?.isGM) return null;
  if (!nimbleLootIsPrimaryGm()) return null;

  try {
    // CREATE_PILE_FROM_ITEM is the one socket action that intentionally has no existing loot token yet.
    // Handle it before resolving/validating token context so player-owned actor-item drops can create a new pile.
    if (request.action === NIMBLE_LOOT_SOCKET_ACTIONS.CREATE_PILE_FROM_ITEM) {
      const scene = game.scenes?.get(request.payload?.sceneId ?? request.sceneId) ?? canvas?.scene;
      const result = await nimbleLootCreatePileFromItemDrop({
        itemUuid: request.payload?.itemUuid,
        quantity: request.payload?.quantity,
        x: request.payload?.x,
        y: request.payload?.y,
        scene,
        reduceSource: request.payload?.reduceSource === true
      });
      const response = { requestId: request.requestId, ok: result?.ok !== false, message: result?.message ?? "Done.", data: result ?? {} };
      game.socket.emit(NIMBLE_LOOT_SOCKET_NAME, { type: "response", targetUserId: request.userId, response });
      if (result?.token) nimbleLootBroadcastRefresh(result.token);
      return response;
    }

    if (request.action === NIMBLE_LOOT_SOCKET_ACTIONS.CREATE_PILE_FROM_CONTAINER_ITEM) {
      const scene = game.scenes?.get(request.payload?.sceneId ?? request.sceneId) ?? canvas?.scene;
      const result = await nimbleLootCreatePileFromContainerItemDrop({
        sourceSceneId: request.payload?.sourceSceneId,
        sourceTokenId: request.payload?.sourceTokenId,
        itemId: request.payload?.itemId,
        quantity: request.payload?.quantity,
        x: request.payload?.x,
        y: request.payload?.y,
        scene
      });
      const response = { requestId: request.requestId, ok: result?.ok !== false, message: result?.message ?? "Done.", data: result ?? {} };
      game.socket.emit(NIMBLE_LOOT_SOCKET_NAME, { type: "response", targetUserId: request.userId, response });
      if (result?.token) nimbleLootBroadcastRefresh(result.token);
      return response;
    }

    const { token, actor, user } = await nimbleLootResolveSocketContext(request);
    if (!token) throw new Error("The loot token could not be found.");
    if (!nimbleLootHasData(token)) throw new Error("That token is not configured as Nimble Loot.");

    let result;
    switch (request.action) {
      case NIMBLE_LOOT_SOCKET_ACTIONS.TRANSFER_ITEM:
        result = await nimbleLootTakeItem({ token, actor, itemId: request.payload.itemId, quantity: request.payload.quantity, user });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.DEPOSIT_ITEM:
        result = await nimbleLootDepositItem({ token, actor, itemId: request.payload.itemId, quantity: request.payload.quantity, user, slotIndex: request.payload.slotIndex });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.MOVE_GRID_ITEM:
        result = await nimbleLootMoveGridItem({ token, itemId: request.payload.itemId, slotIndex: request.payload.slotIndex });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.TRANSFER_CURRENCY:
        result = await nimbleLootTakeCurrency({ token, actor, currency: request.payload.currency, user });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.LEAVE_CURRENCY:
        result = await nimbleLootLeaveCurrency({ token, actor, currency: request.payload.currency, user });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.SPLIT_CURRENCY:
        result = await nimbleLootSplitCurrencyEvenlyBetweenParty({ token, user, sceneId: request.payload.sceneId ?? request.sceneId });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.TAKE_ALL:
        result = await nimbleLootTakeAllVisibleLoot({ token, actor, user });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.OPEN:
        result = await nimbleLootOpenContainer({ token, actor, user });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.CAREFUL_OPEN:
        result = await nimbleLootCarefullyOpenContainer({ token, actor, user });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.USE_KEY_CODE:
        result = await nimbleLootUseKeyCode({ token, actor, user, code: request.payload.code });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.INSPECT:
        result = await nimbleLootInspectForTraps({ token, actor, user, rollResult: request.payload.rollResult ?? null });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.PICK_LOCK:
        result = await nimbleLootPickLock({ token, actor, user, rollResult: request.payload.rollResult ?? null });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.FORCE_OPEN:
        result = await nimbleLootForceOpen({ token, actor, user, rollResult: request.payload.rollResult ?? null });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.DISARM_TRAP:
        result = await nimbleLootDisarmTrap({ token, actor, trapType: request.payload.trapType, user, rollResult: request.payload.rollResult ?? null });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.TRIGGER_TRAP:
        result = await nimbleLootTriggerTrap({ token, trapType: request.payload.trapType, reason: request.payload.reason, user });
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.UPDATE_STATE:
        result = { ok: true, lootData: await nimbleLootUpdateState(token, request.payload.updates ?? {}) };
        break;
      case NIMBLE_LOOT_SOCKET_ACTIONS.UPDATE_CONFIG:
        result = { ok: true, lootData: await nimbleLootUpdateConfig(token, request.payload.updates ?? {}) };
        break;
      default:
        throw new Error(`Unknown Nimble Loot socket action: ${request.action}`);
    }

    const response = { requestId: request.requestId, ok: result?.ok !== false, message: result?.message ?? "Done.", data: result ?? {} };
    game.socket.emit(NIMBLE_LOOT_SOCKET_NAME, { type: "response", targetUserId: request.userId, response });
    nimbleLootBroadcastRefresh(token);
    return response;
  } catch (error) {
    const response = { requestId: request.requestId, ok: false, error: error.message ?? String(error) };
    game.socket.emit(NIMBLE_LOOT_SOCKET_NAME, { type: "response", targetUserId: request.userId, response });
    nimbleLootError("Socket request failed", error);
    return response;
  }
}

function nimbleLootBroadcastRefresh(tokenOrDocument) {
  const tokenDoc = nimbleLootTokenDocument(tokenOrDocument);
  if (!tokenDoc) return;
  const sceneId = tokenDoc.parent?.id ?? canvas?.scene?.id ?? null;
  game.socket?.emit?.(NIMBLE_LOOT_SOCKET_NAME, { type: "refresh", sceneId, tokenId: tokenDoc.id });
  nimbleLootRefreshOpenDialogsForToken(tokenDoc);
}

function nimbleLootHandleSocketMessage(message) {
  if (!message || typeof message !== "object") return;
  if (message.type === "refresh") {
    const token = nimbleLootGetSceneTokenByIds(message.sceneId, message.tokenId);
    if (token) nimbleLootRefreshOpenDialogsForToken(token);
    return;
  }
  if (message.type === "request") {
    nimbleLootHandleSocketRequest(message.request);
    return;
  }
  if (message.type === "response") {
    if (message.targetUserId && message.targetUserId !== game.user.id) return;
    const pending = nimbleLootPendingSocketResponses.get(message.response?.requestId);
    if (!pending) return;
    nimbleLootPendingSocketResponses.delete(message.response.requestId);
    pending.resolve(message.response);
  }
}

function registerNimbleLootSocketService() {
  if (nimbleLootSocketRegistered) return;
  game.socket?.on?.(NIMBLE_LOOT_SOCKET_NAME, nimbleLootHandleSocketMessage);
  nimbleLootSocketRegistered = true;
}

function nimbleLootHasActiveGm() {
  return game.users?.some((user) => user.active && user.isGM) === true;
}

async function nimbleLootRequestGmAction(action, payload = {}) {
  if (game.user?.isGM) {
    const request = nimbleLootBuildSocketRequest(action, payload);
    const response = await nimbleLootHandleSocketRequest(request);
    if (response?.ok === false) throw new Error(response.error);
    return response;
  }

  if (!nimbleLootHasActiveGm()) {
    throw new Error("A GM must be connected to update this loot.");
  }

  const request = nimbleLootBuildSocketRequest(action, payload);
  const promise = new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      nimbleLootPendingSocketResponses.delete(request.requestId);
      reject(new Error("The GM update request timed out."));
    }, 10000);

    nimbleLootPendingSocketResponses.set(request.requestId, {
      resolve: (response) => {
        window.clearTimeout(timeout);
        resolve(response);
      },
      reject
    });
  });

  game.socket.emit(NIMBLE_LOOT_SOCKET_NAME, { type: "request", request });
  const response = await promise;
  if (response?.ok === false) throw new Error(response.error ?? "Nimble Loot request failed.");
  return response;
}

async function nimbleLootRunMaybeViaGm(action, payload, directFn) {
  if (game.user?.isGM) {
    const result = await directFn();
    const token = nimbleLootGetSceneTokenByIds(payload?.sceneId, payload?.tokenId);
    if (token) nimbleLootBroadcastRefresh(token);
    return result;
  }
  const response = await nimbleLootRequestGmAction(action, payload);
  return response?.data ?? response;
}

// === Nimble Loot: player dialog ===
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

// === Nimble Loot: GM config dialog ===
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

// === Nimble Loot: canvas item drop service ===
function nimbleLootGetContainerItemDropSource(data) {
  return data?.flags?.[NIMBLE_LOOT_MODULE_ID]?.sourceContainer
    ?? data?.sourceContainer
    ?? data?.[NIMBLE_LOOT_MODULE_ID]?.sourceContainer
    ?? null;
}

function nimbleLootIsContainerItemDrop(data) {
  return String(data?.type ?? "") === "NimbleLootContainerItem" || Boolean(nimbleLootGetContainerItemDropSource(data));
}

function nimbleLootResolveContainerItemSource(data) {
  const source = nimbleLootGetContainerItemDropSource(data);
  if (!source?.sceneId || !source?.tokenId || !source?.itemId) return null;
  const token = nimbleLootGetSceneTokenByIds(source.sceneId, source.tokenId);
  const lootData = nimbleLootGetData(token);
  const actor = nimbleLootGetLootActor(token);
  const item = actor?.items?.get(source.itemId) ?? null;
  return { source, token, lootData, actor, item };
}

async function nimbleLootResolveDroppedItem(data) {
  if (nimbleLootIsContainerItemDrop(data)) {
    return nimbleLootResolveContainerItemSource(data)?.item ?? null;
  }

  const uuid = data?.uuid ?? data?.itemUuid ?? data?.documentUuid;
  if (uuid) {
    const document = await fromUuid(uuid);
    if (document?.documentName === "Item" || document instanceof Item) return document;
  }

  if (data?.type === "Item" && data?.id) {
    return game.items?.get(data.id) ?? null;
  }

  return null;
}

function nimbleLootIsEmbeddedActorItem(item) {
  return item?.parent?.documentName === "Actor";
}

function nimbleLootCanUserMoveDroppedItem(item, user = game.user) {
  if (user?.isGM) return true;
  if (!nimbleLootIsEmbeddedActorItem(item)) return false;
  return item.parent?.testUserPermission?.(user, CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) === true;
}

async function nimbleLootPromptDropQuantity({ itemName, max, title = "Drop Item" } = {}) {
  const safeMax = Math.max(1, Math.floor(Number(max) || 1));
  if (safeMax <= 1) return 1;

  const safeItemName = foundry.utils.escapeHTML(itemName ?? "Item");
  const content = `<form class="nimble-loot-quantity-dialog nimble-loot-dialogv2-form">
    <p>How many <strong>${safeItemName}</strong> do you want to drop?</p>
    <p class="nimble-loot-muted nimble-loot-small-note">Available: ${safeMax}</p>
    <input class="nimble-loot-quantity-small" type="number" name="quantity" min="1" max="${safeMax}" value="1" autofocus>
  </form>`;
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
        window: { title },
        content,
        modal: true,
        buttons: [{
          action: "drop",
          label: "Drop",
          icon: "fas fa-check",
          default: true,
          callback: (_event, button) => done(readQuantity(button))
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
          ok: {
            icon: '<i class="fas fa-check"></i>',
            label: "Drop",
            callback: (html) => done(readQuantity(html))
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => done(null)
          }
        },
        default: "ok",
        close: () => done(null)
      }).render(true);
    });
  }

  const raw = globalThis.prompt?.(`How many ${itemName} do you want to drop? Available: ${safeMax}`, "1");
  if (raw === null) return null;
  return Math.max(1, Math.min(safeMax, Math.floor(Number(raw) || 1)));
}

function nimbleLootPrepareDroppedItemData(item, quantity = 1) {
  const itemData = item.toObject ? item.toObject() : foundry.utils.deepClone(item);
  if (!itemData.system || typeof itemData.system !== "object") itemData.system = {};
  const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  foundry.utils.setProperty(itemData, NIMBLE_LOOT_ITEM_QUANTITY_PATH, normalizedQuantity);
  delete itemData._id;
  return itemData;
}

function nimbleLootFindBaseLootActor() {
  return game.actors?.find((actor) => actor.getFlag?.(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_BASE_ACTOR_FLAG) === true)
    ?? game.actors?.getName?.(NIMBLE_LOOT_BASE_ACTOR_NAME)
    ?? null;
}

async function nimbleLootGetOrCreateBaseLootActor() {
  let actor = nimbleLootFindBaseLootActor();
  if (actor) {
    if (actor.getFlag?.(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_BASE_ACTOR_FLAG) !== true) {
      await actor.setFlag(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_BASE_ACTOR_FLAG, true);
    }
    return actor;
  }

  actor = await Actor.create({
    name: NIMBLE_LOOT_BASE_ACTOR_NAME,
    type: "npc",
    img: "icons/svg/chest.svg",
    ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS?.OBSERVER ?? 2 },
    flags: { [NIMBLE_LOOT_MODULE_ID]: { [NIMBLE_LOOT_BASE_ACTOR_FLAG]: true } }
  }, { renderSheet: false });

  if (!actor) throw new Error("Failed to create the reusable Nimble Loot actor.");
  nimbleLootNotify(`Created reusable actor: ${NIMBLE_LOOT_BASE_ACTOR_NAME}`);
  return actor;
}

async function nimbleLootAddItemToDroppedPileToken(tokenDocument, itemData) {
  const tokenActor = tokenDocument?.actor ?? tokenDocument?.object?.actor;
  if (!tokenActor) throw new Error("The dropped loot token did not resolve a synthetic actor.");

  // For unlinked tokens, Foundry stores these embedded item changes on the token actor delta.
  // This keeps all dropped piles pointed at one reusable base actor instead of creating a new world actor per drop.
  await tokenActor.createEmbeddedDocuments("Item", [itemData], { renderSheet: false });
  if (tokenActor.isToken !== true) {
    nimbleLootWarn("Dropped loot item was added to a non-synthetic actor. Check that the token is actorLink: false.");
  }
}

async function nimbleLootMaybeReduceDroppedSourceItem(item, quantity) {
  if (!nimbleLootIsEmbeddedActorItem(item)) return false;
  const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const available = nimbleLootGetItemQuantity(item);
  if (normalizedQuantity > available) throw new Error(`${item.parent?.name ?? "Actor"} only has ${available} × ${item.name}.`);
  await nimbleLootReduceSourceItem(item, normalizedQuantity);
  return true;
}

async function nimbleLootCreatePileFromItemDrop({ item, itemUuid = null, x, y, scene = canvas?.scene, quantity = 1, reduceSource = false } = {}) {
  if (!game.user?.isGM) {
    nimbleLootNotify("Only the GM can create Nimble Loot piles from canvas item drops.", "warn");
    return null;
  }
  if (!scene) throw new Error("No active scene found.");

  let resolvedItem = item;
  if (!resolvedItem && itemUuid) resolvedItem = await fromUuid(itemUuid);
  if (!resolvedItem || resolvedItem.documentName !== "Item") throw new Error("No item was dropped.");
  if (!nimbleLootIsLootItem(resolvedItem)) {
    nimbleLootNotify(`${resolvedItem.name} is not a Nimble object item, so Nimble Loot did not create a pile.`, "warn");
    return null;
  }

  const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const available = nimbleLootGetItemQuantity(resolvedItem);
  if (normalizedQuantity > available) throw new Error(`${resolvedItem.parent?.name ?? "Source"} only has ${available} × ${resolvedItem.name}.`);

  const itemData = nimbleLootPrepareDroppedItemData(resolvedItem, normalizedQuantity);
  const baseActor = await nimbleLootGetOrCreateBaseLootActor();
  const pileName = resolvedItem.name || "Loot Pile";

  const lootData = nimbleLootCreateDefaultData(NIMBLE_LOOT_TYPES.PILE);
  lootData.config.label = pileName;
  lootData.config.description = "Loose loot.";
  lootData.state.opened = true;
  lootData.state.discovered = true;
  lootData.config.highlight.enabled = nimbleLootSetting("enableTokenBorder") === true;

  const tokenData = {
    name: pileName,
    actorId: baseActor.id,
    actorLink: false,
    x: Math.round(Number(x) || 0),
    y: Math.round(Number(y) || 0),
    texture: { src: resolvedItem.img || baseActor.img || "icons/svg/chest.svg" },
    displayName: Number(nimbleLootSetting("defaultTokenDisplayName") ?? 20),
    disposition: Number(nimbleLootSetting("defaultTokenDisposition") ?? 0),
    flags: { [NIMBLE_LOOT_MODULE_ID]: { [NIMBLE_LOOT_FLAG_KEY]: lootData } }
  };

  const [tokenDocument] = await scene.createEmbeddedDocuments("Token", [tokenData]);
  if (!tokenDocument) throw new Error("Failed to create loot pile token.");

  await nimbleLootAddItemToDroppedPileToken(tokenDocument, itemData);
  if (reduceSource) await nimbleLootMaybeReduceDroppedSourceItem(resolvedItem, normalizedQuantity);
  nimbleLootNotify(`Created loot pile: ${pileName}`);
  nimbleLootBroadcastRefresh(tokenDocument);
  return { actor: baseActor, token: tokenDocument };
}

async function nimbleLootCreatePileFromContainerItemDrop({ sourceSceneId, sourceTokenId, itemId, x, y, scene = canvas?.scene, quantity = 1 } = {}) {
  if (!game.user?.isGM) {
    nimbleLootNotify("Only the GM can create Nimble Loot piles from container item drops.", "warn");
    return null;
  }
  const sourceToken = nimbleLootGetSceneTokenByIds(sourceSceneId, sourceTokenId);
  const sourceData = nimbleLootGetData(sourceToken);
  if (!sourceToken || !sourceData) throw new Error("The source loot container could not be found.");
  if (!nimbleLootCanTakeContents(sourceToken, sourceData)) throw new Error("That container is not open.");

  const sourceActor = nimbleLootGetLootActor(sourceToken);
  const sourceItem = sourceActor?.items?.get(itemId);
  if (!sourceItem || !nimbleLootIsLootItem(sourceItem)) throw new Error("That container item could not be found.");

  const normalizedQuantity = Math.max(1, Math.floor(Number(quantity) || 1));
  const available = nimbleLootGetItemQuantity(sourceItem);
  if (normalizedQuantity > available) throw new Error(`Only ${available} × ${sourceItem.name} remain in the container.`);

  const result = await nimbleLootCreatePileFromItemDrop({ item: sourceItem, x, y, scene, quantity: normalizedQuantity, reduceSource: false });
  await nimbleLootReduceSourceItem(sourceItem, normalizedQuantity);
  await nimbleLootAfterContentsChanged(sourceToken);
  nimbleLootBroadcastRefresh(sourceToken);
  return result;
}

function nimbleLootLooksLikeItemDrop(data) {
  if (nimbleLootIsContainerItemDrop(data)) return true;
  const type = String(data?.type ?? data?.documentName ?? "").toLowerCase();
  if (type === "item") return true;
  const uuid = String(data?.uuid ?? data?.itemUuid ?? data?.documentUuid ?? "");
  if (uuid.includes(".Item.") || uuid.startsWith("Item.")) return true;
  if (data?.id && type === "item") return true;
  return false;
}

function nimbleLootGetDropCoordinates(data) {
  return {
    x: Number.isFinite(Number(data?.x)) ? Number(data.x) : 0,
    y: Number.isFinite(Number(data?.y)) ? Number(data.y) : 0
  };
}

async function nimbleLootCreatePileFromDropData(data) {
  const item = await nimbleLootResolveDroppedItem(data);
  if (!item) return true;
  if (!nimbleLootIsLootItem(item)) return true;

  const { x, y } = nimbleLootGetDropCoordinates(data);

  if (nimbleLootIsContainerItemDrop(data)) {
    const sourceContext = nimbleLootResolveContainerItemSource(data);
    if (!sourceContext?.token || !sourceContext?.item) throw new Error("The source container item could not be found.");
    if (!nimbleLootCanTakeContents(sourceContext.token, sourceContext.lootData)) throw new Error("That container is not open.");
    const available = nimbleLootGetItemQuantity(sourceContext.item);
    const quantity = await nimbleLootPromptDropQuantity({ itemName: sourceContext.item.name, max: available, title: "Drop Item" });
    if (!quantity) return false;

    if (game.user?.isGM) {
      await nimbleLootCreatePileFromContainerItemDrop({
        sourceSceneId: sourceContext.source.sceneId,
        sourceTokenId: sourceContext.source.tokenId,
        itemId: sourceContext.source.itemId,
        x,
        y,
        scene: canvas?.scene,
        quantity
      });
      return false;
    }

    await nimbleLootRequestGmAction(NIMBLE_LOOT_SOCKET_ACTIONS.CREATE_PILE_FROM_CONTAINER_ITEM, {
      sourceSceneId: sourceContext.source.sceneId,
      sourceTokenId: sourceContext.source.tokenId,
      itemId: sourceContext.source.itemId,
      sceneId: canvas?.scene?.id,
      quantity,
      x,
      y
    });
    return false;
  }

  if (!nimbleLootCanUserMoveDroppedItem(item, game.user)) {
    nimbleLootNotify("You can only drop object items from an actor you own.", "warn");
    return false;
  }

  const available = nimbleLootGetItemQuantity(item);
  const quantity = await nimbleLootPromptDropQuantity({ itemName: item.name, max: available, title: "Drop Item" });
  if (!quantity) return false;

  const itemUuid = data?.uuid ?? data?.itemUuid ?? data?.documentUuid ?? item.uuid ?? null;
  const reduceSource = nimbleLootIsEmbeddedActorItem(item);

  if (game.user?.isGM) {
    await nimbleLootCreatePileFromItemDrop({ item, x, y, scene: canvas?.scene, quantity, reduceSource });
    return false;
  }

  if (!reduceSource) {
    nimbleLootNotify("Only the GM can create loot piles from world or compendium items.", "warn");
    return false;
  }

  await nimbleLootRequestGmAction(NIMBLE_LOOT_SOCKET_ACTIONS.CREATE_PILE_FROM_ITEM, {
    sceneId: canvas?.scene?.id,
    itemUuid,
    quantity,
    x,
    y,
    reduceSource: true
  });
  return false;
}

function registerNimbleLootItemDropToPile() {
  // Default to enabled so the core canvas workflow survives old/undefined settings.
  // A GM can still explicitly disable it in module settings.
  if (nimbleLootSetting("enableItemDropToPile") === false) return;

  Hooks.on("dropCanvasData", async (_canvas, data) => {
    try {
      if (!nimbleLootLooksLikeItemDrop(data)) return true;
      return await nimbleLootCreatePileFromDropData(data);
    } catch (error) {
      nimbleLootNotify(error.message ?? String(error), "error");
      nimbleLootError("Failed to create loot pile from dropped item", error);
      return false;
    }
  });
}


function registerNimbleLootContainerItemActorSheetDrop() {
  Hooks.on("dropActorSheetData", async (...args) => {
    try {
      const actor = args.find((arg) => arg?.documentName === "Actor") ?? args.find((arg) => arg?.actor?.documentName === "Actor")?.actor ?? null;
      const data = args.find((arg) => arg && typeof arg === "object" && nimbleLootIsContainerItemDrop(arg)) ?? null;
      if (!actor || !data) return true;

      const sourceContext = nimbleLootResolveContainerItemSource(data);
      if (!sourceContext?.token || !sourceContext?.item) throw new Error("The source container item could not be found.");
      if (!nimbleLootCanTakeContents(sourceContext.token, sourceContext.lootData)) throw new Error("That container is not open.");
      if (!game.user?.isGM && actor.isOwner !== true) throw new Error("You can only drop loot onto an actor you own.");

      const available = nimbleLootGetItemQuantity(sourceContext.item);
      const quantity = await nimbleLootPromptDropQuantity({ itemName: sourceContext.item.name, max: available, title: "Take Item" });
      if (!quantity) return false;

      const payload = {
        sceneId: sourceContext.source.sceneId,
        tokenId: sourceContext.source.tokenId,
        actorId: actor.id,
        itemId: sourceContext.source.itemId,
        quantity
      };
      await nimbleLootRunMaybeViaGm(NIMBLE_LOOT_SOCKET_ACTIONS.TRANSFER_ITEM, payload, () => nimbleLootTakeItem({ token: sourceContext.token, actor, itemId: sourceContext.source.itemId, quantity, user: game.user }));
      return false;
    } catch (error) {
      nimbleLootNotify(error.message ?? String(error), "warn");
      nimbleLootError("Container item actor-sheet drop failed", error);
      return false;
    }
  });
}

// === Nimble Loot: interaction service ===
function nimbleLootGetSingleControlledToken() {
  const controlled = canvas?.tokens?.controlled ?? [];
  if (controlled.length !== 1) {
    nimbleLootNotify("Select exactly one token.", "warn");
    return null;
  }
  return controlled[0];
}

async function nimbleLootConfigureSelected() {
  if (!game.user?.isGM) {
    nimbleLootNotify("Only the GM can configure Nimble Loot tokens.", "warn");
    return null;
  }
  const token = nimbleLootGetSingleControlledToken();
  if (!token) return null;
  if (!nimbleLootHasData(token)) {
    await nimbleLootSetData(token, nimbleLootCreateDefaultData(NIMBLE_LOOT_TYPES.CONTAINER));
  }
  return new NimbleLootConfigDialog({ token }).render({ force: true });
}

async function nimbleLootResetSelected() {
  if (!game.user?.isGM) {
    nimbleLootNotify("Only the GM can reset Nimble Loot tokens.", "warn");
    return null;
  }
  const token = nimbleLootGetSingleControlledToken();
  if (!token) return null;
  await nimbleLootResealContainer(token);
  nimbleLootNotify("Selected Nimble Loot token reset.");
  return true;
}

async function nimbleLootClearSelected() {
  if (!game.user?.isGM) {
    nimbleLootNotify("Only the GM can clear Nimble Loot data.", "warn");
    return null;
  }
  const token = nimbleLootGetSingleControlledToken();
  if (!token) return null;
  await nimbleLootClearData(token);
  nimbleLootNotify("Nimble Loot data removed from selected token.");
  return true;
}

async function nimbleLootOpenForToken(tokenOrDocument, actor = null) {
  const token = tokenOrDocument?.object ?? tokenOrDocument;
  if (!nimbleLootHasData(token)) {
    nimbleLootNotify("That token is not configured as Nimble Loot.", "warn");
    return null;
  }
  const resolvedActor = actor ?? nimbleLootResolveActorForUser(game.user);
  if (!nimbleLootAssertInteractionDistance(token, resolvedActor, game.user)) return null;
  return new NimbleLootDialog({ token, actor: resolvedActor }).render({ force: true });
}

async function nimbleLootOpenForSelected() {
  const token = nimbleLootGetSingleControlledToken();
  if (!token) return null;
  return nimbleLootOpenForToken(token);
}

async function nimbleLootOpenForTargeted() {
  const targets = Array.from(game.user?.targets ?? []);
  if (targets.length !== 1) {
    nimbleLootNotify("Target exactly one Nimble Loot token.", "warn");
    return null;
  }
  return nimbleLootOpenForToken(targets[0]);
}


function nimbleLootIsBaseLootActorToken(tokenDoc) {
  const actor = tokenDoc?.actor ?? tokenDoc?.object?.actor;
  return actor?.getFlag?.(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_BASE_ACTOR_FLAG) === true || actor?.name === NIMBLE_LOOT_BASE_ACTOR_NAME;
}


function nimbleLootSuppressActorSheetForToken(tokenDoc) {
  const actor = tokenDoc?.actor ?? tokenDoc?.object?.actor;
  if (!actor) return;
  actor._nimbleLootSuppressSheetUntil = Date.now() + 1500;
}

function nimbleLootAllowActorSheetForToken(tokenDoc, ms = 2000) {
  const actor = tokenDoc?.actor ?? tokenDoc?.object?.actor;
  if (!actor) return;
  actor._nimbleLootAllowSheetUntil = Date.now() + ms;
}

function nimbleLootActorMatchesTokenActor(actor, token) {
  if (!actor || !token) return false;
  const tokenDoc = nimbleLootTokenDocument(token);
  const tokenActor = tokenDoc?.actor ?? token?.actor;
  if (!tokenActor) return false;
  if (actor.uuid && tokenActor.uuid && actor.uuid === tokenActor.uuid) return true;
  if (actor.id && tokenActor.id && actor.id === tokenActor.id) return true;
  if (actor.id && tokenDoc?.actorId && actor.id === tokenDoc.actorId) return true;
  return false;
}

function nimbleLootShouldSuppressActorSheetApp(app) {
  if (nimbleLootSetting("suppressLootActorSheetOnDoubleClick") !== true) return false;
  const actor = app?.actor ?? app?.document ?? app?.object ?? null;
  if (!actor || actor.documentName !== "Actor") return false;

  const now = Date.now();
  if (actor._nimbleLootAllowSheetUntil && actor._nimbleLootAllowSheetUntil > now) return false;
  if (actor._nimbleLootSuppressSheetUntil && actor._nimbleLootSuppressSheetUntil > now) return true;

  // Synthetic token actors usually keep a token reference. This is the most precise check.
  const tokenDoc = actor.token ?? actor.prototypeToken ?? null;
  if (tokenDoc && nimbleLootHasData(tokenDoc)) return true;

  // The shared reusable Nimble Loot Actor should generally not open through canvas double-clicks.
  if (actor?.getFlag?.(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_BASE_ACTOR_FLAG) === true || actor?.name === NIMBLE_LOOT_BASE_ACTOR_NAME) return true;

  // After a Foundry refresh, old placed tokens may still open the base actor sheet. Check the loaded canvas tokens.
  const tokens = Array.from(canvas?.tokens?.placeables ?? []);
  return tokens.some((token) => nimbleLootHasData(token) && nimbleLootActorMatchesTokenActor(actor, token));
}

function nimbleLootCloseActorSheetAppIfNeeded(app) {
  if (!nimbleLootShouldSuppressActorSheetApp(app)) return false;
  window.setTimeout(() => { try { app.close?.(); } catch (_error) {} }, 0);
  return true;
}

function nimbleLootCloseActorSheetsForToken(tokenDoc) {
  const actor = tokenDoc?.actor ?? tokenDoc?.object?.actor;
  if (!actor) return;
  const apps = [];
  try { apps.push(...Object.values(ui?.windows ?? {})); } catch (_error) {}
  try { apps.push(...Array.from(foundry?.applications?.instances ?? [])); } catch (_error) {}
  const seen = new Set();
  for (const app of apps) {
    if (!app || seen.has(app)) continue;
    seen.add(app);
    const doc = app.document ?? app.actor ?? app.object ?? null;
    if (doc?.uuid === actor.uuid || doc?.id === actor.id || nimbleLootShouldSuppressActorSheetApp(app)) {
      try { app.close?.(); } catch (_error) {}
    }
  }
}

async function nimbleLootEnsureTokenConfiguredForGm(tokenDoc) {
  if (!game.user?.isGM || !tokenDoc || nimbleLootHasData(tokenDoc)) return tokenDoc;
  if (!nimbleLootIsBaseLootActorToken(tokenDoc)) return tokenDoc;
  const data = nimbleLootCreateDefaultData(NIMBLE_LOOT_TYPES.PILE);
  data.config.label = tokenDoc.name ?? "Loot Pile";
  data.config.highlight.enabled = nimbleLootSetting("enableTokenBorder") === true;
  await nimbleLootSetData(tokenDoc, data);
  return tokenDoc;
}

function nimbleLootOpenTokenByRole(token, event = null) {
  const tokenDoc = nimbleLootTokenDocument(token);
  const tokenObj = tokenDoc?.object ?? token;
  if (!tokenDoc) return false;
  if (!nimbleLootHasData(tokenDoc) && !(game.user?.isGM && nimbleLootIsBaseLootActorToken(tokenDoc))) return false;

  const now = Date.now();
  if (tokenObj._nimbleLootLastOpenAt && (now - tokenObj._nimbleLootLastOpenAt) < 500) return true;
  tokenObj._nimbleLootLastOpenAt = now;

  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.data?.originalEvent?.preventDefault?.();
  event?.data?.originalEvent?.stopPropagation?.();
  nimbleLootSuppressActorSheetForToken(tokenDoc);
  window.setTimeout(() => nimbleLootCloseActorSheetsForToken(tokenDoc), 25);
  window.setTimeout(() => nimbleLootCloseActorSheetsForToken(tokenDoc), 150);

  if (game.user?.isGM) {
    nimbleLootEnsureTokenConfiguredForGm(tokenDoc).then(() => {
      new NimbleLootConfigDialog({ token: tokenObj }).render({ force: true });
    }).catch((error) => nimbleLootError("Failed to prepare loot token", error));
  } else {
    nimbleLootOpenForToken(tokenObj);
  }
  return true;
}

function nimbleLootShouldSuppressActorSheetDoubleClick(token, event = null) {
  if (nimbleLootSetting("suppressLootActorSheetOnDoubleClick") !== true) return false;
  const tokenDoc = nimbleLootTokenDocument(token);
  if (!tokenDoc) return false;
  if (!nimbleLootHasData(tokenDoc) && !(game.user?.isGM && nimbleLootIsBaseLootActorToken(tokenDoc))) return false;
  const button = nimbleLootEventButton(event);
  return button === 0;
}

function nimbleLootSuppressDoubleClickActorSheet(token, event = null) {
  const tokenDoc = nimbleLootTokenDocument(token);
  if (!tokenDoc) return false;
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.data?.originalEvent?.preventDefault?.();
  event?.data?.originalEvent?.stopPropagation?.();
  nimbleLootSuppressActorSheetForToken(tokenDoc);
  window.setTimeout(() => nimbleLootCloseActorSheetsForToken(tokenDoc), 0);
  window.setTimeout(() => nimbleLootCloseActorSheetsForToken(tokenDoc), 50);
  window.setTimeout(() => nimbleLootCloseActorSheetsForToken(tokenDoc), 200);
  return true;
}


let nimbleLootCanvasDoubleClickFallbackRegistered = false;
let nimbleLootCanvasLastPointer = { tokenId: null, at: 0 };
let nimbleLootCanvasAnyClickCandidate = null;

function nimbleLootGetCanvasView() {
  return canvas?.app?.view ?? canvas?.app?.renderer?.view ?? document.querySelector("canvas#board, #board canvas, canvas");
}

function nimbleLootDomEventToCanvasPoint(event) {
  try {
    const view = nimbleLootGetCanvasView();
    const stage = canvas?.stage;
    if (!view || !stage || !event) return null;
    const rect = view.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const screenX = (event.clientX - rect.left) * ((view.width || rect.width) / rect.width);
    const screenY = (event.clientY - rect.top) * ((view.height || rect.height) / rect.height);
    const point = new PIXI.Point(screenX, screenY);
    if (stage.worldTransform?.applyInverse) return stage.worldTransform.applyInverse(point);
    const scaleX = Number(stage.scale?.x) || 1;
    const scaleY = Number(stage.scale?.y) || 1;
    return new PIXI.Point((screenX - (Number(stage.x) || 0)) / scaleX, (screenY - (Number(stage.y) || 0)) / scaleY);
  } catch (error) {
    nimbleLootDebug("Could not convert pointer event to canvas coordinates", error);
    return null;
  }
}

function nimbleLootTokenContainsPoint(token, point) {
  if (!token || !point) return false;
  try {
    const bounds = token.bounds ?? token.getBounds?.();
    if (bounds?.contains?.(point.x, point.y)) return true;
  } catch (_error) {
    // Fall back to document bounds below.
  }
  const doc = nimbleLootTokenDocument(token);
  if (!doc) return false;
  const gridSize = Number(canvas?.grid?.size) || 100;
  const x = Number(doc.x) || 0;
  const y = Number(doc.y) || 0;
  const width = Math.max(1, Number(doc.width) || 1) * gridSize;
  const height = Math.max(1, Number(doc.height) || 1) * gridSize;
  return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
}

function nimbleLootFindLootTokenAtPoint(point) {
  const placeables = Array.from(canvas?.tokens?.placeables ?? []);
  // Reverse draw order so the top-most token is preferred when tokens overlap.
  for (const token of placeables.reverse()) {
    const tokenDoc = nimbleLootTokenDocument(token);
    if (!tokenDoc || (!nimbleLootHasData(tokenDoc) && !(game.user?.isGM && nimbleLootIsBaseLootActorToken(tokenDoc)))) continue;
    if (token.visible === false) continue;
    if (nimbleLootTokenContainsPoint(token, point)) return token;
  }
  return null;
}

function nimbleLootInteractionMode() {
  const clientMode = String(nimbleLootSetting("clientTokenActivationMode") || "world");
  if (clientMode && clientMode !== "world") return clientMode;
  return String(nimbleLootSetting("tokenActivationMode") || "single-click");
}

function nimbleLootEventButton(event) {
  const original = event?.data?.originalEvent ?? event;
  const button = Number(original?.button ?? event?.button ?? 0);
  return Number.isFinite(button) ? button : 0;
}

function nimbleLootEventShiftKey(event) {
  const original = event?.data?.originalEvent ?? event;
  return event?.shiftKey === true || original?.shiftKey === true;
}

function nimbleLootShouldActivateFromCanvas(event, kind = "click") {
  const mode = nimbleLootInteractionMode();
  if (mode === "disabled") return false;

  const button = nimbleLootEventButton(event);
  const isLeft = button === 0;
  const isRight = button === 2;
  const isShift = nimbleLootEventShiftKey(event);

  if (mode === "single-click") return kind === "click" && isLeft && !isShift;
  if (mode === "right-click") return kind === "right-click" && isRight && !isShift;
  if (mode === "any-click") return kind === "any-click" && !isShift;
  if (mode === "double-click") return kind === "double-click" && isLeft && !isShift;
  if (mode === "shift-click") return kind === "click" && isLeft && isShift;
  return kind === "click" && isLeft && !isShift;
}


function nimbleLootOriginalPointerEvent(event) {
  return event?.data?.originalEvent ?? event ?? null;
}

function nimbleLootPointerCoordinates(event) {
  const original = nimbleLootOriginalPointerEvent(event);
  return {
    x: Number(original?.clientX ?? event?.clientX ?? 0),
    y: Number(original?.clientY ?? event?.clientY ?? 0)
  };
}

function nimbleLootTokenIdentity(token) {
  const tokenDoc = nimbleLootTokenDocument(token);
  return tokenDoc?.uuid ?? tokenDoc?.id ?? token?.id ?? null;
}

function nimbleLootRememberAnyClickCandidate(event, token) {
  if (nimbleLootEventShiftKey(event)) {
    nimbleLootCanvasAnyClickCandidate = null;
    return false;
  }
  const tokenId = nimbleLootTokenIdentity(token);
  if (!tokenId) return false;
  const { x, y } = nimbleLootPointerCoordinates(event);
  nimbleLootCanvasAnyClickCandidate = {
    tokenId,
    x,
    y,
    at: Date.now()
  };
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.data?.originalEvent?.preventDefault?.();
  event?.data?.originalEvent?.stopPropagation?.();
  return true;
}

function nimbleLootHandleCanvasPointerUpEvent(event) {
  if (nimbleLootInteractionMode() !== "any-click") return false;
  const candidate = nimbleLootCanvasAnyClickCandidate;
  nimbleLootCanvasAnyClickCandidate = null;
  if (!candidate) return false;
  if (nimbleLootEventShiftKey(event)) return false;

  const now = Date.now();
  if ((now - Number(candidate.at || 0)) > 1500) return false;

  const { x, y } = nimbleLootPointerCoordinates(event);
  const distance = Math.hypot(x - Number(candidate.x || 0), y - Number(candidate.y || 0));
  if (distance > 12) return false;

  const point = nimbleLootDomEventToCanvasPoint(event);
  const token = nimbleLootFindLootTokenAtPoint(point);
  if (!token || nimbleLootTokenIdentity(token) !== candidate.tokenId) return false;

  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.data?.originalEvent?.preventDefault?.();
  event?.data?.originalEvent?.stopPropagation?.();
  return nimbleLootOpenTokenByRole(token, event);
}

function nimbleLootHandleCanvasDoubleClickEvent(event) {
  const point = nimbleLootDomEventToCanvasPoint(event);
  const token = nimbleLootFindLootTokenAtPoint(point);
  if (!token) return false;
  if (nimbleLootShouldActivateFromCanvas(event, "double-click")) return nimbleLootOpenTokenByRole(token, event);
  if (nimbleLootShouldSuppressActorSheetDoubleClick(token, event)) return nimbleLootSuppressDoubleClickActorSheet(token, event);
  return false;
}

function nimbleLootHandleCanvasPointerDownEvent(event) {
  const mode = nimbleLootInteractionMode();
  const button = nimbleLootEventButton(event);
  const isLeft = button === 0;
  const isShift = nimbleLootEventShiftKey(event);
  const kind = button === 2 ? "right-click" : "click";

  const point = nimbleLootDomEventToCanvasPoint(event);
  const token = nimbleLootFindLootTokenAtPoint(point);
  if (!token) return false;

  if (mode === "any-click") {
    return nimbleLootRememberAnyClickCandidate(event, token);
  }

  // Foundry's token double-click path can also try to open the actor sheet.
  // For double-click activation, detect the second pointerdown ourselves at the canvas level
  // before Foundry's sheet-open behavior gets a chance to win the race.
  if (mode === "double-click" && isLeft && !isShift) {
    const tokenDoc = nimbleLootTokenDocument(token);
    const tokenId = tokenDoc?.uuid ?? tokenDoc?.id ?? token.id;
    const now = Date.now();
    const sameToken = nimbleLootCanvasLastPointer.tokenId === tokenId;
    const fastEnough = (now - Number(nimbleLootCanvasLastPointer.at || 0)) <= 500;
    nimbleLootCanvasLastPointer = { tokenId, at: now };
    if (!sameToken || !fastEnough) return false;
    nimbleLootCanvasLastPointer = { tokenId: null, at: 0 };
    return nimbleLootOpenTokenByRole(token, event);
  }

  if (!nimbleLootShouldActivateFromCanvas(event, kind)) return false;
  return nimbleLootOpenTokenByRole(token, event);
}

function registerNimbleLootCanvasDoubleClickFallback() {
  if (nimbleLootCanvasDoubleClickFallbackRegistered) return;
  nimbleLootCanvasDoubleClickFallbackRegistered = true;

  const bind = () => {
    const view = nimbleLootGetCanvasView();
    if (!view || view._nimbleLootCanvasDoubleClickFallback) return;
    view._nimbleLootCanvasDoubleClickFallback = true;
    view.addEventListener("dblclick", (event) => {
      try {
        nimbleLootHandleCanvasDoubleClickEvent(event);
      } catch (error) {
        nimbleLootError("Canvas double-click fallback failed", error);
      }
    }, true);
    view.addEventListener("pointerdown", (event) => {
      try {
        nimbleLootHandleCanvasPointerDownEvent(event);
      } catch (error) {
        nimbleLootError("Canvas pointer fallback failed", error);
      }
    }, true);
    view.addEventListener("pointerup", (event) => {
      try {
        nimbleLootHandleCanvasPointerUpEvent(event);
      } catch (error) {
        nimbleLootError("Canvas pointer-up fallback failed", error);
      }
    }, true);
    view.addEventListener("contextmenu", (event) => {
      try {
        if (["right-click", "any-click"].includes(nimbleLootInteractionMode())) {
          const point = nimbleLootDomEventToCanvasPoint(event);
          if (nimbleLootFindLootTokenAtPoint(point)) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      } catch (_error) {
        // Non-critical context-menu suppression.
      }
    }, true);
    nimbleLootDebug("Canvas-level loot click fallback registered.");
  };

  Hooks.on("canvasReady", bind);
  if (canvas?.ready) bind();
}

function nimbleLootShouldSuppressActorSheetDocument(actor, options = {}) {
  if (nimbleLootSetting("suppressLootActorSheetOnDoubleClick") !== true) return false;
  if (!actor || actor.documentName !== "Actor") return false;
  if (options?.nimbleLootBypassActorSheetSuppression === true || options?.bypassNimbleLoot === true || options?.bypassItemPiles === true) return false;

  const now = Date.now();
  if (actor._nimbleLootAllowSheetUntil && actor._nimbleLootAllowSheetUntil > now) return false;
  if (actor._nimbleLootSuppressSheetUntil && actor._nimbleLootSuppressSheetUntil > now) return true;

  const tokenDoc = actor.token ?? null;
  if (tokenDoc && nimbleLootHasData(tokenDoc)) return true;

  if (actor?.getFlag?.(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_BASE_ACTOR_FLAG) === true || actor?.name === NIMBLE_LOOT_BASE_ACTOR_NAME) {
    // If this reusable actor is represented by a configured token on the loaded canvas, suppress normal sheet opens.
    const tokens = Array.from(canvas?.tokens?.placeables ?? []);
    return tokens.some((token) => nimbleLootHasData(token) && nimbleLootActorMatchesTokenActor(actor, token));
  }

  const tokens = Array.from(canvas?.tokens?.placeables ?? []);
  return tokens.some((token) => nimbleLootHasData(token) && nimbleLootActorMatchesTokenActor(actor, token));
}

function nimbleLootRegisterActorSheetRenderSuppression() {
  if (game._nimbleLootActorSheetRenderSuppressionRegistered) return;
  game._nimbleLootActorSheetRenderSuppressionRegistered = true;

  const wrapRender = (proto, label) => {
    if (!proto || typeof proto.render !== "function" || proto._nimbleLootRenderWrapped) return;
    const original = proto.render;
    proto._nimbleLootRenderWrapped = true;
    proto._nimbleLootOriginalRender = original;
    proto.render = function nimbleLootActorSheetRenderWrapper(...args) {
      try {
        const forced = args[0];
        const options = (args[1] && typeof args[1] === "object") ? args[1] : {};
        const actor = this.document ?? this.actor ?? this.object ?? null;
        if (forced && nimbleLootShouldSuppressActorSheetDocument(actor, options)) {
          nimbleLootDebug(`Suppressed actor sheet render for ${actor?.name ?? label}.`);
          return this;
        }
      } catch (error) {
        nimbleLootDebug("Actor sheet render suppression check failed", error);
      }
      return original.apply(this, args);
    };
  };

  const sheetClasses = CONFIG?.Actor?.sheetClasses ?? {};
  for (const [type, classes] of Object.entries(sheetClasses)) {
    for (const [id, entry] of Object.entries(classes ?? {})) {
      wrapRender(entry?.cls?.prototype, `${type}.${id}`);
    }
  }

  // If a system sheet is registered after ready, the renderApplication fallback still closes it,
  // but the wrappers above prevent the common Nimble NPC sheet flash before it opens.
}

function registerNimbleLootTokenDoubleClick() {
  nimbleLootRegisterActorSheetRenderSuppression();
  if (!game._nimbleLootActorSheetSuppressHook) {
    game._nimbleLootActorSheetSuppressHook = true;
    Hooks.on("renderActorSheet", (app) => nimbleLootCloseActorSheetAppIfNeeded(app));
    Hooks.on("renderActorSheetV2", (app) => nimbleLootCloseActorSheetAppIfNeeded(app));
    Hooks.on("renderApplication", (app) => nimbleLootCloseActorSheetAppIfNeeded(app));
  }
  registerNimbleLootCanvasDoubleClickFallback();
  const tokenClass = CONFIG?.Token?.objectClass ?? globalThis.Token;
  const proto = tokenClass?.prototype;
  if (!proto) {
    nimbleLootWarn("Token double-click integration skipped: Token prototype was not found.");
    return;
  }
  if (proto._nimbleLootDoubleClickWrapped) return;

  proto._nimbleLootDoubleClickWrapped = true;

  const originalLeft2 = proto._onClickLeft2;
  if (typeof originalLeft2 === "function") {
    proto._nimbleLootOriginalOnClickLeft2 = originalLeft2;
    proto._onClickLeft2 = function nimbleLootOnClickLeft2(event, ...args) {
      try {
        if (nimbleLootShouldActivateFromCanvas(event, "double-click") && nimbleLootOpenTokenByRole(this, event)) return;
        if (nimbleLootShouldSuppressActorSheetDoubleClick(this, event)) {
          nimbleLootSuppressDoubleClickActorSheet(this, event);
          return;
        }
      } catch (error) {
        nimbleLootError("Nimble Loot token double-click handler failed", error);
      }
      return originalLeft2.call(this, event, ...args);
    };
  } else {
    nimbleLootWarn("Token double-click integration note: _onClickLeft2 was not found; using click fallback only.");
  }

  // Player users in some worlds do not reliably reach _onClickLeft2 for non-owned loot tokens.
  // This fallback watches normal left clicks and treats two quick clicks on the same configured
  // loot token as a double-click, while preserving the normal first-click behavior.
  const originalLeft = proto._onClickLeft;
  if (typeof originalLeft === "function") {
    proto._nimbleLootOriginalOnClickLeft = originalLeft;
    proto._onClickLeft = function nimbleLootOnClickLeft(event, ...args) {
      try {
        const clickKind = nimbleLootEventButton(event) === 2 ? "right-click" : "click";
        if (nimbleLootShouldActivateFromCanvas(event, clickKind) && nimbleLootOpenTokenByRole(this, event)) return;
      } catch (error) {
        nimbleLootError("Nimble Loot token click handler failed", error);
      }
      return originalLeft.call(this, event, ...args);
    };
  }

  const originalDoubleLeft = proto._onDoubleClickLeft;
  if (typeof originalDoubleLeft === "function") {
    proto._nimbleLootOriginalOnDoubleClickLeft = originalDoubleLeft;
    proto._onDoubleClickLeft = function nimbleLootOnDoubleClickLeft(event, ...args) {
      try {
        if (nimbleLootShouldActivateFromCanvas(event, "double-click") && nimbleLootOpenTokenByRole(this, event)) return;
        if (nimbleLootShouldSuppressActorSheetDoubleClick(this, event)) {
          nimbleLootSuppressDoubleClickActorSheet(this, event);
          return;
        }
      } catch (error) {
        nimbleLootError("Nimble Loot token double-click-left handler failed", error);
      }
      return originalDoubleLeft.call(this, event, ...args);
    };
  }
}

// === Nimble Loot: token highlight service ===
let nimbleLootHighlightTickerRegistered = false;

function nimbleLootDispositionColor(tokenDocument) {
  const disposition = Number(tokenDocument?.disposition ?? 0);
  if (disposition > 0) return 0x44cc66;
  if (disposition < 0) return 0xcc4444;
  return 0xd7aa5d;
}

function nimbleLootShouldShowTokenBorder(tokenOrDocument) {
  if (nimbleLootSetting("enableTokenBorder") !== true) return false;
  const data = nimbleLootGetData(tokenOrDocument);
  return data?.config?.highlight?.enabled === true;
}

function nimbleLootBorderFadeDurationMs() {
  const seconds = Number(nimbleLootSetting("tokenBorderFadeDuration"));
  if (!Number.isFinite(seconds) || seconds <= 0) return 2000;
  return Math.max(250, seconds * 1000);
}

function nimbleLootRemoveTokenBorder(token) {
  const graphic = token?._nimbleLootBorderGraphic;
  if (graphic) {
    try { graphic.destroy({ children: true }); } catch (_error) { graphic.destroy?.(); }
  }
  if (token) token._nimbleLootBorderGraphic = null;
}

function nimbleLootDrawTokenBorder(token, alpha = 1) {
  if (!token) return;
  const tokenDoc = nimbleLootTokenDocument(token);
  if (!tokenDoc || !nimbleLootShouldShowTokenBorder(tokenDoc)) {
    nimbleLootRemoveTokenBorder(token);
    return;
  }

  const PIXIRef = globalThis.PIXI;
  if (!PIXIRef?.Graphics) return;
  let graphic = token._nimbleLootBorderGraphic;
  if (!graphic || graphic.destroyed) {
    graphic = new PIXIRef.Graphics();
    graphic.name = "nimble-loot-border";
    graphic.eventMode = "none";
    graphic.zIndex = 999;
    token.addChild?.(graphic);
    token._nimbleLootBorderGraphic = graphic;
  }

  const gridSize = Number(canvas?.grid?.size) || 100;
  const width = Number(token.w ?? token.width ?? 0) || Math.max(1, Number(tokenDoc.width) || 1) * gridSize;
  const height = Number(token.h ?? token.height ?? 0) || Math.max(1, Number(tokenDoc.height) || 1) * gridSize;
  const color = nimbleLootDispositionColor(tokenDoc);

  // v0.1.43: extra-thin custom border, closer to Foundry hover weight without looking chunky.
  const lineWidth = Math.max(1, Math.round(gridSize * 0.005));
  const inset = Math.max(1, Math.ceil(lineWidth / 2));

  graphic.clear();
  graphic.alpha = Math.max(0, Math.min(1, alpha));
  graphic.lineStyle(lineWidth, color, 0.95);
  graphic.drawRoundedRect(
    inset,
    inset,
    Math.max(4, width - inset * 2),
    Math.max(4, height - inset * 2),
    Math.max(4, lineWidth * 2)
  );
}

function nimbleLootRefreshTokenBorders(alpha = 1) {
  for (const token of canvas?.tokens?.placeables ?? []) {
    const tokenDoc = nimbleLootTokenDocument(token);
    if (!tokenDoc || !nimbleLootHasData(tokenDoc) || !nimbleLootShouldShowTokenBorder(tokenDoc)) {
      nimbleLootRemoveTokenBorder(token);
      continue;
    }
    nimbleLootDrawTokenBorder(token, alpha);
  }
}

function registerNimbleLootTokenBorderHighlight() {
  Hooks.on("canvasReady", () => window.setTimeout(() => nimbleLootRefreshTokenBorders(1), 50));
  Hooks.on("createToken", (tokenDocument) => {
    window.setTimeout(() => nimbleLootDrawTokenBorder(tokenDocument?.object, 1), 50);
  });
  Hooks.on("updateToken", (tokenDocument) => {
    window.setTimeout(() => nimbleLootDrawTokenBorder(tokenDocument?.object, 1), 50);
  });
  Hooks.on("deleteToken", (tokenDocument) => nimbleLootRemoveTokenBorder(tokenDocument?.object));

  if (!nimbleLootHighlightTickerRegistered && globalThis.PIXI?.Ticker?.shared) {
    nimbleLootHighlightTickerRegistered = true;
    globalThis.PIXI.Ticker.shared.add(() => {
      if (nimbleLootSetting("enableTokenBorder") !== true) {
        for (const token of canvas?.tokens?.placeables ?? []) nimbleLootRemoveTokenBorder(token);
        return;
      }

      const duration = nimbleLootBorderFadeDurationMs();
      const phase = (Date.now() % duration) / duration;
      // Smooth triangle fade: 100% → 0% → 100%, no instant pop.
      const alpha = phase < 0.5 ? 1 - (phase * 2) : (phase - 0.5) * 2;

      for (const token of canvas?.tokens?.placeables ?? []) {
        const tokenDoc = nimbleLootTokenDocument(token);
        if (!tokenDoc || !nimbleLootHasData(tokenDoc) || !nimbleLootShouldShowTokenBorder(tokenDoc)) {
          nimbleLootRemoveTokenBorder(token);
          continue;
        }
        nimbleLootDrawTokenBorder(token, alpha);
      }
    });
  }
}

// === Nimble Loot: public API ===
function createNimbleLootApi() {
  return {
    configureSelected: nimbleLootConfigureSelected,
    resetSelected: nimbleLootResetSelected,
    clearSelected: nimbleLootClearSelected,
    openForSelected: nimbleLootOpenForSelected,
    openForTargeted: nimbleLootOpenForTargeted,
    openForToken: nimbleLootOpenForToken,
    createPileFromItemDrop: nimbleLootCreatePileFromItemDrop,

    hasLootData: nimbleLootHasData,
    getLootData: nimbleLootGetData,
    setLootData: nimbleLootSetData,
    updateLootData: nimbleLootUpdateData,
    updateLootConfig: nimbleLootUpdateConfig,
    updateLootState: nimbleLootUpdateState,
    clearLootData: nimbleLootClearData,
    createDefaultLootData: nimbleLootCreateDefaultData,

    takeItem: nimbleLootTakeItem,
    depositItem: nimbleLootDepositItem,
    moveGridItem: nimbleLootMoveGridItem,
    takeCurrency: nimbleLootTakeCurrency,
    leaveCurrency: nimbleLootLeaveCurrency,
    splitCurrencyEvenly: nimbleLootSplitCurrencyEvenlyBetweenParty,
    takeAllVisibleLoot: nimbleLootTakeAllVisibleLoot,

    inspect: nimbleLootInspectForTraps,
    pickLock: nimbleLootPickLock,
    forceOpen: nimbleLootForceOpen,
    openContainer: nimbleLootOpenContainer,
    carefullyOpenContainer: nimbleLootCarefullyOpenContainer,
    useKeyCode: nimbleLootUseKeyCode,
    disarmTrap: nimbleLootDisarmTrap,
    triggerTrap: nimbleLootTriggerTrap,

    getTrapDisplayLabel: nimbleLootGetTrapDisplayLabel
  };
}

// === Nimble Loot: feature registration ===
function ensureNimbleLootNamespace() {
  if (!game.nimbleLoot) game.nimbleLoot = {};
  return game.nimbleLoot;
}

function registerNimbleLootApi() {
  const namespace = ensureNimbleLootNamespace();
  namespace.api = createNimbleLootApi();
  namespace.svelte = {
    ApplicationMixin: NimbleLootSvelteApplicationMixin
  };
  namespace.constants = {
    MODULE_ID: NIMBLE_LOOT_MODULE_ID,
    FLAG_KEY: NIMBLE_LOOT_FLAG_KEY,
    TYPES: NIMBLE_LOOT_TYPES,
    TRAP_STATES: NIMBLE_LOOT_TRAP_STATES
  };
}


function registerNimbleLootFeature() {
  Hooks.once("init", () => {
    registerNimbleLootSettings();
    registerNimbleLootApi();
    nimbleLootLog("Initialized.");
  });

  Hooks.once("ready", () => {
    if (game.system?.id !== NIMBLE_LOOT_SYSTEM_ID) {
      nimbleLootWarn(`Loaded in ${game.system?.id ?? "unknown"}; this module is designed for Nimble.`);
    }
    registerNimbleLootSocketService();
    nimbleLootRegisterDialogRefreshHooks();
    registerNimbleLootItemDropToPile();
    registerNimbleLootContainerItemActorSheetDrop();
    registerNimbleLootTokenDoubleClick();
    registerNimbleLootTokenBorderHighlight();
    nimbleLootLog("Ready.");
  });
}

// === Nimble Loot: entry ===
registerNimbleLootFeature();
