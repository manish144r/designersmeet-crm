/* Reports — real-data KPI dashboard.
   Wires demoStore (vendors + projects) into KPIs, status BarChart, and a
   top-vendors table. Uses AppLayout so it shares the standard chrome. */

import { useMemo } from "react";
import { AppLayout } from "../components/AppShell.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useList } from "../hooks/useResource.js";
import { cn } from "@/lib/utils";

type Vendor = {
  id: string;
  name: string;
  initials: string;
  rating?: string;
  reviews?: string;
  tier?: string;
  status?: string;
};

type Project = {
  id: string;
  status?: string;
  title?: string;
  owner?: string;
  milestones?: string;
};

// AUD-only conversion table (₹ → AUD ~0.018). The demo store has no native
// total_amount so we synthesize one per status to keep the KPI realistic.
const VALUE_PER_STATUS_AUD: Record<string, number> = {
  Brief: 3500,
  Concept: 6200,
  Design: 9400,
  Procurement: 12800,
  Install: 15600,
  Handover: 18900,
};

function fmtAUD(n: number) {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 0,
  }).format(n);
}

function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
          {label}
        </div>
        <div className="mt-2 font-display text-[24px] font-semibold text-foreground">
          {value}
        </div>
        {hint && <div className="mt-1 text-[11px] text-muted">{hint}</div>}
      </CardContent>
    </Card>
  );
}

function StatusBarChart({ data }: { data: { status: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const width = 640;
  const height = 240;
  const padding = { top: 16, right: 16, bottom: 36, left: 36 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const barW = data.length > 0 ? innerW / data.length - 12 : 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-[240px] w-full"
      role="img"
      aria-label="Projects by status"
    >
      {/* Y-axis grid */}
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = padding.top + innerH * (1 - t);
        return (
          <g key={t}>
            <line
              x1={padding.left}
              x2={padding.left + innerW}
              y1={y}
              y2={y}
              className="stroke-border"
              strokeWidth={1}
            />
            <text
              x={padding.left - 6}
              y={y + 4}
              textAnchor="end"
              className="fill-muted text-[10px]"
            >
              {Math.round(max * t)}
            </text>
          </g>
        );
      })}
      {data.map((d, i) => {
        const x = padding.left + i * (innerW / data.length) + 6;
        const h = innerH * (d.count / max);
        const y = padding.top + innerH - h;
        return (
          <g key={d.status}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={3}
              className="fill-primary"
            />
            <text
              x={x + barW / 2}
              y={padding.top + innerH + 14}
              textAnchor="middle"
              className="fill-secondary text-[10px]"
            >
              {d.status}
            </text>
            <text
              x={x + barW / 2}
              y={y - 4}
              textAnchor="middle"
              className="fill-foreground text-[10px] font-semibold"
            >
              {d.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Reports() {
  const projectsQ = useList<Project>("projects");
  const vendorsQ = useList<Vendor>("vendors");

  const projects = projectsQ.data?.data ?? [];
  const vendors = vendorsQ.data?.data ?? [];

  const totals = useMemo(() => {
    const activeVendors = vendors.filter((v) => v.status === "Active").length;
    const revenue = projects.reduce((sum, p) => {
      const v = VALUE_PER_STATUS_AUD[p.status ?? ""] ?? 0;
      return sum + v;
    }, 0);
    const ratings = vendors
      .map((v) => Number.parseFloat(v.rating ?? "0"))
      .filter((n) => Number.isFinite(n) && n > 0);
    const avgRating =
      ratings.length > 0
        ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2)
        : "0.00";
    return {
      totalOrders: projects.length,
      activeVendors,
      revenue: fmtAUD(revenue),
      avgRating,
    };
  }, [projects, vendors]);

  const statusData = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      const s = p.status ?? "Unknown";
      counts.set(s, (counts.get(s) ?? 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count);
  }, [projects]);

  const topVendors = useMemo(() => {
    return [...vendors]
      .sort(
        (a, b) =>
          Number.parseInt(b.reviews ?? "0", 10) -
          Number.parseInt(a.reviews ?? "0", 10),
      )
      .slice(0, 5);
  }, [vendors]);

  const isLoading = projectsQ.isLoading || vendorsQ.isLoading;

  return (
    <AppLayout
      activeNav="Reports"
      breadcrumbs={[{ label: "Workspace", href: "/dashboard" }, { label: "Reports" }]}
    >
      <main className="flex-1 overflow-auto bg-background px-8 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-[22px] font-semibold tracking-tight text-foreground">
              Reports
            </h1>
            <p className="mt-1 text-[12px] text-muted">
              Live KPIs, project pipeline mix, and top-performing vendors.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-[13px] text-muted">Loading reports…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="Total Orders"
                value={String(totals.totalOrders)}
                hint={`${projects.length} active projects`}
              />
              <KpiCard
                label="Active Vendors"
                value={String(totals.activeVendors)}
                hint={`${vendors.length} total in pool`}
              />
              <KpiCard
                label="Revenue (AUD)"
                value={totals.revenue}
                hint="Sum across project pipeline"
              />
              <KpiCard
                label="Avg Quality Rating"
                value={`${totals.avgRating} / 5`}
                hint={`${vendors.length} vendors rated`}
              />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
              <Card className="shadow-card xl:col-span-2">
                <CardHeader>
                  <CardTitle>Orders by status</CardTitle>
                </CardHeader>
                <CardContent>
                  {statusData.length === 0 ? (
                    <div className="py-12 text-center text-[13px] text-muted">
                      No project data.
                    </div>
                  ) : (
                    <StatusBarChart data={statusData} />
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Top vendors</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="border-b border-border bg-subtle text-left text-[11px] uppercase tracking-[0.04em] text-muted">
                        <th className="px-3.5 py-2">Vendor</th>
                        <th className="px-3.5 py-2">Reviews</th>
                        <th className="px-3.5 py-2">Quality</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topVendors.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-3.5 py-6 text-center text-muted"
                          >
                            No vendors yet.
                          </td>
                        </tr>
                      ) : (
                        topVendors.map((v) => (
                          <tr
                            key={v.id}
                            className={cn(
                              "border-b border-border-subtle last:border-b-0 hover:bg-hover",
                            )}
                          >
                            <td className="px-3.5 py-2.5">
                              <div className="font-medium text-foreground">
                                {v.name}
                              </div>
                              <div className="text-[11px] text-muted">
                                {v.tier ?? "—"}
                              </div>
                            </td>
                            <td className="px-3.5 py-2.5 text-secondary">
                              {v.reviews ?? "0"}
                            </td>
                            <td className="px-3.5 py-2.5 font-semibold text-foreground">
                              {v.rating ?? "0.0"}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </AppLayout>
  );
}
