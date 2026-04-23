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
  const resolveFontSizePx = (element: Parameters<typeof getFontBaseSize>[1]) =>
    `${Math.round(getFontBaseSize(data.templateStyle, element) * fontScale * textScale * renderScale * 10) / 10}px`;

  const contentLeft = Math.round(widthPx * LAYOUT_RATIOS.contentLeft);
  const textLeft = Math.max(0, contentLeft - Math.round(widthPx * 0.04));
  const logoTop = Math.round(heightPx * LAYOUT_RATIOS.logoTop);
  const logoWidth = Math.round(widthPx * LAYOUT_RATIOS.logoWidth);
  const logoHeight = Math.round(heightPx * LAYOUT_RATIOS.logoHeight);
  const logoLeft = Math.round((widthPx - logoWidth) / 2);
  const sectorTop = Math.round(heightPx * LAYOUT_RATIOS.sectorBaseline - 10 * fontScale * renderScale);
  const monthYearTop = Math.round(heightPx * LAYOUT_RATIOS.monthYearBaseline - 8 * fontScale * renderScale);
  const dealValueTop = Math.round(heightPx * LAYOUT_RATIOS.dealValueBaseline - 11 * fontScale * renderScale);
  const descriptionTop = Math.round(heightPx * LAYOUT_RATIOS.descriptionBaseline - 8 * fontScale * renderScale);
  const roleTop = Math.round(heightPx * LAYOUT_RATIOS.roleBaseline - 8 * fontScale * renderScale);

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
  const esgTopFullBorder = Math.max(0, Math.round(heightPx * 0.003));

  if (data.templateStyle === "full-border-centered") {
    const centeredPadX = Math.round(widthPx * 0.07);
    const logoTopPx = Math.round(heightPx * 0.055);
    const logoBoxHeight = Math.round(heightPx * 0.225);
    const roleTopPx = Math.round(heightPx * 0.305);
    const descTopPx = Math.round(heightPx * 0.475);
    const valueTopPx = Math.round(heightPx * 0.82);
    const yearTopPx = Math.round(heightPx * 0.91);
    const descHeightPx = Math.max(10, valueTopPx - descTopPx - Math.round(heightPx * 0.03));
    const borderColor = "#CFCFCF";
    const borderRadiusPx = Math.max(6, Math.round(widthPx * 0.03));
    const borderWidthPx = Math.max(2, Math.round(widthPx * 0.008));

    return (
      <div
        ref={ref}
        className="relative overflow-hidden text-white"
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
              width: `${widthPx - centeredPadX * 2}px`,
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
              <div className="h-full w-full border border-white/20" />
            )}
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2 overflow-hidden break-words font-medium uppercase text-white/85"
            style={{
              top: `${roleTopPx}px`,
              width: `${Math.round((widthPx - centeredPadX * 2) * 0.94)}px`,
              maxHeight: `${Math.round(heightPx * 0.085)}px`,
              fontSize: resolveFontSizePx("role"),
              lineHeight: 1.2,
              letterSpacing: "0.03em"
            }}
          >
            {roleText}
          </div>

          <div
            className="absolute left-1/2 -translate-x-1/2 overflow-hidden whitespace-normal break-words font-normal text-white/85"
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
            className="absolute left-1/2 -translate-x-1/2 font-semibold text-white"
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
            className="absolute left-1/2 -translate-x-1/2 font-normal text-white/76"
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
      className="relative overflow-hidden text-white"
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
          borderLeft: "1px solid #A6A6A6",
          borderRight: data.templateStyle === "double-vertical" ? "1px solid #A6A6A6" : "none",
          borderTop: data.templateStyle === "left-top" ? "1px solid #A6A6A6" : "none"
        }}
      />

      <div
        className="absolute left-0 whitespace-nowrap font-normal uppercase text-white/82"
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
          <div className="h-full w-full border border-white/20" />
        )}
      </div>

      <div
        className="absolute max-w-[78%] break-words font-normal text-white/82"
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
        className="absolute max-w-[78%] break-words font-semibold text-white"
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
        className="absolute max-w-[78%] break-words font-normal text-white/85"
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
        className="absolute max-w-[78%] break-words font-normal text-white/75"
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
