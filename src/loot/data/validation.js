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
