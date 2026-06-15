import { AppShell } from "@/components/app-shell";
import { StateMessage } from "@/components/state-message";

export default function DataKomoditasLoading() {
  return (
    <AppShell active="data">
      <StateMessage
        description="Mengambil data produksi komoditas dari Supabase."
        title="Memuat data komoditas"
        type="loading"
      />
    </AppShell>
  );
}
