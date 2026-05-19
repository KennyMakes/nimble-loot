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
