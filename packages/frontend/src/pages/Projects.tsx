import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from "@dnd-kit/core";
import { projectsApi, clientsApi, freelancersApi } from "../api/resources.js";
import type { Project, ProjectCreate, ProjectStage } from "@dm/shared";
import { PROJECT_STAGES } from "@dm/shared";

const STAGE_COLORS: Record<ProjectStage, { bg: string; border: string; dot: string }> = {
  brief:     { bg: "bg-blue-50",    border: "border-blue-200",    dot: "bg-blue-500" },
  research:  { bg: "bg-purple-50",  border: "border-purple-200",  dot: "bg-purple-500" },
  prototype: { bg: "bg-amber-50",   border: "border-amber-200",   dot: "bg-amber-500" },
  design:    { bg: "bg-indigo-50",  border: "border-indigo-200",  dot: "bg-indigo-500" },
  review:    { bg: "bg-orange-50",  border: "border-orange-200",  dot: "bg-orange-500" },
  delivery:  { bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-500" },
  completed: { bg: "bg-gray-50",    border: "border-gray-200",    dot: "bg-gray-400" },
};

const STAGE_LABELS: Record<ProjectStage, string> = {
  brief: "Brief", research: "Research", prototype: "Prototype",
  design: "Design", review: "Review", delivery: "Delivery", completed: "Done",
};

interface NewProjectForm {
  title: string;
  client_id: string;
  service_type: string;
  stage: ProjectStage;
  budget: number;
  due_date: string;
}

const EMPTY_PROJECT_FORM: NewProjectForm = {
  title: "",
  client_id: "",
  service_type: "",
  stage: "brief",
  budget: 0,
  due_date: "",
};

export function Projects() {
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<NewProjectForm>({ ...EMPTY_PROJECT_FORM });
  const queryClient = useQueryClient();

  const projectsQ = useQuery({ queryKey: ["projects"], queryFn: () => projectsApi.list() });
  const clientsQ = useQuery({ queryKey: ["clients"], queryFn: () => clientsApi.list() });
  const freelancersQ = useQuery({ queryKey: ["freelancers"], queryFn: () => freelancersApi.list() });

  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) => projectsApi.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects"] }),
  });

  const createMut = useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setShowForm(false);
      setForm({ ...EMPTY_PROJECT_FORM });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const projectId = event.active.id as string;
    const newStage = event.over?.id as ProjectStage | undefined;
    if (!newStage || !(PROJECT_STAGES as readonly string[]).includes(newStage)) return;
    const project = projectsQ.data?.find(p => p.project_id === projectId);
    if (!project || project.stage === newStage) return;
    updateMut.mutate({ id: projectId, data: { stage: newStage } });
  };

  const submitNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.client_id) return;
    const payload: ProjectCreate = {
      title: form.title.trim(),
      client_id: form.client_id,
      service_type: form.service_type,
      stage: form.stage,
      budget: form.budget || 0,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
    };
    createMut.mutate(payload);
  };

  const projects = projectsQ.data ?? [];
  const clients = clientsQ.data ?? [];
  const freelancers = freelancersQ.data ?? [];

  const clientName = (cid: string) => clients.find(c => c.client_id === cid)?.company || clients.find(c => c.client_id === cid)?.name || "—";
  const freelancerName = (fid: string | null) => fid ? freelancers.find(f => f.freelancer_id === fid)?.name || "Unassigned" : "Unassigned";

  const isOverdue = (p: Project) => p.due_date && new Date(p.due_date) < new Date() && p.stage !== "completed";
  const daysUntilDue = (p: Project) => {
    if (!p.due_date) return null;
    return Math.ceil((new Date(p.due_date).getTime() - Date.now()) / 86400000);
  };

  const moveProject = (project: Project, direction: "forward" | "back") => {
    const stages = PROJECT_STAGES as readonly string[];
    const idx = stages.indexOf(project.stage);
    const newIdx = direction === "forward" ? Math.min(idx + 1, stages.length - 1) : Math.max(idx - 1, 0);
    if (newIdx !== idx) {
      updateMut.mutate({ id: project.project_id, data: { stage: stages[newIdx] as ProjectStage } });
    }
  };

  // Detail drawer
  if (selectedProject) {
    const p = selectedProject;
    const tasks = []; // Would fetch from API in production
    return (
      <div className="space-y-5">
        <button className="text-navy text-sm font-medium hover:underline" onClick={() => setSelectedProject(null)}>
          &larr; Back to Projects
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-navy">{p.title}</h1>
            <p className="text-sm text-textDim">{clientName(p.client_id)} · {p.service_type}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${STAGE_COLORS[p.stage].bg} ${STAGE_COLORS[p.stage].border} border`}>
            {p.stage}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card col-span-2 space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-textDim uppercase tracking-widest mb-1">Description</h3>
              <p className="text-sm leading-relaxed">{p.description || "No description."}</p>
            </div>
            {/* Stage progress */}
            <div>
              <h3 className="text-xs font-semibold text-textDim uppercase tracking-widest mb-2">Progress</h3>
              <div className="flex gap-1">
                {(PROJECT_STAGES as readonly string[]).map(s => {
                  const idx = (PROJECT_STAGES as readonly string[]).indexOf(p.stage);
                  const sIdx = (PROJECT_STAGES as readonly string[]).indexOf(s);
                  return (
                    <div key={s} className={`flex-1 h-2 rounded-full ${sIdx <= idx ? "bg-navy" : "bg-gray-200"}`} />
                  );
                })}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-textDim">
                {(PROJECT_STAGES as readonly string[]).map(s => <span key={s} className="capitalize">{s}</span>)}
              </div>
            </div>
            {/* Move buttons */}
            <div className="flex gap-2">
              <button className="btn-secondary btn-sm" onClick={() => { moveProject(p, "back"); setSelectedProject(null); }} disabled={p.stage === "brief"}>
                &larr; Move Back
              </button>
              <button className="btn-primary btn-sm" onClick={() => { moveProject(p, "forward"); setSelectedProject(null); }} disabled={p.stage === "completed"}>
                Move Forward &rarr;
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-xs font-semibold text-textDim uppercase tracking-widest mb-2">Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-textDim">Freelancer</span><span className="font-medium">{freelancerName(p.assigned_freelancer_id)}</span></div>
                <div className="flex justify-between"><span className="text-textDim">Budget</span><span className="font-bold">${p.budget.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-textDim">Spent</span><span className="font-medium">${p.actual_cost.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-textDim">Hours Tracked</span><span className="font-medium">{p.time_tracked_hours}h</span></div>
                <div className="flex justify-between"><span className="text-textDim">Due Date</span><span className={`font-medium ${isOverdue(p) ? "text-statusRed" : ""}`}>{p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}</span></div>
                <div className="flex justify-between"><span className="text-textDim">Started</span><span className="font-medium">{p.started_at ? new Date(p.started_at).toLocaleDateString() : "—"}</span></div>
              </div>
            </div>
            <div className="card">
              <h3 className="text-xs font-semibold text-textDim uppercase tracking-widest mb-2">Budget Usage</h3>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${p.actual_cost > p.budget ? "bg-statusRed" : "bg-navy"}`}
                  style={{ width: `${Math.min((p.actual_cost / Math.max(p.budget, 1)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-textDim mt-1">${p.actual_cost.toLocaleString()} of ${p.budget.toLocaleString()} ({Math.round((p.actual_cost / Math.max(p.budget, 1)) * 100)}%)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-navy">Projects</h1>
          <p className="text-sm text-textDim mt-0.5">{projects.length} projects across {Object.keys(STAGE_LABELS).length} stages</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(true)} className="btn-primary btn-sm">+ New Project</button>
          <button onClick={() => setView("kanban")} className={`btn-sm ${view === "kanban" ? "btn-primary" : "btn-secondary"}`}>Kanban</button>
          <button onClick={() => setView("list")} className={`btn-sm ${view === "list" ? "btn-primary" : "btn-secondary"}`}>List</button>
        </div>
      </div>

      {view === "kanban" ? (
        <DndContext onDragEnd={handleDragEnd}>
          <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "60vh" }}>
            {(PROJECT_STAGES as readonly ProjectStage[]).map(stage => {
              const stageProjects = projects.filter(p => p.stage === stage);
              return (
                <ProjectColumn key={stage} stage={stage} count={stageProjects.length}>
                  {stageProjects.map(p => {
                    const days = daysUntilDue(p);
                    return (
                      <ProjectCard
                        key={p.project_id}
                        project={p}
                        stage={stage}
                        days={days}
                        clientLabel={clientName(p.client_id)}
                        freelancerLabel={p.assigned_freelancer_id ? freelancerName(p.assigned_freelancer_id) : null}
                        onOpen={() => setSelectedProject(p)}
                      />
                    );
                  })}
                </ProjectColumn>
              );
            })}
          </div>
        </DndContext>
      ) : (
        <div className="card">
          <table className="w-full text-sm">
            <thead className="text-textDim text-xs uppercase">
              <tr>
                <th className="text-left py-2">Project</th>
                <th className="text-left py-2">Client</th>
                <th className="text-left py-2">Service</th>
                <th className="text-left py-2">Stage</th>
                <th className="text-left py-2">Freelancer</th>
                <th className="text-right py-2">Budget</th>
                <th className="text-right py-2">Hours</th>
                <th className="text-left py-2">Due</th>
              </tr>
            </thead>
            <tbody>
              {projects.map(p => (
                <tr
                  key={p.project_id}
                  className="border-t border-borderc hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedProject(p)}
                >
                  <td className="py-2 font-medium">{p.title}</td>
                  <td className="py-2 text-textDim">{clientName(p.client_id)}</td>
                  <td className="py-2 text-navy">{p.service_type}</td>
                  <td className="py-2">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${STAGE_COLORS[p.stage].bg} border ${STAGE_COLORS[p.stage].border}`}>
                      {p.stage}
                    </span>
                  </td>
                  <td className="py-2 text-textDim">{freelancerName(p.assigned_freelancer_id)}</td>
                  <td className="py-2 text-right">${p.budget.toLocaleString()}</td>
                  <td className="py-2 text-right">{p.time_tracked_hours}h</td>
                  <td className="py-2 text-textDim">{p.due_date ? new Date(p.due_date).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-borderc">
              <h2 className="text-lg font-bold text-navy">New Project</h2>
              <p className="text-xs text-textDim mt-0.5">Status will appear as the card's badge in the kanban column.</p>
            </div>
            <form className="px-6 py-4 space-y-4" onSubmit={submitNewProject}>
              <div>
                <label className="block text-xs font-semibold text-textDim mb-1">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-textDim mb-1">Client *</label>
                  <select
                    value={form.client_id}
                    onChange={e => setForm({ ...form, client_id: e.target.value })}
                    required
                    className="w-full"
                  >
                    <option value="">Select client…</option>
                    {clients.map(c => (
                      <option key={c.client_id} value={c.client_id}>{c.company || c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textDim mb-1">Status *</label>
                  <select
                    value={form.stage}
                    onChange={e => setForm({ ...form, stage: e.target.value as ProjectStage })}
                    className="w-full"
                  >
                    {(PROJECT_STAGES as readonly ProjectStage[]).map(s => (
                      <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-textDim mb-1">Service Type</label>
                  <input
                    value={form.service_type}
                    onChange={e => setForm({ ...form, service_type: e.target.value })}
                    placeholder="e.g. Logo Animation"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-textDim mb-1">Budget ($)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.budget}
                    onChange={e => setForm({ ...form, budget: Number(e.target.value) || 0 })}
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-textDim mb-1">Due date</label>
                <input
                  type="date"
                  value={form.due_date}
                  onChange={e => setForm({ ...form, due_date: e.target.value })}
                  className="w-full"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={createMut.isPending}>
                  {createMut.isPending ? "Saving…" : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

interface ProjectColumnProps {
  stage: ProjectStage;
  count: number;
  children: React.ReactNode;
}

function ProjectColumn({ stage, count, children }: ProjectColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id: stage });
  const colors = STAGE_COLORS[stage];
  return (
    <div ref={setNodeRef} className={`min-w-[250px] w-[250px] flex-shrink-0 ${isOver ? "ring-2 ring-navy/40 rounded-lg" : ""}`}>
      <div className={`px-3 py-2 rounded-t-lg ${colors.bg} border ${colors.border} border-b-0`}>
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
          <span className="text-xs font-bold uppercase tracking-wider">{STAGE_LABELS[stage]}</span>
          <span className="text-xs text-textDim ml-auto">{count}</span>
        </div>
      </div>
      <div className={`border ${colors.border} border-t-0 rounded-b-lg p-2 space-y-2 min-h-[200px] bg-white`}>
        {children}
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  stage: ProjectStage;
  days: number | null;
  clientLabel: string;
  freelancerLabel: string | null;
  onOpen: () => void;
}

function ProjectCard({ project, stage, days, clientLabel, freelancerLabel, onOpen }: ProjectCardProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: project.project_id });
  const colors = STAGE_COLORS[stage];
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onOpen}
      className={`border border-borderc rounded-md p-3 bg-white hover:shadow-card cursor-grab transition ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="font-medium text-sm">{project.title}</div>
        <span className={`shrink-0 inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${colors.bg} border ${colors.border}`}>
          {stage}
        </span>
      </div>
      <div className="text-xs text-textDim mb-2">{clientLabel}</div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-navy font-medium">${project.budget.toLocaleString()}</span>
        {days !== null && (
          <span className={`font-medium ${days < 0 ? "text-statusRed" : days < 3 ? "text-statusAmber" : "text-textDim"}`}>
            {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
          </span>
        )}
      </div>
      {freelancerLabel && (
        <div className="mt-2 text-xs text-textDim">
          {freelancerLabel} · {project.time_tracked_hours}h
        </div>
      )}
    </div>
  );
}
