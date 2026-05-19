# Nimble Loot

A focused, dialog-first loot and container module for the **Nimble** Foundry VTT system.

Nimble Loot gives GMs a lighter, Nimble-native alternative to broad item-pile modules when all you really need is table-friendly loot piles, containers, locked boxes, grid containers, currency handling, and trap-aware interaction.

> Current release: `v0.2.1`  
> Foundry compatibility: `v13`  
> System compatibility: `nimble`

---

## What It Does

Nimble Loot lets the GM turn scene tokens into interactive loot objects. Players can open those objects through a configurable canvas interaction, take items, leave items, split currency, inspect locked containers, force them open, pick locks, enter key codes, and interact with mechanical or magical traps.

The module is intentionally **not** a full recreation of Item Piles. It is smaller, focused, and built around Nimble’s table flow.

---

## Core Profiles

### Loot Pile

Loose treasure, dropped gear, corpses, sacks, battlefield loot, or anything that should disappear once emptied.

- Contents are immediately available.
- Players can take items and currency.
- Empty loot-pile tokens delete themselves from the canvas.

### Container - List

A reusable container shown as a clean list.

- Good for chests, crates, cupboards, backpacks, corpses, wagons, and caches.
- Empty containers remain on the canvas.
- Players and GMs can add new items or currency later.

### Container - Grid

A reusable slotted container shown as a tile grid.

- Good for more visual containers, vault layouts, treasure displays, or organized caches.
- GM-configurable rows and columns.
- Items can be moved between grid slots.
- Matching items combine into a single tile and update quantity.

---

## Feature Highlights

- Scene-token-based loot state.
- Shared reusable **Nimble Loot Actor** for dropped item piles.
- Drag Nimble object items onto the canvas to create loot piles.
- Player item taking and depositing.
- Player currency taking, leaving, and splitting.
- Add From Inventory flow so players can deposit items without opening their character sheet.
- Locked-container flow with:
  - Inspect
  - Carefully Open
  - Pick Lock
  - Force Open
  - Use Key / Code
  - Disarm Mechanical Trap
  - Disarm Magical Trap
- Mechanical and magical trap states.
- Optional RollTable support for trap trigger outcomes.
- True slotted grid behavior for grid containers.
- Quick Configs for reusable GM setup patterns.
- Per-world and per-player canvas interaction settings.
- Accessibility-friendly **Any Click / Tap** mode for trackpads.
- Optional interaction distance limit.
- Optional animated loot-token border highlight.
- Actor-sheet suppression for configured loot tokens.

---

## Installation

### Manifest Installation

```text
https://github.com/KennyMakes/nimble-loot/releases/latest/download/module.json
```

In Foundry:

1. Open **Add-on Modules**.
2. Click **Install Module**.
3. Paste the manifest URL.
4. Install the module.
5. Enable **Nimble Loot** in your Nimble world.

### Manual Installation

1. Download the release zip.
2. Extract it into your Foundry modules folder:

```text
FoundryVTT/Data/modules/nimble-loot/
```

3. Confirm the folder contains `module.json` directly inside it.
4. Restart Foundry.
5. Enable **Nimble Loot** in your Nimble world.

---

## Basic GM Workflow

1. Enable the module in a Nimble world.
2. Open module settings and choose a **Loot Token Interaction** mode.
3. Optionally configure:
   - interaction distance limit
   - default token name display
   - default token disposition
   - border highlight behavior
   - trap RollTable folder
4. Drag a Nimble `object` item onto the canvas to create a loot pile.
5. Use your chosen interaction trigger to open the GM config dialog.
6. Choose a profile:
   - Loot Pile
   - Container - List
   - Container - Grid
7. Add or edit contents, currency, lock settings, traps, and Quick Configs.
8. Click **Save Configuration**.
9. Use **Show Player Dialog** to preview what players will see.

---

## Basic Player Workflow

Players interact with loot tokens using their configured trigger.

Depending on the loot state, players may be able to:

- inspect a container
- carefully try to open it
- pick the lock
- force it open
- enter a key/code
- disarm detected traps
- take items
- take or split currency
- leave currency
- add items from inventory
- drag items into open containers

