"use client";
import { useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import SanaMark from "@/components/sana-mark";
import { todayPriorities, timeLabel } from "@/domain/sample";
const examples = [
  {
    title: "Help me find my focus today",
    reply:
      "In this example, your portfolio is the main priority. You could give it 45 minutes before Pilates and leave the afternoon a little more open.",
  },
  {
    title: "Take a look at my week",
    reply:
      "Thursday has a few fixed commitments in the sample calendar. The application review is flexible, so that’s one thing you could consider moving.",
  },
  {
    title: "How do my plans connect to my goals?",
    reply:
      "The portfolio work supports Alex’s career goal, while Pilates supports their wellbeing goal. These are examples from the sample profile, not observations about you.",
  },
];
export default function SanaView() {
  const [draft, setDraft] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [note, setNote] = useState("");
  return (
    <section className="sana-studio">
      <header className="sana-byline">
        <SanaMark small />
        <span>Sana</span>
        <small>AI planning assistant · Scripted preview</small>
      </header>
      <h1>What’s on your mind?</h1>
      <p className="sana-invitation">
        A busy day, a decision, or just figuring out where to start.
        <br className="sana-desktop-break" /> There’s no need to have it all
        worked out.
      </p>
      <form
        className="sana-writing-desk"
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) {
            setNote(draft.trim());
            setAnswer(
              "This is a preview of the conversation space. Your note hasn’t been interpreted or sent to a model.",
            );
            setDraft("");
          }
        }}
      >
        <label className="sr-only" htmlFor="sana-message">
          A note to Sana
        </label>
        <textarea
          id="sana-message"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tell me what you’re working through…"
          rows={4}
          maxLength={500}
        />
        <div>
          <span>Just a place to start.</span>
          <button aria-label="Preview message" disabled={!draft.trim()}>
            Preview note
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
      <p className="sana-preview-explanation">
        This preview doesn’t use live AI. Your notes aren’t saved or sent to an
        AI service.
      </p>
      {answer && (
        <div className="sana-letter-reply" role="status">
          <span>Example response</span>
          {note && <blockquote>{note}</blockquote>}
          <p>{answer}</p>
          <small>Nothing will change without your approval.</small>
          <button
            onClick={() => {
              setAnswer(null);
              setNote("");
            }}
          >
            Close example
          </button>
        </div>
      )}
      <section
        className="sana-starting-points"
        aria-label="Sample conversation starters"
      >
        <h2>Not sure where to begin?</h2>
        <ul>
          {examples.map((example) => (
            <li key={example.title}>
              <button
                onClick={() => {
                  setNote("");
                  setAnswer(example.reply);
                }}
              >
                {example.title}
              </button>
            </li>
          ))}
        </ul>
      </section>
      <details className="sana-sample-day">
        <summary>
          View the sample day
          <ChevronDown size={15} />
        </summary>
        <p>These plans belong to the fictional sample profile.</p>
        {todayPriorities.slice(0, 2).map((task) => (
          <div key={task.id}>
            <span>
              {task.scheduledStart
                ? timeLabel(task.scheduledStart)
                : "Flexible"}
            </span>
            <strong>{task.title}</strong>
          </div>
        ))}
      </details>
    </section>
  );
}
