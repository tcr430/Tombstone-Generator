"use client";

import { useMemo, useRef, useState } from "react";
import JSZip from "jszip";
import { TombstoneCard } from "@/components/tombstone/TombstoneCard";
import { StyleSimulationPicker } from "@/components/forms/StyleSimulationPicker";
import {
  DEFAULT_FORM_DATA,
  DOWNLOAD_FORMATS,
  FIELD_LABELS,
  getSizeOptionsForStyle,
  LANGUAGES,
  SIZE_OPTIONS,
  TOMBSTONE_STYLE_OPTIONS
} from "@/lib/constants/tombstone";
import { BulkGlobalSettings, BulkInputRow, BulkRowStatus, BulkValidatedRow } from "@/lib/types/bulk";
import {
  BULK_MAX_DEALS,
  BULK_MAX_LOGO_ZIP_SIZE_BYTES,
  BULK_MAX_SHEET_SIZE_BYTES,
  buildBulkTemplateWorkbook,
  downloadBlob,
  parseBulkSpreadsheet,
  parseLogosZip,
  validateBulkRows
} from "@/lib/utils/bulk";
import { getBackgroundCssColor } from "@/lib/utils/color";
import { renderTombstoneBlob } from "@/lib/utils/export";
import { exportBulkEditableTombstonesPptx } from "@/lib/utils/export-pptx";
import { normalizeImageBlob } from "@/lib/utils/image";
import { TypographySettings } from "@/lib/types/tombstone";

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

interface BulkGeneratorProps {
  typographySettings: TypographySettings;
}

function getExportTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

