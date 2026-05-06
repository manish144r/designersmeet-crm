import { useQuery } from "@tanstack/react-query";
import { ordersApi, freelancersApi, queueApi } from "../api/resources.js";
import { MetricCard } from "../components/MetricCard.js";

export function Dashboard() {
  const ordersQ = useQuery({ queryKey: ["orders"], queryFn: () => ordersApi.list() });
  const freelancersQ = useQuery({ queryKey: ["freelancers"], queryFn: () => freelancersApi.list() });
  const queueStatsQ = useQuery({
    queryKey: ["queue", "stats"],
    queryFn: () => queueApi.stats(),
    refetchInterval: 5_000,
  });

  const orders = ordersQ.data ?? [];
  const freelancers = freelancersQ.data ?? [];
  const queueStats = queueStatsQ.data ?? [];

  const newOrders = orders.filter((o) => o.status === "new").length;
  const inProgress = orders.filter((o) => o.status === "in_progress" || o.status === "assigned").length;
  const completedToday = orders.filter(
    (o) => o.status === "delivered" || o.status === "completed",
  ).length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0);
  const totalQueueDepth = queueStats.reduce((s, q) => s + q.pending + q.processing, 0);
  const totalDlq = queueStats.reduce((s, q) => s + q.dlq, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard label="New Orders" value={newOrders} sub="awaiting assignment" />
        <MetricCard label="In Progress" value={inProgress} />
        <MetricCard label="Completed" value={completedToday} sub="all-time" />
        <MetricCard label="Freelancers" value={freelancers.length} sub="in DB" />
        <MetricCard label="Queue Depth" value={totalQueueDepth} sub={`${totalDlq} in DLQ`} />
        <MetricCard
          label="Pipeline Value"
          value={`$${totalRevenue.toLocaleString()}`}
          sub="total order value"
        />
      </div>

      <section className="card" aria-label="Recent orders">
        <h2 className="text-sm font-semibold text-ice uppercase tracking-widest mb-3">Recent Orders</h2>
        <table className="w-full text-sm" aria-label="Recent orders table">
          <thead className="text-textDim text-xs uppercase">
            <tr>
              <th className="text-left py-2">Customer</th>
              <th className="text-left py-2">Service</th>
              <th className="text-left py-2">Status</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 8).map((o) => (
              <tr key={o.order_id} className="border-t border-borderc">
                <td className="py-2">
                  <div>{o.customer_name}</div>
                  <div className="text-textDim text-xs">{o.customer_email}</div>
                </td>
                <td className="py-2 text-gold">{o.service_type}</td>
                <td className="py-2 capitalize">{o.status.replace("_", " ")}</td>
                <td className="py-2 text-right">
                  {o.currency} {Number(o.total_amount).toLocaleString()}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={4} className="py-6 text-center text-textDim">
                  No orders yet — drop a Shopify webhook on /webhooks/shopify/orders/create.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="card" aria-label="Queue health">
        <h2 className="text-sm font-semibold text-ice uppercase tracking-widest mb-3">Queue Health</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {queueStats.map((q) => (
            <div key={q.queue_name} className="bg-bg border border-borderc rounded-md p-3">
              <div className="text-xs text-gold font-semibold">{q.queue_name}</div>
              <div className="text-textDim text-xs mt-1">
                pending {q.pending} · processing {q.processing} · done {q.completed}
              </div>
              {(q.failed > 0 || q.dlq > 0) && (
                <div className="text-statusRed text-xs mt-1">
                  failed {q.failed} · dlq {q.dlq}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
