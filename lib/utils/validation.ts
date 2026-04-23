import {
  ALLOWED_LOGO_TYPES,
  MAX_CLIENT_NAME_LENGTH,
  MAX_DESCRIPTION_LENGTH,
  MAX_LOGO_FILE_SIZE_BYTES
} from "@/lib/constants/tombstone";
import { TombstoneFormData, TombstoneFormErrors } from "@/lib/types/tombstone";
import { normalizeBackgroundColorInput } from "@/lib/utils/color";
import { parseDealValue } from "@/lib/utils/formatting";

export function validateLogoFile(file: File): string | null {
  if (!ALLOWED_LOGO_TYPES.includes(file.type)) {
    return "Logo must be PNG, JPEG, SVG, or WebP.";
  }

  if (file.size > MAX_LOGO_FILE_SIZE_BYTES) {
    return "Logo file is too large.";
  }

  return null;
}

export function validateForm(data: TombstoneFormData): TombstoneFormErrors {
  const errors: TombstoneFormErrors = {};

  if (!data.sector) errors.sector = "Sector is required.";
  if (!data.month) errors.month = "Date is required.";
  if (!data.clientName.trim()) errors.clientName = "Client name is required.";
  if (!data.logoUrl) errors.logoUrl = "Client logo is required.";
  if (!data.role) errors.role = "Role is required.";
  if (!data.dealValue.trim()) errors.dealValue = "Deal value is required.";
  if (!data.description.trim()) errors.description = "Description is required.";
  if (data.esg !== "0" && data.esg !== "1") errors.esg = "ESG flag must be 0 or 1.";

  if (data.description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be at most ${MAX_DESCRIPTION_LENGTH} characters.`;
  }
  if (data.clientName.length > MAX_CLIENT_NAME_LENGTH) {
    errors.clientName = `Client name must be at most ${MAX_CLIENT_NAME_LENGTH} characters.`;
  }

  const parsedValue = parseDealValue(data.dealValue);
  if (data.dealValue && parsedValue === null) {
    errors.dealValue = "Deal value must be a valid number.";
  }

  if (data.backgroundMode === "custom" && !normalizeBackgroundColorInput(data.backgroundColor)) {
    errors.backgroundColor = "Use a valid Hex (#000000) or RGB (rgb(0,0,0) or 0,0,0).";
  }

  if (data.backgroundMode === "transparent" && data.format === "jpeg") {
    errors.format = "JPEG does not support transparent background. Use PNG or SVG.";
  }

  return errors;
}

export function isFormValid(data: TombstoneFormData): boolean {
  return Object.keys(validateForm(data)).length === 0;
}
