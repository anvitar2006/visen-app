"use client";
import { createContext, useContext, useRef, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  Flag,
  LayoutList,
  Columns3,
  Route,
  Plus,
} from "lucide-react";
import { usePlanning, type PlanningItem } from "@/features/planning/store";
import { dateLabel, addDays, localDate, zonedInstant } from "@/domain/dates";
const ItemsContext = createContext<PlanningItem[]>([]);
const useItems = () => useContext(ItemsContext);
function planEnd(item: PlanningItem) {
  return item.kind === "commitment"
    ? item.record.endAt
    : item.start
      ? new Date(
          Date.parse(item.start) + (item.record.estimatedMinutes || 0) * 60000,
        ).toISOString()
      : undefined;
}
function onDay(item: PlanningItem, date: string, zone: string) {
  if (!item.start) return item.date === date;
  return (
    localDate(item.start, zone) <= date &&
    localDate(new Date(Date.parse(planEnd(item)!) - 1), zone) >= date
  );
}
function busySummary(items: PlanningItem[], date: string, zone: string) {
  let start: number, end: number;
  try {
    start = Date.parse(zonedInstant(date, "00:00", zone));
    end = Date.parse(zonedInstant(addDays(date, 1), "00:00", zone));
  } catch {
    return "Clock-change day · see plan times";
  }
  const intervals = items
    .filter((p) => p.start)
    .map((p) => ({
      start: Math.max(start, Date.parse(p.start!)),
      end: Math.min(
        end,
        p.kind === "commitment"
          ? Date.parse(p.record.endAt)
          : Date.parse(p.start!) + (p.record.estimatedMinutes || 0) * 60000,
      ),
    }))
    .filter((p) => p.end > p.start)
    .sort((a, b) => a.start - b.start);
  let minutes = 0,
    last = 0,
    conflicts = 0;
  for (const i of intervals) {
    if (i.start < last) conflicts++;
    minutes += Math.max(0, i.end - Math.max(i.start, last)) / 60000;
    last = Math.max(last, i.end);
  }
  return `${Math.round((minutes / 60) * 10) / 10}h planned${conflicts ? ` · ${conflicts} overlapping ${conflicts === 1 ? "plan" : "plans"}` : ""}`;
}
export type PlanningView = "List" | "Calendar" | "Board" | "Timeline";
const modes = [
  { name: "List", icon: LayoutList },
  { name: "Calendar", icon: CalendarDays },
  { name: "Board", icon: Columns3 },
  { name: "Timeline", icon: Route },
] as const;
const statuses = [
  { id: "open", name: "To do" },
  { id: "in-progress", name: "In progress" },
  { id: "completed", name: "Completed" },
] as const;
const statusLabel = (item: PlanningItem) =>
  item.kind === "commitment"
    ? "Commitment"
    : statuses.find((s) => s.id === item.status)!.name;
