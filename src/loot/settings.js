function registerNimbleLootSettings() {
  game.settings.register(NIMBLE_LOOT_MODULE_ID, "debug", {
    name: "Debug Logging",
    hint: "Log extra Nimble Loot debugging information to the console.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "requireControlledActor", {
    name: "Require Controlled Actor",
    hint: "Players must have a controlled or assigned hero before taking loot.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "allowPlayersToForceOpen", {
    name: "Allow Players to Force Open",
    hint: "Allow player-facing dialogs to show Force Open when the container supports it.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });


  game.settings.register(NIMBLE_LOOT_MODULE_ID, "limitInteractionDistance", {
    name: "Limit Token Interaction Distance",
    hint: "When enabled, non-GM users must have their hero token within the configured number of spaces to open or interact with Nimble Loot tokens.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "interactionDistanceSpaces", {
    name: "Interaction Distance in Spaces",
    hint: "Maximum number of grid spaces a hero token can be from a Nimble Loot token when interaction distance is limited.",
    scope: "world",
    config: true,
    type: Number,
    default: 1
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "postRoutineLootReceiptsToChat", {
    name: "Post Routine Loot Receipts to Chat",
    hint: "When enabled, taking loot posts a small chat receipt. Rolls and traps still post even when this is off.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });



  game.settings.register(NIMBLE_LOOT_MODULE_ID, "tokenActivationMode", {
    name: "Loot Token Interaction",
    hint: "Choose how canvas loot tokens open their Nimble Loot dialog. Shift-click bypass remains available unless Shift-click is the selected activation mode.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "single-click": "Single left-click opens loot",
      "right-click": "Single right-click opens loot",
      "any-click": "Any click / tap opens loot",
      "double-click": "Double left-click opens loot",
      "shift-click": "Shift + left-click opens loot",
      "disabled": "Disabled - no canvas activation"
    },
    default: "single-click"
  });


  game.settings.register(NIMBLE_LOOT_MODULE_ID, "clientTokenActivationMode", {
    name: "My Loot Token Interaction",
    hint: "Per-user override for opening Nimble Loot tokens. Choose 'Use GM/global setting' to follow the world default.",
    scope: "client",
    config: true,
    type: String,
    choices: {
      "world": "Use GM/global setting",
      "single-click": "Single left-click opens loot",
      "right-click": "Single right-click opens loot",
      "any-click": "Any click / tap opens loot",
      "double-click": "Double left-click opens loot",
      "shift-click": "Shift + left-click opens loot",
      "disabled": "Disabled - no canvas activation"
    },
    default: "world"
  });



  game.settings.register(NIMBLE_LOOT_MODULE_ID, "suppressLootActorSheetOnDoubleClick", {
    name: "Suppress Loot Actor Sheet on Double-Click",
    hint: "When enabled, double-clicking a configured Nimble Loot token will not open the underlying Nimble NPC actor sheet. This is useful when loot dialogs are opened by single click, shift-click, or right-click instead.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "enableItemDropToPile", {
    name: "Create Loot Pile When Item Is Dropped on Canvas",
    hint: "When the GM drops a Nimble object item onto the canvas, create a small loot pile token containing that item.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "trapRollTableFolder", {
    name: "Trap RollTable Folder",
    hint: "Optional folder name or folder ID containing the trap RollTables shown in Nimble Loot trap dropdowns. Leave blank to show all RollTables.",
    scope: "world",
    config: true,
    type: String,
    default: ""
  });



  game.settings.register(NIMBLE_LOOT_MODULE_ID, "defaultTokenDisplayName", {
    name: "Default Token Name Display",
    hint: "Default Foundry token name display mode for new Nimble Loot tokens created by item drops.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "0": "Never Displayed",
      "10": "When Controlled",
      "20": "Hovered by Anyone",
      "30": "Hovered by Owner",
      "40": "Always for Owner",
      "50": "Always for Everyone"
    },
    default: "20"
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "defaultTokenDisposition", {
    name: "Default Token Disposition",
    hint: "Default disposition for new Nimble Loot tokens created by item drops.",
    scope: "world",
    config: true,
    type: String,
    choices: {
      "-1": "Hostile",
      "0": "Neutral",
      "1": "Friendly"
    },
    default: "0"
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "enableTokenBorder", {
    name: "Enable Loot Token Border",
    hint: "Adds a lightweight animated border to configured Nimble Loot tokens that have border highlighting enabled.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "tokenBorderFadeDuration", {
    name: "Loot Border Fade Duration",
    hint: "Seconds for the Nimble Loot border to fade from fully visible to invisible before looping.",
    scope: "world",
    config: true,
    type: Number,
    default: 2
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "savedPresets", {
    name: "Saved Nimble Loot Quick Configs",
    hint: "Internal storage for Nimble Loot quick configuration presets.",
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  game.settings.register(NIMBLE_LOOT_MODULE_ID, "deletedBuiltInPresets", {
    name: "Deleted Built-In Nimble Loot Quick Configs",
    hint: "Internal storage for built-in quick configs the GM has chosen to hide/delete.",
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });
}

function nimbleLootSetting(key) {
  try {
    return game.settings.get(NIMBLE_LOOT_MODULE_ID, key);
  } catch (_error) {
    return undefined;
  }
}

async function nimbleLootSetSetting(key, value) {
  return game.settings.set(NIMBLE_LOOT_MODULE_ID, key, value);
}
