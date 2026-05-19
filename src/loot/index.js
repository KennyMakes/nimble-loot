function ensureNimbleLootNamespace() {
  if (!game.nimbleLoot) game.nimbleLoot = {};
  return game.nimbleLoot;
}

function registerNimbleLootApi() {
  const namespace = ensureNimbleLootNamespace();
  namespace.api = createNimbleLootApi();
  namespace.svelte = {
    ApplicationMixin: NimbleLootSvelteApplicationMixin
  };
  namespace.constants = {
    MODULE_ID: NIMBLE_LOOT_MODULE_ID,
    FLAG_KEY: NIMBLE_LOOT_FLAG_KEY,
    TYPES: NIMBLE_LOOT_TYPES,
    TRAP_STATES: NIMBLE_LOOT_TRAP_STATES
  };
}


function registerNimbleLootFeature() {
  Hooks.once("init", () => {
    registerNimbleLootSettings();
    registerNimbleLootApi();
    nimbleLootLog("Initialized.");
  });

  Hooks.once("ready", () => {
    if (game.system?.id !== NIMBLE_LOOT_SYSTEM_ID) {
      nimbleLootWarn(`Loaded in ${game.system?.id ?? "unknown"}; this module is designed for Nimble.`);
    }
    registerNimbleLootSocketService();
    nimbleLootRegisterDialogRefreshHooks();
    registerNimbleLootItemDropToPile();
    registerNimbleLootContainerItemActorSheetDrop();
    registerNimbleLootTokenDoubleClick();
    registerNimbleLootTokenBorderHighlight();
    nimbleLootLog("Ready.");
  });
}
