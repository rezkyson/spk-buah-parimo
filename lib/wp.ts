export const wpProductionYears = [2021, 2022, 2023, 2024] as const;
export const criteriaCodes = ["C1", "C2", "C3", "C4"] as const;

export type ProductionYear = (typeof wpProductionYears)[number];
export type CriteriaCode = (typeof criteriaCodes)[number];
export type CriteriaType = "benefit" | "cost";

export type ProductionByYear = Record<ProductionYear, number>;

export type CommodityProductionInput = {
  komoditasId: string;
  nama: string;
  nama_en?: string | null;
  produksi: ProductionByYear;
};

export type CriteriaValues = Record<CriteriaCode, number>;

export type CriteriaWeightInput = {
  kode: CriteriaCode;
  nama?: string;
  tipe?: CriteriaType;
  bobot: number;
};

export type NormalizedWeight = {
  kode: CriteriaCode;
  nama: string;
  tipe: CriteriaType;
  bobot: number;
  normalizedWeight: number;
  exponent: number;
};

export type CriteriaRow = {
  komoditasId: string;
  nama: string;
  nama_en: string | null;
  produksi: ProductionByYear;
  kriteria: CriteriaValues;
};

export type CriteriaAdjustment = {
  kode: CriteriaCode;
  minValue: number;
  offset: number;
};

export type AdjustedCriteriaRow = CriteriaRow & {
  kriteriaWp: CriteriaValues;
};

export type VectorSRow = {
  komoditasId: string;
  nama: string;
  nilai_s: number;
};

export type VectorVRow = VectorSRow & {
  nilai_v: number;
};

export type RankingRow = VectorVRow & {
  peringkat: number;
  nama_en: string | null;
  kriteria: CriteriaValues;
  kriteriaWp: CriteriaValues;
};

export type WeightedProductResult = {
  criteriaTable: CriteriaRow[];
  normalizedWeights: NormalizedWeight[];
  criteriaAdjustments: CriteriaAdjustment[];
  adjustedCriteriaTable: AdjustedCriteriaRow[];
  vectorS: VectorSRow[];
  vectorV: VectorVRow[];
  rankings: RankingRow[];
  bobotSnapshot: NormalizedWeight[];
};

const criteriaNames: Record<CriteriaCode, string> = {
  C1: "Produksi",
  C2: "Pertumbuhan Produksi",
  C3: "Rata-rata Produksi",
  C4: "Konsistensi Produksi"
};

const requiredWeightTotal = 100;
const weightTolerance = 1e-6;

export function calculateTotalProduction(produksi: ProductionByYear) {
  return getProductionValues(produksi).reduce((total, value) => total + value, 0);
}

export function calculateGrowthPercentage(produksi: ProductionByYear) {
  const startValue = produksi[2021];
  const endValue = produksi[2024];

  validateProductionValue(startValue, "produksi 2021");
  validateProductionValue(endValue, "produksi 2024");

  if (startValue === 0) {
    return endValue > 0 ? 100 : 0;
  }

  return ((endValue - startValue) / startValue) * 100;
}

export function calculateAverageProduction(produksi: ProductionByYear) {
  return calculateTotalProduction(produksi) / wpProductionYears.length;
}

export function calculateStandardDeviation(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  values.forEach((value, index) => validateFiniteNumber(value, `value ${index}`));

  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  const variance =
    values.reduce((total, value) => total + (value - mean) ** 2, 0) /
    values.length;

  return Math.sqrt(variance);
}

export function calculateConsistencyScore(produksi: ProductionByYear) {
  const values = getProductionValues(produksi);
  const mean = values.reduce((total, value) => total + value, 0) / values.length;

  if (mean === 0) {
    return 0;
  }

  return 1 - calculateStandardDeviation(values) / mean;
}

export function calculateCriteriaValues(produksi: ProductionByYear): CriteriaValues {
  getProductionValues(produksi).forEach((value, index) =>
    validateProductionValue(value, `produksi ${wpProductionYears[index]}`)
  );

  return {
    C1: calculateTotalProduction(produksi),
    C2: calculateGrowthPercentage(produksi),
    C3: calculateAverageProduction(produksi),
    C4: calculateConsistencyScore(produksi)
  };
}

export function buildCriteriaTable(
  alternatives: CommodityProductionInput[]
): CriteriaRow[] {
  return alternatives
    .map((alternative) => {
      const kriteria = calculateCriteriaValues(alternative.produksi);

      return {
        komoditasId: alternative.komoditasId,
        nama: alternative.nama,
        nama_en: alternative.nama_en ?? null,
        produksi: alternative.produksi,
        kriteria
      };
    })
    .filter((row) => row.kriteria.C1 > 0);
}

