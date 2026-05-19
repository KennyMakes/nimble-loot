function nimbleLootTokenDocument(tokenOrDocument) {
  if (!tokenOrDocument) return null;
  if (tokenOrDocument.documentName === "Token") return tokenOrDocument;
  if (tokenOrDocument.document?.documentName === "Token") return tokenOrDocument.document;
  if (tokenOrDocument.object?.document?.documentName === "Token") return tokenOrDocument.object.document;
  return null;
}

function nimbleLootTokenObject(tokenOrDocument) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  return doc?.object ?? tokenOrDocument?.object ?? (tokenOrDocument?.document ? tokenOrDocument : null);
}

function nimbleLootHasData(tokenOrDocument) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  return Boolean(doc?.getFlag?.(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_FLAG_KEY));
}

function nimbleLootGetData(tokenOrDocument) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  if (!doc) return null;
  const raw = doc.getFlag(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_FLAG_KEY);
  if (!raw) return null;
  return nimbleLootMigrateData(raw);
}

async function nimbleLootSetData(tokenOrDocument, data) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  if (!doc) throw new Error("No token document provided.");
  const normalized = nimbleLootValidateData(data);
  await doc.setFlag(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_FLAG_KEY, normalized);
  return normalized;
}

async function nimbleLootUpdateData(tokenOrDocument, updates) {
  const current = nimbleLootGetData(tokenOrDocument) ?? nimbleLootCreateDefaultData();
  const merged = foundry.utils.mergeObject(current, foundry.utils.deepClone(updates ?? {}), {
    inplace: false,
    insertKeys: true,
    insertValues: true,
    overwrite: true,
    recursive: true
  });
  return nimbleLootSetData(tokenOrDocument, merged);
}

async function nimbleLootUpdateConfig(tokenOrDocument, updates) {
  return nimbleLootUpdateData(tokenOrDocument, { config: updates ?? {} });
}

async function nimbleLootUpdateState(tokenOrDocument, updates) {
  return nimbleLootUpdateData(tokenOrDocument, { state: updates ?? {} });
}

async function nimbleLootClearData(tokenOrDocument) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  if (!doc) throw new Error("No token document provided.");
  await doc.unsetFlag(NIMBLE_LOOT_MODULE_ID, NIMBLE_LOOT_FLAG_KEY);
}

function nimbleLootGetDisplayName(tokenOrDocument, lootData = null) {
  const doc = nimbleLootTokenDocument(tokenOrDocument);
  const data = lootData ?? nimbleLootGetData(doc);
  const configured = String(data?.config?.label ?? "").trim();
  return configured || doc?.name || doc?.actor?.name || "Loot";
}

function nimbleLootGetSceneTokenByIds(sceneId, tokenId) {
  const scene = game.scenes?.get(sceneId) ?? canvas?.scene;
  const tokenDocument = scene?.tokens?.get(tokenId) ?? null;
  return tokenDocument?.object ?? tokenDocument ?? null;
}
