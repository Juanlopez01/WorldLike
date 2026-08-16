/**
 * Generates the complete FutbolMon theme.json with 205 players, 42 events,
 * enemies per copa, encounters per copa, and 9 copa definitions.
 * Run with: npx tsx scripts/generate-theme.ts
 */

import * as fs from "fs";
import * as path from "path";

// ─── PLAYER DATA ────────────────────────────────────────────────────────

interface PlayerDef {
  id: string;
  name: string;
  desc: string;
  category: "arquero" | "defensor" | "mediocampista" | "delantero";
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  types: string[];
  tags: string[];
  level: number;
  statProfile: "gk" | "def" | "mid" | "att" | "wing" | "dm";
  skillIds: string[];
  passive?: string;
  flavor: string;
  team?: string;
  country?: string;
}

const STAT_PROFILES: Record<string, Record<string, [number, number]>> = {
  gk:   { ritmo: [30, 45], tiro: [10, 20], pase: [40, 55], regate: [15, 25], defensa: [25, 35], fisico: [65, 80], reflejos: [80, 95], posicion: [75, 88] },
  def:  { ritmo: [45, 65], tiro: [25, 40], pase: [50, 65], regate: [30, 50], defensa: [70, 88], fisico: [68, 82], reflejos: [30, 42], posicion: [65, 80] },
  dm:   { ritmo: [55, 72], tiro: [40, 58], pase: [65, 82], regate: [55, 72], defensa: [60, 78], fisico: [65, 78], reflejos: [28, 38], posicion: [65, 78] },
  mid:  { ritmo: [65, 80], tiro: [60, 78], pase: [72, 90], regate: [70, 88], defensa: [30, 50], fisico: [55, 68], reflejos: [25, 35], posicion: [58, 72] },
  wing: { ritmo: [78, 92], tiro: [62, 80], pase: [65, 82], regate: [75, 92], defensa: [22, 38], fisico: [52, 68], reflejos: [25, 35], posicion: [50, 65] },
  att:  { ritmo: [72, 90], tiro: [78, 95], pase: [48, 65], regate: [60, 80], defensa: [18, 32], fisico: [65, 82], reflejos: [22, 35], posicion: [78, 92] },
};

const RARITY_STAT_BONUS: Record<string, number> = {
  common: -15, uncommon: -8, rare: 0, epic: 8, legendary: 15,
};

function generateStats(profile: string, rarity: string, seed: number): Record<string, number> {
  const ranges = STAT_PROFILES[profile];
  const bonus = RARITY_STAT_BONUS[rarity];
  const stats: Record<string, number> = {};
  let i = 0;
  for (const [stat, [min, max]] of Object.entries(ranges)) {
    const pseudoRand = ((seed * 2654435761 + i * 1013904223) >>> 0) / 4294967296;
    const base = min + Math.floor(pseudoRand * (max - min + 1)) + bonus;
    stats[stat] = Math.max(1, Math.min(99, base));
    i++;
  }
  return stats;
}

// ─── SKILL TEMPLATES ────────────────────────────────────────────────────

const SKILL_POOL = [
  { id: "sk_gambeta_corta", name: "Gambeta Corta", desc: "Amague rápido que deja rivales atrás.", power: 20, cost: 1, acc: 85, dmg: "regate", tags: ["regate"] },
  { id: "sk_centro_venenoso", name: "Centro Venenoso", desc: "Centro rasante al área que genera peligro.", power: 25, cost: 2, acc: 80, dmg: "pase", tags: ["pase"] },
  { id: "sk_pase_filtrado", name: "Pase Filtrado", desc: "Pase entre líneas que rompe la defensa.", power: 15, cost: 2, acc: 75, dmg: "pase", tags: ["pase", "creativo"] },
  { id: "sk_enganchar", name: "Enganchar y Patear", desc: "Recorte y remate al arco.", power: 28, cost: 2, acc: 70, dmg: "tiro", tags: ["tiro", "regate"] },
  { id: "sk_definicion_letal", name: "Definición Letal", desc: "Remate inapelable al primer toque.", power: 40, cost: 2, acc: 88, dmg: "tiro", tags: ["tiro"] },
  { id: "sk_depredador", name: "Depredador del Área", desc: "Se anticipa y mete el gol imposible.", power: 50, cost: 4, acc: 75, dmg: "tiro", tags: ["tiro", "élite"], cd: 3 },
  { id: "sk_tiki_taka", name: "Tiki-Taka", desc: "Pase al primer toque que desorganiza.", power: 18, cost: 1, acc: 92, dmg: "pase", tags: ["pase"] },
  { id: "sk_pressing", name: "Presión Alta", desc: "Persigue sin descanso y recupera.", power: 20, cost: 2, acc: 85, dmg: "defensa", tags: ["defensa"] },
  { id: "sk_barrida", name: "Barrida Precisa", desc: "Entrada por abajo, limpia la jugada.", power: 22, cost: 1, acc: 82, dmg: "defensa", tags: ["defensa"] },
  { id: "sk_cabezazo", name: "Cabezazo", desc: "Remate de cabeza imponente.", power: 25, cost: 1, acc: 80, dmg: "fisico", tags: ["aéreo"] },
  { id: "sk_chilena", name: "Chilena", desc: "Remate acrobático de espaldas al arco.", power: 30, cost: 3, acc: 55, dmg: "tiro", tags: ["tiro", "acrobacia"], cd: 2 },
  { id: "sk_bombazo", name: "Bombazo", desc: "Disparo potente de larga distancia.", power: 35, cost: 3, acc: 65, dmg: "tiro", tags: ["tiro"], cd: 2 },
  { id: "sk_sombrero", name: "Sombrero", desc: "Pasa la pelota por arriba del rival.", power: 18, cost: 1, acc: 80, dmg: "regate", tags: ["regate"] },
  { id: "sk_caño", name: "Caño", desc: "Pase entre las piernas del rival.", power: 15, cost: 1, acc: 80, dmg: "regate", tags: ["regate"] },
  { id: "sk_achique", name: "Achique Suicida", desc: "Sale del arco a cortar el mano a mano.", power: 30, cost: 3, acc: 65, dmg: "defensa", tags: ["arco"], cd: 3 },
  { id: "sk_atajada", name: "Atajada Imposible", desc: "Volada espectacular que salva.", power: 0, cost: 4, acc: 60, dmg: "reflejos", tags: ["arco"], cd: 4 },
  { id: "sk_proyeccion", name: "Proyección Ofensiva", desc: "Pique por la banda y centro preciso.", power: 18, cost: 2, acc: 80, dmg: "pase", tags: ["carrilero"] },
  { id: "sk_marca_personal", name: "Marca Personal", desc: "Sigue al rival como sombra.", power: 20, cost: 2, acc: 90, dmg: "defensa", tags: ["defensa"], cd: 2 },
  { id: "sk_liderazgo", name: "Liderazgo", desc: "Arenga al equipo.", power: 0, cost: 3, acc: 100, dmg: "fisico", tags: ["capitán"], cd: 4 },
  { id: "sk_tiro_libre", name: "Tiro Libre", desc: "Disparo con efecto sobre la barrera.", power: 35, cost: 3, acc: 60, dmg: "tiro", tags: ["tiro"], cd: 3 },
  { id: "sk_quite", name: "Quite Limpio", desc: "Barrida precisa que recupera.", power: 18, cost: 1, acc: 85, dmg: "defensa", tags: ["defensa"] },
  { id: "sk_pared", name: "Pared", desc: "Pase y devolución rápida.", power: 22, cost: 2, acc: 88, dmg: "pase", tags: ["pase"] },
  { id: "sk_media_vuelta", name: "Media Vuelta", desc: "Giro y remate fulminante.", power: 32, cost: 2, acc: 72, dmg: "tiro", tags: ["tiro"], cd: 1 },
  { id: "sk_rabona", name: "Rabona", desc: "Centro o tiro cruzando piernas.", power: 28, cost: 2, acc: 60, dmg: "regate", tags: ["lujo"], cd: 2 },
  { id: "sk_tackleo", name: "Tackleo Firme", desc: "Entrada fuerte que frena al rival.", power: 20, cost: 1, acc: 85, dmg: "fisico", tags: ["fisico"] },
  { id: "sk_zurdazo", name: "Zurdazo al Ángulo", desc: "Disparo colocado al segundo palo.", power: 35, cost: 3, acc: 72, dmg: "tiro", tags: ["tiro"], cd: 2 },
  { id: "sk_diagonal", name: "Diagonal Letal", desc: "Pase largo diagonal que parte la defensa.", power: 20, cost: 2, acc: 82, dmg: "pase", tags: ["pase"], cd: 1 },
  { id: "sk_penales", name: "Especialista en Penales", desc: "Lee al pateador y adivina el palo.", power: 35, cost: 4, acc: 55, dmg: "reflejos", tags: ["arco"], cd: 5 },
  { id: "sk_regate_doble", name: "Regate Doble", desc: "Dos amagos consecutivos.", power: 24, cost: 2, acc: 78, dmg: "regate", tags: ["regate"], cd: 1 },
  { id: "sk_volea", name: "Volea", desc: "Remate de volea cruzada.", power: 38, cost: 3, acc: 58, dmg: "tiro", tags: ["tiro"], cd: 2 },
];

function getSkillsForProfile(profile: string, rarity: string, seed: number): string[] {
  const profileSkills: Record<string, string[]> = {
    gk: ["sk_achique", "sk_atajada", "sk_penales"],
    def: ["sk_barrida", "sk_cabezazo", "sk_tackleo", "sk_marca_personal", "sk_liderazgo"],
    dm: ["sk_pressing", "sk_quite", "sk_barrida", "sk_pared", "sk_marca_personal"],
    mid: ["sk_pase_filtrado", "sk_tiki_taka", "sk_diagonal", "sk_pared", "sk_media_vuelta", "sk_tiro_libre"],
    wing: ["sk_gambeta_corta", "sk_enganchar", "sk_centro_venenoso", "sk_sombrero", "sk_rabona", "sk_regate_doble"],
    att: ["sk_definicion_letal", "sk_bombazo", "sk_chilena", "sk_cabezazo", "sk_volea", "sk_depredador", "sk_media_vuelta"],
  };
  const pool = profileSkills[profile] || profileSkills.mid;
  const count = rarity === "legendary" ? 3 : rarity === "epic" ? 2 : rarity === "rare" ? 2 : 1;
  const sorted = [...pool].sort((a, b) => {
    const pa = SKILL_POOL.find((s) => s.id === a)?.power ?? 0;
    const pb = SKILL_POOL.find((s) => s.id === b)?.power ?? 0;
    return pb - pa;
  });
  const tierStart = rarity === "legendary" || rarity === "epic" ? 0
    : rarity === "rare" ? 1
    : Math.max(0, sorted.length - count - 1);
  const tierSlice = sorted.slice(tierStart);
  const shuffled = [...tierSlice].sort((a, b) => {
    const ha = ((seed * 2654435761 + a.charCodeAt(3) * 1013904223) >>> 0);
    const hb = ((seed * 2654435761 + b.charCodeAt(3) * 1013904223) >>> 0);
    return ha - hb;
  });
  const selected: string[] = [];
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    selected.push(shuffled[i]);
  }
  return selected;
}

const RARITY_POWER_SCALE: Record<string, number> = {
  common: 0.65,
  uncommon: 0.80,
  rare: 1.0,
  epic: 1.15,
  legendary: 1.30,
};

function buildSkill(skillId: string, rarity?: string) {
  const template = SKILL_POOL.find((s) => s.id === skillId);
  if (!template) return null;
  const scale = RARITY_POWER_SCALE[rarity ?? "rare"] ?? 1.0;
  const scaledPower = template.power > 0 ? Math.round(template.power * scale) : 0;
  return {
    id: template.id,
    name: template.name,
    description: template.desc,
    power: scaledPower,
    cost: template.cost,
    costResource: "energia",
    accuracy: template.acc,
    targetType: "single_enemy",
    damageType: template.dmg,
    effects: [],
    cooldown: template.cd ?? 0,
    unlockLevel: 1,
    tags: template.tags,
  };
}

// ─── PLAYER ROSTER ──────────────────────────────────────────────────────

