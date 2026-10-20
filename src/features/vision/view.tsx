"use client";

import { ArrowUpRight, BookOpen, Leaf, Target } from "lucide-react";

import ProgressBar from "@/components/ui/progress-bar";
import SectionHeader from "@/components/ui/section-header";
import { goals } from "@/domain/sample";
export default function VisionView({ demo }: { demo: () => void }) {
  return (
    <>
      <section className="vision-intention">
        <span className="eyebrow">A NOTE TO MY FUTURE SELF</span>
        <h2>
          “I want to build a life that feels
          <br />
          <em>as good as it looks.”</em>
        </h2>
        <p>Meaningful work. A healthy mind. People I love. Room to explore.</p>
        <span className="subtle">Sample personal vision</span>
      </section>
      <SectionHeader
        className="vision-section-heading"
        title="What I’m growing toward"
        accessory={<span className="subtle">3 meaningful directions</span>}
      />
      <div className="goals-grid">
        {goals.map((goal, i) => (
          <article className={`goal-card ${goal.color}`} key={goal.id}>
            <div className="goal-top">
              <span className="eyebrow">{goal.category}</span>
              {i === 0 ? (
                <Target size={21} />
              ) : i === 1 ? (
                <Leaf size={21} />
              ) : (
                <BookOpen size={21} />
              )}
            </div>
            <h2>{goal.title}</h2>
            <p>{goal.detail}</p>
            <div className="goal-progress">
              <span>{goal.steps}</span>
              <strong>{goal.progress}%</strong>
            </div>
            <ProgressBar
              value={goal.progress}
              label={`${goal.title}: sample milestone progress`}
            />
            <div className="next-milestone">
              <span className="eyebrow">NEXT SMALL STEP</span>
              <h3>{goal.milestone}</h3>
              <button className="text-link" onClick={demo}>
                Explore goal <ArrowUpRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <p className="editorial-note">
        You’re allowed to grow into a different vision.{" "}
        <em>This space grows with you.</em>
      </p>
    </>
  );
}
