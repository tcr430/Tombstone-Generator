import {
  DownloadFormat,
  Language,
  TombstoneFormData,
  TombstoneFontFamily,
  TombstoneSize,
  TombstoneStyle,
  TypographySettings
} from "@/lib/types/tombstone";

export const APP_TITLE = "Deal Tombstone Generator";

export const LANGUAGES: Array<{ value: Language; label: string }> = [
  { value: "pt", label: "Portuguese" },
  { value: "en", label: "English" }
];

export interface LocalizedOption {
  value: string;
  label: Record<Language, string>;
}

export const SECTORS: LocalizedOption[] = [
  { value: "energy", label: { en: "Energy", pt: "Energia" } },
  { value: "defense", label: { en: "Defense", pt: "Defesa" } },
  { value: "oil_gas", label: { en: "Oil & Gas", pt: "Petróleo e Gás" } },
  { value: "infrastructure", label: { en: "Infrastructure", pt: "Infraestruturas" } },
  { value: "environment", label: { en: "Environment", pt: "Ambiente" } },
  { value: "agro_business", label: { en: "Agro Business", pt: "Agronegócio" } },
  { value: "food_beverage", label: { en: "Food & Beverage", pt: "Alimentação e Bebidas" } },
  { value: "pharma", label: { en: "Pharma", pt: "Farmacêutico" } },
  { value: "transport", label: { en: "Transport", pt: "Transportes" } },
  { value: "tmt", label: { en: "TMT", pt: "TMT" } },
  { value: "financial_services", label: { en: "Financial Services", pt: "Serviços Financeiros" } },
  { value: "construction", label: { en: "Construction", pt: "Construção" } },
  { value: "materials", label: { en: "Materials", pt: "Materiais" } },
  { value: "textiles", label: { en: "Textiles", pt: "Têxteis" } },
  { value: "retail_distribution", label: { en: "Retail & Distribution", pt: "Retalho e Distribuição" } },
  {
    value: "electronics_electrical_equipment",
    label: { en: "Electronics & Electrical Equipment", pt: "Eletrónica e Equipamento Elétrico" }
  },
  { value: "tourism_leisure", label: { en: "Tourism & Leisure", pt: "Turismo e Lazer" } },
  { value: "chemicals", label: { en: "Chemicals", pt: "Químicos" } },
  { value: "auto", label: { en: "Auto", pt: "Automóvel" } },
  { value: "health", label: { en: "Health", pt: "Saúde" } },
  { value: "real_estate", label: { en: "Real Estate", pt: "Imobiliário" } },
  { value: "other", label: { en: "Other", pt: "Outro" } }
];

export const ROLES: LocalizedOption[] = [
  { value: "financial_advisor", label: { en: "Financial Advisor", pt: "Financial Advisor" } },
  { value: "debt_advisor", label: { en: "Debt Advisor", pt: "Debt Advisor" } },
  {
    value: "mandated_lead_arranger",
    label: { en: "Mandated Lead Arranger", pt: "Mandated Lead Arranger" }
  },
  { value: "lead_arranger", label: { en: "Lead Arranger", pt: "Lead Arranger" } },
  { value: "mandated_lead_manager", label: { en: "Mandated Lead Manager", pt: "Mandated Lead Manager" } },
  { value: "lead_manager", label: { en: "Lead Manager", pt: "Lead Manager" } },
  { value: "joint_lead_manager", label: { en: "Joint Lead Manager", pt: "Joint Lead Manager" } },
  { value: "sole_bookrunner", label: { en: "Sole Bookrunner", pt: "Sole Bookrunner" } },
  { value: "joint_bookrunner", label: { en: "Joint Bookrunner", pt: "Joint Bookrunner" } },
  { value: "global_coordinator", label: { en: "Global Coordinator", pt: "Global Coordinator" } },
  {
    value: "joint_global_coordinator",
    label: { en: "Joint Global Coordinator", pt: "Joint Global Coordinator" }
  },
  { value: "lender", label: { en: "Lender", pt: "Lender" } },
  { value: "financial_intermediary", label: { en: "Financial Intermediary", pt: "Financial Intermediary" } },
  { value: "placement_agent", label: { en: "Placement Agent", pt: "Placement Agent" } }
];

