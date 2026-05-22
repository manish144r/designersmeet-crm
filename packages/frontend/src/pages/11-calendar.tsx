/* Generated from brief/mockups/11-calendar.html via Codex fidelity pass 2026-05-19. Do not hand-edit. */

import { useNavigate } from "react-router-dom";
import { useState, type ReactNode } from "react";
import {
  BarChart3,
  Bell,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  CircleHelp,
  ClipboardList,
  Copy,
  GitBranch,
  HardHat,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  Link as LinkIcon,
  Mail,
  MessagesSquare,
  MoreHorizontal,
  PanelLeftClose,
  Plus,
  Search,
  Settings,
  Users,
  UsersRound,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useList } from "../hooks/useResource.js";
import { useUIStore } from "../stores/uiStore.js";

type NavItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

type CalendarEvent = {
  title: string;
  detail: string;
  span?: 1 | 2 | 3;
  tone?: "quiet" | "neutral" | "emphasis";
};

type TimeRow = {
  label: string;
  events: Array<CalendarEvent | null>;
};

type MonthDay = {
  label: string;
  disabled?: boolean;
  active?: boolean;
};

const workspaceNavItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Contacts", icon: Users },
  { label: "Vendors", icon: HardHat },
  { label: "Pipelines", icon: GitBranch },
  { label: "Projects", icon: Layers },
  { label: "Calendar", icon: CalendarIcon, active: true },
  { label: "Conversations", icon: MessagesSquare },
  { label: "Forms", icon: ClipboardList },
  { label: "Workflows", icon: Zap },
  { label: "Reports", icon: BarChart3 },
  { label: "Settings", icon: Settings },
];

const surfaceNavItems: NavItem[] = [
  { label: "Outlook add-in", icon: Mail },
  { label: "Teams app", icon: UsersRound },
  { label: "M365 launcher", icon: LayoutGrid },
];

const weekDays = [
  { day: "Mon", date: "18", active: true },
  { day: "Tue", date: "19" },
  { day: "Wed", date: "20" },
  { day: "Thu", date: "21" },
  { day: "Fri", date: "22" },
  { day: "Sat", date: "23" },
  { day: "Sun", date: "24" },
];

const calendarRows: TimeRow[] = [
  {
    label: "8 AM",
    events: [
      null,
      null,
      null,
      { title: "Coffee — Tanvi Joshi", detail: "Discovery · MG Road", tone: "quiet" },
      null,
      null,
      null,
    ],
  },
  {
    label: "9 AM",
    events: [
      { title: "PM stand-up", detail: "Internal · Teams" },
      null,
      { title: "Vendor sync", detail: "Voltek + MK Carpenter", tone: "emphasis" },
      null,
      null,
      null,
      null,
    ],
  },
  {
    label: "10 AM",
    events: [
      null,
      { title: "Concept review", detail: "Aurora Studio · Teams", span: 2 },
      null,
      null,
      { title: "Whitefield install QC", detail: "Half-day on site", span: 3, tone: "emphasis" },
      null,
      null,
    ],
  },
  {
    label: "11 AM",
    events: [
      { title: "Site walk — HSR", detail: "Priya Raghavan", tone: "emphasis" },
      null,
      null,
      { title: "Sample review", detail: "FabTextiles + Aurora" },
      null,
      null,
      null,
    ],
  },
  {
    label: "12 PM",
    events: [
      null,
      null,
      { title: "Site visit — JP Nagar", detail: "Lakshmi & Ravi", span: 2, tone: "emphasis" },
      null,
      null,
      null,
      null,
    ],
  },
  { label: "1 PM", events: [null, null, null, null, null, null, null] },
  {
    label: "2 PM",
    events: [
      null,
      { title: "Brief discovery", detail: "Suri Kapoor", tone: "quiet" },
      null,
      null,
      null,
      null,
      null,
    ],
  },
  {
    label: "3 PM",
    events: [
      null,
      null,
      null,
      null,
      { title: "Weekly review", detail: "Internal" },
      null,
      null,
    ],
  },
  {
    label: "4 PM",
    events: [
      null,
      { title: "Q3 board update", detail: "Internal · Outlook" },
      null,
      null,
      null,
      null,
      null,
    ],
  },
  { label: "5 PM", events: [null, null, null, null, null, null, null] },
  { label: "6 PM", events: [null, null, null, null, null, null, null] },
];

