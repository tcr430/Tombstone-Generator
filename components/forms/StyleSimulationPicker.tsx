"use client";

import { TOMBSTONE_STYLE_OPTIONS } from "@/lib/constants/tombstone";
import { TombstoneStyle } from "@/lib/types/tombstone";

interface StyleSimulationPickerProps {
  value: TombstoneStyle;
  onChange: (style: TombstoneStyle) => void;
}

function StyleWireframe({ style }: { style: TombstoneStyle }) {
  if (style === "full-border-centered") {
    return (
      <div className="relative h-[142px] w-[100px] bg-[#111]">
        <div className="absolute inset-[6px] rounded-[6px] border-[3px] border-[#cfcfcf]" />
        <div className="absolute left-1/2 top-[18px] h-[24px] w-[66px] -translate-x-1/2 border border-dashed border-white/35" />
        <div className="absolute left-1/2 top-[53px] h-[14px] w-[58px] -translate-x-1/2 border border-dashed border-white/35" />
        <div className="absolute left-1/2 top-[74px] h-[26px] w-[72px] -translate-x-1/2 border border-dashed border-white/35" />
        <div className="absolute left-1/2 top-[108px] h-[11px] w-[54px] -translate-x-1/2 border border-dashed border-white/35" />
        <div className="absolute left-1/2 top-[123px] h-[9px] w-[30px] -translate-x-1/2 border border-dashed border-white/35" />
      </div>
    );
  }

  return (
    <div className="relative h-[142px] w-[100px] bg-[#111]">
      <div className="absolute inset-0 border-l border-[#a6a6a6]" />
      {style === "double-vertical" && <div className="absolute inset-0 border-r border-[#a6a6a6]" />}
      {style === "left-top" && <div className="absolute inset-0 border-t border-[#a6a6a6]" />}

      <div className="absolute left-[6px] top-[8px] h-[8px] w-[40px] border border-dashed border-white/35" />
      <div className="absolute left-1/2 top-[20px] h-[38px] w-[72px] -translate-x-1/2 border border-dashed border-white/35" />
      <div className="absolute left-[6px] top-[68px] h-[10px] w-[44px] border border-dashed border-white/35" />
      <div className="absolute left-[6px] top-[86px] h-[13px] w-[52px] border border-dashed border-white/35" />
      <div className="absolute left-[6px] top-[106px] h-[16px] w-[72px] border border-dashed border-white/35" />
      <div className="absolute left-[6px] top-[128px] h-[8px] w-[46px] border border-dashed border-white/35" />
    </div>
  );
}

export function StyleSimulationPicker({ value, onChange }: StyleSimulationPickerProps) {
  return (
    <div className="grid grid-cols-1 gap-2 pt-2 sm:grid-cols-3">
      {TOMBSTONE_STYLE_OPTIONS.map((style) => {
        const active = value === style.value;
        return (
          <button
            key={style.value}
            type="button"
            className={`rounded-md border p-2 text-left transition ${
              active ? "border-white/65 bg-white/5" : "border-white/15 hover:border-white/30"
            }`}
            onClick={() => onChange(style.value)}
          >
            <div className="flex justify-center pb-2">
              <StyleWireframe style={style.value} />
            </div>
            <p className="text-[11px] leading-tight text-white/80">{style.label}</p>
          </button>
        );
      })}
    </div>
  );
}

