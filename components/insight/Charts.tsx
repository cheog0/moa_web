"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useTheme } from "@/hooks/useTheme";
import { whenDarkValue } from "@/lib/theme";

const tooltipStyle = {
  backgroundColor: "hsl(var(--card))",
  borderColor: "hsl(var(--border))",
  borderRadius: "0.75rem",
  color: "hsl(var(--foreground))",
  fontSize: "12px",
};

const darkTooltipStyle = {
  backgroundColor: "var(--card)",
  borderColor: "var(--border)",
  borderRadius: "0.75rem",
  color: "var(--foreground)",
  fontSize: "12px",
};

export default function Charts({
  monthlyBarData,
}: {
  monthlyBarData: { name: string; 회의수: number; 녹음시간: number }[];
}) {
  const { theme } = useTheme();
  const grid = whenDarkValue(theme, "var(--border)", "hsl(var(--border))");
  const axis = whenDarkValue(
    theme,
    "var(--muted-foreground)",
    "hsl(var(--muted-foreground))",
  );
  const fill = whenDarkValue(theme, "var(--primary)", "hsl(var(--primary))");
  const tooltip = whenDarkValue(theme, darkTooltipStyle, tooltipStyle);
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold">월별 회의 수</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            최근 12개월 동안 녹음된 회의 건수
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyBarData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={grid}
                opacity={0.4}
              />
              <XAxis
                dataKey="name"
                stroke={axis}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={axis}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={tooltip}
                formatter={(value: any) => [`${value}건`, "회의 수"]}
              />
              <Bar
                dataKey="회의수"
                fill={fill}
                radius={[4, 4, 0, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-base font-bold">녹음 시간 추이</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            월별 누적 녹음 시간 (시간)
          </p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyBarData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={fill}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={fill}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke={grid}
                opacity={0.4}
              />
              <XAxis
                dataKey="name"
                stroke={axis}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke={axis}
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={tooltip}
                formatter={(value: any) => [`${value} 시간`, "녹음 시간"]}
              />
              <Area
                type="monotone"
                dataKey="녹음시간"
                stroke={fill}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTime)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
