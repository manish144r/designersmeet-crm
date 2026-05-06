import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QUEUE_NAMES } from "@dm/shared";
import { queueApi } from "../api/resources.js";

export function Queue() {
  const qc = useQueryClient();
  const statsQ = useQuery({
    queryKey: ["queue", "stats"],
    queryFn: () => queueApi.stats(),
    refetchInterval: 3_000,
  });
  const itemsQ = useQuery({
    queryKey: ["queue", "items"],
    queryFn: () => queueApi.items(),
    refetchInterval: 5_000,
  });

  const sendTest = useMutation({
    mutationFn: (queueName: string) => queueApi.testMessage(queueName, { kind: "manual_test", at: new Date().toISOString() }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["queue"] }),
  });

  const stats = statsQ.data ?? [];
  const items = itemsQ.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Microsoft Queue Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {QUEUE_NAMES.map((name) => {
          const s = stats.find((x) => x.queue_name === name);
          return (
            <div key={name} className="card">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gold">{name}</span>
                <button className="btn-secondary btn-sm" onClick={() => sendTest.mutate(name)} aria-label={`Send test message to ${name} queue`}>
                  Test
                </button>
              </div>
              <div className="grid grid-cols-5 gap-1 mt-3 text-center text-[11px]">
                <Stat label="pending" value={s?.pending ?? 0} cls="text-statusBlue" />
                <Stat label="processing" value={s?.processing ?? 0} cls="text-statusAmber" />
                <Stat label="done" value={s?.completed ?? 0} cls="text-statusGreen" />
                <Stat label="failed" value={s?.failed ?? 0} cls="text-statusAmber" />
                <Stat label="dlq" value={s?.dlq ?? 0} cls="text-statusRed" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="card overflow-x-auto">
        <h2 className="text-sm uppercase tracking-widest text-ice mb-3">Recent messages</h2>
        <table className="w-full text-xs" aria-label="Recent queue messages">
          <thead className="text-textDim uppercase">
            <tr>
              <th className="text-left py-2">Queue</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Order</th>
              <th className="text-left py-2">Retries</th>
              <th className="text-left py-2">Updated</th>
              <th className="text-left py-2">Last error</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, 30).map((m) => (
              <tr key={m.queue_id} className="border-t border-borderc">
                <td className="py-2 text-gold">{m.queue_type}</td>
                <td className="py-2 capitalize">{m.status}</td>
                <td className="py-2 font-mono text-[10px] text-textDim">{m.order_id ?? "—"}</td>
                <td className="py-2">{m.retry_count}</td>
                <td className="py-2 text-textDim">{m.updated_at}</td>
                <td className="py-2 text-statusRed">{m.last_error ?? ""}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-textDim">
                  No queue messages yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls: string }) {
  return (
    <div>
      <div className={`text-base font-bold ${cls}`}>{value}</div>
      <div className="text-textDim uppercase tracking-wider">{label}</div>
    </div>
  );
}
