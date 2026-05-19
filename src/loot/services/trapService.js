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
