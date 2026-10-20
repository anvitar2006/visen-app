"use client";
import { useState } from "react";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import SanaMark from "@/components/sana-mark";
import { todayPriorities, timeLabel } from "@/domain/sample";
const prompts = [
  {
    title: "Help me find my focus today",
    context: "A thoughtful place to begin",
    reply:
      "Your portfolio is connected to a goal you care about. In this sample day, there’s room for a focused session before Pilates. The rest doesn’t need to be solved all at once.",
  },
  {
    title: "Make a little room in my week",
    context: "When the calendar feels full",
    reply:
      "Thursday has several commitments in this example. It might feel better to leave the flexible application review for another day. You would choose whether to make that change.",
  },
  {
    title: "Reconnect with my bigger picture",
    context: "Remember what you’re moving toward",
    reply:
      "Meaningful work, wellbeing, and curiosity are the three directions in this sample vision. Your plans can make room for all three, without asking every day to do everything.",
  },
];
export default function SanaView() {
  const [draft, setDraft] = useState("");
  const [selection, setSelection] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState("");
  return (
    <section className="sana-editorial">
      <div className="sana-main">
        <div className="sana-welcome">
          <SanaMark />
          <span className="sana-signature">Sana</span>
          <span className="sana-role">YOUR AI PLANNING ASSISTANT</span>
        </div>
        <h2>
          A little room
          <br />
          to think clearly.
        </h2>
        <p className="sana-opening">
          A full week, a bigger decision, or a thought you haven’t quite
          untangled. We can start with what’s on your mind.
        </p>
        <span className="sana-disclosure">
          Scripted interface preview · No live AI
        </span>
        <div
          className="sana-prompts"
          aria-label="Preview a planning conversation"
        >
          {prompts.map((p, i) => (
            <button
              key={p.title}
              onClick={() => {
                setSelection(i);
                setSubmitted("");
              }}
              aria-pressed={selection === i}
            >
              <span className="prompt-number">0{i + 1}</span>
              <span>
                <strong>{p.title}</strong>
                <small>{p.context}</small>
              </span>
              <ArrowUpRight size={17} />
            </button>
          ))}
        </div>
        {(selection !== null || submitted) && (
          <div className="sana-sample-answer" role="status">
            <span className="eyebrow">SCRIPTED PREVIEW</span>
            {submitted && (
              <p className="sana-submitted">
                <strong>Your example note</strong>
                {submitted}
              </p>
            )}
            <p>
              {selection !== null
                ? prompts[selection].reply
                : "This space previews a planning conversation. Your note has not been sent to a model, interpreted, or saved."}
            </p>
            <span>Nothing will change without your approval.</span>
          </div>
        )}
        <form
          className="sana-note-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) {
              setSubmitted(draft.trim());
              setSelection(null);
              setDraft("");
            }
          }}
        >
          <label htmlFor="sana-message">Or, leave a little thought here.</label>
          <textarea
            id="sana-message"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="What would you like to make room for?"
            rows={2}
            maxLength={500}
          />
          <div>
            <span>This note stays in page memory only.</span>
            <button aria-label="Preview message" disabled={!draft.trim()}>
              Preview note
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
      <aside className="sana-context">
        <span className="eyebrow">A LITTLE CONTEXT</span>
        <h3>Your example day</h3>
        <p>
          A few plans from the sample profile. No personal information is being
          remembered.
        </p>
        <div className="sana-context-plans">
          {todayPriorities.slice(0, 2).map((t) => (
            <div key={t.id}>
              <span>
                {t.scheduledStart ? timeLabel(t.scheduledStart) : "Flexible"}
              </span>
              <strong>{t.title}</strong>
            </div>
          ))}
        </div>
        <div className="sana-context-vision">
          <span className="eyebrow">THE BIGGER PICTURE</span>
          <p>
            “Meaningful work.
            <br />A healthy mind.
            <br />
            Room to stay curious.”
          </p>
          <span>From Alex’s sample vision</span>
        </div>
        <div className="sana-promise">
          <SanaMark small />
          <p>
            Thoughtful guidance.
            <br />
            Your decisions, always.
          </p>
        </div>
      </aside>
    </section>
  );
}