export function BulkGenerator({ typographySettings }: BulkGeneratorProps) {
  const [settings, setSettings] = useState<BulkGlobalSettings>({
    language: "pt",
    size: "medium",
    format: "png",
    templateStyle: "double-vertical",
    pptxPerSlide: 6,
    backgroundMode: "transparent",
    backgroundColor: ""
  });
  const [sheetFile, setSheetFile] = useState<File | null>(null);
  const [logosZipFile, setLogosZipFile] = useState<File | null>(null);
  const [inputRows, setInputRows] = useState<BulkInputRow[]>([]);
  const [rowStatuses, setRowStatuses] = useState<BulkRowStatus[]>([]);
  const [validRows, setValidRows] = useState<BulkValidatedRow[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPptx, setIsGeneratingPptx] = useState(false);
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [renderData, setRenderData] = useState(DEFAULT_FORM_DATA);

  const exportRef = useRef<HTMLDivElement>(null);

  const validCount = useMemo(() => rowStatuses.filter((row) => row.status === "valid").length, [rowStatuses]);
  const errorCount = useMemo(() => rowStatuses.filter((row) => row.status === "error").length, [rowStatuses]);
  const sizeOptions = getSizeOptionsForStyle(settings.templateStyle);
  const DEFAULT_BULK_SETTINGS: BulkGlobalSettings = {
    language: "pt",
    size: "medium",
    format: "png",
    templateStyle: "double-vertical",
    pptxPerSlide: 6,
    backgroundMode: "transparent",
    backgroundColor: ""
  };

  async function handleTemplateDownload(): Promise<void> {
    const blob = await buildBulkTemplateWorkbook();
    downloadBlob(blob, "tombstone_bulk_template.xlsx");
  }

  function resetResults(): void {
    setInputRows([]);
    setRowStatuses([]);
    setValidRows([]);
  }

  function handleBulkReset(): void {
    setSettings(DEFAULT_BULK_SETTINGS);
    setSheetFile(null);
    setLogosZipFile(null);
    setRenderData(DEFAULT_FORM_DATA);
    setBulkError(null);
    resetResults();
  }

  function validateSheetFile(file: File): string | null {
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".xlsx") && !lowerName.endsWith(".csv")) {
      return "Spreadsheet must be .xlsx or .csv.";
    }
    if (file.size > BULK_MAX_SHEET_SIZE_BYTES) {
      return "Spreadsheet file is too large (max 5MB).";
    }
    return null;
  }

  function validateLogosZipFile(file: File): string | null {
    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith(".zip")) {
      return "Logos file must be a .zip archive.";
    }
    if (file.size > BULK_MAX_LOGO_ZIP_SIZE_BYTES) {
      return "Logos ZIP is too large (max 50MB).";
    }
    return null;
  }

  function updateSettings<K extends keyof BulkGlobalSettings>(key: K, value: BulkGlobalSettings[K]): void {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (key === "backgroundMode" && value === "transparent" && settings.format === "jpeg") {
      setSettings((prev) => ({ ...prev, format: "png" }));
    }
    if (key === "templateStyle" && value === "full-border-centered" && settings.size === "small") {
      setSettings((prev) => ({ ...prev, size: "medium" }));
    }
  }

  async function handleValidate(): Promise<void> {
    if (!sheetFile || !logosZipFile) {
      setBulkError("Please upload both the deals spreadsheet and logos ZIP.");
      return;
    }

    setIsValidating(true);
    setBulkError(null);
    try {
      const parsedRows = await parseBulkSpreadsheet(sheetFile);
      const logosMap = await parseLogosZip(logosZipFile);

      if (parsedRows.length === 0) {
        setBulkError("No data rows found in the first worksheet.");
        setInputRows([]);
        setRowStatuses([]);
        setValidRows([]);
        return;
      }

      if (parsedRows.length > BULK_MAX_DEALS) {
        setBulkError(`Maximum ${BULK_MAX_DEALS} deals allowed per bulk file.`);
        setInputRows(parsedRows);
        setRowStatuses([]);
        setValidRows([]);
        return;
      }

      const validation = validateBulkRows(parsedRows, logosMap, settings);
      const validStatusRows: BulkRowStatus[] = validation.validRows.map((row) => ({
        rowNumber: row.rowNumber,
        status: "valid",
        message: "Ready"
      }));
      const errorStatusRows: BulkRowStatus[] = validation.errors.map((row) => ({
        rowNumber: row.rowNumber,
        status: "error",
        message: row.message
      }));

      const mergedStatuses = [...validStatusRows, ...errorStatusRows].sort((a, b) => a.rowNumber - b.rowNumber);
      setInputRows(parsedRows);
      setRowStatuses(mergedStatuses);
      setValidRows(validation.validRows);
    } catch {
      setBulkError("Could not parse spreadsheet or logo zip. Please check file formats.");
      setInputRows([]);
      setRowStatuses([]);
      setValidRows([]);
    } finally {
      setIsValidating(false);
    }
  }

  async function handleGenerateZip(): Promise<void> {
    if (!sheetFile || !logosZipFile || validRows.length === 0) {
      setBulkError("Validate bulk input first. At least one valid row is required.");
      return;
    }

    setIsGenerating(true);
    setBulkError(null);

    const zip = new JSZip();
    const timestamp = getExportTimestamp();
    const logosMap = await parseLogosZip(logosZipFile);
    const logoUrlMap = new Map<string, string>();

    try {
      for (const row of validRows) {
        const node = exportRef.current;
        const logoEntry = logosMap.get(row.logoKey);
        if (!node || !logoEntry) {
          continue;
        }

        let logoUrl = logoUrlMap.get(row.logoKey);
        if (!logoUrl) {
          const logoBlob = await logoEntry.async("blob");
          let normalizedLogoBlob: Blob = logoBlob;
          try {
            normalizedLogoBlob = await normalizeImageBlob(logoBlob, { maxDimension: 1600, outputType: "image/png" });
          } catch {
            normalizedLogoBlob = logoBlob;
          }
          logoUrl = URL.createObjectURL(normalizedLogoBlob);
          logoUrlMap.set(row.logoKey, logoUrl);
        }

        const rowData = {
          ...row.formData,
          logoUrl
        };
        setRenderData(rowData);
        await waitForNextPaint();

        const rendered = await renderTombstoneBlob(
          node,
          rowData.size,
          rowData.templateStyle,
          rowData.format,
          getBackgroundCssColor(rowData)
        );
        zip.file(`${row.filenameBase}_${rowData.size}.${rendered.extension}`, rendered.blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, `tombstones_bulk_${timestamp}.zip`);
    } catch {
      setBulkError("Bulk generation failed while rendering files.");
    } finally {
      logoUrlMap.forEach((url) => URL.revokeObjectURL(url));
      setIsGenerating(false);
    }
  }

  async function handleGeneratePptx(): Promise<void> {
    if (!sheetFile || !logosZipFile || validRows.length === 0) {
      setBulkError("Validate bulk input first. At least one valid row is required.");
      return;
    }

    setIsGeneratingPptx(true);
    setBulkError(null);
    const timestamp = getExportTimestamp();
    const logosMap = await parseLogosZip(logosZipFile);
    const logoUrlMap = new Map<string, string>();

    try {
      const pptxEntries: Array<{ formData: typeof validRows[number]["formData"]; backgroundColor: string | null }> = [];
      for (const row of validRows) {
        const logoEntry = logosMap.get(row.logoKey);
        if (!logoEntry) {
          continue;
        }

        let logoUrl = logoUrlMap.get(row.logoKey);
        if (!logoUrl) {
          const logoBlob = await logoEntry.async("blob");
          let normalizedLogoBlob: Blob = logoBlob;
          try {
            normalizedLogoBlob = await normalizeImageBlob(logoBlob, { maxDimension: 1600, outputType: "image/png" });
          } catch {
            normalizedLogoBlob = logoBlob;
          }
          logoUrl = URL.createObjectURL(normalizedLogoBlob);
          logoUrlMap.set(row.logoKey, logoUrl);
        }

        const rowData = {
          ...row.formData,
          logoUrl
        };
        pptxEntries.push({
          formData: rowData,
          backgroundColor: getBackgroundCssColor(rowData)
        });
      }

      await exportBulkEditableTombstonesPptx(
        pptxEntries,
        typographySettings,
        settings.pptxPerSlide,
        `tombstones_bulk_editable_${settings.pptxPerSlide}-per-slide_${timestamp}.pptx`
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setBulkError(`Bulk editable PPTX generation failed: ${message}`);
    } finally {
      logoUrlMap.forEach((url) => URL.revokeObjectURL(url));
      setIsGeneratingPptx(false);
    }
  }

  return (
    <section className="rounded-xl border border-panelBorder bg-panel p-5">
      <h2 className="pb-4 text-sm font-semibold uppercase tracking-[0.11em] text-white/80">Bulk Mode</h2>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[420px_1fr]">
        <div className="space-y-4">
          <button
            type="button"
            className="w-full rounded-md border border-white/20 bg-transparent px-4 py-2 text-sm font-medium"
            onClick={handleTemplateDownload}
          >
            Download Bulk Template
          </button>

          <label className="block">
            <span className="mb-1 block text-sm text-muted">Deals Spreadsheet (.xlsx/.csv)</span>
            <input
              type="file"
              accept=".xlsx,.csv"
              className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-xs file:text-white"
              onChange={(event) => {
                const next = event.target.files?.[0] ?? null;
                if (next) {
                  const msg = validateSheetFile(next);
                  if (msg) {
                    setSheetFile(null);
                    setBulkError(msg);
                    resetResults();
                    return;
                  }
                }
                setSheetFile(next);
                setBulkError(null);
                resetResults();
              }}
            />
          </label>

          <label className="block">
            <span
              className="mb-1 block text-sm text-muted"
              title="Logos inside the ZIP must be PNG files and named to match logo_key."
            >
              Logos ZIP (match by logo_key) (PNG only)
            </span>
            <input
              type="file"
              accept=".zip"
              className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-xs file:text-white"
              onChange={(event) => {
                const next = event.target.files?.[0] ?? null;
                if (next) {
                  const msg = validateLogosZipFile(next);
                  if (msg) {
                    setLogosZipFile(null);
                    setBulkError(msg);
                    resetResults();
                    return;
                  }
                }
                setLogosZipFile(next);
                setBulkError(null);
                resetResults();
              }}
            />
          </label>

          <div className="rounded-md border border-white/10 p-3">
            <p className="pb-2 text-xs uppercase tracking-[0.08em] text-white/70">Global Settings</p>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.templateStyle}</span>
                <select
                  className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
                  value={settings.templateStyle}
                  onChange={(event) =>
                    updateSettings("templateStyle", event.target.value as BulkGlobalSettings["templateStyle"])
                  }
                >
                  {TOMBSTONE_STYLE_OPTIONS.map((style) => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
                <StyleSimulationPicker
                  value={settings.templateStyle}
                  onChange={(style) => updateSettings("templateStyle", style)}
                />
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.language}</span>
                <select
                  className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
                  value={settings.language}
                  onChange={(event) => updateSettings("language", event.target.value as BulkGlobalSettings["language"])}
                >
                  {LANGUAGES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.size}</span>
                <select
                  className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
                  value={settings.size}
                  onChange={(event) => updateSettings("size", event.target.value as BulkGlobalSettings["size"])}
                >
                  {sizeOptions.map((size) => (
                    <option key={size.value} value={size.value}>
                      {size.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.backgroundMode}</span>
                <select
                  className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
                  value={settings.backgroundMode}
                  onChange={(event) =>
                    updateSettings("backgroundMode", event.target.value as BulkGlobalSettings["backgroundMode"])
                  }
                >
                  <option value="transparent">Transparent (Default)</option>
                  <option value="custom">Custom Color</option>
                </select>
              </label>

              {settings.backgroundMode === "custom" && (
                <label className="block">
                  <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.backgroundColor}</span>
                  <input
                    type="text"
                    className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
                    placeholder="#000000 or rgb(0,0,0)"
                    value={settings.backgroundColor}
                    onChange={(event) => updateSettings("backgroundColor", event.target.value)}
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.format}</span>
                <select
                  className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
                  value={settings.format}
                  onChange={(event) => updateSettings("format", event.target.value as BulkGlobalSettings["format"])}
                >
                  {DOWNLOAD_FORMATS.map((format) => (
                    <option
                      key={format.value}
                      value={format.value}
                      disabled={settings.backgroundMode === "transparent" && format.value === "jpeg"}
                    >
                      {format.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm text-muted">Editable PPTX Layout</span>
                <select
                  className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
                  value={settings.pptxPerSlide}
                  onChange={(event) =>
                    updateSettings("pptxPerSlide", Number(event.target.value) as BulkGlobalSettings["pptxPerSlide"])
                  }
                >
                  <option value={4}>4 per slide (2 x 2)</option>
                  <option value={6}>6 per slide (3 x 2)</option>
                  <option value={8}>8 per slide (4 x 2)</option>
                </select>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-md border border-white/20 bg-transparent px-4 py-2 text-sm font-medium"
              onClick={handleValidate}
              disabled={isValidating || isGenerating || isGeneratingPptx}
            >
              {isValidating ? "Validating..." : "Validate"}
            </button>
            <button
              type="button"
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black disabled:bg-white/35 disabled:text-black/70"
              onClick={handleGenerateZip}
              disabled={isGenerating || isGeneratingPptx || validRows.length === 0}
            >
              {isGenerating ? "Generating..." : "Generate ZIP"}
            </button>
          </div>
          <button
            type="button"
            className="w-full rounded-md border border-white/35 bg-transparent px-4 py-2 text-sm font-medium text-white disabled:border-white/20 disabled:text-white/45"
            onClick={handleGeneratePptx}
            disabled={isGenerating || isGeneratingPptx || validRows.length === 0}
          >
            {isGeneratingPptx
              ? "Generating PPTX..."
              : `Generate Editable PPTX (${settings.pptxPerSlide} per slide)`}
          </button>
          <button
            type="button"
            className="w-full rounded-md border border-white/20 bg-transparent px-4 py-2 text-sm font-medium"
            onClick={handleBulkReset}
            disabled={isValidating || isGenerating || isGeneratingPptx}
          >
            Reset Bulk
          </button>

          {bulkError && <p className="text-xs text-red-400">{bulkError}</p>}
        </div>

        <div className="rounded-md border border-white/10 p-3">
          <div className="flex items-center justify-between pb-3">
            <p className="text-sm font-medium">Validation Results</p>
            <p className="text-xs text-white/70">
              Rows: {inputRows.length} | Valid: {validCount} | Errors: {errorCount}
            </p>
          </div>

          <div className="max-h-[560px] overflow-auto rounded border border-white/10">
            <table className="w-full border-collapse text-xs">
              <thead className="bg-white/5">
                <tr>
                  <th className="border-b border-white/10 px-2 py-2 text-left">Row</th>
                  <th className="border-b border-white/10 px-2 py-2 text-left">Status</th>
                  <th className="border-b border-white/10 px-2 py-2 text-left">Message</th>
                </tr>
              </thead>
              <tbody>
                {rowStatuses.map((status) => (
                  <tr key={status.rowNumber}>
                    <td className="border-b border-white/10 px-2 py-2">{status.rowNumber}</td>
                    <td
                      className={`border-b border-white/10 px-2 py-2 ${
                        status.status === "valid" ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {status.status}
                    </td>
                    <td className="border-b border-white/10 px-2 py-2">{status.message}</td>
                  </tr>
                ))}
                {rowStatuses.length === 0 && (
                  <tr>
                    <td className="px-2 py-4 text-white/70" colSpan={3}>
                      Upload files and run validation to preview results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="absolute -left-[9999px] top-0">
        <TombstoneCard ref={exportRef} data={renderData} mode="export" typographySettings={typographySettings} />
      </div>
    </section>
  );
}
