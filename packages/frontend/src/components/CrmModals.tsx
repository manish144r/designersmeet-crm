// App-root modal host. Mounted ONCE (main.tsx). Renders nothing until a
// locked page calls useUIStore().openCreate/openEdit/openConfirmDelete, so it
// adds zero pixels to any page's default render (visual-regression safe).
// Locked pages only need an onClick handler — never modal JSX in their body.
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog.js";
import { Input } from "./ui/input.js";
import { Button } from "./ui/button.js";
import { useUIStore } from "../stores/uiStore.js";
import { useCreate, useItem, useUpdate, useRemove } from "../hooks/useResource.js";

interface Field {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date";
}

// User-editable fields per resource (mirrors the backend Zod schemas; only the
// fields a create/edit form needs — opaque *_json fields are omitted).
const REGISTRY: Record<string, { title: string; fields: Field[] }> = {
  contacts: {
    title: "Contact",
    fields: [
      { name: "name", label: "Name" },
      { name: "email", label: "Email", type: "email" },
      { name: "type", label: "Type" },
      { name: "owner", label: "Owner" },
    ],
  },
  vendors: {
    title: "Vendor",
    fields: [
      { name: "name", label: "Name" },
      { name: "email", label: "Email", type: "email" },
      { name: "tier", label: "Tier" },
      { name: "regions", label: "Regions" },
    ],
  },
  clients: {
    title: "Client",
    fields: [
      { name: "name", label: "Name" },
      { name: "email", label: "Email", type: "email" },
      { name: "company", label: "Company" },
    ],
  },
  projects: {
    title: "Project",
    fields: [
      { name: "name", label: "Project name" },
      { name: "status", label: "Status" },
      { name: "manager_user_id", label: "Manager" },
      { name: "target_end_date", label: "Target end", type: "date" },
    ],
  },
  conversations: {
    title: "Conversation",
    fields: [
      { name: "subject", label: "Subject" },
      { name: "contact_id", label: "Contact" },
      { name: "channel", label: "Channel" },
    ],
  },
  "calendar-events": {
    title: "Event",
    fields: [
      { name: "title", label: "Title" },
      { name: "start_at", label: "Start", type: "date" },
      { name: "end_at", label: "End", type: "date" },
    ],
  },
  workflows: {
    title: "Workflow",
    fields: [
      { name: "name", label: "Name" },
      { name: "trigger_type", label: "Trigger" },
      { name: "status", label: "Status" },
    ],
  },
  forms: {
    title: "Form",
    fields: [
      { name: "name", label: "Name" },
      { name: "public_slug", label: "Public slug" },
    ],
  },
};

function RecordForm({ resource, recordId }: { resource: string; recordId: string | null }) {
  const spec = REGISTRY[resource] ?? { title: resource, fields: [{ name: "name", label: "Name" }] };
  const closeModal = useUIStore((s) => s.closeModal);
  const create = useCreate(resource);
  const update = useUpdate(resource);
  const existing = useItem<Record<string, unknown>>(resource, recordId ?? undefined);
  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    if (recordId && existing.data) {
      const seed: Record<string, string> = {};
      for (const f of spec.fields) seed[f.name] = String(existing.data[f.name] ?? "");
      setForm(seed);
    }
  }, [recordId, existing.data, spec.fields]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recordId) await update.mutateAsync({ id: recordId, patch: form });
    else await create.mutateAsync(form);
    closeModal();
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      {spec.fields.map((f) => (
        <label
          key={f.name}
          htmlFor={`crm-field-${f.name}`}
          className="flex flex-col gap-1 text-[13px] text-secondary"
        >
          {f.label}
          <Input
            id={`crm-field-${f.name}`}
            aria-label={f.label}
            type={f.type ?? "text"}
            value={form[f.name] ?? ""}
            onChange={(e) => setForm((s) => ({ ...s, [f.name]: e.target.value }))}
          />
        </label>
      ))}
      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={closeModal}>
          Cancel
        </Button>
        <Button type="submit">{recordId ? "Save" : "Create"}</Button>
      </div>
    </form>
  );
}

export function CrmModals() {
  const modal = useUIStore((s) => s.modal);
  const closeModal = useUIStore((s) => s.closeModal);
  const remove = useRemove(modal.resource ?? "");
  if (!modal.kind || !modal.resource) return null;
  const spec = REGISTRY[modal.resource];
  const title = spec?.title ?? modal.resource;

  return (
    <Dialog open onOpenChange={(o) => !o && closeModal()}>
      <DialogContent>
        {modal.kind === "confirm-delete" ? (
          <>
            <DialogHeader>
              <DialogTitle>Delete {title}?</DialogTitle>
            </DialogHeader>
            <p className="text-[13px] text-secondary">
              This permanently removes the record. This cannot be undone.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (modal.recordId) await remove.mutateAsync(modal.recordId);
                  closeModal();
                }}
              >
                Delete
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {modal.kind === "edit" ? `Edit ${title}` : `New ${title}`}
              </DialogTitle>
            </DialogHeader>
            <RecordForm resource={modal.resource} recordId={modal.recordId} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
