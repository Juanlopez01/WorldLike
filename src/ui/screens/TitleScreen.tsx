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
  { name: "Liga Barrial", region: "Potrero", diff: "1-2" },
  { name: "Copa Provincial", region: "Regional", diff: "2-3" },
  { name: "Primera División", region: "Nacional", diff: "3-5" },
  { name: "Copa Sudamericana", region: "CONMEBOL", diff: "4-6" },
  { name: "Copa Libertadores", region: "CONMEBOL", diff: "5-7" },
  { name: "Europa League", region: "UEFA", diff: "6-7" },
  { name: "Champions League", region: "UEFA", diff: "7-9" },
  { name: "Mundial de Clubes", region: "FIFA", diff: "8-9" },
  { name: "Copa del Mundo", region: "FIFA", diff: "9-10" },
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
        {/* Grid pattern background */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(rgba(0,230,118,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,230,118,0.3) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }} />
        {/* Radial glow behind logo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(ellipse, rgba(0,230,118,0.06) 0%, transparent 70%)" }}
        />

        <motion.div
          className="relative z-10 text-center pt-8 sm:pt-12 pb-8 px-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6, type: "spring", damping: 20 }}
            className="mb-4"
          >
            <img
              src="/worldlike-logo.png"
              alt="Futbolike"
              className="w-28 h-28 sm:w-36 sm:h-36 mx-auto drop-shadow-[0_0_30px_rgba(0,230,118,0.2)]"
            />
          </motion.div>

          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter leading-none">
              <span className="text-primary">FUTBO</span><span className="text-accent">LIKE</span>
            </h1>
            <div className="flex items-center justify-center gap-3 mt-2.5">
              <div className="h-px flex-1 max-w-10 bg-gradient-to-r from-transparent to-primary/30" />
              <span className="text-[8px] sm:text-[9px] font-bold text-text-dim uppercase tracking-[0.25em]">
                Roguelite de fútbol por turnos
              </span>
              <div className="h-px flex-1 max-w-10 bg-gradient-to-l from-transparent to-primary/30" />
            </div>
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            className="mt-7 flex flex-col items-center gap-2.5 max-w-xs mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {hasSave && themes.length > 0 && onContinue && (
              <button
                onClick={() => onContinue(themes[0].pack)}
                className="w-full group relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                  bg-primary/10 border border-primary/30 text-primary font-bold text-sm
                  hover:bg-primary/15 hover:border-primary/50
                  active:scale-[0.98] transition-all glow-neon"
              >
                <span className="text-primary/60 group-hover:text-primary transition-colors">&#9654;</span>
                <span>Continuar partida</span>
              </button>
            )}

            {themes.map(({ pack }) => (
              <button
                key={pack.id}
                onClick={() => onSelectTheme(pack)}
                className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl
                  bg-surface border border-border text-text font-bold text-sm
                  hover:border-primary/30 hover:bg-surface-light
                  active:scale-[0.98] transition-all card-shadow"
              >
                <span className="text-primary text-lg">{pack.icon}</span>
                <span>Nueva partida</span>
              </button>
            ))}
          </motion.div>
        </motion.div>

        {/* Separator line */}
        <div className="circuit-line mx-auto max-w-lg" />
      </div>

      {/* How to play */}
      <motion.section
        className="px-5 py-8 sm:py-10 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <SectionTitle label="Manual" title="Cómo se juega" />

        <div className="space-y-2.5 mt-5">
          {[
            {
              step: "01",
              title: "Elegí tu jugador inicial",
              desc: "Arrancás con un jugador de la liga barrial. Cada partida es distinta — el mapa, los rivales y los fichajes cambian siempre.",
            },
            {
              step: "02",
              title: "Recorré el mapa",
              desc: "Cada copa tiene un mapa con nodos: combates, eventos, tienda, fichajes y tesoros. Avanzá nodo por nodo hasta el boss.",
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
              className="flex gap-3 p-3 rounded-xl bg-surface border border-border/50 hover:border-primary/20 transition-colors"
            >
              <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/8 border border-primary/15 flex items-center justify-center">
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

      <div className="circuit-line mx-auto max-w-lg" />

      {/* Mechanics */}
      <motion.section
        className="px-5 py-8 sm:py-10 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <SectionTitle label="Mecánicas" title="Sistema de juego" />

        <div className="grid grid-cols-2 gap-2.5 mt-5">
          {[
            { icon: "⚽", title: "300 jugadores", desc: "Reales de Argentina, Brasil, Europa y leyendas con stats y fotos." },
            { icon: "🏆", title: "9 copas", desc: "Cada copa sube la dificultad y la calidad de los fichajes." },
            { icon: "⭐", title: "Leyendas", desc: "Maradona, Pelé, Zidane y más. Comprá con monedas." },
            { icon: "🗺️", title: "Mapa procedural", desc: "Rutas con combate, eventos, tienda, fichajes y tesoros." },
            { icon: "⚔️", title: "Combate táctico", desc: "Habilidades con tipo, daño y efectos según stats." },
            { icon: "🪙", title: "Meta-progresión", desc: "Monedas entre partidas para desbloquear leyendas." },
          ].map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-surface border border-border/50 hover:border-primary/20 transition-colors"
            >
              <span className="text-base block mb-1.5">{item.icon}</span>
              <h3 className="text-[11px] font-bold text-text">{item.title}</h3>
              <p className="text-[9px] text-text-secondary mt-0.5 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      <div className="circuit-line mx-auto max-w-lg" />

      {/* Copa progression */}
      <motion.section
        className="px-5 py-8 sm:py-10 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <SectionTitle label="Progresión" title="Las 9 copas" />

        <div className="mt-5 relative">
          {/* Vertical glow line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/30 via-primary/15 to-accent/30" />

          <div className="space-y-1">
            {COPA_PROGRESSION.map((copa, i) => {
              const isFirst = i === 0;
              const isLast = i === 8;
              return (
                <div key={i} className="flex items-center gap-3 pl-1 group">
                  <div className={`shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold border z-10
                    ${isFirst ? "border-primary bg-primary/15 text-primary" :
                      isLast ? "border-accent bg-accent/15 text-accent" :
                      "border-border bg-surface text-text-dim group-hover:border-primary/30 transition-colors"}`}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 flex items-center justify-between py-1.5">
                    <div>
                      <span className="text-[11px] font-bold text-text">{copa.name}</span>
                      <span className="text-[9px] text-text-dim ml-1.5">{copa.region}</span>
                    </div>
                    <span className="text-[9px] text-text-dim tabular-nums">Dif. {copa.diff}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </motion.section>

      <div className="circuit-line mx-auto max-w-lg" />

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
            <div key={i} className={`flex-1 text-center py-3.5 ${i > 0 ? "border-l border-border" : ""}`}>
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
        <div className="p-5 rounded-xl bg-surface border border-border/50 text-center">
          <h2 className="text-xs font-black text-text mb-1">
            Apoyá el proyecto
          </h2>
          <p className="text-[10px] text-text-secondary mb-3 max-w-xs mx-auto leading-relaxed">
            Futbolike es gratis y open source. Si te gusta, podés colaborar para que siga creciendo.
          </p>
          <button
            disabled
            className="px-5 py-2 rounded-lg bg-accent/8 border border-accent/15 text-accent/50 text-[10px] font-bold
              cursor-not-allowed"
          >
            Donaciones pronto
          </button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-5 py-5 text-center border-t border-border/30">
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
      <span className="text-[8px] font-bold text-primary/70 uppercase tracking-[0.3em]">{label}</span>
      <h2 className="text-base sm:text-lg font-black text-text mt-0.5">{title}</h2>
      <div className="h-px w-10 mx-auto mt-2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
    </div>
  );
}
