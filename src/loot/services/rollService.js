function nimbleLootGetSkillBonus(actor, skill) {
  const key = String(skill ?? "").toLowerCase();
  const candidates = [
    `system.skills.${key}.total`,
    `system.skills.${key}.value`,
    `system.skills.${key}.bonus`,
    `system.skills.${key}.mod`,
    `system.skills.${key}`,
    `skills.${key}.total`,
    `skills.${key}.value`,
    `skills.${key}.bonus`,
    `skills.${key}.mod`,
    `skills.${key}`
  ];

  const rollData = actor?.getRollData?.() ?? actor ?? {};
  for (const path of candidates) {
    const direct = foundry.utils.getProperty(actor, path);
    const fromRollData = foundry.utils.getProperty(rollData, path.replace(/^system\./, ""));
    for (const value of [direct, fromRollData]) {
      if (typeof value === "number" && Number.isFinite(value)) return Math.floor(value);
      if (value && typeof value === "object") {
        for (const nested of [value.total, value.value, value.bonus, value.mod, value.modifier]) {
          if (typeof nested === "number" && Number.isFinite(nested)) return Math.floor(nested);
        }
      }
    }
  }

  return 0;
}

function nimbleLootRollSpeaker(actor) {
  return ChatMessage.getSpeaker({ actor });
}

function nimbleLootExtractRollTotal(value) {
  if (!value) return null;
  if (typeof value.total === "number") return value.total;
  if (typeof value._total === "number") return value._total;
  if (typeof value.result === "number") return value.result;
  if (typeof value.roll?.total === "number") return value.roll.total;
  if (Array.isArray(value.rolls) && value.rolls.length) {
    for (const roll of value.rolls) {
      const total = nimbleLootExtractRollTotal(roll);
      if (typeof total === "number") return total;
    }
  }
  if (value.message?.rolls?.length) return nimbleLootExtractRollTotal(value.message);
  return null;
}

function nimbleLootExtractNaturalD20(value) {
  if (!value) return null;
  const candidates = [];
  if (value.roll) candidates.push(value.roll);
  if (Array.isArray(value.rolls)) candidates.push(...value.rolls);
  candidates.push(value);
  for (const candidate of candidates) {
    const dice = candidate?.dice ?? candidate?.terms?.filter?.((term) => term?.faces === 20) ?? [];
    for (const die of dice) {
      if (die?.faces !== 20) continue;
      const result = die.results?.find?.((r) => r.active !== false)?.result;
      if (typeof result === "number" && Number.isFinite(result)) return Math.floor(result);
    }
  }
  return null;
}

function nimbleLootFindRecentRollData(actor, sinceTimestamp = 0) {
  const actorId = actor?.id;
  const messages = Array.from(game.messages?.contents ?? []).reverse();
  for (const message of messages) {
    if ((message.timestamp ?? 0) < sinceTimestamp) continue;
    if (actorId && message.speaker?.actor && message.speaker.actor !== actorId) continue;
    const total = nimbleLootExtractRollTotal(message);
    if (typeof total !== "number" || !Number.isFinite(total)) continue;
    return { total, natural: nimbleLootExtractNaturalD20(message) };
  }
  return null;
}

async function nimbleLootTryNativeSkillRoll(actor, skill, dc, label, options = {}) {
  const native = actor?.rollSkillCheckToChat;
  if (typeof native !== "function") return undefined;

  const normalizedSkill = nimbleLootValidateSkill(skill);
  const normalizedDc = nimbleLootValidateDc(dc, 15);
  const flatBonus = Math.floor(Number(options.flatBonus ?? options.bonus ?? 0) || 0);
  const situationalMods = flatBonus !== 0 ? `${flatBonus >= 0 ? "+" : ""}${flatBonus}` : (options.situationalMods ?? "");

  const payload = {
    ...options,
    prompted: true,
    dc: normalizedDc,
    label,
    flavor: label,
    title: label
  };
  if (situationalMods !== "") payload.situationalMods = situationalMods;

  try {
    const result = await native.call(actor, normalizedSkill, payload);
    if (!result) return null;
    const roll = result?.rolls?.[0] ?? result?.roll ?? null;
    const total = Math.floor(Number((roll?.total ?? nimbleLootExtractRollTotal(result))) || 0);
    const natural = nimbleLootExtractNaturalD20(roll) ?? nimbleLootExtractNaturalD20(result);
    return {
      total,
      dc: normalizedDc,
      success: total >= normalizedDc,
      roll,
      message: result ?? null,
      rollData: result?.rollData ?? null,
      skill: normalizedSkill,
      native: true,
      bonus: null,
      flatBonus,
      natural,
      isNat1: natural === 1,
      isNat20: natural === 20
    };
  } catch (error) {
    nimbleLootDebug("Native Nimble rollSkillCheckToChat attempt failed; using Nimble Loot fallback roll.", error);
    return undefined;
  }
}

async function nimbleLootRollSkillToChat(actor, skill, dc, label, options = {}) {
  if (!actor) throw new Error("No actor provided for roll.");
  const normalizedSkill = nimbleLootValidateSkill(skill);
  const normalizedDc = nimbleLootValidateDc(dc, 15);
  const flatBonus = Math.floor(Number(options.flatBonus ?? options.bonus ?? 0) || 0);

  // Prefer Nimble's native roll-to-chat pathway so the roll uses system behavior,
  // roll modes, modifier handling, and the standard Nimble chat card output.
  const nativeResult = await nimbleLootTryNativeSkillRoll(actor, normalizedSkill, normalizedDc, label, { ...options, flatBonus });
  if (nativeResult === null) return null;
  if (nativeResult !== undefined) return nativeResult;

  const skillBonus = nimbleLootGetSkillBonus(actor, normalizedSkill);
  const totalBonus = skillBonus + flatBonus;
  const formula = totalBonus === 0 ? "1d20" : `1d20 ${totalBonus >= 0 ? "+" : "-"} ${Math.abs(totalBonus)}`;
  const roll = await new Roll(formula).evaluate();
  const total = Math.floor(Number(roll.total) || 0);
  const natural = nimbleLootExtractNaturalD20(roll);
  const success = total >= normalizedDc;
  return { total, dc: normalizedDc, success, roll, skill: normalizedSkill, bonus: totalBonus, flatBonus, natural, isNat1: natural === 1, isNat20: natural === 20, native: false };
}

async function nimbleLootPostSimpleChat(title, body, whisperGm = false) {
  const content = `<div class="nimble-loot-chat-card"><h3>${nimbleLootEscape(title)}</h3><p>${nimbleLootEscape(body)}</p></div>`;
  const data = { content };
  if (whisperGm) data.whisper = ChatMessage.getWhisperRecipients("GM").map((u) => u.id);
  return ChatMessage.create(data);
}
