"use client";

import { useState } from "react";
import { BulkGenerator } from "@/components/bulk/BulkGenerator";
import { SingleGenerator } from "@/components/single/SingleGenerator";
import { APP_TITLE, DEFAULT_TYPOGRAPHY_SETTINGS, FONT_FAMILY_OPTIONS } from "@/lib/constants/tombstone";
import { TypographySettings } from "@/lib/types/tombstone";

export default function HomePage() {
  const [activeMode, setActiveMode] = useState<"single" | "bulk">("single");
  const [typographySettings, setTypographySettings] = useState<TypographySettings>(DEFAULT_TYPOGRAPHY_SETTINGS);

  function updateTypography<K extends keyof TypographySettings>(key: K, value: TypographySettings[K]): void {
    setTypographySettings((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-5 py-6 text-white md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1400px]">
        <header className="flex items-start justify-between gap-4 pb-6">
          <div>
            <h1 className="text-xl font-semibold tracking-[0.01em]">{APP_TITLE}</h1>
            <p className="pt-1 text-sm text-white/70">
              Portrait tombstone template for credentials, pitchbooks, and marketing materials.
            </p>
          </div>

          <details className="group relative min-w-[250px] rounded-md border border-white/15 bg-panel">
            <summary className="cursor-pointer list-none px-3 py-2 text-sm font-medium text-white/90 marker:content-none">
              Settings
            </summary>
            <div className="space-y-3 border-t border-white/10 px-3 py-3">
              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.08em] text-white/70">Font Family</span>
                <select
                  className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
                  value={typographySettings.fontFamily}
                  onChange={(event) =>
                    updateTypography("fontFamily", event.target.value as TypographySettings["fontFamily"])
                  }
                >
                  {FONT_FAMILY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs uppercase tracking-[0.08em] text-white/70">
                  Font Size ({typographySettings.fontSizeScale}%)
                </span>
                <input
                  type="range"
                  min={80}
                  max={140}
                  step={1}
                  className="w-full"
                  value={typographySettings.fontSizeScale}
                  onChange={(event) => updateTypography("fontSizeScale", Number(event.target.value))}
                />
              </label>
            </div>
          </details>
        </header>

        <div className="pb-4">
          <div className="inline-flex rounded-md border border-white/15 bg-panel p-1">
            <button
              type="button"
              className={`rounded px-4 py-1.5 text-sm ${
                activeMode === "single" ? "bg-white text-black" : "text-white/80"
              }`}
              onClick={() => setActiveMode("single")}
            >
              Single
            </button>
            <button
              type="button"
              className={`rounded px-4 py-1.5 text-sm ${
                activeMode === "bulk" ? "bg-white text-black" : "text-white/80"
              }`}
              onClick={() => setActiveMode("bulk")}
            >
              Bulk
            </button>
          </div>
        </div>

        {activeMode === "single" ? (
          <SingleGenerator typographySettings={typographySettings} />
        ) : (
          <BulkGenerator typographySettings={typographySettings} />
        )}
      </div>
    </main>
  );
}
