function nimbleLootPrefix(message) {
  return `Nimble Loot | ${message}`;
}

function nimbleLootDebugEnabled() {
  try {
    return game.settings?.get?.(NIMBLE_LOOT_MODULE_ID, "debug") === true;
  } catch (_error) {
    return false;
  }
}

function nimbleLootLog(...args) {
  console.log(nimbleLootPrefix(args.shift() ?? ""), ...args);
}

function nimbleLootDebug(...args) {
  if (!nimbleLootDebugEnabled()) return;
  console.debug(nimbleLootPrefix(args.shift() ?? ""), ...args);
}

function nimbleLootWarn(...args) {
  console.warn(nimbleLootPrefix(args.shift() ?? ""), ...args);
}

function nimbleLootError(...args) {
  console.error(nimbleLootPrefix(args.shift() ?? ""), ...args);
}

function nimbleLootNotify(message, level = "info") {
  const text = String(message ?? "").trim();
  if (!text) return;
  const notifications = ui?.notifications;
  if (level === "error") notifications?.error?.(text);
  else if (level === "warn" || level === "warning") notifications?.warn?.(text);
  else notifications?.info?.(text);
}

function nimbleLootNotifyResult(result) {
  if (!result) return;
  if (result.ok === false) nimbleLootNotify(result.error || result.message || "Nimble Loot action failed.", "warn");
  else if (result.message) nimbleLootNotify(result.message, "info");
}
