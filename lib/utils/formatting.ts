import { Language } from "@/lib/types/tombstone";

const PT_MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Mar\u00e7o",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export function parseDealValue(rawValue: string): number | null {
  const normalized = rawValue.replace(/[^\d.,]/g, "").replace(",", ".");
  const parsed = Number.parseFloat(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

export function formatDealValue(rawValue: string, language: Language): string {
  if (rawValue.trim().toLowerCase() === "undisclosed") {
    return "Undisclosed";
  }

  const numericValue = parseDealValue(rawValue);
  if (numericValue === null) {
    return "";
  }

  if (language === "pt") {
    const formatted = new Intl.NumberFormat("pt-PT", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numericValue);
    return `${formatted} \u20ac`;
  }

  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numericValue);
  return `\u20ac ${formatted}`;
}

export function formatMonthYear(monthValue: string, language: Language): string {
  if (!monthValue) {
    return "";
  }

  const [yearText, monthText] = monthValue.split("-");
  const year = Number.parseInt(yearText, 10);
  const monthIndex = Number.parseInt(monthText, 10) - 1;

  if (!Number.isFinite(year) || !Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return "";
  }

  const monthName = language === "pt" ? PT_MONTHS[monthIndex] : EN_MONTHS[monthIndex];
  return `${monthName} ${year}`;
}
