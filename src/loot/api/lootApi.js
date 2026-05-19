function createNimbleLootApi() {
  return {
    configureSelected: nimbleLootConfigureSelected,
    resetSelected: nimbleLootResetSelected,
    clearSelected: nimbleLootClearSelected,
    openForSelected: nimbleLootOpenForSelected,
    openForTargeted: nimbleLootOpenForTargeted,
    openForToken: nimbleLootOpenForToken,
    createPileFromItemDrop: nimbleLootCreatePileFromItemDrop,

    hasLootData: nimbleLootHasData,
    getLootData: nimbleLootGetData,
    setLootData: nimbleLootSetData,
    updateLootData: nimbleLootUpdateData,
    updateLootConfig: nimbleLootUpdateConfig,
    updateLootState: nimbleLootUpdateState,
    clearLootData: nimbleLootClearData,
    createDefaultLootData: nimbleLootCreateDefaultData,

    takeItem: nimbleLootTakeItem,
    depositItem: nimbleLootDepositItem,
    moveGridItem: nimbleLootMoveGridItem,
    takeCurrency: nimbleLootTakeCurrency,
    leaveCurrency: nimbleLootLeaveCurrency,
    splitCurrencyEvenly: nimbleLootSplitCurrencyEvenlyBetweenParty,
    takeAllVisibleLoot: nimbleLootTakeAllVisibleLoot,

    inspect: nimbleLootInspectForTraps,
    pickLock: nimbleLootPickLock,
    forceOpen: nimbleLootForceOpen,
    openContainer: nimbleLootOpenContainer,
    carefullyOpenContainer: nimbleLootCarefullyOpenContainer,
    useKeyCode: nimbleLootUseKeyCode,
    disarmTrap: nimbleLootDisarmTrap,
    triggerTrap: nimbleLootTriggerTrap,

    getTrapDisplayLabel: nimbleLootGetTrapDisplayLabel
  };
}
