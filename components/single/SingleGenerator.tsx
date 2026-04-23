"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { TombstoneForm } from "@/components/forms/TombstoneForm";
import { TombstonePreview } from "@/components/tombstone/TombstonePreview";
import { DEFAULT_FORM_DATA, getRoleLabel } from "@/lib/constants/tombstone";
import { TombstoneFormData, TombstoneFormErrors, TypographySettings } from "@/lib/types/tombstone";
import { getBackgroundCssColor } from "@/lib/utils/color";
import { exportTombstone } from "@/lib/utils/export";
import { exportEditableTombstonePptx } from "@/lib/utils/export-pptx";
import { sanitizeFilenamePart } from "@/lib/utils/bulk";
import { isFormValid, validateForm, validateLogoFile } from "@/lib/utils/validation";

interface SingleGeneratorProps {
  typographySettings: TypographySettings;
}

export function SingleGenerator({ typographySettings }: SingleGeneratorProps) {
  const [formData, setFormData] = useState<TombstoneFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<TombstoneFormErrors>({});
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPptx, setIsExportingPptx] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [logoObjectUrl, setLogoObjectUrl] = useState<string | null>(null);

  const exportRef = useRef<HTMLDivElement>(null);
  const canExport = useMemo(() => isFormValid(formData), [formData]);

  useEffect(() => {
    return () => {
      if (logoObjectUrl) {
        URL.revokeObjectURL(logoObjectUrl);
      }
    };
  }, [logoObjectUrl]);

  useEffect(() => {
    if (formData.backgroundMode === "transparent" && formData.format === "jpeg") {
      setFormData((prev) => ({ ...prev, format: "png" }));
      setErrors((prev) => ({ ...prev, format: undefined }));
    }
  }, [formData.backgroundMode, formData.format]);

  useEffect(() => {
    if (formData.templateStyle === "full-border-centered" && formData.size === "small") {
      setFormData((prev) => ({ ...prev, size: "medium" }));
    }
  }, [formData.templateStyle, formData.size]);

  function updateField<K extends keyof TombstoneFormData>(field: K, value: TombstoneFormData[K]): void {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const fieldKey = field as keyof TombstoneFormErrors;
      const clone = { ...prev };
      if (prev[fieldKey]) {
        delete clone[fieldKey];
      }
      if (field === "backgroundMode" && prev.format) {
        delete clone.format;
      }
      return clone;
    });
  }

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>): void {
    const file = event.target.files?.[0];
    if (!file) return;

    const logoError = validateLogoFile(file);
    if (logoError) {
      setErrors((prev) => ({ ...prev, logoUrl: logoError }));
      return;
    }

    const nextUrl = URL.createObjectURL(file);
    if (logoObjectUrl) {
      URL.revokeObjectURL(logoObjectUrl);
    }

    setLogoObjectUrl(nextUrl);
    setFormData((prev) => ({ ...prev, logoUrl: nextUrl }));
    setErrors((prev) => ({ ...prev, logoUrl: undefined }));
    setExportError(null);
  }

  async function handleDownload(): Promise<void> {
    const formErrors = validateForm(formData);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const node = exportRef.current;
    if (!node) {
      return;
    }

    setIsExporting(true);
    setExportError(null);
    try {
      const roleLabel = getRoleLabel(formData.role, formData.language);
      const filenameBase = [
        sanitizeFilenamePart(formData.month),
        sanitizeFilenamePart(formData.clientName),
        sanitizeFilenamePart(roleLabel)
      ].join("_");

      await exportTombstone(
        node,
        formData.size,
        formData.templateStyle,
        formData.format,
        getBackgroundCssColor(formData),
        filenameBase
      );
    } catch {
      setExportError("Download failed. Try PNG first, or re-upload logo if it is an SVG.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDownloadPptx(): Promise<void> {
    const formErrors = validateForm(formData);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsExportingPptx(true);
    setExportError(null);
    try {
      const roleLabel = getRoleLabel(formData.role, formData.language);
      const filenameBase = [
        sanitizeFilenamePart(formData.month),
        sanitizeFilenamePart(formData.clientName),
        sanitizeFilenamePart(roleLabel)
      ].join("_");

      await exportEditableTombstonePptx(formData, typographySettings, getBackgroundCssColor(formData), filenameBase);
    } catch {
      setExportError("Editable PPTX export failed. Re-upload logo and try again.");
    } finally {
      setIsExportingPptx(false);
    }
  }

  function handleReset(): void {
    if (logoObjectUrl) {
      URL.revokeObjectURL(logoObjectUrl);
    }
    setLogoObjectUrl(null);
    setFormData(DEFAULT_FORM_DATA);
    setErrors({});
    setExportError(null);
  }

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[450px_1fr]">
      <TombstoneForm
        data={formData}
        errors={errors}
        isExportReady={canExport}
        isExporting={isExporting}
        isExportingPptx={isExportingPptx}
        exportError={exportError}
        onChange={updateField}
        onLogoChange={handleLogoChange}
        onDownload={handleDownload}
        onDownloadPptx={handleDownloadPptx}
        onReset={handleReset}
      />

      <TombstonePreview data={formData} exportRef={exportRef} typographySettings={typographySettings} />
    </div>
  );
}
