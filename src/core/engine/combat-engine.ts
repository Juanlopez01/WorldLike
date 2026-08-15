import type {
  EntityInstance,
  EntityTemplate,
  Skill,
  StatusEffect,
  CombatConfig,
  TypeChart,
  CombatState,
  Combatant,
  TurnResult,
  CombatAction,
  ThemePack,
  EncounterTemplate,
} from "../types";
import { SeededRNG } from "./rng";
import { instantiateEntity, isAlive, damageEntity, healEntity } from "./entity-manager";

export function createCombatState(
  playerParty: EntityInstance[],
  encounter: EncounterTemplate,
  theme: ThemePack,
  rng: SeededRNG
): CombatState {
  const playerTeam: Combatant[] = playerParty.map((e, i) => ({
    ...e,
    side: "player" as const,
    position: i,
    isActive: i === 0,
  }));

  const enemyTeam: Combatant[] = [];
  for (const enemyDef of encounter.enemies) {
    const template = theme.entities.find((e) => e.id === enemyDef.templateId);
    if (!template) continue;

    for (let i = 0; i < enemyDef.count; i++) {
      const level = rng.nextInt(enemyDef.levelRange[0], enemyDef.levelRange[1]);
      const instance = instantiateEntity(
        { ...template, initialLevel: level },
        rng
      );
      enemyTeam.push({
        ...instance,
        side: "enemy" as const,
        position: enemyTeam.length,
        isActive: enemyTeam.length === 0,
      });
    }
  }

  return {
    id: `combat_${Date.now()}`,
    status: "player_turn",
    turn: 1,
    playerTeam,
    enemyTeam,
    turnLog: [],
    environment: encounter.environment,
    specialRules: encounter.specialRules,
    rewards: {
      xp: 0,
      resources: {},
      entities: [],
      items: [],
    },
  };
}

export function getActivePlayer(state: CombatState): Combatant | null {
  return state.playerTeam.find((c) => c.isActive && isAlive(c)) ?? null;
}

export function getActiveEnemy(state: CombatState): Combatant | null {
  return state.enemyTeam.find((c) => c.isActive && isAlive(c)) ?? null;
}

function getTypeMultiplier(
  attackerTypes: string[],
  defenderTypes: string[],
  skillDamageType: string | undefined,
  typeChart?: TypeChart
): { multiplier: number; effectiveness: TurnResult["effectiveness"] } {
  if (!typeChart || !skillDamageType) {
    return { multiplier: 1, effectiveness: "normal" };
  }

  let totalMult = 1;
  for (const defType of defenderTypes) {
    const matchup = typeChart.matchups.find(
      (m) => m.attackType === skillDamageType && m.defendType === defType
    );
    if (matchup) {
      totalMult *= matchup.multiplier;
    }
  }

  let effectiveness: TurnResult["effectiveness"] = "normal";
  if (totalMult > 1.2) effectiveness = "super_effective";
  else if (totalMult < 0.8) effectiveness = "not_effective";
  else if (totalMult === 0) effectiveness = "immune";

  return { multiplier: totalMult, effectiveness };
}

export interface CombatModifiers {
  damageMult: number;
  accuracyMod: number;
  statsMult: number;
  canFlee: boolean;
  skipChance: number;
}

export function getMoralModifiers(moral: number): Partial<CombatModifiers> {
  if (moral >= 90) return { damageMult: 1.15, accuracyMod: 10 };
  if (moral >= 60) return {};
  if (moral >= 30) return { damageMult: 0.90, accuracyMod: -5 };
  return { damageMult: 0.80, accuracyMod: -10, skipChance: 0.15 };
}

export function getEnergiaModifiers(energia: number): Partial<CombatModifiers> {
  if (energia >= 70) return {};
  if (energia >= 40) return {};
  if (energia >= 10) return { statsMult: 0.80, accuracyMod: -10 };
  return { statsMult: 0.70, canFlee: false };
}

export function buildModifiers(resources: Record<string, number>): CombatModifiers {
  const moral = resources.moral ?? 100;
  const energia = resources.energia ?? 100;
  const moralMods = getMoralModifiers(moral);
  const energiaMods = getEnergiaModifiers(energia);
  return {
    damageMult: (moralMods.damageMult ?? 1) * (energiaMods.damageMult ?? 1),
    accuracyMod: (moralMods.accuracyMod ?? 0) + (energiaMods.accuracyMod ?? 0),
    statsMult: energiaMods.statsMult ?? 1,
    canFlee: energiaMods.canFlee ?? true,
    skipChance: moralMods.skipChance ?? 0,
  };
}

