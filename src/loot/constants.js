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
