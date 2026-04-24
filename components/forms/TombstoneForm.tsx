"use client";

import { ChangeEvent } from "react";
import {
  DOWNLOAD_FORMATS,
  FIELD_LABELS,
  getSizeOptionsForStyle,
  getSortedSectors,
  LANGUAGES,
  MAX_CLIENT_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_LOGO_FILE_SIZE_MB,
  ROLES,
  SIZE_OPTIONS,
  TOMBSTONE_STYLE_OPTIONS
} from "@/lib/constants/tombstone";
import { StyleSimulationPicker } from "@/components/forms/StyleSimulationPicker";
import { TombstoneFormData, TombstoneFormErrors } from "@/lib/types/tombstone";

interface TombstoneFormProps {
  data: TombstoneFormData;
  errors: TombstoneFormErrors;
  isExportReady: boolean;
  isExporting: boolean;
  isExportingPptx: boolean;
  exportError: string | null;
  onChange: <K extends keyof TombstoneFormData>(field: K, value: TombstoneFormData[K]) => void;
  onLogoChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDownload: () => void;
  onDownloadPptx: () => void;
  onReset: () => void;
}

export function TombstoneForm({
  data,
  errors,
  isExportReady,
  isExporting,
  isExportingPptx,
  exportError,
  onChange,
  onLogoChange,
  onDownload,
  onDownloadPptx,
  onReset
}: TombstoneFormProps) {
  const isPortuguese = data.language === "pt";
  const selectSectorLabel = isPortuguese ? "Selecionar setor" : "Select sector";
  const selectRoleLabel = isPortuguese ? "Selecionar função" : "Select role";
  const sortedSectors = getSortedSectors(data.language);
  const sizeOptions = getSizeOptionsForStyle(data.templateStyle);

  return (
    <section className="rounded-xl border border-panelBorder bg-panel p-5">
      <h2 className="pb-4 text-sm font-semibold uppercase tracking-[0.11em] text-white/80">Deal Input</h2>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.templateStyle}</span>
          <select
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            value={data.templateStyle}
            onChange={(event) =>
              onChange("templateStyle", event.target.value as TombstoneFormData["templateStyle"])
            }
          >
            {TOMBSTONE_STYLE_OPTIONS.map((style) => (
              <option key={style.value} value={style.value}>
                {style.label}
              </option>
            ))}
          </select>
          <StyleSimulationPicker value={data.templateStyle} onChange={(style) => onChange("templateStyle", style)} />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.language}</span>
          <select
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            value={data.language}
            onChange={(event) => onChange("language", event.target.value as TombstoneFormData["language"])}
          >
            {LANGUAGES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.sector}</span>
          <select
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            value={data.sector}
            onChange={(event) => onChange("sector", event.target.value)}
          >
            <option value="">{selectSectorLabel}</option>
            {sortedSectors.map((sector) => (
              <option key={sector.value} value={sector.value}>
                {sector.label[data.language]}
              </option>
            ))}
          </select>
          {errors.sector && <p className="pt-1 text-xs text-red-400">{errors.sector}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.month}</span>
          <input
            type="month"
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            value={data.month}
            onChange={(event) => onChange("month", event.target.value)}
          />
          {errors.month && <p className="pt-1 text-xs text-red-400">{errors.month}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.clientName}</span>
          <input
            type="text"
            maxLength={MAX_CLIENT_NAME_LENGTH}
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            placeholder={isPortuguese ? "Nome do cliente (para ficheiro)" : "Client name (for filename)"}
            value={data.clientName}
            onChange={(event) => onChange("clientName", event.target.value)}
          />
          <p className="pt-1 text-[11px] text-muted">
            {data.clientName.length}/{MAX_CLIENT_NAME_LENGTH}
          </p>
          {errors.clientName && <p className="pt-1 text-xs text-red-400">{errors.clientName}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.logoUrl}</span>
          <input
            type="file"
            accept=".png,.jpg,.jpeg,.svg,.webp"
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-xs file:text-white"
            onChange={onLogoChange}
          />
          <p className="pt-1 text-[11px] text-muted">
            Allowed: PNG/JPEG/SVG/WebP, max {MAX_LOGO_FILE_SIZE_MB}MB. Oversized image dimensions are auto-normalized.
          </p>
          {errors.logoUrl && <p className="pt-1 text-xs text-red-400">{errors.logoUrl}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.role}</span>
          <select
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            value={data.role}
            onChange={(event) => onChange("role", event.target.value)}
          >
            <option value="">{selectRoleLabel}</option>
            {ROLES.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label[data.language]}
              </option>
            ))}
          </select>
          {errors.role && <p className="pt-1 text-xs text-red-400">{errors.role}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.dealValue}</span>
          <input
            type="text"
            inputMode="decimal"
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            placeholder="150000000"
            value={data.dealValue}
            onChange={(event) => onChange("dealValue", event.target.value)}
          />
          {errors.dealValue && <p className="pt-1 text-xs text-red-400">{errors.dealValue}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.description}</span>
          <textarea
            maxLength={MAX_DESCRIPTION_LENGTH}
            className="min-h-[98px] w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            placeholder="Advised on the sale of..."
            value={data.description}
            onChange={(event) => onChange("description", event.target.value)}
          />
          <p className="pt-1 text-[11px] text-muted">
            {data.description.length}/{MAX_DESCRIPTION_LENGTH}
          </p>
          {errors.description && <p className="pt-1 text-xs text-red-400">{errors.description}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.esg}</span>
          <select
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            value={data.esg}
            onChange={(event) => onChange("esg", event.target.value as TombstoneFormData["esg"])}
          >
            <option value="0">0 - No ESG</option>
            <option value="1">1 - ESG</option>
          </select>
          {errors.esg && <p className="pt-1 text-xs text-red-400">{errors.esg}</p>}
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.backgroundMode}</span>
          <select
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            value={data.backgroundMode}
            onChange={(event) =>
              onChange("backgroundMode", event.target.value as TombstoneFormData["backgroundMode"])
            }
          >
            <option value="black">Black</option>
            <option value="custom">Custom Color</option>
            <option value="transparent">Transparent</option>
          </select>
        </label>

        {data.backgroundMode === "custom" && (
          <label className="block">
            <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.backgroundColor}</span>
            <input
              type="text"
              className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
              placeholder="#000000 or rgb(0,0,0)"
              value={data.backgroundColor}
              onChange={(event) => onChange("backgroundColor", event.target.value)}
            />
            {errors.backgroundColor && <p className="pt-1 text-xs text-red-400">{errors.backgroundColor}</p>}
          </label>
        )}

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.size}</span>
          <select
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            value={data.size}
            onChange={(event) => onChange("size", event.target.value as TombstoneFormData["size"])}
          >
            {sizeOptions.map((size) => (
              <option key={size.value} value={size.value}>
                {size.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-muted">{FIELD_LABELS.format}</span>
          <select
            className="w-full rounded-md border border-white/15 bg-field px-3 py-2 text-sm"
            value={data.format}
            onChange={(event) => onChange("format", event.target.value as TombstoneFormData["format"])}
          >
            {DOWNLOAD_FORMATS.map((format) => (
              <option
                key={format.value}
                value={format.value}
                disabled={data.backgroundMode === "transparent" && format.value === "jpeg"}
              >
                {format.label}
              </option>
            ))}
          </select>
          {errors.format && <p className="pt-1 text-xs text-red-400">{errors.format}</p>}
        </label>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            className="rounded-md border border-white/20 bg-transparent px-4 py-2 text-sm font-medium"
            onClick={onReset}
          >
            Reset
          </button>
          <button
            type="button"
            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black disabled:bg-white/35 disabled:text-black/70"
            onClick={onDownload}
            disabled={!isExportReady || isExporting}
          >
            {isExporting ? "Exporting..." : "Download"}
          </button>
        </div>
        <button
          type="button"
          className="w-full rounded-md border border-white/35 bg-transparent px-4 py-2 text-sm font-medium text-white disabled:border-white/20 disabled:text-white/45"
          onClick={onDownloadPptx}
          disabled={!isExportReady || isExportingPptx}
        >
          {isExportingPptx ? "Exporting PPTX..." : "Download Editable PPTX"}
        </button>
        {exportError && <p className="pt-1 text-xs text-red-400">{exportError}</p>}
      </div>
    </section>
  );
}
