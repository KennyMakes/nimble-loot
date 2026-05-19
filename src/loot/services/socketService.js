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
