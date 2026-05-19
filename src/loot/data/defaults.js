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
