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
