import { AppShell } from "@/components/app-shell";
import { StateMessage } from "@/components/state-message";

export default function HasilRankingLoading() {
  return (
    <AppShell active="results">
      <StateMessage
        description="Mohon tunggu sebentar."
        title="Memuat hasil ranking"
        type="loading"
      />
    </AppShell>
  );
}
