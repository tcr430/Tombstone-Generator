"use client";

import { RefObject } from "react";
import { TombstoneFormData, TypographySettings } from "@/lib/types/tombstone";
import { TombstoneCard } from "@/components/tombstone/TombstoneCard";

interface TombstonePreviewProps {
  data: TombstoneFormData;
  exportRef: RefObject<HTMLDivElement>;
  typographySettings: TypographySettings;
}

export function TombstonePreview({ data, exportRef, typographySettings }: TombstonePreviewProps) {
  return (
    <section className="rounded-xl border border-panelBorder bg-panel p-5">
      <h2 className="pb-4 text-sm font-semibold uppercase tracking-[0.11em] text-white/80">Live Preview</h2>

      <div className="flex min-h-[560px] items-center justify-center rounded-lg border border-white/10 bg-[#0d0d0d] p-6">
        <TombstoneCard data={data} mode="preview" typographySettings={typographySettings} />
      </div>

      <div className="absolute -left-[9999px] top-0">
        <TombstoneCard ref={exportRef} data={data} mode="export" typographySettings={typographySettings} />
      </div>
    </section>
  );
}
