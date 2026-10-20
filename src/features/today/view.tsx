"use client";
import type { View } from "@/components/navigation";

import { ArrowRight, ArrowUpRight, Leaf, Plus } from "lucide-react";
import SectionHeader from "@/components/ui/section-header";
import PreviewCompletion from "@/components/ui/preview-completion";
import SanaMark from "@/components/sana-mark";
import { tasks, todayHabits } from "@/domain/sample";
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
            <SectionHeader
              eyebrow="FOCUS ON WHAT COUNTS"
              title={
                <>
                  Today’s priorities <span className="count">03</span>
                </>
              }
              accessory={<span className="subtle">One thing at a time.</span>}
            />
            <div className="task-list">
              {tasks.map((task, i) => (
                <div
                  className={`task-row ${task.done ? "completed" : ""}`}
                  key={task.id}
                >
                  <PreviewCompletion
                    completed={task.done}
                    label={`${task.done ? "Completed" : "Preview completion for"} ${task.title}`}
                    onPreview={demo}
                  />
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
            <SectionHeader
              title="On the horizon"
              accessory={
                <button className="text-link" onClick={() => navigate("Week")}>
                  View week <ArrowRight size={15} />
                </button>
              }
            />
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
            <SectionHeader
              title="Your daily rhythm"
              accessory={<Leaf size={17} />}
            />
            <p className="subtle">Little things that make a difference.</p>
            {todayHabits.map((h) => (
              <div className="mini-habit" key={h.id}>
                <span>{h.name}</span>
                <PreviewCompletion
                  completed={h.done}
                  label={`${h.name}: ${h.done ? "sample complete" : "sample incomplete"}`}
                  onPreview={demo}
                />
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
