import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PageHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  icon: LucideIcon;
  actions?: ReactNode;
  meta?: ReactNode;
  tone?: "green" | "blue" | "amber";
};

const toneClasses = {
  green: "from-emerald-50 via-white to-white text-primary ring-primary/15",
  blue: "from-sky-50 via-white to-white text-sky-700 ring-sky-100",
  amber: "from-amber-50 via-white to-white text-amber-700 ring-amber-100"
};

export function PageHeading({
  actions,
  description,
  eyebrow,
  icon: Icon,
  meta,
  title,
  tone = "green"
}: PageHeadingProps) {
  return (
    <section
      className={cn(
        "mb-6 overflow-hidden rounded-lg border border-border/80 bg-gradient-to-br shadow-[0_18px_45px_rgba(15,23,42,0.06)]",
        toneClasses[tone]
      )}
    >
      <div className="flex flex-col gap-5 p-5 md:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-white/80 shadow-sm ring-1 ring-current/10">
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0">
            <Badge className="bg-white/80 text-current shadow-sm" variant="outline">
              {eyebrow}
            </Badge>
            <h1 className="mt-3 max-w-4xl text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                {description}
              </p>
            ) : null}
            {meta ? <div className="mt-4">{meta}</div> : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:justify-end">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
