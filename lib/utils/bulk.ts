import JSZip from "jszip";
import { LocalizedOption, ROLES, SECTORS } from "@/lib/constants/tombstone";
import { BulkGlobalSettings, BulkInputRow, BulkValidatedRow } from "@/lib/types/bulk";
import { TombstoneFormData } from "@/lib/types/tombstone";
import { validateForm } from "@/lib/utils/validation";
import { MAX_DESCRIPTION_LENGTH } from "@/lib/constants/tombstone";

export const BULK_MAX_DEALS = 100;
export const BULK_MAX_SHEET_SIZE_BYTES = 5 * 1024 * 1024;
export const BULK_MAX_LOGO_ZIP_SIZE_BYTES = 50 * 1024 * 1024;

const REQUIRED_COLUMNS = [
  "deal_date",
  "client_name",
  "sector",
  "role",
  "deal_value",
  "description",
  "esg",
  "logo_key"
] as const;

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "_");
}

function normalizeForMatch(value: string): string {
  return value.trim().toLowerCase();
}

export function sanitizeFilenamePart(value: string): string {
  return value
    .trim()
    .replace(/[<>:\"/\\|?*\u0000-\u001F]/g, "")
    .replace(/\s+/g, "-")
    .replace(/_+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^\.+$/, "")
    .replace(/^[-.]+|[-.]+$/g, "") || "na";
}

export function buildBulkFilename(dealDate: string, clientName: string, roleLabel: string): string {
  return [sanitizeFilenamePart(dealDate), sanitizeFilenamePart(clientName), sanitizeFilenamePart(roleLabel)].join("_");
}

export async function parseBulkSpreadsheet(file: File): Promise<BulkInputRow[]> {
  const lowerName = file.name.toLowerCase();
  if (lowerName.endsWith(".csv")) {
    const csvText = await file.text();
    return parseCsvRows(csvText);
  }
  return parseXlsxRows(await file.arrayBuffer());
}

export function getMissingColumns(file: File, rows: BulkInputRow[]): string[] {
  if (rows.length > 0) {
    return [];
  }
  void file;
  return [...REQUIRED_COLUMNS];
}

function normalizeRawRow(headers: string[], values: string[], rowNumber: number): BulkInputRow {
  const normalized: Record<string, string> = {};
  headers.forEach((header, index) => {
    normalized[header] = (values[index] ?? "").trim();
  });

  return {
    rowNumber,
    dealDate: normalized.deal_date ?? "",
    clientName: normalized.client_name ?? "",
    sector: normalized.sector ?? "",
    role: normalized.role ?? "",
    dealValue: normalized.deal_value ?? "",
    description: normalized.description ?? "",
    esg: normalized.esg ?? "",
    logoKey: normalized.logo_key ?? ""
  };
}

function hasAnyField(row: BulkInputRow): boolean {
  return Boolean(
    row.dealDate ||
      row.clientName ||
      row.sector ||
      row.role ||
      row.dealValue ||
      row.description ||
      row.esg ||
      row.logoKey
  );
}

async function parseXlsxRows(buffer: ArrayBuffer): Promise<BulkInputRow[]> {
  const excelModule = await import("exceljs/dist/exceljs.min.js");
  const ExcelJS = (excelModule as unknown as { default?: { Workbook: new () => any }; Workbook?: new () => any })
    .default ?? (excelModule as unknown as { Workbook: new () => any });
  const WorkbookCtor = ExcelJS.Workbook;
  const workbook = new WorkbookCtor();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.getWorksheet("Deals") ?? workbook.worksheets[0];
  if (!sheet) {
    return [];
  }

  const headerRow = sheet.getRow(1);
  const headerValues = Array.isArray(headerRow.values)
    ? headerRow.values.slice(1)
    : Object.values(headerRow.values).slice(1);
  const headers = headerValues.map((value: unknown) => normalizeHeader(String(value ?? "")));

  const rows: BulkInputRow[] = [];
  for (let rowIndex = 2; rowIndex <= sheet.rowCount; rowIndex += 1) {
    const row = sheet.getRow(rowIndex);
    const rowValues = Array.isArray(row.values) ? row.values.slice(1) : Object.values(row.values).slice(1);
    const values = rowValues.map((value: unknown) => String(value ?? ""));
    const normalizedRow = normalizeRawRow(headers, values, rowIndex);
    if (hasAnyField(normalizedRow)) {
      rows.push(normalizedRow);
    }
  }

  return rows;
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === "\"") {
      if (inQuotes && line[i + 1] === "\"") {
        current += "\"";
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values;
}

function parseCsvRows(text: string): BulkInputRow[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.length > 0);
  if (lines.length === 0) {
    return [];
  }
  const headers = parseCsvLine(lines[0]).map((value) => normalizeHeader(value));
  const rows: BulkInputRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvLine(lines[i]).map((value) => value.trim());
    const row = normalizeRawRow(headers, values, i + 1);
    if (hasAnyField(row)) {
      rows.push(row);
    }
  }
  return rows;
}

function findOptionValue(input: string, options: LocalizedOption[]): string | null {
  const normalized = normalizeForMatch(input);
  const match = options.find((option) => {
    return (
      normalizeForMatch(option.value) === normalized ||
      normalizeForMatch(option.label.en) === normalized ||
      normalizeForMatch(option.label.pt) === normalized
    );
  });
  return match ? match.value : null;
}

function findRoleValueEnglishOnly(input: string, options: LocalizedOption[]): string | null {
  const normalized = normalizeForMatch(input);
  const match = options.find((option) => {
    return normalizeForMatch(option.value) === normalized || normalizeForMatch(option.label.en) === normalized;
  });
  return match ? match.value : null;
}

function isValidDealDate(value: string): boolean {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value.trim());
}

