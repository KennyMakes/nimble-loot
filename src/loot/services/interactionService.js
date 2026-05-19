function nimbleLootGetSingleControlledToken() {
  const controlled = canvas?.tokens?.controlled ?? [];
  if (controlled.length !== 1) {
    nimbleLootNotify("Select exactly one token.", "warn");
    return null;
  }
  return controlled[0];
}

async function nimbleLootConfigureSelected() {
  if (!game.user?.isGM) {
    nimbleLootNotify("Only the GM can configure Nimble Loot tokens.", "warn");
    return null;
  }
  const token = nimbleLootGetSingleControlledToken();
  if (!token) return null;
  if (!nimbleLootHasData(token)) {
    await nimbleLootSetData(token, nimbleLootCreateDefaultData(NIMBLE_LOOT_TYPES.CONTAINER));
  }
  return new NimbleLootConfigDialog({ token }).render({ force: true });
}

async function nimbleLootResetSelected() {
  if (!game.user?.isGM) {
    nimbleLootNotify("Only the GM can reset Nimble Loot tokens.", "warn");
    return null;
  }
  const token = nimbleLootGetSingleControlledToken();
  if (!token) return null;
  await nimbleLootResealContainer(token);
  nimbleLootNotify("Selected Nimble Loot token reset.");
  return true;
}

async function nimbleLootClearSelected() {
  if (!game.user?.isGM) {
    nimbleLootNotify("Only the GM can clear Nimble Loot data.", "warn");
    return null;
  }
  const token = nimbleLootGetSingleControlledToken();
  if (!token) return null;
  await nimbleLootClearData(token);
  nimbleLootNotify("Nimble Loot data removed from selected token.");
  return true;
}

async function nimbleLootOpenForToken(tokenOrDocument, actor = null) {
  const token = tokenOrDocument?.object ?? tokenOrDocument;
  if (!nimbleLootHasData(token)) {
    nimbleLootNotify("That token is not configured as Nimble Loot.", "warn");
    return null;
  }
  const resolvedActor = actor ?? nimbleLootResolveActorForUser(game.user);
  if (!nimbleLootAssertInteractionDistance(token, resolvedActor, game.user)) return null;
  return new NimbleLootDialog({ token, actor: resolvedActor }).render({ force: true });
}

async function nimbleLootOpenForSelected() {
  const token = nimbleLootGetSingleControlledToken();
  if (!token) return null;
  return nimbleLootOpenForToken(token);
}

async function nimbleLootOpenForTargeted() {
  const targets = Array.from(game.user?.targets ?? []);
  if (targets.length !== 1) {
    nimbleLootNotify("Target exactly one Nimble Loot token.", "warn");
    return null;
  }
  return nimbleLootOpenForToken(targets[0]);
}


function nimbleLootIsBaseLootActorToken(tokenDoc) {
  const actor = tokenDoc?.actor ?? tokenDoc?.object?.actor;
  return actor?.getFlag?.(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_BASE_ACTOR_FLAG) === true || actor?.name === NIMBLE_LOOT_BASE_ACTOR_NAME;
}


function nimbleLootSuppressActorSheetForToken(tokenDoc) {
  const actor = tokenDoc?.actor ?? tokenDoc?.object?.actor;
  if (!actor) return;
  actor._nimbleLootSuppressSheetUntil = Date.now() + 1500;
}

function nimbleLootAllowActorSheetForToken(tokenDoc, ms = 2000) {
  const actor = tokenDoc?.actor ?? tokenDoc?.object?.actor;
  if (!actor) return;
  actor._nimbleLootAllowSheetUntil = Date.now() + ms;
}

function nimbleLootActorMatchesTokenActor(actor, token) {
  if (!actor || !token) return false;
  const tokenDoc = nimbleLootTokenDocument(token);
  const tokenActor = tokenDoc?.actor ?? token?.actor;
  if (!tokenActor) return false;
  if (actor.uuid && tokenActor.uuid && actor.uuid === tokenActor.uuid) return true;
  if (actor.id && tokenActor.id && actor.id === tokenActor.id) return true;
  if (actor.id && tokenDoc?.actorId && actor.id === tokenDoc.actorId) return true;
  return false;
}