const bookingCalendarDays: MonthDay[] = [
  { label: "1", disabled: true },
  { label: "2", disabled: true },
  { label: "3", disabled: true },
  ...Array.from({ length: 28 }, (_, index) => ({
    label: String(index + 4),
    active: index + 4 === 18,
  })),
];

const availableTimes = ["9:30", "10:00", "10:30", "2:00", "2:30", "5:00"];

const iconClass = "size-4 shrink-0";

const eventToneClasses = {
  quiet: "border-border-subtle border-l-muted bg-background text-secondary",
  neutral: "border-border border-l-secondary bg-background text-secondary",
  emphasis: "border-border border-l-foreground bg-background text-secondary",
};

function IconButton({
  title,
  children,
  className,
  onClick,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      title={title}
      aria-label={title}
      className={cn(
        "size-[30px] rounded-md p-0 text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground",
        className,
      )}
    >
      {children}
    </Button>
  );
}

function Brand({ className, textClassName }: { className?: string; textClassName?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-[14px] font-semibold tracking-normal text-foreground",
        className,
      )}
    >
      <span className="inline-flex size-[22px] items-center justify-center rounded-[5px] border border-border bg-background text-[12px] font-bold text-foreground">
        D
      </span>
      <span className={textClassName}>DesignersMeet</span>
    </div>
  );
}

function Avatar({
  children,
  size = "default",
  className,
}: {
  children: ReactNode;
  size?: "default" | "sm";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border border-background bg-border-subtle font-semibold uppercase text-secondary",
        size === "sm" ? "size-[22px] text-[10px]" : "size-7 text-[12px]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function SearchField({
  placeholder,
  shortcut,
  className,
}: {
  placeholder: string;
  shortcut?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[34px] items-center rounded-md border border-border-strong bg-background",
        className,
      )}
    >
      <Search
        className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <Input
        type="text"
        placeholder={placeholder}
        className={cn(
          "h-full border-0 bg-transparent py-0 pl-8 text-[13px] text-foreground shadow-none placeholder:text-muted focus:border-transparent focus:ring-0",
          shortcut ? "pr-14" : "pr-3",
        )}
      />
      {shortcut ? (
        <span className="absolute right-2 top-1/2 -translate-y-1/2">
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted shadow-card">
            {shortcut}
          </kbd>
        </span>
      ) : null}
    </div>
  );
}

function SidebarNavItem({ item, onClick }: { item: NavItem; onClick: () => void }) {
  const Icon = item.icon;

  return (
    <button type="button" onClick={onClick} className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2.5 rounded-md px-2.5 py-[7px] text-[13px] font-medium transition-colors",
        item.active
          ? "bg-primary-tint text-primary"
          : "text-secondary hover:bg-border-subtle hover:text-foreground",
      )}>
      <Icon className={cn(iconClass, item.active ? "text-primary" : "text-muted")} aria-hidden="true" />
      <span>{item.label}</span>
    </button>
  );
}

function CalendarEventBlock({ event }: { event: CalendarEvent }) {
  const heightClass =
    event.span === 3
      ? "h-[calc(300%_-_4px)]"
      : event.span === 2
        ? "h-[calc(200%_-_4px)]"
        : "h-[calc(100%_-_4px)]";

  return (
    <div
      className={cn(
        "absolute left-1 right-1 top-[2px] cursor-pointer overflow-hidden rounded border border-l-[3px] p-1.5 text-[10px] leading-tight",
        heightClass,
        eventToneClasses[event.tone ?? "neutral"],
      )}
    >
      <div className="truncate font-semibold text-foreground">{event.title}</div>
      <div className="truncate opacity-75">{event.detail}</div>
    </div>
  );
}

