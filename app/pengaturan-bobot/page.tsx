import { AppShell } from "@/components/app-shell";
import { StateMessage } from "@/components/state-message";
import { WeightSettingsClient } from "@/components/weight-settings-client";
import { getCurrentUser, isAdminUser } from "@/lib/auth";
import { getCriteriaRows } from "@/lib/criteria";

export default async function PengaturanBobotPage() {
  const user = await getCurrentUser();
  const isAdmin = isAdminUser(user);

  try {
    const rows = await getCriteriaRows();

    return (
      <AppShell active="weights">
        <PageHeader isAdmin={isAdmin} />
        <WeightSettingsClient isAdmin={isAdmin} rows={rows} />
      </AppShell>
    );
  } catch (error) {
    return (
      <AppShell active="weights">
        <PageHeader isAdmin={isAdmin} />
        <StateMessage
          description={
            error instanceof Error
              ? error.message
              : "Bobot kriteria belum bisa dimuat."
          }
          title="Gagal memuat bobot"
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
        Pengaturan Bobot
      </p>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold">
          Bobot kriteria Weighted Product
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Atur prioritas Produksi, Pertumbuhan, Rata-rata, dan Konsistensi
          sebelum perhitungan ranking dijalankan.
        </p>
        {!isAdmin ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Login sebagai admin untuk mengubah bobot.
          </p>
        ) : null}
      </div>
    </div>
  );
}
