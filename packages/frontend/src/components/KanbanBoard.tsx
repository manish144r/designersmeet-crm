// Drag-drop Kanban for orders. Uses @dnd-kit/core for accessible DnD.
// Drop targets correspond 1:1 with OrderStatus values.
import { DndContext, type DragEndEvent, useDraggable, useDroppable } from "@dnd-kit/core";
import type { Freelancer, Order, OrderStatus } from "@dm/shared";
import { ORDER_STATUSES } from "@dm/shared";

interface Props {
  orders: Order[];
  freelancers: Freelancer[];
  onMove: (orderId: string, newStatus: OrderStatus) => void;
}

const COLUMN_LABELS: Record<OrderStatus, string> = {
  new: "New",
  assigned: "Assigned",
  in_progress: "In Progress",
  review: "Review",
  revision: "Revision",
  completed: "Completed",
  delivered: "Delivered",
};

export function KanbanBoard({ orders, freelancers, onMove }: Props) {
  const handleDragEnd = (event: DragEndEvent) => {
    const orderId = event.active.id as string;
    const newStatus = event.over?.id as OrderStatus | undefined;
    if (newStatus && ORDER_STATUSES.includes(newStatus)) {
      onMove(orderId, newStatus);
    }
  };

  const freelancerById = new Map(freelancers.map((f) => [f.freelancer_id, f.name]));

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4">
        {ORDER_STATUSES.map((status) => {
          const columnOrders = orders.filter((o) => o.status === status);
          return (
            <KanbanColumn key={status} status={status} count={columnOrders.length}>
              {columnOrders.map((order) => (
                <OrderCard
                  key={order.order_id}
                  order={order}
                  freelancerName={
                    order.assigned_freelancer_id ? freelancerById.get(order.assigned_freelancer_id) ?? null : null
                  }
                />
              ))}
            </KanbanColumn>
          );
        })}
      </div>
    </DndContext>
  );
}

function KanbanColumn({
  status,
  count,
  children,
}: {
  status: OrderStatus;
  count: number;
  children: React.ReactNode;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      className={`min-w-[260px] max-w-[260px] bg-card border border-borderc rounded-lg flex flex-col ${
        isOver ? "ring-2 ring-gold/30" : ""
      }`}
    >
      <div className="p-3 border-b border-borderc flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ice">{COLUMN_LABELS[status]}</h3>
        <span className="badge">{count}</span>
      </div>
      <div className="p-2 flex-1 overflow-y-auto min-h-[120px]">{children}</div>
    </div>
  );
}

function OrderCard({ order, freelancerName }: { order: Order; freelancerName: string | null }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: order.order_id });
  const valueClass =
    order.total_amount >= 5000 ? "text-statusGreen" : order.total_amount >= 1000 ? "text-statusAmber" : "text-statusBlue";
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`bg-bg border border-borderc rounded-md p-2.5 mb-2 cursor-grab transition hover:border-ice-dim ${
        isDragging ? "opacity-50 rotate-1" : ""
      }`}
    >
      <div className="text-[13px] font-semibold text-textc">{order.customer_name}</div>
      <div className="text-[11px] text-ice-dim">{order.customer_email}</div>
      <div className="text-[11px] text-gold mt-1">{order.service_type}</div>
      <div className="flex justify-between items-center mt-1.5 text-[11px] text-textDim">
        <span>{freelancerName ?? "Unassigned"}</span>
        <span className={`${valueClass} font-bold`}>
          {order.currency} {order.total_amount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
