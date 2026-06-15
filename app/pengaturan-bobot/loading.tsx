import { AppShell } from "@/components/app-shell";
import { StateMessage } from "@/components/state-message";

export default function PengaturanBobotLoading() {
  return (
    <AppShell active="weights">
      <StateMessage
        description="Mohon tunggu sebentar."
        title="Memuat pengaturan bobot"
        type="loading"
      />
    </AppShell>
  );
}
