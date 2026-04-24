"use client";

interface NormalizeImageOptions {
  maxDimension?: number;
  outputType?: "image/png" | "image/jpeg";
  quality?: number;
}

const DEFAULT_MAX_DIMENSION = 1600;

function loadImageFromBlob(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not load image for normalization."));
    };
    image.src = objectUrl;
  });
}

export async function normalizeImageBlob(blob: Blob, options: NormalizeImageOptions = {}): Promise<Blob> {
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const outputType = options.outputType ?? "image/png";
  const quality = options.quality ?? 0.92;

  const image = await loadImageFromBlob(blob);
  const originalWidth = image.naturalWidth || 1;
  const originalHeight = image.naturalHeight || 1;
  const maxSide = Math.max(originalWidth, originalHeight);

  if (maxSide <= maxDimension) {
    return blob;
  }

  const scale = maxDimension / maxSide;
  const targetWidth = Math.max(1, Math.round(originalWidth * scale));
  const targetHeight = Math.max(1, Math.round(originalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    return blob;
  }
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  const normalized = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(
      (result) => resolve(result),
      outputType,
      outputType === "image/jpeg" ? quality : undefined
    );
  });

  return normalized ?? blob;
}

