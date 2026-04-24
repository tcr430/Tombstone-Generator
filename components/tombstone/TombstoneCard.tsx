"use client";

import { forwardRef } from "react";
import {
  getFontFamilyCss,
  getFontBaseSize,
  getRoleLabel,
  getSectorLabel,
  getSizeConfigForStyle,
  LAYOUT_RATIOS
} from "@/lib/constants/tombstone";
import { TombstoneFormData, TypographySettings } from "@/lib/types/tombstone";
import { getBackgroundCssColor } from "@/lib/utils/color";
import { formatDealValue, formatMonthYear } from "@/lib/utils/formatting";

interface TombstoneCardProps {
  data: TombstoneFormData;
  mode: "preview" | "export";
  typographySettings: TypographySettings;
}

export const TombstoneCard = forwardRef<HTMLDivElement, TombstoneCardProps>(function TombstoneCard(
  { data, mode, typographySettings },
  ref
) {
  const sizeConfig = getSizeConfigForStyle(data.templateStyle, data.size);
  const widthPx = mode === "export" ? sizeConfig.exportWidthPx : sizeConfig.previewWidthPx;
  const heightPx = mode === "export" ? sizeConfig.exportHeightPx : sizeConfig.previewHeightPx;

  const fontScale = sizeConfig.fontScale;
  const textScale = 1.25 * (typographySettings.fontSizeScale / 100);
  const renderScale = widthPx / sizeConfig.previewWidthPx;
  const selectedFontFamily = getFontFamilyCss(typographySettings.fontFamily);
  const logoScale = 0.9;
  const resolveFontSizePx = (element: Parameters<typeof getFontBaseSize>[1]) =>
    `${Math.round(getFontBaseSize(data.templateStyle, element) * fontScale * textScale * renderScale * 10) / 10}px`;

  const contentLeft = Math.round(widthPx * LAYOUT_RATIOS.contentLeft);
  const textLeft = Math.max(0, contentLeft - Math.round(widthPx * 0.04));
  const logoTop = Math.round(heightPx * LAYOUT_RATIOS.logoTop);
  const logoWidth = Math.round(widthPx * LAYOUT_RATIOS.logoWidth * logoScale);
  const logoHeight = Math.round(heightPx * LAYOUT_RATIOS.logoHeight * logoScale);
  const logoLeft = Math.round((widthPx - logoWidth) / 2);
  const layoutNudgePx = Math.round(3 * fontScale * renderScale);
  const sectorTop = Math.round(heightPx * LAYOUT_RATIOS.sectorBaseline - 10 * fontScale * renderScale + layoutNudgePx);
  const monthYearTop = Math.round(heightPx * LAYOUT_RATIOS.monthYearBaseline - 8 * fontScale * renderScale - layoutNudgePx);
  const dealValueTop = Math.round(heightPx * LAYOUT_RATIOS.dealValueBaseline - 11 * fontScale * renderScale - layoutNudgePx);
  const descriptionTop = Math.round(
    heightPx * LAYOUT_RATIOS.descriptionBaseline - 8 * fontScale * renderScale - layoutNudgePx
  );
  const roleTop = Math.round(heightPx * LAYOUT_RATIOS.roleBaseline - 8 * fontScale * renderScale - layoutNudgePx);

  const valueText = formatDealValue(data.dealValue, data.language);
  const dateText = formatMonthYear(data.month, data.language);
  const yearText = data.month ? data.month.split("-")[0] ?? "" : "";
  const sectorText = getSectorLabel(data.sector, data.language);
  const roleText = getRoleLabel(data.role, data.language);
  const backgroundColor =
    data.backgroundMode === "transparent" ? "transparent" : getBackgroundCssColor(data) ?? "#000000";
  const showEsgIcon = data.esg === "1";
  const isFullBorderCentered = data.templateStyle === "full-border-centered";
  const esgIconSrc = isFullBorderCentered ? "/esg2.png" : "/esg.png";
  const esgIconSize = isFullBorderCentered
    ? Math.round(32 * fontScale * textScale * renderScale)
    : Math.round(16 * fontScale * textScale * renderScale);
  const esgRight = isFullBorderCentered ? Math.round(widthPx * 0.015) : Math.round(widthPx * 0.04);
  const esgTopFullBorder = Math.max(0, Math.round(heightPx * 0.001));

  if (data.templateStyle === "full-border-centered") {
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
    const borderColor = "#CFCFCF";
    const borderRadiusPx = Math.max(6, Math.round(widthPx * 0.03));
    const borderWidthPx = Math.max(3, Math.round(widthPx * 0.012));

    return (
      <div
        ref={ref}
        className="relative overflow-hidden text-black"
        style={{
          width: `${widthPx}px`,
          height: `${heightPx}px`,
          backgroundColor,
          fontFamily: selectedFontFamily,
          borderRadius: `${borderRadiusPx}px`
        }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            border: `${borderWidthPx}px solid ${borderColor}`,
            borderRadius: `${borderRadiusPx}px`
          }}
        />

        {showEsgIcon && (
          <img
            src={esgIconSrc}
            alt="ESG"
            className="absolute object-contain"
            draggable={false}
            style={{
              top: `${esgTopFullBorder}px`,
              right: `${esgRight}px`,
              width: `${esgIconSize}px`,
              height: `${esgIconSize}px`
            }}
          />
        )}

        <div
          className="absolute inset-0 text-center"
          style={{
            paddingLeft: `${centeredPadX}px`,
            paddingRight: `${centeredPadX}px`
          }}
        >
          <div
            className="absolute left-1/2 flex -translate-x-1/2 items-center justify-center"
            style={{
              top: `${logoTopPx}px`,
              width: `${logoBoxWidth}px`,
              height: `${logoBoxHeight}px`
            }}
          >
            {data.logoUrl ? (
              <img
                src={data.logoUrl}
                alt="Client logo"
                className="h-full w-full object-contain"
                draggable={false}
              />
            ) : (
              <div className="h-full w-full border border-black/20" />
            )}
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2 break-words text-center font-medium uppercase text-black/85"
            style={{
              top: `${roleTopPx}px`,
              width: `${Math.round((widthPx - centeredPadX * 2) * 0.94)}px`,
              height: `${roleHeightPx}px`,
              overflow: "hidden",
              backgroundColor: "transparent",
              fontSize: resolveFontSizePx("role"),
              lineHeight: 1.15,
              letterSpacing: "0.03em"
            }}
          >
            {roleText}
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2 overflow-hidden whitespace-normal break-words font-normal text-black/85"
            style={{
              top: `${descTopPx}px`,
              width: `${Math.round((widthPx - centeredPadX * 2) * 0.9)}px`,
              height: `${descHeightPx}px`,
              fontSize: resolveFontSizePx("description"),
              lineHeight: 1.25,
              letterSpacing: "0.01em"
            }}
          >
            {data.description}
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2 font-semibold text-black"
            style={{
              top: `${valueTopPx}px`,
              width: `${Math.round((widthPx - centeredPadX * 2) * 0.9)}px`,
              fontSize: resolveFontSizePx("dealValue"),
              letterSpacing: "0.01em"
            }}
          >
            {valueText}
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2 font-normal text-black/70"
            style={{
              top: `${yearTopPx}px`,
              width: `${Math.round((widthPx - centeredPadX * 2) * 0.9)}px`,
              fontSize: resolveFontSizePx("year"),
              letterSpacing: "0.04em"
            }}
          >
            {yearText}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className="relative overflow-hidden text-black"
      style={{
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        backgroundColor,
        fontFamily: selectedFontFamily
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          borderLeft: "2px solid #8A8A8A",
          borderRight: data.templateStyle === "double-vertical" ? "2px solid #8A8A8A" : "none",
          borderTop: data.templateStyle === "left-top" ? "2px solid #8A8A8A" : "none"
        }}
      />

      <div
        className="absolute left-0 whitespace-nowrap font-normal uppercase text-black/82"
        style={{
          top: `${sectorTop}px`,
          left: `${Math.round(widthPx * 0.04)}px`,
          fontSize: resolveFontSizePx("sector"),
          letterSpacing: "0.05em"
        }}
      >
        {sectorText}
      </div>

      {showEsgIcon && (
        <img
          src={esgIconSrc}
          alt="ESG"
          className="absolute object-contain"
          draggable={false}
          style={{
            top: `${sectorTop}px`,
            right: `${esgRight}px`,
            width: `${esgIconSize}px`,
            height: `${esgIconSize}px`
          }}
        />
      )}

      <div
        className="absolute"
        style={{
          top: `${logoTop}px`,
          left: `${logoLeft}px`,
          width: `${logoWidth}px`,
          height: `${logoHeight}px`
        }}
      >
        {data.logoUrl ? (
          <img
            src={data.logoUrl}
            alt="Client logo"
            className="h-full w-full object-contain"
            draggable={false}
          />
        ) : (
          <div className="h-full w-full border border-black/20" />
        )}
      </div>

      <div
        className="absolute max-w-[78%] break-words font-normal text-black/82"
        style={{
          top: `${monthYearTop}px`,
          left: `${textLeft}px`,
          fontSize: resolveFontSizePx("date"),
          letterSpacing: "0.01em"
        }}
      >
        {dateText}
      </div>

      <div
        className="absolute max-w-[78%] break-words font-semibold text-black"
        style={{
          top: `${dealValueTop}px`,
          left: `${textLeft}px`,
          fontSize: resolveFontSizePx("dealValue"),
          letterSpacing: "0.01em",
          lineHeight: 1.1
        }}
      >
        {valueText}
      </div>

      <div
        className="absolute max-w-[78%] break-words font-normal text-black/85"
        style={{
          top: `${descriptionTop}px`,
          left: `${textLeft}px`,
          fontSize: resolveFontSizePx("description"),
          letterSpacing: "0.01em",
          lineHeight: 1.25
        }}
      >
        {data.description}
      </div>

      <div
        className="absolute max-w-[78%] break-words font-normal text-black/72"
        style={{
          top: `${roleTop}px`,
          left: `${textLeft}px`,
          fontSize: resolveFontSizePx("role"),
          letterSpacing: "0.01em"
        }}
      >
        {roleText}
      </div>
    </div>
  );
});