function CategoryLabel({ item }: { item: PlanningItem }) {
  return (
    <span className={`category-label tone-${item.category.tone}`}>
      <span className="category-dot" />
      {item.category.name}
    </span>
  );
}
function Priority({ item }: { item: PlanningItem }) {
  return item.priority === "high" ? (
    <span className="priority-label">
      <Flag size={12} />
      High priority
    </span>
  ) : null;
}
function DeadlineLabel({ item }: { item: PlanningItem }) {
  return item.kind === "task" && item.record.dueDate ? (
    <span className="deadline-label">
      <CalendarDays size={11} />
      Due {dateLabel(item.record.dueDate)}
    </span>
  ) : null;
}
function StatusIcon({ item }: { item: PlanningItem }) {
  return item.kind === "commitment" ? (
    <Clock3 size={16} />
  ) : item.status === "completed" ? (
    <Check size={16} />
  ) : item.status === "in-progress" ? (
    <span className="in-progress-dot" aria-hidden="true" />
  ) : (
    <Circle size={16} />
  );
}
function WeekCalendar({
  selected,
  setSelected,
  demo,
}: {
  selected: number;
  setSelected: (day: number) => void;
  demo: (item: PlanningItem) => void;
}) {
  const { days, today, openEditor, data } = usePlanning();
  const planningItems = useItems();
  return (
    <>
      <div className="calendar-day-selector" aria-label="Choose calendar day">
        {days.map((d, i) => (
          <button
            key={d.isoDate}
            aria-label={`${d.name}, ${dateLabel(d.isoDate, { month: "long", day: "numeric" })}`}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            <span>{d.name}</span>
            <strong>{d.date}</strong>
            {d.isoDate === today && <span className="sr-only">Today</span>}
          </button>
        ))}
      </div>
      <div className="editorial-calendar">
        {days.map((day, i) => {
          const items = planningItems
            .filter((item) =>
              onDay(item, day.isoDate, data.preferences.timeZone),
            )
            .sort((a, b) => (a.start || "z").localeCompare(b.start || "z"));
          return (
            <section
              key={day.isoDate}
              className={`calendar-day ${selected === i ? "chosen-day" : ""} ${day.isoDate === today ? "sample-today" : ""}`}
              aria-label={`${day.name}, ${dateLabel(day.isoDate, { month: "long", day: "numeric" })}`}
            >
              <header>
                <span>{day.name}</span>
                <h3>{day.date}</h3>
                {day.isoDate === today && (
                  <span className="calendar-today-label">Today</span>
                )}
              </header>
              <div className="day-context">
                {`${items.length} ${items.length === 1 ? "plan" : "plans"}`}
              </div>
              <p className="busy-summary">
                {busySummary(
                  planningItems,
                  day.isoDate,
                  data.preferences.timeZone,
                )}
              </p>
              <div className="calendar-items">
                {items.map((item) => (
                  <button
                    key={item.id}
                    data-planning-id={item.id}
                    data-planning-status={item.status}
                    data-planning-date={item.date}
                    data-planning-title={item.title}
                    onClick={() => demo(item)}
                    className={`calendar-entry ${item.kind === "commitment" ? "timed-commitment" : ""} ${item.status === "completed" ? "is-complete" : ""}`}
                  >
                    {item.kind === "commitment" && (
                      <span className="sr-only">Commitment</span>
                    )}
                    <span className="entry-time">
                      {item.start ? (
                        item.detail
                      ) : item.kind === "task" &&
                        item.status === "completed" ? (
                        <>
                          <Check size={12} />
                          Complete
                        </>
                      ) : (
                        "Flexible"
                      )}
                    </span>
                    <span className={`entry-title tone-${item.category.tone}`}>
                      <span className="category-dot" />
                      {item.title}
                    </span>
                    <CategoryLabel item={item} />
                    <DeadlineLabel item={item} />
                    {item.kind === "task" && item.start && (
                      <span className="time-block-label">Time block</span>
                    )}
                    <Priority item={item} />
                  </button>
                ))}
              </div>
              <button
                className="day-add"
                onClick={() => openEditor("task", undefined, day.isoDate)}
                aria-label={`Add a task to ${day.name}`}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </section>
          );
        })}
      </div>
    </>
  );
}
function PlanList({ demo }: { demo: (item: PlanningItem) => void }) {
  const planningItems = useItems();
  const [group, setGroup] = useState("date");
  const groups = new Map<string, PlanningItem[]>();
  const items = planningItems;
  for (const item of items) {
    const label =
      group === "date"
        ? dateLabel(item.date, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })
        : group === "category"
          ? item.category.name
          : group === "priority"
            ? item.priority === "high"
              ? "High priority"
              : item.priority === "low"
                ? "Low priority"
                : "Normal priority"
            : statusLabel(item);
    groups.set(label, [...(groups.get(label) || []), item]);
  }
  return (
    <div className="planning-list">
      <div className="list-toolbar">
        <label>
          Group by
          <select
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            aria-label="Group list by"
          >
            <option value="date">Day</option>
            <option value="category">Category</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </label>
      </div>
      {[...groups].map(([label, entries]) => (
        <section className="list-group" key={label}>
          <h3>
            {label}
            <span>{entries.length}</span>
          </h3>
          {entries.map((item) => (
            <button
              className={`planning-list-row ${item.status === "completed" ? "is-complete" : ""}`}
              key={item.id}
              data-planning-id={item.id}
              data-planning-status={item.status}
              data-planning-date={item.date}
              data-planning-title={item.title}
              onClick={() => demo(item)}
            >
              <span className="list-status" aria-label={statusLabel(item)}>
                <StatusIcon item={item} />
              </span>
              <span className="list-item-copy">
                <strong>{item.title}</strong>
                <span>
                  {group !== "date" && `${dateLabel(item.date)} · `}
                  {item.detail}
                  {item.kind === "commitment" ? " · Commitment" : ""}
                </span>
                <DeadlineLabel item={item} />
              </span>
              <CategoryLabel item={item} />
              <Priority item={item} />
            </button>
          ))}
        </section>
      ))}
    </div>
  );
}
function PlanBoard({ demo }: { demo: (item: PlanningItem) => void }) {
  const planningItems = useItems();
  const [lane, setLane] = useState("open");
  return (
    <>
      <div className="board-lane-selector" aria-label="Choose workflow column">
        {statuses.map((s) => (
          <button
            key={s.id}
            aria-pressed={lane === s.id}
            onClick={() => setLane(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="workflow-board">
        {statuses.map((status) => (
          <section
            key={status.id}
            className={`workflow-lane ${status.id === lane ? "chosen-lane" : ""}`}
          >
            <header>
              <h3>{status.name}</h3>
              <span>
                {planningItems.filter((t) => t.status === status.id).length}
              </span>
            </header>
            <div
              className="workflow-items"
              role="region"
              aria-label={`${status.name} tasks`}
              tabIndex={0}
            >
              {planningItems
                .filter((t) => t.status === status.id)
                .map((item) => (
                  <button
                    key={item.id}
                    className="workflow-card"
                    data-planning-id={item.id}
                    data-planning-status={item.status}
                    data-planning-date={item.date}
                    data-planning-title={item.title}
                    onClick={() => demo(item)}
                  >
                    <CategoryLabel item={item} />
                    <strong>{item.title}</strong>
                    <span className="workflow-date">
                      {dateLabel(item.date)} · {item.detail}
                    </span>
                    <DeadlineLabel item={item} />
                    <Priority item={item} />
                  </button>
                ))}
            </div>
          </section>
        ))}
      </div>
      <section className="board-commitments">
        <h3>Commitments</h3>
        {planningItems
          .filter((item) => item.kind === "commitment")
          .map((item) => (
            <button
              key={item.id}
              data-planning-id={item.id}
              data-planning-status={item.status}
              data-planning-date={item.date}
              data-planning-title={item.title}
              onClick={() => demo(item)}
            >
              <Clock3 size={15} />
              <strong>{item.title}</strong>
              <span>
                {dateLabel(item.date)} · {item.detail}
              </span>
            </button>
          ))}
      </section>
    </>
  );
}
function PlanTimeline({ demo }: { demo: (item: PlanningItem) => void }) {
  const { data, days, openEditor } = usePlanning();
  const milestones = data.milestones;
  const goals = data.goals;
  const planningItems = useItems();
  return (
    <div className="timeline-preview">
      <div className="timeline-layout">
        <div className="timeline-rail">
          {days.map((day) => (
            <section className="timeline-day" key={day.isoDate}>
              <div className="timeline-date">
                <span>{day.name}</span>
                <strong>{day.date}</strong>
                <span>{dateLabel(day.isoDate, { month: "short" })}</span>
              </div>
              <div className="timeline-day-items">
                {planningItems
                  .filter((item) =>
                    onDay(item, day.isoDate, data.preferences.timeZone),
                  )
                  .map((item) => (
                    <button
                      key={item.id}
                      data-planning-id={item.id}
                      data-planning-status={item.status}
                      data-planning-date={item.date}
                      data-planning-title={item.title}
                      onClick={() => demo(item)}
                    >
                      <span
                        className={`timeline-category tone-${item.category.tone}`}
                      >
                        <span className="category-dot" />
                      </span>
                      <span>
                        <strong>{item.title}</strong>
                        <small>
                          {item.detail} · {statusLabel(item)}
                        </small>
                        <DeadlineLabel item={item} />
                      </span>
                      <Priority item={item} />
                    </button>
                  ))}
              </div>
            </section>
          ))}
        </div>
        <aside className="milestone-horizon">
          <h3>Milestones</h3>
          {milestones
            .filter((m) => m.targetDate && m.status !== "completed")
            .map((m) => (
              <button key={m.id} onClick={() => openEditor("milestone", m.id)}>
                <span className="milestone-date">
                  {dateLabel(m.targetDate!)}
                </span>
                <strong>{m.title}</strong>
                <span>{goals.find((g) => g.id === m.goalId)!.title}</span>
                <ArrowUpRight size={15} />
              </button>
            ))}
        </aside>
      </div>
    </div>
  );
}
export default function WeekView() {
  const {
    data,
    planningItems,
    openEditor,
    commit,
    anchor,
    setAnchor,
    today,
    days,
  } = usePlanning();
  const mode = data.preferences.view;
  const setMode = (next: PlanningView) => {
    if (next !== mode)
      commit(
        (d) => {
          d.preferences.view = next;
        },
        "",
        false,
        false,
      );
  };
  const demo = (item: PlanningItem) => openEditor(item.kind, item.id);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [sort, setSort] = useState("date");
  const [range, setRange] = useState("week");
  const rank = { high: 0, normal: 1, low: 2 };
  const filtered = planningItems
    .filter(
      (p) =>
        (!query || p.title.toLowerCase().includes(query.toLowerCase())) &&
        (!category || p.category.id === category) &&
        (!status || p.status === status) &&
        (!priority || p.priority === priority),
    )
    .sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : sort === "priority"
          ? rank[a.priority] - rank[b.priority] || a.date.localeCompare(b.date)
          : sort === "deadline"
            ? (
                (a.kind === "task" ? a.record.dueDate : undefined) || "9999"
              ).localeCompare(
                (b.kind === "task" ? b.record.dueDate : undefined) || "9999",
              )
            : a.date.localeCompare(b.date) ||
              (a.start || "z").localeCompare(b.start || "z"),
    );
  const move = (n: number) => {
    if (range === "month") {
      const d = new Date(anchor + "T12:00:00Z");
      d.setUTCDate(1);
      d.setUTCMonth(d.getUTCMonth() + n);
      setAnchor(d.toISOString().slice(0, 10));
    } else setAnchor(addDays(anchor, n * (range === "day" ? 1 : 7)));
  };
  const [selected, setSelected] = useState(
    new Date(today + "T12:00:00Z").getUTCDay() === 0
      ? 6
      : new Date(today + "T12:00:00Z").getUTCDay() - 1,
  );
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <>
      <div className="planning-toolbar">
        <div className="planning-period">
          <span className="planning-zone">{data.preferences.timeZone}</span>
          <strong>
            {mode === "Calendar" && range === "day"
              ? dateLabel(anchor, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })
              : mode === "Calendar" && range === "month"
                ? dateLabel(anchor, { month: "long", year: "numeric" })
                : `${dateLabel(days[0].isoDate)} — ${dateLabel(days[6].isoDate)}`}
          </strong>
        </div>
        <div
          role="tablist"
          aria-label="Planning view"
          className="view-switcher"
        >
          {modes.map(({ name, icon: Icon }, i) => (
            <button
              ref={(el) => {
                refs.current[i] = el;
              }}
              key={name}
              role="tab"
              id={`planning-tab-${name.toLowerCase()}`}
              aria-controls="planning-view-panel"
              aria-selected={mode === name}
              tabIndex={mode === name ? 0 : -1}
              onClick={() => setMode(name)}
              onKeyDown={(e) => {
                let index = i;
                if (e.key === "ArrowRight") index = (i + 1) % modes.length;
                else if (e.key === "ArrowLeft")
                  index = (i + modes.length - 1) % modes.length;
                else if (e.key === "Home") index = 0;
                else if (e.key === "End") index = modes.length - 1;
                else return;
                e.preventDefault();
                setMode(modes[index].name);
                refs.current[index]?.focus();
              }}
            >
              <Icon size={16} />
              <span>{name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="planning-search">
        <label>
          Find a plan
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles"
          />
        </label>
      </div>
      <details className="planning-filter-disclosure">
        <summary>
          Filter & sort{" "}
          <span>
            {[category, status, priority].filter(Boolean).length
              ? `${[category, status, priority].filter(Boolean).length} active`
              : ""}
          </span>
        </summary>
        <div className="planning-filters">
          <label>
            Category
            <select
              aria-label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">All categories</option>
              {data.categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select
              aria-label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="open">To do</option>
              <option value="in-progress">In progress</option>
              <option value="completed">Completed</option>
              <option value="scheduled">Commitments</option>
            </select>
          </label>
          <label>
            Priority
            <select
              aria-label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="">All priorities</option>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            Sort plans
            <select
              aria-label="Sort plans"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="date">Planned day</option>
              <option value="deadline">Deadline</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
          </label>
        </div>
      </details>
      <div className="period-navigation">
        <div className="data-actions">
          <button className="text-link" onClick={() => move(-1)}>
            Previous {range}
          </button>
          <button className="text-link" onClick={() => setAnchor(today)}>
            Today
          </button>
          <button className="text-link" onClick={() => move(1)}>
            Next {range}
          </button>
        </div>
        <div className="data-actions">
          {mode === "Calendar" && (
            <label className="range-label">
              Calendar span
              <select
                aria-label="Calendar span"
                value={range}
                onChange={(e) => setRange(e.target.value)}
              >
                <option value="day">Day</option>
                <option value="week">Week</option>
                <option value="month">Month</option>
              </select>
            </label>
          )}
          <button
            className="text-link"
            onClick={() => openEditor("commitment", undefined, anchor)}
          >
            <Plus size={15} />
            Commitment
          </button>
        </div>
      </div>
      <ItemsContext.Provider value={filtered}>
        <section
          id="planning-view-panel"
          role="tabpanel"
          aria-labelledby={`planning-tab-${mode.toLowerCase()}`}
          tabIndex={0}
          className="planning-panel"
        >
          {mode === "Calendar" ? (
            range === "month" ? (
              <MonthCalendar
                anchor={anchor}
                items={filtered}
                choose={(date) => {
                  setAnchor(date);
                  setRange("day");
                }}
              />
            ) : range === "day" ? (
              <DayCalendar date={anchor} items={filtered} />
            ) : (
              <WeekCalendar
                selected={selected}
                setSelected={setSelected}
                demo={demo}
              />
            )
          ) : mode === "List" ? (
            <PlanList demo={demo} />
          ) : mode === "Board" ? (
            <PlanBoard demo={demo} />
          ) : (
            <PlanTimeline demo={demo} />
          )}
        </section>
        {(mode === "Calendar" || mode === "Timeline") &&
          filtered.some((p) => !p.date) && (
            <section className="unscheduled-plans">
              <h3>Unscheduled</h3>
              {filtered
                .filter((p) => !p.date)
                .map((item) => (
                  <button
                    className="text-link"
                    key={item.id}
                    data-planning-id={item.id}
                    onClick={() => demo(item)}
                  >
                    {item.title}
                    {item.kind === "task" && item.record.dueDate
                      ? ` · Due ${dateLabel(item.record.dueDate)}`
                      : ""}
                  </button>
                ))}
            </section>
          )}
        {!filtered.length && (
          <p className="empty-state">
            No plans match. Try another filter, or add a plan.
          </p>
        )}
      </ItemsContext.Provider>
    </>
  );
}

function MonthCalendar({
  anchor,
  items,
  choose,
}: {
  anchor: string;
  items: PlanningItem[];
  choose: (date: string) => void;
}) {
  const { data, today } = usePlanning();
  const first = anchor.slice(0, 7) + "-01";
  const weekday = new Date(first + "T12:00:00Z").getUTCDay();
  const start = addDays(first, -(weekday === 0 ? 6 : weekday - 1));
  return (
    <>
      <div className="month-calendar">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <span className="month-weekday" key={day} aria-hidden="true">
            {day}
          </span>
        ))}
        {Array.from({ length: 42 }, (_, i) => {
          const date = addDays(start, i);
          const plans = items.filter((p) =>
            onDay(p, date, data.preferences.timeZone),
          );
          return (
            <button
              key={date}
              className={`${date === today ? "month-today" : ""} ${date.slice(0, 7) !== anchor.slice(0, 7) ? "outside-month" : ""}`}
              aria-label={`${dateLabel(date, { weekday: "long", month: "long", day: "numeric" })}, ${plans.length} ${plans.length === 1 ? "plan" : "plans"}`}
              onClick={() => choose(date)}
            >
              <strong>{Number(date.slice(8))}</strong>
              <small>
                {plans.length
                  ? `${plans.length} ${plans.length === 1 ? "plan" : "plans"}`
                  : "Open"}
              </small>
              {plans.slice(0, 2).map((p) => (
                <span
                  className={`month-plan tone-${p.category.tone}`}
                  key={p.id}
                >
                  <span className="category-dot" />
                  {p.title}
                </span>
              ))}
            </button>
          );
        })}
      </div>
    </>
  );
}
function DayCalendar({ date, items }: { date: string; items: PlanningItem[] }) {
  const { data, openEditor } = usePlanning();
  const plans = items.filter((p) => onDay(p, date, data.preferences.timeZone));
  return (
    <section className="day-calendar">
      <header>
        <h2 className="sr-only">Daily agenda</h2>
        <p className="busy-summary">
          {busySummary(items, date, data.preferences.timeZone)}
        </p>
      </header>
      <DayAvailability date={date} items={plans} />
      {plans.map((item) => (
        <button
          className="planning-list-row"
          key={item.id}
          data-planning-id={item.id}
          onClick={() => openEditor(item.kind, item.id)}
        >
          <span className="list-item-copy">
            <strong>{item.title}</strong>
            <span>
              {item.detail} · {statusLabel(item)}
            </span>
            <DeadlineLabel item={item} />
          </span>
          <CategoryLabel item={item} />
        </button>
      ))}
      {!plans.length && (
        <p className="empty-state">A little room in your day.</p>
      )}
      <button
        className="text-link"
        onClick={() => openEditor("task", undefined, date)}
      >
        Add task or time block
      </button>
    </section>
  );
}

function DayAvailability({
  date,
  items,
}: {
  date: string;
  items: PlanningItem[];
}) {
  const { data } = usePlanning();
  const zone = data.preferences.timeZone;
  return (
    <figure className="day-availability">
      <figcaption>
        Time at a glance{" "}
        <span>Two-hour windows · flexible tasks stay outside the blocks</span>
      </figcaption>
      <div>
        {Array.from({ length: 12 }, (_, i) => {
          const hour = String(i * 2).padStart(2, "0");
          let busy: PlanningItem[] = [];
          try {
            const start = zonedInstant(date, `${hour}:00`, zone),
              end =
                i === 11
                  ? zonedInstant(addDays(date, 1), "00:00", zone)
                  : zonedInstant(
                      date,
                      `${String(i * 2 + 2).padStart(2, "0")}:00`,
                      zone,
                    );
            busy = items.filter(
              (p) => p.start && p.start < end && planEnd(p)! > start,
            );
          } catch {
            /* A skipped clock-change window has no local time. */
          }
          return (
            <div
              key={hour}
              className={
                busy.length ? `occupied tone-${busy[0].category.tone}` : ""
              }
              title={busy.map((p) => p.title).join(", ")}
            >
              <span>{hour}:00</span>
              <strong>{busy.length ? "Busy" : "Open"}</strong>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