export function normalizeWeights(weights: CriteriaWeightInput[]) {
  const weightMap = new Map(weights.map((weight) => [weight.kode, weight]));
  const totalWeight = weights.reduce((total, weight) => {
    validateFiniteNumber(weight.bobot, `bobot ${weight.kode}`);

    if (weight.bobot < 0) {
      throw new Error(`Bobot ${weight.kode} tidak boleh negatif.`);
    }

    return total + weight.bobot;
  }, 0);

  if (Math.abs(totalWeight - requiredWeightTotal) > weightTolerance) {
    throw new Error("Total bobot kriteria harus 100%.");
  }

  return criteriaCodes.map<NormalizedWeight>((kode) => {
    const weight = weightMap.get(kode);

    if (!weight) {
      throw new Error(`Bobot ${kode} belum diisi.`);
    }

    const tipe = weight.tipe ?? "benefit";
    const normalizedWeight = weight.bobot / totalWeight;

    return {
      kode,
      nama: weight.nama ?? criteriaNames[kode],
      tipe,
      bobot: weight.bobot,
      normalizedWeight,
      exponent: tipe === "cost" ? -normalizedWeight : normalizedWeight
    };
  });
}

export function makePositiveCriteriaMatrix(rows: CriteriaRow[]) {
  const adjustments = criteriaCodes.map<CriteriaAdjustment>((kode) => {
    const minValue = Math.min(...rows.map((row) => row.kriteria[kode]));
    const offset = minValue <= 0 ? Math.abs(minValue) + 1 : 0;

    return {
      kode,
      minValue,
      offset
    };
  });

  const adjustmentMap = new Map(
    adjustments.map((adjustment) => [adjustment.kode, adjustment.offset])
  );

  const adjustedRows = rows.map<AdjustedCriteriaRow>((row) => {
    const adjustedEntries = criteriaCodes.map((kode) => {
      const adjustedValue = row.kriteria[kode] + (adjustmentMap.get(kode) ?? 0);

      if (!Number.isFinite(adjustedValue) || adjustedValue <= 0) {
        throw new Error(`Nilai kriteria ${kode} tidak valid untuk WP.`);
      }

      return [kode, adjustedValue] as const;
    });

    return {
      ...row,
      kriteriaWp: Object.fromEntries(adjustedEntries) as CriteriaValues
    };
  });

  return {
    adjustments,
    adjustedRows
  };
}

export function calculateVectorS(
  rows: AdjustedCriteriaRow[],
  weights: NormalizedWeight[]
) {
  return rows.map<VectorSRow>((row) => {
    const nilai_s = weights.reduce((score, weight) => {
      const criteriaValue = row.kriteriaWp[weight.kode];
      return score * criteriaValue ** weight.exponent;
    }, 1);

    validateFiniteNumber(nilai_s, `nilai S ${row.nama}`);

    if (nilai_s <= 0) {
      throw new Error(`Nilai S ${row.nama} tidak valid.`);
    }

    return {
      komoditasId: row.komoditasId,
      nama: row.nama,
      nilai_s
    };
  });
}

export function calculateVectorV(vectorS: VectorSRow[]) {
  const totalS = vectorS.reduce((total, row) => total + row.nilai_s, 0);

  validateFiniteNumber(totalS, "total nilai S");

  if (totalS <= 0) {
    throw new Error("Total nilai S tidak valid.");
  }

  return vectorS.map<VectorVRow>((row) => ({
    ...row,
    nilai_v: row.nilai_s / totalS
  }));
}

export function calculateWeightedProduct(
  alternatives: CommodityProductionInput[],
  weights: CriteriaWeightInput[]
): WeightedProductResult {
  const criteriaTable = buildCriteriaTable(alternatives);

  if (criteriaTable.length === 0) {
    throw new Error("Tidak ada komoditas dengan produksi lebih dari 0.");
  }

  const normalizedWeights = normalizeWeights(weights);
  const { adjustments, adjustedRows } = makePositiveCriteriaMatrix(criteriaTable);
  const vectorS = calculateVectorS(adjustedRows, normalizedWeights);
  const vectorV = calculateVectorV(vectorS);
  const adjustedById = new Map(
    adjustedRows.map((row) => [row.komoditasId, row])
  );

  const rankings = [...vectorV]
    .sort((a, b) => {
      if (b.nilai_v !== a.nilai_v) {
        return b.nilai_v - a.nilai_v;
      }

      return a.nama.localeCompare(b.nama);
    })
    .map<RankingRow>((row, index) => {
      const adjustedRow = adjustedById.get(row.komoditasId);

      if (!adjustedRow) {
        throw new Error(`Data kriteria tidak ditemukan untuk ${row.nama}.`);
      }

      return {
        ...row,
        peringkat: index + 1,
        nama_en: adjustedRow.nama_en,
        kriteria: adjustedRow.kriteria,
        kriteriaWp: adjustedRow.kriteriaWp
      };
    });

  return {
    criteriaTable,
    normalizedWeights,
    criteriaAdjustments: adjustments,
    adjustedCriteriaTable: adjustedRows,
    vectorS,
    vectorV,
    rankings,
    bobotSnapshot: normalizedWeights
  };
}

function getProductionValues(produksi: ProductionByYear) {
  return wpProductionYears.map((year) => produksi[year]);
}

function validateProductionValue(value: number, label: string) {
  validateFiniteNumber(value, label);

  if (value < 0) {
    throw new Error(`${label} tidak boleh negatif.`);
  }
}

function validateFiniteNumber(value: number, label: string) {
  if (!Number.isFinite(value)) {
    throw new Error(`${label} harus berupa angka valid.`);
  }
}
