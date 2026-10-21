"use client";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { X, Plus, Download, Upload, Trash2 } from "lucide-react";
import { deleteRecord } from "@/domain/actions";
import { usePlanning, id, setCompleted, type Editor } from "./store";
import {
  BACKUP_KEY,
  STORAGE_KEY,
  emptyData,
  exampleData,
  parseJSON,
  type PlanningData,
} from "@/domain/storage";
import { localDate, wallTime, zonedInstant } from "@/domain/dates";
import type { LocalDate } from "@/domain/planning";
function download(raw: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([raw], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function PlanningEditor() {
  const { editor } = usePlanning();
  return editor ? (
    <EditorDialog
      key={`${editor.kind}-${editor.id || "new"}`}
      editor={editor}
    />
  ) : null;
}
function EditorDialog({ editor }: { editor: Editor }) {
  const store = usePlanning();
  const { data, commit, setEditor, today } = store;
  const ref = useRef<HTMLDialogElement>(null);
  const table = {
    task: data.tasks,
    commitment: data.commitments,
    goal: data.goals,
    milestone: data.milestones,
    habit: data.habits,
    category: data.categories,
    settings: [],
  };
  const item = table[editor.kind].find((r) => r.id === editor.id);
  const r = (item ?? {}) as Record<string, unknown>;
  const zone = String(r.timeZone || data.preferences.timeZone);
  const values: Record<string, string> = {
    title: String(r.title || r.name || ""),
    description: String(r.description || ""),
    categoryId: String(r.categoryId || data.categories[0].id),
    status: String(
      r.status ||
        (editor.kind === "goal" || editor.kind === "habit" ? "active" : "open"),
    ),
    priority: String(r.priority || "normal"),
    plannedDate: String(
      r.plannedDate || (!editor.id ? (editor.date ?? today) : ""),
    ),
    dueDate: String(r.dueDate || ""),
    estimatedMinutes: String(r.estimatedMinutes || ""),
    goalId: String(r.goalId || editor.goalId || ""),
    milestoneId: String(r.milestoneId || ""),
    targetDate: String(r.targetDate || ""),
    startDate: r.startAt
      ? localDate(String(r.startAt), zone)
      : editor.date || today,
    endDate: r.endAt ? localDate(String(r.endAt), zone) : editor.date || today,
    startTime: r.startAt
      ? wallTime(String(r.startAt), zone)
      : r.scheduledStart
        ? wallTime(String(r.scheduledStart), data.preferences.timeZone)
        : "",
    endTime: r.endAt ? wallTime(String(r.endAt), zone) : "",
    timeZone: zone,
    tone: String(r.tone || "sage"),
    frequency: r.frequency
      ? (r.frequency as { kind: string }).kind
      : "weekly-target",
    timesPerWeek:
      r.frequency && (r.frequency as { timesPerWeek?: number }).timesPerWeek
        ? String((r.frequency as { timesPerWeek: number }).timesPerWeek)
        : "3",
    weekdays:
      r.frequency && (r.frequency as { weekdays?: number[] }).weekdays
        ? (r.frequency as { weekdays: number[] }).weekdays.join(",")
        : "1,3,5",
    name: data.preferences.name,
    vision: data.preferences.vision,
    planningZone: data.preferences.timeZone,
    theme: data.preferences.theme,
  };
  const [form, setForm] = useState(values),
    [dirty, setDirty] = useState(false),
    [error, setError] = useState(""),
    [confirm, setConfirm] = useState<
      "" | "delete" | "discard" | "reset" | "import" | "sample"
    >(""),
    [resetWord, setResetWord] = useState(""),
    [pending, setPending] = useState<PlanningData | null>(null);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const update = (key: string, value: string) => {
    setForm((f) => ({
      ...f,
      [key]: value,
      ...(key === "goalId" ? { milestoneId: "" } : {}),
    }));
    setDirty(true);
    setError("");
  };
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  const close = () => {
    if (dirty) {
      setConfirm("discard");
      return;
    }
    setEditor(null);
  };
  const field = (
    key: string,
    label: string,
    type = "text",
    extra: Record<string, string | number | boolean> = {},
  ) => (
    <label className="form-field" key={key}>
      <span>{label}</span>
      <input
        name={key}
        type={type}
        value={form[key]}
        onChange={(e) => update(key, e.target.value)}
        maxLength={300}
        {...extra}
      />
    </label>
  );
  const select = (
    key: string,
    label: string,
    options: readonly { value: string; label: string }[],
  ) => (
    <label className="form-field" key={key}>
      <span>{label}</span>
      <select
        aria-label={label}
        name={key}
        value={form[key]}
        onChange={(e) => update(key, e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
  const categories = () =>
    select(
      "categoryId",
      "Category",
      data.categories.map((c) => ({ value: c.id, label: c.name })),
    );
  const goalLink = () =>
    select("goalId", "Linked goal", [
      { value: "", label: "No goal" },
      ...data.goals.map((g) => ({ value: g.id, label: g.title })),
    ]);
  const created = () => ({
    id: editor.id || id(),
    createdAt: String(r.createdAt || new Date().toISOString()),
    updatedAt: new Date().toISOString(),
  });
  function save(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (confirm) return;
      const succeeded = commit((d) => {
        const common = created(),
          cat = { categoryId: form.categoryId };
        function put<T extends { id: string }>(rows: T[], next: T) {
          const index = rows.findIndex((x) => x.id === next.id);
          if (index < 0) rows.push(next);
          else rows[index] = next;
        }
        const optionalDate = (s: string) => (s ? (s as LocalDate) : undefined);
        if (editor.kind === "task") {
          if (form.startTime && !form.plannedDate)
            throw new Error(
              "Choose a planned day before setting a time block.",
            );
          if (form.startTime && !form.estimatedMinutes)
            throw new Error("A time block needs a duration.");
          const next = {
            ...common,
            ...cat,
            title: form.title.trim(),
            status: form.status as "open" | "in-progress" | "completed",
            priority: form.priority as "high" | "normal" | "low",
            plannedDate: optionalDate(form.plannedDate),
            dueDate: optionalDate(form.dueDate),
            estimatedMinutes: form.estimatedMinutes
              ? Number(form.estimatedMinutes)
              : undefined,
            scheduledStart: form.startTime
              ? zonedInstant(
                  form.plannedDate,
                  form.startTime,
                  d.preferences.timeZone,
                )
              : undefined,
            goalId: form.goalId || undefined,
            milestoneId: form.milestoneId || undefined,
          };
          put(d.tasks, next);
          setCompleted(
            d,
            { type: "task", id: common.id },
            next.status === "completed",
            today,
          );
        }
        if (editor.kind === "commitment")
          put(d.commitments, {
            ...common,
            ...cat,
            title: form.title.trim(),
            startAt: zonedInstant(
              form.startDate,
              form.startTime,
              form.timeZone,
            ),
            endAt: zonedInstant(form.endDate, form.endTime, form.timeZone),
            timeZone: form.timeZone,
          });
        if (editor.kind === "goal") {
          const next = {
            ...common,
            ...cat,
            title: form.title.trim(),
            description: form.description,
            status: form.status as "active" | "paused" | "completed",
            targetDate: optionalDate(form.targetDate),
          };
          put(d.goals, next);
          setCompleted(
            d,
            { type: "goal", id: common.id },
            next.status === "completed",
            today,
          );
        }
        if (editor.kind === "milestone") {
          const next = {
            ...common,
            title: form.title.trim(),
            goalId: form.goalId,
            position: Number(
              r.position ??
                d.milestones.filter((m) => m.goalId === form.goalId).length,
            ),
            status: form.status as "open" | "completed",
            targetDate: optionalDate(form.targetDate),
          };
          put(d.milestones, next);
          setCompleted(
            d,
            { type: "milestone", id: common.id },
            next.status === "completed",
            today,
          );
        }
        if (editor.kind === "habit")
          put(d.habits, {
            ...common,
            ...cat,
            name: form.title.trim(),
            status: form.status as "active" | "paused",
            goalId: form.goalId || undefined,
            frequency:
              form.frequency === "weekly-target"
                ? {
                    kind: "weekly-target",
                    timesPerWeek: Number(form.timesPerWeek),
                  }
                : {
                    kind: "selected-days",
                    weekdays: form.weekdays
                      .split(",")
                      .filter(Boolean)
                      .map(Number),
                  },
          });
        if (editor.kind === "category")
          put(d.categories, {
            id: common.id,
            name: form.title.trim(),
            tone: form.tone as "sage" | "blue" | "lavender" | "taupe" | "rose",
          });
        if (editor.kind === "settings") {
          new Intl.DateTimeFormat("en", { timeZone: form.planningZone });
          d.preferences = {
            ...d.preferences,
            name: form.name.trim(),
            vision: form.vision,
            timeZone: form.planningZone,
            theme: form.theme as "system" | "light" | "dark",
          };
          // Timed plans remain the same instant; only their displayed local day changes.
          d.tasks = d.tasks.map((t) =>
            t.scheduledStart
              ? {
                  ...t,
                  plannedDate: localDate(t.scheduledStart, form.planningZone),
                }
              : t,
          );
        }
      }, "Saved");
      if (succeeded) setEditor(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  function remove() {
    const success = commit((d) => {
      if (editor.kind !== "settings") deleteRecord(d, editor.kind, editor.id!);
    }, "Deleted — you can undo this");
    if (success) setEditor(null);
  }
  function replace(next: PlanningData, label: string) {
    if (commit((d) => Object.assign(d, next), label, true)) setEditor(null);
  }
  const names = {
    task: "task",
    commitment: "commitment",
    goal: "goal",
    milestone: "milestone",
    habit: "habit",
    category: "category",
    settings: "Your space",
  };
  const title =
    editor.kind === "settings"
      ? "Your space"
      : `${editor.id ? "Edit" : "New"} ${names[editor.kind]}`;
  let content: ReactNode;
  if (editor.kind === "settings")
    content = (
      <>
        <p className="editor-intro">
          Saved in this browser only. No cloud sync. Export a backup before
          clearing browser data.
        </p>
        <div className="form-grid">
          {field("name", "Your name", "text", { maxLength: 80 })}
          {select("theme", "Appearance", [
            { value: "system", label: "Follow device" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ])}
          {field("planningZone", "Planning time zone", "text", {
            required: true,
          })}
        </div>
        <p className="field-help">
          IANA zone, e.g. America/New_York. Timed plans keep their instant;
          date-only plans and past habit days stay as entered.
        </p>
        <label className="form-field">
          <span>Your vision</span>
          <textarea
            value={form.vision}
            onChange={(e) => update("vision", e.target.value)}
            maxLength={2000}
            rows={3}
          />
        </label>
        <section className="settings-section">
          <h3>Categories</h3>
          <div className="category-manager">
            {data.categories.map((c) => (
              <button
                type="button"
                className={`text-link tone-${c.tone}`}
                key={c.id}
                onClick={() => {
                  if (dirty) {
                    setError(
                      "Save your profile changes before editing categories.",
                    );
                    return;
                  }
                  setEditor({ kind: "category", id: c.id });
                }}
              >
                <span className="category-dot" />
                {c.name}
              </button>
            ))}
            <button
              type="button"
              className="text-link"
              onClick={() => {
                if (dirty) {
                  setError("Save your profile changes first.");
                  return;
                }
                setEditor({ kind: "category" });
              }}
            >
              <Plus size={15} />
              New category
            </button>
          </div>
        </section>
        <section className="settings-section">
          <h3>Your data</h3>
          <div className="data-actions">
            <button
              type="button"
              className="outline-button"
              onClick={() =>
                download(JSON.stringify(data, null, 2), `visen-${today}.json`)
              }
            >
              <Download size={15} />
              Export plans
            </button>
            <label className="outline-button import-label">
              <Upload size={15} />
              Import plans
              <input
                type="file"
                accept="application/json,.json"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  try {
                    if (file.size > 8_000_000)
                      throw new Error("Choose an export smaller than 8 MB.");
                    setPending(parseJSON(await file.text()));
                    setConfirm("import");
                    setError("");
                  } catch (e) {
                    setError("Nothing was imported. " + (e as Error).message);
                  }
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          <p>Imports replace all plans after confirmation.</p>
          <details className="editor-details">
            <summary>Recovery & storage</summary>
            <p>
              A recovery copy is kept in this browser before import or reset.
              Undo covers the last 20 planning edits until refresh. Export a
              separate backup to keep your data safe.
            </p>
            <button
              type="button"
              className="text-link"
              onClick={() => {
                try {
                  const raw =
                    localStorage.getItem(BACKUP_KEY) ||
                    localStorage.getItem(STORAGE_KEY);
                  if (raw) download(raw, "visen-recovery.json");
                  else setError("No recovery copy is available yet.");
                } catch {
                  setError("Browser storage is unavailable.");
                }
              }}
            >
              Download recovery copy
            </button>
          </details>
          <div className="data-actions">
            <button
              type="button"
              className="text-link"
              onClick={() => setConfirm("sample")}
            >
              Load fictional sample plans
            </button>
            <button
              type="button"
              className="danger-link"
              onClick={() => setConfirm("reset")}
            >
              Reset all plans
            </button>
          </div>
        </section>
      </>
    );
  else
    content = (
      <>
        {field(
          "title",
          editor.kind === "habit"
            ? "Habit name"
            : editor.kind === "category"
              ? "Category name"
              : "Title",
          "text",
          { required: true, autoFocus: true },
        )}
        {editor.kind === "task" && (
          <>
            <div className="form-grid">
              {field("plannedDate", "Planned day", "date")}
              {select("priority", "Priority", [
                { value: "normal", label: "Normal" },
                { value: "high", label: "High" },
                { value: "low", label: "Low" },
              ])}
            </div>
            <div className="form-grid">
              {categories()}
              {select("status", "Status", [
                { value: "open", label: "To do" },
                { value: "in-progress", label: "In progress" },
                { value: "completed", label: "Completed" },
              ])}
            </div>
            <details className="editor-details" open={Boolean(editor.id)}>
              <summary>Timing, deadline & goal</summary>
              <div className="form-grid">
                {field("dueDate", "Deadline", "date")}
                {field("estimatedMinutes", "Duration in minutes", "number", {
                  min: 1,
                  max: 1440,
                })}
                {field(
                  "startTime",
                  `Time block start (${data.preferences.timeZone})`,
                  "time",
                )}
                {goalLink()}
              </div>
              {form.goalId &&
                select("milestoneId", "Linked milestone", [
                  { value: "", label: "No milestone" },
                  ...data.milestones
                    .filter((m) => m.goalId === form.goalId)
                    .map((m) => ({ value: m.id, label: m.title })),
                ])}
              <p className="field-help">
                No planned day means unscheduled. Rescheduling won’t change a
                deadline. Clear the start time to remove a block.
              </p>
            </details>
          </>
        )}
        {editor.kind === "commitment" && (
          <>
            <div className="form-grid">
              {field("startDate", "Start day", "date", { required: true })}
              {field("startTime", "Start time", "time", { required: true })}
              {field("endDate", "End day", "date", { required: true })}
              {field("endTime", "End time", "time", { required: true })}
              {categories()}
              {field("timeZone", "Commitment time zone", "text", {
                required: true,
              })}
            </div>
            <p className="field-help">
              Repeated daylight-saving times use the earlier occurrence.
            </p>
          </>
        )}
        {editor.kind === "goal" && (
          <>
            <label className="form-field">
              <span>Why it matters</span>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                maxLength={2000}
                rows={3}
              />
            </label>
            <div className="form-grid">
              {categories()}
              {field("targetDate", "Target day", "date")}
              {select("status", "Goal status", [
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
                { value: "completed", label: "Completed" },
              ])}
            </div>
            <details className="editor-details">
              <summary>How progress works</summary>
              <p className="field-help">
                Progress follows completed milestones, or linked tasks when
                there are no milestones. Marking the goal completed sets
                progress to 100%.
              </p>
            </details>
          </>
        )}
        {editor.kind === "milestone" && (
          <>
            <div className="form-grid">
              {select(
                "goalId",
                "Goal",
                data.goals.map((g) => ({ value: g.id, label: g.title })),
              )}
              {field("targetDate", "Target day", "date")}
              {select("status", "Milestone status", [
                { value: "open", label: "Open" },
                { value: "completed", label: "Completed" },
              ])}
            </div>
            <p className="field-help">
              Tasks stay linked when a milestone is edited. To move a milestone
              to another goal, first remove its task links.
            </p>
          </>
        )}
        {editor.kind === "habit" && (
          <>
            <div className="form-grid">
              {categories()}
              {select("frequency", "Repeat", [
                { value: "weekly-target", label: "Weekly target" },
                { value: "selected-days", label: "Selected weekdays" },
              ])}
              {form.frequency === "weekly-target" ? (
                field("timesPerWeek", "Times per week", "number", {
                  required: true,
                  min: 1,
                  max: 7,
                })
              ) : (
                <fieldset className="weekday-picks">
                  <legend>Days of the week</legend>
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, i) => (
                      <label key={day}>
                        <input
                          type="checkbox"
                          checked={form.weekdays
                            .split(",")
                            .includes(String(i + 1))}
                          onChange={(e) => {
                            const set = new Set(
                              form.weekdays.split(",").filter(Boolean),
                            );
                            if (e.target.checked) set.add(String(i + 1));
                            else set.delete(String(i + 1));
                            update("weekdays", [...set].sort().join(","));
                          }}
                        />
                        {day}
                      </label>
                    ),
                  )}
                </fieldset>
              )}
              {goalLink()}
              {select("status", "Habit status", [
                { value: "active", label: "Active" },
                { value: "paused", label: "Paused" },
              ])}
            </div>
            <p className="field-help">
              One completion per day. Extra weekdays still count toward your
              target.
            </p>
          </>
        )}
        {editor.kind === "category" && (
          <>
            {select("tone", "Category color", [
              { value: "sage", label: "Sage" },
              { value: "blue", label: "Dusty blue" },
              { value: "lavender", label: "Lavender" },
              { value: "taupe", label: "Warm taupe" },
              { value: "rose", label: "Dusty rose" },
            ])}
            <span className={`category-label tone-${form.tone}`}>
              <span className="category-dot" />
              {form.title || "Category preview"}
            </span>
          </>
        )}
      </>
    );
  return (
    <dialog
      ref={ref}
      className="planning-dialog"
      aria-labelledby="editor-title"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <header className="editor-header">
        <div>
          <h2 id="editor-title">{title}</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Close editor"
          onClick={close}
        >
          <X size={20} />
        </button>
      </header>
      <form onSubmit={save} className="editor-form">
        {content}
        {(error || store.error) && (
          <p role="alert" className="form-error">
            {error || store.error}
          </p>
        )}
        {confirm && (
          <section className="confirmation" aria-label="Confirm action">
            <h3>
              {confirm === "delete"
                ? "Delete this item?"
                : confirm === "discard"
                  ? "Discard your edits?"
                  : confirm === "reset"
                    ? "Reset all your plans?"
                    : confirm === "sample"
                      ? "Replace with fictional examples?"
                      : "Replace with imported plans?"}
            </h3>
            <p>
              {confirm === "delete"
                ? editor.kind === "goal"
                  ? "Milestones and their history are removed. Linked tasks and habits are kept, with their goal links removed."
                  : editor.kind === "category"
                    ? `Plans will move to ${data.categories.find((c) => c.id !== editor.id)?.name || "another category"}. At least one category must remain.`
                    : "This item and its completion history will be removed. You can undo after deleting."
                : confirm === "discard"
                  ? "Your unsaved edits will be lost."
                  : `Your current tasks, commitments, goals, habits, categories, and profile will be replaced. Export first if you want a separate copy. ${pending && confirm === "import" ? `${pending.tasks.length} tasks, ${pending.goals.length} goals, ${pending.habits.length} habits in this import.` : ""}`}
            </p>
            {confirm === "reset" && (
              <label className="form-field">
                <span>Type RESET to confirm</span>
                <input
                  value={resetWord}
                  onChange={(e) => setResetWord(e.target.value)}
                />
              </label>
            )}
            <div className="data-actions">
              <button
                type="button"
                className="outline-button"
                onClick={() => setConfirm("")}
              >
                Keep editing
              </button>
              <button
                type="button"
                className="solid-button"
                disabled={confirm === "reset" && resetWord !== "RESET"}
                onClick={() => {
                  if (confirm === "delete") remove();
                  if (confirm === "discard") setEditor(null);
                  if (confirm === "reset")
                    replace(
                      emptyData(data.preferences.timeZone),
                      "Plans reset — you can undo this",
                    );
                  if (confirm === "import" && pending)
                    replace(pending, "Imported plans");
                  if (confirm === "sample")
                    replace(exampleData(today), "Loaded fictional samples");
                }}
              >
                {confirm === "discard"
                  ? "Discard edits"
                  : confirm === "delete"
                    ? "Delete item"
                    : confirm === "reset"
                      ? "Reset plans"
                      : confirm === "sample"
                        ? "Load sample plans"
                        : "Import and replace"}
              </button>
            </div>
          </section>
        )}
        {!confirm && (
          <footer className="editor-actions">
            {editor.id && (
              <button
                type="button"
                className="danger-link"
                onClick={() => setConfirm("delete")}
              >
                <Trash2 size={15} />
                Delete {names[editor.kind]}
              </button>
            )}
            <button type="button" className="text-link" onClick={close}>
              Cancel
            </button>
            <button type="submit" className="solid-button">
              {editor.id || editor.kind === "settings"
                ? "Save changes"
                : `Create ${names[editor.kind]}`}
            </button>
          </footer>
        )}
      </form>
    </dialog>
  );
}