function nimbleLootShouldSuppressActorSheetApp(app) {
  if (nimbleLootSetting("suppressLootActorSheetOnDoubleClick") !== true) return false;
  const actor = app?.actor ?? app?.document ?? app?.object ?? null;
  if (!actor || actor.documentName !== "Actor") return false;

  const now = Date.now();
  if (actor._nimbleLootAllowSheetUntil && actor._nimbleLootAllowSheetUntil > now) return false;
  if (actor._nimbleLootSuppressSheetUntil && actor._nimbleLootSuppressSheetUntil > now) return true;

  // Synthetic token actors usually keep a token reference. This is the most precise check.
  const tokenDoc = actor.token ?? actor.prototypeToken ?? null;
  if (tokenDoc && nimbleLootHasData(tokenDoc)) return true;

  // The shared reusable Nimble Loot Actor should generally not open through canvas double-clicks.
  if (actor?.getFlag?.(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_BASE_ACTOR_FLAG) === true || actor?.name === NIMBLE_LOOT_BASE_ACTOR_NAME) return true;

  // After a Foundry refresh, old placed tokens may still open the base actor sheet. Check the loaded canvas tokens.
  const tokens = Array.from(canvas?.tokens?.placeables ?? []);
  return tokens.some((token) => nimbleLootHasData(token) && nimbleLootActorMatchesTokenActor(actor, token));
}

function nimbleLootCloseActorSheetAppIfNeeded(app) {
  if (!nimbleLootShouldSuppressActorSheetApp(app)) return false;
  window.setTimeout(() => { try { app.close?.(); } catch (_error) {} }, 0);
  return true;
}

function nimbleLootCloseActorSheetsForToken(tokenDoc) {
  const actor = tokenDoc?.actor ?? tokenDoc?.object?.actor;
  if (!actor) return;
  const apps = [];
  try { apps.push(...Object.values(ui?.windows ?? {})); } catch (_error) {}
  try { apps.push(...Array.from(foundry?.applications?.instances ?? [])); } catch (_error) {}
  const seen = new Set();
  for (const app of apps) {
    if (!app || seen.has(app)) continue;
    seen.add(app);
    const doc = app.document ?? app.actor ?? app.object ?? null;
    if (doc?.uuid === actor.uuid || doc?.id === actor.id || nimbleLootShouldSuppressActorSheetApp(app)) {
      try { app.close?.(); } catch (_error) {}
    }
  }
}

async function nimbleLootEnsureTokenConfiguredForGm(tokenDoc) {
  if (!game.user?.isGM || !tokenDoc || nimbleLootHasData(tokenDoc)) return tokenDoc;
  if (!nimbleLootIsBaseLootActorToken(tokenDoc)) return tokenDoc;
  const data = nimbleLootCreateDefaultData(NIMBLE_LOOT_TYPES.PILE);
  data.config.label = tokenDoc.name ?? "Loot Pile";
  data.config.highlight.enabled = nimbleLootSetting("enableTokenBorder") === true;
  await nimbleLootSetData(tokenDoc, data);
  return tokenDoc;
}

function nimbleLootOpenTokenByRole(token, event = null) {
  const tokenDoc = nimbleLootTokenDocument(token);
  const tokenObj = tokenDoc?.object ?? token;
  if (!tokenDoc) return false;
  if (!nimbleLootHasData(tokenDoc) && !(game.user?.isGM && nimbleLootIsBaseLootActorToken(tokenDoc))) return false;

  const now = Date.now();
  if (tokenObj._nimbleLootLastOpenAt && (now - tokenObj._nimbleLootLastOpenAt) < 500) return true;
  tokenObj._nimbleLootLastOpenAt = now;

  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.data?.originalEvent?.preventDefault?.();
  event?.data?.originalEvent?.stopPropagation?.();
  nimbleLootSuppressActorSheetForToken(tokenDoc);
  window.setTimeout(() => nimbleLootCloseActorSheetsForToken(tokenDoc), 25);
  window.setTimeout(() => nimbleLootCloseActorSheetsForToken(tokenDoc), 150);

  if (game.user?.isGM) {
    nimbleLootEnsureTokenConfiguredForGm(tokenDoc).then(() => {
      new NimbleLootConfigDialog({ token: tokenObj }).render({ force: true });
    }).catch((error) => nimbleLootError("Failed to prepare loot token", error));
  } else {
    nimbleLootOpenForToken(tokenObj);
  }
  return true;
}

function nimbleLootShouldSuppressActorSheetDoubleClick(token, event = null) {
  if (nimbleLootSetting("suppressLootActorSheetOnDoubleClick") !== true) return false;
  const tokenDoc = nimbleLootTokenDocument(token);
  if (!tokenDoc) return false;
  if (!nimbleLootHasData(tokenDoc) && !(game.user?.isGM && nimbleLootIsBaseLootActorToken(tokenDoc))) return false;
  const button = nimbleLootEventButton(event);
  return button === 0;
}