function calculateDamage(
  attacker: Combatant,
  defender: Combatant,
  skill: Skill,
  config: CombatConfig,
  typeChart?: TypeChart,
  rng?: SeededRNG,
  mods?: CombatModifiers
): { damage: number; isCritical: boolean; effectiveness: TurnResult["effectiveness"] } {
  if (skill.power === 0) {
    return { damage: 0, isCritical: false, effectiveness: "normal" };
  }

  const statsMult = mods?.statsMult ?? 1;
  const atkStat = (skill.damageType
    ? attacker.stats[skill.damageType] ?? 50
    : Math.max(...Object.values(attacker.stats))) * statsMult;

  const defStat = Math.max(
    ...Object.values(defender.stats).filter((_, i) => i >= 4)
  ) || 50;

  const baseDamage = ((atkStat * skill.power) / (defStat + 50)) * 2 + 5;

  const { multiplier, effectiveness } = getTypeMultiplier(
    attacker.types,
    defender.types,
    skill.damageType,
    typeChart
  );

  const isCritical = (rng?.next() ?? Math.random()) < config.baseCritChance;
  const critMult = isCritical ? config.critMultiplier : 1;

  const variance = 0.85 + (rng?.next() ?? Math.random()) * 0.3;
  const damageMult = mods?.damageMult ?? 1;

  const finalDamage = Math.max(1, Math.floor(baseDamage * multiplier * critMult * variance * damageMult));

  return { damage: finalDamage, isCritical, effectiveness };
}

