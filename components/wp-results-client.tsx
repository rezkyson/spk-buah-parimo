"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { Download, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDecimal } from "@/lib/format";
import {
  getCriteriaLabel,
  getOrderedCriteriaCodes
} from "@/lib/wp-labels";
import type { WeightedProductResult } from "@/lib/wp";

type WpResultsClientProps = {
  result: WeightedProductResult;
  savedAt: string | null;
};

const chartColors = ["#15803d", "#0f766e", "#2563eb", "#9333ea", "#ea580c"];

export function WpResultsClient({ result, savedAt }: WpResultsClientProps) {
  const [isMounted, setIsMounted] = useState(false);
  const barData = result.rankings.map((row) => ({
    name: row.nama,
    nilaiV: Number(row.nilai_v.toFixed(8))
  }));
  const criteriaCodes = getOrderedCriteriaCodes();
  const topFive = result.rankings.slice(0, 5);
  const radarData = criteriaCodes.map((kode) => {
    const maxValue = Math.max(...topFive.map((row) => row.kriteriaWp[kode]));
    const values = Object.fromEntries(
      topFive.map((row) => [
        row.nama,
        maxValue > 0 ? Number(((row.kriteriaWp[kode] / maxValue) * 100).toFixed(2)) : 0
      ])
    );

    return {
      criterion: getCriteriaLabel(kode),
      ...values
    };
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  async function exportExcel() {
    const XLSX = await import("xlsx");
    const generatedAt = new Date().toLocaleString("id-ID");
    const metadataRows = [
      { Keterangan: "Judul", Nilai: "Hasil Ranking WP Komoditas Buah Parigi Moutong" },
      { Keterangan: "Tanggal export", Nilai: generatedAt },
      {
        Keterangan: "Hasil terakhir disimpan",
        Nilai: savedAt ? new Date(savedAt).toLocaleString("id-ID") : "Belum tersimpan"
      },
      { Keterangan: "Jumlah komoditas dianalisis", Nilai: result.rankings.length },
      { Keterangan: "Komoditas peringkat 1", Nilai: result.rankings[0]?.nama ?? "-" }
    ];
    const weightRows = result.normalizedWeights.map((row) => ({
      Kode: row.kode,
      Kriteria: row.nama,
      Tipe: row.tipe,
      "Bobot (%)": row.bobot,
      "Bobot Normal": row.normalizedWeight,
      Eksponen: row.exponent
    }));
    const rows = result.rankings.map((row) => ({
      Peringkat: row.peringkat,
      Komoditas: row.nama,
      "Nama Inggris": row.nama_en ?? "",
      "Nilai S": row.nilai_s,
      "Nilai V": row.nilai_v,
      C1: row.kriteria.C1,
      C2: row.kriteria.C2,
      C3: row.kriteria.C3,
      C4: row.kriteria.C4
    }));
    const metadataWorksheet = XLSX.utils.json_to_sheet(metadataRows);
    const weightWorksheet = XLSX.utils.json_to_sheet(weightRows);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, metadataWorksheet, "Metadata");
    XLSX.utils.book_append_sheet(workbook, weightWorksheet, "Bobot");
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil WP");
    XLSX.writeFile(workbook, "hasil-ranking-wp-buah-parimo.xlsx");
  }

  async function exportPdf() {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Hasil Ranking WP Komoditas Buah Parigi Moutong", 14, 16);
    doc.setFontSize(10);
    doc.text(`Tanggal export: ${new Date().toLocaleString("id-ID")}`, 14, 24);
    const weightText = result.normalizedWeights
      .map((row) => `${row.kode} ${row.bobot}%`)
      .join(", ");
    doc.text(`Bobot: ${weightText}`, 14, savedAt ? 36 : 30);
    if (savedAt) {
      doc.text(
        `Hasil terakhir disimpan: ${new Date(savedAt).toLocaleString("id-ID")}`,
        14,
        30
      );
    }

    autoTable(doc, {
      head: [["Rank", "Komoditas", "Nilai S", "Nilai V"]],
      body: result.rankings.map((row) => [
        row.peringkat,
        row.nama,
        row.nilai_s.toFixed(8),
        row.nilai_v.toFixed(8)
      ]),
      startY: savedAt ? 44 : 38,
      styles: {
        fontSize: 8
      },
      headStyles: {
        fillColor: [21, 128, 61]
      }
    });

    doc.save("hasil-ranking-wp-buah-parimo.pdf");
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-base font-semibold">Peringkat Komoditas</h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Diurutkan dari nilai V tertinggi ke terendah.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => void exportExcel()} type="button" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button onClick={() => void exportPdf()} type="button" variant="outline">
              <FileText className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-left">
                <th className="px-3 py-3 font-semibold">Rank</th>
                <th className="px-3 py-3 font-semibold">Komoditas</th>
                <th className="px-3 py-3 text-right font-semibold">Nilai S</th>
                <th className="px-3 py-3 text-right font-semibold">Nilai V</th>
                <th className="px-3 py-3 text-right font-semibold">C1</th>
                <th className="px-3 py-3 text-right font-semibold">C2</th>
                <th className="px-3 py-3 text-right font-semibold">C3</th>
                <th className="px-3 py-3 text-right font-semibold">C4</th>
              </tr>
            </thead>
            <tbody>
              {result.rankings.map((row) => (
                <tr className="border-b last:border-0" key={row.komoditasId}>
                  <td className="px-3 py-3">
                    <RankBadge rank={row.peringkat} />
                  </td>
                  <td className="px-3 py-3 font-medium">
                    <span>{row.nama}</span>
                    {row.nama_en ? (
                      <span className="block text-xs text-muted-foreground">
                        {row.nama_en}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatDecimal(row.nilai_s, 8)}
                  </td>
                  <td className="px-3 py-3 text-right font-medium">
                    {formatDecimal(row.nilai_v, 8)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatDecimal(row.kriteria.C1, 2)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatDecimal(row.kriteria.C2, 2)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatDecimal(row.kriteria.C3, 2)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {formatDecimal(row.kriteria.C4, 4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Grafik Nilai V</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Perbandingan skor relatif seluruh komoditas.
          </p>
          <div className="mt-4 h-[360px] min-w-0">
            {isMounted ? (
              <ResponsiveContainer height="100%" minWidth={0} width="100%">
                <BarChart data={barData} margin={{ bottom: 80, left: 4, right: 8, top: 8 }}>
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
                  <Tooltip formatter={(value) => formatDecimal(Number(value), 8)} />
                  <Bar dataKey="nilaiV" fill="#15803d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder />
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <h2 className="text-base font-semibold">Radar Top 5</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Skala relatif 0-100 per kriteria untuk lima komoditas teratas.
          </p>
          <div className="mt-4 h-[360px] min-w-0">
            {isMounted ? (
              <ResponsiveContainer height="100%" minWidth={0} width="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => `${formatDecimal(Number(value), 2)}`} />
                  {topFive.map((row, index) => (
                    <Radar
                      dataKey={row.nama}
                      fill={chartColors[index] ?? "#15803d"}
                      fillOpacity={0.12}
                      key={row.komoditasId}
                      name={row.nama}
                      stroke={chartColors[index] ?? "#15803d"}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function ChartPlaceholder() {
  return <div className="h-full rounded-lg bg-muted/40" />;
}

function RankBadge({ rank }: { rank: number }) {
  const tone =
    rank === 1
      ? "bg-primary text-primary-foreground"
      : rank === 2
        ? "bg-emerald-100 text-emerald-800"
        : rank === 3
          ? "bg-lime-100 text-lime-800"
          : "bg-muted text-muted-foreground";

  return (
    <span className={`inline-flex min-w-9 justify-center rounded-md px-2 py-1 font-semibold ${tone}`}>
      {rank}
    </span>
  );
}