function nimbleLootSuppressDoubleClickActorSheet(token, event = null) {
  const tokenDoc = nimbleLootTokenDocument(token);
  if (!tokenDoc) return false;
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.data?.originalEvent?.preventDefault?.();
  event?.data?.originalEvent?.stopPropagation?.();
  nimbleLootSuppressActorSheetForToken(tokenDoc);
  window.setTimeout(() => nimbleLootCloseActorSheetsForToken(tokenDoc), 0);
  window.setTimeout(() => nimbleLootCloseActorSheetsForToken(tokenDoc), 50);
  window.setTimeout(() => nimbleLootCloseActorSheetsForToken(tokenDoc), 200);
  return true;
}


let nimbleLootCanvasDoubleClickFallbackRegistered = false;
let nimbleLootCanvasLastPointer = { tokenId: null, at: 0 };
let nimbleLootCanvasAnyClickCandidate = null;

function nimbleLootGetCanvasView() {
  return canvas?.app?.view ?? canvas?.app?.renderer?.view ?? document.querySelector("canvas#board, #board canvas, canvas");
}

function nimbleLootDomEventToCanvasPoint(event) {
  try {
    const view = nimbleLootGetCanvasView();
    const stage = canvas?.stage;
    if (!view || !stage || !event) return null;
    const rect = view.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const screenX = (event.clientX - rect.left) * ((view.width || rect.width) / rect.width);
    const screenY = (event.clientY - rect.top) * ((view.height || rect.height) / rect.height);
    const point = new PIXI.Point(screenX, screenY);
    if (stage.worldTransform?.applyInverse) return stage.worldTransform.applyInverse(point);
    const scaleX = Number(stage.scale?.x) || 1;
    const scaleY = Number(stage.scale?.y) || 1;
    return new PIXI.Point((screenX - (Number(stage.x) || 0)) / scaleX, (screenY - (Number(stage.y) || 0)) / scaleY);
  } catch (error) {
    nimbleLootDebug("Could not convert pointer event to canvas coordinates", error);
    return null;
  }
}

function nimbleLootTokenContainsPoint(token, point) {
  if (!token || !point) return false;
  try {
    const bounds = token.bounds ?? token.getBounds?.();
    if (bounds?.contains?.(point.x, point.y)) return true;
  } catch (_error) {
    // Fall back to document bounds below.
  }
  const doc = nimbleLootTokenDocument(token);
  if (!doc) return false;
  const gridSize = Number(canvas?.grid?.size) || 100;
  const x = Number(doc.x) || 0;
  const y = Number(doc.y) || 0;
  const width = Math.max(1, Number(doc.width) || 1) * gridSize;
  const height = Math.max(1, Number(doc.height) || 1) * gridSize;
  return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
}

function nimbleLootFindLootTokenAtPoint(point) {
  const placeables = Array.from(canvas?.tokens?.placeables ?? []);
  // Reverse draw order so the top-most token is preferred when tokens overlap.
  for (const token of placeables.reverse()) {
    const tokenDoc = nimbleLootTokenDocument(token);
    if (!tokenDoc || (!nimbleLootHasData(tokenDoc) && !(game.user?.isGM && nimbleLootIsBaseLootActorToken(tokenDoc)))) continue;
    if (token.visible === false) continue;
    if (nimbleLootTokenContainsPoint(token, point)) return token;
  }
  return null;
}

function nimbleLootInteractionMode() {
  const clientMode = String(nimbleLootSetting("clientTokenActivationMode") || "world");
  if (clientMode && clientMode !== "world") return clientMode;
  return String(nimbleLootSetting("tokenActivationMode") || "single-click");
}

function nimbleLootEventButton(event) {
  const original = event?.data?.originalEvent ?? event;
  const button = Number(original?.button ?? event?.button ?? 0);
  return Number.isFinite(button) ? button : 0;
}

function nimbleLootEventShiftKey(event) {
  const original = event?.data?.originalEvent ?? event;
  return event?.shiftKey === true || original?.shiftKey === true;
}

