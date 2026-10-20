"use client";
import { useRef, useState } from "react";
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
import type { View } from "@/components/navigation";
import {
  categoryFor,
  dateLabel,
  days,
  planningItems,
  type PlanningItem,
} from "@/domain/sample";
import { sampleGoals, sampleMilestones } from "@/domain/sample-planning";
import type { Milestone } from "@/domain/planning";
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
function CalendarPreview({
  selected,
  setSelected,
  demo,
}: {
  selected: number;
  setSelected: (day: number) => void;
  demo: () => void;
}) {
  return (
    <>
      <div className="calendar-day-selector" aria-label="Choose calendar day">
        {days.map((d, i) => (
          <button
            key={d.isoDate}
            aria-label={`${d.name}, October ${d.date}`}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            <span>{d.name}</span>
            <strong>{d.date}</strong>
            {i === 1 && <span className="sr-only">Sample today</span>}
          </button>
        ))}
      </div>
      <div className="editorial-calendar">
        {days.map((day, i) => {
          const items = planningItems
            .filter((item) => item.date === day.isoDate)
            .sort((a, b) => (a.start || "z").localeCompare(b.start || "z"));
          return (
            <section
              key={day.isoDate}
              className={`calendar-day ${selected === i ? "chosen-day" : ""} ${i === 1 ? "sample-today" : ""}`}
              aria-label={`${day.name}, October ${day.date}`}
            >
              <header>
                <span>{day.name}</span>
                <h3>{day.date}</h3>
                {i === 1 && <span className="calendar-today-label">Today</span>}
              </header>
              <div className="day-context">
                {day.note ||
                  `${items.length} ${items.length === 1 ? "plan" : "plans"}`}
              </div>
              <div className="calendar-items">
                {items.map((item) => (
                  <button
                    key={item.id}
                    data-planning-id={item.id}
                    data-planning-status={item.status}
                    data-planning-date={item.date}
                    data-planning-title={item.title}
                    onClick={demo}
                    className={`calendar-entry ${item.kind === "commitment" ? "timed-commitment" : ""} ${item.status === "completed" ? "is-complete" : ""}`}
                  >
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
                onClick={demo}
                aria-label={`Preview adding a plan to ${day.name}`}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </section>
          );
        })}
      </div>
      <p className="planning-footnote">
        <span className="commitment-key" />
        Timed commitments have a fine border. Flexible tasks leave room between
        plans.
      </p>
    </>
  );
}
function ListPreview({ demo }: { demo: () => void }) {
  const [group, setGroup] = useState("date");
  const groups = new Map<string, PlanningItem[]>();
  const items = [...planningItems].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      (a.start || "z").localeCompare(b.start || "z"),
  );
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
        <p>Everything has a place. Take it one thing at a time.</p>
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
              onClick={demo}
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
function BoardPreview({ demo }: { demo: () => void }) {
  const [lane, setLane] = useState("open");
  return (
    <>
      <p className="board-intro">
        A little perspective on what’s ahead, what’s underway, and what’s done.
      </p>
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
                    onClick={demo}
                  >
                    <CategoryLabel item={item} />
                    <strong>{item.title}</strong>
                    <span className="workflow-date">
                      {dateLabel(item.date)} · {item.detail}
                    </span>
                    <DeadlineLabel item={item} />
                    <Priority item={item} />
                    {item.status === "completed" && (
                      <span className="completed-note">
                        <Check size={13} />A step taken
                      </span>
                    )}
                  </button>
                ))}
            </div>
          </section>
        ))}
      </div>
      <section className="board-commitments">
        <h3>
          Already on the calendar{" "}
          <span>Commitments keep their scheduled times.</span>
        </h3>
        {planningItems
          .filter((item) => item.kind === "commitment")
          .map((item) => (
            <button
              key={item.id}
              data-planning-id={item.id}
              data-planning-status={item.status}
              data-planning-date={item.date}
              data-planning-title={item.title}
              onClick={demo}
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
function TimelinePreview({ demo }: { demo: () => void }) {
  const milestones: readonly Milestone[] = sampleMilestones;
  return (
    <div className="timeline-preview">
      <div className="timeline-introduction">
        <p className="eyebrow">THE EVERYDAY, CONNECTED</p>
        <h2>Small steps. A longer view.</h2>
        <p>
          See this week’s plans alongside the milestones they’re moving toward.
        </p>
      </div>
      <div className="timeline-layout">
        <div className="timeline-rail">
          {days.map((day) => (
            <section className="timeline-day" key={day.isoDate}>
              <div className="timeline-date">
                <span>{day.name}</span>
                <strong>{day.date}</strong>
                <span>OCT</span>
              </div>
              <div className="timeline-day-items">
                {planningItems
                  .filter((item) => item.date === day.isoDate)
                  .map((item) => (
                    <button
                      key={item.id}
                      data-planning-id={item.id}
                      data-planning-status={item.status}
                      data-planning-date={item.date}
                      data-planning-title={item.title}
                      onClick={demo}
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
          <p className="eyebrow">ON THE HORIZON</p>
          <h3>What this is leading to</h3>
          {milestones
            .filter((m) => m.targetDate && m.status !== "completed")
            .map((m) => (
              <button key={m.id} onClick={demo}>
                <span className="milestone-date">
                  {dateLabel(m.targetDate!)}
                </span>
                <strong>{m.title}</strong>
                <span>{sampleGoals.find((g) => g.id === m.goalId)!.title}</span>
                <ArrowUpRight size={15} />
              </button>
            ))}
          <p>Illustrative target dates. Your pace is personal.</p>
        </aside>
      </div>
    </div>
  );
}
export default function WeekView({
  demo,
  navigate,
}: {
  demo: () => void;
  navigate: (view: View) => void;
}) {
  const [mode, setMode] = useState<PlanningView>("Calendar");
  const [selected, setSelected] = useState(1);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <>
      <div className="planning-toolbar">
        <div className="planning-period">
          <span className="eyebrow">THIS WEEK</span>
          <strong>October 19 — 25</strong>
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
      <div className="planning-view-description">
        <p>
          <span className="intention-dot" />
          This week’s intention:{" "}
          <strong>Make progress. Protect my peace.</strong>
        </p>
        <span className="preview-tag">Sample plans · Read-only</span>
      </div>
      <section
        id="planning-view-panel"
        role="tabpanel"
        aria-labelledby={`planning-tab-${mode.toLowerCase()}`}
        tabIndex={0}
        className="planning-panel"
      >
        {mode === "Calendar" ? (
          <CalendarPreview
            selected={selected}
            setSelected={setSelected}
            demo={demo}
          />
        ) : mode === "List" ? (
          <ListPreview demo={demo} />
        ) : mode === "Board" ? (
          <BoardPreview demo={demo} />
        ) : (
          <TimelinePreview demo={demo} />
        )}
      </section>
      <div className="planning-endnote">
        <p>You can leave a little room for the unexpected.</p>
        <button className="text-link" onClick={() => navigate("Sana")}>
          Think it through with Sana
          <ArrowUpRight size={16} />
        </button>
      </div>
    </>
  );
}
