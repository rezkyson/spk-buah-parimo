import { AlertCircle, Database, Loader2 } from "lucide-react";

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
    <div className="rounded-lg border border-dashed bg-background p-8 text-center">
      <Icon className="mx-auto h-8 w-8 text-muted-foreground" />
      <h2 className="mt-4 text-base font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
