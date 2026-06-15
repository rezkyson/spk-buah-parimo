import { AppShell } from "@/components/app-shell";
import { StateMessage } from "@/components/state-message";

export default function PengaturanBobotLoading() {
  return (
    <AppShell active="weights">
      <StateMessage
        description="Mengambil bobot kriteria dari Supabase."
        title="Memuat pengaturan bobot"
        type="loading"
      />
    </AppShell>
  );
}
