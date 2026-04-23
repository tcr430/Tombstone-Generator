export type Language = "pt" | "en";
export type TombstoneSize = "small" | "medium" | "large";
export type DownloadFormat = "png" | "jpeg" | "svg";
export type BackgroundMode = "black" | "custom" | "transparent";
export type EsgFlag = "0" | "1";
export type TombstoneStyle = "double-vertical" | "left-top" | "full-border-centered";
export type TombstoneFontFamily = "montserrat" | "arial" | "georgia" | "times";

export interface TypographySettings {
  fontFamily: TombstoneFontFamily;
  fontSizeScale: number;
}

export interface TombstoneFormData {
  language: Language;
  sector: string;
  month: string;
  clientName: string;
  logoUrl: string;
  role: string;
  dealValue: string;
  description: string;
  esg: EsgFlag;
  templateStyle: TombstoneStyle;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  size: TombstoneSize;
  format: DownloadFormat;
}

export interface TombstoneFormErrors {
  sector?: string;
  month?: string;
  clientName?: string;
  logoUrl?: string;
  role?: string;
  dealValue?: string;
  description?: string;
  esg?: string;
  backgroundColor?: string;
  format?: string;
}
