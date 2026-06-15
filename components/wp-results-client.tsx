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
import {
  BarChart3,
  Download,
  FileText,
  ListOrdered,
  Radar as RadarIcon
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
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

const chartColors = ["#16a34a", "#0f766e", "#2563eb", "#ca8a04", "#475569"];

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
      { Keterangan: "Judul", Nilai: "Hasil Ranking Komoditas Buah Parigi Moutong" },
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
      "Bobot (%)": row.bobot
    }));
    const rows = result.rankings.map((row) => ({
      Peringkat: row.peringkat,
      Komoditas: row.nama,
      "Nama Inggris": row.nama_en ?? "",
      "Nilai S": row.nilai_s,
      "Nilai V": row.nilai_v,
      Produksi: row.kriteria.C1,
      Pertumbuhan: row.kriteria.C2,
      "Rata-rata": row.kriteria.C3,
      Konsistensi: row.kriteria.C4
    }));
    const metadataWorksheet = XLSX.utils.json_to_sheet(metadataRows);
    const weightWorksheet = XLSX.utils.json_to_sheet(weightRows);
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, metadataWorksheet, "Metadata");
    XLSX.utils.book_append_sheet(workbook, weightWorksheet, "Bobot");
    XLSX.utils.book_append_sheet(workbook, worksheet, "Hasil Ranking");
    XLSX.writeFile(workbook, "hasil-ranking-buah-parimo.xlsx");
  }

  async function exportPdf() {
    const { jsPDF } = await import("jspdf");
    const autoTable = (await import("jspdf-autotable")).default;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("Hasil Ranking Komoditas Buah Parigi Moutong", 14, 16);
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
      head: [["Peringkat", "Komoditas", "Nilai S", "Nilai V"]],
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

    doc.save("hasil-ranking-buah-parimo.pdf");
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 border-b bg-muted/20 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ListOrdered className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Peringkat Komoditas</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {result.rankings.length} komoditas dianalisis
              </p>
            </div>
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
        </CardHeader>

        <CardContent className="p-0">
          <Table className="min-w-[900px]">
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>Peringkat</TableHead>
                <TableHead>Komoditas</TableHead>
                <TableHead className="text-right">Nilai S</TableHead>
                <TableHead className="text-right">Nilai V</TableHead>
                <TableHead className="text-right">Produksi</TableHead>
                <TableHead className="text-right">Pertumbuhan</TableHead>
                <TableHead className="text-right">Rata-rata</TableHead>
                <TableHead className="text-right">Konsistensi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.rankings.map((row) => (
                <TableRow key={row.komoditasId}>
                  <TableCell>
                    <RankBadge rank={row.peringkat} />
                  </TableCell>
                  <TableCell className="font-medium">
                    <span>{row.nama}</span>
                    {row.nama_en ? (
                      <span className="block text-xs text-muted-foreground">
                        {row.nama_en}
                      </span>
                    ) : null}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDecimal(row.nilai_s, 8)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatDecimal(row.nilai_v, 8)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDecimal(row.kriteria.C1, 2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDecimal(row.kriteria.C2, 2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDecimal(row.kriteria.C3, 2)}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDecimal(row.kriteria.C4, 4)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between border-b bg-muted/20 space-y-0">
            <CardTitle>Grafik Nilai V</CardTitle>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </span>
          </CardHeader>
          <CardContent className="p-4">
          <div className="h-[360px] min-w-0">
            {isMounted ? (
              <ResponsiveContainer height="100%" minWidth={0} width="100%">
                <BarChart data={barData} margin={{ bottom: 80, left: 4, right: 8, top: 8 }}>
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
                  <Tooltip formatter={(value) => formatDecimal(Number(value), 8)} />
                  <Bar dataKey="nilaiV" fill="#16a34a" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartPlaceholder />
            )}
          </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between border-b bg-muted/20 space-y-0">
            <CardTitle>Radar Top 5</CardTitle>
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
              <RadarIcon className="h-5 w-5" />
            </span>
          </CardHeader>
          <CardContent className="p-4">
          <div className="h-[360px] min-w-0">
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
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function ChartPlaceholder() {
  return <div className="h-full animate-pulse rounded-lg bg-muted/50" />;
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
