"use client";

import type { ThemePack } from "@/core/types";

interface ResourceBarProps {
  resources: Record<string, number>;
  theme: ThemePack;
}

export function ResourceBar({ resources, theme }: ResourceBarProps) {
  return (
    <div className="flex items-center gap-3 text-xs">
      {theme.resourceDefinitions.map((def) => (
        <div
          key={def.id}
          className="flex items-center gap-1 px-2 py-1 rounded-md bg-surface border border-border"
        >
          <span>{def.icon}</span>
          <span className="font-mono text-text">{resources[def.id] ?? 0}</span>
        </div>
      ))}
    </div>
  );
}