export function executePlayerAction(
  state: CombatState,
  action: CombatAction,
  config: CombatConfig,
  typeChart?: TypeChart,
  rng?: SeededRNG,
  mods?: CombatModifiers
): { state: CombatState; result: TurnResult } {
  const player = getActivePlayer(state);
  const enemy = getActiveEnemy(state);

  if (!player || !enemy) {
    return {
      state,
      result: {
        turn: state.turn,
        action,
        damage: 0,
        healing: 0,
        isCritical: false,
        effectiveness: "normal",
        appliedEffects: [],
        removedEffects: [],
        message: "No hay combatientes activos",
        fainted: [],
      },
    };
  }

  if (mods && mods.skipChance > 0) {
    const roll = rng?.next() ?? Math.random();
    if (roll < mods.skipChance) {
      const skipResult = makeTurnResult(state.turn, action, `${player.name} está en crisis y no puede reaccionar!`);
      const newState = { ...state, turnLog: [...state.turnLog, skipResult], status: "enemy_turn" as const };
      return { state: newState, result: skipResult };
    }
  }

  let newState = { ...state };
  let result: TurnResult;

  switch (action.kind) {
    case "skill": {
      const skill = player.skills.find((s) => s.id === action.skillId);
      if (!skill) {
        result = makeTurnResult(state.turn, action, "Skill no encontrada");
        break;
      }

      const adjustedAccuracy = Math.min(100, skill.accuracy + (mods?.accuracyMod ?? 0));
      if (adjustedAccuracy < 100) {
        const roll = (rng?.next() ?? Math.random()) * 100;
        if (roll > adjustedAccuracy) {
          result = makeTurnResult(state.turn, action, `${player.name} usó ${skill.name} pero falló!`);
          break;
        }
      }

      const { damage, isCritical, effectiveness } = calculateDamage(
        player,
        enemy,
        skill,
        config,
        typeChart,
        rng,
        mods
      );

      const updatedEnemy = damageEntity(enemy, damage);
      const fainted = !isAlive(updatedEnemy) ? [updatedEnemy.instanceId] : [];

      newState = updateCombatant(newState, updatedEnemy);

      let msg = `${player.name} usó ${skill.name}!`;
      if (effectiveness === "super_effective") msg += " Super efectivo!";
      if (effectiveness === "not_effective") msg += " Poco efectivo...";
      if (isCritical) msg += " Golpe crítico!";
      msg += ` -${damage} HP`;
      if (fainted.length > 0) msg += `. ${updatedEnemy.name} fue eliminado!`;

      const appliedEffects: StatusEffect[] = [];
      if (skill.effects.length > 0 && isAlive(updatedEnemy)) {
        for (const effect of skill.effects) {
          appliedEffects.push(effect);
          if (effect.type === "buff" || effect.type === "debuff") {
            const target = effect.type === "buff" ? player : updatedEnemy;
            const updated = {
              ...target,
              activeEffects: [...target.activeEffects, effect],
            };
            newState = updateCombatant(newState, updated);
          }
        }
      }

      result = {
        turn: state.turn,
        action,
        damage,
        healing: 0,
        isCritical,
        effectiveness,
        appliedEffects,
        removedEffects: [],
        message: msg,
        fainted,
      };
      break;
    }

    case "flee": {
      if (mods && !mods.canFlee) {
        result = makeTurnResult(state.turn, action, `${player.name} está reventado y no puede huir!`);
        break;
      }
      const fleeChance = config.fleeBaseChance;
      const roll = rng?.next() ?? Math.random();
      if (roll < fleeChance) {
        newState = { ...newState, status: "fled" };
        result = makeTurnResult(state.turn, action, "Huiste del combate!");
      } else {
        result = makeTurnResult(state.turn, action, "No pudiste escapar!");
      }
      break;
    }

    case "recruit": {
      const recruitChance = 0.3 * (1 - enemy.currentHp / enemy.maxHp);
      const roll = rng?.next() ?? Math.random();
      if (roll < recruitChance) {
        result = {
          ...makeTurnResult(state.turn, action, `Reclutaste a ${enemy.name}!`),
          recruited: enemy.templateId,
        };
        const updatedEnemy2 = { ...enemy, currentHp: 0 };
        newState = updateCombatant(newState, updatedEnemy2);
      } else {
        result = makeTurnResult(state.turn, action, `${enemy.name} rechazó tu oferta!`);
      }
      break;
    }

    default:
      result = makeTurnResult(state.turn, action, "Acción no implementada");
  }

  newState = {
    ...newState,
    turnLog: [...newState.turnLog, result],
  };

  if (newState.status !== "fled") {
    const allEnemiesDead = newState.enemyTeam.every((e) => !isAlive(e));
    if (allEnemiesDead) {
      newState.status = "victory";
    } else if (result.fainted.length > 0) {
      const nextEnemy = newState.enemyTeam.find((e) => isAlive(e) && !e.isActive);
      if (nextEnemy) {
        newState = updateCombatant(newState, { ...getActiveEnemy(newState)!, isActive: false });
        newState = updateCombatant(newState, { ...nextEnemy, isActive: true });
      }
    }

    if (newState.status !== "victory") {
      newState.status = "enemy_turn";
    }
  }

  return { state: newState, result };
}

