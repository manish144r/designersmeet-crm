// Lightweight subscription hook to the demoStore.
// Lets non-react-query consumers (header dropdowns, audit-log live feed,
// vendor portal) re-render on any demoStore mutation without forcing every
// resource query to invalidate. The store is single-process so a 0-arg
// re-render is enough — callers read the live value directly inside the
// component body.
import { useEffect, useState } from "react";
import { demoStore, type DemoView } from "../lib/demoStore.js";

export function useDemoStore(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => demoStore.subscribe(() => setTick((n) => n + 1)), []);
  return tick;
}

export function useCurrentWorkspace() {
  useDemoStore();
  return demoStore.getCurrentWorkspace();
}

export function useCurrentView(): DemoView {
  useDemoStore();
  return demoStore.getView();
}

export function useAuditTail(limit = 100) {
  useDemoStore();
  return demoStore.auditTail(limit);
}
