import { TombstoneFormData } from "@/lib/types/tombstone";

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})$/;
const RGB_FUNCTION_REGEX =
  /^rgb\(\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*\)$/;
const RGB_COMMA_REGEX =
  /^(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)\s*,\s*(25[0-5]|2[0-4]\d|1?\d?\d)$/;

export function normalizeBackgroundColorInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (HEX_COLOR_REGEX.test(trimmed)) {
    return trimmed;
  }

  if (RGB_FUNCTION_REGEX.test(trimmed)) {
    return trimmed;
  }

  if (RGB_COMMA_REGEX.test(trimmed)) {
    return `rgb(${trimmed})`;
  }

  return null;
}

export function getBackgroundCssColor(data: TombstoneFormData): string | null {
  if (data.backgroundMode === "transparent") {
    return null;
  }

  if (data.backgroundMode === "black") {
    return "#000000";
  }

  return normalizeBackgroundColorInput(data.backgroundColor);
}