export const DOWNLOAD_FORMATS: Array<{ value: DownloadFormat; label: string }> = [
  { value: "png", label: "PNG" },
  { value: "jpeg", label: "JPEG" },
  { value: "svg", label: "SVG" }
];

export const SIZE_OPTIONS: Array<{ value: TombstoneSize; label: string }> = [
  { value: "small", label: "Small (3.2 x 4.0 cm)" },
  { value: "medium", label: "Medium (4.8 x 6.0 cm)" },
  { value: "large", label: "Large (6.4 x 8.0 cm)" }
];

export const FULL_BORDER_SIZE_OPTIONS: Array<{ value: TombstoneSize; label: string }> = [
  { value: "medium", label: "Medium (2.8 x 4.0 cm)" },
  { value: "large", label: "Large (4.2 x 6.0 cm)" }
];

export const TOMBSTONE_STYLE_OPTIONS: Array<{ value: TombstoneStyle; label: string }> = [
  { value: "double-vertical", label: "Classic (2 Vertical Lines)" },
  { value: "left-top", label: "Left + Top Lines" },
  { value: "full-border-centered", label: "Full Border Centered" }
];

export const FONT_FAMILY_OPTIONS: Array<{ value: TombstoneFontFamily; label: string }> = [
  { value: "montserrat", label: "Montserrat" },
  { value: "arial", label: "Arial" },
  { value: "georgia", label: "Georgia" },
  { value: "times", label: "Times New Roman" }
];

export const DEFAULT_TYPOGRAPHY_SETTINGS: TypographySettings = {
  fontFamily: "montserrat",
  fontSizeScale: 100
};

export const MAX_LOGO_FILE_SIZE_MB = 4;
export const MAX_LOGO_FILE_SIZE_BYTES = MAX_LOGO_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_LOGO_TYPES = ["image/png", "image/jpeg", "image/svg+xml", "image/webp"];
export const MAX_DESCRIPTION_LENGTH = 170;
export const MAX_CLIENT_NAME_LENGTH = 80;

export const TOMBSTONE_SIZE_CONFIG: Record<
  TombstoneSize,
  {
    exportWidthPx: number;
    exportHeightPx: number;
    previewWidthPx: number;
    previewHeightPx: number;
    spacingScale: number;
    fontScale: number;
  }
> = {
  small: {
    exportWidthPx: 378,
    exportHeightPx: 472,
    previewWidthPx: 188,
    previewHeightPx: 235,
    spacingScale: 0.92,
    fontScale: 0.92
  },
  medium: {
    exportWidthPx: 567,
    exportHeightPx: 709,
    previewWidthPx: 220,
    previewHeightPx: 275,
    spacingScale: 1,
    fontScale: 1.15
  },
  large: {
    exportWidthPx: 756,
    exportHeightPx: 945,
    previewWidthPx: 256,
    previewHeightPx: 320,
    spacingScale: 1.08,
    fontScale: 1.3
  }
};

export const FULL_BORDER_SIZE_CONFIG: Record<
  "medium" | "large",
  {
    exportWidthPx: number;
    exportHeightPx: number;
    previewWidthPx: number;
    previewHeightPx: number;
    spacingScale: number;
    fontScale: number;
  }
> = {
  medium: {
    // 2.8 cm x 4.0 cm at 300 DPI
    exportWidthPx: 331,
    exportHeightPx: 472,
    previewWidthPx: 196,
    previewHeightPx: 280,
    spacingScale: 1,
    fontScale: 1
  },
  large: {
    // 4.2 cm x 6.0 cm at 300 DPI
    exportWidthPx: 496,
    exportHeightPx: 709,
    previewWidthPx: 238,
    previewHeightPx: 340,
    spacingScale: 1.21,
    fontScale: 1.21
  }
};

