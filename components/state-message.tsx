import { AlertCircle, Database, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type StateMessageProps = {
  title: string;
  description: string;
  type?: "empty" | "error" | "loading";
};

const iconMap = {
  empty: Database,
  error: AlertCircle,
  loading: Loader2
};

export function StateMessage({
  title,
  description,
  type = "empty"
}: StateMessageProps) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-lg border border-dashed border-border/80 bg-white/80 p-8 text-center shadow-sm">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className={cn("h-6 w-6", type === "loading" && "animate-spin")} />
      </span>
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
