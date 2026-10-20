"use client";
import { useState } from "react";
import { ArrowUpRight, Leaf, Plus } from "lucide-react";

import { days, weekItemDetails, type View } from "@/domain/sample";
export default function WeekView({
  demo,
  navigate,
}: {
  demo: () => void;
  navigate: (view: View) => void;
}) {
  const [selected, setSelected] = useState(1);
  return (
    <>
      <div className="week-toolbar">
        <div className="week-focus">
          <Leaf size={20} />
          <span>
            This week’s intention{" "}
            <strong>Make progress. Protect my peace.</strong>
          </span>
        </div>
        <span className="week-date">
          19 — 25 OCT <span>MON–SUN</span>
        </span>
      </div>
      <div className="week-strip" aria-label="Choose day">
        {days.map((d, i) => (
          <button
            key={d.name}
            className={selected === i ? "selected" : ""}
            onClick={() => setSelected(i)}
            aria-pressed={selected === i}
          >
            <span>{d.name}</span>
            <strong>{d.date}</strong>
            <span className="day-dot" />
          </button>
        ))}
      </div>
      <div className="week-board">
        {days.map((d, i) => (
          <section
            key={d.name}
            className={`day-column ${i === selected ? "selected-day" : ""}`}
          >
            <div className="day-heading">
              <span>{d.name}</span>
              <strong>{d.date}</strong>
              {i === 1 && <span className="today-label">TODAY</span>}
            </div>
            <p className={`day-load ${i === 3 ? "fuller" : ""}`}>{d.load}</p>
            {d.items.map((t) => (
              <button
                className={`week-task ${weekItemDetails[t].color}`}
                key={t}
                onClick={demo}
              >
                <span className="week-task-category">
                  {weekItemDetails[t].category}
                </span>
                <strong>{t}</strong>
                <span className="week-task-detail">
                  {weekItemDetails[t].detail}
                </span>
              </button>
            ))}
            <button
              className="day-add"
              aria-label={`Add to ${d.name}`}
              onClick={demo}
            >
              <Plus size={16} />
            </button>
          </section>
        ))}
      </div>
      <div className="week-bottom">
        <div>
          <span className="eyebrow">LEAVE SOME ROOM</span>
          <h2>Life happens between the plans.</h2>
          <p className="subtle">
            Thursday looks a little full. Keep some space for the unexpected.
          </p>
        </div>
        <button className="text-link" onClick={() => navigate("Sana")}>
          Think it through with Sana <ArrowUpRight size={16} />
        </button>
      </div>
    </>
  );
}