function nimbleLootShouldActivateFromCanvas(event, kind = "click") {
  const mode = nimbleLootInteractionMode();
  if (mode === "disabled") return false;

  const button = nimbleLootEventButton(event);
  const isLeft = button === 0;
  const isRight = button === 2;
  const isShift = nimbleLootEventShiftKey(event);

  if (mode === "single-click") return kind === "click" && isLeft && !isShift;
  if (mode === "right-click") return kind === "right-click" && isRight && !isShift;
  if (mode === "any-click") return kind === "any-click" && !isShift;
  if (mode === "double-click") return kind === "double-click" && isLeft && !isShift;
  if (mode === "shift-click") return kind === "click" && isLeft && isShift;
  return kind === "click" && isLeft && !isShift;
}


function nimbleLootOriginalPointerEvent(event) {
  return event?.data?.originalEvent ?? event ?? null;
}

function nimbleLootPointerCoordinates(event) {
  const original = nimbleLootOriginalPointerEvent(event);
  return {
    x: Number(original?.clientX ?? event?.clientX ?? 0),
    y: Number(original?.clientY ?? event?.clientY ?? 0)
  };
}

function nimbleLootTokenIdentity(token) {
  const tokenDoc = nimbleLootTokenDocument(token);
  return tokenDoc?.uuid ?? tokenDoc?.id ?? token?.id ?? null;
}

function nimbleLootRememberAnyClickCandidate(event, token) {
  if (nimbleLootEventShiftKey(event)) {
    nimbleLootCanvasAnyClickCandidate = null;
    return false;
  }
  const tokenId = nimbleLootTokenIdentity(token);
  if (!tokenId) return false;
  const { x, y } = nimbleLootPointerCoordinates(event);
  nimbleLootCanvasAnyClickCandidate = {
    tokenId,
    x,
    y,
    at: Date.now()
  };
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.data?.originalEvent?.preventDefault?.();
  event?.data?.originalEvent?.stopPropagation?.();
  return true;
}

function nimbleLootHandleCanvasPointerUpEvent(event) {
  if (nimbleLootInteractionMode() !== "any-click") return false;
  const candidate = nimbleLootCanvasAnyClickCandidate;
  nimbleLootCanvasAnyClickCandidate = null;
  if (!candidate) return false;
  if (nimbleLootEventShiftKey(event)) return false;

  const now = Date.now();
  if ((now - Number(candidate.at || 0)) > 1500) return false;

  const { x, y } = nimbleLootPointerCoordinates(event);
  const distance = Math.hypot(x - Number(candidate.x || 0), y - Number(candidate.y || 0));
  if (distance > 12) return false;

  const point = nimbleLootDomEventToCanvasPoint(event);
  const token = nimbleLootFindLootTokenAtPoint(point);
  if (!token || nimbleLootTokenIdentity(token) !== candidate.tokenId) return false;

  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.data?.originalEvent?.preventDefault?.();
  event?.data?.originalEvent?.stopPropagation?.();
  return nimbleLootOpenTokenByRole(token, event);
}

function nimbleLootHandleCanvasDoubleClickEvent(event) {
  const point = nimbleLootDomEventToCanvasPoint(event);
  const token = nimbleLootFindLootTokenAtPoint(point);
  if (!token) return false;
  if (nimbleLootShouldActivateFromCanvas(event, "double-click")) return nimbleLootOpenTokenByRole(token, event);
  if (nimbleLootShouldSuppressActorSheetDoubleClick(token, event)) return nimbleLootSuppressDoubleClickActorSheet(token, event);
  return false;
}

function nimbleLootHandleCanvasPointerDownEvent(event) {
  const mode = nimbleLootInteractionMode();
  const button = nimbleLootEventButton(event);
  const isLeft = button === 0;
  const isShift = nimbleLootEventShiftKey(event);
  const kind = button === 2 ? "right-click" : "click";

  const point = nimbleLootDomEventToCanvasPoint(event);
  const token = nimbleLootFindLootTokenAtPoint(point);
  if (!token) return false;

  if (mode === "any-click") {
    return nimbleLootRememberAnyClickCandidate(event, token);
  }

  // Foundry's token double-click path can also try to open the actor sheet.
  // For double-click activation, detect the second pointerdown ourselves at the canvas level
  // before Foundry's sheet-open behavior gets a chance to win the race.
  if (mode === "double-click" && isLeft && !isShift) {
    const tokenDoc = nimbleLootTokenDocument(token);
    const tokenId = tokenDoc?.uuid ?? tokenDoc?.id ?? token.id;
    const now = Date.now();
    const sameToken = nimbleLootCanvasLastPointer.tokenId === tokenId;
    const fastEnough = (now - Number(nimbleLootCanvasLastPointer.at || 0)) <= 500;
    nimbleLootCanvasLastPointer = { tokenId, at: now };
    if (!sameToken || !fastEnough) return false;
    nimbleLootCanvasLastPointer = { tokenId: null, at: 0 };
    return nimbleLootOpenTokenByRole(token, event);
  }

  if (!nimbleLootShouldActivateFromCanvas(event, kind)) return false;
  return nimbleLootOpenTokenByRole(token, event);
}

