import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardHeader } from "../../../components/ui";

export default function HomeQuickLinks({ links }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader title="快速前往" description="用最短路徑進入今天需要的工作視圖。" />
      <nav aria-label="Home 快速前往" className="divide-y divide-line-soft">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="group flex min-h-16 items-center gap-4 px-5 py-3 transition-colors hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:px-6"
            >
              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-strong text-ink">
                <Icon size={18} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-ink">{item.title}</span>
                <span className="mt-0.5 block text-xs text-muted">{item.description}</span>
              </span>
              <ArrowRight size={17} className="shrink-0 text-muted transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
    </Card>
  );
}