function parseEsgFlag(value: string): "0" | "1" | null {
  const normalized = value.trim();
  if (normalized === "0" || normalized === "1") {
    return normalized;
  }
  return null;
}

function getRoleLabelByValue(value: string, language: BulkGlobalSettings["language"]): string {
  const option = ROLES.find((entry) => entry.value === value);
  return option ? option.label[language] : value;
}

export async function parseLogosZip(file: File): Promise<Map<string, JSZip.JSZipObject>> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const map = new Map<string, JSZip.JSZipObject>();

  for (const [path, entry] of Object.entries(zip.files) as Array<[string, JSZip.JSZipObject]>) {
    if (entry.dir) continue;
    const filename = path.split("/").pop() ?? "";
    const dotIndex = filename.lastIndexOf(".");
    const ext = dotIndex > 0 ? filename.slice(dotIndex + 1).trim().toLowerCase() : "";
    if (ext !== "png") continue;
    const key = (dotIndex > 0 ? filename.slice(0, dotIndex) : filename).trim().toLowerCase();
    if (key) {
      map.set(key, entry);
    }
  }

  return map;
}

export function validateBulkRows(
  rows: BulkInputRow[],
  logosMap: Map<string, JSZip.JSZipObject>,
  globalSettings: BulkGlobalSettings
): { validRows: BulkValidatedRow[]; errors: Array<{ rowNumber: number; message: string }> } {
  const validRows: BulkValidatedRow[] = [];
  const errors: Array<{ rowNumber: number; message: string }> = [];

  rows.forEach((row) => {
    const issues: string[] = [];

    if (!isValidDealDate(row.dealDate)) {
      issues.push("deal_date must be YYYY-MM");
    }

    const sectorValue = findOptionValue(row.sector, SECTORS);
    if (!sectorValue) {
      issues.push("invalid sector");
    }

    const roleValue = findRoleValueEnglishOnly(row.role, ROLES);
    if (!roleValue) {
      issues.push("invalid role (use English role from template)");
    }

    const esgFlag = parseEsgFlag(row.esg);
    if (!esgFlag) {
      issues.push("esg must be 1 or 0");
    }

    if (!row.logoKey.trim()) {
      issues.push("logo_key is required");
    } else if (!logosMap.has(row.logoKey.trim().toLowerCase())) {
      issues.push(`logo_key '${row.logoKey}' not found as PNG in logo zip`);
    }

    const formData: TombstoneFormData = {
      language: globalSettings.language,
      sector: sectorValue ?? "",
      month: row.dealDate.trim(),
      clientName: row.clientName.trim(),
      logoUrl: "__bulk_logo__",
      role: roleValue ?? "",
      dealValue: row.dealValue.trim(),
      description: row.description.trim(),
      esg: esgFlag ?? "0",
      templateStyle: globalSettings.templateStyle,
      backgroundMode: globalSettings.backgroundMode,
      backgroundColor: globalSettings.backgroundColor,
      size: globalSettings.size,
      format: globalSettings.format
    };

    const fieldErrors = validateForm(formData);
    const fieldMessages = Object.values(fieldErrors).filter(Boolean) as string[];
    issues.push(...fieldMessages);

    if (issues.length > 0) {
      errors.push({ rowNumber: row.rowNumber, message: issues.join("; ") });
      return;
    }

    const roleLabel = getRoleLabelByValue(roleValue ?? "", globalSettings.language);
    validRows.push({
      rowNumber: row.rowNumber,
      logoKey: row.logoKey.trim().toLowerCase(),
      filenameBase: buildBulkFilename(formData.month, formData.clientName, roleLabel),
      formData
    });
  });

  return { validRows, errors };
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function buildBulkTemplateWorkbook(): Promise<Blob> {
  const excelModule = await import("exceljs/dist/exceljs.min.js");
  const ExcelJS = (excelModule as unknown as { default?: { Workbook: new () => any }; Workbook?: new () => any })
    .default ?? (excelModule as unknown as { Workbook: new () => any });
  const WorkbookCtor = ExcelJS.Workbook;
  const workbook = new WorkbookCtor();

  const dealsSheet = workbook.addWorksheet("Deals");
  dealsSheet.columns = [
    { header: "entry_id", key: "entry_id", width: 10 },
    { header: "deal_date", key: "deal_date", width: 14 },
    { header: "client_name", key: "client_name", width: 26 },
    { header: "sector", key: "sector", width: 24 },
    { header: "role", key: "role", width: 30 },
    { header: "deal_value", key: "deal_value", width: 16 },
    { header: "description", key: "description", width: 44 },
    { header: "esg", key: "esg", width: 10 },
    { header: "logo_key", key: "logo_key", width: 20 }
  ];

  for (let i = 1; i <= BULK_MAX_DEALS; i += 1) {
    dealsSheet.addRow({
      entry_id: i,
      deal_date: "",
      client_name: "",
      sector: "",
      role: "",
      deal_value: "",
      description: "",
      esg: "",
      logo_key: ""
    });
  }

  const headerRow = dealsSheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1F2937" }
  };
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  dealsSheet.views = [{ state: "frozen", ySplit: 1 }];

  // Hidden in-sheet lists so users only need the Deals sheet.
  dealsSheet.getCell("K1").value = "roles_en";
  dealsSheet.getCell("L1").value = "sectors_en";
  const maxRows = Math.max(ROLES.length, SECTORS.length);
  for (let i = 0; i < maxRows; i += 1) {
    dealsSheet.getCell(`K${i + 2}`).value = ROLES[i]?.label.en ?? "";
    dealsSheet.getCell(`L${i + 2}`).value = SECTORS[i]?.label.en ?? "";
  }
  dealsSheet.getColumn("K").hidden = true;
  dealsSheet.getColumn("L").hidden = true;

  const roleValidationRange = `$K$2:$K$${ROLES.length + 1}`;
  const sectorValidationRange = `$L$2:$L$${SECTORS.length + 1}`;
  for (let row = 2; row <= BULK_MAX_DEALS + 1; row += 1) {
    dealsSheet.getCell(`D${row}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [sectorValidationRange],
      showErrorMessage: true,
      error: "Select a sector from the dropdown list."
    };
    dealsSheet.getCell(`E${row}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [roleValidationRange],
      showErrorMessage: true,
      error: "Select a role from the dropdown list."
    };
    dealsSheet.getCell(`H${row}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: ["\"0,1\""],
      showErrorMessage: true,
      error: "ESG must be 1 or 0."
    };
  }

  const instructionsSheet = workbook.addWorksheet("Instructions");
  instructionsSheet.columns = [{ header: "Guidance", key: "guidance", width: 120 }];
  instructionsSheet.getRow(1).font = { bold: true };
  instructionsSheet.addRows([
    ["1) Fill rows in 'Deals' from entry_id 1 to 100. Leave unused rows empty."],
    ["2) deal_date format must be YYYY-MM (example: 2026-01)."],
    [`3) description max length: ${MAX_DESCRIPTION_LENGTH} characters.`],
    ["4) role must be selected from the dropdown (English only)."],
    ["5) sector must be selected from the dropdown."],
    ["6) esg must be 1 (ESG deal) or 0 (non-ESG)."],
    ["7) logo_key maps to a PNG filename in the logos zip, without extension."],
    ["8) Example: logo_key = semapa -> file semapa.png inside logos ZIP."]
  ]);

  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
}