function registerNimbleLootCanvasDoubleClickFallback() {
  if (nimbleLootCanvasDoubleClickFallbackRegistered) return;
  nimbleLootCanvasDoubleClickFallbackRegistered = true;

  const bind = () => {
    const view = nimbleLootGetCanvasView();
    if (!view || view._nimbleLootCanvasDoubleClickFallback) return;
    view._nimbleLootCanvasDoubleClickFallback = true;
    view.addEventListener("dblclick", (event) => {
      try {
        nimbleLootHandleCanvasDoubleClickEvent(event);
      } catch (error) {
        nimbleLootError("Canvas double-click fallback failed", error);
      }
    }, true);
    view.addEventListener("pointerdown", (event) => {
      try {
        nimbleLootHandleCanvasPointerDownEvent(event);
      } catch (error) {
        nimbleLootError("Canvas pointer fallback failed", error);
      }
    }, true);
    view.addEventListener("pointerup", (event) => {
      try {
        nimbleLootHandleCanvasPointerUpEvent(event);
      } catch (error) {
        nimbleLootError("Canvas pointer-up fallback failed", error);
      }
    }, true);
    view.addEventListener("contextmenu", (event) => {
      try {
        if (["right-click", "any-click"].includes(nimbleLootInteractionMode())) {
          const point = nimbleLootDomEventToCanvasPoint(event);
          if (nimbleLootFindLootTokenAtPoint(point)) {
            event.preventDefault();
            event.stopPropagation();
          }
        }
      } catch (_error) {
        // Non-critical context-menu suppression.
      }
    }, true);
    nimbleLootDebug("Canvas-level loot click fallback registered.");
  };

  Hooks.on("canvasReady", bind);
  if (canvas?.ready) bind();
}

function nimbleLootShouldSuppressActorSheetDocument(actor, options = {}) {
  if (nimbleLootSetting("suppressLootActorSheetOnDoubleClick") !== true) return false;
  if (!actor || actor.documentName !== "Actor") return false;
  if (options?.nimbleLootBypassActorSheetSuppression === true || options?.bypassNimbleLoot === true || options?.bypassItemPiles === true) return false;

  const now = Date.now();
  if (actor._nimbleLootAllowSheetUntil && actor._nimbleLootAllowSheetUntil > now) return false;
  if (actor._nimbleLootSuppressSheetUntil && actor._nimbleLootSuppressSheetUntil > now) return true;

  const tokenDoc = actor.token ?? null;
  if (tokenDoc && nimbleLootHasData(tokenDoc)) return true;

  if (actor?.getFlag?.(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_BASE_ACTOR_FLAG) === true || actor?.name === NIMBLE_LOOT_BASE_ACTOR_NAME) {
    // If this reusable actor is represented by a configured token on the loaded canvas, suppress normal sheet opens.
    const tokens = Array.from(canvas?.tokens?.placeables ?? []);
    return tokens.some((token) => nimbleLootHasData(token) && nimbleLootActorMatchesTokenActor(actor, token));
  }

  const tokens = Array.from(canvas?.tokens?.placeables ?? []);
  return tokens.some((token) => nimbleLootHasData(token) && nimbleLootActorMatchesTokenActor(actor, token));
}

