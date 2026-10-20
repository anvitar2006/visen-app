"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import SanaMark from "@/components/sana-mark";

export default function SanaView() {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(false);
  return (
    <section className="sana-room">
      <div className="sana-introduction">
        <SanaMark />
        <p className="eyebrow">A LITTLE CLARITY, WHEN YOU NEED IT</p>
        <h2>What’s on your mind, Alex?</h2>
        <p>
          A busy week, a bigger goal, or simply where to begin.
          <br />
          There’s room to think it through here.
        </p>
        <span className="sana-disclosure">
          Visual preview · No live AI or personalized responses yet
        </span>
      </div>
      <div className="sana-prompts">
        {[
          "Help me find my focus today",
          "Make a little room in my week",
          "Reconnect with my bigger picture",
        ].map((t) => (
          <button
            key={t}
            onClick={() => {
              setPrompt(t);
              setReply(true);
            }}
          >
            {t}
            <ArrowUpRight size={17} />
          </button>
        ))}
      </div>
      {reply && (
        <div className="sample-conversation" role="status">
          <p className="sample-user">{prompt}</p>
          <div>
            <SanaMark small />
            <p>
              This is a preview of our conversation space. In Phase 4, I’ll
              offer clearly labeled suggestions based on the planning
              information you choose to save. Nothing will change without your
              approval.
            </p>
          </div>
        </div>
      )}
      <form
        className="sana-composer"
        onSubmit={(e) => {
          e.preventDefault();
          if (prompt.trim()) setReply(true);
        }}
      >
        <label className="sr-only" htmlFor="sana-message">
          Preview a message to Sana
        </label>
        <input
          id="sana-message"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="A thought, a question, a place to start…"
          maxLength={500}
        />
        <button aria-label="Preview message" disabled={!prompt.trim()}>
          <ArrowUpRight size={21} />
        </button>
      </form>
      <p className="sana-privacy">
        Preview messages stay in this page’s memory and are not sent to an AI
        service.
      </p>
    </section>
  );
}
