import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FREELANCER_AVAILABILITY, SERVICE_CATEGORIES } from "@dm/shared";
import { freelancersApi } from "../api/resources.js";

export function Freelancers() {
  const [availability, setAvailability] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const { data, isLoading } = useQuery({
    queryKey: ["freelancers", availability, category],
    queryFn: () =>
      freelancersApi.list({
        availability_status: availability || undefined,
        category: category || undefined,
      }),
  });

  const rows = useMemo(() => data ?? [], [data]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Freelancers ({rows.length})</h1>
        <div className="flex gap-2">
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select value={availability} onChange={(e) => setAvailability(e.target.value)} aria-label="Filter by availability">
            <option value="">All availability</option>
            {FREELANCER_AVAILABILITY.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card overflow-x-auto">
        {isLoading ? (
          <div className="text-textDim">Loading…</div>
        ) : (
          <table className="w-full text-sm" aria-label="Freelancers list">
            <thead className="text-textDim text-xs uppercase">
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-left py-2">Country</th>
                <th className="text-right py-2">Rate</th>
                <th className="text-right py-2">Quality</th>
                <th className="text-right py-2">Orders</th>
                <th className="text-left py-2 pl-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={f.freelancer_id} className="border-t border-borderc">
                  <td className="py-2">
                    <div className="font-semibold">{f.name}</div>
                    <div className="text-textDim text-xs">{f.email}</div>
                  </td>
                  <td className="py-2">{f.country ?? "—"}</td>
                  <td className="py-2 text-right">
                    ${f.rate_min} – ${f.rate_max}
                  </td>
                  <td className="py-2 text-right">{f.quality_rating.toFixed(1)} ★</td>
                  <td className="py-2 text-right">{f.total_orders_completed}</td>
                  <td className="py-2 pl-4">
                    <span className="badge">{f.availability_status}</span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-textDim">
                    No freelancers match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
