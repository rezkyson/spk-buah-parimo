"use client";

import { useEffect, useState } from "react";
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
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Total Produksi Komoditas</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Akumulasi produksi 2021-2024 untuk setiap komoditas.
        </p>
        <div className="mt-4 h-[340px] min-w-0">
          {isMounted ? (
            <ResponsiveContainer height="100%" minWidth={0} width="100%">
              <BarChart
                data={productionData}
                margin={{ bottom: 80, left: 4, right: 8, top: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  angle={-55}
                  dataKey="name"
                  height={90}
                  interval={0}
                  textAnchor="end"
                  tick={{ fontSize: 11 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatNumber(Number(value))} />
                <Bar dataKey="total" fill="#15803d" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartPlaceholder />
          )}
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <h2 className="text-base font-semibold">Tren Produksi Tahunan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Total produksi semua komoditas per tahun.
        </p>
        <div className="mt-4 h-[340px] min-w-0">
          {isMounted ? (
            <ResponsiveContainer height="100%" minWidth={0} width="100%">
              <LineChart data={trendData} margin={{ left: 4, right: 18, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tahun" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
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
      </div>
    </section>
  );
}

function ChartPlaceholder() {
  return <div className="h-full rounded-lg bg-muted/40" />;
}
