import { useEffect, useMemo, useRef, useState } from "react";

type NodeKind = "trigger" | "action" | "condition";

interface FlowNode {
  id: string;
  kind: NodeKind;
  label: string;
  config: Array<{ key: string; value: string }>;
}

const KIND_STYLE: Record<NodeKind, { ring: string; chip: string; label: string }> = {
  trigger:   { ring: "ring-emerald-300 border-emerald-300", chip: "bg-emerald-100 text-emerald-800", label: "Trigger"   },
  action:    { ring: "ring-blue-300 border-blue-300",       chip: "bg-blue-100 text-blue-800",       label: "Action"    },
  condition: { ring: "ring-amber-300 border-amber-300",     chip: "bg-amber-100 text-amber-800",     label: "Condition" },
};

const DEFAULT_LABEL: Record<NodeKind, string> = {
  trigger: "When new order is received",
  action: "Send freelancer assignment email",
  condition: "If budget > $500",
};

const DEFAULT_CONFIG: Record<NodeKind, Array<{ key: string; value: string }>> = {
  trigger: [{ key: "event", value: "order.created" }],
  action: [{ key: "channel", value: "email" }, { key: "template", value: "freelancer_assignment" }],
  condition: [{ key: "field", value: "total_amount" }, { key: "op", value: ">" }, { key: "value", value: "500" }],
};

const NODE_GAP = 28;
const NODE_HEIGHT_ESTIMATE = 140;

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

