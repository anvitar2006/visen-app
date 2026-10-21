"use client";
import { ArrowUpRight } from "lucide-react";
import ProgressBar from "@/components/ui/progress-bar";
import SectionHeader from "@/components/ui/section-header";
import { usePlanning, setCompleted } from "@/features/planning/store";
import { dateLabel } from "@/domain/dates";
export default function VisionView() {
  const { data, goals, openEditor, commit, today } = usePlanning();
  return (
    <>
      <section className="vision-editorial">
        <div className="vision-letter">
          <h2>Your vision</h2>
          {data.preferences.vision && <p>{data.preferences.vision}</p>}
          <button className="text-link" onClick={() => openEditor("settings")}>
            {data.preferences.vision ? "Edit vision" : "Add your vision"}
          </button>
        </div>
        <figure>
          <img
            src="/images/ritual.jpg"
            alt="An open notebook beside a plant, pencil and glasses on a softly lit desk"
          />
        </figure>
      </section>
      <SectionHeader className="vision-section-heading" title="Goals" />
      {!goals.length && (
        <p className="empty-state">
          No goals yet. Start with something you want to work toward.
        </p>
      )}
      <div className="vision-directions">
        {goals.map((goal, i) => (
          <article className="vision-direction" key={goal.id}>
            <span className="direction-number">0{i + 1}</span>
            <div className="direction-copy">
              <span className={`category-label tone-${goal.color}`}>
                <span className="category-dot" />
                {goal.category}
              </span>
              <h2>
                <button
                  className="inline-title"
                  onClick={() => openEditor("goal", goal.id)}
                >
                  {goal.title}
                </button>
              </h2>
              <p>{goal.detail}</p>
              <p className="goal-meta">
                {goal.status}
                {goal.targetDate
                  ? ` · Target ${dateLabel(goal.targetDate)}`
                  : ""}
              </p>
              <details className="goal-milestones">
                <summary>Milestones & linked tasks</summary>
                {goal.milestones.map((m) => (
                  <div key={m.id}>
                    <input
                      type="checkbox"
                      aria-label={`Complete milestone ${m.title}`}
                      checked={m.status === "completed"}
                      onChange={() =>
                        commit((d) => {
                          const ms = d.milestones.find((x) => x.id === m.id)!;
                          ms.status =
                            ms.status === "completed" ? "open" : "completed";
                          ms.updatedAt = new Date().toISOString();
                          setCompleted(
                            d,
                            { type: "milestone", id: m.id },
                            ms.status === "completed",
                            today,
                          );
                        }, "Milestone updated")
                      }
                    />
                    <button
                      className="text-link"
                      onClick={() => openEditor("milestone", m.id)}
                    >
                      {m.title}
                      {m.targetDate ? ` · ${dateLabel(m.targetDate)}` : ""}
                    </button>
                  </div>
                ))}
                <button
                  className="text-link"
                  onClick={() =>
                    openEditor("milestone", undefined, undefined, goal.id)
                  }
                >
                  Add milestone
                </button>
                {data.tasks
                  .filter((t) => t.goalId === goal.id)
                  .map((t) => (
                    <button
                      className="text-link linked-task"
                      key={t.id}
                      onClick={() => openEditor("task", t.id)}
                    >
                      {t.title} · {t.status}
                    </button>
                  ))}
                <button
                  className="text-link"
                  onClick={() =>
                    openEditor("task", undefined, undefined, goal.id)
                  }
                >
                  Add linked task
                </button>
              </details>
            </div>
            <div className={`direction-progress tone-${goal.color}`}>
              <div>
                <span>{goal.steps}</span>
                <strong>{goal.progress}%</strong>
              </div>
              <ProgressBar
                value={goal.progress}
                label={`${goal.title}: progress`}
              />
              <span className="next-step-label">Next milestone</span>
              <button onClick={() => openEditor("goal", goal.id)}>
                {goal.milestone}
                <ArrowUpRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
