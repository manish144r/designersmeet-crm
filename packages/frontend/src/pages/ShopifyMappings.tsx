import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { freelancersApi, mappingsApi, servicesApi } from "../api/resources.js";

export function ShopifyMappings() {
  const qc = useQueryClient();
  const mappingsQ = useQuery({ queryKey: ["mappings"], queryFn: () => mappingsApi.list() });
  const servicesQ = useQuery({ queryKey: ["services"], queryFn: () => servicesApi.list() });
  const freelancersQ = useQuery({ queryKey: ["freelancers"], queryFn: () => freelancersApi.list() });

  const [draft, setDraft] = useState({
    shopify_product_id: "",
    shopify_product_title: "",
    service_id: "",
    auto_assign_enabled: false,
    default_freelancer_id: "",
  });

  const createM = useMutation({
    mutationFn: () =>
      mappingsApi.create({
        shopify_product_id: draft.shopify_product_id,
        shopify_product_title: draft.shopify_product_title,
        service_id: draft.service_id,
        auto_assign_enabled: draft.auto_assign_enabled,
        default_freelancer_id: draft.default_freelancer_id || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mappings"] });
      setDraft({
        shopify_product_id: "",
        shopify_product_title: "",
        service_id: "",
        auto_assign_enabled: false,
        default_freelancer_id: "",
      });
    },
  });

  const toggleAutoM = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      mappingsApi.update(id, { auto_assign_enabled: enabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mappings"] }),
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => mappingsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mappings"] }),
  });

  const services = servicesQ.data ?? [];
  const freelancers = freelancersQ.data ?? [];
  const mappings = mappingsQ.data ?? [];
  const serviceById = new Map(services.map((s) => [s.service_id, s]));
  const freelancerById = new Map(freelancers.map((f) => [f.freelancer_id, f]));

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-semibold">Shopify ↔ Service Mappings</h1>

      <div className="card">
        <h2 className="text-sm uppercase tracking-widest text-ice mb-3">Add mapping</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          <input
            placeholder="Shopify product ID"
            value={draft.shopify_product_id}
            onChange={(e) => setDraft((d) => ({ ...d, shopify_product_id: e.target.value }))}
          />
          <input
            placeholder="Product title"
            value={draft.shopify_product_title}
            onChange={(e) => setDraft((d) => ({ ...d, shopify_product_title: e.target.value }))}
          />
          <select
            value={draft.service_id}
            onChange={(e) => setDraft((d) => ({ ...d, service_id: e.target.value }))}
          >
            <option value="">Select service…</option>
            {services.map((s) => (
              <option key={s.service_id} value={s.service_id}>
                {s.name}
              </option>
            ))}
          </select>
          <select
            value={draft.default_freelancer_id}
            onChange={(e) => setDraft((d) => ({ ...d, default_freelancer_id: e.target.value }))}
          >
            <option value="">Default freelancer (optional)…</option>
            {freelancers.map((f) => (
              <option key={f.freelancer_id} value={f.freelancer_id}>
                {f.name}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-xs text-textDim">
            <input
              type="checkbox"
              checked={draft.auto_assign_enabled}
              onChange={(e) => setDraft((d) => ({ ...d, auto_assign_enabled: e.target.checked }))}
            />
            Auto-assign on Shopify webhook
          </label>
        </div>
        <button
          className="btn-primary mt-3"
          disabled={!draft.shopify_product_id || !draft.service_id || createM.isPending}
          onClick={() => createM.mutate()}
        >
          Add mapping
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-textDim text-xs uppercase">
            <tr>
              <th className="text-left py-2">Shopify product</th>
              <th className="text-left py-2">→ Service</th>
              <th className="text-left py-2">Default freelancer</th>
              <th className="text-left py-2">Auto-assign</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {mappings.map((m) => (
              <tr key={m.mapping_id} className="border-t border-borderc">
                <td className="py-2">
                  <div className="font-mono text-xs">{m.shopify_product_id}</div>
                  <div className="text-textDim text-xs">{m.shopify_product_title}</div>
                </td>
                <td className="py-2 text-gold">{serviceById.get(m.service_id)?.name ?? "—"}</td>
                <td className="py-2">
                  {m.default_freelancer_id ? freelancerById.get(m.default_freelancer_id)?.name ?? "—" : "—"}
                </td>
                <td className="py-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={m.auto_assign_enabled}
                      onChange={(e) => toggleAutoM.mutate({ id: m.mapping_id, enabled: e.target.checked })}
                    />
                  </label>
                </td>
                <td className="py-2 text-right">
                  <button className="btn-danger btn-sm" onClick={() => deleteM.mutate(m.mapping_id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {mappings.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-textDim">
                  No mappings yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
