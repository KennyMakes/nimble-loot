# Changelog

## v0.2.1

### Accessibility and interaction

- Added **Any click / tap opens loot** as a world-level and per-user loot-token interaction mode.
- Any click / tap is intended as a safer fallback for MacBook trackpads or players whose double-click / right-click events are unreliable.
- Shift-click remains the bypass for normal Foundry token handling.
- The any-click handler waits for pointer-up and ignores larger pointer movement, reducing accidental opens during drag-like gestures.

## v0.2.0

First stable Nimble Loot release after the v0.1.50 release-candidate series.

### Core workflow

- Loot Pile, Container - List, and Container - Grid profiles.
- Scene-token flag state under `flags["nimble-loot"].loot`.
- Reusable shared Nimble Loot Actor for dropped item piles.
- Item drops to canvas create loot-pile tokens.
- Empty loot piles delete their token and close the player dialog.
- Empty containers remain usable and can receive new contents.

### Player interactions

- Configurable world-level and per-user loot-token activation preferences.
- Player dialog supports list and grid item views.
- Take item flow uses one Take button; stacked items open an amount dialog.
- Currency supports take all, split evenly, take portion, and leave portion.
- Players can add items from inventory without opening their character sheet.
- Player-facing closed-container flow includes Inspect, Carefully Open, Pick Lock, Force Open, Key/Code, and Disarm actions.
- Inspect / Pick / Force / Disarm use Nimble `actor.rollSkillCheckToChat()`.
- Dialog status logs summarize lock/trap/container outcomes.

### GM configuration

- GM configuration screen uses the Nimble Loot component bridge.
- Quick Configs support Apply, Save, and Delete.
- Contents tab supports currency editing, drag/drop item adding, quantity editing, and item deletion.
- Mechanical and Magical trap pages support enabled state, trigger settings, RollTable selection, and fire-once behavior.
- Clear States resets runtime attempts/status without deleting contents or configuration.
- Open Actor Sheet and Show Player Dialog footer actions are available.

### Canvas and compatibility

- Actor-sheet suppression prevents the underlying Nimble NPC sheet from opening for configured loot tokens while keeping intentional Open Actor Sheet behavior.
- Optional interaction distance limit.
- Optional custom loot-token border highlight with configurable fade duration.
- Token name display and disposition defaults are configurable for newly created loot tokens.
- Removed token HUD button integration and macro-based canvas controls from the packaged release.

### UI cleanup

- Player and GM dialogs align more closely with Nimble Shop styling.
- DialogV2-style prompts are used for small amount/confirmation flows where appropriate.
- Checkbox styling was normalized to match the Nimble Shop-style warm checked state.
- Obsolete Handlebars templates, packaged macros, token HUD integration, and Svelte test files were removed from the package.

## Known future work

- Loot awarding tool integration.
- Trap RollTable compendium packs.
- Optional Restore Default Quick Configs action.
- Additional polish after extended table testing.
