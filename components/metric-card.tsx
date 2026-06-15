import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  tone?: "primary" | "emerald" | "sky" | "amber" | "slate";
};

const toneClasses = {
  primary: "bg-primary/10 text-primary ring-primary/15",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  sky: "bg-sky-50 text-sky-700 ring-sky-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200"
};

export function MetricCard({
  hint,
  icon: Icon,
  label,
  tone = "primary",
  value
}: MetricCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="mt-2 truncate text-2xl font-semibold tracking-tight">
              {value}
            </p>
            {hint ? (
              <p className="mt-2 text-xs leading-5 text-muted-foreground">{hint}</p>
            ) : null}
          </div>
          <span
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1",
              toneClasses[tone]
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
