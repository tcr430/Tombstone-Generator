"use client";

import {
  getFontBaseSize,
  getFontFamilyCss,
  getRoleLabel,
  getSectorLabel,
  getSizeConfigForStyle,
  LAYOUT_RATIOS
} from "@/lib/constants/tombstone";
import { TombstoneFormData, TypographySettings } from "@/lib/types/tombstone";
import { formatDealValue, formatMonthYear } from "@/lib/utils/formatting";

const EXPORT_DPI = 300;
const BULK_SLIDE_WIDTH_IN = 13.333;
const BULK_SLIDE_HEIGHT_IN = 7.5;
const BULK_OUTER_MARGIN_IN = 0.3;
const BULK_GAP_X_IN = 0.22;
const BULK_GAP_Y_IN = 0.22;

async function loadPptxGenJS(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("PPTX export is only available in the browser.");
  }

  const maybeLoaded = (window as Window & { PptxGenJS?: any }).PptxGenJS;
  if (maybeLoaded) {
    return maybeLoaded;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector('script[data-pptxgen="1"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load PPTX engine.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "/vendor/pptxgen.bundle.js";
    script.async = true;
    script.dataset.pptxgen = "1";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load PPTX engine."));
    document.head.appendChild(script);
  });

  const loaded = (window as Window & { PptxGenJS?: any }).PptxGenJS;
  if (!loaded) {
    throw new Error("PPTX engine not available.");
  }
  return loaded;
}

function pxToIn(px: number): number {
  return px / EXPORT_DPI;
}