function CalendarGridRow({ row, _ev }: { row: TimeRow; _ev: unknown[] }) {
  return (
    <div className="grid grid-cols-[60px_repeat(7,1fr)]">
      <div className="border-r border-border-subtle py-1 pr-2 text-right text-[10px] text-muted">
        {row.label}
      </div>
      {row.events.map((event, index) => {
        const timeLabel = row.label;
        const col = index;
        const dataEvent = _ev.find(
          (e: any) => e.time === timeLabel && e.dayIndex === col,
        ) as CalendarEvent | undefined;
        const renderEvent = _ev.length > 0 ? dataEvent : event;

        return (
          <div
            key={`${row.label}-${index}`}
            className="relative h-[60px] border-b border-r border-border-subtle"
          >
            {renderEvent ? <CalendarEventBlock event={renderEvent} /> : null}
          </div>
        );
      })}
    </div>
  );
}

function BookingDateCell({ day }: { day: MonthDay }) {
  return (
    <div
      className={cn(
        "rounded py-1.5 text-center text-[10px]",
        day.disabled && "text-disabled",
        !day.disabled &&
          !day.active &&
          "cursor-pointer text-secondary hover:bg-hover hover:text-foreground",
        day.active && "border border-foreground bg-background font-semibold text-foreground",
      )}
    >
      {day.label}
    </div>
  );
}

function TimeButton({ time }: { time: string }) {
  const selected = time === "10:00";

  return (
    <button
      type="button"
      className={cn(
        "rounded border py-1.5 text-[11px]",
        selected
          ? "border-foreground bg-subtle font-semibold text-foreground"
          : "border-border text-secondary hover:border-foreground hover:text-foreground",
      )}
    >
      {time}
    </button>
  );
}

