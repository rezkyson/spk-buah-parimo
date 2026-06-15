const baseUrl = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3000";

type SmokeCase = {
  path: string;
  includes: string[];
  name: string;
};

const pageCases: SmokeCase[] = [
  {
    name: "Dashboard",
    path: "/",
    includes: [
      "Ringkasan komoditas buah Parigi Moutong",
      "Top 3 Komoditas",
      "Total Produksi Komoditas",
      "Tren Produksi Tahunan"
    ]
  },
  {
    name: "Data Komoditas",
    path: "/data-komoditas",
    includes: ["Produksi buah 2021-2024", "Cari komoditas", "Export Excel"]
  },
  {
    name: "Pengaturan Bobot",
    path: "/pengaturan-bobot",
    includes: ["Bobot kriteria Weighted Product", "Total bobot", "C1"]
  },
  {
    name: "Perhitungan WP",
    path: "/perhitungan-wp",
    includes: [
      "Tahapan perhitungan Weighted Product",
      "Nilai asli setiap kriteria",
      "Vektor S",
      "Vektor V"
    ]
  },
  {
    name: "Hasil Ranking",
    path: "/hasil-ranking",
    includes: [
      "Peringkat komoditas buah terbaik",
      "Peringkat Komoditas",
      "Grafik Nilai V",
      "Radar Top 5"
    ]
  },
  {
    name: "Login Admin",
    path: "/login",
    includes: ["Login Admin", "Buat Akun"]
  }
];

async function main() {
  const results: Array<{ name: string; ok: boolean; detail: string }> = [];

  for (const smokeCase of pageCases) {
    const url = new URL(smokeCase.path, baseUrl);
    const response = await fetch(url);
    const html = await response.text();
    const missing = smokeCase.includes.filter((text) => !html.includes(text));

    results.push({
      name: smokeCase.name,
      ok: response.ok && missing.length === 0,
      detail:
        missing.length === 0
          ? `${response.status} ${url.pathname}`
          : `Missing: ${missing.join(", ")}`
    });
  }

  const protectedEndpoints = [
    { name: "Proteksi API Hitung Ulang", path: "/api/wp/calculate" },
    { name: "Proteksi API Import", path: "/api/import" },
    { name: "Proteksi API Komoditas", path: "/api/komoditas" },
    { name: "Proteksi API Kriteria", path: "/api/kriteria" }
  ];

  for (const endpoint of protectedEndpoints) {
    const response = await fetch(new URL(endpoint.path, baseUrl), {
      method: "POST"
    });

    results.push({
      name: endpoint.name,
      ok: response.status === 401,
      detail: `Expected 401, got ${response.status}`
    });
  }

  const failed = results.filter((result) => !result.ok);

  console.table(results);

  if (failed.length > 0) {
    throw new Error(`Smoke test gagal: ${failed.map((item) => item.name).join(", ")}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
