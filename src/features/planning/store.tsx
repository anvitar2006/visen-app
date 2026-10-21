"use client";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  BACKUP_KEY,
  STORAGE_KEY,
  dataSchema,
  emptyData,
  parseJSON,
  type PlanningData,
} from "@/domain/storage";
import { localDate, weekDays, timeLabel, addDays } from "@/domain/dates";
export type EditorKind =
  | "task"
  | "commitment"
  | "goal"
  | "milestone"
  | "habit"
  | "category"
  | "settings";
export type Editor = {
  kind: EditorKind;
  id?: string;
  date?: string;
  goalId?: string;
};
export type PlanningItem = {
  id: string;
  title: string;
  date: string;
  category: PlanningData["categories"][number];
  status: PlanningData["tasks"][number]["status"] | "scheduled";
  priority: PlanningData["tasks"][number]["priority"];
  start?: string;
  detail: string;
} & (
  | { kind: "task"; record: PlanningData["tasks"][number] }
  | { kind: "commitment"; record: PlanningData["commitments"][number] }
);
import { id, activeEvents, setCompleted } from "@/domain/actions";
export { id, activeEvents, setCompleted } from "@/domain/actions";
function usePlanningStore() {
  const [data, setData] = useState<PlanningData>(() => emptyData("UTC"));
  const [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [editor, setEditor] = useState<Editor | null>(null),
    [anchor, setAnchor] = useState("");
  const [undoStack, setUndoStack] = useState<
    { data: PlanningData; preferencesChanged: boolean }[]
  >([]);
  const baseline = useRef<string | null>(null),
    current = useRef(data),
    blocked = useRef(false),
    initial = useRef(false);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (!initial.current) {
      initial.current = true;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        baseline.current = raw;
        const next = raw ? parseJSON(raw) : emptyData();
        if (!raw) {
          const legacyTheme = localStorage.getItem("visen-theme");
          if (legacyTheme === "dark" || legacyTheme === "light")
            next.preferences.theme = legacyTheme;
        }
        current.current = next;
        setData(next);
        setAnchor(localDate(new Date(), next.preferences.timeZone));
      } catch (e) {
        blocked.current = true;
        setError(
          "Your saved data was not opened or overwritten. " +
            (e as Error).message,
        );
        setAnchor(localDate(new Date(), "UTC"));
      }
      setReady(true);
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY && event.newValue !== baseline.current) {
        blocked.current = true;
        setError(
          "Your plans changed in another tab. Export any unsaved work, then reload this tab before editing.",
        );
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  function commit(
    change: (draft: PlanningData) => void,
    label = "Saved",
    replace = false,
    remember = true,
  ) {
    if (!ready) return false;
    try {
      if (blocked.current && !replace)
        throw new Error(
          "Resolve the storage warning before making changes. Export, import, or reset from Your space.",
        );
      if (!replace && localStorage.getItem(STORAGE_KEY) !== baseline.current) {
        blocked.current = true;
        throw new Error(
          "Your plans changed in another tab. Reload before editing.",
        );
      }
      const next = structuredClone(current.current);
      change(next);
      next.revision = current.current.revision + 1;
      const checked = dataSchema.safeParse(next);
      if (!checked.success) throw new Error(checked.error.issues[0].message);
      const valid = checked.data,
        raw = JSON.stringify(valid);
      // Preserve the previous document before destructive replacement. Never silently drop a failed backup.
      if (replace) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved !== null) localStorage.setItem(BACKUP_KEY, saved);
      }
      localStorage.setItem(STORAGE_KEY, raw);
      baseline.current = raw;
      const previous = current.current;
      if (remember)
        setUndoStack((s) => [
          ...s.slice(-19),
          {
            data: previous,
            preferencesChanged:
              JSON.stringify(previous.preferences) !==
              JSON.stringify(valid.preferences),
          },
        ]);
      current.current = valid;
      setData(valid);
      blocked.current = false;
      setError("");
      if (label) setMessage(label);
      return true;
    } catch (e) {
      setError("Changes were not saved. " + (e as Error).message);
      return false;
    }
  }
  function undo() {
    const previous = undoStack.at(-1);
    if (!previous) return;
    if (
      commit((d) => {
        const preferences = d.preferences;
        Object.assign(d, previous.data);
        if (!previous.preferencesChanged) d.preferences = preferences;
      }, "Undone")
    )
      setUndoStack(undoStack.slice(0, -1));
  }
  const today = localDate(now, data.preferences.timeZone);
  const days = weekDays(anchor || today);
  const categoryFor = (categoryId: string) =>
    data.categories.find((c) => c.id === categoryId) ?? data.categories[0];
  const planningItems: PlanningItem[] = [
    ...data.tasks.map((t) => ({
      id: t.id,
      kind: "task" as const,
      title: t.title,
      date: t.plannedDate || "",
      category: categoryFor(t.categoryId),
      status: t.status,
      priority: t.priority,
      start: t.scheduledStart,
      detail: t.scheduledStart
        ? `${timeLabel(t.scheduledStart, data.preferences.timeZone)} · ${t.estimatedMinutes} min`
        : `${t.estimatedMinutes ? `${t.estimatedMinutes} min · ` : ""}Flexible`,
      record: t,
    })),
    ...data.commitments.map((c) => ({
      id: c.id,
      kind: "commitment" as const,
      title: c.title,
      date: localDate(c.startAt, data.preferences.timeZone),
      category: categoryFor(c.categoryId),
      status: "scheduled" as const,
      priority: "normal" as const,
      start: c.startAt,
      detail: `${timeLabel(c.startAt, data.preferences.timeZone)} – ${timeLabel(c.endAt, data.preferences.timeZone)}`,
      record: c,
    })),
  ];
  const todayTasks = data.tasks.filter((t) => t.plannedDate === today);
  const rank = { high: 0, normal: 1, low: 2 };
  const todayPriorities = [...todayTasks]
    .sort(
      (a, b) =>
        Number(a.status === "completed") - Number(b.status === "completed") ||
        rank[a.priority] - rank[b.priority],
    )
    .slice(0, 3);
  const active = activeEvents(data);
  const habits = data.habits.map((h) => {
    const target =
      h.frequency.kind === "weekly-target"
        ? h.frequency.timesPerWeek
        : h.frequency.weekdays.length;
    const done = days.map((d) =>
      active.some(
        (e) =>
          e.subject.type === "habit" &&
          e.subject.id === h.id &&
          e.localDate === d.isoDate,
      ),
    );
    const count = done.filter(Boolean).length;
    return {
      ...h,
      color: categoryFor(h.categoryId).tone,
      days: done,
      count: `${count} of ${target}`,
      detail:
        h.frequency.kind === "weekly-target"
          ? `${target} times a week`
          : `${h.frequency.weekdays.map((n) => ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][n - 1]).join(", ")}`,
      target,
    };
  });
  const goals = data.goals.map((g) => {
    const ms = data.milestones
      .filter((m) => m.goalId === g.id)
      .sort((a, b) => a.position - b.position);
    const ts = data.tasks.filter((t) => t.goalId === g.id);
    const done = ms.filter((m) => m.status === "completed").length,
      total = ms.length;
    const completedTasks = ts.filter((t) => t.status === "completed").length;
    return {
      ...g,
      color: categoryFor(g.categoryId).tone,
      category: categoryFor(g.categoryId).name,
      detail: g.description,
      progress:
        g.status === "completed"
          ? 100
          : total
            ? Math.round((done / total) * 100)
            : ts.length
              ? Math.round((completedTasks / ts.length) * 100)
              : 0,
      steps: total
        ? `${done} of ${total} milestones`
        : `${completedTasks} of ${ts.length} linked tasks`,
      milestone: ms.find((m) => m.status === "open")?.title || "Review goal",
      milestones: ms,
    };
  });
  function toggleTask(taskId: string) {
    commit((d) => {
      const task = d.tasks.find((t) => t.id === taskId)!;
      task.status = task.status === "completed" ? "open" : "completed";
      task.updatedAt = new Date().toISOString();
      setCompleted(
        d,
        { type: "task", id: task.id },
        task.status === "completed",
        today,
      );
    }, "Task updated");
  }
  function toggleHabit(habitId: string, date: string) {
    if (date > today) {
      setError(
        "Habit completions can be recorded for today or an earlier day.",
      );
      return;
    }
    commit((d) => {
      const completed = activeEvents(d).some(
        (e) =>
          e.subject.type === "habit" &&
          e.subject.id === habitId &&
          e.localDate === date,
      );
      setCompleted(d, { type: "habit", id: habitId }, !completed, date);
    }, "Habit updated");
  }
  return {
    data,
    ready,
    error,
    setError,
    message,
    setMessage,
    commit,
    undo,
    canUndo: undoStack.length > 0,
    editor,
    setEditor,
    openEditor: (
      kind: EditorKind,
      recordId?: string,
      date?: string,
      goalId?: string,
    ) => setEditor({ kind, id: recordId, date, goalId }),
    anchor: anchor || today,
    setAnchor,
    today,
    days,
    categoryFor,
    planningItems,
    todayTasks,
    todayPriorities,
    habits,
    goals,
    toggleTask,
    toggleHabit,
    todayUpcomingItems: planningItems
      .filter((p) => p.date === today && p.start && new Date(p.start) > now)
      .sort((a, b) => a.start!.localeCompare(b.start!)),
    todayHabits: habits
      .filter((h) => h.status === "active")
      .map((h) => ({
        ...h,
        done: active.some(
          (e) =>
            e.subject.type === "habit" &&
            e.subject.id === h.id &&
            e.localDate === today,
        ),
      })),
    timeLabel: (instant: string) =>
      timeLabel(instant, data.preferences.timeZone),
    shiftWeek: (n: number) => setAnchor(addDays(anchor || today, n * 7)),
  };
}
const Context = createContext<ReturnType<typeof usePlanningStore> | null>(null);
export function PlanningProvider({ children }: { children: ReactNode }) {
  const store = usePlanningStore();
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
export function usePlanning() {
  const value = useContext(Context);
  if (!value) throw new Error("Planning provider is missing");
  return value;
}
