export function formatNumber(value: number, maximumFractionDigits = 2) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits
  }).format(value);
}

export function formatDecimal(value: number, maximumFractionDigits = 6) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits,
    minimumFractionDigits: 0
  }).format(value);
}

export function formatPercent(value: number) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
    style: "percent"
  }).format(value / 100);
}