Each player can choose their own trigger in module settings using **My Loot Token Interaction**.

---

## Recommended Interaction Settings

The module supports both global GM settings and per-player preferences.

Available interaction modes:

- Single left-click opens loot
- Single right-click opens loot
- Any click / tap opens loot
- Double left-click opens loot
- Shift + left-click opens loot
- Disabled - no canvas activation

For MacBook trackpads or unreliable double-click behavior, use:

```text
Any click / tap opens loot
```

Shift-click remains the normal bypass for Foundry token behavior.

---

## Important Rules and Behavior

### Hidden Loot

Nimble Loot does not use a separate discovered state.

If players should not know an object exists yet, hide the token with Foundry’s normal token visibility tools.

### Empty Loot Piles

When a loot pile is emptied, the token is deleted from the canvas and the player dialog closes.

### Empty Containers

Containers remain on the canvas when emptied. Players and GMs can continue to place items or currency into them.

### Lock and Trap Rolls

Inspect, Pick Lock, Force Open, and Disarm use Nimble’s native roll-to-chat pathway:

```js
actor.rollSkillCheckToChat()
```

The loot dialog records the outcome in the player-facing status log.

### Trap RollTables

Trap RollTables use Foundry’s normal RollTable behavior. If a trap triggers and a table is configured, Foundry handles the table result and chat output.

---

## Module Settings

### Loot Token Interaction

Global default interaction mode for opening Nimble Loot tokens.

### My Loot Token Interaction

Per-user override. Players can choose the interaction trigger that works best for their device.

### Suppress Loot Actor Sheet on Double-Click

Prevents configured loot tokens from opening the underlying Nimble NPC sheet accidentally.

### Limit Token Interaction Distance

Restricts player interaction to nearby tokens.

### Interaction Distance in Spaces

How close a player token must be to interact when distance limiting is enabled.

### Default Token Name Display

Default display mode for newly created loot tokens.

### Default Token Disposition

Default disposition for newly created loot tokens.

### Enable Loot Token Border

Enables optional visual highlighting on configured loot tokens.

### Loot Border Fade Duration

Controls the animated fade duration for the optional token border.

### Trap RollTable Folder

Folder used to populate trap RollTable dropdowns in the GM config dialog.

---

## Quick Configs

Quick Configs let GMs save and apply reusable loot/container setups.

Examples:

- simple chest
- locked strongbox
- trapped vault
- open supply crate
- grid-based treasure display

GMs can apply, save, and delete Quick Configs directly from the configuration dialog.

---

## Developer Notes

The packaged module includes both:

- the runtime bundle at `scripts/init.js`
- the editable source tree under `src/loot/`

Build the runtime bundle with:

```bash
npm run build
```

Run a syntax check with:

```bash
npm run syntax:check
```

The module is organized around a three-layer structure:

```text
Data Layer     -> token flags, defaults, migration, validation
Service Layer  -> transfers, sockets, access, traps, drops, highlights
UI Layer       -> player dialog, GM config dialog, small DialogV2 prompts
```

Loot state is stored on scene TokenDocuments:

```js
flags["nimble-loot"].loot
```

Inventory contents live on the loot token’s actor data. Currency for loot containers is stored in the loot token flag state.

---

## Known Limits and Future Plans

Planned or possible future work:

- GM loot-awarding tool integration.
- Trap table compendium packs.
- Restore default Quick Configs option.
- Additional visual polish after more table testing.
- Broader compatibility testing with future Nimble and Foundry releases.

---

## Compatibility

Nimble Loot is designed for:

- Foundry VTT v13
- Nimble system v0.8.x

Earlier versions may work, but are not the target release environment.

---

## Attribution

Nimble Loot is an independent product published under the Nimble 3rd Party Creator License and is not affiliated with Nimble Co. Nimble © 2025 Nimble Co.

Foundry Virtual Tabletop is a trademark of Foundry Gaming LLC. This module is not affiliated with Foundry Gaming LLC.