export function Workflows() {
  const [nodes, setNodes] = useState<FlowNode[]>([
    { id: uid(), kind: "trigger", label: DEFAULT_LABEL.trigger, config: [...DEFAULT_CONFIG.trigger] },
    { id: uid(), kind: "action",  label: DEFAULT_LABEL.action,  config: [...DEFAULT_CONFIG.action]  },
  ]);
  const [toast, setToast] = useState<string | null>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [lines, setLines] = useState<Array<{ x1: number; y1: number; x2: number; y2: number }>>([]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Recompute connector lines after layout changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setLines([]);
      return;
    }
    const canvasBox = canvas.getBoundingClientRect();
    const next: Array<{ x1: number; y1: number; x2: number; y2: number }> = [];
    for (let i = 0; i < nodes.length - 1; i++) {
      const a = nodeRefs.current[nodes[i].id];
      const b = nodeRefs.current[nodes[i + 1].id];
      if (!a || !b) continue;
      const ab = a.getBoundingClientRect();
      const bb = b.getBoundingClientRect();
      next.push({
        x1: ab.left - canvasBox.left + ab.width / 2,
        y1: ab.bottom - canvasBox.top,
        x2: bb.left - canvasBox.left + bb.width / 2,
        y2: bb.top - canvasBox.top,
      });
    }
    setLines(next);
  }, [nodes]);

  const addNode = (kind: NodeKind) => {
    setNodes(prev => [...prev, { id: uid(), kind, label: DEFAULT_LABEL[kind], config: [...DEFAULT_CONFIG[kind]] }]);
  };

  const removeNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
  };

  const updateLabel = (id: string, label: string) => {
    setNodes(prev => prev.map(n => (n.id === id ? { ...n, label } : n)));
  };

  const updateConfig = (id: string, idx: number, field: "key" | "value", val: string) => {
    setNodes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const cfg = n.config.map((c, i) => (i === idx ? { ...c, [field]: val } : c));
      return { ...n, config: cfg };
    }));
  };

  const addConfigRow = (id: string) => {
    setNodes(prev => prev.map(n => (n.id === id ? { ...n, config: [...n.config, { key: "", value: "" }] } : n)));
  };

  const removeConfigRow = (id: string, idx: number) => {
    setNodes(prev => prev.map(n => (n.id === id ? { ...n, config: n.config.filter((_, i) => i !== idx) } : n)));
  };

  const canvasHeight = useMemo(
    () => Math.max(420, nodes.length * (NODE_HEIGHT_ESTIMATE + NODE_GAP) + 80),
    [nodes.length],
  );

  const handleSave = () => {
    setToast(`Flow saved · ${nodes.length} node${nodes.length === 1 ? "" : "s"}`);
  };

  const handleRun = () => {
    if (nodes.length === 0) {
      setToast("Add nodes before running");
      return;
    }
    if (nodes[0].kind !== "trigger") {
      setToast("Flow must start with a trigger");
      return;
    }
    setToast(`Flow executed · ${nodes.length} step${nodes.length === 1 ? "" : "s"} completed`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Workflows</h1>
          <p className="text-sm text-textDim mt-0.5">Build trigger → action automations. {nodes.length} node{nodes.length === 1 ? "" : "s"} in flow.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-secondary btn-sm" onClick={() => addNode("trigger")}>+ Trigger</button>
          <button className="btn-secondary btn-sm" onClick={() => addNode("action")}>+ Action</button>
          <button className="btn-secondary btn-sm" onClick={() => addNode("condition")}>+ Condition</button>
          <button className="btn-primary btn-sm" onClick={handleSave}>Save Flow</button>
          <button className="btn-primary btn-sm" onClick={handleRun}>Run</button>
        </div>
      </div>

      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-navy text-white text-sm px-4 py-2 rounded-md shadow-lg">
          {toast}
        </div>
      )}

      <div
        ref={canvasRef}
        className="card relative bg-bg overflow-hidden"
        style={{ minHeight: canvasHeight }}
      >
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ height: canvasHeight }}>
          {lines.map((l, i) => (
            <g key={i}>
              <line x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="#94a3b8" strokeWidth={2} strokeDasharray="4 3" />
              <polygon
                points={`${l.x2 - 5},${l.y2 - 6} ${l.x2 + 5},${l.y2 - 6} ${l.x2},${l.y2}`}
                fill="#64748b"
              />
            </g>
          ))}
        </svg>

        <div className="relative flex flex-col items-center gap-7 py-4">
          {nodes.length === 0 ? (
            <div className="text-textDim text-sm py-12">Empty flow. Start by adding a trigger.</div>
          ) : (
            nodes.map(node => {
              const s = KIND_STYLE[node.kind];
              return (
                <div
                  key={node.id}
                  ref={el => { nodeRefs.current[node.id] = el; }}
                  className={`bg-card border ${s.ring} rounded-lg shadow-sm p-3 w-[420px] max-w-full`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${s.chip}`}>
                      {s.label}
                    </span>
                    <button
                      className="text-textDim text-xs hover:text-statusRed"
                      onClick={() => removeNode(node.id)}
                      aria-label="Remove node"
                    >
                      Remove
                    </button>
                  </div>
                  <input
                    value={node.label}
                    onChange={e => updateLabel(node.id, e.target.value)}
                    className="w-full font-medium text-sm mb-2"
                    placeholder="Node label"
                  />
                  <div className="space-y-1.5">
                    {node.config.map((c, idx) => (
                      <div key={idx} className="flex gap-1.5">
                        <input
                          value={c.key}
                          onChange={e => updateConfig(node.id, idx, "key", e.target.value)}
                          placeholder="key"
                          className="flex-1 text-xs"
                        />
                        <input
                          value={c.value}
                          onChange={e => updateConfig(node.id, idx, "value", e.target.value)}
                          placeholder="value"
                          className="flex-[2] text-xs"
                        />
                        <button
                          className="text-textDim text-xs px-2 hover:text-statusRed"
                          onClick={() => removeConfigRow(node.id, idx)}
                          aria-label="Remove config row"
                        >×</button>
                      </div>
                    ))}
                    <button
                      className="text-navy text-xs font-medium hover:underline"
                      onClick={() => addConfigRow(node.id)}
                    >
                      + Add config row
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