function pxToPt(px: number): number {
  return pxToIn(px) * 72;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function normalizeColorToPptxHex(input: string | null): string | null {
  if (!input) return null;
  const raw = input.trim();

  const hexMatch = raw.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    if (hex.length === 3) {
      return `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toUpperCase();
    }
    return hex.toUpperCase();
  }

  const rgbMatch = raw.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|0?\.\d+|1(?:\.0+)?)\s*)?\)$/i
  );
  if (rgbMatch) {
    const r = Math.max(0, Math.min(255, Number(rgbMatch[1])));
    const g = Math.max(0, Math.min(255, Number(rgbMatch[2])));
    const b = Math.max(0, Math.min(255, Number(rgbMatch[3])));
    return [r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  return null;
}

function resolveFontFace(typography: TypographySettings): string {
  const css = getFontFamilyCss(typography.fontFamily).toLowerCase();
  if (css.includes("arial")) return "Arial";
  if (css.includes("georgia")) return "Georgia";
  if (css.includes("times new roman")) return "Times New Roman";
  return "Montserrat";
}

async function imageUrlToPngData(url: string): Promise<string> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const next = new Image();
    next.onload = () => resolve(next);
    next.onerror = () => reject(new Error("Could not load image."));
    next.src = url;
  });

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.naturalWidth || 1));
  canvas.height = Math.max(1, Math.round(img.naturalHeight || 1));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not render image.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/png");
}

function resolvePublicAsset(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) return path;
  if (path.startsWith("/")) {
    return `${window.location.origin}${path}`;
  }
  return path;
}

interface DrawCardArgs {
  slide: any;
  shapeType: any;
  data: TombstoneFormData;
  typography: TypographySettings;
  backgroundColor: string | null;
  cellXIn: number;
  cellYIn: number;
  cellWIn: number;
  cellHIn: number;
}

async function drawEditableTombstoneOnSlide({
  slide,
  shapeType,
  data,
  typography,
  backgroundColor,
  cellXIn,
  cellYIn,
  cellWIn,
  cellHIn
}: DrawCardArgs): Promise<void> {
  const sizeConfig = getSizeConfigForStyle(data.templateStyle, data.size);
  const widthPx = sizeConfig.exportWidthPx;
  const heightPx = sizeConfig.exportHeightPx;
  const nativeWIn = pxToIn(widthPx);
  const nativeHIn = pxToIn(heightPx);
  const scale = Math.min(cellWIn / nativeWIn, cellHIn / nativeHIn);
  const cardWIn = nativeWIn * scale;
  const cardHIn = nativeHIn * scale;
  const cardXIn = cellXIn + (cellWIn - cardWIn) / 2;
  const cardYIn = cellYIn + (cellHIn - cardHIn) / 2;
  const toInScaled = (px: number) => pxToIn(px) * scale;
  const mapX = (px: number) => cardXIn + toInScaled(px);
  const mapY = (py: number) => cardYIn + toInScaled(py);

  const fontFace = resolveFontFace(typography);
  const logoScale = 0.9;
  const fontScale = sizeConfig.fontScale;
  const textScale = 1.25 * (typography.fontSizeScale / 100);
  const renderScale = widthPx / sizeConfig.previewWidthPx;
  const toFontPt = (element: Parameters<typeof getFontBaseSize>[1]) =>
    round2(pxToPt(getFontBaseSize(data.templateStyle, element) * fontScale * textScale * renderScale) * scale);

  const valueText = formatDealValue(data.dealValue, data.language);
  const dateText = formatMonthYear(data.month, data.language);
  const yearText = data.month ? data.month.split("-")[0] ?? "" : "";
  const sectorText = getSectorLabel(data.sector, data.language);
  const roleText = getRoleLabel(data.role, data.language);
  const esgIconPath = data.templateStyle === "full-border-centered" ? "/esg2.png" : "/esg.png";

  const logoData = data.logoUrl ? await imageUrlToPngData(resolvePublicAsset(data.logoUrl)) : null;
  const esgData = data.esg === "1" ? await imageUrlToPngData(resolvePublicAsset(esgIconPath)) : null;
  const cardBgHex = data.backgroundMode === "transparent" ? null : normalizeColorToPptxHex(backgroundColor ?? "#000000");
  if (cardBgHex) {
    slide.addShape(shapeType.rect, {
      x: cardXIn,
      y: cardYIn,
      w: cardWIn,
      h: cardHIn,
      line: { color: cardBgHex, pt: 0 },
      fill: { color: cardBgHex }
    });
  }

  if (data.templateStyle === "full-border-centered") {
    const borderColor = "8A8A8A";
    const borderRadiusPx = Math.max(6, Math.round(widthPx * 0.03));
    const borderWidthPx = Math.max(3, Math.round(widthPx * 0.012));
    slide.addShape(shapeType.roundRect, {
      x: cardXIn,
      y: cardYIn,
      w: cardWIn,
      h: cardHIn,
      rectRadius: toInScaled(borderRadiusPx),
      line: { color: borderColor, pt: round2(pxToPt(borderWidthPx) * scale) },
      fill: { color: "FFFFFF", transparency: 100 }
    });

    const centeredPadX = Math.round(widthPx * 0.07);
    const logoTopPx = Math.round(heightPx * 0.055);
    const contentW = widthPx - centeredPadX * 2;
    const logoBoxHeight = Math.round(heightPx * 0.225 * logoScale);
    const logoBoxWidth = Math.round(contentW * logoScale);
    const roleTopPx = Math.round(heightPx * 0.295);
    const roleHeightPx = Math.round(heightPx * 0.13);
    const descTopPx = Math.round(heightPx * 0.475);
    const valueTopPx = Math.round(heightPx * 0.82);
    const yearTopPx = Math.round(heightPx * 0.91);
    const descHeightPx = Math.max(10, valueTopPx - descTopPx - Math.round(heightPx * 0.03));

    if (esgData) {
      const esgIconSize = Math.round(32 * fontScale * textScale * renderScale);
      const esgRight = Math.round(widthPx * 0.015);
      const esgTop = Math.max(0, Math.round(heightPx * 0.001));
      slide.addImage({
        data: esgData,
        x: mapX(widthPx - esgRight - esgIconSize),
        y: mapY(esgTop),
        w: toInScaled(esgIconSize),
        h: toInScaled(esgIconSize)
      });
    }

    if (logoData) {
      slide.addImage({
        data: logoData,
        x: mapX(Math.round(centeredPadX + (contentW - logoBoxWidth) / 2)),
        y: mapY(logoTopPx),
        w: toInScaled(logoBoxWidth),
        h: toInScaled(logoBoxHeight),
        sizing: {
          type: "contain",
          x: mapX(Math.round(centeredPadX + (contentW - logoBoxWidth) / 2)),
          y: mapY(logoTopPx),
          w: toInScaled(logoBoxWidth),
          h: toInScaled(logoBoxHeight)
        }
      });
    }

    slide.addText(roleText.toUpperCase(), {
      x: mapX(centeredPadX + Math.round(contentW * 0.03)),
      y: mapY(roleTopPx),
      w: toInScaled(Math.round(contentW * 0.94)),
      h: toInScaled(roleHeightPx),
      align: "center",
      valign: "middle",
      fontFace,
      color: "1A1A1A",
      bold: false,
      fontSize: toFontPt("role")
    });

    slide.addText(data.description, {
      x: mapX(centeredPadX + Math.round(contentW * 0.05)),
      y: mapY(descTopPx),
      w: toInScaled(Math.round(contentW * 0.9)),
      h: toInScaled(descHeightPx),
      align: "center",
      valign: "top",
      fontFace,
      color: "1A1A1A",
      bold: false,
      fontSize: toFontPt("description")
    });

    slide.addText(valueText, {
      x: mapX(centeredPadX + Math.round(contentW * 0.05)),
      y: mapY(valueTopPx),
      w: toInScaled(Math.round(contentW * 0.9)),
      h: toInScaled(Math.round(heightPx * 0.06)),
      align: "center",
      valign: "middle",
      fontFace,
      color: "000000",
      bold: true,
      fontSize: toFontPt("dealValue")
    });

    slide.addText(yearText, {
      x: mapX(centeredPadX + Math.round(contentW * 0.05)),
      y: mapY(yearTopPx),
      w: toInScaled(Math.round(contentW * 0.9)),
      h: toInScaled(Math.round(heightPx * 0.05)),
      align: "center",
      valign: "middle",
      fontFace,
      color: "3A3A3A",
      bold: false,
      fontSize: toFontPt("year")
    });
  } else {
    const lineColor = "8A8A8A";
    slide.addShape(shapeType.line, {
      x: cardXIn,
      y: cardYIn,
      w: 0,
      h: cardHIn,
      line: { color: lineColor, pt: round2(2 * scale) }
    });
    if (data.templateStyle === "double-vertical") {
      slide.addShape(shapeType.line, {
        x: cardXIn + cardWIn,
        y: cardYIn,
        w: 0,
        h: cardHIn,
        line: { color: lineColor, pt: round2(2 * scale) }
      });
    }
    if (data.templateStyle === "left-top") {
      slide.addShape(shapeType.line, {
        x: cardXIn,
        y: cardYIn,
        w: cardWIn,
        h: 0,
        line: { color: lineColor, pt: round2(2 * scale) }
      });
    }

    const contentLeftPx = Math.round(widthPx * LAYOUT_RATIOS.contentLeft);
    const textLeftPx = Math.max(0, contentLeftPx - Math.round(widthPx * 0.04));
    const logoTopPx = Math.round(heightPx * LAYOUT_RATIOS.logoTop);
    const logoWidthPx = Math.round(widthPx * LAYOUT_RATIOS.logoWidth * logoScale);
    const logoHeightPx = Math.round(heightPx * LAYOUT_RATIOS.logoHeight * logoScale);
    const logoLeftPx = Math.round((widthPx - logoWidthPx) / 2);
    const layoutNudgePx = Math.round(3 * fontScale * renderScale);
    const sectorTopPx = Math.round(
      heightPx * LAYOUT_RATIOS.sectorBaseline - 10 * fontScale * renderScale + layoutNudgePx
    );
    const monthYearTopPx = Math.round(
      heightPx * LAYOUT_RATIOS.monthYearBaseline - 8 * fontScale * renderScale - layoutNudgePx
    );
    const dealValueTopPx = Math.round(
      heightPx * LAYOUT_RATIOS.dealValueBaseline - 11 * fontScale * renderScale - layoutNudgePx
    );
    const descriptionTopPx = Math.round(
      heightPx * LAYOUT_RATIOS.descriptionBaseline - 8 * fontScale * renderScale - layoutNudgePx
    );
    const roleTopPx = Math.round(
      heightPx * LAYOUT_RATIOS.roleBaseline - 8 * fontScale * renderScale - layoutNudgePx
    );

    slide.addText(sectorText, {
      x: mapX(Math.round(widthPx * 0.04)),
      y: mapY(sectorTopPx),
      w: toInScaled(Math.round(widthPx * 0.5)),
      h: toInScaled(Math.round(heightPx * 0.04)),
      align: "left",
      valign: "middle",
      fontFace,
      color: "2B2B2B",
      bold: false,
      fontSize: toFontPt("sector")
    });

    if (esgData) {
      const esgIconSize = Math.round(16 * fontScale * textScale * renderScale);
      const esgRight = Math.round(widthPx * 0.04);
      slide.addImage({
        data: esgData,
        x: mapX(widthPx - esgRight - esgIconSize),
        y: mapY(sectorTopPx),
        w: toInScaled(esgIconSize),
        h: toInScaled(esgIconSize)
      });
    }

    if (logoData) {
      slide.addImage({
        data: logoData,
        x: mapX(logoLeftPx),
        y: mapY(logoTopPx),
        w: toInScaled(logoWidthPx),
        h: toInScaled(logoHeightPx),
        sizing: {
          type: "contain",
          x: mapX(logoLeftPx),
          y: mapY(logoTopPx),
          w: toInScaled(logoWidthPx),
          h: toInScaled(logoHeightPx)
        }
      });
    }

    slide.addText(dateText, {
      x: mapX(textLeftPx),
      y: mapY(monthYearTopPx),
      w: toInScaled(Math.round(widthPx * 0.78)),
      h: toInScaled(Math.round(heightPx * 0.045)),
      align: "left",
      fontFace,
      color: "2B2B2B",
      fontSize: toFontPt("date")
    });

    slide.addText(valueText, {
      x: mapX(textLeftPx),
      y: mapY(dealValueTopPx),
      w: toInScaled(Math.round(widthPx * 0.78)),
      h: toInScaled(Math.round(heightPx * 0.05)),
      align: "left",
      fontFace,
      color: "000000",
      bold: true,
      fontSize: toFontPt("dealValue")
    });

    slide.addText(data.description, {
      x: mapX(textLeftPx),
      y: mapY(descriptionTopPx),
      w: toInScaled(Math.round(widthPx * 0.78)),
      h: toInScaled(Math.round(heightPx * 0.17)),
      align: "left",
      valign: "top",
      fontFace,
      color: "1A1A1A",
      fontSize: toFontPt("description")
    });

    slide.addText(roleText, {
      x: mapX(textLeftPx),
      y: mapY(roleTopPx),
      w: toInScaled(Math.round(widthPx * 0.78)),
      h: toInScaled(Math.round(heightPx * 0.05)),
      align: "left",
      fontFace,
      color: "404040",
      fontSize: toFontPt("role")
    });
  }
}

export async function exportEditableTombstonePptx(
  data: TombstoneFormData,
  typography: TypographySettings,
  backgroundColor: string | null,
  filenameBase: string
): Promise<void> {
  const PptxGenJS = await loadPptxGenJS();
  const sizeConfig = getSizeConfigForStyle(data.templateStyle, data.size);
  const slideW = pxToIn(sizeConfig.exportWidthPx);
  const slideH = pxToIn(sizeConfig.exportHeightPx);

  const pptx = new PptxGenJS();
  const layoutName = `TOMBSTONE_${data.templateStyle}_${data.size}`.toUpperCase();
  pptx.defineLayout({ name: layoutName, width: slideW, height: slideH });
  pptx.layout = layoutName;
  pptx.author = "Deal Tombstone Generator";
  pptx.subject = "Editable tombstone export";
  pptx.title = filenameBase;

  const slide = pptx.addSlide();
  await drawEditableTombstoneOnSlide({
    slide,
    shapeType: PptxGenJS.ShapeType,
    data,
    typography,
    backgroundColor,
    cellXIn: 0,
    cellYIn: 0,
    cellWIn: slideW,
    cellHIn: slideH
  });

  await pptx.writeFile({ fileName: `${filenameBase}_${data.size}.pptx` });
}

export async function exportBulkEditableTombstonesPptx(
  entries: Array<{ formData: TombstoneFormData; backgroundColor: string | null }>,
  typography: TypographySettings,
  perSlide: 4 | 6 | 8,
  filename = "tombstones_bulk_editable_6-per-slide.pptx"
): Promise<void> {
  const PptxGenJS = await loadPptxGenJS();
  if (entries.length === 0) {
    throw new Error("No entries to export.");
  }

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Deal Tombstone Generator";
  pptx.subject = "Bulk editable tombstone export";
  pptx.title = "Bulk Tombstones";

  const gridByPerSlide: Record<4 | 6 | 8, { columns: number; rows: number }> = {
    4: { columns: 2, rows: 2 },
    6: { columns: 3, rows: 2 },
    8: { columns: 4, rows: 2 }
  };
  const { columns, rows } = gridByPerSlide[perSlide];
  const perSlideCount = columns * rows;

  const cellW =
    (BULK_SLIDE_WIDTH_IN - BULK_OUTER_MARGIN_IN * 2 - BULK_GAP_X_IN * (columns - 1)) / columns;
  const cellH =
    (BULK_SLIDE_HEIGHT_IN - BULK_OUTER_MARGIN_IN * 2 - BULK_GAP_Y_IN * (rows - 1)) / rows;

  for (let i = 0; i < entries.length; i += perSlideCount) {
    const chunk = entries.slice(i, i + perSlideCount);
    const slide = pptx.addSlide();
    for (let idx = 0; idx < chunk.length; idx += 1) {
      const col = idx % columns;
      const row = Math.floor(idx / columns);
      const x = BULK_OUTER_MARGIN_IN + col * (cellW + BULK_GAP_X_IN);
      const y = BULK_OUTER_MARGIN_IN + row * (cellH + BULK_GAP_Y_IN);
      await drawEditableTombstoneOnSlide({
        slide,
        shapeType: PptxGenJS.ShapeType,
        data: chunk[idx].formData,
        typography,
        backgroundColor: chunk[idx].backgroundColor,
        cellXIn: x,
        cellYIn: y,
        cellWIn: cellW,
        cellHIn: cellH
      });
    }
  }

  await pptx.writeFile({ fileName: filename });
}
