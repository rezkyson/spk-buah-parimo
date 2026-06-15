import { AppShell } from "@/components/app-shell";
import { CommodityDataClient } from "@/components/commodity-data-client";
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
    <div className="mb-6 flex flex-col gap-2">
      <p className="text-sm font-medium uppercase text-primary">
        Data Komoditas
      </p>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold">
          Produksi buah 2021-2024
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Lihat, export, dan kelola data produksi yang menjadi dasar perhitungan
          Weighted Product.
        </p>
        {!isAdmin ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Login sebagai admin untuk import, tambah, edit, atau hapus data.
          </p>
        ) : null}
      </div>
    </div>
  );
}
