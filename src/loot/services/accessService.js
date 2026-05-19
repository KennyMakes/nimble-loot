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
