"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Pencil,
  Plus,
  Search,
  Sprout,
  Trash2,
  TrendingUp,
  X
} from "lucide-react";

import { MetricCard } from "@/components/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateMessage } from "@/components/state-message";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import { productionYears, type ProductionYear } from "@/lib/excel";
import type { CommodityRow } from "@/lib/commodities";

type CommodityDataClientProps = {
  rows: CommodityRow[];
  isAdmin: boolean;
};

type CommodityFormState = {
  id?: string;
  nama: string;
  nama_en: string;
  produksi: Record<ProductionYear, string>;
};

const emptyForm: CommodityFormState = {
  nama: "",
  nama_en: "",
  produksi: {
    2021: "0",
    2022: "0",
    2023: "0",
    2024: "0"
  }
};

export function CommodityDataClient({
  rows,
  isAdmin
}: CommodityDataClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<CommodityFormState>(emptyForm);
  const [query, setQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const totals = useMemo(() => {
    const totalProduction = rows.reduce((sum, row) => sum + row.total, 0);
    const activeCommodities = rows.filter((row) => row.total > 0).length;

    return {
      totalProduction,
      activeCommodities
    };
  }, [rows]);
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return rows;
    }

    return rows.filter((row) => {
      return (
        row.nama.toLowerCase().includes(normalizedQuery) ||
        (row.nama_en ?? "").toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query, rows]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  function openCreateForm() {
    setForm(emptyForm);
    setIsFormOpen(true);
    setError(null);
    setStatus(null);
  }

  function openEditForm(row: CommodityRow) {
    setForm({
      id: row.id,
      nama: row.nama,
      nama_en: row.nama_en ?? "",
      produksi: {
        2021: String(row.produksi[2021]),
        2022: String(row.produksi[2022]),
        2023: String(row.produksi[2023]),
        2024: String(row.produksi[2024])
      }
    });
    setIsFormOpen(true);
    setError(null);
    setStatus(null);
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setError(null);

    const payload = {
      ...form,
      produksi: Object.fromEntries(
        productionYears.map((year) => [year, Number(form.produksi[year])])
      )
    };

    const response = await fetch("/api/komoditas", {
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Data komoditas gagal disimpan.");
      return;
    }

    setStatus(form.id ? "Data komoditas diperbarui." : "Data komoditas ditambahkan.");
    setIsFormOpen(false);
    refresh();
  }

  async function deleteRow(row: CommodityRow) {
    const confirmed = window.confirm(`Hapus data ${row.nama}?`);

    if (!confirmed) {
      return;
    }

    setStatus(null);
    setError(null);

    const response = await fetch(`/api/komoditas/${row.id}`, {
      method: "DELETE"
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Data komoditas gagal dihapus.");
      return;
    }

    setStatus(`Data ${row.nama} dihapus.`);
    refresh();
  }

  async function importExcel() {
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setError("Pilih file Excel terlebih dahulu.");
      return;
    }

    setStatus(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/import", {
      body: formData,
      method: "POST"
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error ?? "Import Excel gagal.");
      return;
    }

    setStatus(
      `Import selesai: ${result.imported} komoditas, ${result.produksiRows} data produksi.`
    );
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    refresh();
  }

  async function exportExcel() {
    const XLSX = await import("xlsx");
    const generatedAt = new Date().toLocaleString("id-ID");
    const metadataRows = [
      { Keterangan: "Judul", Nilai: "Data Produksi Komoditas Buah Parigi Moutong" },
      { Keterangan: "Tanggal export", Nilai: generatedAt },
      { Keterangan: "Periode", Nilai: "2021-2024" },
      { Keterangan: "Jumlah komoditas", Nilai: rows.length },
      { Keterangan: "Komoditas dianalisis", Nilai: totals.activeCommodities },
      { Keterangan: "Total produksi", Nilai: totals.totalProduction }
    ];
    const exportRows = rows.map((row) => ({
      Komoditas: row.nama,
      "Nama Inggris": row.nama_en ?? "",
      "2021": row.produksi[2021],
      "2022": row.produksi[2022],
      "2023": row.produksi[2023],
      "2024": row.produksi[2024],
      Total: row.total
    }));
    const metadataWorksheet = XLSX.utils.json_to_sheet(metadataRows);
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, metadataWorksheet, "Metadata");
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Komoditas");
    XLSX.writeFile(workbook, "data-komoditas-buah-parimo.xlsx");
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          icon={Sprout}
          label="Total komoditas"
          tone="primary"
          value={formatNumber(rows.length, 0)}
        />
        <MetricCard
          icon={Activity}
          label="Komoditas dianalisis"
          tone="sky"
          value={formatNumber(totals.activeCommodities, 0)}
        />
        <MetricCard
          icon={TrendingUp}
          label="Total produksi"
          tone="emerald"
          value={formatNumber(totals.totalProduction)}
        />
      </section>

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 border-b bg-muted/20 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileSpreadsheet className="h-5 w-5" />
            </span>
            <div>
              <CardTitle>Data Produksi Buah</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatNumber(filteredRows.length, 0)} dari{" "}
                {formatNumber(rows.length, 0)} komoditas ditampilkan
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={exportExcel} type="button" variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            {isAdmin ? (
              <Button onClick={openCreateForm} type="button">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Data
              </Button>
            ) : null}
          </div>
        </CardHeader>

        <CardContent className="p-5">
          {isAdmin ? (
            <div className="mb-5 grid gap-4 rounded-lg border border-primary/15 bg-primary/5 p-4 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="space-y-2">
                <Label htmlFor="excel-file">Import Excel</Label>
                <Input
                  accept=".xlsx,.xls"
                  id="excel-file"
                  ref={fileInputRef}
                  type="file"
                />
              </div>
              <Button onClick={importExcel} type="button">
                <FileUp className="mr-2 h-4 w-4" />
                Import
              </Button>
            </div>
          ) : null}

          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="w-full max-w-md space-y-2">
              <Label htmlFor="search-komoditas">Cari komoditas</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  id="search-komoditas"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Contoh: Durian"
                  value={query}
                />
              </div>
            </div>
            <Badge variant="outline">
              {formatNumber(filteredRows.length, 0)} baris
            </Badge>
          </div>

          {status ? (
            <p className="mt-4 flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
              <CheckCircle2 className="h-4 w-4" />
              {status}
            </p>
          ) : null}

          {error ? (
            <p className="mt-4 flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </p>
          ) : null}

          {isFormOpen ? (
            <CommodityForm
              form={form}
              isPending={isPending}
              onCancel={() => setIsFormOpen(false)}
              onChange={setForm}
              onSubmit={submitForm}
            />
          ) : null}

          {rows.length === 0 ? (
            <div className="mt-5">
              <StateMessage
                description="Import file Excel untuk mulai mengisi data produksi komoditas."
                title="Belum ada data komoditas"
              />
            </div>
          ) : filteredRows.length === 0 ? (
            <div className="mt-5">
              <StateMessage
                description="Coba gunakan kata kunci lain atau kosongkan kolom pencarian."
                title="Komoditas tidak ditemukan"
              />
            </div>
          ) : (
            <div className="table-shell mt-5">
              <Table className="min-w-[900px]">
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead>Komoditas</TableHead>
                    <TableHead>Nama Inggris</TableHead>
                    {productionYears.map((year) => (
                      <TableHead className="text-right" key={year}>
                        {year}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">Total</TableHead>
                    {isAdmin ? (
                      <TableHead className="text-right">Aksi</TableHead>
                    ) : null}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.nama}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.nama_en ?? "-"}
                      </TableCell>
                      {productionYears.map((year) => (
                        <TableCell className="text-right tabular-nums" key={year}>
                          {formatNumber(row.produksi[year])}
                        </TableCell>
                      ))}
                      <TableCell className="text-right font-semibold tabular-nums">
                        {row.total > 0 ? (
                          formatNumber(row.total)
                        ) : (
                          <Badge variant="muted">0</Badge>
                        )}
                      </TableCell>
                      {isAdmin ? (
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              aria-label={`Edit ${row.nama}`}
                              onClick={() => openEditForm(row)}
                              size="icon"
                              title={`Edit ${row.nama}`}
                              type="button"
                              variant="outline"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              aria-label={`Hapus ${row.nama}`}
                              onClick={() => void deleteRow(row)}
                              size="icon"
                              title={`Hapus ${row.nama}`}
                              type="button"
                              variant="outline"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function CommodityForm({
  form,
  isPending,
  onCancel,
  onChange,
  onSubmit
}: {
  form: CommodityFormState;
  isPending: boolean;
  onCancel: () => void;
  onChange: (form: CommodityFormState) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form
      className="mt-5 rounded-lg border border-primary/15 bg-white p-4 shadow-sm"
      onSubmit={onSubmit}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">
            {form.id ? "Edit komoditas" : "Tambah komoditas"}
          </h3>
        </div>
        <Button
          aria-label="Tutup form"
          onClick={onCancel}
          size="icon"
          title="Tutup form"
          type="button"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="nama">Nama komoditas</Label>
          <Input
            id="nama"
            onChange={(event) => onChange({ ...form, nama: event.target.value })}
            required
            value={form.nama}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nama_en">Nama Inggris</Label>
          <Input
            id="nama_en"
            onChange={(event) =>
              onChange({ ...form, nama_en: event.target.value })
            }
            value={form.nama_en}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        {productionYears.map((year) => (
          <div className="space-y-2" key={year}>
            <Label htmlFor={`produksi-${year}`}>{year}</Label>
            <Input
              id={`produksi-${year}`}
              min="0"
              onChange={(event) =>
                onChange({
                  ...form,
                  produksi: {
                    ...form.produksi,
                    [year]: event.target.value
                  }
                })
              }
              required
              step="0.01"
              type="number"
              value={form.produksi[year]}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button onClick={onCancel} type="button" variant="outline">
          Batal
        </Button>
        <Button disabled={isPending} type="submit">
          Simpan
        </Button>
      </div>
    </form>
  );
}
