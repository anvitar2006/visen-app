"use client";

import { ArrowRight, ArrowUpRight, Check, Leaf, Plus } from "lucide-react";
import SanaMark from "@/components/sana-mark";
import { tasks, type View } from "@/domain/sample";
export default function TodayView({
  demo,
  navigate,
}: {
  demo: () => void;
  navigate: (view: View) => void;
}) {
  return (
    <>
      <section className="hero" aria-label="Daily intention">
        <div className="hero-copy">
          <span className="eyebrow">YOUR DAY, WITH PURPOSE</span>
          <h2>
            You don’t have to do it all.
            <br />
            <em>Just what matters.</em>
          </h2>
          <p>
            A few meaningful steps today can take you
            <br className="desktop-break" /> closer to the life you’re creating.
          </p>
          <button className="text-link" onClick={() => navigate("My Vision")}>
            Reconnect with your vision <ArrowUpRight size={16} />
          </button>
        </div>
        <div
          className="hero-photo"
          role="img"
          aria-label="Snow-covered mountains under a quiet evening sky"
        >
          <div className="photo-caption">MAKE SPACE TO GROW.</div>
        </div>
      </section>
      <div className="today-grid">
        <div className="today-primary">
          <section className="priorities">
            <div className="section-header">
              <div>
                <p className="eyebrow">FOCUS ON WHAT COUNTS</p>
                <h2>
                  Today’s priorities <span className="count">03</span>
                </h2>
              </div>
              <span className="subtle">One thing at a time.</span>
            </div>
            <div className="task-list">
              {tasks.map((task, i) => (
                <div
                  className={`task-row ${task.done ? "completed" : ""}`}
                  key={task.title}
                >
                  <button
                    className={`task-check ${task.done ? "checked" : ""}`}
                    aria-label={`${task.done ? "Completed" : "Preview completion for"} ${task.title}`}
                    onClick={demo}
                  >
                    {task.done && <Check size={14} />}
                  </button>
                  <div className="task-text">
                    <h3>{task.title}</h3>
                    <span>{task.detail}</span>
                  </div>
                  <span className={`category ${task.color}`}>
                    {task.category}
                  </span>
                  <span className="task-number">0{i + 1}</span>
                </div>
              ))}
            </div>
            <button className="quiet-add" onClick={demo}>
              <Plus size={16} /> Make a little space for something else
            </button>
          </section>
          <section className="commitments">
            <div className="section-header">
              <h2>On the horizon</h2>
              <button className="text-link" onClick={() => navigate("Week")}>
                View week <ArrowRight size={15} />
              </button>
            </div>
            <div className="appointment">
              <span className="time">
                11:00<span>AM</span>
              </span>
              <span className="appointment-line sage-bg" />
              <div>
                <h3>Pilates at the studio</h3>
                <p>50 min · Time for yourself</p>
              </div>
              <span className="appointment-label">WELLBEING</span>
            </div>
            <div className="appointment">
              <span className="time">
                3:30<span>PM</span>
              </span>
              <span className="appointment-line rose-bg" />
              <div>
                <h3>Coffee with Maya</h3>
                <p>Corner café · A little catching up</p>
              </div>
              <span className="appointment-label">CONNECTION</span>
            </div>
          </section>
        </div>
        <aside
          className="today-secondary"
          aria-label="Daily reflection and habits"
        >
          <section className="sana-card">
            <div className="sana-card-head">
              <SanaMark />
              <div>
                <h3>A note from Sana</h3>
                <span>YOUR PLANNING COMPANION</span>
              </div>
            </div>
            <p>
              “Your portfolio is a step toward something you care about. Give it
              your best energy today. The rest can find its place.”
            </p>
            <div className="sana-card-footer">
              <span>Sample suggestion</span>
              <button aria-label="Open Sana" onClick={() => navigate("Sana")}>
                <ArrowUpRight size={20} />
              </button>
            </div>
          </section>
          <section className="daily-rhythm">
            <div className="section-header">
              <h2>Your daily rhythm</h2>
              <Leaf size={17} />
            </div>
            <p className="subtle">Little things that make a difference.</p>
            {[
              { name: "Move your body", done: false },
              { name: "Read a little", done: true },
              { name: "A moment of stillness", done: false },
            ].map((h) => (
              <div className="mini-habit" key={h.name}>
                <span>{h.name}</span>
                <button
                  onClick={demo}
                  className={`task-check ${h.done ? "checked" : ""}`}
                  aria-label={`${h.name}: ${h.done ? "sample complete" : "sample incomplete"}`}
                >
                  {h.done && <Check size={13} />}
                </button>
              </div>
            ))}
          </section>
          <div className="progress-summary">
            <div className="progress-ring">
              <span>
                1<span>/ 3</span>
              </span>
            </div>
            <div>
              <h3>A little progress</h3>
              <p>
                One priority complete.
                <br />
                You’re finding your rhythm.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
