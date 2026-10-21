"use client";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Flag,
  Plus,
} from "lucide-react";
import type { View } from "@/components/navigation";
import SanaMark from "@/components/sana-mark";
import PreviewCompletion from "@/components/ui/preview-completion";
import SectionHeader from "@/components/ui/section-header";
import { usePlanning } from "@/features/planning/store";
import { dateLabel } from "@/domain/dates";
export default function TodayView({
  navigate,
}: {
  navigate: (view: View) => void;
}) {
  const {
    data,
    categoryFor,
    todayTasks,
    todayPriorities,
    todayUpcomingItems,
    todayHabits,
    timeLabel,
    toggleTask,
    toggleHabit,
    openEditor,
    today,
  } = usePlanning();
  const deadlines = data.tasks
    .filter((t) => t.status !== "completed" && t.dueDate && t.dueDate <= today)
    .sort((a, b) => a.dueDate!.localeCompare(b.dueDate!));
  return (
    <>
      <div className="today-layout">
        <div className="today-focus">
          <SectionHeader
            title="Priorities"
            accessory={
              <span className="quiet-label">
                {todayTasks.filter((t) => t.status === "completed").length} /{" "}
                {todayTasks.length} complete
              </span>
            }
          />
          <div className="priorities-list">
            {!todayPriorities.length && (
              <p className="empty-state">Nothing planned for today.</p>
            )}
            {todayPriorities.map((task, i) => {
              const category = categoryFor(task.categoryId);
              return (
                <div
                  key={task.id}
                  className={`priority-row ${task.status === "completed" ? "is-complete" : ""}`}
                >
                  <span className="priority-index">0{i + 1}</span>
                  <PreviewCompletion
                    completed={task.status === "completed"}
                    label={`${task.status === "completed" ? "Completed" : "Complete"} ${task.title}`}
                    onPreview={() => toggleTask(task.id)}
                  />
                  <div className="priority-copy">
                    <h3>
                      <button
                        className="inline-title"
                        onClick={() => openEditor("task", task.id)}
                      >
                        {task.title}
                      </button>
                    </h3>
                    <div>
                      <span className={`category-label tone-${category.tone}`}>
                        <span className="category-dot" />
                        {category.name}
                      </span>
                      <span className="detail-dot">·</span>
                      <span>
                        {task.estimatedMinutes
                          ? `${task.estimatedMinutes} min`
                          : "Flexible"}
                      </span>
                      {task.priority === "high" && (
                        <span className="priority-label">
                          <Flag size={12} />
                          High priority
                        </span>
                      )}
                    </div>
                  </div>
                  {task.status === "in-progress" && (
                    <span className="status-text">In progress</span>
                  )}
                </div>
              );
            })}
          </div>
          <button className="quiet-add" onClick={() => openEditor("task")}>
            <Plus size={16} />
            Add task
          </button>
          <details className="today-task-details">
            <summary>
              <span>
                All tasks <small>{todayTasks.length} tasks</small>
              </span>
              <ChevronDown size={17} />
            </summary>
            <div>
              {todayTasks.map((task) => (
                <button
                  key={task.id}
                  onClick={() => openEditor("task", task.id)}
                >
                  <span>
                    {task.status === "completed" ? (
                      <Check size={15} />
                    ) : (
                      <span className="small-open-circle" />
                    )}
                  </span>
                  <strong>{task.title}</strong>
                  <span>
                    {task.estimatedMinutes
                      ? `${task.estimatedMinutes} min`
                      : "Flexible"}
                  </span>
                </button>
              ))}
            </div>
          </details>
          {deadlines.length > 0 && (
            <details className="today-task-details">
              <summary>
                <span>
                  Deadlines <small>{deadlines.length} due or overdue</small>
                </span>
                <ChevronDown size={17} />
              </summary>
              <div>
                {deadlines.map((t) => (
                  <button key={t.id} onClick={() => openEditor("task", t.id)}>
                    <strong>{t.title}</strong>
                    <span>
                      {t.dueDate === today
                        ? "Due today"
                        : `Overdue · ${dateLabel(t.dueDate!)}`}
                    </span>
                  </button>
                ))}
              </div>
            </details>
          )}
        </div>
        <aside
          className="today-guidance"
          aria-label="Sana guidance and upcoming commitments"
        >
          <section className="sana-note">
            <div className="sana-note-heading">
              <SanaMark />
              <div>
                <h2>Sana</h2>
                <span>Scripted preview</span>
              </div>
            </div>
            <p>Leave a little room for yourself.</p>
            <button className="text-link" onClick={() => navigate("Sana")}>
              Open Sana <ArrowUpRight size={16} />
            </button>
          </section>
          <section className="upcoming">
            <SectionHeader
              title="Upcoming"
              accessory={
                <button className="text-link" onClick={() => navigate("Week")}>
                  Your week
                  <ArrowRight size={15} />
                </button>
              }
            />
            {!todayUpcomingItems.length && (
              <p className="empty-state">No more timed plans today.</p>
            )}
            {todayUpcomingItems.map((item) => (
              <div className="today-appointment" key={item.id}>
                <time>
                  {timeLabel(item.start!).replace(/ (AM|PM)/, "")}{" "}
                  <span>
                    {timeLabel(item.start!).endsWith("AM") ? "AM" : "PM"}
                  </span>
                </time>
                <div>
                  <h3>
                    <button
                      className="inline-title"
                      onClick={() => openEditor(item.kind, item.id)}
                    >
                      {item.title}
                    </button>
                  </h3>
                  <p>
                    <span
                      className={`category-label tone-${item.category.tone}`}
                    >
                      <span className="category-dot" />
                      {item.category.name}
                    </span>{" "}
                    ·{" "}
                    {item.kind === "commitment"
                      ? "Commitment"
                      : `${item.record.estimatedMinutes} min`}
                  </p>
                </div>
              </div>
            ))}
          </section>
        </aside>
      </div>
      <details className="rituals-disclosure">
        <summary>
          <span>
            <strong>Daily habits</strong>
          </span>
          <span className="disclosure-action">
            <ChevronDown size={17} />
          </span>
        </summary>
        <div className="today-rituals">
          {todayHabits.map((h) => (
            <div key={h.id}>
              <span className={`category-dot tone-${h.color}`} />
              <span>{h.name}</span>
              <PreviewCompletion
                completed={h.done}
                label={`${h.name}: ${h.done ? "completed" : "not completed"}`}
                onPreview={() => toggleHabit(h.id, today)}
              />
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
