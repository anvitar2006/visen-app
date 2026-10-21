"use client";
import { BookOpen, Leaf, Sun } from "lucide-react";
import PreviewCompletion from "@/components/ui/preview-completion";
import { usePlanning } from "@/features/planning/store";
import { dateLabel } from "@/domain/dates";
export default function HabitsView() {
  const { days, habits, toggleHabit, openEditor, today, shiftWeek } =
    usePlanning();
  return (
    <>
      <div className="period-navigation habit-period">
        <span>
          {dateLabel(days[0].isoDate)} — {dateLabel(days[6].isoDate)}
        </span>
        <div className="data-actions">
          <button className="text-link" onClick={() => shiftWeek(-1)}>
            Previous week
          </button>
          <button className="text-link" onClick={() => shiftWeek(1)}>
            Next week
          </button>
        </div>
      </div>
      {!habits.length && (
        <p className="empty-state">No habits yet. Add one to get started.</p>
      )}
      <div className="habit-table">
        <div className="habit-table-head">
          <span>HABITS</span>
          <div className="habit-days">
            {days.map((d) => (
              <span key={d.name}>
                {d.name[0]}
                <small>{d.date}</small>
              </span>
            ))}
          </div>
          <span>PROGRESS</span>
        </div>
        {habits.map((habit, i) => (
          <div className="habit-table-row" key={habit.id}>
            <div className="habit-name">
              <span className={`habit-icon tone-${habit.color}`}>
                {i === 0 ? (
                  <Leaf size={22} />
                ) : i === 1 ? (
                  <BookOpen size={22} />
                ) : (
                  <Sun size={22} />
                )}
              </span>
              <div>
                <h3>
                  <button
                    className="inline-title"
                    onClick={() => openEditor("habit", habit.id)}
                  >
                    {habit.name}
                  </button>
                </h3>
                <p>
                  {habit.detail}
                  {habit.status === "paused" ? " · Paused" : ""}
                </p>
              </div>
            </div>
            <div className="habit-days">
              {habit.days.map((done, j) => (
                <PreviewCompletion
                  key={j}
                  variant="day"
                  completed={done}
                  onPreview={() => toggleHabit(habit.id, days[j].isoDate)}
                  disabled={
                    days[j].isoDate > today || habit.status === "paused"
                  }
                  label={`${habit.name}, ${days[j].name}, ${done ? "completed" : "not completed"}`}
                >
                  <b className="habit-day-label" aria-hidden="true">
                    {days[j].name[0]}
                  </b>
                </PreviewCompletion>
              ))}
            </div>
            <span className="habit-total">
              {habit.count}
              <small>days</small>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
