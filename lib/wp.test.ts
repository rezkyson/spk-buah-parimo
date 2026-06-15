import { describe, expect, it } from "vitest";

import {
  calculateConsistencyScore,
  calculateCriteriaValues,
  calculateGrowthPercentage,
  calculateStandardDeviation,
  calculateWeightedProduct,
  buildCriteriaTable,
  normalizeWeights,
  type CriteriaWeightInput,
  type ProductionByYear
} from "./wp";

const defaultWeights: CriteriaWeightInput[] = [
  { kode: "C1", nama: "Produksi", tipe: "benefit", bobot: 30 },
  { kode: "C2", nama: "Pertumbuhan Produksi", tipe: "benefit", bobot: 25 },
  { kode: "C3", nama: "Rata-rata Produksi", tipe: "benefit", bobot: 25 },
  { kode: "C4", nama: "Konsistensi Produksi", tipe: "benefit", bobot: 20 }
];

const production = (
  values: [number, number, number, number]
): ProductionByYear => ({
  2021: values[0],
  2022: values[1],
  2023: values[2],
  2024: values[3]
});

describe("Weighted Product criteria", () => {
  it("menghitung C1-C4 sesuai PRD", () => {
    const criteria = calculateCriteriaValues(production([100, 100, 100, 100]));

    expect(criteria.C1).toBe(400);
    expect(criteria.C2).toBe(0);
    expect(criteria.C3).toBe(100);
    expect(criteria.C4).toBe(1);
  });

  it("menggunakan rumus pertumbuhan dari tahun 2021 ke 2024", () => {
    expect(calculateGrowthPercentage(production([100, 80, 120, 150]))).toBe(50);
    expect(calculateGrowthPercentage(production([100, 80, 70, 50]))).toBe(-50);
  });

  it("menangani produksi 2021 bernilai 0 tanpa menghasilkan Infinity", () => {
    expect(calculateGrowthPercentage(production([0, 0, 0, 20]))).toBe(100);
    expect(calculateGrowthPercentage(production([0, 0, 0, 0]))).toBe(0);
  });

  it("menghitung standard deviation populasi untuk konsistensi", () => {
    expect(calculateStandardDeviation([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(2);
    expect(calculateConsistencyScore(production([100, 100, 100, 100]))).toBe(1);
  });
});

describe("Weighted Product weights", () => {
  it("menormalisasi bobot menjadi proporsi", () => {
    const normalizedWeights = normalizeWeights(defaultWeights);

    expect(normalizedWeights.map((weight) => weight.normalizedWeight)).toEqual([
      0.3, 0.25, 0.25, 0.2
    ]);
    expect(
      normalizedWeights.reduce((total, weight) => total + weight.normalizedWeight, 0)
    ).toBeCloseTo(1);
  });

  it("menolak bobot yang totalnya bukan 100%", () => {
    expect(() =>
      normalizeWeights([
        { kode: "C1", bobot: 30 },
        { kode: "C2", bobot: 25 },
        { kode: "C3", bobot: 25 },
        { kode: "C4", bobot: 10 }
      ])
    ).toThrow("Total bobot kriteria harus 100%");
  });
});

describe("Weighted Product calculation", () => {
  it("mengabaikan komoditas dengan total produksi 0", () => {
    const criteriaTable = buildCriteriaTable([
      {
        komoditasId: "apel",
        nama: "Apel",
        produksi: production([0, 0, 0, 0])
      },
      {
        komoditasId: "mangga",
        nama: "Mangga",
        produksi: production([10, 10, 10, 10])
      }
    ]);

    expect(criteriaTable).toHaveLength(1);
    expect(criteriaTable[0]?.nama).toBe("Mangga");
  });

  it("menghitung vektor S, vektor V, dan ranking", () => {
    const result = calculateWeightedProduct(
      [
        {
          komoditasId: "a",
          nama: "Komoditas A",
          produksi: production([10, 10, 10, 10])
        },
        {
          komoditasId: "b",
          nama: "Komoditas B",
          produksi: production([20, 20, 20, 20])
        }
      ],
      [
        { kode: "C1", bobot: 100 },
        { kode: "C2", bobot: 0 },
        { kode: "C3", bobot: 0 },
        { kode: "C4", bobot: 0 }
      ]
    );

    expect(result.vectorS).toEqual([
      { komoditasId: "a", nama: "Komoditas A", nilai_s: 40 },
      { komoditasId: "b", nama: "Komoditas B", nilai_s: 80 }
    ]);
    expect(result.vectorV[0]?.nilai_v).toBeCloseTo(1 / 3);
    expect(result.vectorV[1]?.nilai_v).toBeCloseTo(2 / 3);
    expect(result.rankings[0]?.komoditasId).toBe("b");
    expect(result.rankings[0]?.peringkat).toBe(1);
  });

  it("menjaga nilai WP tetap valid saat ada pertumbuhan atau konsistensi negatif", () => {
    const result = calculateWeightedProduct(
      [
        {
          komoditasId: "turun",
          nama: "Produksi Turun",
          produksi: production([100, 80, 60, 50])
        },
        {
          komoditasId: "melonjak",
          nama: "Produksi Melonjak",
          produksi: production([0, 0, 0, 20])
        }
      ],
      defaultWeights
    );

    expect(result.criteriaTable[0]?.kriteria.C2).toBeLessThan(0);
    expect(result.criteriaAdjustments.some((adjustment) => adjustment.offset > 0)).toBe(
      true
    );
    expect(result.rankings).toHaveLength(2);
    expect(result.rankings.every((row) => Number.isFinite(row.nilai_s))).toBe(true);
    expect(result.rankings.every((row) => Number.isFinite(row.nilai_v))).toBe(true);
  });

  it("memberi nilai V 1 jika hanya satu komoditas valid", () => {
    const result = calculateWeightedProduct(
      [
        {
          komoditasId: "apel",
          nama: "Apel",
          produksi: production([0, 0, 0, 0])
        },
        {
          komoditasId: "durian",
          nama: "Durian",
          produksi: production([50, 60, 70, 80])
        }
      ],
      defaultWeights
    );

    expect(result.rankings).toHaveLength(1);
    expect(result.rankings[0]?.komoditasId).toBe("durian");
    expect(result.rankings[0]?.nilai_v).toBe(1);
  });

  it("menolak perhitungan jika tidak ada komoditas valid", () => {
    expect(() =>
      calculateWeightedProduct(
        [
          {
            komoditasId: "apel",
            nama: "Apel",
            produksi: production([0, 0, 0, 0])
          }
        ],
        defaultWeights
      )
    ).toThrow("Tidak ada komoditas dengan produksi lebih dari 0");
  });
});
