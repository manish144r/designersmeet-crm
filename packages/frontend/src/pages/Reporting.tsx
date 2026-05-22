import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Order, Freelancer } from "@dm/shared";
import { ordersApi, freelancersApi } from "../api/resources.js";

const STATUS_GROUPS = [
  { key: "new", label: "New", match: (o: Order) => o.status === "new" },
  { key: "in_progress", label: "In Progress", match: (o: Order) => o.status === "in_progress" || o.status === "assigned" },
  { key: "review", label: "Review", match: (o: Order) => o.status === "review" || o.status === "revision" },
  { key: "delivered", label: "Delivered", match: (o: Order) => o.status === "delivered" || o.status === "completed" },
] as const;

const BAR_COLOR: Record<string, string> = {
  new: "bg-blue-500",
  in_progress: "bg-amber-500",
  review: "bg-purple-500",
  delivered: "bg-emerald-500",
};

interface KpiProps {
  label: string;
  value: string;
  sub?: string;
}

function Kpi({ label, value, sub }: KpiProps) {
  return (
    <div className="card">
      <div className="text-[11px] uppercase tracking-widest text-textDim font-semibold">{label}</div>
      <div className="text-2xl font-bold text-navy mt-1">{value}</div>
      {sub && <div className="text-xs text-textDim mt-0.5">{sub}</div>}
    </div>
  );
}

export function Reporting() {
  const ordersQ = useQuery({ queryKey: ["orders"], queryFn: () => ordersApi.list() });
  const freelancersQ = useQuery({ queryKey: ["freelancers"], queryFn: () => freelancersApi.list() });

  const orders: Order[] = ordersQ.data ?? [];
  const freelancers: Freelancer[] = freelancersQ.data ?? [];

  const totals = useMemo(() => {
    const totalOrders = orders.length;
    const activeVendors = freelancers.filter(f => f.availability_status !== "inactive").length;
    const revenue = orders.reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
    const ratings = freelancers.map(f => f.quality_rating ?? 0).filter(r => r > 0);
    const avgRating = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    return { totalOrders, activeVendors, revenue, avgRating };
  }, [orders, freelancers]);

  const statusCounts = useMemo(
    () =>
      STATUS_GROUPS.map(g => ({
        key: g.key,
        label: g.label,
        count: orders.filter(g.match).length,
      })),
    [orders],
  );
  const maxCount = Math.max(1, ...statusCounts.map(s => s.count));

  const topVendors = useMemo(
    () =>
      [...freelancers]
        .sort((a, b) => (b.total_orders_completed ?? 0) - (a.total_orders_completed ?? 0))
        .slice(0, 5),
    [freelancers],
  );

  const isLoading = ordersQ.isLoading || freelancersQ.isLoading;
  const isError = ordersQ.isError || freelancersQ.isError;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy">Reporting</h1>
        <p className="text-sm text-textDim mt-0.5">Operational KPIs pulled live from the orders &amp; freelancers store.</p>
      </div>

      {isLoading && <div className="text-textDim text-sm">Loading reports…</div>}
      {isError && <div className="text-statusRed text-sm">Failed to load reporting data.</div>}

      {!isLoading && !isError && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Kpi label="Total Orders" value={totals.totalOrders.toLocaleString()} />
            <Kpi label="Active Vendors" value={totals.activeVendors.toLocaleString()} sub={`of ${freelancers.length} total`} />
            <Kpi label="Revenue" value={`$${totals.revenue.toLocaleString()}`} sub="sum of order totals" />
            <Kpi label="Avg Quality" value={totals.avgRating.toFixed(2)} sub="freelancer rating /5" />
          </div>

          <section className="card">
            <h2 className="text-sm font-semibold text-navy uppercase tracking-widest mb-3">Orders by status</h2>
            {orders.length === 0 ? (
              <div className="text-textDim text-sm py-6">No orders to report on yet.</div>
            ) : (
              <div className="flex items-end gap-4 h-48">
                {statusCounts.map(s => {
                  const pct = (s.count / maxCount) * 100;
                  return (
                    <div key={s.key} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs text-textDim font-medium">{s.count}</div>
                      <div className="w-full bg-gray-100 rounded-md flex items-end" style={{ height: 140 }}>
                        <div
                          className={`w-full rounded-md ${BAR_COLOR[s.key] ?? "bg-navy"} transition-all`}
                          style={{ height: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                      <div className="text-xs font-medium text-textc text-center">{s.label}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="card">
            <h2 className="text-sm font-semibold text-navy uppercase tracking-widest mb-3">Top 5 vendors by orders completed</h2>
            {topVendors.length === 0 ? (
              <div className="text-textDim text-sm py-6">No vendors found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-textDim text-xs uppercase">
                  <tr>
                    <th className="text-left py-2">Vendor</th>
                    <th className="text-left py-2">Availability</th>
                    <th className="text-right py-2">Orders done</th>
                    <th className="text-right py-2">Quality</th>
                    <th className="text-right py-2">Avg delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {topVendors.map(f => (
                    <tr key={f.freelancer_id} className="border-t border-borderc">
                      <td className="py-2">
                        <div className="font-medium">{f.name}</div>
                        <div className="text-textDim text-xs">{f.email}</div>
                      </td>
                      <td className="py-2 capitalize text-textDim">{f.availability_status}</td>
                      <td className="py-2 text-right font-medium">{f.total_orders_completed.toLocaleString()}</td>
                      <td className="py-2 text-right">{(f.quality_rating ?? 0).toFixed(2)} ★</td>
                      <td className="py-2 text-right text-textDim">{f.avg_delivery_time_hours}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
