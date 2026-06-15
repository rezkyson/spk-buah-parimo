import { Database } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { CommodityDataClient } from "@/components/commodity-data-client";
import { PageHeading } from "@/components/page-heading";
import { StateMessage } from "@/components/state-message";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { getCommodityRows } from "@/lib/commodities";

export default async function DataKomoditasPage() {
  const user = await getCurrentUser();
  const isAdmin = isAdminUser(user);

  try {
    const rows = await getCommodityRows();

    return (
      <AppShell active="data">
        <PageHeader isAdmin={isAdmin} />
        <CommodityDataClient isAdmin={isAdmin} rows={rows} />
      </AppShell>
    );
  } catch (error) {
    return (
      <AppShell active="data">
        <PageHeader isAdmin={isAdmin} />
        <StateMessage
          description={
            error instanceof Error
              ? error.message
              : "Data komoditas belum bisa dimuat."
          }
          title="Gagal memuat data"
          type="error"
        />
      </AppShell>
    );
  }
}

function PageHeader({ isAdmin }: { isAdmin: boolean }) {
  return (
    <PageHeading
      description={
        isAdmin
          ? "Tambah, impor, cari, dan perbarui data produksi buah 2021-2024."
          : "Lihat data produksi buah 2021-2024."
      }
      eyebrow="Data Komoditas"
      icon={Database}
      title="Produksi buah 2021-2024"
    />
  );
}
