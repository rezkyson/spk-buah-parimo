import * as XLSX from "xlsx";
import { z } from "zod";

export const productionYears = [2021, 2022, 2023, 2024] as const;

export type ProductionYear = (typeof productionYears)[number];

export type ExcelProduksiRow = {
  nama: string;
  nama_en: string | null;
  produksi: Record<ProductionYear, number>;
};

const rowSchema = z.object({
  nama: z.string().min(1),
  nama_en: z.string().nullable(),
  produksi: z.object({
    2021: z.number().nonnegative(),
    2022: z.number().nonnegative(),
    2023: z.number().nonnegative(),
    2024: z.number().nonnegative()
  })
});

export function parseExcelBuffer(buffer: Buffer): ExcelProduksiRow[] {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const worksheet = workbook.Sheets["Data Tanaman"] ?? workbook.Sheets[workbook.SheetNames[0]];

  if (!worksheet) {
    throw new Error("Sheet Data Tanaman tidak ditemukan.");
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: ""
  });

  const parsedRows: ExcelProduksiRow[] = [];
  let isFruitSection = false;

  for (const row of rows) {
    const label = getNameValue(row);
    const normalizedLabel = normalizeHeader(label);

    if (normalizedLabel.includes("buah")) {
      isFruitSection = true;
      continue;
    }

    if (isFruitSection && normalizedLabel.includes("sayuran")) {
      break;
    }

    if (!isFruitSection) {
      continue;
    }

    const normalizedRow = normalizeRow(row);

    if (normalizedRow) {
      parsedRows.push(normalizedRow);
    }
  }

  if (parsedRows.length === 0) {
    throw new Error("Tidak ada baris komoditas yang bisa dibaca dari Excel.");
  }

  return parsedRows.map((row) => rowSchema.parse(row));
}

export function parseIndonesianNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (value === null || value === undefined) {
    return 0;
  }

  const rawValue = String(value).trim();

  if (!rawValue || rawValue === "-") {
    return 0;
  }

  const normalized = rawValue
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");

  const numberValue = Number(normalized);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`Nilai produksi tidak valid: ${rawValue}`);
  }

  return numberValue;
}

function normalizeRow(row: Record<string, unknown>): ExcelProduksiRow | null {
  const rawName = getNameValue(row);
  const { nama, nama_en } = splitBilingualName(rawName);

  if (!nama || nama.toLowerCase() === "jumlah" || nama.endsWith(":")) {
    return null;
  }

  const produksi = Object.fromEntries(
    productionYears.map((year) => [year, parseIndonesianNumber(findYearValue(row, year))])
  ) as Record<ProductionYear, number>;

  return {
    nama,
    nama_en,
    produksi
  };
}

function getNameValue(row: Record<string, unknown>) {
  const entries = Object.entries(row);
  const namaEntry = entries.find(([key]) => {
    const normalizedKey = normalizeHeader(key);
    return (
      normalizedKey.includes("komoditas") ||
      normalizedKey.includes("nama") ||
      normalizedKey.includes("jenis")
    );
  });

  return String(namaEntry?.[1] ?? "").trim();
}

function splitBilingualName(rawName: string) {
  const knownEnglishNames = new Set([
    "avocado",
    "grape",
    "apple",
    "star fruit",
    "water apple",
    "guava",
    "pomelo",
    "longan",
    "mango",
    "mangosteen",
    "pineapple",
    "jackfruit",
    "papaya",
    "banana",
    "snakefruit",
    "sapodilla",
    "soursop",
    "breadfruit"
  ]);

  const parts = rawName
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  const lastPart = parts.at(-1);

  if (parts.length > 1 && lastPart && knownEnglishNames.has(lastPart.toLowerCase())) {
    return {
      nama: parts.slice(0, -1).join("/"),
      nama_en: lastPart
    };
  }

  return {
    nama: rawName,
    nama_en: null
  };
}

function findYearValue(row: Record<string, unknown>, year: ProductionYear) {
  const entry = Object.entries(row).find(([key]) =>
    normalizeHeader(key).includes(String(year))
  );

  return entry?.[1] ?? 0;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}