export function executeEnemyTurn(
  state: CombatState,
  config: CombatConfig,
  typeChart?: TypeChart,
  rng?: SeededRNG
): { state: CombatState; result: TurnResult } {
  const enemy = getActiveEnemy(state);
  const player = getActivePlayer(state);

  if (!enemy || !player) {
    const dummyAction: CombatAction = { kind: "skill", skillId: "", sourceId: "", targetId: "" };
    return {
      state,
      result: makeTurnResult(state.turn, dummyAction, "No hay combatientes"),
    };
  }

  const availableSkills = enemy.skills.filter(
    (s) => (enemy.cooldowns[s.id] ?? 0) <= 0
  );
  const skill = availableSkills.length > 0
    ? availableSkills[rng ? rng.nextInt(0, availableSkills.length - 1) : 0]
    : enemy.skills[0];

  if (!skill) {
    const action: CombatAction = { kind: "skill", skillId: "basic_attack", sourceId: enemy.instanceId, targetId: player.instanceId };
    const baseDmg = Math.max(1, Math.floor(
      (Math.max(...Object.values(enemy.stats)) / 3) *
      (0.85 + (rng?.next() ?? Math.random()) * 0.3)
    ));
    const updatedPlayer = damageEntity(player, baseDmg);
    let newState = updateCombatant(state, updatedPlayer);
    const fainted = !isAlive(updatedPlayer) ? [updatedPlayer.instanceId] : [];
    const result: TurnResult = {
      turn: state.turn,
      action,
      damage: baseDmg,
      healing: 0,
      isCritical: false,
      effectiveness: "normal",
      appliedEffects: [],
      removedEffects: [],
      message: `${enemy.name} ataca! -${baseDmg} HP`,
      fainted,
    };
    newState = { ...newState, turnLog: [...newState.turnLog, result] };
    newState = checkPostEnemyTurn(newState);
    return { state: newState, result };
  }

  const action: CombatAction = {
    kind: "skill",
    skillId: skill.id,
    sourceId: enemy.instanceId,
    targetId: player.instanceId,
  };

  let hitMsg = "";
  if (skill.accuracy < 100) {
    const roll = (rng?.next() ?? Math.random()) * 100;
    if (roll > skill.accuracy) {
      const result = makeTurnResult(state.turn, action, `${enemy.name} usó ${skill.name} pero falló!`);
      let newState = { ...state, turnLog: [...state.turnLog, result] };
      newState = checkPostEnemyTurn(newState);
      return { state: newState, result };
    }
  }

  const { damage, isCritical, effectiveness } = calculateDamage(
    enemy as Combatant,
    player,
    skill,
    config,
    typeChart,
    rng
  );

  const updatedPlayer = damageEntity(player, damage);
  let newState = updateCombatant(state, updatedPlayer);
  const fainted = !isAlive(updatedPlayer) ? [updatedPlayer.instanceId] : [];

  let msg = `${enemy.name} usó ${skill.name}!`;
  if (effectiveness === "super_effective") msg += " Super efectivo!";
  if (effectiveness === "not_effective") msg += " Poco efectivo...";
  if (isCritical) msg += " Golpe crítico!";
  msg += ` -${damage} HP`;
  if (fainted.length > 0) msg += `. ${player.name} fue eliminado!`;

  const result: TurnResult = {
    turn: state.turn,
    action,
    damage,
    healing: 0,
    isCritical,
    effectiveness,
    appliedEffects: [],
    removedEffects: [],
    message: msg,
    fainted,
  };

  newState = { ...newState, turnLog: [...newState.turnLog, result] };
  newState = checkPostEnemyTurn(newState);

  return { state: newState, result };
}

function checkPostEnemyTurn(state: CombatState): CombatState {
  const allPlayersDead = state.playerTeam.every((p) => !isAlive(p));
  if (allPlayersDead) {
    return { ...state, status: "defeat" };
  }

  const activePlayer = getActivePlayer(state);
  if (!activePlayer) {
    const nextAlive = state.playerTeam.find((p) => isAlive(p));
    if (nextAlive) {
      let s = updateCombatant(state, { ...state.playerTeam.find(p => p.isActive)!, isActive: false });
      s = updateCombatant(s, { ...nextAlive, isActive: true });
      return { ...s, status: "player_turn", turn: state.turn + 1 };
    }
    return { ...state, status: "defeat" };
  }

  return { ...state, status: "player_turn", turn: state.turn + 1 };
}

function updateCombatant(state: CombatState, updated: Combatant | EntityInstance): CombatState {
  return {
    ...state,
    playerTeam: state.playerTeam.map((c) =>
      c.instanceId === updated.instanceId ? { ...c, ...updated } as Combatant : c
    ),
    enemyTeam: state.enemyTeam.map((c) =>
      c.instanceId === updated.instanceId ? { ...c, ...updated } as Combatant : c
    ),
  };
}

function makeTurnResult(turn: number, action: CombatAction, message: string): TurnResult {
  return {
    turn,
    action,
    damage: 0,
    healing: 0,
    isCritical: false,
    effectiveness: "normal",
    appliedEffects: [],
    removedEffects: [],
    message,
    fainted: [],
  };
}

export function calculateRewards(
  state: CombatState,
  encounter: EncounterTemplate
): { xp: number; resources: Record<string, number> } {
  const baseXp = state.enemyTeam.reduce((sum, e) => {
    const levelFactor = e.level * 10;
    return sum + levelFactor;
  }, 0);

  const xp = Math.floor(baseXp * (encounter.rewards.xpMultiplier ?? 1));
  const resources: Record<string, number> = {};

  for (const [resource, chance] of Object.entries(encounter.rewards.bonusResourceChance ?? {})) {
    if (Math.random() < chance) {
      resources[resource] = Math.floor(10 + Math.random() * 40);
    }
  }
  resources["monedas"] = (resources["monedas"] ?? 0) + Math.floor(20 + Math.random() * 30);

  return { xp, resources };
}
