import { AppShell } from "@/components/app-shell";
import { StateMessage } from "@/components/state-message";

export default function HomeLoading() {
  return (
    <AppShell active="home">
      <StateMessage
        description="Mengambil ringkasan komoditas, ranking, dan grafik produksi."
        title="Memuat dashboard"
        type="loading"
      />
    </AppShell>
  );
}
