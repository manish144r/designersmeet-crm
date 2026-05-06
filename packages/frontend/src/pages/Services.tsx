import { useQuery } from "@tanstack/react-query";
import { servicesApi } from "../api/resources.js";

export function Services() {
  const { data, isLoading } = useQuery({ queryKey: ["services"], queryFn: () => servicesApi.list() });
  const services = data ?? [];

  return (
    <div>
      <h1 className="text-lg font-semibold mb-4">Service Catalog ({services.length})</h1>
      {isLoading ? (
        <div className="text-textDim">Loading…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((s) => (
            <div key={s.service_id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-textc">{s.name}</h3>
                  <div className="text-xs text-gold">{s.category}</div>
                </div>
                <span className={`badge ${s.active ? "" : "opacity-50"}`}>
                  {s.active ? "active" : "inactive"}
                </span>
              </div>
              <p className="text-textDim text-xs mt-2">{s.description || "No description"}</p>
              <div className="mt-3 flex justify-between items-end">
                <span className="text-xs text-ice-dim">Base price</span>
                <span className="text-textc font-bold text-lg">${s.base_price.toLocaleString()}</span>
              </div>
              {s.shopify_product_ids.length > 0 && (
                <div className="text-xs text-textDim mt-2">
                  Shopify product IDs: {s.shopify_product_ids.join(", ")}
                </div>
              )}
            </div>
          ))}
          {services.length === 0 && (
            <div className="text-textDim col-span-full text-center py-6">
              No services yet — seed data missing or filtered out.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