const LEGENDARY_PLAYERS: PlayerDef[] = [
  { id: "p_haaland", name: "Erling Haaland", desc: "Centre-Forward - Manchester City (Noruega)", category: "delantero", rarity: "legendary", types: ["goleador", "área"], tags: ["man_city", "noruego"], level: 10, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_depredador", "sk_cabezazo"], passive: "Máquina de Goles: +25% daño tiro cuando HP > 70%", flavor: "El vikingo que aterroriza a las defensas." },
  { id: "p_mbappe", name: "Kylian Mbappé", desc: "Forward - Real Madrid (Francia)", category: "delantero", rarity: "legendary", types: ["extremo", "velocidad"], tags: ["real_madrid", "francés"], level: 10, statProfile: "wing", skillIds: ["sk_enganchar", "sk_bombazo", "sk_regate_doble"], passive: "Turbo: +20% ritmo el primer turno", flavor: "Más rápido que tu conexión de internet." },
  { id: "p_vinicius", name: "Vinícius Jr.", desc: "Left Winger - Real Madrid (Brasil)", category: "delantero", rarity: "legendary", types: ["extremo", "regate"], tags: ["real_madrid", "brasileño"], level: 10, statProfile: "wing", skillIds: ["sk_gambeta_corta", "sk_enganchar", "sk_sombrero"], passive: "Jogo Bonito: +15% regate, +10% moral al equipo", flavor: "El fútbol volvió a ser arte." },
  { id: "p_bellingham", name: "Jude Bellingham", desc: "Midfielder - Real Madrid (Inglaterra)", category: "mediocampista", rarity: "legendary", types: ["volante", "goleador"], tags: ["real_madrid", "inglés"], level: 10, statProfile: "mid", skillIds: ["sk_media_vuelta", "sk_pressing", "sk_pase_filtrado"], passive: "Box to Box: +10% a todos los stats", flavor: "Llegó, vio y lo ganó todo." },
  { id: "p_saka", name: "Bukayo Saka", desc: "Right Winger - Arsenal (Inglaterra)", category: "delantero", rarity: "legendary", types: ["extremo", "velocidad"], tags: ["arsenal", "inglés"], level: 8, statProfile: "wing", skillIds: ["sk_enganchar", "sk_centro_venenoso"], passive: "Estrella Joven: +15% XP ganada", flavor: "Little Chili. El futuro del fútbol inglés." },
  { id: "p_bernardo", name: "Bernardo Silva", desc: "Midfielder - Barcelona (Portugal)", category: "mediocampista", rarity: "legendary", types: ["enganche", "creativo"], tags: ["barcelona", "portugués"], level: 10, statProfile: "mid", skillIds: ["sk_tiki_taka", "sk_pase_filtrado", "sk_tiro_libre"], passive: "Genio Silencioso: +10% stats del equipo turno 5+", flavor: "La pelota corre por él." },
  { id: "p_salah", name: "Mohamed Salah", desc: "Right Winger - Liverpool (Egipto)", category: "delantero", rarity: "legendary", types: ["extremo", "goleador"], tags: ["liverpool", "egipcio"], level: 10, statProfile: "wing", skillIds: ["sk_enganchar", "sk_definicion_letal", "sk_regate_doble"], passive: "Faraón: Gol asegurado si HP enemigo < 15%", flavor: "El Rey de Anfield." },
  { id: "p_rodri", name: "Rodri", desc: "Defensive Midfield - Manchester City (España)", category: "mediocampista", rarity: "legendary", types: ["volante", "marca"], tags: ["man_city", "español"], level: 10, statProfile: "dm", skillIds: ["sk_pressing", "sk_pared", "sk_marca_personal"], passive: "Metronomo: El equipo no pierde accuracy", flavor: "Balón de Oro 2024." },
  { id: "p_messi", name: "Lionel Messi", desc: "Forward - Inter Miami (Argentina)", category: "delantero", rarity: "legendary", types: ["enganche", "creativo"], tags: ["inter_miami", "argentino", "GOAT"], level: 12, statProfile: "mid", skillIds: ["sk_gambeta_corta", "sk_pase_filtrado", "sk_tiro_libre"], passive: "D10S: +20% a todo cuando moral > 90", flavor: "No necesita presentación." },
  { id: "p_lautaro", name: "Lautaro Martínez", desc: "Centre-Forward - Inter Milan (Argentina)", category: "delantero", rarity: "legendary", types: ["goleador", "área"], tags: ["inter_milan", "argentino", "selección"], level: 10, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_volea", "sk_cabezazo"], passive: "El Toro: +15% daño en combates boss", flavor: "Gol de Lautaro, gol de Argentina." },
  { id: "p_dimarco", name: "Federico Dimarco", desc: "Left Back - Inter Milan (Italia)", category: "defensor", rarity: "legendary", types: ["carrilero", "creativo"], tags: ["inter_milan", "italiano"], level: 9, statProfile: "def", skillIds: ["sk_proyeccion", "sk_centro_venenoso", "sk_tiro_libre"], passive: "Zurda Mágica: Centros tienen +20% accuracy", flavor: "El lateral más ofensivo del mundo." },
  { id: "p_courtois", name: "Thibaut Courtois", desc: "Goalkeeper - Real Madrid (Bélgica)", category: "arquero", rarity: "legendary", types: ["arco"], tags: ["real_madrid", "belga"], level: 10, statProfile: "gk", skillIds: ["sk_achique", "sk_atajada", "sk_penales"], passive: "Muro: -25% daño recibido en finales", flavor: "2 metros de pura seguridad." },
  { id: "p_dybala", name: "Paulo Dybala", desc: "Forward - AS Roma (Argentina)", category: "delantero", rarity: "legendary", types: ["enganche", "creativo"], tags: ["roma", "argentino"], level: 9, statProfile: "mid", skillIds: ["sk_zurdazo", "sk_rabona", "sk_pase_filtrado"], passive: "La Joya: Golazos dan +15 moral extra", flavor: "El gol más lindo siempre es el próximo." },
  { id: "p_virgil", name: "Virgil van Dijk", desc: "Centre-Back - Liverpool (Países Bajos)", category: "defensor", rarity: "legendary", types: ["defensa", "aéreo"], tags: ["liverpool", "holandés"], level: 10, statProfile: "def", skillIds: ["sk_cabezazo", "sk_tackleo", "sk_liderazgo"], passive: "Imposible Pasarlo: -20% regate enemigo", flavor: "Nadie lo supera en el uno contra uno." },
  { id: "p_alisson", name: "Alisson Becker", desc: "Goalkeeper - Liverpool (Brasil)", category: "arquero", rarity: "legendary", types: ["arco"], tags: ["liverpool", "brasileño"], level: 10, statProfile: "gk", skillIds: ["sk_achique", "sk_atajada"], passive: "Manos de Seda: 30% chance de anular gol", flavor: "El arquero más completo del mundo." },
  { id: "p_neymar", name: "Neymar Jr.", desc: "Forward - Santos (Brasil)", category: "delantero", rarity: "legendary", types: ["extremo", "regate"], tags: ["santos", "brasileño"], level: 9, statProfile: "wing", skillIds: ["sk_sombrero", "sk_rabona", "sk_gambeta_corta"], passive: "Magia: Luxuries dan daño doble", flavor: "Ney volvió a casa." },
  { id: "p_kroos", name: "Toni Kroos", desc: "Midfielder - Retirado (Alemania)", category: "mediocampista", rarity: "legendary", types: ["volante", "creativo"], tags: ["alemania", "retirado"], level: 10, statProfile: "mid", skillIds: ["sk_diagonal", "sk_tiki_taka", "sk_tiro_libre"], passive: "Metrónomo: Pases nunca fallan", flavor: "El tipo que hacía fácil lo imposible." },
  { id: "p_martinez_emi", name: "Emiliano Martínez", desc: "Goalkeeper - Aston Villa (Argentina)", category: "arquero", rarity: "legendary", types: ["arco"], tags: ["aston_villa", "argentino", "selección"], level: 10, statProfile: "gk", skillIds: ["sk_penales", "sk_achique", "sk_atajada"], passive: "Dibu: En penales, 50% de atajar", flavor: "Mirá que te como, hermano." },
  { id: "p_de_bruyne", name: "Kevin De Bruyne", desc: "Midfielder - Manchester City (Bélgica)", category: "mediocampista", rarity: "legendary", types: ["enganche", "creativo"], tags: ["man_city", "belga"], level: 10, statProfile: "mid", skillIds: ["sk_pase_filtrado", "sk_diagonal", "sk_bombazo"], passive: "Asistidor: +20% daño del siguiente aliado", flavor: "El mejor pasador del planeta." },
  { id: "p_modric", name: "Luka Modrić", desc: "Midfielder - Real Madrid (Croacia)", category: "mediocampista", rarity: "legendary", types: ["enganche", "creativo"], tags: ["real_madrid", "croata"], level: 10, statProfile: "mid", skillIds: ["sk_tiki_taka", "sk_pase_filtrado", "sk_media_vuelta"], passive: "Eterno: No pierde stats por energía baja", flavor: "La magia no tiene fecha de vencimiento." },
];

const EPIC_PLAYERS: PlayerDef[] = [
  { id: "p_guler", name: "Arda Güler", desc: "AM - Real Madrid (Turquía)", category: "mediocampista", rarity: "epic", types: ["enganche", "creativo"], tags: ["real_madrid", "turco"], level: 5, statProfile: "mid", skillIds: ["sk_zurdazo", "sk_pase_filtrado"], passive: "Joya Turca: Growth ×1.5 hasta nivel 20", flavor: "Estambul lo vio nacer, Madrid lo vio brillar." },
  { id: "p_gavi", name: "Gavi", desc: "CM - Barcelona (España)", category: "mediocampista", rarity: "epic", types: ["volante", "marca"], tags: ["barcelona", "español"], level: 6, statProfile: "dm", skillIds: ["sk_pressing", "sk_pared"], passive: "Motor Incansable: No pierde energía turno 1", flavor: "La Masía sigue produciendo." },
  { id: "p_marchesin", name: "Agustín Marchesín", desc: "GK - Boca Juniors (Argentina)", category: "arquero", rarity: "epic", types: ["arco"], tags: ["boca_juniors", "argentino"], level: 8, statProfile: "gk", skillIds: ["sk_achique", "sk_atajada"], passive: "Manos Seguras: -15% daño de tiros", flavor: "El último bastión antes del gol." },
  { id: "p_pezzella", name: "Germán Pezzella", desc: "CB - River Plate (Argentina)", category: "defensor", rarity: "epic", types: ["defensa", "aéreo"], tags: ["river_plate", "argentino"], level: 7, statProfile: "def", skillIds: ["sk_cabezazo", "sk_liderazgo"], passive: "Muralla: +8% defensa para todo el equipo", flavor: "El Caudillo de Núñez." },
  { id: "p_armani", name: "Franco Armani", desc: "GK - River Plate (Argentina)", category: "arquero", rarity: "epic", types: ["arco"], tags: ["river_plate", "argentino"], level: 9, statProfile: "gk", skillIds: ["sk_penales"], passive: "Figura: +20% reflejos en combates Boss", flavor: "Madrid, Libertadores. Ya sabés." },
  { id: "p_pedri", name: "Pedri", desc: "CM - Barcelona (España)", category: "mediocampista", rarity: "epic", types: ["enganche", "creativo"], tags: ["barcelona", "español"], level: 7, statProfile: "mid", skillIds: ["sk_tiki_taka", "sk_pase_filtrado"], passive: "Iniesta 2.0: Pases bufean aliados +5 stats", flavor: "El heredero del toque." },
  { id: "p_foden", name: "Phil Foden", desc: "AM - Manchester City (Inglaterra)", category: "mediocampista", rarity: "epic", types: ["enganche", "velocidad"], tags: ["man_city", "inglés"], level: 7, statProfile: "mid", skillIds: ["sk_enganchar", "sk_pase_filtrado"], passive: "Stockport Iniesta: +10% regate en cancha chica", flavor: "Pep lo crió." },
  { id: "p_szczesny", name: "Szczęsny", desc: "GK - Barcelona (Polonia)", category: "arquero", rarity: "epic", types: ["arco"], tags: ["barcelona", "polaco"], level: 8, statProfile: "gk", skillIds: ["sk_achique", "sk_penales"], passive: "Sale del retiro: +10% todo si es suplente", flavor: "Se retiró y volvió en una semana." },
  { id: "p_valverde", name: "Federico Valverde", desc: "CM - Real Madrid (Uruguay)", category: "mediocampista", rarity: "epic", types: ["volante", "velocidad"], tags: ["real_madrid", "uruguayo"], level: 8, statProfile: "dm", skillIds: ["sk_pressing", "sk_bombazo"], passive: "Pajarito: +15% ritmo en contraataque", flavor: "Corre más que nadie. Y pega también." },
  { id: "p_araujo", name: "Ronald Araújo", desc: "CB - Barcelona (Uruguay)", category: "defensor", rarity: "epic", types: ["defensa", "marca"], tags: ["barcelona", "uruguayo"], level: 7, statProfile: "def", skillIds: ["sk_tackleo", "sk_cabezazo"], passive: "Roca: Inmune a debuffs de regate", flavor: "Pared humana." },
  { id: "p_raphinha", name: "Raphinha", desc: "RW - Barcelona (Brasil)", category: "delantero", rarity: "epic", types: ["extremo", "velocidad"], tags: ["barcelona", "brasileño"], level: 7, statProfile: "wing", skillIds: ["sk_enganchar", "sk_centro_venenoso"], passive: "Descaro: +10% accuracy a bajas HP", flavor: "El brasileño que conquistó Camp Nou." },
  { id: "p_szoboszlai", name: "Dominik Szoboszlai", desc: "AM - Liverpool (Hungría)", category: "mediocampista", rarity: "epic", types: ["enganche", "goleador"], tags: ["liverpool", "húngaro"], level: 6, statProfile: "mid", skillIds: ["sk_bombazo", "sk_tiro_libre"], passive: "Cañón Húngaro: Tiros lejanos +20% power", flavor: "El disparo que nadie vio venir." },
  { id: "p_mac_allister", name: "Alexis Mac Allister", desc: "CM - Liverpool (Argentina)", category: "mediocampista", rarity: "epic", types: ["volante", "creativo"], tags: ["liverpool", "argentino"], level: 7, statProfile: "dm", skillIds: ["sk_pared", "sk_diagonal"], passive: "Campeón del Mundo: +5% a todo", flavor: "De Argentinos Jrs al mundo." },
  { id: "p_enzo", name: "Enzo Fernández", desc: "CM - Chelsea (Argentina)", category: "mediocampista", rarity: "epic", types: ["volante", "creativo"], tags: ["chelsea", "argentino"], level: 7, statProfile: "dm", skillIds: ["sk_pase_filtrado", "sk_pressing"], passive: "Joven Maravilla: Growth ×1.3", flavor: "Gol a México y se hizo leyenda." },
  { id: "p_yamal", name: "Lamine Yamal", desc: "RW - Barcelona (España)", category: "delantero", rarity: "epic", types: ["extremo", "regate"], tags: ["barcelona", "español"], level: 4, statProfile: "wing", skillIds: ["sk_gambeta_corta", "sk_enganchar"], passive: "Niño Prodigio: Growth ×2 hasta nivel 15", flavor: "Tiene 17 y ya ganó la Euro." },
  { id: "p_hakimi", name: "Achraf Hakimi", desc: "RB - PSG (Marruecos)", category: "defensor", rarity: "epic", types: ["carrilero", "velocidad"], tags: ["psg", "marroquí"], level: 8, statProfile: "def", skillIds: ["sk_proyeccion", "sk_tackleo"], passive: "Turbo Lateral: +15% ritmo siempre", flavor: "El lateral más rápido del mundo." },
  { id: "p_tchouameni", name: "Aurélien Tchouaméni", desc: "CDM - Real Madrid (Francia)", category: "mediocampista", rarity: "epic", types: ["volante", "marca"], tags: ["real_madrid", "francés"], level: 7, statProfile: "dm", skillIds: ["sk_quite", "sk_marca_personal"], passive: "Interceptor: 20% chance de anular ataque", flavor: "El mediocampo es suyo." },
  { id: "p_cuti_romero", name: "Cuti Romero", desc: "CB - Tottenham (Argentina)", category: "defensor", rarity: "epic", types: ["defensa", "marca"], tags: ["tottenham", "argentino"], level: 8, statProfile: "def", skillIds: ["sk_barrida", "sk_tackleo"], passive: "Perro: Entries reducen 25% stats enemigos", flavor: "Juega al límite. Siempre." },
  { id: "p_gundogan", name: "İlkay Gündoğan", desc: "CM - Barcelona (Alemania)", category: "mediocampista", rarity: "epic", types: ["enganche", "volante"], tags: ["barcelona", "alemán"], level: 9, statProfile: "mid", skillIds: ["sk_tiki_taka", "sk_media_vuelta"], passive: "Cerebro: +10% accuracy equipo", flavor: "Inteligencia pura." },
  { id: "p_garnacho", name: "Alejandro Garnacho", desc: "LW - Napoli (Argentina)", category: "delantero", rarity: "epic", types: ["extremo", "regate"], tags: ["napoli", "argentino"], level: 5, statProfile: "wing", skillIds: ["sk_gambeta_corta", "sk_chilena"], passive: "Bicicleta: Regates tienen 15% chance de stun", flavor: "Gambeta y gol. Nada más." },
  { id: "p_martinez_lisandro", name: "Lisandro Martínez", desc: "CB - Manchester United (Argentina)", category: "defensor", rarity: "epic", types: ["defensa", "marca"], tags: ["man_utd", "argentino"], level: 7, statProfile: "def", skillIds: ["sk_barrida", "sk_liderazgo"], passive: "Carnicero: -15% fisico enemigo", flavor: "El Butcher de Ajax y Old Trafford." },
  { id: "p_wirtz", name: "Florian Wirtz", desc: "AM - Bayer Leverkusen (Alemania)", category: "mediocampista", rarity: "epic", types: ["enganche", "creativo"], tags: ["leverkusen", "alemán"], level: 6, statProfile: "mid", skillIds: ["sk_pase_filtrado", "sk_zurdazo"], passive: "Invicto: +10% todo cuando no perdiste aún", flavor: "Leverkusen nunca pierde con él." },
  { id: "p_kvaratskhelia", name: "Kvaratskhelia", desc: "LW - PSG (Georgia)", category: "delantero", rarity: "epic", types: ["extremo", "regate"], tags: ["psg", "georgiano"], level: 7, statProfile: "wing", skillIds: ["sk_gambeta_corta", "sk_enganchar"], passive: "Kvaradona: Regates siempre pasan 1 vez", flavor: "El Maradona georgiano." },
  { id: "p_carvajal", name: "Dani Carvajal", desc: "RB - Real Madrid (España)", category: "defensor", rarity: "epic", types: ["carrilero", "defensa"], tags: ["real_madrid", "español"], level: 9, statProfile: "def", skillIds: ["sk_proyeccion", "sk_tackleo"], passive: "Clutch: +20% stats en finales", flavor: "Gol en la final de Champions. Dos veces." },
  { id: "p_oblak", name: "Jan Oblak", desc: "GK - Atlético Madrid (Eslovenia)", category: "arquero", rarity: "epic", types: ["arco"], tags: ["atletico", "esloveno"], level: 9, statProfile: "gk", skillIds: ["sk_achique", "sk_atajada"], passive: "Candado: -10% daño recibido siempre", flavor: "La portería más cerrada de Europa." },
  { id: "p_otamendi", name: "Nicolás Otamendi", desc: "CB - Benfica (Argentina)", category: "defensor", rarity: "epic", types: ["defensa", "marca"], tags: ["benfica", "argentino"], level: 9, statProfile: "def", skillIds: ["sk_tackleo", "sk_cabezazo"], passive: "General: +10% defensa equipo en copa 5+", flavor: "La experiencia vale oro." },
  { id: "p_ter_stegen", name: "Marc-André ter Stegen", desc: "GK - Barcelona (Alemania)", category: "arquero", rarity: "epic", types: ["arco"], tags: ["barcelona", "alemán"], level: 9, statProfile: "gk", skillIds: ["sk_achique", "sk_atajada"], passive: "Libero: Pases del arquero +20% accuracy", flavor: "Juega de 1 y de 5." },
  { id: "p_molina", name: "Nahuel Molina", desc: "RB - Atlético Madrid (Argentina)", category: "defensor", rarity: "epic", types: ["carrilero", "velocidad"], tags: ["atletico", "argentino"], level: 7, statProfile: "def", skillIds: ["sk_proyeccion", "sk_barrida"], passive: "Gol en Mundial: Moral +10 en partidos eliminatorios", flavor: "El lateral que le hizo gol a Países Bajos." },
  { id: "p_julian_alvarez", name: "Julián Álvarez", desc: "Forward - Atlético Madrid (Argentina)", category: "delantero", rarity: "epic", types: ["goleador", "velocidad"], tags: ["atletico", "argentino"], level: 7, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_chilena"], passive: "Araña: 15% chance de gol extra en victoria", flavor: "La araña pica cuando menos te lo esperás." },
  { id: "p_endrick", name: "Endrick", desc: "Forward - Real Madrid (Brasil)", category: "delantero", rarity: "epic", types: ["goleador", "área"], tags: ["real_madrid", "brasileño"], level: 4, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_volea"], passive: "Fenómeno: Growth ×2 hasta nivel 12", flavor: "El heredero de Ronaldo." },
  { id: "p_camavinga", name: "Eduardo Camavinga", desc: "CM - Real Madrid (Francia)", category: "mediocampista", rarity: "epic", types: ["volante", "velocidad"], tags: ["real_madrid", "francés"], level: 7, statProfile: "dm", skillIds: ["sk_pressing", "sk_quite"], passive: "Turbo Mid: Primer acción del combate es gratis", flavor: "Velocidad en el medio que nadie espera." },
  { id: "p_kim", name: "Kim Min-jae", desc: "CB - Bayern Munich (Corea del Sur)", category: "defensor", rarity: "epic", types: ["defensa", "marca"], tags: ["bayern", "coreano"], level: 7, statProfile: "def", skillIds: ["sk_tackleo", "sk_barrida"], passive: "Monstruo: Inmune a debuffs de fisico", flavor: "El muro coreano." },
  { id: "p_thiago_almada", name: "Thiago Almada", desc: "AM - Botafogo (Argentina)", category: "mediocampista", rarity: "epic", types: ["enganche", "regate"], tags: ["botafogo", "argentino"], level: 6, statProfile: "mid", skillIds: ["sk_gambeta_corta", "sk_pase_filtrado"], passive: "Potrero Style: +10% regate en copas 1-3", flavor: "La gambeta del conurbano." },
  { id: "p_ruben_dias", name: "Rúben Dias", desc: "CB - Manchester City (Portugal)", category: "defensor", rarity: "epic", types: ["defensa", "aéreo"], tags: ["man_city", "portugués"], level: 8, statProfile: "def", skillIds: ["sk_cabezazo", "sk_liderazgo"], passive: "Líder Nato: Equipo gana +5 moral por combate", flavor: "El defensor que ganó la Premier." },
  { id: "p_diaz_luis", name: "Luis Díaz", desc: "LW - Liverpool (Colombia)", category: "delantero", rarity: "epic", types: ["extremo", "velocidad"], tags: ["liverpool", "colombiano"], level: 7, statProfile: "wing", skillIds: ["sk_gambeta_corta", "sk_enganchar"], passive: "Guajiro: +15% regate en contraataque", flavor: "La velocidad colombiana." },
  { id: "p_musiala", name: "Jamal Musiala", desc: "AM - Bayern Munich (Alemania)", category: "mediocampista", rarity: "epic", types: ["enganche", "regate"], tags: ["bayern", "alemán"], level: 6, statProfile: "mid", skillIds: ["sk_gambeta_corta", "sk_pase_filtrado"], passive: "Danza Bávara: Regates dan +10% daño siguiente turno", flavor: "Baila con la pelota." },
  { id: "p_isak", name: "Alexander Isak", desc: "FW - Newcastle (Suecia)", category: "delantero", rarity: "epic", types: ["goleador", "velocidad"], tags: ["newcastle", "sueco"], level: 7, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_enganchar"], passive: "Elegancia Nórdica: +15% accuracy en definición", flavor: "El goleador escandinavo." },
  { id: "p_savinho", name: "Savinho", desc: "RW - Manchester City (Brasil)", category: "delantero", rarity: "epic", types: ["extremo", "regate"], tags: ["man_city", "brasileño"], level: 5, statProfile: "wing", skillIds: ["sk_gambeta_corta", "sk_enganchar"], passive: "Joia: Growth ×1.5 hasta nivel 18", flavor: "Troyes lo descubrió, Pep lo pulió." },
  { id: "p_bastoni", name: "Alessandro Bastoni", desc: "CB - Inter Milan (Italia)", category: "defensor", rarity: "epic", types: ["defensa", "creativo"], tags: ["inter_milan", "italiano"], level: 8, statProfile: "def", skillIds: ["sk_tackleo", "sk_diagonal"], passive: "Defensor Moderno: Pases del defensor +15% accuracy", flavor: "Defiende y construye." },
  { id: "p_joao_neves", name: "João Neves", desc: "CM - PSG (Portugal)", category: "mediocampista", rarity: "epic", types: ["volante", "creativo"], tags: ["psg", "portugués"], level: 6, statProfile: "dm", skillIds: ["sk_pressing", "sk_pase_filtrado"], passive: "Motor Lusitano: No pierde energía turnos impares", flavor: "Lisboa lo formó, París lo convocó." },
];

// Generate Rare players (45)
const RARE_NAMES = [
  ["p_romero_a", "Ángel Romero", "LW - Boca (Paraguay)", "delantero", "wing", ["extremo", "velocidad"], ["boca_juniors", "paraguayo"]],
  ["p_velasco", "Alan Velasco", "LM - Boca (Argentina)", "mediocampista", "wing", ["extremo", "velocidad"], ["boca_juniors", "argentino"]],
  ["p_colidio", "Facundo Colidio", "FW - River (Argentina)", "delantero", "att", ["goleador", "velocidad"], ["river_plate", "argentino"]],
  ["p_barco", "Ezequiel Barco", "AM - River (Argentina)", "mediocampista", "mid", ["enganche", "regate"], ["river_plate", "argentino"]],
  ["p_soler", "Carlos Soler", "CM - PSG (España)", "mediocampista", "mid", ["volante", "creativo"], ["psg", "español"]],
  ["p_ferran", "Ferran Torres", "FW - Barcelona (España)", "delantero", "wing", ["extremo", "goleador"], ["barcelona", "español"]],
  ["p_riquelme_a", "Agustín Riquelme", "AM - Racing (Argentina)", "mediocampista", "mid", ["enganche", "creativo"], ["racing", "argentino"]],
  ["p_medina", "Cristian Medina", "CM - Boca (Argentina)", "mediocampista", "dm", ["volante", "marca"], ["boca_juniors", "argentino"]],
  ["p_zenon", "Kevin Zenón", "LM - Boca (Argentina)", "mediocampista", "wing", ["extremo", "creativo"], ["boca_juniors", "argentino"]],
  ["p_cavani", "Edinson Cavani", "FW - Boca (Uruguay)", "delantero", "att", ["goleador", "área"], ["boca_juniors", "uruguayo"]],
  ["p_merentiel", "Miguel Merentiel", "FW - Boca (Uruguay)", "delantero", "att", ["goleador", "velocidad"], ["boca_juniors", "uruguayo"]],
  ["p_fernandez_e", "Enzo Díaz", "LB - River (Argentina)", "defensor", "def", ["carrilero", "defensa"], ["river_plate", "argentino"]],
  ["p_gonzalez_n", "Nicolás González", "FW - Juventus (Argentina)", "delantero", "wing", ["extremo", "goleador"], ["juventus", "argentino"]],
  ["p_paredes", "Leandro Paredes", "CM - Roma (Argentina)", "mediocampista", "dm", ["volante", "creativo"], ["roma", "argentino"]],
  ["p_lo_celso", "Giovani Lo Celso", "AM - Betis (Argentina)", "mediocampista", "mid", ["enganche", "creativo"], ["betis", "argentino"]],
  ["p_palacios", "Exequiel Palacios", "CM - Leverkusen (Argentina)", "mediocampista", "dm", ["volante", "velocidad"], ["leverkusen", "argentino"]],
  ["p_montiel", "Gonzalo Montiel", "RB - Sevilla (Argentina)", "defensor", "def", ["carrilero", "defensa"], ["sevilla", "argentino"]],
  ["p_tagliafico", "Nicolás Tagliafico", "LB - Lyon (Argentina)", "defensor", "def", ["carrilero", "defensa"], ["lyon", "argentino"]],
  ["p_martinez_j", "José Luis Palomino", "CB - Atalanta (Argentina)", "defensor", "def", ["defensa", "marca"], ["atalanta", "argentino"]],
  ["p_de_paul", "Rodrigo De Paul", "CM - Atlético (Argentina)", "mediocampista", "dm", ["volante", "marca"], ["atletico", "argentino"]],
  ["p_acuna", "Marcos Acuña", "LB - Sevilla (Argentina)", "defensor", "def", ["carrilero", "velocidad"], ["sevilla", "argentino"]],
  ["p_musso", "Juan Musso", "GK - Atalanta (Argentina)", "arquero", "gk", ["arco"], ["atalanta", "argentino"]],
  ["p_rulli", "Gerónimo Rulli", "GK - Real Sociedad (Argentina)", "arquero", "gk", ["arco"], ["real_sociedad", "argentino"]],
  ["p_simeone_g", "Giovanni Simeone", "FW - Napoli (Argentina)", "delantero", "att", ["goleador", "área"], ["napoli", "argentino"]],
  ["p_pavon", "Cristian Pavón", "RW - Ind. Rivadavia (Argentina)", "delantero", "wing", ["extremo", "velocidad"], ["ind_rivadavia", "argentino"]],
  ["p_osimhen", "Victor Osimhen", "FW - Napoli (Nigeria)", "delantero", "att", ["goleador", "velocidad"], ["napoli", "nigeriano"]],
  ["p_chiesa", "Federico Chiesa", "FW - Liverpool (Italia)", "delantero", "wing", ["extremo", "goleador"], ["liverpool", "italiano"]],
  ["p_bruno_f", "Bruno Fernandes", "AM - Man United (Portugal)", "mediocampista", "mid", ["enganche", "goleador"], ["man_utd", "portugués"]],
  ["p_sane", "Leroy Sané", "RW - Bayern (Alemania)", "delantero", "wing", ["extremo", "velocidad"], ["bayern", "alemán"]],
  ["p_gakpo", "Cody Gakpo", "LW - Liverpool (Países Bajos)", "delantero", "wing", ["extremo", "goleador"], ["liverpool", "holandés"]],
  ["p_olise", "Michael Olise", "RW - Bayern (Francia)", "delantero", "wing", ["extremo", "regate"], ["bayern", "francés"]],
  ["p_rice", "Declan Rice", "CDM - Arsenal (Inglaterra)", "mediocampista", "dm", ["volante", "marca"], ["arsenal", "inglés"]],
  ["p_odegaard", "Martin Ødegaard", "AM - Arsenal (Noruega)", "mediocampista", "mid", ["enganche", "creativo"], ["arsenal", "noruego"]],
  ["p_havertz", "Kai Havertz", "FW - Arsenal (Alemania)", "delantero", "att", ["goleador", "enganche"], ["arsenal", "alemán"]],
  ["p_palmer", "Cole Palmer", "AM - Chelsea (Inglaterra)", "mediocampista", "mid", ["enganche", "goleador"], ["chelsea", "inglés"]],
  ["p_martinez_e2", "Emiliano Buendía", "AM - Aston Villa (Argentina)", "mediocampista", "mid", ["enganche", "creativo"], ["aston_villa", "argentino"]],
  ["p_angelino", "Ángel Correa", "FW - Atlético (Argentina)", "delantero", "wing", ["extremo", "velocidad"], ["atletico", "argentino"]],
  ["p_senesi", "Marcos Senesi", "CB - Bournemouth (Argentina)", "defensor", "def", ["defensa", "aéreo"], ["bournemouth", "argentino"]],
  ["p_martinez_g", "Geronimo Poblete", "CM - San Lorenzo (Argentina)", "mediocampista", "dm", ["volante", "creativo"], ["san_lorenzo", "argentino"]],
  ["p_son", "Heung-Min Son", "FW - Tottenham (Corea del Sur)", "delantero", "wing", ["extremo", "goleador"], ["tottenham", "coreano"]],
  ["p_kane", "Harry Kane", "FW - Bayern (Inglaterra)", "delantero", "att", ["goleador", "área"], ["bayern", "inglés"]],
  ["p_raya", "David Raya", "GK - Arsenal (España)", "arquero", "gk", ["arco"], ["arsenal", "español"]],
  ["p_cucurella", "Marc Cucurella", "LB - Chelsea (España)", "defensor", "def", ["carrilero", "defensa"], ["chelsea", "español"]],
  ["p_williams_n", "Nico Williams", "LW - Athletic (España)", "delantero", "wing", ["extremo", "velocidad"], ["athletic", "español"]],
  ["p_pedri2", "Fermín López", "AM - Barcelona (España)", "mediocampista", "mid", ["enganche", "goleador"], ["barcelona", "español"]],
  ["p_grealish", "Jack Grealish", "LW - Manchester City (Inglaterra)", "delantero", "wing", ["extremo", "regate"], ["man_city", "inglés"]],
  ["p_thuram", "Marcus Thuram", "FW - Inter Milan (Francia)", "delantero", "att", ["goleador", "velocidad"], ["inter_milan", "francés"]],
  ["p_barella", "Nicolò Barella", "CM - Inter Milan (Italia)", "mediocampista", "mid", ["volante", "goleador"], ["inter_milan", "italiano"]],
  ["p_leao", "Rafael Leão", "LW - AC Milan (Portugal)", "delantero", "wing", ["extremo", "regate"], ["ac_milan", "portugués"]],
  ["p_tonali", "Sandro Tonali", "CM - Newcastle (Italia)", "mediocampista", "dm", ["volante", "marca"], ["newcastle", "italiano"]],
  ["p_pulisic", "Christian Pulisic", "RW - AC Milan (EEUU)", "delantero", "wing", ["extremo", "velocidad"], ["ac_milan", "estadounidense"]],
  ["p_lukaku", "Romelu Lukaku", "FW - Napoli (Bélgica)", "delantero", "att", ["goleador", "área"], ["napoli", "belga"]],
  ["p_calhanoglu", "Hakan Çalhanoğlu", "CM - Inter Milan (Turquía)", "mediocampista", "mid", ["volante", "creativo"], ["inter_milan", "turco"]],
  ["p_nkunku", "Christopher Nkunku", "FW - Chelsea (Francia)", "delantero", "att", ["goleador", "enganche"], ["chelsea", "francés"]],
  ["p_boniface", "Victor Boniface", "FW - Bayer Leverkusen (Nigeria)", "delantero", "att", ["goleador", "velocidad"], ["leverkusen", "nigeriano"]],
  ["p_doku", "Jeremy Doku", "RW - Manchester City (Bélgica)", "delantero", "wing", ["extremo", "velocidad"], ["man_city", "belga"]],
  ["p_zaire_emery", "Warren Zaïre-Emery", "CM - PSG (Francia)", "mediocampista", "dm", ["volante", "marca"], ["psg", "francés"]],
  ["p_edson_alvarez", "Edson Álvarez", "CDM - West Ham (México)", "mediocampista", "dm", ["volante", "marca"], ["west_ham", "mexicano"]],
  ["p_vlahovic", "Dušan Vlahović", "FW - Juventus (Serbia)", "delantero", "att", ["goleador", "área"], ["juventus", "serbio"]],
  ["p_lookman", "Ademola Lookman", "FW - Atalanta (Nigeria)", "delantero", "wing", ["extremo", "goleador"], ["atalanta", "nigeriano"]],
] as const;

const RARE_PLAYERS: PlayerDef[] = RARE_NAMES.map(([id, name, desc, cat, prof, types, tags], i) => ({
  id: id as string,
  name: name as string,
  desc: desc as string,
  category: cat as PlayerDef["category"],
  rarity: "rare",
  types: [...types] as string[],
  tags: [...tags] as string[],
  level: 4 + Math.floor(i / 8),
  statProfile: prof as PlayerDef["statProfile"],
  skillIds: getSkillsForProfile(prof as string, "rare", i + 100),
  flavor: `${name} trae clase al equipo.`,
}));

// Generate Uncommon players (90) — Argentine & Brazilian leagues
const UNCOMMON_NAMES = [
  // GK (9)
  ["p_uc_s_romero", "Sergio Romero", "GK - Boca Juniors (Argentina)", "arquero", "gk"],
  ["p_uc_g_arias", "Gabriel Arias", "GK - Racing (Chile)", "arquero", "gk"],
  ["p_uc_a_rossi", "Agustín Rossi", "GK - Flamengo (Argentina)", "arquero", "gk"],
  ["p_uc_weverton", "Weverton", "GK - Palmeiras (Brasil)", "arquero", "gk"],
  ["p_uc_e_andrada", "Esteban Andrada", "GK - Monterrey (Argentina)", "arquero", "gk"],
  ["p_uc_n_guzman", "Nahuel Guzmán", "GK - Tigres (Argentina)", "arquero", "gk"],
  ["p_uc_s_rochet", "Sergio Rochet", "GK - Nacional (Uruguay)", "arquero", "gk"],
  ["p_uc_w_benitez", "Walter Benítez", "GK - PSG (Argentina)", "arquero", "gk"],
  ["p_uc_santos_gk", "Santos", "GK - Flamengo (Brasil)", "arquero", "gk"],
  // DEF (22)
  ["p_uc_advincula", "Luis Advíncula", "RB - Boca Juniors (Perú)", "defensor", "def"],
  ["p_uc_rojo", "Marcos Rojo", "CB - Boca Juniors (Argentina)", "defensor", "def"],
  ["p_uc_figal", "Nicolás Figal", "CB - Boca Juniors (Argentina)", "defensor", "def"],
  ["p_uc_fabra", "Frank Fabra", "LB - Boca Juniors (Colombia)", "defensor", "def"],
  ["p_uc_paulo_diaz", "Paulo Díaz", "CB - River Plate (Chile)", "defensor", "def"],
  ["p_uc_r_rojas", "Robert Rojas", "CB - River Plate (Paraguay)", "defensor", "def"],
  ["p_uc_m_casco", "Milton Casco", "LB - River Plate (Argentina)", "defensor", "def"],
  ["p_uc_di_cesare", "Marco Di Cesare", "CB - Racing (Argentina)", "defensor", "def"],
  ["p_uc_giannetti", "Lautaro Giannetti", "CB - Vélez (Argentina)", "defensor", "def"],
  ["p_uc_tenaglia", "Nahuel Tenaglia", "RB - Talleres (Argentina)", "defensor", "def"],
  ["p_uc_a_frias", "Adonis Frías", "CB - Defensa y Justicia (Argentina)", "defensor", "def"],
  ["p_uc_david_luiz", "David Luiz", "CB - Flamengo (Brasil)", "defensor", "def"],
  ["p_uc_leo_pereira", "Léo Pereira", "CB - Flamengo (Brasil)", "defensor", "def"],
  ["p_uc_gustavo_gomez", "Gustavo Gómez", "CB - Palmeiras (Paraguay)", "defensor", "def"],
  ["p_uc_piquerez", "Joaquín Piquerez", "LB - Palmeiras (Uruguay)", "defensor", "def"],
  ["p_uc_saravia", "Renzo Saravia", "RB - Internacional (Argentina)", "defensor", "def"],
  ["p_uc_izquierdoz", "Carlos Izquierdoz", "CB - Boca Juniors (Argentina)", "defensor", "def"],
  ["p_uc_val_gomez", "Valentín Gómez", "CB - Vélez (Argentina)", "defensor", "def"],
  ["p_uc_e_mas", "Emmanuel Más", "LB - Lanús (Argentina)", "defensor", "def"],
  ["p_uc_ayrton_costa", "Ayrton Costa", "LB - Boca Juniors (Argentina)", "defensor", "def"],
  ["p_uc_f_bustos", "Fabricio Bustos", "RB - Internacional (Argentina)", "defensor", "def"],
  ["p_uc_l_jara", "Leonardo Jara", "RB - Estudiantes (Argentina)", "defensor", "def"],
  // MID (28)
  ["p_uc_pol", "Pol Fernández", "CM - Boca Juniors (Argentina)", "mediocampista", "mid"],
  ["p_uc_nacho_f", "Nacho Fernández", "AM - River Plate (Argentina)", "mediocampista", "mid"],
  ["p_uc_kranevitter", "Matías Kranevitter", "CDM - River Plate (Argentina)", "mediocampista", "dm"],
  ["p_uc_aliendro", "Rodrigo Aliendro", "CM - River Plate (Argentina)", "mediocampista", "mid"],
  ["p_uc_quintero", "Juan Fernando Quintero", "AM - Racing (Colombia)", "mediocampista", "mid"],
  ["p_uc_nardoni", "Agustín Nardoni", "CDM - Racing (Argentina)", "mediocampista", "dm"],
  ["p_uc_marcone", "Iván Marcone", "CDM - Independiente (Argentina)", "mediocampista", "dm"],
  ["p_uc_ortigoza", "Néstor Ortigoza", "CM - San Lorenzo (Argentina)", "mediocampista", "dm"],
  ["p_uc_zuqui", "Fernando Zuqui", "CM - Estudiantes (Argentina)", "mediocampista", "mid"],
  ["p_uc_j_sosa", "José Sosa", "CM - Estudiantes (Argentina)", "mediocampista", "mid"],
  ["p_uc_belmonte", "Tomás Belmonte", "CDM - Lanús (Argentina)", "mediocampista", "dm"],
  ["p_uc_gerson", "Gerson", "CM - Flamengo (Brasil)", "mediocampista", "mid"],
  ["p_uc_arrascaeta", "De Arrascaeta", "AM - Flamengo (Uruguay)", "mediocampista", "mid"],
  ["p_uc_e_ribeiro", "Everton Ribeiro", "AM - Flamengo (Brasil)", "mediocampista", "mid"],
  ["p_uc_r_veiga", "Raphael Veiga", "AM - Palmeiras (Brasil)", "mediocampista", "mid"],
  ["p_uc_ze_rafael", "Zé Rafael", "CM - Palmeiras (Brasil)", "mediocampista", "dm"],
  ["p_uc_m_rojas", "Matías Rojas", "AM - Racing (Paraguay)", "mediocampista", "mid"],
  ["p_uc_salvio", "Eduardo Salvio", "AM - Pumas (Argentina)", "mediocampista", "mid"],
  ["p_uc_enzo_perez", "Enzo Pérez", "CM - Estudiantes (Argentina)", "mediocampista", "mid"],
  ["p_uc_max_meza", "Maximiliano Meza", "AM - Monterrey (Argentina)", "mediocampista", "mid"],
  ["p_uc_pochettino", "Tomás Pochettino", "AM - River Plate (Argentina)", "mediocampista", "mid"],
  ["p_uc_alan_patrick", "Alan Patrick", "AM - Internacional (Brasil)", "mediocampista", "mid"],
  ["p_uc_o_romero", "Óscar Romero", "AM - Racing (Paraguay)", "mediocampista", "mid"],
  ["p_uc_equi", "Equi Fernández", "CM - Boca Juniors (Argentina)", "mediocampista", "dm"],
  ["p_uc_echeverri", "Claudio Echeverri", "AM - River Plate (Argentina)", "mediocampista", "mid"],
  ["p_uc_mastantuono", "Franco Mastantuono", "AM - River Plate (Argentina)", "mediocampista", "mid"],
  ["p_uc_maroni", "Gonzalo Maroni", "AM - Boca Juniors (Argentina)", "mediocampista", "mid"],
  ["p_uc_l_aued", "Luciano Aued", "CM - Racing (Chile)", "mediocampista", "mid"],
  // FW (31)
  ["p_uc_benedetto", "Darío Benedetto", "FW - Boca Juniors (Argentina)", "delantero", "att"],
  ["p_uc_langoni", "Luca Langoni", "RW - Boca Juniors (Argentina)", "delantero", "wing"],
  ["p_uc_l_vazquez", "Luis Vázquez", "FW - Boca Juniors (Argentina)", "delantero", "att"],
  ["p_uc_borja", "Miguel Borja", "FW - River Plate (Colombia)", "delantero", "att"],
  ["p_uc_rondon", "Salomón Rondón", "FW - River Plate (Venezuela)", "delantero", "att"],
  ["p_uc_roger_m", "Roger Martínez", "FW - Racing (Colombia)", "delantero", "att"],
  ["p_uc_bareiro", "Adam Bareiro", "FW - Atlético Mineiro (Paraguay)", "delantero", "att"],
  ["p_uc_benegas", "Leandro Benegas", "FW - Independiente (Argentina)", "delantero", "att"],
  ["p_uc_cerutti", "Ezequiel Cerutti", "RW - San Lorenzo (Argentina)", "delantero", "wing"],
  ["p_uc_janson", "Lucas Janson", "LW - Vélez (Argentina)", "delantero", "wing"],
  ["p_uc_l_acosta", "Lautaro Acosta", "LW - Lanús (Argentina)", "delantero", "wing"],
  ["p_uc_gabigol", "Gabigol", "FW - Flamengo (Brasil)", "delantero", "att"],
  ["p_uc_b_henrique", "Bruno Henrique", "LW - Flamengo (Brasil)", "delantero", "wing"],
  ["p_uc_pedro_f", "Pedro", "FW - Flamengo (Brasil)", "delantero", "att"],
  ["p_uc_dudu", "Dudu", "RW - Palmeiras (Brasil)", "delantero", "wing"],
  ["p_uc_rony", "Rony", "FW - Palmeiras (Brasil)", "delantero", "att"],
  ["p_uc_flaco_lopez", "Flaco López", "FW - Palmeiras (Argentina)", "delantero", "att"],
  ["p_uc_m_santos", "Michael Santos", "FW - Talleres (Uruguay)", "delantero", "att"],
  ["p_uc_valoyes", "Diego Valoyes", "RW - Talleres (Colombia)", "delantero", "wing"],
  ["p_uc_l_diaz_e", "Leandro Díaz", "FW - Estudiantes (Argentina)", "delantero", "att"],
  ["p_uc_s_romero_f", "Silvio Romero", "FW - Independiente (Argentina)", "delantero", "att"],
  ["p_uc_driussi", "Sebastián Driussi", "FW - Austin FC (Argentina)", "delantero", "att"],
  ["p_uc_w_bou", "Walter Bou", "FW - Defensa y Justicia (Argentina)", "delantero", "att"],
  ["p_uc_retegui", "Mateo Retegui", "FW - Atalanta (Argentina)", "delantero", "att"],
  ["p_uc_avalos", "Gabriel Ávalos", "FW - Independiente (Paraguay)", "delantero", "att"],
  ["p_uc_pratto", "Lucas Pratto", "FW - River Plate (Argentina)", "delantero", "att"],
  ["p_uc_wanchope", "Wanchope Ábila", "FW - Boca Juniors (Argentina)", "delantero", "att"],
  ["p_uc_villa", "Sebastián Villa", "LW - Boca Juniors (Colombia)", "delantero", "wing"],
  ["p_uc_soldano", "Franco Soldano", "FW - Boca Juniors (Argentina)", "delantero", "att"],
  ["p_uc_calleri", "Jonathan Calleri", "FW - São Paulo (Argentina)", "delantero", "att"],
  ["p_uc_castellani", "Gonzalo Castellani", "FW - Talleres (Argentina)", "delantero", "att"],
] as const;

const UNCOMMON_PLAYERS: PlayerDef[] = UNCOMMON_NAMES.map(([id, name, desc, cat, prof], i) => ({
  id: id as string,
  name: name as string,
  desc: desc as string,
  category: cat as PlayerDef["category"],
  rarity: "uncommon",
  types: getTypesForProfile(prof as string),
  tags: ["liga_local"],
  level: 2 + Math.floor(i / 10),
  statProfile: prof as PlayerDef["statProfile"],
  skillIds: getSkillsForProfile(prof as string, "uncommon", i + 200),
  flavor: `${name} sueña con la titularidad.`,
}));

// Generate Common players (90) — Liga MX, Colombian, Chilean, Paraguayan, Uruguayan, MLS
const COMMON_NAMES = [
  // GK (9)
  ["p_co_ochoa", "Guillermo Ochoa", "GK - América (México)", "arquero", "gk"],
  ["p_co_talavera", "Alfredo Talavera", "GK - Pumas (México)", "arquero", "gk"],
  ["p_co_keylor", "Keylor Navas", "GK - Nottingham Forest (Costa Rica)", "arquero", "gk"],
  ["p_co_c_vargas", "Camilo Vargas", "GK - Atlas (Colombia)", "arquero", "gk"],
  ["p_co_castellon", "Gabriel Castellón", "GK - Colo-Colo (Chile)", "arquero", "gk"],
  ["p_co_a_silva", "Antony Silva", "GK - Cerro Porteño (Paraguay)", "arquero", "gk"],
  ["p_co_r_rey", "Rodrigo Rey", "GK - Godoy Cruz (Argentina)", "arquero", "gk"],
  ["p_co_blake", "André Blake", "GK - Philadelphia Union (Jamaica)", "arquero", "gk"],
  ["p_co_k_mier", "Kevin Mier", "GK - Newell's (Colombia)", "arquero", "gk"],
  // DEF (22)
  ["p_co_j_sanchez", "Jorge Sánchez", "RB - América (México)", "defensor", "def"],
  ["p_co_araujo_n", "Néstor Araujo", "CB - América (México)", "defensor", "def"],
  ["p_co_gallardo", "Jesús Gallardo", "LB - Monterrey (México)", "defensor", "def"],
  ["p_co_c_montes", "César Montes", "CB - Monterrey (México)", "defensor", "def"],
  ["p_co_sepulveda", "Gilberto Sepúlveda", "CB - Guadalajara (México)", "defensor", "def"],
  ["p_co_isla", "Mauricio Isla", "RB - Colo-Colo (Chile)", "defensor", "def"],
  ["p_co_maripan", "Guillermo Maripán", "CB - Monaco (Chile)", "defensor", "def"],
  ["p_co_y_mina", "Yerry Mina", "CB - Cagliari (Colombia)", "defensor", "def"],
  ["p_co_davinson", "Davinson Sánchez", "CB - Galatasaray (Colombia)", "defensor", "def"],
  ["p_co_murillo_o", "Óscar Murillo", "CB - Pachuca (Colombia)", "defensor", "def"],
  ["p_co_j_alonso", "Junior Alonso", "CB - Atlético Mineiro (Paraguay)", "defensor", "def"],
  ["p_co_balbuena", "Fabián Balbuena", "CB - Corinthians (Paraguay)", "defensor", "def"],
  ["p_co_duarte", "Alexis Duarte", "CB - Cerro Porteño (Paraguay)", "defensor", "def"],
  ["p_co_tesillo", "William Tesillo", "CB - León (Colombia)", "defensor", "def"],
  ["p_co_a_long", "Aaron Long", "CB - New York Red Bulls (USA)", "defensor", "def"],
  ["p_co_yedlin", "DeAndre Yedlin", "RB - Inter Miami (USA)", "defensor", "def"],
  ["p_co_lichnovsky", "Igor Lichnovsky", "CB - Tigres (Chile)", "defensor", "def"],
  ["p_co_caceres", "Martín Cáceres", "CB - LA Galaxy (Uruguay)", "defensor", "def"],
  ["p_co_s_medina", "Stefan Medina", "RB - Monterrey (Colombia)", "defensor", "def"],
  ["p_co_matarrita", "Ronald Matarrita", "LB - Cincinnati (Costa Rica)", "defensor", "def"],
  ["p_co_mojica", "Johan Mojica", "LB - Villarreal (Colombia)", "defensor", "def"],
  ["p_co_velazquez_g", "Gustavo Velázquez", "RB - Olimpia (Paraguay)", "defensor", "def"],
  // MID (28)
  ["p_co_h_herrera", "Héctor Herrera", "CM - Houston Dynamo (México)", "mediocampista", "mid"],
  ["p_co_j_dos_santos", "Jonathan dos Santos", "CM - América (México)", "mediocampista", "mid"],
  ["p_co_cordova", "Sebastián Córdova", "AM - Tigres (México)", "mediocampista", "mid"],
  ["p_co_alvarado", "Roberto Alvarado", "AM - Guadalajara (México)", "mediocampista", "mid"],
  ["p_co_gorriaran", "Fernando Gorriarán", "CM - Santos Laguna (Uruguay)", "mediocampista", "dm"],
  ["p_co_vidal", "Arturo Vidal", "CM - Colo-Colo (Chile)", "mediocampista", "dm"],
  ["p_co_aranguiz", "Charles Aránguiz", "CM - Internacional (Chile)", "mediocampista", "mid"],
  ["p_co_cuadrado", "Juan Cuadrado", "RM - Inter (Colombia)", "mediocampista", "wing"],
  ["p_co_james", "James Rodríguez", "AM - São Paulo (Colombia)", "mediocampista", "mid"],
  ["p_co_m_uribe", "Mateus Uribe", "CM - Porto (Colombia)", "mediocampista", "mid"],
  ["p_co_w_barrios", "Wilmar Barrios", "CDM - Zenit (Colombia)", "mediocampista", "dm"],
  ["p_co_d_gonzalez", "Derlis González", "RW - Olimpia (Paraguay)", "mediocampista", "wing"],
  ["p_co_l_acosta_m", "Luciano Acosta", "AM - Cincinnati (Argentina)", "mediocampista", "mid"],
  ["p_co_almiron", "Miguel Almirón", "AM - Newcastle (Paraguay)", "mediocampista", "mid"],
  ["p_co_lainez", "Diego Lainez", "LW - Sporting Braga (México)", "mediocampista", "wing"],
  ["p_co_orbelin", "Orbelín Pineda", "AM - AEK Atenas (México)", "mediocampista", "mid"],
  ["p_co_richard_s", "Richard Sánchez", "CDM - América (Paraguay)", "mediocampista", "dm"],
  ["p_co_rincon", "Tomás Rincón", "CDM - Santos (Venezuela)", "mediocampista", "dm"],
  ["p_co_yangel", "Yangel Herrera", "CM - Girona (Venezuela)", "mediocampista", "mid"],
  ["p_co_tapia", "Renato Tapia", "CDM - Celta (Perú)", "mediocampista", "dm"],
  ["p_co_yotun", "Yoshimar Yotún", "CM - Sporting Cristal (Perú)", "mediocampista", "mid"],
  ["p_co_borges", "Celso Borges", "CM - Alajuelense (Costa Rica)", "mediocampista", "mid"],
  ["p_co_e_gutierrez", "Erick Gutiérrez", "CM - PSV (México)", "mediocampista", "mid"],
  ["p_co_g_gimenez", "Gastón Giménez", "CM - Chicago Fire (Paraguay)", "mediocampista", "dm"],
  ["p_co_gruezo", "Carlos Gruezo", "CDM - Augsburg (Ecuador)", "mediocampista", "dm"],
  ["p_co_lerma", "Jefferson Lerma", "CM - Crystal Palace (Colombia)", "mediocampista", "dm"],
  ["p_co_ibarguen", "Andrés Ibargüen", "RW - Atlas (Colombia)", "mediocampista", "wing"],
  ["p_co_aquino", "Javier Aquino", "LW - Tigres (México)", "mediocampista", "wing"],
  // FW (31)
  ["p_co_jimenez", "Raúl Jiménez", "FW - Fulham (México)", "delantero", "att"],
  ["p_co_h_martin", "Henry Martín", "FW - América (México)", "delantero", "att"],
  ["p_co_lozano", "Hirving Lozano", "RW - PSV (México)", "delantero", "wing"],
  ["p_co_a_vega", "Alexis Vega", "LW - Toluca (México)", "delantero", "wing"],
  ["p_co_s_gimenez", "Santiago Giménez", "FW - Feyenoord (México)", "delantero", "att"],
  ["p_co_falcao", "Radamel Falcao", "FW - Millonarios (Colombia)", "delantero", "att"],
  ["p_co_muriel", "Luis Muriel", "FW - Atalanta (Colombia)", "delantero", "att"],
  ["p_co_borre", "Rafael Santos Borré", "FW - Internacional (Colombia)", "delantero", "att"],
  ["p_co_morelos", "Alfredo Morelos", "FW - Santos (Colombia)", "delantero", "att"],
  ["p_co_b_rodriguez", "Brian Rodríguez", "LW - LA Galaxy (Uruguay)", "delantero", "wing"],
  ["p_co_d_nunez", "Darwin Núñez", "FW - Liverpool (Uruguay)", "delantero", "att"],
  ["p_co_l_suarez", "Luis Suárez", "FW - Inter Miami (Uruguay)", "delantero", "att"],
  ["p_co_j_rodriguez_f", "Jonathan Rodríguez", "FW - Cruz Azul (Uruguay)", "delantero", "att"],
  ["p_co_e_vargas", "Eduardo Vargas", "FW - Atlético Mineiro (Chile)", "delantero", "att"],
  ["p_co_a_sanchez", "Alexis Sánchez", "FW - Inter (Chile)", "delantero", "att"],
  ["p_co_c_vela", "Carlos Vela", "FW - LAFC (México)", "delantero", "att"],
  ["p_co_josef_m", "Josef Martínez", "FW - Inter Miami (Venezuela)", "delantero", "att"],
  ["p_co_insigne", "Lorenzo Insigne", "FW - Toronto FC (Italia)", "delantero", "wing"],
  ["p_co_a_mena", "Ángel Mena", "FW - León (Ecuador)", "delantero", "att"],
  ["p_co_e_valencia", "Enner Valencia", "FW - Internacional (Ecuador)", "delantero", "att"],
  ["p_co_gignac", "André-Pierre Gignac", "FW - Tigres (Francia)", "delantero", "att"],
  ["p_co_cucho", "Cucho Hernández", "FW - Columbus Crew (Colombia)", "delantero", "att"],
  ["p_co_c_arango", "Cristian Arango", "FW - Real Salt Lake (Colombia)", "delantero", "att"],
  ["p_co_j_morris", "Jordan Morris", "FW - Seattle Sounders (USA)", "delantero", "wing"],
  ["p_co_b_vazquez", "Brandon Vázquez", "FW - Monterrey (USA)", "delantero", "att"],
  ["p_co_macias", "José Juan Macías", "FW - Guadalajara (México)", "delantero", "att"],
  ["p_co_machis", "Darwin Machís", "FW - Cádiz (Venezuela)", "delantero", "wing"],
  ["p_co_stuani", "Cristian Stuani", "FW - Girona (Uruguay)", "delantero", "att"],
  ["p_co_bernardeschi", "Federico Bernardeschi", "FW - Toronto FC (Italia)", "delantero", "wing"],
  ["p_co_f_jara", "Franco Jara", "FW - Pachuca (Argentina)", "delantero", "att"],
  ["p_co_d_rossi", "Diego Rossi", "FW - Fenerbahce (Uruguay)", "delantero", "att"],
] as const;

const COMMON_PLAYERS: PlayerDef[] = COMMON_NAMES.map(([id, name, desc, cat, prof], i) => ({
  id: id as string,
  name: name as string,
  desc: desc as string,
  category: cat as PlayerDef["category"],
  rarity: "common",
  types: getTypesForProfile(prof as string),
  tags: ["potrero"],
  level: 1 + Math.floor(i / 12),
  statProfile: prof as PlayerDef["statProfile"],
  skillIds: getSkillsForProfile(prof as string, "common", i + 300),
  flavor: `${name} viene del barrio con hambre de gloria.`,
}));

function getTypesForProfile(prof: string): string[] {
  const map: Record<string, string[]> = {
    gk: ["arco"], def: ["defensa", "marca"], dm: ["volante", "marca"],
    mid: ["enganche", "creativo"], wing: ["extremo", "velocidad"], att: ["goleador", "área"],
  };
  return map[prof] || ["volante"];
}

// ─── ENEMIES ────────────────────────────────────────────────────────────

interface EnemyDef {
  id: string; name: string; desc: string; category: string; rarity: string;
  types: string[]; tags: string[]; level: number; statProfile: string;
  skillIds: string[]; flavor: string; isBoss?: boolean;
}

const ENEMIES: EnemyDef[] = [
  // Copa 1 - Liga Barrial
  { id: "e_pibe_potrero", name: "Pibe del Potrero", desc: "Pibe gambeteador del barrio.", category: "mediocampista", rarity: "common", types: ["regate"], tags: ["potrero"], level: 1, statProfile: "mid", skillIds: ["sk_caño"], flavor: "Aprendió en la calle." },
  { id: "e_juvenil_club", name: "Juvenil del Club", desc: "Jugador de las inferiores.", category: "mediocampista", rarity: "common", types: ["volante"], tags: ["inferiores"], level: 2, statProfile: "dm", skillIds: ["sk_quite"], flavor: "Sueña con debutar." },
  { id: "e_crack_barrio", name: "Crack del Barrio", desc: "El mejor del torneo local.", category: "delantero", rarity: "uncommon", types: ["goleador"], tags: ["barrio"], level: 4, statProfile: "att", skillIds: ["sk_bombazo", "sk_sombrero"], flavor: "Leyenda del potrero." },
  { id: "e_rival_barrio", name: "Rival del Barrio", desc: "Defensor curtido.", category: "defensor", rarity: "common", types: ["marca"], tags: ["barrio"], level: 3, statProfile: "def", skillIds: ["sk_tackleo"], flavor: "No regala nada." },
  { id: "e_referi_barrial", name: "El Referí que Cobra Todo", desc: "Un árbitro que juega para el otro equipo.", category: "mediocampista", rarity: "rare", types: ["marca", "volante"], tags: ["boss", "barrio"], level: 6, statProfile: "dm", skillIds: ["sk_marca_personal", "sk_pressing", "sk_tackleo"], flavor: "¡Fuera de juego inexistente!", isBoss: true },
  // Copa 2 - Provincial
  { id: "e_interior", name: "Jugador del Interior", desc: "Pibe del interior con fútbol simple.", category: "mediocampista", rarity: "common", types: ["volante"], tags: ["provincial"], level: 4, statProfile: "dm", skillIds: ["sk_quite"], flavor: "Cancha de tierra, corazón de acero." },
  { id: "e_marcador_duro", name: "Marcador Duro", desc: "Defensor que no deja jugar.", category: "defensor", rarity: "common", types: ["marca"], tags: ["provincial"], level: 5, statProfile: "def", skillIds: ["sk_tackleo", "sk_barrida"], flavor: "No pasa ni el viento." },
  { id: "e_goleador_prov", name: "Goleador Provincial", desc: "El que mete todos los goles.", category: "delantero", rarity: "uncommon", types: ["goleador"], tags: ["provincial"], level: 6, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_cabezazo"], flavor: "Goleador del torneo." },
  { id: "e_referente_local", name: "El Referente Local", desc: "El ídolo de la liga regional.", category: "delantero", rarity: "rare", types: ["goleador", "enganche"], tags: ["boss", "provincial"], level: 8, statProfile: "att", skillIds: ["sk_bombazo", "sk_media_vuelta", "sk_tiro_libre"], flavor: "Hincha, ídolo y goleador.", isBoss: true },
  // Copa 3 - Primera División
  { id: "e_titular_primera", name: "Titular de Primera", desc: "Profesional experimentado.", category: "mediocampista", rarity: "uncommon", types: ["volante", "creativo"], tags: ["primera"], level: 8, statProfile: "mid", skillIds: ["sk_pared", "sk_pressing"], flavor: "Profesional al 100%." },
  { id: "e_suplente_ganas", name: "Suplente con Ganas", desc: "Entra y corre el doble.", category: "mediocampista", rarity: "common", types: ["velocidad"], tags: ["primera"], level: 7, statProfile: "dm", skillIds: ["sk_pressing"], flavor: "Le quedan 30 min y lo da todo." },
  { id: "e_refuerzo_mill", name: "Refuerzo Millonario", desc: "Llegó con mucha plata.", category: "delantero", rarity: "rare", types: ["goleador", "extremo"], tags: ["primera"], level: 10, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_depredador"], flavor: "La compra más cara del torneo." },
  { id: "e_clasico_rival", name: "Clásico Rival", desc: "El capitán del equipo más odiado.", category: "mediocampista", rarity: "epic", types: ["enganche", "capitán"], tags: ["boss", "primera"], level: 12, statProfile: "mid", skillIds: ["sk_pase_filtrado", "sk_bombazo", "sk_liderazgo"], flavor: "Superclásico. No hay más que decir.", isBoss: true },
  // Copa 4 - Sudamericana
  { id: "e_volante_br", name: "Volante Brasileño", desc: "Mediocampista técnico de Brasil.", category: "mediocampista", rarity: "uncommon", types: ["volante", "regate"], tags: ["sudamericana"], level: 10, statProfile: "mid", skillIds: ["sk_sombrero", "sk_pared"], flavor: "Jogo bonito en el medio." },
  { id: "e_defensa_col", name: "Defensa Colombiano", desc: "Central fuerte de Colombia.", category: "defensor", rarity: "uncommon", types: ["defensa", "aéreo"], tags: ["sudamericana"], level: 10, statProfile: "def", skillIds: ["sk_cabezazo", "sk_tackleo"], flavor: "Muro cafetero." },
  { id: "e_crack_sudamer", name: "Crack Sudamericano", desc: "La joya del continente.", category: "delantero", rarity: "rare", types: ["extremo", "regate"], tags: ["sudamericana"], level: 12, statProfile: "wing", skillIds: ["sk_gambeta_corta", "sk_enganchar", "sk_regate_doble"], flavor: "Lo quieren de Europa." },
  { id: "e_boss_flamengo", name: "Flamengo FC", desc: "El equipo más popular de Brasil.", category: "delantero", rarity: "epic", types: ["goleador", "velocidad"], tags: ["boss", "sudamericana"], level: 14, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_depredador", "sk_media_vuelta"], flavor: "Mengão no perdona.", isBoss: true },
  // Copa 5 - Libertadores
  { id: "e_extremo_br", name: "Extremo Brasileño", desc: "Punta rápido de la Libertadores.", category: "delantero", rarity: "uncommon", types: ["extremo", "velocidad"], tags: ["libertadores"], level: 12, statProfile: "wing", skillIds: ["sk_enganchar", "sk_gambeta_corta"], flavor: "Velocidad pura." },
  { id: "e_goleador_uru", name: "Goleador Uruguayo", desc: "9 de área clásico.", category: "delantero", rarity: "uncommon", types: ["goleador", "área"], tags: ["libertadores"], level: 12, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_cabezazo"], flavor: "Garra charrúa." },
  { id: "e_estrella_cont", name: "Estrella Continental", desc: "El mejor jugador del continente.", category: "mediocampista", rarity: "rare", types: ["enganche", "creativo"], tags: ["libertadores"], level: 14, statProfile: "mid", skillIds: ["sk_pase_filtrado", "sk_tiki_taka", "sk_bombazo"], flavor: "Candidato al Balón de Oro." },
  { id: "e_boss_campeon", name: "Campeón Vigente", desc: "El último campeón de la Libertadores.", category: "delantero", rarity: "epic", types: ["goleador", "enganche"], tags: ["boss", "libertadores"], level: 16, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_depredador", "sk_chilena", "sk_liderazgo"], flavor: "Defender el título o morir en el intento.", isBoss: true },
  // Copa 6 - Europa League
  { id: "e_mid_turco", name: "Mediocampista Turco", desc: "Técnico de la Süper Lig.", category: "mediocampista", rarity: "uncommon", types: ["volante", "creativo"], tags: ["europa_league"], level: 13, statProfile: "mid", skillIds: ["sk_pared", "sk_diagonal"], flavor: "Fútbol turco." },
  { id: "e_def_portug", name: "Defensor Portugués", desc: "Central de la Liga NOS.", category: "defensor", rarity: "uncommon", types: ["defensa", "marca"], tags: ["europa_league"], level: 13, statProfile: "def", skillIds: ["sk_tackleo", "sk_barrida"], flavor: "Escuela portuguesa." },
  { id: "e_crack_liga_media", name: "Crack Liga Media", desc: "Estrella de liga mediana europea.", category: "delantero", rarity: "rare", types: ["extremo", "goleador"], tags: ["europa_league"], level: 15, statProfile: "wing", skillIds: ["sk_enganchar", "sk_bombazo", "sk_regate_doble"], flavor: "Futuro transfer millonario." },
  { id: "e_boss_sevilla", name: "Rey de la Europa League", desc: "Especialista en ganar Europa League.", category: "mediocampista", rarity: "epic", types: ["enganche", "capitán"], tags: ["boss", "europa_league"], level: 17, statProfile: "mid", skillIds: ["sk_pase_filtrado", "sk_tiki_taka", "sk_bombazo", "sk_liderazgo"], flavor: "6 veces campeón.", isBoss: true },
  // Copa 7 - Champions League
  { id: "e_titular_city", name: "Titular del City", desc: "Jugador del Manchester City.", category: "mediocampista", rarity: "rare", types: ["volante", "creativo"], tags: ["champions"], level: 16, statProfile: "mid", skillIds: ["sk_tiki_taka", "sk_pared", "sk_pressing"], flavor: "Guardiola System." },
  { id: "e_volante_bayern", name: "Volante del Bayern", desc: "Máquina de correr del Bayern.", category: "mediocampista", rarity: "rare", types: ["volante", "marca"], tags: ["champions"], level: 16, statProfile: "dm", skillIds: ["sk_pressing", "sk_marca_personal", "sk_tackleo"], flavor: "Mia san mia." },
  { id: "e_estrella_eur", name: "Estrella Europea", desc: "Un crack de la Champions.", category: "delantero", rarity: "epic", types: ["extremo", "goleador"], tags: ["champions"], level: 18, statProfile: "wing", skillIds: ["sk_enganchar", "sk_depredador", "sk_rabona"], flavor: "El tipo que decide finales." },
  { id: "e_boss_real_madrid", name: "Real Madrid CF", desc: "El rey de la Champions League.", category: "delantero", rarity: "legendary", types: ["goleador", "enganche"], tags: ["boss", "champions"], level: 20, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_depredador", "sk_volea", "sk_liderazgo"], flavor: "La undécima, la duodécima, la que sigue.", isBoss: true },
  // Copa 8 - Mundial de Clubes
  { id: "e_allstar_inter", name: "All-Star Intercontinental", desc: "Lo mejor de cada continente.", category: "mediocampista", rarity: "rare", types: ["enganche", "velocidad"], tags: ["mundial_clubes"], level: 18, statProfile: "mid", skillIds: ["sk_pase_filtrado", "sk_diagonal", "sk_bombazo"], flavor: "Los mejores de cada liga." },
  { id: "e_mvp_cont", name: "MVP Continental", desc: "El MVP del torneo.", category: "delantero", rarity: "epic", types: ["goleador", "extremo"], tags: ["mundial_clubes"], level: 20, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_depredador", "sk_chilena", "sk_volea"], flavor: "Balón de Oro garantizado." },
  { id: "e_boss_dream_team", name: "Dream Team Global", desc: "El equipo definitivo.", category: "delantero", rarity: "legendary", types: ["goleador", "enganche", "velocidad"], tags: ["boss", "mundial_clubes"], level: 22, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_depredador", "sk_volea", "sk_tiro_libre"], flavor: "All Stars del mundo.", isBoss: true },
  // Copa 9 - Copa del Mundo
  { id: "e_seleccionado", name: "Seleccionado Internacional", desc: "Jugador de selección.", category: "mediocampista", rarity: "rare", types: ["volante", "creativo"], tags: ["mundial"], level: 20, statProfile: "mid", skillIds: ["sk_tiki_taka", "sk_pase_filtrado", "sk_pressing"], flavor: "Representa a su país." },
  { id: "e_estrella_sel", name: "Estrella de Selección", desc: "El crack del equipo nacional.", category: "delantero", rarity: "epic", types: ["extremo", "goleador"], tags: ["mundial"], level: 22, statProfile: "wing", skillIds: ["sk_enganchar", "sk_depredador", "sk_regate_doble", "sk_chilena"], flavor: "Gol en semifinal del mundo." },
  { id: "e_boss_final_mundial", name: "Selección Campeona", desc: "Argentina, Francia o Brasil. La final del mundo.", category: "delantero", rarity: "legendary", types: ["goleador", "enganche", "velocidad"], tags: ["boss", "mundial"], level: 25, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_depredador", "sk_volea", "sk_tiro_libre", "sk_liderazgo"], flavor: "La final que define tu leyenda.", isBoss: true },
];

const PLAYER_IMAGES: Record<string, string> = {
  // Legendary (20)
  "p_haaland": "https://r2.thesportsdb.com/images/media/player/cutout/un3jr11769182465.png",
  "p_mbappe": "https://r2.thesportsdb.com/images/media/player/cutout/h9u9vz1733653583.png",
  "p_vinicius": "https://r2.thesportsdb.com/images/media/player/cutout/ejuxsh1750271859.png",
  "p_bellingham": "https://r2.thesportsdb.com/images/media/player/cutout/trk5271750271712.png",
  "p_saka": "https://r2.thesportsdb.com/images/media/player/cutout/xfwok41769331816.png",
  "p_messi": "https://r2.thesportsdb.com/images/media/player/cutout/e0i2051750317027.png",
  "p_bernardo": "https://r2.thesportsdb.com/images/media/player/cutout/13ajsp1769182879.png",
  "p_rodri": "https://r2.thesportsdb.com/images/media/player/cutout/0ml2zi1761148957.png",
  "p_lautaro": "https://r2.thesportsdb.com/images/media/player/cutout/vwxq811759408924.png",
  "p_salah": "https://r2.thesportsdb.com/images/media/player/cutout/3blc581757088735.png",
  "p_alisson": "https://r2.thesportsdb.com/images/media/player/cutout/8amq961757087569.png",
  "p_dimarco": "https://r2.thesportsdb.com/images/media/player/cutout/0rhwx41759408849.png",
  "p_dybala": "https://r2.thesportsdb.com/images/media/player/cutout/pjupvq1758815223.png",
  "p_courtois": "https://r2.thesportsdb.com/images/media/player/cutout/592mar1733653475.png",
  "p_virgil": "https://r2.thesportsdb.com/images/media/player/cutout/9cxf2q1757087742.png",
  "p_kroos": "https://r2.thesportsdb.com/images/media/player/cutout/15aner1662548423.png",
  "p_neymar": "https://r2.thesportsdb.com/images/media/player/cutout/av4ar01767782947.png",
  "p_de_bruyne": "https://r2.thesportsdb.com/images/media/player/cutout/o4flia1764089447.png",
  "p_martinez_emi": "https://r2.thesportsdb.com/images/media/player/cutout/ffr5xx1756984715.png",
  "p_modric": "https://r2.thesportsdb.com/images/media/player/cutout/msewdx1758892756.png",
  // Epic (35)
  "p_guler": "https://r2.thesportsdb.com/images/media/player/cutout/lwnog21768499165.png",
  "p_gavi": "https://r2.thesportsdb.com/images/media/player/cutout/29005498.png",
  "p_marchesin": "https://r2.thesportsdb.com/images/media/player/cutout/bvnydc1750030032.png",
  "p_pezzella": "https://r2.thesportsdb.com/images/media/player/cutout/i1kdbt1750268621.png",
  "p_armani": "https://r2.thesportsdb.com/images/media/player/cutout/yoasye1750270727.png",
  "p_pedri": "https://r2.thesportsdb.com/images/media/player/cutout/srwppu1424795582.png",
  "p_foden": "https://r2.thesportsdb.com/images/media/player/cutout/lbn4sx1769182620.png",
  "p_szczesny": "https://r2.thesportsdb.com/images/media/player/cutout/f6c4oc1762289852.png",
  "p_valverde": "https://r2.thesportsdb.com/images/media/player/cutout/5249151768499204.png",
  "p_araujo": "https://r2.thesportsdb.com/images/media/player/cutout/ggpnkx1762289497.png",
  "p_raphinha": "https://r2.thesportsdb.com/images/media/player/cutout/w94spe1726510018.png",
  "p_szoboszlai": "https://r2.thesportsdb.com/images/media/player/cutout/0n431m1757088795.png",
  "p_mac_allister": "https://r2.thesportsdb.com/images/media/player/cutout/96dmuf1757087513.png",
  "p_enzo": "https://r2.thesportsdb.com/images/media/player/cutout/b71vun1757003115.png",
  "p_yamal": "https://r2.thesportsdb.com/images/media/player/cutout/m9n4ja1761512633.png",
  "p_hakimi": "https://r2.thesportsdb.com/images/media/player/cutout/oqu69c1766335243.png",
  "p_tchouameni": "https://r2.thesportsdb.com/images/media/player/cutout/4o417k1733653668.png",
  "p_cuti_romero": "https://r2.thesportsdb.com/images/media/player/cutout/dme7x81757016317.png",
  "p_gundogan": "https://r2.thesportsdb.com/images/media/player/cutout/rhyyig1768854274.png",
  "p_garnacho": "https://r2.thesportsdb.com/images/media/player/cutout/69y34j1757003249.png",
  "p_martinez_lisandro": "https://r2.thesportsdb.com/images/media/player/cutout/mqcogi1766826879.png",
  "p_wirtz": "https://r2.thesportsdb.com/images/media/player/cutout/8t6bzo1757088899.png",
  "p_kvaratskhelia": "https://r2.thesportsdb.com/images/media/player/cutout/n4iv5t1766335312.png",
  "p_carvajal": "https://r2.thesportsdb.com/images/media/player/cutout/k510z81733653425.png",
  "p_oblak": "https://r2.thesportsdb.com/images/media/player/cutout/akfmb31762287556.png",
  "p_otamendi": "https://r2.thesportsdb.com/images/media/player/cutout/ifxn6x1632995975.png",
  "p_ter_stegen": "https://r2.thesportsdb.com/images/media/player/cutout/9w51mf1775286949.png",
  "p_molina": "https://r2.thesportsdb.com/images/media/player/cutout/36bdni1762288498.png",
  "p_julian_alvarez": "https://r2.thesportsdb.com/images/media/player/cutout/91pla41762288186.png",
  "p_endrick": "https://r2.thesportsdb.com/images/media/player/cutout/5yb3rv1733653315.png",
  "p_camavinga": "https://r2.thesportsdb.com/images/media/player/cutout/viijpx1733653403.png",
  "p_kim": "https://r2.thesportsdb.com/images/media/player/cutout/m4uh701756408877.png",
  "p_thiago_almada": "https://r2.thesportsdb.com/images/media/player/cutout/ffqi3i1762288171.png",
  "p_ruben_dias": "https://r2.thesportsdb.com/images/media/player/cutout/g3psnr1769183713.png",
  "p_diaz_luis": "https://r2.thesportsdb.com/images/media/player/cutout/emmcyf1756408968.png",
  // Rare (27 of 45 - rest pending rate limit)
  "p_romero_a": "https://r2.thesportsdb.com/images/media/player/cutout/mg48sv1767278273.png",
  "p_velasco": "https://r2.thesportsdb.com/images/media/player/cutout/ggqnxa1750040142.png",
  "p_colidio": "https://r2.thesportsdb.com/images/media/player/cutout/otnpya1750269219.png",
  "p_barco": "https://r2.thesportsdb.com/images/media/player/cutout/96p71z1755186735.png",
  "p_soler": "https://r2.thesportsdb.com/images/media/player/cutout/7odch01762709303.png",
  "p_ferran": "https://r2.thesportsdb.com/images/media/player/cutout/feey201726510461.png",
  "p_medina": "https://r2.thesportsdb.com/images/media/player/cutout/mdj7cd1763385975.png",
  "p_zenon": "https://r2.thesportsdb.com/images/media/player/cutout/ag8c251750043307.png",
  "p_cavani": "https://r2.thesportsdb.com/images/media/player/cutout/xf3lty1750043968.png",
  "p_merentiel": "https://r2.thesportsdb.com/images/media/player/cutout/9bd7t41750030982.png",
  "p_fernandez_e": "https://r2.thesportsdb.com/images/media/player/cutout/4fma4p1767961539.png",
  "p_gonzalez_n": "https://r2.thesportsdb.com/images/media/player/cutout/e6mhnz1762288376.png",
  "p_paredes": "https://r2.thesportsdb.com/images/media/player/cutout/chsspk1763384490.png",
  "p_lo_celso": "https://r2.thesportsdb.com/images/media/player/cutout/yge8gq1762602923.png",
  "p_palacios": "https://r2.thesportsdb.com/images/media/player/cutout/oby41y1756316369.png",
  "p_montiel": "https://r2.thesportsdb.com/images/media/player/cutout/perteu1750270994.png",
  "p_tagliafico": "https://r2.thesportsdb.com/images/media/player/cutout/4z43fy1766146600.png",
  "p_martinez_j": "https://r2.thesportsdb.com/images/media/player/cutout/5h53jr1765488132.png",
  "p_de_paul": "https://r2.thesportsdb.com/images/media/player/cutout/n7z5lr1773999437.png",
  "p_acuna": "https://r2.thesportsdb.com/images/media/player/cutout/pfw9qa1750270796.png",
  "p_musso": "https://r2.thesportsdb.com/images/media/player/cutout/401mle1762287491.png",
  "p_rulli": "https://r2.thesportsdb.com/images/media/player/cutout/cpkkmg1766153528.png",
  "p_simeone_g": "https://r2.thesportsdb.com/images/media/player/cutout/vyiclr1758813227.png",
  "p_pavon": "https://r2.thesportsdb.com/images/media/player/cutout/rsbb4r1767545725.png",
  "p_osimhen": "https://r2.thesportsdb.com/images/media/player/cutout/lw0qcf1769177786.png",
  "p_chiesa": "https://r2.thesportsdb.com/images/media/player/cutout/idecla1757087689.png",
  "p_bruno_f": "https://r2.thesportsdb.com/images/media/player/cutout/jhasls1766826690.png",
  "p_sane": "https://r2.thesportsdb.com/images/media/player/cutout/bqdwlt1769178212.png",
  "p_gakpo": "https://r2.thesportsdb.com/images/media/player/cutout/lwkl5n1757088091.png",
  "p_olise": "https://r2.thesportsdb.com/images/media/player/cutout/r4vx6b1756408807.png",
  "p_rice": "https://r2.thesportsdb.com/images/media/player/cutout/do2pew1694204464.png",
  "p_odegaard": "https://r2.thesportsdb.com/images/media/player/cutout/5g6vww1769331695.png",
  "p_havertz": "https://r2.thesportsdb.com/images/media/player/cutout/hem4r91694204364.png",
  "p_palmer": "https://r2.thesportsdb.com/images/media/player/cutout/fn0pzc1757010119.png",
  "p_martinez_e2": "https://r2.thesportsdb.com/images/media/player/cutout/10qe2t1756984661.png",
  "p_angelino": "https://www.thesportsdb.com/images/media/player/cutout/oychrv1782679028.png",
  "p_senesi": "https://r2.thesportsdb.com/images/media/player/cutout/ve65ug1757018745.png",
  "p_son": "https://r2.thesportsdb.com/images/media/player/cutout/a5cqf81766425262.png",
  "p_kane": "https://r2.thesportsdb.com/images/media/player/cutout/j4ouvd1756408895.png",
  "p_raya": "https://r2.thesportsdb.com/images/media/player/cutout/21rp2q1769331784.png",
  "p_cucurella": "https://r2.thesportsdb.com/images/media/player/cutout/j7i66q1757002736.png",
  "p_williams_n": "https://r2.thesportsdb.com/images/media/player/cutout/8lg7941629190551.png",
  "p_pedri2": "https://r2.thesportsdb.com/images/media/player/cutout/4skahz1761512602.png",
  // New epic (5)
  "p_musiala": "https://r2.thesportsdb.com/images/media/player/cutout/vbkv611756416067.png",
  "p_isak": "https://r2.thesportsdb.com/images/media/player/cutout/3qj7z41757088281.png",
  "p_savinho": "https://r2.thesportsdb.com/images/media/player/cutout/khqgy21769183420.png",
  "p_bastoni": "https://r2.thesportsdb.com/images/media/player/cutout/hwixpa1759408795.png",
  "p_joao_neves": "https://r2.thesportsdb.com/images/media/player/cutout/2q9ahn1766335473.png",
  // New rare (15)
  "p_grealish": "https://r2.thesportsdb.com/images/media/player/cutout/7ckk5a1756976762.png",
  "p_thuram": "https://r2.thesportsdb.com/images/media/player/cutout/aykui01759408989.png",
  "p_barella": "https://r2.thesportsdb.com/images/media/player/cutout/k03sge1759408783.png",
  "p_leao": "https://r2.thesportsdb.com/images/media/player/cutout/tlgrvf1758892567.png",
  "p_tonali": "https://r2.thesportsdb.com/images/media/player/cutout/b9oang1766824727.png",
  "p_pulisic": "https://r2.thesportsdb.com/images/media/player/cutout/qwii9r1758893548.png",
  "p_lukaku": "https://r2.thesportsdb.com/images/media/player/cutout/qi2z1d1764089572.png",
  "p_calhanoglu": "https://r2.thesportsdb.com/images/media/player/cutout/hw8uxm1759408821.png",
  "p_nkunku": "https://r2.thesportsdb.com/images/media/player/cutout/0zhdh61758893135.png",
  "p_boniface": "https://r2.thesportsdb.com/images/media/player/cutout/7e2phd1763665992.png",
  "p_doku": "https://r2.thesportsdb.com/images/media/player/cutout/tehbsx1769183074.png",
  "p_zaire_emery": "https://r2.thesportsdb.com/images/media/player/cutout/fjxbac1766335583.png",
  "p_edson_alvarez": "https://r2.thesportsdb.com/images/media/player/cutout/nt933u1769179587.png",
  "p_vlahovic": "https://r2.thesportsdb.com/images/media/player/cutout/rl2w191759225532.png",
  "p_lookman": "https://r2.thesportsdb.com/images/media/player/cutout/wg0pod1772033492.png",
  // Uncommon batch 1 (9 GK + 1 DEF)
  "p_uc_s_romero": "https://r2.thesportsdb.com/images/media/player/cutout/an3fxz1750030046.png",
  "p_uc_g_arias": "https://r2.thesportsdb.com/images/media/player/cutout/7c0dxt1774386215.png",
  "p_uc_a_rossi": "https://r2.thesportsdb.com/images/media/player/cutout/um7xb01750919100.png",
  "p_uc_weverton": "https://r2.thesportsdb.com/images/media/player/cutout/qoq0721750412232.png",
  "p_uc_e_andrada": "https://r2.thesportsdb.com/images/media/player/cutout/8y9hs31716820580.png",
  "p_uc_n_guzman": "https://www.thesportsdb.com/images/media/player/cutout/cpeh3x1782705044.png",
  "p_uc_s_rochet": "https://r2.thesportsdb.com/images/media/player/cutout/02lxaa1767604928.png",
  "p_uc_w_benitez": "https://r2.thesportsdb.com/images/media/player/cutout/zpp74f1766828114.png",
  "p_uc_advincula": "https://r2.thesportsdb.com/images/media/player/cutout/5n8dnn1750032401.png",
  // Uncommon batch 2 (DEF + MID)
  "p_uc_rojo": "https://r2.thesportsdb.com/images/media/player/cutout/zg0l681762793979.png",
  "p_uc_figal": "https://r2.thesportsdb.com/images/media/player/cutout/d7uohc1582902600.png",
  "p_uc_fabra": "https://r2.thesportsdb.com/images/media/player/cutout/bbveku1750040716.png",
  "p_uc_paulo_diaz": "https://r2.thesportsdb.com/images/media/player/cutout/vxj6vq1721215708.png",
  "p_uc_r_rojas": "https://r2.thesportsdb.com/images/media/player/cutout/01kc8q1716546466.png",
  "p_uc_m_casco": "https://r2.thesportsdb.com/images/media/player/cutout/bjimy61721220647.png",
  "p_uc_di_cesare": "https://r2.thesportsdb.com/images/media/player/cutout/ziw3gt1716467988.png",
  "p_uc_giannetti": "https://r2.thesportsdb.com/images/media/player/thumb/a0pony1716908871.jpg",
  "p_uc_tenaglia": "https://r2.thesportsdb.com/images/media/player/cutout/v8vz801762353281.png",
  "p_uc_a_frias": "https://r2.thesportsdb.com/images/media/player/cutout/f1zoz91767780324.png",
  "p_uc_david_luiz": "https://r2.thesportsdb.com/images/media/player/cutout/h9llon1565882993.png",
  "p_uc_leo_pereira": "https://r2.thesportsdb.com/images/media/player/cutout/cuvmse1750919246.png",
  "p_uc_gustavo_gomez": "https://r2.thesportsdb.com/images/media/player/cutout/ytrnlp1750412203.png",
  "p_uc_piquerez": "https://r2.thesportsdb.com/images/media/player/cutout/ly80qj1750412020.png",
  "p_uc_saravia": "https://r2.thesportsdb.com/images/media/player/cutout/ecbl771763755466.png",
  "p_uc_izquierdoz": "https://r2.thesportsdb.com/images/media/player/cutout/peysot1764933176.png",
  "p_uc_val_gomez": "https://r2.thesportsdb.com/images/media/player/cutout/sb4du71762603007.png",
  "p_uc_ayrton_costa": "https://r2.thesportsdb.com/images/media/player/cutout/gl7u2h1750045818.png",
  "p_uc_f_bustos": "https://r2.thesportsdb.com/images/media/player/cutout/p5u4qs1762728442.png",
  "p_uc_l_jara": "https://r2.thesportsdb.com/images/media/player/cutout/38uxwv1716985177.png",
  "p_uc_pol": "https://r2.thesportsdb.com/images/media/player/cutout/wi5jmr1763640546.png",
  "p_uc_kranevitter": "https://r2.thesportsdb.com/images/media/player/cutout/ce0di41721222390.png",
  "p_uc_aliendro": "https://r2.thesportsdb.com/images/media/player/cutout/v8y0qi1764106233.png",
  "p_uc_quintero": "https://r2.thesportsdb.com/images/media/player/cutout/ysk0b21764106676.png",
  "p_uc_marcone": "https://r2.thesportsdb.com/images/media/player/cutout/2df67e1762852550.png",
  "p_uc_zuqui": "https://r2.thesportsdb.com/images/media/player/cutout/038l5z1780387479.png",
  "p_uc_j_sosa": "https://r2.thesportsdb.com/images/media/player/cutout/skbv741716556097.png",
  "p_uc_belmonte": "https://r2.thesportsdb.com/images/media/player/cutout/h54d101750030351.png",
  "p_uc_gerson": "https://r2.thesportsdb.com/images/media/player/cutout/6bq1pi1770029676.png",
  "p_uc_arrascaeta": "https://r2.thesportsdb.com/images/media/player/cutout/2p9j0d1750919894.png",
  "p_uc_e_ribeiro": "https://r2.thesportsdb.com/images/media/player/cutout/8p52tw1763831878.png",
  "p_uc_r_veiga": "https://r2.thesportsdb.com/images/media/player/cutout/2etn7j1750412119.png",
  "p_uc_ze_rafael": "https://r2.thesportsdb.com/images/media/player/cutout/10zyza1767886114.png",
  "p_uc_salvio": "https://r2.thesportsdb.com/images/media/player/cutout/g7cjhl1764934207.png",
  "p_uc_enzo_perez": "https://r2.thesportsdb.com/images/media/player/cutout/25n1wj1750269322.png",
  "p_uc_max_meza": "https://r2.thesportsdb.com/images/media/player/cutout/8hcqmr1750615377.png",
  "p_uc_pochettino": "https://r2.thesportsdb.com/images/media/player/cutout/gksew11641228328.png",
  "p_uc_alan_patrick": "https://r2.thesportsdb.com/images/media/player/cutout/m3dyrk1767558419.png",
  "p_uc_o_romero": "https://r2.thesportsdb.com/images/media/player/cutout/sj1pgl1767605210.png",
  "p_uc_echeverri": "https://r2.thesportsdb.com/images/media/player/cutout/jbdnk91756315963.png",
  "p_uc_mastantuono": "https://r2.thesportsdb.com/images/media/player/cutout/pgq83k1762604333.png",
  "p_uc_maroni": "https://r2.thesportsdb.com/images/media/player/cutout/xni8c41765205144.png",
  "p_uc_benedetto": "https://r2.thesportsdb.com/images/media/player/cutout/36f9cd1716636813.png",
  // Uncommon batch 3 (FW) + Common batch 3 (GK + DEF start)
  "p_uc_langoni": "https://r2.thesportsdb.com/images/media/player/cutout/bqvd431766744093.png",
  "p_uc_borja": "https://r2.thesportsdb.com/images/media/player/cutout/jle0ra1716541968.png",
  "p_uc_rondon": "https://r2.thesportsdb.com/images/media/player/cutout/cq1lnb1762199430.png",
  "p_uc_roger_m": "https://r2.thesportsdb.com/images/media/player/cutout/psyh3h1716471507.png",
  "p_uc_cerutti": "https://r2.thesportsdb.com/images/media/player/cutout/yu1qxr1765311845.png",
  "p_uc_janson": "https://r2.thesportsdb.com/images/media/player/cutout/98u9551750032500.png",
  "p_uc_pedro_f": "https://r2.thesportsdb.com/images/media/player/cutout/ercx9t1750919772.png",
  "p_uc_driussi": "https://r2.thesportsdb.com/images/media/player/cutout/kv5svz1750268935.png",
  "p_uc_w_bou": "https://r2.thesportsdb.com/images/media/player/cutout/5snfxn1764934657.png",
  "p_uc_retegui": "https://r2.thesportsdb.com/images/media/player/cutout/s21z3c1731837995.png",
  "p_uc_avalos": "https://r2.thesportsdb.com/images/media/player/cutout/nhc7ai1762852153.png",
  "p_uc_pratto": "https://r2.thesportsdb.com/images/media/player/cutout/4husl41765454163.png",
  "p_uc_villa": "https://r2.thesportsdb.com/images/media/player/cutout/rsyzdt1764330892.png",
  "p_uc_calleri": "https://r2.thesportsdb.com/images/media/player/cutout/o2p8st1767959549.png",
  "p_uc_castellani": "https://r2.thesportsdb.com/images/media/player/cutout/964854.png",
  "p_co_ochoa": "https://r2.thesportsdb.com/images/media/player/cutout/2oh1dq1707692146.png",
  "p_co_talavera": "https://r2.thesportsdb.com/images/media/player/cutout/b2wazd1668722317.png",
  "p_co_keylor": "https://r2.thesportsdb.com/images/media/player/cutout/vo1yli1704463423.png",
  "p_co_c_vargas": "https://r2.thesportsdb.com/images/media/player/cutout/ej38x01648634661.png",
  "p_co_castellon": "https://r2.thesportsdb.com/images/media/player/thumb/5ebmgl1732121681.jpg",
  "p_co_r_rey": "https://r2.thesportsdb.com/images/media/player/cutout/n240fz1762850810.png",
  "p_co_blake": "https://r2.thesportsdb.com/images/media/player/cutout/7dtqel1760523129.png",
  "p_co_k_mier": "https://r2.thesportsdb.com/images/media/player/thumb/d42ck01779690353.jpg",
  "p_co_j_sanchez": "https://r2.thesportsdb.com/images/media/player/cutout/xftyyb1698428324.png",
  "p_co_araujo_n": "https://r2.thesportsdb.com/images/media/player/cutout/nk22f21603132818.png",
  "p_co_gallardo": "https://r2.thesportsdb.com/images/media/player/cutout/syauia1776427423.png",
  "p_co_c_montes": "https://r2.thesportsdb.com/images/media/player/cutout/hfmpbv1754726674.png",
  "p_co_isla": "https://r2.thesportsdb.com/images/media/player/cutout/3un5um1648631122.png",
  "p_co_maripan": "https://r2.thesportsdb.com/images/media/player/cutout/cipk5p1758813193.png",
  "p_co_y_mina": "https://r2.thesportsdb.com/images/media/player/cutout/9gq0ca1764336694.png",
  "p_co_davinson": "https://r2.thesportsdb.com/images/media/player/cutout/fwqgth1769178122.png",
  "p_co_j_alonso": "https://r2.thesportsdb.com/images/media/player/cutout/qf74pc1763755103.png",
  // Batch 4 (common DEF rest + MID + FW start)
  "p_co_balbuena": "https://r2.thesportsdb.com/images/media/player/cutout/8fk4qp1691152569.png",
  "p_co_duarte": "https://r2.thesportsdb.com/images/media/player/cutout/h2wtfc1770031691.png",
  "p_co_a_long": "https://r2.thesportsdb.com/images/media/player/cutout/4rn0cj1750913952.png",
  "p_co_yedlin": "https://r2.thesportsdb.com/images/media/player/cutout/t0lrq11766759384.png",
  "p_co_lichnovsky": "https://r2.thesportsdb.com/images/media/player/thumb/n6l0xc1715649984.jpg",
  "p_co_caceres": "https://r2.thesportsdb.com/images/media/player/cutout/3ya8p81682277550.png",
  "p_co_s_medina": "https://r2.thesportsdb.com/images/media/player/cutout/qok6wl1716821311.png",
  "p_co_mojica": "https://r2.thesportsdb.com/images/media/player/cutout/8uf3w61762524256.png",
  "p_co_velazquez_g": "https://r2.thesportsdb.com/images/media/player/cutout/i9pi1z1716825450.png",
  "p_co_h_herrera": "https://r2.thesportsdb.com/images/media/player/cutout/lrg0fe1778098323.png",
  "p_co_j_dos_santos": "https://r2.thesportsdb.com/images/media/player/cutout/ngtq6m1750329281.png",
  "p_co_cordova": "https://r2.thesportsdb.com/images/media/player/cutout/jo06791776412329.png",
  "p_co_alvarado": "https://r2.thesportsdb.com/images/media/player/cutout/dup2qf1630164554.png",
  "p_co_gorriaran": "https://www.thesportsdb.com/images/media/player/cutout/v1l6qz1782705798.png",
  "p_co_vidal": "https://r2.thesportsdb.com/images/media/player/cutout/l82e3d1602959065.png",
  "p_co_aranguiz": "https://r2.thesportsdb.com/images/media/player/cutout/2q55pi1578225848.png",
  "p_co_cuadrado": "https://r2.thesportsdb.com/images/media/player/cutout/30m1af1764188706.png",
  "p_co_james": "https://r2.thesportsdb.com/images/media/player/cutout/2604ez1778161086.png",
  "p_co_m_uribe": "https://r2.thesportsdb.com/images/media/player/cutout/6134mm1679052360.png",
  "p_co_w_barrios": "https://r2.thesportsdb.com/images/media/player/cutout/xhanhj1692198233.png",
  "p_co_d_gonzalez": "https://r2.thesportsdb.com/images/media/player/cutout/wj6s2n1667332858.png",
  "p_co_l_acosta_m": "https://r2.thesportsdb.com/images/media/player/cutout/gy1ixv1767539771.png",
  "p_co_almiron": "https://r2.thesportsdb.com/images/media/player/cutout/35lxqh1757447624.png",
  "p_co_lainez": "https://www.thesportsdb.com/images/media/player/cutout/b1ljmr1782705494.png",
  "p_co_orbelin": "https://r2.thesportsdb.com/images/media/player/cutout/yechmf1668721648.png",
  "p_co_richard_s": "https://www.thesportsdb.com/images/media/player/cutout/oycxef1785501050.png",
  "p_co_rincon": "https://r2.thesportsdb.com/images/media/player/cutout/q6r2fw1767783538.png",
  "p_co_yangel": "https://r2.thesportsdb.com/images/media/player/cutout/1nsply1762709046.png",
  "p_co_tapia": "https://r2.thesportsdb.com/images/media/player/cutout/t2e4mf1603133011.png",
  "p_co_yotun": "https://r2.thesportsdb.com/images/media/player/thumb/shlqhz1580126621.jpg",
  "p_co_borges": "https://r2.thesportsdb.com/images/media/player/cutout/ziu0is1668201028.png",
  "p_co_e_gutierrez": "https://r2.thesportsdb.com/images/media/player/cutout/0uvcph1679495855.png",
  "p_co_g_gimenez": "https://r2.thesportsdb.com/images/media/player/cutout/braz5b1641398718.png",
  "p_co_gruezo": "https://r2.thesportsdb.com/images/media/player/cutout/ha044c1681899190.png",
  "p_co_lerma": "https://r2.thesportsdb.com/images/media/player/cutout/5h7eyz1772141174.png",
  "p_co_jimenez": "https://r2.thesportsdb.com/images/media/player/cutout/xjepmh1781348889.png",
  "p_co_h_martin": "https://r2.thesportsdb.com/images/media/player/cutout/ijusbr1750329232.png",
  "p_co_lozano": "https://r2.thesportsdb.com/images/media/player/cutout/sumitr1762901593.png",
  "p_co_a_vega": "https://r2.thesportsdb.com/images/media/player/cutout/0mmqo91776412620.png",
  "p_co_s_gimenez": "https://r2.thesportsdb.com/images/media/player/cutout/j63fz01758892529.png",
  "p_co_falcao": "https://r2.thesportsdb.com/images/media/player/cutout/8xl2t31666379044.png",
  "p_co_muriel": "https://r2.thesportsdb.com/images/media/player/cutout/ce1b6r1760523208.png",
  "p_co_borre": "https://r2.thesportsdb.com/images/media/player/cutout/tsfv7s1767558322.png",
  "p_co_morelos": "https://r2.thesportsdb.com/images/media/player/cutout/ma5kjt1611761373.png",
  "p_co_b_rodriguez": "https://r2.thesportsdb.com/images/media/player/cutout/g1am161750329406.png",
  "p_co_d_nunez": "https://r2.thesportsdb.com/images/media/player/cutout/i78juc1693941560.png",
  // Batch 5 (common FW final)
  "p_co_l_suarez": "https://r2.thesportsdb.com/images/media/player/cutout/vfjd0w1750315193.png",
  "p_co_j_rodriguez_f": "https://r2.thesportsdb.com/images/media/player/cutout/4spghs1766760593.png",
  "p_co_e_vargas": "https://r2.thesportsdb.com/images/media/player/cutout/dtuh5w1629469394.png",
  "p_co_a_sanchez": "https://r2.thesportsdb.com/images/media/player/cutout/6bj5hk1762860338.png",
  "p_co_c_vela": "https://r2.thesportsdb.com/images/media/player/cutout/288iej1681898990.png",
  "p_co_josef_m": "https://r2.thesportsdb.com/images/media/player/cutout/3ebzw81766432650.png",
  "p_co_insigne": "https://r2.thesportsdb.com/images/media/player/cutout/dah87o1682678159.png",
  "p_co_a_mena": "https://r2.thesportsdb.com/images/media/player/cutout/mb7z9r1668547325.png",
  "p_co_e_valencia": "https://r2.thesportsdb.com/images/media/player/cutout/gplbd81668544491.png",
  "p_co_gignac": "https://r2.thesportsdb.com/images/media/player/thumb/fzroja1548938469.jpg",
  "p_co_cucho": "https://r2.thesportsdb.com/images/media/player/cutout/xvpcrx1762603023.png",
  "p_co_c_arango": "https://r2.thesportsdb.com/images/media/player/cutout/jtxfa31766432839.png",
  "p_co_j_morris": "https://r2.thesportsdb.com/images/media/player/cutout/ergxr11760523951.png",
  "p_co_b_vazquez": "https://r2.thesportsdb.com/images/media/player/cutout/ki703d1746347443.png",
  "p_co_machis": "https://r2.thesportsdb.com/images/media/player/cutout/bfo4se1724777592.png",
  "p_co_bernardeschi": "https://r2.thesportsdb.com/images/media/player/cutout/fwmcl01758896784.png",
  "p_co_f_jara": "https://r2.thesportsdb.com/images/media/player/cutout/tp8waw1762860967.png",
  "p_co_d_rossi": "https://r2.thesportsdb.com/images/media/player/cutout/vqfzmb1766428306.png",
  // Round 2 — fetched missing images
  "p_uc_b_henrique": "https://r2.thesportsdb.com/images/media/player/cutout/a0znu71750455127.png",
  "p_uc_dudu": "https://r2.thesportsdb.com/images/media/player/cutout/11l0pt1763755196.png",
  "p_uc_rony": "https://r2.thesportsdb.com/images/media/player/cutout/g83qt91674745645.png",
  "p_uc_l_diaz_e": "https://r2.thesportsdb.com/images/media/player/cutout/989ou31763042018.png",
  "p_uc_gabigol": "https://r2.thesportsdb.com/images/media/player/cutout/yfna9l1767455650.png",
  "p_uc_wanchope": "https://r2.thesportsdb.com/images/media/player/cutout/mkwkzm1773755702.png",
  // Legends
  "sp_maradona": "https://r2.thesportsdb.com/images/media/player/cutout/v298851606327825.png",
  "sp_pele": "https://r2.thesportsdb.com/images/media/player/cutout/s4apzi1615723073.png",
  "sp_zidane": "https://r2.thesportsdb.com/images/media/player/cutout/ae7bng1586814446.png",
  "sp_ronaldinho": "https://r2.thesportsdb.com/images/media/player/cutout/u91au61586868506.png",
  "sp_cruyff": "https://r2.thesportsdb.com/images/media/player/cutout/ze75mx1594069754.png",
  "sp_di_stefano": "https://r2.thesportsdb.com/images/media/player/thumb/hetubh1528736225.jpg",
  "sp_van_basten": "https://r2.thesportsdb.com/images/media/player/cutout/y4mua11615720110.png",
  "sp_beckenbauer": "https://r2.thesportsdb.com/images/media/player/cutout/nkcqxh1704739821.png",
  "sp_maldini": "https://r2.thesportsdb.com/images/media/player/cutout/9ccmbp1665653152.png",
};

function parseTeamCountry(desc: string): { team?: string; country?: string } {
  const countryMatch = desc.match(/\(([^)]+)\)\s*$/);
  const country = countryMatch ? countryMatch[1] : undefined;
  const lastDash = desc.lastIndexOf(" - ");
  const team = lastDash >= 0
    ? desc.slice(lastDash + 3).replace(/\s*\([^)]*\)\s*$/, "").trim() || undefined
    : undefined;
  return { team, country };
}

function buildEntity(p: PlayerDef | EnemyDef) {
  const stats = generateStats(p.statProfile, p.rarity, hashStr(p.id));
  const baseStats = { ...stats };
  const skills = p.skillIds.map((id) => buildSkill(id, p.rarity)).filter(Boolean);
  const entity: Record<string, unknown> = {
    id: p.id,
    name: p.name,
    description: p.desc,
    category: p.category,
    rarity: p.rarity,
    imageUrl: PLAYER_IMAGES[p.id] ?? "",
    stats,
    baseStats,
    types: p.types,
    tags: p.tags,
    skills,
    learnableSkills: [],
    evolutions: [],
    flavorText: p.flavor,
    initialLevel: p.level,
  };
  if ("passive" in p && p.passive) entity.passiveAbility = p.passive;
  if ("team" in p && p.team) {
    entity.team = p.team;
  } else {
    const parsed = parseTeamCountry(p.desc);
    if (parsed.team) entity.team = parsed.team;
  }
  if ("country" in p && p.country) {
    entity.country = p.country;
  } else {
    const parsed = parseTeamCountry(p.desc);
    if (parsed.country) entity.country = parsed.country;
  }
  return entity;
}

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// ─── EVENTS (42) ────────────────────────────────────────────────────────

function evt(id: string, title: string, desc: string, cat: string, tags: string[], choices: unknown[]) {
  return { id, title, description: desc, category: cat, tags, choices };
}

function ch(id: string, text: string, icon: string, opts: Record<string, unknown>) {
  return { id, text, icon, ...opts };
}

const EVENTS = [
  // Pool Potrero (10)
  evt("evt_ojeador", "Ojeador en la Tribuna", "Un tipo de traje está en la tribuna tomando notas.", "random", ["carrera", "oportunidad"], [
    ch("ch_lucirse", "Tirar firuletes para impresionar", "✨", { checkStat: "regate", checkThreshold: 65, successChance: 0.6, successOutcome: { description: "¡Te ofrece una prueba en el club!", resourceChanges: { fama: 25, moral: 10 }, xpGain: 40 }, failureOutcome: { description: "Te pasaste de rosca y perdiste la pelota.", resourceChanges: { moral: -10 } }, tags: ["regate"] }),
    ch("ch_jugar_simple", "Jugar simple y efectivo", "🎯", { checkStat: "pase", checkThreshold: 55, successChance: 0.8, successOutcome: { description: "Tu inteligencia no pasa desapercibida.", resourceChanges: { fama: 15 }, xpGain: 30 }, failureOutcome: { description: "No te distinguió del resto.", resourceChanges: {} }, tags: ["pase"] }),
  ]),
  evt("evt_lesion", "Lesión en Entrenamiento", "Sentís una puntada en el isquiotibial.", "random", ["salud", "riesgo"], [
    ch("ch_descansar", "Parar y hacer kinesiología", "🏥", { costs: { monedas: 50 }, successOutcome: { description: "Te recuperás al 100%.", resourceChanges: { energia: 30, moral: 5 }, healParty: 50 }, tags: ["safe"] }),
    ch("ch_infiltrar", "Infiltrarte y jugar igual", "💉", { successChance: 0.4, successOutcome: { description: "Aguantás y metés un golazo.", resourceChanges: { fama: 15, moral: 10 }, xpGain: 30 }, failureOutcome: { description: "Se te desgarra. 2 meses afuera.", resourceChanges: { energia: -40, moral: -20 } }, tags: ["risky"] }),
  ]),
  evt("evt_vestuario", "Conflicto en el Vestuario", "Dos compañeros se pelean después de una derrota.", "random", ["social", "liderazgo"], [
    ch("ch_mediar", "Mediar entre los dos", "🤝", { checkStat: "pase", checkThreshold: 50, successChance: 0.7, successOutcome: { description: "Los calmás. El grupo se une.", resourceChanges: { moral: 20 } }, failureOutcome: { description: "Te mandan a callar.", resourceChanges: { moral: -15 } }, tags: ["diplomacia"] }),
    ch("ch_ignorar", "Ponerte los auris", "🎧", { successOutcome: { description: "No es tu problema.", resourceChanges: { moral: -5 } }, tags: ["safe"] }),
  ]),
  evt("evt_picado_apuesta", "Picado con Apuesta", "Los pibes quieren apostar unas monedas.", "random", ["barrio", "riesgo"], [
    ch("ch_apostar", "Apostar 100 monedas", "🪙", { costs: { monedas: 100 }, checkStat: "regate", checkThreshold: 50, successChance: 0.55, successOutcome: { description: "¡Ganaste el doble!", resourceChanges: { monedas: 200, moral: 10 } }, failureOutcome: { description: "Perdiste la apuesta.", resourceChanges: { moral: -10 } }, tags: ["riesgo"] }),
    ch("ch_gratis", "Jugar gratis", "⚽", { successOutcome: { description: "Jugaste un buen picado.", resourceChanges: { moral: 5 }, xpGain: 15 }, tags: ["safe"] }),
  ]),
  evt("evt_cancha_inundada", "Cancha Inundada", "Llovió toda la noche y la cancha es un barrial.", "random", ["ambiente"], [
    ch("ch_jugar_barro", "Jugar igual", "💪", { checkStat: "fisico", checkThreshold: 55, successChance: 0.5, successOutcome: { description: "Aguantás el barro como un guerrero.", resourceChanges: { moral: 10 }, xpGain: 25 }, failureOutcome: { description: "Resbalás y te lastimás.", resourceChanges: { energia: -25 } }, tags: ["fisico"] }),
    ch("ch_esperar", "Esperar que baje el agua", "⏳", { successOutcome: { description: "Perdés tiempo pero cuidás el cuerpo.", resourceChanges: { energia: -15 } }, tags: ["safe"] }),
  ]),
  evt("evt_periodista", "Periodista del Barrio", "Un periodista local quiere una nota.", "random", ["fama"], [
    ch("ch_dar_nota", "Dar la nota", "🎤", { checkStat: "pase", checkThreshold: 45, successChance: 0.75, successOutcome: { description: "Salís en el diario local.", resourceChanges: { fama: 20 } }, failureOutcome: { description: "Dijiste algo raro y te critican.", resourceChanges: { fama: -5, moral: -5 } }, tags: ["fama"] }),
    ch("ch_rechazar_nota", "Rechazar", "✋", { successOutcome: { description: "Preferís el bajo perfil.", resourceChanges: {} }, tags: ["safe"] }),
  ]),
  evt("evt_vecino", "Vecino Enojado", "El vecino de la cancha está furioso por el ruido.", "random", ["humor"], [
    ch("ch_disculparse", "Pedir disculpas", "😅", { successOutcome: { description: "Se calma. Crisis evitada.", resourceChanges: { moral: -5 } }, tags: ["safe"] }),
    ch("ch_seguir", "Seguir jugando", "🤷", { successChance: 0.6, successOutcome: { description: "Se fue murmurando. Dale que va.", resourceChanges: {} }, failureOutcome: { description: "Llamó a la policía y cerraron la cancha.", resourceChanges: { moral: -15, energia: -10 } }, tags: ["riesgo"] }),
  ]),
  evt("evt_perro", "Perro en la Cancha", "Un perro entra a la cancha y roba la pelota.", "random", ["humor"], [
    ch("ch_sacar_perro", "Sacar al perro", "🐕", { successOutcome: { description: "Lo sacás pero estás cansado.", resourceChanges: { energia: -5 } }, tags: ["safe"] }),
    ch("ch_jugar_perro", "Jugar con el perro", "🎾", { successChance: 0.7, successOutcome: { description: "El perro es crack. Todos se ríen.", resourceChanges: { moral: 10 }, xpGain: 10 }, failureOutcome: { description: "Tropezás con el perro.", resourceChanges: { energia: -15 } }, tags: ["humor"] }),
  ]),
  evt("evt_camiseta", "Camiseta Prestada", "Olvidaste la camiseta y tenés que pedir una.", "random", ["equipo"], [
    ch("ch_comprar_cam", "Comprar nueva", "👕", { costs: { monedas: 30 }, successOutcome: { description: "Camiseta nueva, mentalidad nueva.", resourceChanges: { moral: 10 } }, tags: ["compra"] }),
    ch("ch_prestada", "Usar prestada", "🤝", { successOutcome: { description: "Te queda grande pero jugás igual.", resourceChanges: {} }, tags: ["safe"] }),
  ]),
  evt("evt_asado", "Asado Post-Partido", "Los pibes organizan un asado.", "random", ["social"], [
    ch("ch_ir_asado", "Ir al asado", "🥩", { successOutcome: { description: "Carne, fernet y risas. Noche épica.", resourceChanges: { energia: -10, moral: 20 } }, tags: ["social"] }),
    ch("ch_entrenar", "Quedarte a entrenar", "🏋️", { successOutcome: { description: "Ganás XP pero te perdés la juntada.", resourceChanges: { moral: -5 }, xpGain: 30 }, tags: ["disciplina"] }),
  ]),
  // Pool Profesional (12)
  evt("evt_conferencia", "Conferencia de Prensa", "Tenés que hablar con la prensa.", "random", ["social", "profesional"], [
    ch("ch_picante", "Declaraciones picantes", "🌶️", { successChance: 0.5, successOutcome: { description: "Trending topic. La gente te banca.", resourceChanges: { fama: 30, moral: 10 } }, failureOutcome: { description: "Te fue mal. La prensa te destruye.", resourceChanges: { moral: -20, fama: -10 } }, tags: ["riesgo"] }),
    ch("ch_diplomatico", "Ser diplomático", "🤝", { successOutcome: { description: "Respuestas correctas, nadie enojado.", resourceChanges: { fama: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_transferencia", "Oferta de Transferencia", "Un club quiere comprar a un jugador de tu plantel.", "random", ["decision", "economia"], [
    ch("ch_aceptar_trans", "Aceptar oferta", "💰", { successOutcome: { description: "Vendiste un jugador por buena plata.", resourceChanges: { monedas: 500, moral: -10 } }, tags: ["economia"] }),
    ch("ch_rechazar_trans", "Rechazar", "🚫", { successOutcome: { description: "El equipo se mantiene unido.", resourceChanges: { moral: 10 } }, tags: ["lealtad"] }),
  ]),
  evt("evt_doping", "Control Antidoping", "Vienen de la AFA a hacer controles.", "random", ["random", "profesional"], [
    ch("ch_control_ok", "Hacerte el control", "🧪", { checkStat: "fisico", checkThreshold: 50, successChance: 0.8, successOutcome: { description: "Todo limpio. Seguís.", resourceChanges: {} }, failureOutcome: { description: "Resultado dudoso. Suspensión temporal.", resourceChanges: { energia: -30, moral: -15 } }, tags: ["random"] }),
  ]),
  evt("evt_entrenamiento_esp", "Entrenamiento Especial", "Hay un coach visitante que ofrece training.", "random", ["mejora"], [
    ch("ch_pagar_coach", "Pagar coach premium", "💰", { costs: { monedas: 150 }, successOutcome: { description: "Entrenamiento top. Mejorás mucho.", resourceChanges: { moral: 5 }, xpGain: 60 }, tags: ["mejora"] }),
    ch("ch_solo", "Entrenar solo", "🏃", { successOutcome: { description: "Entrenás a tu ritmo.", resourceChanges: { energia: -15 }, xpGain: 25 }, tags: ["disciplina"] }),
  ]),
  evt("evt_companero_lesion", "Compañero Lesionado", "Tu mejor compañero se lesiona antes del partido.", "random", ["equipo"], [
    ch("ch_cubrir", "Cubrir su posición", "💪", { successOutcome: { description: "Jugás en otra posición y ganás XP extra.", resourceChanges: { energia: -10 }, xpGain: 40 }, tags: ["equipo"] }),
    ch("ch_refuerzo", "Pedir refuerzo temporal", "📋", { costs: { monedas: 80 }, successOutcome: { description: "Un juvenil sale a cubrir.", resourceChanges: { moral: -5 } }, tags: ["safe"] }),
  ]),
  evt("evt_sponsor", "Contrato de Sponsor", "Una marca te quiere como imagen.", "random", ["economia"], [
    ch("ch_aceptar_sp", "Aceptar", "💼", { successOutcome: { description: "Plata fácil pero te critican.", resourceChanges: { monedas: 300, fama: -10 } }, tags: ["economia"] }),
    ch("ch_rechazar_sp", "Rechazar", "✋", { successOutcome: { description: "Mantenés tu imagen limpia.", resourceChanges: { fama: 10, moral: 5 } }, tags: ["integridad"] }),
  ]),
  evt("evt_pelea_dt", "Pelea con el DT", "El director técnico te deja en el banco.", "random", ["social", "conflicto"], [
    ch("ch_disculparse_dt", "Disculparse", "😔", { successOutcome: { description: "Volvés al equipo, cabeza gacha.", resourceChanges: { moral: -10 } }, tags: ["safe"] }),
    ch("ch_plantarse", "Plantarte", "💥", { successChance: 0.4, successOutcome: { description: "Te bancó el grupo. Volvés como titular.", resourceChanges: { moral: 15, fama: 10 } }, failureOutcome: { description: "Te mandan a la reserva.", resourceChanges: { moral: -25, fama: -10 } }, tags: ["riesgo"] }),
  ]),
  evt("evt_altura", "Viaje en Altura", "Partido en La Paz, 3600m sobre el nivel del mar.", "random", ["ambiente"], [
    ch("ch_aclimatarse", "Aclimatarse un día antes", "🏔️", { successOutcome: { description: "El cuerpo se adapta.", resourceChanges: { energia: -20 } }, tags: ["safe"] }),
    ch("ch_jugar_toque", "Jugar de una", "⚡", { successChance: 0.4, successOutcome: { description: "Aguantaste. La altura no pudo.", resourceChanges: { moral: 15 }, xpGain: 20 }, failureOutcome: { description: "No podés ni respirar.", resourceChanges: { energia: -35, moral: -10 } }, tags: ["riesgo"] }),
  ]),
  evt("evt_hinchada", "Hinchada Hostil", "40.000 personas en contra tuyo.", "random", ["presión"], [
    ch("ch_mentalizar", "Concentrarte al máximo", "🧠", { checkStat: "posicion", checkThreshold: 60, successChance: 0.6, successOutcome: { description: "El ruido no te afecta.", resourceChanges: { moral: 15, fama: 10 }, xpGain: 20 }, failureOutcome: { description: "La presión te come.", resourceChanges: { moral: -15 } }, tags: ["mental"] }),
    ch("ch_tapones", "Tapones de oído", "🔇", { successOutcome: { description: "No escuchás nada. Ni lo bueno ni lo malo.", resourceChanges: { moral: -5 } }, tags: ["safe"] }),
  ]),
  evt("evt_botines", "Compra de Botines", "Pasás por la tienda de deportes.", "random", ["item"], [
    ch("ch_premium", "Botines premium", "👟", { costs: { monedas: 200 }, successOutcome: { description: "Botines de crack. Te sentís volando.", resourceChanges: { moral: 10 }, xpGain: 15 }, tags: ["compra"] }),
    ch("ch_basicos", "Botines básicos", "👞", { costs: { monedas: 30 }, successOutcome: { description: "Cumplen su función.", resourceChanges: {} }, tags: ["ahorro"] }),
  ]),
  evt("evt_juvenil_consejo", "Juvenil Pide Consejo", "Un pibe de inferiores te busca para que lo guíes.", "random", ["social"], [
    ch("ch_mentorear", "Mentorearlo", "🎓", { successOutcome: { description: "Le enseñás todo. Te sentís bien.", resourceChanges: { energia: -10, moral: 10 }, xpGain: 20 }, tags: ["social"] }),
    ch("ch_ignorar_juv", "Ignorarlo", "😐", { successOutcome: { description: "Cada uno por su lado.", resourceChanges: {} }, tags: ["safe"] }),
  ]),
  evt("evt_amistoso", "Partido Amistoso", "Te invitan a un amistoso internacional.", "random", ["oportunidad"], [
    ch("ch_jugar_amist", "Jugar", "⚽", { successChance: 0.7, successOutcome: { description: "Buen partido. Ganás experiencia.", resourceChanges: { energia: -15, fama: 10 }, xpGain: 40 }, failureOutcome: { description: "Te lesionás en un amistoso...", resourceChanges: { energia: -30, moral: -10 } }, tags: ["riesgo"] }),
    ch("ch_descansar_amist", "Descansar", "🛋️", { successOutcome: { description: "Descansás para lo que importa.", resourceChanges: { energia: 20 } }, tags: ["safe"] }),
  ]),
  // Pool Elite (10)
  evt("evt_balon_oro", "Nominación al Balón de Oro", "Te nominan al mejor jugador del mundo.", "random", ["prestigio"], [
    ch("ch_ir_gala", "Ir a la gala", "🏆", { successOutcome: { description: "Noche inolvidable. El mundo te conoce.", resourceChanges: { energia: -15, fama: 50, moral: 15 } }, tags: ["prestigio"] }),
    ch("ch_concentrarse", "Concentrarte en el equipo", "🎯", { successOutcome: { description: "La prensa te critica pero el vestuario te respeta.", resourceChanges: { moral: 10 } }, tags: ["equipo"] }),
  ]),
  evt("evt_escandalo", "Escándalo Mediático", "La prensa publica algo sobre tu vida privada.", "random", ["crisis"], [
    ch("ch_enfrentar", "Enfrentar a la prensa", "📺", { successChance: 0.5, successOutcome: { description: "Aclaraste todo. La gente te banca más.", resourceChanges: { fama: 15, moral: 10 } }, failureOutcome: { description: "Empeoraste todo.", resourceChanges: { moral: -25, fama: -15 } }, tags: ["riesgo"] }),
    ch("ch_silencio", "Silencio total", "🤫", { successOutcome: { description: "Pasa de moda en unos días.", resourceChanges: { fama: -10 } }, tags: ["safe"] }),
  ]),
  evt("evt_derbi", "Derbi Histórico", "El partido del año. Todo el país mira.", "random", ["presión", "élite"], [
    ch("ch_motivar_equipo", "Motivar al equipo", "📢", { checkStat: "pase", checkThreshold: 70, successChance: 0.6, successOutcome: { description: "El equipo juega como nunca.", resourceChanges: { moral: 20 }, xpGain: 30 }, failureOutcome: { description: "No te escucharon.", resourceChanges: { moral: -10 } }, tags: ["liderazgo"] }),
    ch("ch_foco_ind", "Foco individual", "🎯", { successOutcome: { description: "Jugás tu partido. Rendís bien.", resourceChanges: { moral: 5 }, xpGain: 20 }, tags: ["safe"] }),
  ]),
  evt("evt_lesion_grave", "Lesión Grave", "Cruzado roto. La peor noticia.", "random", ["crisis"], [
    ch("ch_cirugia", "Cirugía y recuperación", "🏥", { costs: { monedas: 300 }, successOutcome: { description: "Operación exitosa. Volvés más fuerte.", resourceChanges: { energia: -40, moral: -15 }, xpGain: 20 }, tags: ["crisis"] }),
    ch("ch_tratamiento", "Tratamiento conservador", "💊", { successChance: 0.5, successOutcome: { description: "Te recuperás sin cirugía.", resourceChanges: { energia: 20, moral: 10 } }, failureOutcome: { description: "No funcionó. Necesitás cirugía igual.", resourceChanges: { energia: -50, moral: -25, monedas: -200 } }, tags: ["riesgo"] }),
  ]),
  evt("evt_oferta_jeque", "Oferta del Jeque", "Un club árabe te ofrece fortunas.", "random", ["tentación"], [
    ch("ch_aceptar_jeque", "Aceptar la oferta", "💰", { successOutcome: { description: "Sos millonario. Pero el vestuario te mira raro.", resourceChanges: { monedas: 1000, moral: -30, fama: -20 } }, tags: ["dinero"] }),
    ch("ch_lealtad", "Quedarte por lealtad", "❤️", { successOutcome: { description: "La hinchada te ama. Sos ídolo.", resourceChanges: { moral: 25, fama: 20 } }, tags: ["lealtad"] }),
  ]),
  evt("evt_var", "Gol Fantasma (VAR)", "Te anulan un gol clarísimo.", "random", ["injusticia"], [
    ch("ch_protestar", "Protestar al árbitro", "🟨", { successChance: 0.3, successOutcome: { description: "El árbitro revisa y da el gol.", resourceChanges: { moral: 20, fama: 10 } }, failureOutcome: { description: "Amarilla. Seguí jugando.", resourceChanges: { moral: -15 } }, tags: ["riesgo"] }),
    ch("ch_aceptar_var", "Aceptar y seguir", "😤", { successOutcome: { description: "Injusto pero profesional.", resourceChanges: { moral: -10 } }, tags: ["safe"] }),
  ]),
  evt("evt_charla_leyenda", "Charla con una Leyenda", "Un ídolo retirado te invita a charlar.", "random", ["inspiración"], [
    ch("ch_escuchar", "Escuchar su consejo", "👂", { successOutcome: { description: "Sus palabras te inspiran profundamente.", resourceChanges: { moral: 25, fama: 5 }, xpGain: 30 }, tags: ["inspiración"] }),
    ch("ch_pedir_training", "Pedir que te entrene", "🏋️", { successOutcome: { description: "Un entrenamiento de leyenda.", resourceChanges: { energia: -20 }, xpGain: 60 }, tags: ["mejora"] }),
  ]),
  evt("evt_final_lluvia", "Final Bajo Lluvia", "Llueve a cántaros para la final.", "random", ["ambiente", "élite"], [
    ch("ch_adaptar", "Adaptar la táctica", "🧠", { checkStat: "pase", checkThreshold: 65, successChance: 0.6, successOutcome: { description: "Jugás a ras de piso. Funciona.", resourceChanges: { moral: 15 }, xpGain: 25 }, failureOutcome: { description: "El cambio confunde al equipo.", resourceChanges: { moral: -10 } }, tags: ["táctica"] }),
    ch("ch_jugar_igual_ll", "Jugar como siempre", "🌧️", { successOutcome: { description: "Te la bancás bajo la lluvia.", resourceChanges: { energia: -10 } }, tags: ["safe"] }),
  ]),
  evt("evt_agente", "Agente Insistente", "Tu representante quiere cambiar de agencia.", "random", ["economía"], [
    ch("ch_cambiar_agente", "Cambiar de agente", "📝", { costs: { monedas: 200 }, successOutcome: { description: "Nuevo agente, mejores negocios.", resourceChanges: { monedas: 100, fama: 10 } }, tags: ["inversión"] }),
    ch("ch_quedarse_agente", "Quedarte con el actual", "🤝", { successOutcome: { description: "Confiás en tu gente.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_concentracion", "Concentración Pre-Final", "El DT propone concentración total.", "random", ["equipo", "élite"], [
    ch("ch_concentracion", "Concentración total", "🏨", { successOutcome: { description: "Equipo unido y enfocado.", resourceChanges: { energia: -15, moral: 25 } }, tags: ["disciplina"] }),
    ch("ch_salida_libre", "Pedir salida libre", "🌃", { successChance: 0.5, successOutcome: { description: "Descansás a tu manera. Te sentís bien.", resourceChanges: { energia: 10, moral: 5 } }, failureOutcome: { description: "Volvés tarde y el DT te banca.", resourceChanges: { moral: -15 } }, tags: ["riesgo"] }),
  ]),
  // Pool Mundial (10)
  evt("evt_sorteo", "Sorteo del Mundial", "Los grupos se definen.", "random", ["destino"], [
    ch("ch_destino", "Esperar el sorteo", "🎱", { successChance: 0.5, successOutcome: { description: "¡Grupo fácil! Rivales accesibles.", resourceChanges: { moral: 15 } }, failureOutcome: { description: "Grupo de la muerte. Francia, Brasil y Alemania.", resourceChanges: { moral: -10 } }, tags: ["random"] }),
  ]),
  evt("evt_himno", "Himno Nacional", "Suena el himno antes del partido.", "random", ["motivación", "mundial"], [
    ch("ch_cantar", "Cantar con todo", "🎵", { successOutcome: { description: "Se te pone la piel de gallina. Estás listo.", resourceChanges: { moral: 25 } }, tags: ["pasión"] }),
    ch("ch_concentrar_himno", "Concentrarte en silencio", "🧘", { successOutcome: { description: "Foco absoluto. Mente clara.", resourceChanges: { energia: 10 } }, tags: ["mental"] }),
  ]),
  evt("evt_lesion_estrella", "Lesión de tu Estrella", "Tu mejor jugador se lesiona en la previa.", "random", ["crisis", "mundial"], [
    ch("ch_arriesgar", "Arriesgarlo", "🎲", { successChance: 0.5, successOutcome: { description: "Aguanta y juega. Es un guerrero.", resourceChanges: { moral: 20 }, xpGain: 30 }, failureOutcome: { description: "Se rompe. Perdés a tu mejor jugador.", resourceChanges: { moral: -30 } }, tags: ["riesgo"] }),
    ch("ch_preservar", "Preservarlo", "🛡️", { successOutcome: { description: "Lo cuidas para más adelante.", resourceChanges: { moral: -10 } }, tags: ["safe"] }),
  ]),
  evt("evt_documental", "Documental sobre tu Carrera", "Netflix te propone un documental.", "random", ["fama", "mundial"], [
    ch("ch_participar_doc", "Participar", "🎬", { successOutcome: { description: "El mundo conoce tu historia.", resourceChanges: { fama: 40, energia: -15 } }, tags: ["fama"] }),
    ch("ch_declinar_doc", "Declinar", "✋", { successOutcome: { description: "Te enfocás en lo que importa.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_llamada_casa", "Llamada de Casa", "Tu vieja te llama antes del partido más importante.", "random", ["emocional", "mundial"], [
    ch("ch_atender", "Atender", "📱", { successOutcome: { description: "Escuchar su voz te llena de fuerza.", resourceChanges: { moral: 15 } }, tags: ["familia"] }),
    ch("ch_no_molestar", "No molestar", "🔕", { successOutcome: { description: "Te enfocás. Ya la vas a llamar después.", resourceChanges: { energia: 10 } }, tags: ["foco"] }),
  ]),
  evt("evt_presion_pte", "Presión del Presidente", "El presidente de la AFA te presiona.", "random", ["presión", "mundial"], [
    ch("ch_aceptar_presion", "Aceptar la presión", "😤", { successOutcome: { description: "Te motivás con rabia.", resourceChanges: { moral: -15 }, xpGain: 40 }, tags: ["presión"] }),
    ch("ch_mandar_volar", "Mandarlo a volar", "💥", { successChance: 0.4, successOutcome: { description: "El vestuario te aplaude.", resourceChanges: { moral: 20 } }, failureOutcome: { description: "Te deja en el banco.", resourceChanges: { moral: -20, fama: -10 } }, tags: ["riesgo"] }),
  ]),
  evt("evt_penales_ent", "Penales de Entrenamiento", "El DT quiere practicar penales.", "random", ["mejora", "mundial"], [
    ch("ch_practicar_pen", "Practicar", "⚽", { successOutcome: { description: "Pateás 10, metés 8. Confianza alta.", resourceChanges: { energia: -10, moral: 10 }, xpGain: 20 }, tags: ["mejora"] }),
    ch("ch_descansar_pen", "Descansar", "💤", { successOutcome: { description: "Guardás energía para el partido.", resourceChanges: { energia: 15 } }, tags: ["safe"] }),
  ]),
  evt("evt_formacion", "Cambio de Formación", "El DT quiere cambiar la táctica.", "random", ["táctica", "mundial"], [
    ch("ch_cambiar_form", "Aceptar el cambio", "📋", { successChance: 0.6, successOutcome: { description: "La nueva formación funciona mejor.", resourceChanges: { moral: 15 }, xpGain: 25 }, failureOutcome: { description: "Todos confundidos. Sale mal.", resourceChanges: { moral: -15 } }, tags: ["táctica"] }),
    ch("ch_mantener_form", "Mantener la actual", "✋", { successOutcome: { description: "Lo conocido es lo seguro.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_ultimo_baile", "Último Baile", "Pensás en anunciar tu retiro después del mundial.", "random", ["emocional", "mundial"], [
    ch("ch_anunciar", "Anunciar retiro", "👋", { successOutcome: { description: "El equipo juega por vos. Rendimiento máximo.", resourceChanges: { moral: 30, fama: 25 }, xpGain: 50 }, tags: ["emocional"] }),
    ch("ch_seguir_jugando", "Seguir jugando", "💪", { successOutcome: { description: "Todavía hay cuerda para rato.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_cena_rivales", "Cena con Rivales", "Te invitan a cenar con jugadores del rival.", "random", ["social", "mundial"], [
    ch("ch_ir_cena", "Ir a la cena", "🍽️", { successOutcome: { description: "Sacás info del rival. Ventaja táctica.", resourceChanges: { moral: 5, fama: 5 }, xpGain: 15 }, tags: ["scouting"] }),
    ch("ch_no_ir_cena", "No ir", "🚫", { successOutcome: { description: "No fraternizar con el enemigo.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),

  // ─── NEW EVENTS: Pool Potrero (+10) ─────────────────────────────────
  evt("evt_gol_olimpico", "Gol Olímpico", "Tirás un córner y la pelota se mete directo.", "random", ["barrio", "lujo"], [
    ch("ch_festejar", "Festejar como loco", "🎉", { successOutcome: { description: "¡Golazo olímpico! Leyenda del potrero.", resourceChanges: { fama: 15, moral: 15 }, xpGain: 25 }, tags: ["festejo"] }),
    ch("ch_hacerse_el_humilde", "Hacerte el humilde", "😌", { successOutcome: { description: "Lo hiciste parecer fácil.", resourceChanges: { moral: 10 }, xpGain: 15 }, tags: ["safe"] }),
  ]),
  evt("evt_cancha_prestada", "Cancha Prestada", "Les prestan una cancha de sintético.", "random", ["barrio"], [
    ch("ch_jugar_sint", "Jugar en el sintético", "🏟️", { successOutcome: { description: "Pique rápido. Te sentís crack.", resourceChanges: { moral: 10, energia: -5 }, xpGain: 20 }, tags: ["cancha"] }),
    ch("ch_prefiero_tierra", "Preferir la tierra", "🌍", { successOutcome: { description: "El potrero es el potrero.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_mate_cancha", "Mate en la Cancha", "Alguien lleva un termo y mate al partido.", "random", ["social", "barrio"], [
    ch("ch_tomar_mate", "Tomar mate", "🧉", { successOutcome: { description: "Mate amargo y fútbol. La vida.", resourceChanges: { energia: 10, moral: 10 } }, tags: ["social"] }),
    ch("ch_calentar", "Ir a calentar", "🏃", { successOutcome: { description: "Entrás en calor más rápido.", resourceChanges: { energia: -5 }, xpGain: 10 }, tags: ["disciplina"] }),
  ]),
  evt("evt_pibe_crack", "El Pibe Crack", "Un nene de 10 años te hace un caño.", "random", ["humor", "barrio"], [
    ch("ch_aplaudir_pibe", "Aplaudirlo", "👏", { successOutcome: { description: "Le reconocés el talento. El pibe te idolatra.", resourceChanges: { moral: 10 } }, tags: ["social"] }),
    ch("ch_revancha", "Pedir revancha", "🔥", { checkStat: "regate", checkThreshold: 60, successChance: 0.5, successOutcome: { description: "Le devolvés el caño. Empate técnico.", resourceChanges: { moral: 10 }, xpGain: 15 }, failureOutcome: { description: "Te hace otro caño. Los pibes se ríen.", resourceChanges: { moral: -10 } }, tags: ["regate"] }),
  ]),
  evt("evt_apagon", "Apagón en la Cancha", "Se cortó la luz y no se ve nada.", "random", ["ambiente", "barrio"], [
    ch("ch_luces_autos", "Pedir luces de autos", "🚗", { successChance: 0.6, successOutcome: { description: "Estacionan los autos y alumbran. Se juega.", resourceChanges: { moral: 5 }, xpGain: 10 }, failureOutcome: { description: "Nadie tiene auto. Se suspende.", resourceChanges: { moral: -10 } }, tags: ["ingenio"] }),
    ch("ch_irse", "Irse a casa", "🏠", { successOutcome: { description: "Mañana será otro día.", resourceChanges: {} }, tags: ["safe"] }),
  ]),
  evt("evt_torneo_relampago", "Torneo Relámpago", "Organizan un torneo de 4 equipos en la plaza.", "random", ["barrio", "competencia"], [
    ch("ch_inscribirse", "Inscribirse", "📝", { costs: { monedas: 50 }, checkStat: "fisico", checkThreshold: 50, successChance: 0.6, successOutcome: { description: "¡Campeones! Premio doble.", resourceChanges: { monedas: 150, moral: 15 }, xpGain: 35 }, failureOutcome: { description: "Perdiste en semifinal.", resourceChanges: { moral: -5 } }, tags: ["competencia"] }),
    ch("ch_mirar", "Quedarte a mirar", "👀", { successOutcome: { description: "Viste jugadas que podés copiar.", xpGain: 10 }, tags: ["safe"] }),
  ]),
  evt("evt_lluvia_repentina", "Lluvia Repentina", "Arranca a llover en medio del partido.", "random", ["ambiente", "barrio"], [
    ch("ch_seguir_lluvia", "Seguir jugando", "🌧️", { checkStat: "fisico", checkThreshold: 45, successChance: 0.7, successOutcome: { description: "El barro no te para.", resourceChanges: { moral: 10 }, xpGain: 20 }, failureOutcome: { description: "Resbalás y te embarrás entero.", resourceChanges: { energia: -15 } }, tags: ["fisico"] }),
    ch("ch_refugio", "Ir al refugio", "🏠", { successOutcome: { description: "Esperás que pare. Perdés tiempo.", resourceChanges: { energia: -5 } }, tags: ["safe"] }),
  ]),
  evt("evt_goleada", "Goleada en el Potrero", "Tu equipo va ganando 5-0.", "random", ["barrio", "humor"], [
    ch("ch_showtime", "Hacer lujos", "✨", { checkStat: "regate", checkThreshold: 55, successChance: 0.7, successOutcome: { description: "Rabona, caño, sombrero. Sos un artista.", resourceChanges: { fama: 10, moral: 10 }, xpGain: 20 }, failureOutcome: { description: "Te la sacaron y te putearon.", resourceChanges: { moral: -10 } }, tags: ["lujo"] }),
    ch("ch_respetar", "Jugar con respeto", "🤝", { successOutcome: { description: "Fair play. Bien visto.", resourceChanges: { moral: 10 } }, tags: ["safe"] }),
  ]),
  evt("evt_vieja_tribuna", "Tu Vieja en la Tribuna", "Tu mamá vino a verte jugar.", "random", ["familia", "barrio"], [
    ch("ch_dedicar_gol", "Dedicarle un gol", "❤️", { checkStat: "tiro", checkThreshold: 50, successChance: 0.6, successOutcome: { description: "Gol y abrazo. Se le caen las lágrimas.", resourceChanges: { moral: 25, fama: 5 }, xpGain: 20 }, failureOutcome: { description: "No metiste gol pero ella te banca igual.", resourceChanges: { moral: 5 } }, tags: ["familia"] }),
    ch("ch_jugar_tranqui", "Jugar tranquilo", "😊", { successOutcome: { description: "Buen partido. Después la invitás a comer.", resourceChanges: { moral: 10 } }, tags: ["safe"] }),
  ]),
  evt("evt_pelota_pinchada", "Pelota Pinchada", "La única pelota se pinchó.", "random", ["barrio", "problema"], [
    ch("ch_comprar_pelota", "Comprar una nueva", "💸", { costs: { monedas: 40 }, successOutcome: { description: "Pelota nueva. Se sigue.", resourceChanges: { moral: 5 } }, tags: ["compra"] }),
    ch("ch_parchar", "Intentar parcharla", "🔧", { successChance: 0.5, successOutcome: { description: "Aguanta un rato más.", resourceChanges: {} }, failureOutcome: { description: "No hay arreglo. Se suspende.", resourceChanges: { moral: -10 } }, tags: ["ingenio"] }),
  ]),

  // ─── NEW EVENTS: Pool Profesional (+10) ─────────────────────────────
  evt("evt_pretemporada", "Pretemporada Intensiva", "El cuerpo técnico preparó una pretemporada durísima.", "random", ["mejora", "profesional"], [
    ch("ch_dar_todo", "Dar todo", "💪", { successOutcome: { description: "Terminas destruido pero más fuerte.", resourceChanges: { energia: -30 }, xpGain: 50 }, tags: ["disciplina"] }),
    ch("ch_dosificar", "Dosificar el esfuerzo", "🐢", { successOutcome: { description: "Guardás energía pero no impresionás.", resourceChanges: { energia: -10 }, xpGain: 20 }, tags: ["safe"] }),
  ]),
  evt("evt_redes_sociales", "Escándalo en Redes", "Se viraliza un video tuyo en la cancha.", "random", ["fama", "profesional"], [
    ch("ch_aprovechar", "Aprovecharlo", "📱", { successChance: 0.6, successOutcome: { description: "Tu marca personal creció. Más seguidores.", resourceChanges: { fama: 25, monedas: 100 } }, failureOutcome: { description: "Se burlaron y se hizo meme.", resourceChanges: { moral: -15, fama: -10 } }, tags: ["riesgo"] }),
    ch("ch_borrar_redes", "Desactivar redes", "🚫", { successOutcome: { description: "Paz mental. Sin redes unos días.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_cancha_nueva", "Cancha Nueva", "El club inauguró estadio nuevo.", "random", ["equipo", "profesional"], [
    ch("ch_primer_gol", "Buscar el primer gol del estadio", "⚽", { checkStat: "tiro", checkThreshold: 60, successChance: 0.5, successOutcome: { description: "¡Primer gol en el estadio nuevo! Sos historia.", resourceChanges: { fama: 30, moral: 20 }, xpGain: 30 }, failureOutcome: { description: "Otro lo metió primero.", resourceChanges: { moral: -5 } }, tags: ["tiro"] }),
    ch("ch_disfrutar_cancha", "Disfrutar el momento", "🏟️", { successOutcome: { description: "Inauguración hermosa. Buena energía.", resourceChanges: { moral: 15 } }, tags: ["safe"] }),
  ]),
  evt("evt_nutricionista", "Consulta con Nutricionista", "El club contrata un nutricionista.", "random", ["salud", "profesional"], [
    ch("ch_dieta_estricta", "Seguir la dieta al pie", "🥗", { successOutcome: { description: "Te sentís liviano y rápido.", resourceChanges: { energia: 20, moral: -5 } }, tags: ["disciplina"] }),
    ch("ch_milanesa", "Seguir comiendo milanesas", "🍖", { successOutcome: { description: "La milanesa es sagrada.", resourceChanges: { moral: 10 } }, tags: ["safe"] }),
  ]),
  evt("evt_simulacion", "Simulación Táctica", "El DT pone videos del rival para analizar.", "random", ["táctica", "profesional"], [
    ch("ch_estudiar", "Estudiar al rival", "📊", { successOutcome: { description: "Conocés todas sus debilidades.", resourceChanges: { energia: -10, moral: 10 }, xpGain: 30 }, tags: ["táctica"] }),
    ch("ch_instinto", "Confiar en tu instinto", "⚡", { successOutcome: { description: "Improvisación pura. A veces funciona.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_capitan", "Te Eligen Capitán", "Los compañeros te votan como capitán.", "random", ["liderazgo", "profesional"], [
    ch("ch_aceptar_cinta", "Aceptar la cinta", "©️", { successOutcome: { description: "Orgullo enorme. Más responsabilidad.", resourceChanges: { moral: 20, fama: 10 }, xpGain: 20 }, tags: ["liderazgo"] }),
    ch("ch_declinar_cinta", "Declinar", "🤲", { successOutcome: { description: "Le dejás la cinta a otro. Humildad.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_masajista", "Sesión con el Masajista", "El masajista del club te atiende.", "random", ["salud", "profesional"], [
    ch("ch_masaje_profundo", "Masaje profundo", "💆", { successOutcome: { description: "Dolió pero te sentís nuevo.", resourceChanges: { energia: 25 }, healParty: 30 }, tags: ["recuperación"] }),
    ch("ch_masaje_suave", "Masaje suave", "🧘", { successOutcome: { description: "Relax total.", resourceChanges: { energia: 10, moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_camara_vestuario", "Cámara en el Vestuario", "Un camarógrafo quiere filmar la previa.", "random", ["fama", "profesional"], [
    ch("ch_permitir_cam", "Permitir la cámara", "🎥", { successChance: 0.6, successOutcome: { description: "El video se hace viral. Buena imagen.", resourceChanges: { fama: 20 } }, failureOutcome: { description: "Grabaron una pelea. Mala prensa.", resourceChanges: { fama: -15, moral: -10 } }, tags: ["riesgo"] }),
    ch("ch_prohibir_cam", "Prohibir la cámara", "🚫", { successOutcome: { description: "Lo que pasa en el vestuario, queda en el vestuario.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_debut_seleccion", "Debut en la Selección", "Te convocan para la selección nacional.", "random", ["oportunidad", "profesional"], [
    ch("ch_ir_seleccion", "Ir a la selección", "🇦🇷", { successOutcome: { description: "Debut soñado. Cantás el himno.", resourceChanges: { fama: 30, moral: 20, energia: -15 }, xpGain: 40 }, tags: ["selección"] }),
    ch("ch_foco_club", "Enfocarte en el club", "🏠", { successOutcome: { description: "Preferís crecer en el club.", resourceChanges: { moral: -5 } }, tags: ["safe"] }),
  ]),
  evt("evt_regalo_hincha", "Regalo de un Hincha", "Un hincha te trae un regalo en el entrenamiento.", "random", ["social", "profesional"], [
    ch("ch_aceptar_regalo", "Aceptar el regalo", "🎁", { successOutcome: { description: "Una carta y una foto. Te emocionás.", resourceChanges: { moral: 15 } }, tags: ["social"] }),
    ch("ch_sacarse_foto", "Sacarte una foto con el hincha", "📸", { successOutcome: { description: "Le hacés el día. La sube a redes.", resourceChanges: { fama: 10, moral: 10 } }, tags: ["social"] }),
  ]),

  // ─── NEW EVENTS: Pool Elite (+10) ───────────────────────────────────
  evt("evt_mansion", "Mudanza a la Mansión", "Te comprás tu primera mansión.", "random", ["economía", "élite"], [
    ch("ch_mansion_grande", "La mansión más grande", "🏰", { costs: { monedas: 800 }, successOutcome: { description: "Vivís como rey. Pileta, cancha y todo.", resourceChanges: { moral: 25, fama: 15 } }, tags: ["lujo"] }),
    ch("ch_depto_lindo", "Un depto lindo y punto", "🏢", { costs: { monedas: 200 }, successOutcome: { description: "Cómodo y sin ostentación.", resourceChanges: { moral: 10 } }, tags: ["ahorro"] }),
  ]),
  evt("evt_champions_anthem", "Himno de Champions", "Suena la música de Champions League.", "random", ["motivación", "élite"], [
    ch("ch_emocionarse", "Dejarte llevar por la emoción", "🎵", { successOutcome: { description: "Se te pone la piel de gallina. Jugás al 110%.", resourceChanges: { moral: 25 }, xpGain: 15 }, tags: ["emocional"] }),
    ch("ch_foco_champions", "Mantener el foco", "🎯", { successOutcome: { description: "Frío como el hielo. Concentración total.", resourceChanges: { energia: 10 } }, tags: ["safe"] }),
  ]),
  evt("evt_marca_ropa", "Contrato con Marca de Ropa", "Una marca top te quiere como modelo.", "random", ["economía", "élite"], [
    ch("ch_modelar", "Aceptar y modelar", "👔", { successOutcome: { description: "Plata y fama. Sos imagen internacional.", resourceChanges: { monedas: 400, fama: 20, energia: -15 } }, tags: ["negocio"] }),
    ch("ch_rechazar_marca", "Rechazar", "✋", { successOutcome: { description: "Te enfocás en el fútbol.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_critica_prensa", "Crítica Feroz de la Prensa", "Un periodista te destruye en TV.", "random", ["crisis", "élite"], [
    ch("ch_responder_prensa", "Responder en conferencia", "🎤", { checkStat: "pase", checkThreshold: 70, successChance: 0.5, successOutcome: { description: "Lo callaste con argumentos. Ovación.", resourceChanges: { fama: 15, moral: 15 } }, failureOutcome: { description: "Quedaste peor. Se ríen de vos.", resourceChanges: { moral: -20, fama: -10 } }, tags: ["riesgo"] }),
    ch("ch_ignorar_prensa", "Ignorar y jugar", "😤", { successOutcome: { description: "La cancha habla. Punto.", resourceChanges: { moral: -5 }, xpGain: 15 }, tags: ["safe"] }),
  ]),
  evt("evt_gol_100", "Gol Número 100", "Estás a un gol de los 100 en tu carrera.", "random", ["hito", "élite"], [
    ch("ch_buscar_gol100", "Buscar el gol a toda costa", "🔥", { checkStat: "tiro", checkThreshold: 65, successChance: 0.6, successOutcome: { description: "¡GOL 100! Festejo histórico.", resourceChanges: { fama: 40, moral: 25 }, xpGain: 40 }, failureOutcome: { description: "No pudiste. Será la próxima.", resourceChanges: { moral: -10 } }, tags: ["tiro"] }),
    ch("ch_jugar_equipo100", "Jugar para el equipo", "⚽", { successOutcome: { description: "El equipo gana. El gol llegará solo.", resourceChanges: { moral: 10 }, xpGain: 15 }, tags: ["safe"] }),
  ]),
  evt("evt_sancion_fifa", "Sanción de FIFA", "FIFA te investiga por una falta violenta.", "random", ["crisis", "élite"], [
    ch("ch_apelar", "Apelar la sanción", "📜", { costs: { monedas: 300 }, successChance: 0.5, successOutcome: { description: "Apelación exitosa. Sin sanción.", resourceChanges: { moral: 15 } }, failureOutcome: { description: "Rechazada. Perdiste plata y tiempo.", resourceChanges: { moral: -15 } }, tags: ["riesgo"] }),
    ch("ch_aceptar_sancion", "Aceptar y cumplir", "😔", { successOutcome: { description: "Cabeza gacha. Cumplís la sanción.", resourceChanges: { moral: -10, energia: -20 } }, tags: ["safe"] }),
  ]),
  evt("evt_clasico", "El Clásico", "El partido más importante del año contra el rival eterno.", "random", ["presión", "élite"], [
    ch("ch_arenga", "Dar la arenga del vestuario", "📢", { checkStat: "fisico", checkThreshold: 60, successChance: 0.6, successOutcome: { description: "El equipo sale como un volcán.", resourceChanges: { moral: 25 }, xpGain: 30 }, failureOutcome: { description: "Las palabras no alcanzan.", resourceChanges: { moral: -5 } }, tags: ["liderazgo"] }),
    ch("ch_rutina_clasico", "Tu rutina de siempre", "🔄", { successOutcome: { description: "Hacés lo que sabés. Sin sorpresas.", resourceChanges: { moral: 5 }, xpGain: 15 }, tags: ["safe"] }),
  ]),
  evt("evt_hotel_5estrellas", "Hotel 5 Estrellas", "Concentración en un hotel de lujo.", "random", ["equipo", "élite"], [
    ch("ch_spa", "Ir al spa", "🧖", { successOutcome: { description: "Relax total. Cuerpo y mente frescos.", resourceChanges: { energia: 20, moral: 10 }, healParty: 25 }, tags: ["recuperación"] }),
    ch("ch_estudiar_rival", "Estudiar videos del rival", "📺", { successOutcome: { description: "Conocés cada movimiento del rival.", resourceChanges: { energia: -10 }, xpGain: 30 }, tags: ["táctica"] }),
  ]),
  evt("evt_lesion_compañero_estrella", "Lesión del Crack", "El crack del equipo se lesiona. Ahora dependés de vos.", "random", ["responsabilidad", "élite"], [
    ch("ch_asumir_rol", "Asumir el rol de líder", "👑", { successOutcome: { description: "Te ponés el equipo al hombro.", resourceChanges: { moral: 10, fama: 15 }, xpGain: 35 }, tags: ["liderazgo"] }),
    ch("ch_pedir_refuerzo_elite", "Pedir un refuerzo", "📋", { costs: { monedas: 200 }, successOutcome: { description: "Llega un jugador de experiencia.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_ovacion", "Ovación de Pie", "Todo el estadio te aplaude de pie.", "random", ["emocional", "élite"], [
    ch("ch_agradecer", "Agradecer con aplausos", "👏", { successOutcome: { description: "Momento inolvidable. Se te caen las lágrimas.", resourceChanges: { moral: 30, fama: 20 } }, tags: ["emocional"] }),
    ch("ch_seguir_corriendo", "Seguir corriendo", "🏃", { successOutcome: { description: "El partido no terminó. A seguir.", resourceChanges: { moral: 10 }, xpGain: 10 }, tags: ["safe"] }),
  ]),

  // ─── NEW EVENTS: Pool Mundial (+10) ─────────────────────────────────
  evt("evt_fan_zone", "Fan Zone", "Te invitan a la fan zone del mundial.", "random", ["social", "mundial"], [
    ch("ch_ir_fanzone", "Ir a la fan zone", "🎪", { successOutcome: { description: "Cánticos, banderas y emoción. La fiesta del fútbol.", resourceChanges: { moral: 20, energia: -10 } }, tags: ["social"] }),
    ch("ch_descansar_fanzone", "Quedarte descansando", "🛏️", { successOutcome: { description: "Reservás energía para el partido.", resourceChanges: { energia: 15 } }, tags: ["safe"] }),
  ]),
  evt("evt_cambio_horario", "Cambio de Horario", "El partido se juega a las 2 PM con 40 grados.", "random", ["ambiente", "mundial"], [
    ch("ch_hidratarse", "Hidratarte al máximo", "💧", { successOutcome: { description: "Agua, sales, hielo. Aguantás el calor.", resourceChanges: { energia: -15, moral: 5 }, xpGain: 15 }, tags: ["disciplina"] }),
    ch("ch_quejarse_calor", "Quejarte del horario", "😡", { successOutcome: { description: "No cambia nada pero te desahogás.", resourceChanges: { moral: -5 } }, tags: ["safe"] }),
  ]),
  evt("evt_intercambio_camisetas", "Intercambio de Camisetas", "Un crack mundial te pide la camiseta.", "random", ["social", "mundial"], [
    ch("ch_intercambiar", "Intercambiar camisetas", "👕", { successOutcome: { description: "Tenés la camiseta de una leyenda. Tesoro.", resourceChanges: { moral: 20, fama: 10 } }, tags: ["social"] }),
    ch("ch_guardar_camiseta", "Guardar tu camiseta", "🏠", { successOutcome: { description: "Tu camiseta es tu identidad.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_hotel_broma", "Broma en el Hotel", "Los compañeros te hacen una broma pesada.", "random", ["humor", "mundial"], [
    ch("ch_reir_broma", "Reírte", "😂", { successOutcome: { description: "Buena onda. El grupo se relaja.", resourceChanges: { moral: 10 } }, tags: ["social"] }),
    ch("ch_venganza", "Planear venganza", "😈", { successChance: 0.7, successOutcome: { description: "Tu contraataque fue épico. Leyenda del hotel.", resourceChanges: { moral: 15 } }, failureOutcome: { description: "Te atrapó el DT. Multa.", resourceChanges: { monedas: -50, moral: -10 } }, tags: ["humor"] }),
  ]),
  evt("evt_canto_micro", "Canto en el Micro", "En el micro camino al estadio, alguien empieza a cantar.", "random", ["motivación", "mundial"], [
    ch("ch_cantar_micro", "Sumarte al canto", "🎤", { successOutcome: { description: "Todo el micro canta. Energía total.", resourceChanges: { moral: 20 } }, tags: ["pasión"] }),
    ch("ch_auriculares", "Ponerte auriculares", "🎧", { successOutcome: { description: "Tu playlist te concentra.", resourceChanges: { energia: 5, moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_penal_decisivo", "Penal Decisivo", "Definición por penales. Sos el quinto.", "random", ["presión", "mundial"], [
    ch("ch_patear_penal", "Patear al medio", "🎯", { checkStat: "tiro", checkThreshold: 65, successChance: 0.6, successOutcome: { description: "¡GOOOOL! Clasificación épica.", resourceChanges: { fama: 40, moral: 30 }, xpGain: 50 }, failureOutcome: { description: "Lo atajó. Silencio absoluto.", resourceChanges: { moral: -30, fama: -10 } }, tags: ["tiro"] }),
    ch("ch_ceder_penal", "Ceder el penal a otro", "🤲", { successChance: 0.5, successOutcome: { description: "Tu compañero la clava. Aliviado.", resourceChanges: { moral: 10 } }, failureOutcome: { description: "La erró. Debiste patear vos.", resourceChanges: { moral: -20 } }, tags: ["riesgo"] }),
  ]),
  evt("evt_sueno_copa", "Sueño con la Copa", "Soñás que levantás la copa del mundo.", "random", ["emocional", "mundial"], [
    ch("ch_buen_augurio", "Tomarlo como buen augurio", "🌟", { successOutcome: { description: "Te despertás con una energía inexplicable.", resourceChanges: { moral: 20, energia: 10 } }, tags: ["emocional"] }),
    ch("ch_solo_sueno", "Es solo un sueño", "💭", { successOutcome: { description: "Volvés a la realidad. Hay que ganarlo en la cancha.", resourceChanges: { moral: 5 } }, tags: ["safe"] }),
  ]),
  evt("evt_lesion_calentamiento", "Lesión en el Calentamiento", "Sentís un tirón en el calentamiento previo.", "random", ["crisis", "mundial"], [
    ch("ch_jugar_igual_les", "Jugar igual", "💪", { successChance: 0.5, successOutcome: { description: "Aguantás y jugás un partidazo.", resourceChanges: { moral: 15 }, xpGain: 30 }, failureOutcome: { description: "Te sacaron a los 20 minutos.", resourceChanges: { moral: -25, energia: -20 } }, tags: ["riesgo"] }),
    ch("ch_avisar_medico", "Avisar al médico", "🏥", { successOutcome: { description: "Te quedás en el banco pero cuidás el cuerpo.", resourceChanges: { moral: -10 }, healParty: 30 }, tags: ["safe"] }),
  ]),
  evt("evt_selfie_rival", "Selfie con el Rival", "Antes del partido un rival te pide una selfie.", "random", ["social", "mundial"], [
    ch("ch_selfie_si", "Sacarte la selfie", "🤳", { successOutcome: { description: "Buena onda internacional.", resourceChanges: { fama: 5, moral: 5 } }, tags: ["social"] }),
    ch("ch_selfie_no", "Rechazar", "😤", { successOutcome: { description: "Mentalidad de guerrero. No hay amigos acá.", resourceChanges: { moral: 10 } }, tags: ["safe"] }),
  ]),
  evt("evt_tercer_tiempo", "Tercer Tiempo", "Después del partido, los dos equipos se juntan.", "random", ["social", "mundial"], [
    ch("ch_quedarse_3t", "Quedarte al tercer tiempo", "🍻", { successOutcome: { description: "Charla, risas y respeto entre rivales.", resourceChanges: { moral: 15, energia: -10, fama: 5 } }, tags: ["social"] }),
    ch("ch_irse_3t", "Irte al hotel", "🚌", { successOutcome: { description: "Descanso directo. Mañana hay otro partido.", resourceChanges: { energia: 10 } }, tags: ["safe"] }),
  ]),
];

// ─── EVENT POOLS ────────────────────────────────────────────────────────

const EVENT_POOLS = [
  {
    id: "pool_potrero", name: "Eventos del Potrero",
    events: [
      { eventId: "evt_ojeador", weight: 2, conditions: [] },
      { eventId: "evt_lesion", weight: 3, conditions: [] },
      { eventId: "evt_vestuario", weight: 2, conditions: [] },
      { eventId: "evt_picado_apuesta", weight: 3, conditions: [] },
      { eventId: "evt_cancha_inundada", weight: 2, conditions: [] },
      { eventId: "evt_periodista", weight: 2, conditions: [] },
      { eventId: "evt_vecino", weight: 2, conditions: [] },
      { eventId: "evt_perro", weight: 2, conditions: [] },
      { eventId: "evt_camiseta", weight: 2, conditions: [] },
      { eventId: "evt_asado", weight: 3, conditions: [] },
      { eventId: "evt_gol_olimpico", weight: 2, conditions: [] },
      { eventId: "evt_cancha_prestada", weight: 2, conditions: [] },
      { eventId: "evt_mate_cancha", weight: 3, conditions: [] },
      { eventId: "evt_pibe_crack", weight: 2, conditions: [] },
      { eventId: "evt_apagon", weight: 2, conditions: [] },
      { eventId: "evt_torneo_relampago", weight: 2, conditions: [] },
      { eventId: "evt_lluvia_repentina", weight: 2, conditions: [] },
      { eventId: "evt_goleada", weight: 2, conditions: [] },
      { eventId: "evt_vieja_tribuna", weight: 2, conditions: [] },
      { eventId: "evt_pelota_pinchada", weight: 2, conditions: [] },
    ],
  },
  {
    id: "pool_profesional", name: "Eventos Profesionales",
    events: [
      { eventId: "evt_conferencia", weight: 2, conditions: [] },
      { eventId: "evt_transferencia", weight: 2, conditions: [] },
      { eventId: "evt_doping", weight: 1, conditions: [] },
      { eventId: "evt_entrenamiento_esp", weight: 3, conditions: [] },
      { eventId: "evt_companero_lesion", weight: 2, conditions: [] },
      { eventId: "evt_sponsor", weight: 2, conditions: [] },
      { eventId: "evt_pelea_dt", weight: 2, conditions: [] },
      { eventId: "evt_altura", weight: 2, conditions: [] },
      { eventId: "evt_hinchada", weight: 3, conditions: [] },
      { eventId: "evt_botines", weight: 2, conditions: [] },
      { eventId: "evt_juvenil_consejo", weight: 2, conditions: [] },
      { eventId: "evt_amistoso", weight: 2, conditions: [] },
      { eventId: "evt_pretemporada", weight: 2, conditions: [] },
      { eventId: "evt_redes_sociales", weight: 2, conditions: [] },
      { eventId: "evt_cancha_nueva", weight: 2, conditions: [] },
      { eventId: "evt_nutricionista", weight: 2, conditions: [] },
      { eventId: "evt_simulacion", weight: 2, conditions: [] },
      { eventId: "evt_capitan", weight: 2, conditions: [] },
      { eventId: "evt_masajista", weight: 3, conditions: [] },
      { eventId: "evt_camara_vestuario", weight: 2, conditions: [] },
      { eventId: "evt_debut_seleccion", weight: 1, conditions: [] },
      { eventId: "evt_regalo_hincha", weight: 2, conditions: [] },
    ],
  },
  {
    id: "pool_elite", name: "Eventos de Élite",
    events: [
      { eventId: "evt_balon_oro", weight: 1, conditions: [] },
      { eventId: "evt_escandalo", weight: 2, conditions: [] },
      { eventId: "evt_derbi", weight: 2, conditions: [] },
      { eventId: "evt_lesion_grave", weight: 1, conditions: [] },
      { eventId: "evt_oferta_jeque", weight: 1, conditions: [] },
      { eventId: "evt_var", weight: 2, conditions: [] },
      { eventId: "evt_charla_leyenda", weight: 2, conditions: [] },
      { eventId: "evt_final_lluvia", weight: 2, conditions: [] },
      { eventId: "evt_agente", weight: 2, conditions: [] },
      { eventId: "evt_concentracion", weight: 2, conditions: [] },
      { eventId: "evt_mansion", weight: 1, conditions: [] },
      { eventId: "evt_champions_anthem", weight: 2, conditions: [] },
      { eventId: "evt_marca_ropa", weight: 2, conditions: [] },
      { eventId: "evt_critica_prensa", weight: 2, conditions: [] },
      { eventId: "evt_gol_100", weight: 1, conditions: [] },
      { eventId: "evt_sancion_fifa", weight: 1, conditions: [] },
      { eventId: "evt_clasico", weight: 2, conditions: [] },
      { eventId: "evt_hotel_5estrellas", weight: 2, conditions: [] },
      { eventId: "evt_lesion_compañero_estrella", weight: 2, conditions: [] },
      { eventId: "evt_ovacion", weight: 2, conditions: [] },
    ],
  },
  {
    id: "pool_mundial", name: "Eventos del Mundial",
    events: [
      { eventId: "evt_sorteo", weight: 1, conditions: [] },
      { eventId: "evt_himno", weight: 3, conditions: [] },
      { eventId: "evt_lesion_estrella", weight: 1, conditions: [] },
      { eventId: "evt_documental", weight: 1, conditions: [] },
      { eventId: "evt_llamada_casa", weight: 3, conditions: [] },
      { eventId: "evt_presion_pte", weight: 2, conditions: [] },
      { eventId: "evt_penales_ent", weight: 2, conditions: [] },
      { eventId: "evt_formacion", weight: 2, conditions: [] },
      { eventId: "evt_ultimo_baile", weight: 1, conditions: [] },
      { eventId: "evt_cena_rivales", weight: 2, conditions: [] },
      { eventId: "evt_fan_zone", weight: 2, conditions: [] },
      { eventId: "evt_cambio_horario", weight: 2, conditions: [] },
      { eventId: "evt_intercambio_camisetas", weight: 2, conditions: [] },
      { eventId: "evt_hotel_broma", weight: 2, conditions: [] },
      { eventId: "evt_canto_micro", weight: 3, conditions: [] },
      { eventId: "evt_penal_decisivo", weight: 1, conditions: [] },
      { eventId: "evt_sueno_copa", weight: 2, conditions: [] },
      { eventId: "evt_lesion_calentamiento", weight: 1, conditions: [] },
      { eventId: "evt_selfie_rival", weight: 2, conditions: [] },
      { eventId: "evt_tercer_tiempo", weight: 2, conditions: [] },
    ],
  },
];

// ─── COPAS ──────────────────────────────────────────────────────────────

const COPA_DEFS = [
  { id: "copa_barrial", name: "Liga Barrial", emoji: "🏟️", region: "Argentina - Potrero", difficultyRange: [1, 2] as [number, number], rarityRates: { common: 0.65, uncommon: 0.25, rare: 0.08, epic: 0.02, legendary: 0 }, enemies: { normal: ["e_pibe_potrero", "e_juvenil_club"], elite: ["e_crack_barrio"], boss: ["e_referi_barrial"] }, eventPoolIds: ["pool_potrero"] },
  { id: "copa_provincial", name: "Copa Provincial", emoji: "🏆", region: "Argentina - Regional", difficultyRange: [2, 3] as [number, number], rarityRates: { common: 0.55, uncommon: 0.30, rare: 0.12, epic: 0.03, legendary: 0 }, enemies: { normal: ["e_interior", "e_marcador_duro"], elite: ["e_goleador_prov"], boss: ["e_referente_local"] }, eventPoolIds: ["pool_potrero"] },
  { id: "copa_primera", name: "Primera División", emoji: "⭐", region: "Argentina - Nacional", difficultyRange: [3, 5] as [number, number], rarityRates: { common: 0.40, uncommon: 0.35, rare: 0.18, epic: 0.06, legendary: 0.01 }, enemies: { normal: ["e_titular_primera", "e_suplente_ganas"], elite: ["e_refuerzo_mill"], boss: ["e_clasico_rival"] }, eventPoolIds: ["pool_potrero", "pool_profesional"] },
  { id: "copa_sudamericana", name: "Copa Sudamericana", emoji: "🌎", region: "CONMEBOL", difficultyRange: [4, 6] as [number, number], rarityRates: { common: 0.30, uncommon: 0.33, rare: 0.25, epic: 0.10, legendary: 0.02 }, enemies: { normal: ["e_volante_br", "e_defensa_col"], elite: ["e_crack_sudamer"], boss: ["e_boss_flamengo"] }, eventPoolIds: ["pool_potrero", "pool_profesional"] },
  { id: "copa_libertadores", name: "Copa Libertadores", emoji: "🔥", region: "CONMEBOL", difficultyRange: [5, 7] as [number, number], rarityRates: { common: 0.20, uncommon: 0.28, rare: 0.30, epic: 0.17, legendary: 0.05 }, enemies: { normal: ["e_extremo_br", "e_goleador_uru"], elite: ["e_estrella_cont"], boss: ["e_boss_campeon"] }, eventPoolIds: ["pool_potrero", "pool_profesional"] },
  { id: "copa_europa_league", name: "UEFA Europa League", emoji: "🌟", region: "Europa", difficultyRange: [6, 7] as [number, number], rarityRates: { common: 0.12, uncommon: 0.22, rare: 0.32, epic: 0.25, legendary: 0.09 }, enemies: { normal: ["e_mid_turco", "e_def_portug"], elite: ["e_crack_liga_media"], boss: ["e_boss_sevilla"] }, eventPoolIds: ["pool_profesional", "pool_elite"] },
  { id: "copa_champions", name: "UEFA Champions League", emoji: "👑", region: "Europa", difficultyRange: [7, 9] as [number, number], rarityRates: { common: 0.05, uncommon: 0.15, rare: 0.28, epic: 0.35, legendary: 0.17 }, enemies: { normal: ["e_titular_city", "e_volante_bayern"], elite: ["e_estrella_eur"], boss: ["e_boss_real_madrid"] }, eventPoolIds: ["pool_profesional", "pool_elite"] },
  { id: "copa_mundial_clubes", name: "Mundial de Clubes", emoji: "🌐", region: "FIFA - Global", difficultyRange: [8, 9] as [number, number], rarityRates: { common: 0.03, uncommon: 0.10, rare: 0.22, epic: 0.38, legendary: 0.27 }, enemies: { normal: ["e_allstar_inter"], elite: ["e_mvp_cont"], boss: ["e_boss_dream_team"] }, eventPoolIds: ["pool_elite", "pool_mundial"] },
  { id: "copa_del_mundo", name: "Copa del Mundo", emoji: "🏅", region: "FIFA - Selecciones", difficultyRange: [9, 10] as [number, number], rarityRates: { common: 0.02, uncommon: 0.05, rare: 0.15, epic: 0.38, legendary: 0.40 }, enemies: { normal: ["e_seleccionado"], elite: ["e_estrella_sel"], boss: ["e_boss_final_mundial"] }, eventPoolIds: ["pool_elite", "pool_mundial"] },
];

function buildCopas(copaIndex: number) {
  const def = COPA_DEFS[copaIndex];
  const c = copaIndex + 1;
  return {
    id: def.id, name: def.name, emoji: def.emoji, region: def.region,
    difficultyRange: def.difficultyRange, rarityRates: def.rarityRates,
    encounterPools: {
      normal: def.enemies.normal.map((eid) => `enc_c${c}_${eid}`),
      elite: def.enemies.elite.map((eid) => `enc_c${c}_elite_${eid}`),
      boss: def.enemies.boss.map((eid) => `enc_c${c}_boss_${eid}`),
    },
    eventPoolIds: def.eventPoolIds,
  };
}

// ─── ENCOUNTERS ─────────────────────────────────────────────────────────

function generateEncounters() {
  const encounters: unknown[] = [];
  const copaEncounterDefs = [
    { copa: 1, normal: [{ id: "e_pibe_potrero", lvl: [1, 3] }, { id: "e_juvenil_club", lvl: [2, 4] }], elite: [{ id: "e_crack_barrio", lvl: [4, 6] }], boss: [{ id: "e_referi_barrial", lvl: [5, 7] }] },
    { copa: 2, normal: [{ id: "e_interior", lvl: [4, 6] }, { id: "e_marcador_duro", lvl: [4, 7] }], elite: [{ id: "e_goleador_prov", lvl: [6, 8] }], boss: [{ id: "e_referente_local", lvl: [7, 9] }] },
    { copa: 3, normal: [{ id: "e_titular_primera", lvl: [9, 12] }, { id: "e_suplente_ganas", lvl: [8, 11] }], elite: [{ id: "e_refuerzo_mill", lvl: [12, 15] }], boss: [{ id: "e_clasico_rival", lvl: [14, 17] }] },
    { copa: 4, normal: [{ id: "e_volante_br", lvl: [12, 15] }, { id: "e_defensa_col", lvl: [12, 15] }], elite: [{ id: "e_crack_sudamer", lvl: [15, 18] }], boss: [{ id: "e_boss_flamengo", lvl: [17, 20] }] },
    { copa: 5, normal: [{ id: "e_extremo_br", lvl: [14, 17] }, { id: "e_goleador_uru", lvl: [14, 17] }], elite: [{ id: "e_estrella_cont", lvl: [17, 20] }], boss: [{ id: "e_boss_campeon", lvl: [19, 22] }] },
    { copa: 6, normal: [{ id: "e_mid_turco", lvl: [16, 19] }, { id: "e_def_portug", lvl: [16, 19] }], elite: [{ id: "e_crack_liga_media", lvl: [19, 22] }], boss: [{ id: "e_boss_sevilla", lvl: [21, 24] }] },
    { copa: 7, normal: [{ id: "e_titular_city", lvl: [18, 21] }, { id: "e_volante_bayern", lvl: [18, 21] }], elite: [{ id: "e_estrella_eur", lvl: [21, 24] }], boss: [{ id: "e_boss_real_madrid", lvl: [23, 26] }] },
    { copa: 8, normal: [{ id: "e_allstar_inter", lvl: [20, 23] }], elite: [{ id: "e_mvp_cont", lvl: [23, 26] }], boss: [{ id: "e_boss_dream_team", lvl: [25, 28] }] },
    { copa: 9, normal: [{ id: "e_seleccionado", lvl: [22, 25] }], elite: [{ id: "e_estrella_sel", lvl: [25, 28] }], boss: [{ id: "e_boss_final_mundial", lvl: [27, 30] }] },
  ];

  for (const def of copaEncounterDefs) {
    for (const n of def.normal) {
      encounters.push({
        id: `enc_c${def.copa}_${n.id}`,
        name: `Partido Copa ${def.copa}`,
        description: `Encuentro normal en copa ${def.copa}.`,
        difficulty: Math.min(def.copa, 10),
        enemies: [{ templateId: n.id, levelRange: n.lvl, count: 1 }],
        environment: `copa_${def.copa}`,
        isBoss: false,
        rewards: { xpMultiplier: 1 + def.copa * 0.15, guaranteedDrops: [], bonusResourceChance: { monedas: 0.5, fama: 0.3 * def.copa / 9 }, recruitChance: 0.2 },
      });
    }
    for (const e of def.elite) {
      encounters.push({
        id: `enc_c${def.copa}_elite_${e.id}`,
        name: `Élite Copa ${def.copa}`,
        description: `Encuentro élite en copa ${def.copa}.`,
        difficulty: Math.min(def.copa + 1, 10),
        enemies: [{ templateId: e.id, levelRange: e.lvl, count: 1 }],
        environment: `copa_${def.copa}`,
        isBoss: false,
        rewards: { xpMultiplier: 1.5 + def.copa * 0.15, guaranteedDrops: [], bonusResourceChance: { monedas: 0.7, fama: 0.5 * def.copa / 9 }, recruitChance: 0.15 },
      });
    }
    for (const b of def.boss) {
      encounters.push({
        id: `enc_c${def.copa}_boss_${b.id}`,
        name: `Final Copa ${def.copa}`,
        description: `Boss de copa ${def.copa}.`,
        difficulty: Math.min(def.copa + 2, 10),
        enemies: [{ templateId: b.id, levelRange: b.lvl, count: 1 }],
        environment: `copa_${def.copa}_final`,
        isBoss: true,
        rewards: { xpMultiplier: 2 + def.copa * 0.2, guaranteedDrops: [], bonusResourceChance: { fama: 1.0 }, recruitChance: 0 },
      });
    }
  }
  return encounters;
}

// ─── SPECIAL PLAYERS (META SHOP LEGENDS) ────────────────────────────────

const SPECIAL_LEGEND_PLAYERS: PlayerDef[] = [
  { id: "sp_maradona", name: "Diego Maradona", desc: "Enganche - Leyenda (Argentina)", category: "delantero", rarity: "legendary", types: ["enganche", "regate"], tags: ["leyenda", "argentino", "GOAT"], level: 15, statProfile: "mid", skillIds: ["sk_gambeta_corta", "sk_pase_filtrado", "sk_tiro_libre"], passive: "Mano de D10S: +30% a todo cuando moral > 80", flavor: "El más grande de todos los tiempos." },
  { id: "sp_pele", name: "Pelé", desc: "Delantero - Leyenda (Brasil)", category: "delantero", rarity: "legendary", types: ["goleador", "creativo"], tags: ["leyenda", "brasileño", "GOAT"], level: 15, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_volea", "sk_chilena"], passive: "O Rei: +25% daño tiro y +15% accuracy", flavor: "El Rey del fútbol." },
  { id: "sp_zidane", name: "Zinedine Zidane", desc: "Mediocampista - Leyenda (Francia)", category: "mediocampista", rarity: "legendary", types: ["enganche", "creativo"], tags: ["leyenda", "francés"], level: 14, statProfile: "mid", skillIds: ["sk_media_vuelta", "sk_pase_filtrado", "sk_volea"], passive: "Elegancia: Cada acción tiene +20% accuracy", flavor: "La elegancia hecha jugador." },
  { id: "sp_ronaldo_n", name: "Ronaldo Nazário", desc: "Delantero - Leyenda (Brasil)", category: "delantero", rarity: "legendary", types: ["goleador", "velocidad"], tags: ["leyenda", "brasileño"], level: 14, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_enganchar", "sk_regate_doble"], passive: "El Fenómeno: +30% ritmo, gol asegurado si HP < 20%", flavor: "El delantero más completo de la historia." },
  { id: "sp_ronaldinho", name: "Ronaldinho", desc: "Mediocampista - Leyenda (Brasil)", category: "mediocampista", rarity: "legendary", types: ["enganche", "regate"], tags: ["leyenda", "brasileño"], level: 14, statProfile: "mid", skillIds: ["sk_sombrero", "sk_rabona", "sk_caño"], passive: "Jogo Bonito: Luxuries dan triple daño, +20 moral", flavor: "Hacía cosas que no deberían ser posibles." },
  { id: "sp_cruyff", name: "Johan Cruyff", desc: "Delantero - Leyenda (Países Bajos)", category: "delantero", rarity: "legendary", types: ["enganche", "creativo"], tags: ["leyenda", "holandés"], level: 14, statProfile: "mid", skillIds: ["sk_gambeta_corta", "sk_pase_filtrado", "sk_media_vuelta"], passive: "Fútbol Total: +10% a todos los stats del equipo", flavor: "Inventó el fútbol moderno." },
  { id: "sp_di_stefano", name: "Alfredo Di Stéfano", desc: "Delantero - Leyenda (Argentina)", category: "delantero", rarity: "legendary", types: ["goleador", "creativo"], tags: ["leyenda", "argentino"], level: 14, statProfile: "att", skillIds: ["sk_definicion_letal", "sk_pase_filtrado", "sk_liderazgo"], passive: "La Saeta Rubia: +20% todo en copas europeas", flavor: "El dueño del Bernabéu." },
  { id: "sp_van_basten", name: "Marco van Basten", desc: "Delantero - Leyenda (Países Bajos)", category: "delantero", rarity: "legendary", types: ["goleador", "área"], tags: ["leyenda", "holandés"], level: 13, statProfile: "att", skillIds: ["sk_volea", "sk_definicion_letal", "sk_cabezazo"], passive: "Volea Perfecta: Voleas tienen 100% accuracy", flavor: "Esa volea contra la URSS." },
  { id: "sp_beckenbauer", name: "Franz Beckenbauer", desc: "Defensor - Leyenda (Alemania)", category: "defensor", rarity: "legendary", types: ["defensa", "creativo"], tags: ["leyenda", "alemán"], level: 14, statProfile: "def", skillIds: ["sk_diagonal", "sk_liderazgo", "sk_tackleo"], passive: "Der Kaiser: +20% defensa equipo, puede atacar como mid", flavor: "Inventó la posición de líbero." },
  { id: "sp_maldini", name: "Paolo Maldini", desc: "Defensor - Leyenda (Italia)", category: "defensor", rarity: "legendary", types: ["defensa", "marca"], tags: ["leyenda", "italiano"], level: 14, statProfile: "def", skillIds: ["sk_marca_personal", "sk_tackleo", "sk_liderazgo"], passive: "Eterno: -30% daño recibido, inmune a regates", flavor: "Si necesitó hacer un tackle, ya llegó tarde." },
];

// ─── BUILD THEME ────────────────────────────────────────────────────────

function buildTheme() {
  const allPlayers = [...LEGENDARY_PLAYERS, ...EPIC_PLAYERS, ...RARE_PLAYERS, ...UNCOMMON_PLAYERS, ...COMMON_PLAYERS];
  const specialEntities = SPECIAL_LEGEND_PLAYERS.map(buildEntity);
  const allEntities = [...allPlayers.map(buildEntity), ...ENEMIES.map(buildEntity), ...specialEntities];

  console.log(`Players: ${allPlayers.length} (L:${LEGENDARY_PLAYERS.length} E:${EPIC_PLAYERS.length} R:${RARE_PLAYERS.length} U:${UNCOMMON_PLAYERS.length} C:${COMMON_PLAYERS.length})`);
  console.log(`Enemies: ${ENEMIES.length}`);
  console.log(`Events: ${EVENTS.length}`);
  console.log(`Copas: ${COPA_DEFS.length}`);

  const theme = {
    id: "futbolmon",
    version: "2.0.0",
    name: "FutbolMon",
    tagline: "De potrero a leyenda",
    description: "Simulación de carrera futbolística: arrancás en el barrio, reclutás jugadores como criaturas, entrenalos, evolucioná sus estilos y llegá a la gloria.",
    icon: "⚽",

    statDefinitions: [
      { id: "ritmo", name: "Ritmo", icon: "⚡", color: "#facc15", min: 1, max: 99 },
      { id: "tiro", name: "Tiro", icon: "🎯", color: "#ef4444", min: 1, max: 99 },
      { id: "pase", name: "Pase", icon: "🎯", color: "#3b82f6", min: 1, max: 99 },
      { id: "regate", name: "Regate", icon: "✨", color: "#a855f7", min: 1, max: 99 },
      { id: "defensa", name: "Defensa", icon: "🛡️", color: "#22c55e", min: 1, max: 99 },
      { id: "fisico", name: "Físico", icon: "💪", color: "#f97316", min: 1, max: 99 },
      { id: "reflejos", name: "Reflejos", icon: "🧤", color: "#06b6d4", min: 1, max: 99 },
      { id: "posicion", name: "Posición", icon: "📍", color: "#64748b", min: 1, max: 99 },
    ],

    resourceDefinitions: [
      { id: "monedas", name: "Monedas", icon: "🪙", current: 500, max: 99999 },
      { id: "fama", name: "Fama", icon: "⭐", current: 0, max: 1000 },
      { id: "moral", name: "Moral", icon: "❤️‍🔥", current: 100, max: 100 },
      { id: "energia", name: "Energía", icon: "🔋", current: 100, max: 100 },
    ],

    entityCategories: [
      { id: "arquero", name: "Arquero", namePlural: "Arqueros", icon: "🧤", description: "Guardametas", maxInParty: 1 },
      { id: "defensor", name: "Defensor", namePlural: "Defensores", icon: "🛡️", description: "Centrales, laterales y líberos", maxInParty: 4 },
      { id: "mediocampista", name: "Mediocampista", namePlural: "Mediocampistas", icon: "🎯", description: "Volantes, enganches y carrileros", maxInParty: 4 },
      { id: "delantero", name: "Delantero", namePlural: "Delanteros", icon: "⚽", description: "Extremos, centrodelanteros y segundos puntas", maxInParty: 3 },
    ],

    entities: allEntities,
    encounters: generateEncounters(),
    events: EVENTS,
    eventPools: EVENT_POOLS,
    copas: COPA_DEFS.map((_, i) => ({ ...buildCopas(i), mapsPerCopa: 7 })),

    items: [
      { id: "item_botines_barrio", name: "Botines del Barrio", description: "Gastados pero fieles.", icon: "👟", rarity: "common", type: "equipment", effect: { type: "buff", target: "regate", value: 5, duration: 99 }, maxStack: 1, price: 50, tags: ["equipamiento"] },
      { id: "item_bebida_isotonica", name: "Bebida Isotónica", description: "Recuperá energía.", icon: "🧃", rarity: "common", type: "consumable", effect: { type: "heal", value: 30 }, maxStack: 10, price: 15, tags: ["consumible"] },
      { id: "item_vendas", name: "Vendas", description: "Curación rápida.", icon: "🩹", rarity: "common", type: "consumable", effect: { type: "heal", value: 50 }, maxStack: 10, price: 25, tags: ["consumible"] },
      { id: "item_mate", name: "Mate Amargo", description: "Revitaliza el espíritu.", icon: "🧉", rarity: "common", type: "consumable", effect: { type: "resource", target: "moral", value: 15 }, maxStack: 10, price: 20, tags: ["consumible"] },
      { id: "item_cinta_capitan", name: "Cinta de Capitán", description: "Liderazgo puro.", icon: "🎗️", rarity: "rare", type: "passive", effect: { type: "buff", target: "defensa", value: 10, duration: 99 }, maxStack: 1, price: 200, tags: ["equipamiento"] },
      { id: "item_canilleras_pro", name: "Canilleras Pro", description: "Protección extra.", icon: "🦿", rarity: "uncommon", type: "equipment", effect: { type: "buff", target: "fisico", value: 8, duration: 99 }, maxStack: 1, price: 120, tags: ["equipamiento"] },
      { id: "item_botin_de_oro", name: "Botín de Oro", description: "Botines premium.", icon: "👞", rarity: "epic", type: "equipment", effect: { type: "buff", target: "tiro", value: 15, duration: 99 }, maxStack: 1, price: 500, tags: ["equipamiento"] },
      { id: "item_revive", name: "Sal de Amoniaco", description: "Revive a un jugador caído.", icon: "💨", rarity: "rare", type: "consumable", effect: { type: "revive", value: 50 }, maxStack: 5, price: 150, tags: ["consumible"] },
      { id: "item_guantes_pro", name: "Guantes Pro", description: "Para el arco.", icon: "🧤", rarity: "uncommon", type: "equipment", effect: { type: "buff", target: "reflejos", value: 10, duration: 99 }, maxStack: 1, price: 100, tags: ["equipamiento"] },
      { id: "item_pelota_dorada", name: "Pelota Dorada", description: "XP extra en combate.", icon: "🏅", rarity: "epic", type: "passive", effect: { type: "xp_boost", value: 1.5 }, maxStack: 1, price: 400, tags: ["especial"] },
    ],

    combatConfig: {
      maxPartySize: 2,
      maxActivePerSide: 1,
      baseCritChance: 0.08,
      critMultiplier: 1.5,
      fleeBaseChance: 0.3,
      recruitEnabled: true,
      damageFormula: "standard",
      speedDeterminesTurnOrder: true,
      turnOrderStat: "ritmo",
      typeChart: {
        types: [
          { id: "goleador", name: "Goleador", icon: "⚽", color: "#ef4444" },
          { id: "extremo", name: "Extremo", icon: "⚡", color: "#facc15" },
          { id: "enganche", name: "Enganche", icon: "🎯", color: "#a855f7" },
          { id: "volante", name: "Volante", icon: "🛡️", color: "#22c55e" },
          { id: "defensa", name: "Defensa", icon: "🧱", color: "#3b82f6" },
          { id: "arco", name: "Arco", icon: "🧤", color: "#f97316" },
          { id: "velocidad", name: "Velocidad", icon: "💨", color: "#06b6d4" },
          { id: "creativo", name: "Creativo", icon: "✨", color: "#ec4899" },
          { id: "aéreo", name: "Aéreo", icon: "🦅", color: "#8b5cf6" },
          { id: "marca", name: "Marca", icon: "🔒", color: "#64748b" },
          { id: "carrilero", name: "Carrilero", icon: "🏃", color: "#10b981" },
          { id: "área", name: "Área", icon: "📍", color: "#dc2626" },
          { id: "capitán", name: "Capitán", icon: "©️", color: "#eab308" },
          { id: "regate", name: "Regate", icon: "🌀", color: "#d946ef" },
        ],
        matchups: [
          { attackType: "goleador", defendType: "arco", multiplier: 1.3 },
          { attackType: "goleador", defendType: "defensa", multiplier: 0.7 },
          { attackType: "extremo", defendType: "defensa", multiplier: 1.5 },
          { attackType: "extremo", defendType: "marca", multiplier: 0.6 },
          { attackType: "enganche", defendType: "volante", multiplier: 0.7 },
          { attackType: "enganche", defendType: "defensa", multiplier: 1.4 },
          { attackType: "volante", defendType: "enganche", multiplier: 1.4 },
          { attackType: "volante", defendType: "extremo", multiplier: 0.8 },
          { attackType: "defensa", defendType: "goleador", multiplier: 1.5 },
          { attackType: "defensa", defendType: "enganche", multiplier: 0.7 },
          { attackType: "marca", defendType: "extremo", multiplier: 1.5 },
          { attackType: "marca", defendType: "creativo", multiplier: 1.3 },
          { attackType: "creativo", defendType: "marca", multiplier: 0.6 },
          { attackType: "creativo", defendType: "defensa", multiplier: 1.5 },
          { attackType: "velocidad", defendType: "aéreo", multiplier: 0.7 },
          { attackType: "velocidad", defendType: "defensa", multiplier: 1.3 },
          { attackType: "aéreo", defendType: "velocidad", multiplier: 1.4 },
          { attackType: "arco", defendType: "goleador", multiplier: 1.3 },
          { attackType: "arco", defendType: "extremo", multiplier: 0.8 },
          { attackType: "regate", defendType: "marca", multiplier: 0.5 },
          { attackType: "regate", defendType: "defensa", multiplier: 1.3 },
          { attackType: "capitán", defendType: "volante", multiplier: 1.2 },
          { attackType: "tiro", defendType: "arco", multiplier: 0.7 },
          { attackType: "tiro", defendType: "defensa", multiplier: 0.8 },
          { attackType: "tiro", defendType: "marca", multiplier: 1.3 },
          { attackType: "tiro", defendType: "volante", multiplier: 1.2 },
          { attackType: "pase", defendType: "marca", multiplier: 0.7 },
          { attackType: "pase", defendType: "volante", multiplier: 0.7 },
          { attackType: "pase", defendType: "defensa", multiplier: 1.3 },
          { attackType: "fisico", defendType: "velocidad", multiplier: 0.7 },
          { attackType: "fisico", defendType: "regate", multiplier: 0.8 },
          { attackType: "fisico", defendType: "defensa", multiplier: 1.3 },
        ],
        defaultMultiplier: 1,
      },
    },

    mapGenConfig: {
      rowsPerAct: 8,
      nodesPerRow: { min: 2, max: 4 },
      totalActs: 9,
      nodeDistribution: [
        { type: "battle", weight: 30, minPerAct: 3 },
        { type: "event", weight: 25, minPerAct: 2 },
        { type: "elite", weight: 10, minPerAct: 1, maxPerAct: 2 },
        { type: "shop", weight: 10, minPerAct: 1, maxPerAct: 2 },
        { type: "rest", weight: 10, minPerAct: 1, maxPerAct: 2 },
        { type: "mystery", weight: 8, minPerAct: 0, maxPerAct: 2 },
        { type: "recruitment", weight: 12, minPerAct: 1, maxPerAct: 3 },
        { type: "boss", weight: 1, minPerAct: 1, maxPerAct: 1 },
      ],
      connectionRules: { maxForward: 3, allowCross: true },
      eliteMinRow: 3,
      restMinRow: 4,
      shopMinRow: 2,
      encounterPools: Object.fromEntries(
        COPA_DEFS.map((c, i) => {
          const copa = buildCopas(i);
          return [
            `copa_${i + 1}`,
            [
              ...copa.encounterPools.normal.map((id) => ({ id, weight: 3 })),
              ...copa.encounterPools.elite.map((id) => ({ id, weight: 1 })),
              ...copa.encounterPools.boss.map((id) => ({ id, weight: 1 })),
            ],
          ];
        })
      ),
    },

    gachaPools: [
      {
        id: "gacha_ojeador", name: "Scouting de Barrio",
        description: "Ojeadores buscando talentos en los potreros.",
        cost: { monedas: 100 },
        rates: { common: 0.50, uncommon: 0.25, rare: 0.15, epic: 0.08, legendary: 0.02 },
        pityThreshold: 25, pityGuaranteedRarity: "epic",
        entityPool: allPlayers.filter((p) => p.rarity === "common" || p.rarity === "uncommon" || p.rarity === "rare").map((p) => p.id),
        featured: ["p_guler"], featuredBoost: 2,
      },
      {
        id: "gacha_mercado_pases", name: "Mercado de Pases",
        description: "Mercado internacional de transferencias.",
        cost: { monedas: 300, fama: 20 },
        rates: { common: 0.20, uncommon: 0.30, rare: 0.25, epic: 0.18, legendary: 0.07 },
        pityThreshold: 15, pityGuaranteedRarity: "legendary",
        entityPool: allPlayers.filter((p) => p.rarity === "epic" || p.rarity === "legendary").map((p) => p.id),
        featured: ["p_haaland"], featuredBoost: 1.5,
      },
    ],

    shops: [
      {
        id: "shop_kiosco", name: "Kiosco del Club", icon: "🏪", slots: 4,
        refreshCost: { monedas: 30 },
        itemPool: [
          { itemId: "item_bebida_isotonica", weight: 5, priceMultiplier: 1 },
          { itemId: "item_vendas", weight: 4, priceMultiplier: 1 },
          { itemId: "item_mate", weight: 4, priceMultiplier: 1 },
          { itemId: "item_botines_barrio", weight: 3, priceMultiplier: 1 },
          { itemId: "item_canilleras_pro", weight: 2, priceMultiplier: 1 },
          { itemId: "item_guantes_pro", weight: 2, priceMultiplier: 1 },
          { itemId: "item_revive", weight: 1.5, priceMultiplier: 1.2 },
          { itemId: "item_cinta_capitan", weight: 1, priceMultiplier: 1.2 },
          { itemId: "item_botin_de_oro", weight: 0.5, priceMultiplier: 1.3 },
          { itemId: "item_pelota_dorada", weight: 0.3, priceMultiplier: 1.5 },
        ],
        entityPool: [],
      },
    ],

    starter: {
      chooseBetween: 3,
      starterPool: [
        "p_uc_benedetto", "p_uc_borja", "p_uc_langoni", "p_uc_gabigol",
        "p_uc_pol", "p_uc_quintero", "p_uc_nacho_f", "p_uc_equi",
        "p_uc_rojo", "p_uc_advincula", "p_uc_paulo_diaz", "p_uc_david_luiz",
        "p_uc_s_romero", "p_uc_a_rossi", "p_uc_weverton",
        "p_uc_janson", "p_uc_valoyes", "p_uc_salvio",
      ],
      initialResources: { monedas: 500, fama: 0, moral: 100, energia: 100 },
      initialItems: [
        { itemId: "item_bebida_isotonica", quantity: 3 },
        { itemId: "item_botines_barrio", quantity: 1 },
      ],
    },

    unlocks: [
      { id: "unlock_monedas_extra", name: "Patrocinador de Barrio", description: "+100 monedas iniciales.", icon: "🏪", category: "passive", cost: 50, maxLevel: 3, effect: { type: "resource_bonus", value: 100, target: "monedas" }, tier: 1 },
      { id: "unlock_starter_haaland", name: "Contacto Internacional", description: "Desbloqueá a Haaland como starter.", icon: "🌍", category: "starter_entity", cost: 1000, maxLevel: 1, effect: { type: "add_starter", value: 1, target: "p_haaland" }, tier: 5, conditions: [{ type: "flag", target: "victories", value: 5 }] },
    ],

    achievements: [
      { id: "ach_primer_gol", name: "¡Gooool!", description: "Ganá tu primer combate.", icon: "⚽", condition: { type: "flag", target: "combats_won", value: 1 }, reward: { metaCurrency: 50 } },
      { id: "ach_copa_1", name: "Campeón Barrial", description: "Completá la Liga Barrial.", icon: "🏟️", condition: { type: "flag", target: "copas_completed", value: 1 }, reward: { metaCurrency: 100 } },
      { id: "ach_copa_9", name: "Campeón del Mundo", description: "Completá la Copa del Mundo.", icon: "🏅", condition: { type: "flag", target: "victories", value: 1 }, reward: { metaCurrency: 1000 } },
      { id: "ach_dream_team", name: "Dream Team", description: "3 legendarias en el mismo party.", icon: "👑", condition: { type: "flag", target: "legendary_party_3", value: true }, reward: { metaCurrency: 500 }, hidden: true },
    ],

    uiTheme: {
      primaryColor: "#22c55e",
      secondaryColor: "#3b82f6",
      accentColor: "#facc15",
      backgroundColor: "#0a1628",
      surfaceColor: "#152238",
      fontFamily: "'Inter', sans-serif",
      borderStyle: "rounded",
      cardStyle: "sporty",
      labels: {
        entitySingular: "Jugador",
        entityPlural: "Jugadores",
        partySingular: "Plantel",
        partyPlural: "Planteles",
        recruitVerb: "Fichar",
        battleVerb: "Jugar",
        currency: "Monedas",
        metaCurrency: "Estrellas de Leyenda",
      },
      backgrounds: {
        map: "/themes/futbolmon/bg-map.webp",
        combat: "/themes/futbolmon/bg-cancha.webp",
        menu: "/themes/futbolmon/bg-menu.webp",
        shop: "/themes/futbolmon/bg-kiosco.webp",
      },
    },

    balancing: {
      xpCurve: "exponential",
      xpBasePerLevel: 80,
      xpGrowthRate: 1.2,
      difficultyScaling: 1.15,
      healOnLevelUp: true,
      maxInventorySlots: 20,
    },
  };

  return theme;
}

// ─── RUN ─────────────────────────────────────────────────────────────────

const theme = buildTheme();
const outPath = path.resolve(__dirname, "../src/themes/futbolmon/theme.json");
const publicPath = path.resolve(__dirname, "../public/themes/futbolmon/theme.json");
const jsonStr = JSON.stringify(theme, null, 2);
fs.writeFileSync(outPath, jsonStr, "utf-8");
fs.mkdirSync(path.dirname(publicPath), { recursive: true });
fs.writeFileSync(publicPath, jsonStr, "utf-8");
console.log(`\nTheme written to ${outPath}  +  ${publicPath}`);
console.log(`Total entities: ${theme.entities.length}`);
console.log(`Total encounters: ${theme.encounters.length}`);
console.log(`Total events: ${theme.events.length}`);
console.log(`Total copas: ${theme.copas.length}`);
