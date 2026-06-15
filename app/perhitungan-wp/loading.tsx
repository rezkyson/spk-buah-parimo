import { AppShell } from "@/components/app-shell";
import { StateMessage } from "@/components/state-message";

export default function PerhitunganWpLoading() {
  return (
    <AppShell active="calculation">
      <StateMessage
        description="Menghitung nilai kriteria, vektor S, dan vektor V."
        title="Memuat perhitungan WP"
        type="loading"
      />
    </AppShell>
  );
}
