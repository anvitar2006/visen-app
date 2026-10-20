"use client";
import { BookOpen, Leaf, Sun } from "lucide-react";
import PreviewCompletion from "@/components/ui/preview-completion";
import { days, habits } from "@/domain/sample";
export default function HabitsView({ demo }: { demo: () => void }) {
  return (
    <>
      <section className="habit-introduction">
        <div className="habit-intro-mark">
          <Leaf size={26} strokeWidth={1} />
        </div>
        <div>
          <p className="eyebrow">CONSISTENCY, WITH KINDNESS</p>
          <h2>A rhythm you can return to.</h2>
          <p>
            Some days will look different. There’s no perfect streak to protect.
          </p>
        </div>
        <span className="habit-week-label">
          THIS WEEK
          <br />
          <strong>October 19 — 25</strong>
        </span>
      </section>
      <div className="habit-table">
        <div className="habit-table-head">
          <span>YOUR RITUALS</span>
          <div className="habit-days">
            {days.map((d) => (
              <span key={d.name}>
                {d.name[0]}
                <small>{d.date}</small>
              </span>
            ))}
          </div>
          <span>THIS WEEK</span>
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
                <h3>{habit.name}</h3>
                <p>{habit.detail}</p>
              </div>
            </div>
            <div className="habit-days">
              {habit.days.map((done, j) => (
                <PreviewCompletion
                  key={j}
                  variant="day"
                  completed={done}
                  onPreview={demo}
                  label={`${habit.name}, ${days[j].name}, ${done ? "completed" : "not completed"} in sample`}
                >
                  <b className="habit-day-label" aria-hidden="true">
                    {days[j].name[0]}
                  </b>
                </PreviewCompletion>
              ))}
            </div>
            <span className="habit-total">
              {habit.count}
              <small>moments</small>
            </span>
          </div>
        ))}
      </div>
      <div className="habit-kindness">
        <span className="eyebrow">A GENTLE REMINDER</span>
        <p>
          A five-minute walk counts.
          <br />
          So does starting again.
        </p>
        <span>
          Keep what supports you.
          <br />
          Let the rest be flexible.
        </span>
      </div>
    </>
  );
}
