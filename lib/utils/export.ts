"use client";

import { toCanvas, toSvg } from "html-to-image";
import { DownloadFormat, TombstoneSize } from "@/lib/types/tombstone";
import { getSizeConfigForStyle } from "@/lib/constants/tombstone";
import { TombstoneStyle } from "@/lib/types/tombstone";

function waitForNextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

async function waitForImageElement(image: HTMLImageElement): Promise<void> {
  if (image.complete && image.naturalWidth > 0) {
    if (typeof image.decode === "function") {
      try {
        await image.decode();
      } catch {
        // Ignore decode failures; the image is already complete.
      }
    }
    return;
  }

  await new Promise<void>((resolve) => {
    const done = () => {
      image.removeEventListener("load", done);
      image.removeEventListener("error", done);
      resolve();
    };
    image.addEventListener("load", done, { once: true });
    image.addEventListener("error", done, { once: true });
  });
}

async function waitForRenderableAssets(node: HTMLElement): Promise<void> {
  if (typeof document !== "undefined" && "fonts" in document) {
    try {
      await (document as Document & { fonts: FontFaceSet }).fonts.ready;
    } catch {
      // Continue even if font readiness check fails.
    }
  }

  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(images.map((image) => waitForImageElement(image)));
  await waitForNextFrame();
}

export function downloadBlob(blob: Blob, filename: string): void {
  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
}

function dataUrlToBlob(dataUrl: string): Blob {
  const [header, payload] = dataUrl.split(",");
  if (!header || !payload) {
    throw new Error("Invalid export payload.");
  }

  const mimeMatch = header.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] ?? "application/octet-stream";
  const binary = atob(payload);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export async function renderTombstoneBlob(
  node: HTMLElement,
  size: TombstoneSize,
  templateStyle: TombstoneStyle,
  format: DownloadFormat,
  backgroundColor: string | null
): Promise<{ blob: Blob; extension: string }> {
  const { exportWidthPx, exportHeightPx } = getSizeConfigForStyle(templateStyle, size);
  await waitForRenderableAssets(node);

  if (format === "png" || format === "jpeg") {
    const canvas = await toCanvas(node, {
      cacheBust: false,
      width: exportWidthPx,
      height: exportHeightPx,
      pixelRatio: 1,
      canvasWidth: exportWidthPx,
      canvasHeight: exportHeightPx,
      backgroundColor: backgroundColor ?? undefined
    });

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(
        (output) => resolve(output),
        format === "png" ? "image/png" : "image/jpeg",
        format === "png" ? undefined : 0.98
      );
    });

    if (!blob) {
      throw new Error("Unable to generate image file.");
    }

    return {
      blob,
      extension: format === "png" ? "png" : "jpg"
    };
  }

  const svgDataUrl = await toSvg(node, {
    cacheBust: false,
    width: exportWidthPx,
    height: exportHeightPx
  });
  const svgBlob = dataUrlToBlob(svgDataUrl);
  return {
    blob: svgBlob,
    extension: "svg"
  };
}

export async function exportTombstone(
  node: HTMLElement,
  size: TombstoneSize,
  templateStyle: TombstoneStyle,
  format: DownloadFormat,
  backgroundColor: string | null,
  filenameBase: string
): Promise<void> {
  const rendered = await renderTombstoneBlob(node, size, templateStyle, format, backgroundColor);
  downloadBlob(rendered.blob, `${filenameBase}_${size}.${rendered.extension}`);
}
