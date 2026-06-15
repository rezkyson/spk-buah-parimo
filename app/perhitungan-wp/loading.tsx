import { AppShell } from "@/components/app-shell";
import { StateMessage } from "@/components/state-message";

export default function PerhitunganWpLoading() {
  return (
    <AppShell active="calculation">
      <StateMessage
        description="Mohon tunggu sebentar."
        title="Memuat perhitungan"
        type="loading"
      />
    </AppShell>
  );
}
