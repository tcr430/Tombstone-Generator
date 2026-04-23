import {
  BackgroundMode,
  DownloadFormat,
  Language,
  TombstoneFormData,
  TombstoneSize,
  TombstoneStyle
} from "@/lib/types/tombstone";

export interface BulkGlobalSettings {
  language: Language;
  size: TombstoneSize;
  format: DownloadFormat;
  backgroundMode: BackgroundMode;
  backgroundColor: string;
  templateStyle: TombstoneStyle;
  pptxPerSlide: 4 | 6 | 8;
}

export interface BulkInputRow {
  rowNumber: number;
  dealDate: string;
  clientName: string;
  sector: string;
  role: string;
  dealValue: string;
  description: string;
  esg: string;
  logoKey: string;
}

export interface BulkValidatedRow {
  rowNumber: number;
  logoKey: string;
  filenameBase: string;
  formData: TombstoneFormData;
}

export interface BulkRowStatus {
  rowNumber: number;
  status: "valid" | "error";
  message: string;
}
