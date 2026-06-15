"use client";

import { useEffect, useState } from "react";
import { BarChart3, LineChart as LineChartIcon } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/format";

type ProductionBarDatum = {
  name: string;
  total: number;
};

type TrendDatum = {
  tahun: string;
  total: number;
};

type DashboardChartsClientProps = {
  productionData: ProductionBarDatum[];
  trendData: TrendDatum[];
};

export function DashboardChartsClient({
  productionData,
  trendData
}: DashboardChartsClientProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between border-b bg-muted/20">
          <CardTitle>Total Produksi Komoditas</CardTitle>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <BarChart3 className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent className="p-4">
        <div className="h-[340px] min-w-0">
          {isMounted ? (
            <ResponsiveContainer height="100%" minWidth={0} width="100%">
              <BarChart
                data={productionData}
                margin={{ bottom: 80, left: 4, right: 8, top: 8 }}
              >
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  angle={-55}
                  dataKey="name"
                  height={90}
                  interval={0}
                  textAnchor="end"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip formatter={(value) => formatNumber(Number(value))} />
                <Bar dataKey="total" fill="#16a34a" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder />
          )}
        </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <CardHeader className="flex-row items-center justify-between border-b bg-muted/20">
          <CardTitle>Tren Produksi Tahunan</CardTitle>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
            <LineChartIcon className="h-5 w-5" />
          </span>
        </CardHeader>
        <CardContent className="p-4">
        <div className="h-[340px] min-w-0">
          {isMounted ? (
            <ResponsiveContainer height="100%" minWidth={0} width="100%">
              <LineChart data={trendData} margin={{ left: 4, right: 18, top: 8 }}>
                <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tahun" tick={{ fontSize: 12 }} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                <Tooltip formatter={(value) => formatNumber(Number(value))} />
                <Line
                  activeDot={{ r: 5 }}
                  dataKey="total"
                  dot={{ r: 4 }}
                  stroke="#15803d"
                  strokeWidth={2}
                  type="monotone"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder />
          )}
        </div>
        </CardContent>
      </Card>
    </section>
  );
}

function ChartPlaceholder() {
  return <div className="h-full animate-pulse rounded-lg bg-muted/50" />;
}
