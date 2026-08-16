"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ThemePack } from "@/core/types";

interface TitleScreenProps {
  themes: { pack: ThemePack; label: string }[];
  onSelectTheme: (theme: ThemePack) => void;
  onContinue?: (theme: ThemePack) => void;
}

const COPA_PROGRESSION = [
  { name: "Liga Barrial", emoji: "🏟️", region: "Potrero" },
  { name: "Copa Provincial", emoji: "🏟️", region: "Regional" },
  { name: "Primera División", emoji: "🏟️", region: "Nacional" },
  { name: "Copa Sudamericana", emoji: "🌎", region: "CONMEBOL" },
  { name: "Copa Libertadores", emoji: "🌎", region: "CONMEBOL" },
  { name: "Europa League", emoji: "🌍", region: "UEFA" },
  { name: "Champions League", emoji: "🌍", region: "UEFA" },
  { name: "Mundial de Clubes", emoji: "🌐", region: "FIFA" },
  { name: "Copa del Mundo", emoji: "🏆", region: "FIFA" },
];

export function TitleScreen({ themes, onSelectTheme, onContinue }: TitleScreenProps) {
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    try {
      setHasSave(!!localStorage.getItem("futbolike_save"));
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-bg">
      {/* Hero */}
      <div className="relative overflow-hidden">
        {/* Animated field lines background */}
        <div className="absolute inset-0 opacity-[0.04]">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="field-lines" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M0 30 h60 M30 0 v60" stroke="currentColor" strokeWidth="0.5" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#field-lines)" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-bg" />

        <motion.div
          className="relative z-10 text-center pt-12 sm:pt-16 pb-12 px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-text-dim uppercase tracking-[0.4em] mb-4">
              <div className="w-3 h-px bg-text-dim" />
              Worldlike
              <div className="w-3 h-px bg-text-dim" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter leading-none">
              <span className="text-primary">FUTBO</span><span className="text-accent">LIKE</span>
            </h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-px flex-1 max-w-12 bg-gradient-to-r from-transparent to-primary/30" />
              <span className="text-[9px] font-bold text-text-dim uppercase tracking-[0.2em]">
                Roguelite de fútbol por turnos
              </span>
              <div className="h-px flex-1 max-w-12 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="mt-8 flex flex-col items-center gap-2.5 max-w-xs mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {hasSave && themes.length > 0 && onContinue && (
              <button
                onClick={() => onContinue(themes[0].pack)}
                className="w-full group relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                  bg-primary text-white font-bold text-sm
                  hover:brightness-110 active:scale-[0.98]
                  transition-all glow-green"
              >
                <span className="text-white/70 group-hover:text-white transition-colors">&#9654;</span>
                <span>Continuar partida</span>
              </button>
            )}

            {themes.map(({ pack }) => (
              <button
                key={pack.id}
                onClick={() => onSelectTheme(pack)}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl
                  bg-surface border border-border text-text font-bold text-sm
                  hover:border-primary/40 hover:bg-surface-light
                  active:scale-[0.98] transition-all card-shadow"
              >
                <span className="text-lg">{pack.icon}</span>
                <span>Nueva partida</span>
              </button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* How to play */}
      <motion.section
        className="px-5 py-10 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <SectionTitle label="Manual" title="Cómo se juega" />

        <div className="space-y-3 mt-5">
          {[
            {
              step: "01",
              title: "Elegí tu jugador inicial",
              desc: "Arrancás con un jugador de la liga barrial. Cada partida es distinta — el mapa, los rivales y los fichajes cambian siempre.",
            },
            {
              step: "02",
              title: "Recorré el mapa",
              desc: "Cada copa tiene un mapa con nodos: combates, eventos, tienda, fichajes y tesoros. Avanzá nodo por nodo hasta llegar al boss.",
            },
            {
              step: "03",
              title: "Combate por turnos",
              desc: "Elegí habilidades con efecto en el rival: gol, regate, pase, entrada. Las stats de tu jugador definen el daño y la precisión.",
            },
            {
              step: "04",
              title: "Fichá y armá tu equipo",
              desc: "Tu plantel tiene 2 jugadores (boss + 1). Cuando fichás con el plantel lleno, elegís por quién intercambiar.",
            },
            {
              step: "05",
              title: "Ganá la copa, subí de nivel",
              desc: "Derrotá al boss de cada mapa para avanzar a la siguiente copa. 9 copas, desde el potrero hasta la Copa del Mundo.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-xl bg-surface border border-border/60"
            >
              <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center">
                <span className="text-[10px] font-black text-primary tabular-nums">{item.step}</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-text">{item.title}</h3>
                <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Mechanics */}
      <motion.section
        className="px-5 py-10 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <SectionTitle label="Mecánicas" title="Sistema de juego" />

        <div className="grid grid-cols-2 gap-2.5 mt-5">
          {[
            {
              icon: "⚽",
              title: "300 jugadores",
              desc: "Jugadores reales de ligas argentinas, brasileñas, europeas y leyendas con stats y fotos.",
            },
            {
              icon: "🏆",
              title: "9 copas",
              desc: "Progresión desbloqueada — cada copa sube la dificultad y la calidad de los fichajes.",
            },
            {
              icon: "⭐",
              title: "Leyendas",
              desc: "Comprá a Maradona, Pelé, Zidane y más con monedas ganadas en partidas.",
            },
            {
              icon: "🗺️",
              title: "Mapa procedural",
              desc: "Rutas ramificadas con nodos de combate, eventos, tienda, fichajes y tesoros.",
            },
            {
              icon: "⚔️",
              title: "Combate táctico",
              desc: "Habilidades con tipo, daño y efectos. Las stats determinan el resultado.",
            },
            {
              icon: "🪙",
              title: "Meta-progresión",
              desc: "Las monedas se acumulan entre partidas para desbloquear leyendas.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-surface border border-border/60"
            >
              <span className="text-base block mb-1.5">{item.icon}</span>
              <h3 className="text-[11px] font-bold text-text">{item.title}</h3>
              <p className="text-[9px] text-text-secondary mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Copa progression */}
      <motion.section
        className="px-5 py-10 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <SectionTitle label="Progresión" title="Las 9 copas" />

        <div className="mt-5 relative">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/20 via-primary/40 to-accent/40" />

          <div className="space-y-1.5">
            {COPA_PROGRESSION.map((copa, i) => (
              <div key={i} className="flex items-center gap-3 pl-1">
                <div className={`shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] border-2 z-10
                  ${i === 0 ? "border-primary bg-primary/10" : i === 8 ? "border-accent bg-accent/10" : "border-border bg-surface"}`}
                >
                  {i + 1}
                </div>
                <div className="flex-1 flex items-center justify-between py-1.5">
                  <div>
                    <span className="text-[11px] font-bold text-text">{copa.name}</span>
                    <span className="text-[9px] text-text-dim ml-1.5">{copa.region}</span>
                  </div>
                  <span className="text-sm">{copa.emoji}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats strip */}
      <motion.section
        className="px-5 py-8 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex items-stretch rounded-xl overflow-hidden border border-border bg-surface">
          {[
            { value: "300", label: "Jugadores" },
            { value: "9", label: "Copas" },
            { value: "10", label: "Leyendas" },
            { value: "42", label: "Eventos" },
          ].map((stat, i) => (
            <div key={i} className={`flex-1 text-center py-3 ${i > 0 ? "border-l border-border" : ""}`}>
              <div className="text-lg sm:text-xl font-black text-primary tabular-nums leading-none">{stat.value}</div>
              <div className="text-[8px] sm:text-[9px] font-bold text-text-dim uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Donation */}
      <motion.section
        className="px-5 py-8 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
      >
        <div className="p-5 rounded-xl bg-surface border border-border text-center">
          <h2 className="text-xs font-black text-text mb-1">
            Apoyá el proyecto
          </h2>
          <p className="text-[10px] text-text-secondary mb-3 max-w-xs mx-auto leading-relaxed">
            Futbolike es gratis y open source. Si te gusta, podés colaborar para que siga creciendo.
          </p>
          <button
            disabled
            className="px-5 py-2 rounded-lg bg-accent/8 border border-accent/20 text-accent text-[10px] font-bold
              opacity-50 cursor-not-allowed"
          >
            Donaciones pronto
          </button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-5 py-5 text-center border-t border-border/50">
        <p className="text-[9px] text-text-dim tracking-wide">
          Worldlike &middot; Futbolike v0.2 &middot; Hecho en Argentina
        </p>
      </footer>
    </div>
  );
}

function SectionTitle({ label, title }: { label: string; title: string }) {
  return (
    <div className="text-center">
      <span className="text-[8px] font-bold text-primary uppercase tracking-[0.3em]">{label}</span>
      <h2 className="text-base sm:text-lg font-black text-text mt-0.5">{title}</h2>
      <div className="h-px w-10 mx-auto mt-2 bg-primary/20" />
    </div>
  );
}
