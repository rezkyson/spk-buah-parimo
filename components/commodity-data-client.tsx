"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, FileUp, Pencil, Plus, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StateMessage } from "@/components/state-message";
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
      <section className="grid gap-3 md:grid-cols-3">
        <Metric label="Total komoditas" value={formatNumber(rows.length, 0)} />
        <Metric
          label="Komoditas dianalisis"
          value={formatNumber(totals.activeCommodities, 0)}
        />
        <Metric
          label="Total produksi"
          value={formatNumber(totals.totalProduction)}
        />
      </section>

      <section className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-base font-semibold">Data Produksi Buah</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Produksi tahun 2021 sampai 2024 dari data Excel sumber.
            </p>
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
        </div>

        {isAdmin ? (
          <div className="mt-4 flex flex-col gap-3 rounded-lg border bg-muted/30 p-3 md:flex-row md:items-center">
            <div className="flex-1">
              <Label htmlFor="excel-file">Import Excel</Label>
              <Input
                accept=".xlsx,.xls"
                className="mt-2"
                id="excel-file"
                ref={fileInputRef}
                type="file"
              />
            </div>
            <Button className="md:mt-6" onClick={importExcel} type="button">
              <FileUp className="mr-2 h-4 w-4" />
              Import
            </Button>
          </div>
        ) : null}

        <div className="mt-4 max-w-sm">
          <Label htmlFor="search-komoditas">Cari komoditas</Label>
          <Input
            className="mt-2"
            id="search-komoditas"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Contoh: Durian"
            value={query}
          />
        </div>

        {status ? (
          <p className="mt-4 rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-primary">
            {status}
          </p>
        ) : null}

        {error ? (
          <p className="mt-4 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
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
          <div className="mt-4">
            <StateMessage
              description="Import file Excel untuk mulai mengisi data produksi komoditas."
              title="Belum ada data komoditas"
            />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="mt-4">
            <StateMessage
              description="Coba gunakan kata kunci lain atau kosongkan kolom pencarian."
              title="Komoditas tidak ditemukan"
            />
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-3 py-3 font-semibold">Komoditas</th>
                  <th className="px-3 py-3 font-semibold">Nama Inggris</th>
                  {productionYears.map((year) => (
                    <th className="px-3 py-3 text-right font-semibold" key={year}>
                      {year}
                    </th>
                  ))}
                  <th className="px-3 py-3 text-right font-semibold">Total</th>
                  {isAdmin ? (
                    <th className="px-3 py-3 text-right font-semibold">Aksi</th>
                  ) : null}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row) => (
                  <tr className="border-b last:border-0" key={row.id}>
                    <td className="px-3 py-3 font-medium">{row.nama}</td>
                    <td className="px-3 py-3 text-muted-foreground">
                      {row.nama_en ?? "-"}
                    </td>
                    {productionYears.map((year) => (
                      <td className="px-3 py-3 text-right" key={year}>
                        {formatNumber(row.produksi[year])}
                      </td>
                    ))}
                    <td className="px-3 py-3 text-right font-medium">
                      {formatNumber(row.total)}
                    </td>
                    {isAdmin ? (
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={() => openEditForm(row)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            onClick={() => void deleteRow(row)}
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
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
      className="mt-4 rounded-lg border bg-muted/20 p-4"
      onSubmit={onSubmit}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">
            {form.id ? "Edit komoditas" : "Tambah komoditas"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Masukkan nilai produksi dalam angka, tanpa pemisah ribuan.
          </p>
        </div>
        <Button onClick={onCancel} size="sm" type="button" variant="ghost">
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