function nimbleLootRegisterActorSheetRenderSuppression() {
  if (game._nimbleLootActorSheetRenderSuppressionRegistered) return;
  game._nimbleLootActorSheetRenderSuppressionRegistered = true;

  const wrapRender = (proto, label) => {
    if (!proto || typeof proto.render !== "function" || proto._nimbleLootRenderWrapped) return;
    const original = proto.render;
    proto._nimbleLootRenderWrapped = true;
    proto._nimbleLootOriginalRender = original;
    proto.render = function nimbleLootActorSheetRenderWrapper(...args) {
      try {
        const forced = args[0];
        const options = (args[1] && typeof args[1] === "object") ? args[1] : {};
        const actor = this.document ?? this.actor ?? this.object ?? null;
        if (forced && nimbleLootShouldSuppressActorSheetDocument(actor, options)) {
          nimbleLootDebug(`Suppressed actor sheet render for ${actor?.name ?? label}.`);
          return this;
        }
      } catch (error) {
        nimbleLootDebug("Actor sheet render suppression check failed", error);
      }
      return original.apply(this, args);
    };
  };

  const sheetClasses = CONFIG?.Actor?.sheetClasses ?? {};
  for (const [type, classes] of Object.entries(sheetClasses)) {
    for (const [id, entry] of Object.entries(classes ?? {})) {
      wrapRender(entry?.cls?.prototype, `${type}.${id}`);
    }
  }

  // If a system sheet is registered after ready, the renderApplication fallback still closes it,
  // but the wrappers above prevent the common Nimble NPC sheet flash before it opens.
}

function registerNimbleLootTokenDoubleClick() {
  nimbleLootRegisterActorSheetRenderSuppression();
  if (!game._nimbleLootActorSheetSuppressHook) {
    game._nimbleLootActorSheetSuppressHook = true;
    Hooks.on("renderActorSheet", (app) => nimbleLootCloseActorSheetAppIfNeeded(app));
    Hooks.on("renderActorSheetV2", (app) => nimbleLootCloseActorSheetAppIfNeeded(app));
    Hooks.on("renderApplication", (app) => nimbleLootCloseActorSheetAppIfNeeded(app));
  }
  registerNimbleLootCanvasDoubleClickFallback();
  const tokenClass = CONFIG?.Token?.objectClass ?? globalThis.Token;
  const proto = tokenClass?.prototype;
  if (!proto) {
    nimbleLootWarn("Token double-click integration skipped: Token prototype was not found.");
    return;
  }
  if (proto._nimbleLootDoubleClickWrapped) return;

  proto._nimbleLootDoubleClickWrapped = true;

  const originalLeft2 = proto._onClickLeft2;
  if (typeof originalLeft2 === "function") {
    proto._nimbleLootOriginalOnClickLeft2 = originalLeft2;
    proto._onClickLeft2 = function nimbleLootOnClickLeft2(event, ...args) {
      try {
        if (nimbleLootShouldActivateFromCanvas(event, "double-click") && nimbleLootOpenTokenByRole(this, event)) return;
        if (nimbleLootShouldSuppressActorSheetDoubleClick(this, event)) {
          nimbleLootSuppressDoubleClickActorSheet(this, event);
          return;
        }
      } catch (error) {
        nimbleLootError("Nimble Loot token double-click handler failed", error);
      }
      return originalLeft2.call(this, event, ...args);
    };
  } else {
    nimbleLootWarn("Token double-click integration note: _onClickLeft2 was not found; using click fallback only.");
  }

  // Player users in some worlds do not reliably reach _onClickLeft2 for non-owned loot tokens.
  // This fallback watches normal left clicks and treats two quick clicks on the same configured
  // loot token as a double-click, while preserving the normal first-click behavior.
  const originalLeft = proto._onClickLeft;
  if (typeof originalLeft === "function") {
    proto._nimbleLootOriginalOnClickLeft = originalLeft;
    proto._onClickLeft = function nimbleLootOnClickLeft(event, ...args) {
      try {
        const clickKind = nimbleLootEventButton(event) === 2 ? "right-click" : "click";
        if (nimbleLootShouldActivateFromCanvas(event, clickKind) && nimbleLootOpenTokenByRole(this, event)) return;
      } catch (error) {
        nimbleLootError("Nimble Loot token click handler failed", error);
      }
      return originalLeft.call(this, event, ...args);
    };
  }

  const originalDoubleLeft = proto._onDoubleClickLeft;
  if (typeof originalDoubleLeft === "function") {
    proto._nimbleLootOriginalOnDoubleClickLeft = originalDoubleLeft;
    proto._onDoubleClickLeft = function nimbleLootOnDoubleClickLeft(event, ...args) {
      try {
        if (nimbleLootShouldActivateFromCanvas(event, "double-click") && nimbleLootOpenTokenByRole(this, event)) return;
        if (nimbleLootShouldSuppressActorSheetDoubleClick(this, event)) {
          nimbleLootSuppressDoubleClickActorSheet(this, event);
          return;
        }
      } catch (error) {
        nimbleLootError("Nimble Loot token double-click-left handler failed", error);
      }
      return originalDoubleLeft.call(this, event, ...args);
    };
  }
}
