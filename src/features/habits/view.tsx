"use client";

import { BookOpen, Check, Leaf, Plus, Sun } from "lucide-react";

import { days, habits } from "@/domain/sample";
export default function HabitsView({ demo }: { demo: () => void }) {
  return (
    <>
      <section className="habits-intro">
        <div>
          <span className="eyebrow">CONSISTENCY, WITH KINDNESS</span>
          <h2>
            A rhythm, <em>not a race.</em>
          </h2>
          <p>
            Some weeks will look different. What matters is coming back to what
            feels good.
          </p>
        </div>
        <div className="habit-stat">
          <strong>4</strong>
          <span>
            small moments
            <br />
            for yourself this week
          </span>
        </div>
      </section>
      <div className="habit-table">
        <div className="habit-table-head">
          <span>YOUR RITUALS</span>
          <div className="habit-days">
            {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
              <span key={i}>
                {d}
                <small>{19 + i}</small>
              </span>
            ))}
          </div>
          <span>THIS WEEK</span>
        </div>
        {habits.map((h, i) => (
          <div className="habit-table-row" key={h.name}>
            <div className="habit-name">
              <span
                className={`habit-icon ${i === 0 ? "sage" : i === 1 ? "sand" : "rose"}`}
              >
                {i === 0 ? (
                  <Leaf size={22} />
                ) : i === 1 ? (
                  <BookOpen size={22} />
                ) : (
                  <Sun size={22} />
                )}
              </span>
              <div>
                <h3>{h.name}</h3>
                <p>{h.detail}</p>
              </div>
            </div>
            <div className="habit-days">
              {h.days.map((done, j) => (
                <button
                  className={`habit-day ${done ? "done" : ""}`}
                  key={j}
                  onClick={demo}
                  aria-label={`${h.name}, ${days[j].name}, ${done ? "completed" : "not completed"} in sample`}
                >
                  <b className="habit-day-label" aria-hidden="true">
                    {days[j].name[0]}
                  </b>
                  {done ? <Check size={15} /> : <span />}
                </button>
              ))}
            </div>
            <span className="habit-total">
              {h.count}
              <small>moments</small>
            </span>
          </div>
        ))}
      </div>
      <div className="week-bottom">
        <div>
          <h2>Make it your own.</h2>
          <p className="subtle">
            A five-minute walk counts. So does starting again.
          </p>
        </div>
        <button className="outline-button" onClick={demo}>
          <Plus size={16} />
          New habit
        </button>
      </div>
    </>
  );
}
