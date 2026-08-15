/**
 * Script para fetchear datos de TheSportsDB y generar el ThemePack de FutbolMon.
 *
 * Uso: npx tsx scripts/fetch-futbolmon-data.ts
 *
 * API Base: https://www.thesportsdb.com/api/v1/json/{API_KEY}/
 * Free API Key: 123 (limitado a 10 results por request)
 * Rate limit: 30 req/min
 */

const API_BASE = "https://www.thesportsdb.com/api/v1/json/123";
const DELAY_MS = 2100; // ~28 req/min, safe margin

interface SportsDBTeam {
  idTeam: string;
  strTeam: string;
  strTeamShort: string;
  strBadge: string;
  strStadium: string;
  intStadiumCapacity: string;
  strStadiumThumb: string;
  strCountry: string;
  strLeague: string;
  strDescriptionEN: string;
}

interface SportsDBPlayer {
  idPlayer: string;
  strPlayer: string;
  strPosition: string;
  strNationality: string;
  dateBorn: string;
  strHeight: string;
  strWeight: string;
  strNumber: string;
  strThumb: string;
  strCutout: string;
  strSigning: string;
  strDescriptionEN: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json() as Promise<T>;
}

// ─── Endpoints ───────────────────────────────────────────────────

async function searchTeamByName(name: string): Promise<SportsDBTeam | null> {
  const data = await fetchJSON<{ teams: SportsDBTeam[] | null }>(
    `${API_BASE}/searchteams.php?t=${encodeURIComponent(name)}`
  );
  return data.teams?.[0] ?? null;
}

async function getTeamsByLeague(league: string): Promise<SportsDBTeam[]> {
  const data = await fetchJSON<{ teams: SportsDBTeam[] | null }>(
    `${API_BASE}/search_all_teams.php?l=${encodeURIComponent(league)}`
  );
  return data.teams ?? [];
}

async function getPlayersByTeam(teamId: string): Promise<SportsDBPlayer[]> {
  const data = await fetchJSON<{ player: SportsDBPlayer[] | null }>(
    `${API_BASE}/lookup_all_players.php?id=${teamId}`
  );
  return (data.player ?? []).filter((p) => p.strPosition !== "Manager" && !p.strPosition?.includes("Coach") && !p.strPosition?.includes("CEO") && !p.strPosition?.includes("Director"));
}

// ─── Mapeo posición → stats base ─────────────────────────────────

function positionToStats(position: string): Record<string, number> {
  const pos = position?.toLowerCase() ?? "";

  if (pos.includes("goalkeeper"))
    return { ritmo: 40, tiro: 15, pase: 50, regate: 20, defensa: 30, fisico: 70, reflejos: 85, posicion: 80 };
  if (pos.includes("centre-back") || pos.includes("defender"))
    return { ritmo: 55, tiro: 30, pase: 55, regate: 35, defensa: 82, fisico: 78, reflejos: 40, posicion: 75 };
  if (pos.includes("right-back") || pos.includes("left-back") || pos.includes("wing-back"))
    return { ritmo: 78, tiro: 40, pase: 65, regate: 60, defensa: 70, fisico: 70, reflejos: 35, posicion: 65 };
  if (pos.includes("defensive midfield"))
    return { ritmo: 60, tiro: 50, pase: 72, regate: 55, defensa: 75, fisico: 75, reflejos: 35, posicion: 72 };
  if (pos.includes("central midfield") || pos.includes("midfielder"))
    return { ritmo: 65, tiro: 60, pase: 78, regate: 70, defensa: 60, fisico: 68, reflejos: 35, posicion: 70 };
  if (pos.includes("attacking midfield"))
    return { ritmo: 72, tiro: 72, pase: 80, regate: 80, defensa: 35, fisico: 60, reflejos: 30, posicion: 60 };
  if (pos.includes("wing") || pos.includes("winger"))
    return { ritmo: 85, tiro: 68, pase: 70, regate: 82, defensa: 30, fisico: 58, reflejos: 30, posicion: 55 };
  if (pos.includes("forward") || pos.includes("centre-forward") || pos.includes("striker"))
    return { ritmo: 78, tiro: 82, pase: 60, regate: 72, defensa: 25, fisico: 72, reflejos: 30, posicion: 80 };

  return { ritmo: 60, tiro: 55, pase: 60, regate: 55, defensa: 55, fisico: 60, reflejos: 35, posicion: 60 };
}

function positionToCategory(position: string): string {
  const pos = position?.toLowerCase() ?? "";
  if (pos.includes("goalkeeper")) return "arquero";
  if (pos.includes("back") || pos.includes("defender")) return "defensor";
  if (pos.includes("midfield") || pos.includes("midfielder")) return "mediocampista";
  return "delantero";
}

