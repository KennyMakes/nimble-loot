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
