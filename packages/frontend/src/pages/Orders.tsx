import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { OrderStatus } from "@dm/shared";
import { ordersApi, freelancersApi } from "../api/resources.js";
import { KanbanBoard } from "../components/KanbanBoard.js";

export function Orders() {
  const qc = useQueryClient();
  const ordersQ = useQuery({ queryKey: ["orders"], queryFn: () => ordersApi.list() });
  const freelancersQ = useQuery({ queryKey: ["freelancers"], queryFn: () => freelancersApi.list() });

  const moveMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: OrderStatus }) =>
      ordersApi.update(orderId, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["orders"] }),
  });

  return (
    <div role="main" aria-label="Orders management">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold">Orders</h1>
        <span className="text-textDim text-xs">Drag a card between columns to update status.</span>
      </div>
      {ordersQ.isLoading || freelancersQ.isLoading ? (
        <div className="text-textDim">Loading…</div>
      ) : (
        <KanbanBoard
          orders={ordersQ.data ?? []}
          freelancers={freelancersQ.data ?? []}
          onMove={(orderId, status) => moveMutation.mutate({ orderId, status })}
        />
      )}
    </div>
  );
}
