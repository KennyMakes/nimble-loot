function nimbleLootReadCurrencyValue(actor, key) {
  const paths = NIMBLE_LOOT_CURRENCY_FALLBACK_PATHS[key] ?? [NIMBLE_LOOT_CURRENCY_PATHS[key]];
  for (const path of paths) {
    const value = foundry.utils.getProperty(actor, path);
    if (value && typeof value === "object") continue;
    const numeric = Number(value);
    if (Number.isFinite(numeric)) return Math.max(0, Math.floor(numeric));
  }
  return 0;
}

function nimbleLootGetCurrency(actor) {
  return {
    gp: nimbleLootReadCurrencyValue(actor, "gp"),
    sp: nimbleLootReadCurrencyValue(actor, "sp"),
    cp: nimbleLootReadCurrencyValue(actor, "cp")
  };
}

function nimbleLootNormalizeCurrency(currency) {
  return {
    gp: nimbleLootClampInteger(currency?.gp, 0, 0),
    sp: nimbleLootClampInteger(currency?.sp, 0, 0),
    cp: nimbleLootClampInteger(currency?.cp, 0, 0)
  };
}

function nimbleLootIsCurrencyEmpty(currency) {
  const normalized = nimbleLootNormalizeCurrency(currency);
  return normalized.gp <= 0 && normalized.sp <= 0 && normalized.cp <= 0;
}

function nimbleLootGetLootCurrency(tokenOrData) {
  const data = tokenOrData?.state ? tokenOrData : nimbleLootGetData(tokenOrData);
  return nimbleLootNormalizeCurrency(data?.state?.currency ?? {});
}

async function nimbleLootSetLootCurrency(tokenOrDocument, currency) {
  const normalized = nimbleLootNormalizeCurrency(currency);
  await nimbleLootUpdateState(tokenOrDocument, { currency: normalized });
  return normalized;
}

function nimbleLootHasLootCurrency(tokenOrData, requested) {
  const current = nimbleLootGetLootCurrency(tokenOrData);
  const normalized = nimbleLootNormalizeCurrency(requested);
  return current.gp >= normalized.gp && current.sp >= normalized.sp && current.cp >= normalized.cp;
}

async function nimbleLootSubtractLootCurrency(tokenOrDocument, currency) {
  const current = nimbleLootGetLootCurrency(tokenOrDocument);
  const subtract = nimbleLootNormalizeCurrency(currency);
  if (!nimbleLootHasLootCurrency(tokenOrDocument, subtract)) {
    throw new Error("This loot pile does not have enough currency.");
  }
  const next = {
    gp: current.gp - subtract.gp,
    sp: current.sp - subtract.sp,
    cp: current.cp - subtract.cp
  };
  return nimbleLootSetLootCurrency(tokenOrDocument, next);
}

function nimbleLootHasCurrency(actor, requested) {
  const current = nimbleLootGetCurrency(actor);
  const normalized = nimbleLootNormalizeCurrency(requested);
  return current.gp >= normalized.gp && current.sp >= normalized.sp && current.cp >= normalized.cp;
}

function nimbleLootActorHasCurrencyField(actor, key) {
  const paths = NIMBLE_LOOT_CURRENCY_FALLBACK_PATHS[key] ?? [];
  return paths.some((path) => foundry.utils.getProperty(actor, path) !== undefined);
}

function nimbleLootCurrencyUpdatePayload(currency, actor = null) {
  const normalized = nimbleLootNormalizeCurrency(currency);
  const payload = {};
  for (const key of NIMBLE_LOOT_CURRENCY_KEYS) {
    if (actor && !nimbleLootActorHasCurrencyField(actor, key) && normalized[key] === 0) continue;
    payload[NIMBLE_LOOT_CURRENCY_PATHS[key]] = normalized[key];
  }
  return payload;
}

function nimbleLootAssertCanReceiveCurrency(actor, currency) {
  if (!actor) throw new Error("No actor provided for currency update.");
  const normalized = nimbleLootNormalizeCurrency(currency);
  const missing = NIMBLE_LOOT_CURRENCY_KEYS.filter((key) => normalized[key] > 0 && !nimbleLootActorHasCurrencyField(actor, key));
  if (missing.length) {
    throw new Error(`${actor.name} does not expose ${missing.map((k) => k.toUpperCase()).join("/")} currency fields. Currency was not removed from the loot pile.`);
  }
}

function nimbleLootCurrencyMeetsExpected(actual, expected) {
  const a = nimbleLootNormalizeCurrency(actual);
  const e = nimbleLootNormalizeCurrency(expected);
  return a.gp >= e.gp && a.sp >= e.sp && a.cp >= e.cp;
}

async function nimbleLootAddCurrency(actor, currency) {
  nimbleLootAssertCanReceiveCurrency(actor, currency);
  const current = nimbleLootGetCurrency(actor);
  const add = nimbleLootNormalizeCurrency(currency);
  const next = {
    gp: current.gp + add.gp,
    sp: current.sp + add.sp,
    cp: current.cp + add.cp
  };
  await actor.update(nimbleLootCurrencyUpdatePayload(next, actor));

  // Actor updates against Foundry data models can silently discard invalid paths.
  // Verify before the loot pile currency is removed so coins cannot vanish.
  const after = nimbleLootGetCurrency(actor);
  if (!nimbleLootCurrencyMeetsExpected(after, next)) {
    throw new Error(`Currency update did not persist on ${actor.name}. Expected ${nimbleLootFormatCurrency(next)}, found ${nimbleLootFormatCurrency(after)}.`);
  }
  return next;
}

async function nimbleLootSubtractCurrency(actor, currency) {
  nimbleLootAssertCanReceiveCurrency(actor, currency);
  const current = nimbleLootGetCurrency(actor);
  const subtract = nimbleLootNormalizeCurrency(currency);
  if (!nimbleLootHasCurrency(actor, subtract)) {
    throw new Error(`${actor.name} does not have enough currency.`);
  }
  const next = {
    gp: current.gp - subtract.gp,
    sp: current.sp - subtract.sp,
    cp: current.cp - subtract.cp
  };
  await actor.update(nimbleLootCurrencyUpdatePayload(next, actor));
  return next;
}

async function nimbleLootSetCurrency(actor, currency) {
  nimbleLootAssertCanReceiveCurrency(actor, currency);
  const normalized = nimbleLootNormalizeCurrency(currency);
  await actor.update(nimbleLootCurrencyUpdatePayload(normalized, actor));
  return normalized;
}
