// Minimal chart config placeholder. Use Recharts directly in pages.
import * as React from "react";
export type ChartConfig = Record<string, { label?: string; color?: string }>;
export const ChartContainer = ({ children }: { children: React.ReactNode; config?: ChartConfig }) => <>{children}</>;
export const ChartTooltip = () => null;
export const ChartTooltipContent = () => null;
export const ChartLegend = () => null;
export const ChartLegendContent = () => null;
export const ChartStyle = () => null;
