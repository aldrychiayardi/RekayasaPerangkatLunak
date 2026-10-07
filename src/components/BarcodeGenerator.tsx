"use client";

import { useEffect, useRef } from "react";
import JsBarcode from "jsbarcode";

interface BarcodeProps {
  value: string;
  width?: number;
  height?: number;
  fontSize?: number;
  displayValue?: boolean;
  className?: string;
}

export function BarcodeGenerator({
  value,
  width = 1.8,
  height = 45,
  fontSize = 13,
  displayValue = true,
  className = "",
}: BarcodeProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          width,
          height,
          displayValue,
          fontSize,
          margin: 4,
          font: "monospace",
          textMargin: 3,
        });
      } catch (err) {
        console.error("Failed to render barcode:", err);
      }
    }
  }, [value, width, height, fontSize, displayValue]);

  return <svg ref={svgRef} className={`mx-auto ${className}`} />;
}