export default function Calendar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<"day"|"week"|"month"|"agenda">("week");
  const [weekOffset, setWeekOffset] = useState(0);
  const navigate = useNavigate();
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const _evAll = useList("calendar-events").data?.data ?? [];
  const _ev =
    eventTypeFilter === "all"
      ? _evAll
      : _evAll.filter((e: any) => e.event_type === eventTypeFilter);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground antialiased">
      <aside className="flex w-[232px] shrink-0 flex-col border-r border-border bg-sidebar">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <Brand />
          <IconButton title="Collapse sidebar" onClick={() => setSidebarCollapsed(v => !v)}>
            <PanelLeftClose className={iconClass} aria-hidden="true" />
          </IconButton>
        </div>

        <div className="px-3 pt-3">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background p-2 shadow-card">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-background text-[10px] font-bold text-foreground">
                HQ
              </div>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-semibold text-foreground">
                  DesignersMeet HQ
                </div>
                <div className="truncate text-[10px] text-muted">Bengaluru workspace</div>
              </div>
            </div>
            <ChevronsUpDown className="size-4 shrink-0 text-muted" aria-hidden="true" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 pt-3">
          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Workspace
          </div>
          <div className="flex flex-col gap-0.5">
            {workspaceNavItems.map((item) => (
              <SidebarNavItem key={item.label} item={item} onClick={() => { const r = ({Dashboard:"/dashboard",Contacts:"/contacts",Vendors:"/vendors",Pipelines:"/pipelines",Projects:"/projects",Calendar:"/calendar",Conversations:"/conversations",Forms:"/forms",Workflows:"/workflows",Reports:"/pipelines",Settings:"/settings"} as Record<string,string>)[item.label]; if (r) navigate(r); }} />
            ))}
          </div>

          <div className="mb-1.5 mt-3.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-muted">
            Surfaces
          </div>
          <div className="flex flex-col gap-0.5">
            {surfaceNavItems.map((item) => (
              <SidebarNavItem key={item.label} item={item} onClick={() => { const urls: Record<string,string> = {"Outlook add-in":"https://outlook.office.com","Teams app":"https://teams.microsoft.com","M365 launcher":"https://microsoft365.com/apps"}; const u = urls[item.label]; if (u) window.open(u,"_blank","noopener,noreferrer"); }} />
            ))}
          </div>
        </nav>

        <div className="border-t border-border px-3 py-3">
          <div className="flex items-center gap-2 px-1">
            <Avatar>MS</Avatar>
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-foreground">Manish</div>
              <div className="truncate text-[10px] text-muted">Workspace owner</div>
            </div>
            <IconButton title="Menu" className="ml-auto">
              <MoreHorizontal className={iconClass} aria-hidden="true" />
            </IconButton>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[52px] items-center gap-4 border-b border-border bg-background px-5">
          <nav className="flex items-center gap-2 text-[13px]">
            <span className="text-muted">Calendar</span>
            <ChevronRight className="size-4 text-disabled" aria-hidden="true" />
            <span className="font-medium text-foreground">This week</span>
          </nav>

          <SearchField
            placeholder="Search contacts, projects, vendors…"
            shortcut="⌘K"
            className="ml-auto mr-auto max-w-[480px] flex-1"
          />

          <div className="ml-auto flex items-center gap-1">
            <IconButton title="Help" onClick={() => window.open("https://support.microsoft.com","_blank","noopener,noreferrer")}>
              <CircleHelp className={iconClass} aria-hidden="true" />
            </IconButton>
            <IconButton title="Notifications" className="relative" onClick={() => navigate("/conversations")}>
              <Bell className={iconClass} aria-hidden="true" />
              <span className="absolute right-1 top-1 size-1.5 rounded-full bg-foreground" />
            </IconButton>
            <div className="mx-1 h-6 w-px bg-border" />
            <button
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-hover focus-visible:outline-foreground"
            >
              <Avatar size="sm">MS</Avatar>
              <ChevronDown className="size-4 text-muted" aria-hidden="true" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto bg-background">
          <div className="flex h-full">
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex items-center justify-between px-8 pb-4 pt-6">
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    onClick={() => useUIStore.getState().openCreate("calendar-events")}
                    className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                  >
                    <Plus className={iconClass} aria-hidden="true" />
                    New event
                  </Button>

                  <div className="flex items-center gap-1">
                    <IconButton title="Previous week" onClick={() => setWeekOffset(o => o - 1)}>
                      <ChevronLeft className={iconClass} aria-hidden="true" />
                    </IconButton>
                    <IconButton title="Next week" onClick={() => setWeekOffset(o => o + 1)}>
                      <ChevronRight className={iconClass} aria-hidden="true" />
                    </IconButton>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setWeekOffset(0)}
                      className="h-auto px-2.5 py-1.5 text-[12px] text-secondary hover:bg-hover hover:text-foreground focus-visible:ring-foreground"
                    >
                      Today
                    </Button>
                  </div>

                  <h1 className="font-display text-[18px] font-semibold tracking-normal text-foreground">
                    May 18 — 24, 2026
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-md border border-border-strong bg-background">
                    <button
                      type="button"
                      onClick={() => setViewMode("day")}
                      className={"rounded-l-md px-2.5 py-1.5 text-[12px] hover:bg-hover hover:text-foreground " + (viewMode==="day" ? "bg-primary-tint text-primary font-medium" : "text-muted")}
                    >
                      Day
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("week")}
                      className={"px-2.5 py-1.5 text-[12px] " + (viewMode==="week" ? "bg-primary-tint text-primary font-medium" : "text-muted hover:bg-hover hover:text-foreground")}
                    >
                      Week
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("month")}
                      className={"px-2.5 py-1.5 text-[12px] hover:bg-hover hover:text-foreground " + (viewMode==="month" ? "bg-primary-tint text-primary font-medium" : "text-muted")}
                    >
                      Month
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("agenda")}
                      className={"rounded-r-md px-2.5 py-1.5 text-[12px] hover:bg-hover hover:text-foreground " + (viewMode==="agenda" ? "bg-primary-tint text-primary font-medium" : "text-muted")}
                    >
                      Agenda
                    </button>
                  </div>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => { navigator.clipboard.writeText(window.location.origin + "/calendar/book"); alert("Booking link copied to clipboard!"); }}
                    className="h-auto gap-1.5 px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                  >
                    <LinkIcon className={iconClass} aria-hidden="true" />
                    Booking link
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 px-8 pb-3">
                {(
                  [
                    ["all", "All"],
                    ["meeting", "Meeting"],
                    ["call", "Call"],
                    ["deadline", "Deadline"],
                    ["reminder", "Reminder"],
                  ] as const
                ).map(([value, label]) => {
                  const isActive = eventTypeFilter === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setEventTypeFilter(value)}
                      data-active={isActive ? "true" : "false"}
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium leading-[18px] tracking-[0.01em] hover:bg-border-subtle focus-visible:outline-foreground",
                        isActive
                          ? "bg-primary-tint text-primary"
                          : "bg-border-subtle text-secondary",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="flex-1 overflow-auto border-t border-border">
                <div className="grid grid-cols-[60px_repeat(7,1fr)]">
                  <div className="h-12 border-b border-r border-border-subtle bg-subtle/40" />
                  {weekDays.map((day) => (
                    <div
                      key={day.day}
                      className={cn(
                        "flex h-12 flex-col items-center justify-center border-b border-r border-border-subtle",
                        day.active ? "bg-background" : "bg-subtle/40",
                      )}
                    >
                      <div className="text-[10px] uppercase text-muted">{day.day}</div>
                      <div className="text-[15px] font-semibold text-foreground">{day.date}</div>
                    </div>
                  ))}
                </div>

                {calendarRows.map((row) => (
                  <CalendarGridRow key={row.label} row={row} _ev={_ev} />
                ))}
              </div>
            </div>

            <aside className="w-[340px] overflow-auto border-l border-border bg-subtle/30">
              <div className="border-b border-border bg-background p-5">
                <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted">
                  Public booking page
                </div>

                <Card className="rounded-lg border-border bg-background p-4">
                  <Brand className="mb-3" textClassName="text-[12px]" />

                  <div className="text-[14px] font-semibold text-foreground">
                    Book a discovery call with Manish
                  </div>
                  <div className="mt-1 text-[11.5px] text-muted">
                    30 minutes · Google Meet or Teams
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Select a date
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day, index) => (
                        <div key={`${day}-${index}`} className="text-muted">
                          {day}
                        </div>
                      ))}
                      {bookingCalendarDays.map((day) => (
                        <BookingDateCell key={day.label} day={day} />
                      ))}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted">
                      Available · Mon May 18
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {availableTimes.map((time) => (
                        <TimeButton key={time} time={time} />
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="mt-4 h-auto w-full justify-center px-3.5 py-[7px] text-[13px] focus-visible:ring-foreground"
                  >
                    Confirm booking
                  </Button>

                  <div className="mt-3 text-center text-[10px] text-muted">
                    Powered by DesignersMeet · book.designersmeet.com/manish
                  </div>
                </Card>
              </div>

              <div className="p-5">
                <div className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted">
                  My calendars
                </div>

                <div className="space-y-1">
                  {[
                    ["Personal (Outlook)", "bg-foreground", true],
                    ["Discovery calls", "bg-secondary", true],
                    ["Site visits", "bg-muted", true],
                    ["Team — Anita M.", "bg-disabled", false],
                    ["Team — Rohit", "bg-disabled", false],
                  ].map(([label, swatchClass, checked]) => (
                    <label
                      key={label as string}
                      className="flex items-center gap-2.5 text-[12.5px] text-secondary"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={checked as boolean}
                        className="rounded border-border-strong accent-foreground"
                      />
                      <span className={cn("size-3 rounded-sm", swatchClass as string)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>

                <div className="mb-3 mt-6 text-[12px] font-semibold uppercase tracking-wider text-muted">
                  Bookable services
                </div>

                <div className="space-y-1.5">
                  <Card className="flex items-center justify-between rounded-md border-border bg-background p-2.5">
                    <div>
                      <div className="text-[12.5px] font-semibold text-foreground">
                        Discovery — 30 min
                      </div>
                      <div className="text-[11px] text-muted">Round-robin · 12 bookings</div>
                    </div>
                    <IconButton title="Copy discovery booking link">
                      <Copy className={iconClass} aria-hidden="true" />
                    </IconButton>
                  </Card>

                  <Card className="flex items-center justify-between rounded-md border-border bg-background p-2.5">
                    <div>
                      <div className="text-[12.5px] font-semibold text-foreground">
                        Site walk — 90 min
                      </div>
                      <div className="text-[11px] text-muted">Manish only · 6 bookings</div>
                    </div>
                    <IconButton title="Copy site walk booking link">
                      <Copy className={iconClass} aria-hidden="true" />
                    </IconButton>
                  </Card>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

  );
}
