import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { loadEnvConfig } from "@next/env";

import { parseExcelBuffer } from "@/lib/excel";
import { importProduksiRows } from "@/lib/supabase/import-produksi";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

loadEnvConfig(process.cwd());

const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const fileArg = args.find((arg) => !arg.startsWith("--"));
const filePath = resolve(fileArg ?? "Data_Tanaman_2021_2024.xlsx");

async function main() {
  const rows = parseExcelBuffer(readFileSync(filePath));

  if (isDryRun) {
    const totalProduksiRows = rows.length * 4;

    console.log(
      JSON.stringify(
        {
          mode: "dry-run",
          filePath,
          komoditas: rows.length,
          produksiRows: totalProduksiRows,
          sample: rows.slice(0, 3)
        },
        null,
        2
      )
    );
    return;
  }

  const supabase = createServiceRoleClient();
  const result = await importProduksiRows(supabase, rows);

  console.log(
    JSON.stringify(
      {
        mode: "import",
        filePath,
        ...result
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
