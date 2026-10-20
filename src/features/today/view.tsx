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
import {
  categoryFor,
  todayTasks,
  todayPriorities,
  todayUpcomingItems,
  todayHabits,
  timeLabel,
} from "@/domain/sample";
export default function TodayView({
  demo,
  navigate,
}: {
  demo: () => void;
  navigate: (view: View) => void;
}) {
  return (
    <>
      <section className="today-intention" aria-label="Daily intention">
        <span className="eyebrow">A LITTLE INTENTION</span>
        <p>A little focus. A little room for yourself.</p>
      </section>
      <div className="today-layout">
        <div className="today-focus">
          <SectionHeader
            title="Three things, thoughtfully chosen."
            eyebrow="YOUR PRIORITIES"
            accessory={<span className="quiet-label">01 / 03 complete</span>}
          />
          <div className="priorities-list">
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
                    label={`${task.status === "completed" ? "Completed" : "Preview completion for"} ${task.title}`}
                    onPreview={demo}
                  />
                  <div className="priority-copy">
                    <h3>{task.title}</h3>
                    <div>
                      <span className={`category-label tone-${category.tone}`}>
                        <span className="category-dot" />
                        {category.name}
                      </span>
                      <span className="detail-dot">·</span>
                      <span>{task.estimatedMinutes} min</span>
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
          <button className="quiet-add" onClick={demo}>
            <Plus size={16} />
            Add a little intention
          </button>
          <details className="today-task-details">
            <summary>
              <span>
                All of today’s tasks{" "}
                <small>
                  {todayTasks.length} plans, including your priorities
                </small>
              </span>
              <ChevronDown size={17} />
            </summary>
            <div>
              {todayTasks.map((task) => (
                <button key={task.id} onClick={demo}>
                  <span>
                    {task.status === "completed" ? (
                      <Check size={15} />
                    ) : (
                      <span className="small-open-circle" />
                    )}
                  </span>
                  <strong>{task.title}</strong>
                  <span>{task.estimatedMinutes} min</span>
                </button>
              ))}
            </div>
          </details>
        </div>
        <aside
          className="today-guidance"
          aria-label="Sana guidance and upcoming commitments"
        >
          <section className="sana-note">
            <div className="sana-note-heading">
              <SanaMark />
              <div>
                <h2>A little perspective</h2>
                <span>FROM SANA · SAMPLE NOTE</span>
              </div>
            </div>
            <p>
              Your portfolio deserves a little focus this morning. After that,
              let the day have some breathing room.
            </p>
            <button className="text-link" onClick={() => navigate("Sana")}>
              Make room to think <ArrowUpRight size={16} />
            </button>
          </section>
          <section className="upcoming">
            <SectionHeader
              title="A few things ahead"
              accessory={
                <button className="text-link" onClick={() => navigate("Week")}>
                  Your week
                  <ArrowRight size={15} />
                </button>
              }
            />
            {todayUpcomingItems.map((item) => (
              <div className="today-appointment" key={item.id}>
                <time>
                  {timeLabel(item.start!).replace(/ (AM|PM)/, "")}{" "}
                  <span>
                    {timeLabel(item.start!).endsWith("AM") ? "AM" : "PM"}
                  </span>
                </time>
                <div>
                  <h3>{item.title}</h3>
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
            <span className="eyebrow">SUPPORTING YOUR DAY</span>
            <strong>Your small rituals</strong>
            <small>Movement, a few pages, a moment to pause.</small>
          </span>
          <span className="disclosure-action">
            Take a look
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
                label={`${h.name}: ${h.done ? "sample complete" : "sample incomplete"}`}
                onPreview={demo}
              />
            </div>
          ))}
        </div>
      </details>
    </>
  );
}
