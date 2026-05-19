function nimbleLootEscape(value) {
  return foundry.utils.escapeHTML(String(value ?? ""));
}

function nimbleLootTitleCase(value) {
  return String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function nimbleLootFormatCurrency(currency) {
  const parts = [];
  for (const key of NIMBLE_LOOT_CURRENCY_KEYS) {
    const value = Math.max(0, Math.floor(Number(currency?.[key] ?? 0) || 0));
    if (value > 0) parts.push(`${value} ${key.toUpperCase()}`);
  }
  return parts.length ? parts.join(" ") : "0 GP";
}

function nimbleLootGetItemImage(item) {
  return String(item?.img || "icons/svg/item-bag.svg");
}

function nimbleLootGetItemDescription(item) {
  const candidates = [
    foundry.utils.getProperty(item, "system.description.public"),
    foundry.utils.getProperty(item, "system.description"),
    foundry.utils.getProperty(item, "system.details.description"),
    foundry.utils.getProperty(item, "system.shortDescription"),
    foundry.utils.getProperty(item, "description")
  ];
  const value = candidates.find((candidate) => typeof candidate === "string" && candidate.trim());
  return String(value ?? "").trim();
}

function nimbleLootCssEscape(value) {
  if (globalThis.CSS?.escape) return CSS.escape(String(value));
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function nimbleLootGetNamedControl(root, name) {
  if (!root || !name) return null;
  if (root.elements?.namedItem) {
    const element = root.elements.namedItem(name);
    if (element) return element;
  }
  return root.querySelector?.(`[name="${nimbleLootCssEscape(name)}"]`) ?? null;
}

function nimbleLootReadFormBoolean(form, name) {
  const element = nimbleLootGetNamedControl(form, name);
  if (!element) return false;
  if (globalThis.RadioNodeList && element instanceof RadioNodeList) return Boolean(element.value);
  if (element.type === "checkbox") return element.checked;
  return Boolean(element.value);
}

function nimbleLootReadFormString(form, name, fallback = "") {
  const element = nimbleLootGetNamedControl(form, name);
  if (!element) return fallback;
  return String(element.value ?? fallback).trim();
}

function nimbleLootReadFormNumber(form, name, fallback = 0) {
  const value = Number(nimbleLootReadFormString(form, name, fallback));
  return Number.isFinite(value) ? value : fallback;
}

function nimbleLootReadFormNullableNumber(form, name, fallback = null) {
  const raw = nimbleLootReadFormString(form, name, "");
  if (raw === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

function nimbleLootMaxAttemptLabel(value) {
  if (value === null || value === undefined || value === "") return "∞";
  return String(value);
}

function nimbleLootStatusLabel(lootData) {
  if (lootData?.state?.opened || lootData?.type === NIMBLE_LOOT_TYPES.PILE) return "Open";
  if (lootData?.state?.jammed) return "Jammed";
  if (lootData?.config?.access?.locked) return "Locked";
  return "Closed";
}

function nimbleLootMode(lootData) {
  if (lootData?.state?.opened || lootData?.type === NIMBLE_LOOT_TYPES.PILE) return "open";
  return "sealed";
}

function nimbleLootCanShowContents(lootData) {
  if (lootData?.type === NIMBLE_LOOT_TYPES.PILE) return true;
  if (!lootData?.config?.contentsHiddenUntilOpen) return true;
  return lootData?.state?.opened === true;
}

function nimbleLootIsGridDisplay(lootData) {
  return lootData?.type === NIMBLE_LOOT_TYPES.CONTAINER_GRID;
}

function nimbleLootCanPlayerForceOpen(lootData) {
  if (!nimbleLootSetting("allowPlayersToForceOpen")) return false;
  return nimbleLootAttemptsAllowed(lootData?.config?.access?.maxForceAttempts);
}

function nimbleLootActorLogName(actor) {
  return String(actor?.name ?? "Unknown Hero").trim() || "Unknown Hero";
}

function nimbleLootFormatPlayerLogActorList(actors = []) {
  return actors.map((actor) => `${actor.name}${actor.count > 1 ? ` x${actor.count}` : ""}`).join(", ");
}

function nimbleLootFormatPlayerLogLine(entry) {
  const actorText = nimbleLootFormatPlayerLogActorList(entry?.actors ?? []);
  return `${actorText} — ${entry?.message ?? ""}`.trim();
}

function nimbleLootBuildPlayerLogLines(lootData, section) {
  const entries = lootData?.state?.playerLog?.[section] ?? [];
  return entries.map((entry) => ({ ...entry, line: nimbleLootFormatPlayerLogLine(entry) }));
}

async function nimbleLootAppendPlayerLog(token, { section = "inspection", action = "action", outcome = "done", actor = null, message = "" } = {}) {
  const data = nimbleLootGetData(token);
  if (!data) return null;
  const safeSection = section === "opening" ? "opening" : "inspection";
  const playerLog = foundry.utils.deepClone(data.state.playerLog ?? { inspection: [], opening: [] });
  if (!Array.isArray(playerLog.inspection)) playerLog.inspection = [];
  if (!Array.isArray(playerLog.opening)) playerLog.opening = [];

  const cleanMessage = String(message ?? "").trim();
  if (!cleanMessage) return data;
  const key = `${action}|${outcome}|${cleanMessage}`;
  const actorId = String(actor?.id ?? actor?.uuid ?? game.user?.id ?? "unknown");
  const actorName = nimbleLootActorLogName(actor);
  const entries = playerLog[safeSection];
  let entry = entries.find((candidate) => candidate.key === key);
  if (!entry) {
    entry = { key, action, outcome, message: cleanMessage, actors: [] };
    entries.push(entry);
  }
  let actorEntry = entry.actors.find((candidate) => candidate.id === actorId || candidate.name === actorName);
  if (!actorEntry) {
    actorEntry = { id: actorId, name: actorName, count: 0 };
    entry.actors.push(actorEntry);
  }
  actorEntry.count = Math.min(99, Math.max(1, Number(actorEntry.count ?? 0) + 1));
  playerLog[safeSection] = entries.slice(-12);
  return nimbleLootUpdateState(token, { playerLog });
}


function nimbleLootGridDimensions(lootData) {
  const rows = Math.max(1, Math.min(10, Math.floor(Number(lootData?.config?.grid?.rows ?? 3) || 3)));
  const columns = Math.max(1, Math.min(10, Math.floor(Number(lootData?.config?.grid?.columns ?? 4) || 4)));
  return { rows, columns, total: rows * columns };
}

function nimbleLootBuildGridSlotsForContext(items, lootData) {
  const { rows, columns, total } = nimbleLootGridDimensions(lootData);
  const slotMap = lootData?.state?.gridSlots && typeof lootData.state.gridSlots === "object" ? lootData.state.gridSlots : {};
  const slots = Array.from({ length: total }, (_, index) => ({ index, item: null }));
  const used = new Set();

  for (const item of items) {
    const preferred = Math.floor(Number(slotMap[item.id]));
    if (Number.isFinite(preferred) && preferred >= 0 && preferred < total && !slots[preferred].item) {
      slots[preferred].item = item;
      used.add(item.id);
    }
  }

  for (const item of items) {
    if (used.has(item.id)) continue;
    const openSlot = slots.find((slot) => !slot.item);
    if (openSlot) {
      openSlot.item = item;
      used.add(item.id);
    }
  }

  return { rows, columns, total, slots };
}
