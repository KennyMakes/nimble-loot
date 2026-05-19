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
