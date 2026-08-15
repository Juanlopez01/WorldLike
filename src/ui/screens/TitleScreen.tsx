"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ThemePack } from "@/core/types";

interface TitleScreenProps {
  themes: { pack: ThemePack; label: string }[];
  onSelectTheme: (theme: ThemePack) => void;
  onContinue?: (theme: ThemePack) => void;
}

const VERSION_NOTES = [
  {
    version: "0.2.0",
    date: "Agosto 2025",
    changes: [
      "Sistema de copas con progresión desbloqueada",
      "Tienda de leyendas: Maradona, Pelé, Zidane y más",
      "300 jugadores reales con fotos",
      "9 copas desde Liga Barrial hasta Copa del Mundo",
      "Monedas como meta-progresión",
    ],
  },
  {
    version: "0.1.0",
    date: "Julio 2025",
    changes: [
      "Motor de combate por turnos",
      "Mapa procedural con nodos",
      "Sistema de recruitment y party",
      "Eventos y tienda in-game",
      "Persistencia de partida",
    ],
  },
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
        <div className="absolute inset-0 field-barrial opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-bg" />

        <motion.div
          className="relative z-10 text-center pt-16 pb-20 px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <p className="text-xs font-bold text-text-secondary uppercase tracking-[0.3em] mb-3">
              Worldlike presenta
            </p>
            <h1 className="text-5xl font-black tracking-tight mb-2">
              <span className="text-primary">FUTBO</span>
              <span className="text-accent">LIKE</span>
            </h1>
            <div className="h-1 w-36 mx-auto mt-3 rounded-full bg-gradient-to-r from-primary via-accent to-primary" />
            <p className="text-base text-text-secondary mt-4 max-w-sm mx-auto leading-relaxed">
              Roguelite de fútbol por turnos. Arrancá en el potrero, reclutá jugadores, ganá copas y convertite en leyenda.
            </p>
          </motion.div>

          <motion.div
            className="mt-8 flex flex-col items-center gap-3 max-w-xs mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {hasSave && themes.length > 0 && onContinue && (
              <button
                onClick={() => onContinue(themes[0].pack)}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl
                  bg-primary text-white font-bold text-sm
                  hover:brightness-105 active:scale-[0.98]
                  transition-all glow-green card-shadow"
              >
                <span>▶</span>
                <span>Continuar partida</span>
              </button>
            )}

            {themes.map(({ pack }) => (
              <button
                key={pack.id}
                onClick={() => onSelectTheme(pack)}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl
                  bg-surface border-2 border-primary/20 text-text font-bold text-sm
                  hover:border-primary/50 hover:bg-surface-light
                  active:scale-[0.98] transition-all card-shadow"
              >
                <span className="text-xl">{pack.icon}</span>
                <span>Nueva partida</span>
              </button>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Features */}
      <motion.section
        className="px-6 py-10 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h2 className="text-lg font-black text-text mb-5 text-center">
          De potrero a leyenda
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "⚽", title: "300 jugadores", desc: "Todos reales con stats" },
            { icon: "🏆", title: "9 copas", desc: "Barrial → Copa del Mundo" },
            { icon: "⭐", title: "Leyendas", desc: "Maradona, Pelé, Zidane..." },
            { icon: "🗺️", title: "Procedural", desc: "Cada partida es única" },
          ].map((f, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-surface border border-border card-shadow"
            >
              <span className="text-xl block mb-1">{f.icon}</span>
              <h3 className="text-xs font-bold text-text">{f.title}</h3>
              <p className="text-[10px] text-text-secondary mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Version Notes */}
      <motion.section
        className="px-6 py-8 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <h2 className="text-lg font-black text-text mb-4 text-center">
          Notas de versión
        </h2>
        <div className="space-y-4">
          {VERSION_NOTES.map((release) => (
            <div
              key={release.version}
              className="p-4 rounded-xl bg-surface border border-border card-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-primary">
                  v{release.version}
                </span>
                <span className="text-[10px] text-text-dim">
                  {release.date}
                </span>
              </div>
              <ul className="space-y-1">
                {release.changes.map((change, i) => (
                  <li
                    key={i}
                    className="text-xs text-text-secondary flex items-start gap-2"
                  >
                    <span className="text-primary mt-0.5 text-[8px]">●</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Donation */}
      <motion.section
        className="px-6 py-10 max-w-lg mx-auto text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
      >
        <div className="p-6 rounded-2xl bg-surface border border-border card-shadow">
          <span className="text-3xl block mb-2">☕</span>
          <h2 className="text-sm font-black text-text mb-1">
            Apoyá el proyecto
          </h2>
          <p className="text-xs text-text-secondary mb-4 max-w-xs mx-auto">
            Futbolike es gratis y de código abierto. Si te gusta, podés colaborar con una donación para que siga creciendo.
          </p>
          <button
            disabled
            className="px-6 py-2 rounded-lg bg-accent/10 border border-accent/30 text-accent text-xs font-bold
              opacity-60 cursor-not-allowed"
          >
            Próximamente
          </button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="px-6 py-6 text-center border-t border-border">
        <p className="text-[10px] text-text-dim">
          Worldlike · Futbolike v0.2 · Hecho con ❤️ en Argentina
        </p>
      </footer>
    </div>
  );
}