function positionToTypes(position: string): string[] {
  const pos = position?.toLowerCase() ?? "";
  if (pos.includes("goalkeeper")) return ["arco"];
  if (pos.includes("centre-back")) return ["defensa", "aéreo"];
  if (pos.includes("back")) return ["defensa", "carrilero"];
  if (pos.includes("defensive")) return ["volante", "marca"];
  if (pos.includes("attacking")) return ["enganche", "creativo"];
  if (pos.includes("wing")) return ["extremo", "velocidad"];
  if (pos.includes("forward") || pos.includes("striker")) return ["goleador", "área"];
  return ["volante"];
}

// ─── Main ────────────────────────────────────────────────────────

const LEAGUES_TO_FETCH = [
  { name: "Argentinian Primera Division", id: "4406", tier: "top" },
  { name: "English Premier League", id: "4328", tier: "top" },
  { name: "Spanish La Liga", id: "4335", tier: "top" },
];

const PRIORITY_TEAMS = [
  "Boca Juniors", "River Plate", "Racing Club", "Independiente",
  "San Lorenzo", "Talleres de Córdoba", "Vélez Sarsfield", "Estudiantes de La Plata",
  "Barcelona", "Real Madrid", "Atletico Madrid",
  "Arsenal", "Manchester City", "Liverpool",
];

async function main() {
  console.log("🏟️ FutbolMon Data Fetcher");
  console.log("========================\n");

  const allTeams: SportsDBTeam[] = [];
  const allPlayers: (SportsDBPlayer & { teamName: string; teamId: string })[] = [];

  // 1. Fetch teams from each league
  for (const league of LEAGUES_TO_FETCH) {
    console.log(`📋 Fetching teams from ${league.name}...`);
    const teams = await getTeamsByLeague(league.name);
    allTeams.push(...teams);
    console.log(`   Found ${teams.length} teams`);
    await sleep(DELAY_MS);
  }

  // 2. Search priority teams not found in bulk
  for (const name of PRIORITY_TEAMS) {
    if (!allTeams.find((t) => t.strTeam === name)) {
      console.log(`🔍 Searching: ${name}`);
      const team = await searchTeamByName(name);
      if (team) allTeams.push(team);
      await sleep(DELAY_MS);
    }
  }

  console.log(`\n✅ Total teams: ${allTeams.length}\n`);

  // 3. Fetch players from priority teams
  for (const teamName of PRIORITY_TEAMS) {
    const team = allTeams.find((t) => t.strTeam === teamName);
    if (!team) continue;
    console.log(`⚽ Fetching players for ${teamName}...`);
    const players = await getPlayersByTeam(team.idTeam);
    allPlayers.push(...players.map((p) => ({ ...p, teamName, teamId: team.idTeam })));
    console.log(`   Found ${players.length} players`);
    await sleep(DELAY_MS);
  }

  console.log(`\n✅ Total players: ${allPlayers.length}\n`);

  // 4. Build ThemePack JSON
  const entities = allPlayers.map((p) => {
    const baseStats = positionToStats(p.strPosition);
    const jitter = () => Math.floor(Math.random() * 11) - 5;
    const stats = Object.fromEntries(
      Object.entries(baseStats).map(([k, v]) => [k, Math.max(1, Math.min(99, v + jitter()))])
    );

    return {
      id: `player_${p.idPlayer}`,
      name: p.strPlayer,
      description: `${p.strPosition} - ${p.teamName} (${p.strNationality})`,
      category: positionToCategory(p.strPosition),
      rarity: "common" as const,
      imageUrl: p.strCutout || p.strThumb || undefined,
      stats,
      baseStats,
      types: positionToTypes(p.strPosition),
      tags: [p.teamName.toLowerCase().replace(/\s+/g, "_"), p.strNationality?.toLowerCase()].filter(Boolean),
      skills: [],
      learnableSkills: [],
      evolutions: [],
      initialLevel: 1,
    };
  });

  const output = {
    _meta: {
      generatedAt: new Date().toISOString(),
      source: "TheSportsDB Free API",
      teamsCount: allTeams.length,
      playersCount: entities.length,
    },
    teams: allTeams.map((t) => ({
      id: t.idTeam,
      name: t.strTeam,
      badge: t.strBadge,
      stadium: t.strStadium,
      capacity: t.intStadiumCapacity,
      country: t.strCountry,
    })),
    entities,
  };

  const outPath = "./src/themes/futbolmon/scraped-data.json";
  const fs = await import("fs");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2), "utf-8");
  console.log(`\n💾 Saved to ${outPath}`);
}

main().catch(console.error);
