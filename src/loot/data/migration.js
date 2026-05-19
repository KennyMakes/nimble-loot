function nimbleLootMigrateData(data) {
  if (!data || typeof data !== "object") return null;
  const migratedInput = foundry.utils.deepClone(data);

  // Legacy v0.1.x profile names are now all handled by the container-list profile.
  if (["container", "strongbox", "vault"].includes(migratedInput.type)) {
    migratedInput.type = NIMBLE_LOOT_TYPES.CONTAINER_LIST;
  }

  const migrated = foundry.utils.mergeObject(
    nimbleLootCreateDefaultData(migratedInput.type),
    migratedInput,
    { inplace: false, insertKeys: true, insertValues: true, overwrite: true, recursive: true }
  );

  if (!migrated.version) migrated.version = NIMBLE_LOOT_SCHEMA_VERSION;
  migrated.config.access.sealed = false;

  return nimbleLootValidateData(migrated);
}
