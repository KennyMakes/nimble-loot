let nimbleLootHighlightTickerRegistered = false;

function nimbleLootDispositionColor(tokenDocument) {
  const disposition = Number(tokenDocument?.disposition ?? 0);
  if (disposition > 0) return 0x44cc66;
  if (disposition < 0) return 0xcc4444;
  return 0xd7aa5d;
}

function nimbleLootShouldShowTokenBorder(tokenOrDocument) {
  if (nimbleLootSetting("enableTokenBorder") !== true) return false;
  const data = nimbleLootGetData(tokenOrDocument);
  return data?.config?.highlight?.enabled === true;
}

function nimbleLootBorderFadeDurationMs() {
  const seconds = Number(nimbleLootSetting("tokenBorderFadeDuration"));
  if (!Number.isFinite(seconds) || seconds <= 0) return 2000;
  return Math.max(250, seconds * 1000);
}

function nimbleLootRemoveTokenBorder(token) {
  const graphic = token?._nimbleLootBorderGraphic;
  if (graphic) {
    try { graphic.destroy({ children: true }); } catch (_error) { graphic.destroy?.(); }
  }
  if (token) token._nimbleLootBorderGraphic = null;
}

function nimbleLootDrawTokenBorder(token, alpha = 1) {
  if (!token) return;
  const tokenDoc = nimbleLootTokenDocument(token);
  if (!tokenDoc || !nimbleLootShouldShowTokenBorder(tokenDoc)) {
    nimbleLootRemoveTokenBorder(token);
    return;
  }

  const PIXIRef = globalThis.PIXI;
  if (!PIXIRef?.Graphics) return;
  let graphic = token._nimbleLootBorderGraphic;
  if (!graphic || graphic.destroyed) {
    graphic = new PIXIRef.Graphics();
    graphic.name = "nimble-loot-border";
    graphic.eventMode = "none";
    graphic.zIndex = 999;
    token.addChild?.(graphic);
    token._nimbleLootBorderGraphic = graphic;
  }

  const gridSize = Number(canvas?.grid?.size) || 100;
  const width = Number(token.w ?? token.width ?? 0) || Math.max(1, Number(tokenDoc.width) || 1) * gridSize;
  const height = Number(token.h ?? token.height ?? 0) || Math.max(1, Number(tokenDoc.height) || 1) * gridSize;
  const color = nimbleLootDispositionColor(tokenDoc);

  // v0.1.43: extra-thin custom border, closer to Foundry hover weight without looking chunky.
  const lineWidth = Math.max(1, Math.round(gridSize * 0.005));
  const inset = Math.max(1, Math.ceil(lineWidth / 2));

  graphic.clear();
  graphic.alpha = Math.max(0, Math.min(1, alpha));
  graphic.lineStyle(lineWidth, color, 0.95);
  graphic.drawRoundedRect(
    inset,
    inset,
    Math.max(4, width - inset * 2),
    Math.max(4, height - inset * 2),
    Math.max(4, lineWidth * 2)
  );
}

function nimbleLootRefreshTokenBorders(alpha = 1) {
  for (const token of canvas?.tokens?.placeables ?? []) {
    const tokenDoc = nimbleLootTokenDocument(token);
    if (!tokenDoc || !nimbleLootHasData(tokenDoc) || !nimbleLootShouldShowTokenBorder(tokenDoc)) {
      nimbleLootRemoveTokenBorder(token);
      continue;
    }
    nimbleLootDrawTokenBorder(token, alpha);
  }
}

function registerNimbleLootTokenBorderHighlight() {
  Hooks.on("canvasReady", () => window.setTimeout(() => nimbleLootRefreshTokenBorders(1), 50));
  Hooks.on("createToken", (tokenDocument) => {
    window.setTimeout(() => nimbleLootDrawTokenBorder(tokenDocument?.object, 1), 50);
  });
  Hooks.on("updateToken", (tokenDocument) => {
    window.setTimeout(() => nimbleLootDrawTokenBorder(tokenDocument?.object, 1), 50);
  });
  Hooks.on("deleteToken", (tokenDocument) => nimbleLootRemoveTokenBorder(tokenDocument?.object));

  if (!nimbleLootHighlightTickerRegistered && globalThis.PIXI?.Ticker?.shared) {
    nimbleLootHighlightTickerRegistered = true;
    globalThis.PIXI.Ticker.shared.add(() => {
      if (nimbleLootSetting("enableTokenBorder") !== true) {
        for (const token of canvas?.tokens?.placeables ?? []) nimbleLootRemoveTokenBorder(token);
        return;
      }

      const duration = nimbleLootBorderFadeDurationMs();
      const phase = (Date.now() % duration) / duration;
      // Smooth triangle fade: 100% → 0% → 100%, no instant pop.
      const alpha = phase < 0.5 ? 1 - (phase * 2) : (phase - 0.5) * 2;

      for (const token of canvas?.tokens?.placeables ?? []) {
        const tokenDoc = nimbleLootTokenDocument(token);
        if (!tokenDoc || !nimbleLootHasData(tokenDoc) || !nimbleLootShouldShowTokenBorder(tokenDoc)) {
          nimbleLootRemoveTokenBorder(token);
          continue;
        }
        nimbleLootDrawTokenBorder(token, alpha);
      }
    });
  }
}