export const LAYOUT_RATIOS = {
  contentLeft: 0.132,
  logoTop: 0.14,
  logoWidth: 0.86,
  logoHeight: 0.25,
  sectorBaseline: 0.053,
  monthYearBaseline: 0.464,
  dealValueBaseline: 0.596,
  descriptionBaseline: 0.702,
  roleBaseline: 0.974
} as const;

export type TombstoneFontElement = "sector" | "date" | "description" | "role" | "dealValue" | "year";

export const FONT_BASE_SIZES: Record<TombstoneStyle, Record<TombstoneFontElement, number>> = {
  "double-vertical": {
    sector: 8,
    date: 8,
    description: 8,
    role: 8,
    dealValue: 11,
    year: 8
  },
  "left-top": {
    sector: 8,
    date: 8,
    description: 8,
    role: 8,
    dealValue: 11,
    year: 8
  },
  "full-border-centered": {
    sector: 10,
    date: 10,
    description: 10,
    role: 10.6,
    dealValue: 13.8,
    year: 10
  }
};

export const FIELD_LABELS = {
  language: "Language",
  sector: "Sector",
  month: "Date (Month + Year)",
  clientName: "Client Name",
  logoUrl: "Client Logo",
  role: "Role",
  dealValue: "Deal Value (EUR)",
  description: "Deal Description",
  esg: "ESG (1/0)",
  templateStyle: "Tombstone Style",
  backgroundMode: "Background",
  backgroundColor: "Custom Background Color",
  size: "Tombstone Size",
  format: "Download Format"
} as const;

export const DEFAULT_FORM_DATA: TombstoneFormData = {
  language: "pt",
  sector: "",
  month: "",
  clientName: "",
  logoUrl: "",
  role: "",
  dealValue: "",
  description: "",
  esg: "0",
  templateStyle: "double-vertical",
  backgroundMode: "custom",
  backgroundColor: "#FFFFFF",
  size: "medium",
  format: "png"
};

function getLocalizedLabel(options: LocalizedOption[], value: string, language: Language): string {
  const match = options.find((option) => option.value === value);
  return match ? match.label[language] : value;
}

export function getSectorLabel(value: string, language: Language): string {
  return getLocalizedLabel(SECTORS, value, language);
}

export function getRoleLabel(value: string, language: Language): string {
  return getLocalizedLabel(ROLES, value, language);
}

export function getSizeOptionsForStyle(style: TombstoneStyle): Array<{ value: TombstoneSize; label: string }> {
  if (style === "full-border-centered") {
    return FULL_BORDER_SIZE_OPTIONS;
  }
  return SIZE_OPTIONS;
}

export function getFontFamilyCss(fontFamily: TombstoneFontFamily): string {
  switch (fontFamily) {
    case "arial":
      return "Arial, Helvetica, sans-serif";
    case "georgia":
      return "Georgia, serif";
    case "times":
      return "\"Times New Roman\", Times, serif";
    case "montserrat":
    default:
      return "var(--font-montserrat), sans-serif";
  }
}

export function getSizeConfigForStyle(
  style: TombstoneStyle,
  size: TombstoneSize
): {
  exportWidthPx: number;
  exportHeightPx: number;
  previewWidthPx: number;
  previewHeightPx: number;
  spacingScale: number;
  fontScale: number;
} {
  if (style === "full-border-centered") {
    return FULL_BORDER_SIZE_CONFIG[size === "large" ? "large" : "medium"];
  }
  return TOMBSTONE_SIZE_CONFIG[size];
}

export function getFontBaseSize(style: TombstoneStyle, element: TombstoneFontElement): number {
  return FONT_BASE_SIZES[style][element];
}

export function getSortedSectors(language: Language): LocalizedOption[] {
  const nonOther = SECTORS.filter((option) => option.value !== "other").sort((a, b) =>
    a.label[language].localeCompare(b.label[language], language === "pt" ? "pt-PT" : "en-US", {
      sensitivity: "base"
    })
  );
  const other = SECTORS.find((option) => option.value === "other");
  return other ? [...nonOther, other] : nonOther;
}
