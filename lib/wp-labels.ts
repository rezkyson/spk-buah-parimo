import { criteriaCodes, type CriteriaCode } from "@/lib/wp";

export function getCriteriaLabel(kode: CriteriaCode) {
  const labels: Record<CriteriaCode, string> = {
    C1: "Produksi",
    C2: "Pertumbuhan",
    C3: "Rata-rata",
    C4: "Konsistensi"
  };

  return labels[kode];
}

export function getOrderedCriteriaCodes() {
  return [...criteriaCodes];
}
