import { SlidersHorizontal } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { PageHeading } from "@/components/page-heading";
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
    <PageHeading
      description={
        isAdmin
          ? "Sesuaikan bobot penilaian sampai totalnya tepat 100%."
          : "Lihat bobot penilaian yang digunakan saat ini."
      }
      eyebrow="Pengaturan Bobot"
      icon={SlidersHorizontal}
      title="Bobot kriteria"
      tone="blue"
    />
  );
}
