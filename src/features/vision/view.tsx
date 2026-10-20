"use client";
import { ArrowUpRight } from "lucide-react";
import ProgressBar from "@/components/ui/progress-bar";
import SectionHeader from "@/components/ui/section-header";
import { goals } from "@/domain/sample";
export default function VisionView({ demo }: { demo: () => void }) {
  return (
    <>
      <section className="vision-editorial">
        <div className="vision-letter">
          <p className="eyebrow">A NOTE TO MY FUTURE SELF</p>
          <h2>
            A life with meaning.
            <br />
            And room to <em>just be.</em>
          </h2>
          <p>
            Work that feels like me. A healthy mind.
            <br />
            People I love. Time to stay curious.
          </p>
          <span className="sample-caption">Alex’s sample vision</span>
        </div>
        <figure>
          <img
            src="/images/ritual.jpg"
            alt="An open notebook beside a plant, pencil and glasses on a softly lit desk"
          />
          <figcaption>SPACE FOR THE LIFE YOU’RE CREATING</figcaption>
        </figure>
      </section>
      <SectionHeader
        className="vision-section-heading"
        title="What I’m growing toward"
        accessory={
          <span className="quiet-label">Three meaningful directions</span>
        }
      />
      <div className="vision-directions">
        {goals.map((goal, i) => (
          <article className="vision-direction" key={goal.id}>
            <span className="direction-number">0{i + 1}</span>
            <div className="direction-copy">
              <span className={`category-label tone-${goal.color}`}>
                <span className="category-dot" />
                {goal.category}
              </span>
              <h2>{goal.title}</h2>
              <p>{goal.detail}</p>
            </div>
            <div className={`direction-progress tone-${goal.color}`}>
              <div>
                <span>{goal.steps}</span>
                <strong>{goal.progress}%</strong>
              </div>
              <ProgressBar
                value={goal.progress}
                label={`${goal.title}: sample milestone progress`}
              />
              <span className="next-step-label">Next small step</span>
              <button onClick={demo}>
                {goal.milestone}
                <ArrowUpRight size={15} />
              </button>
            </div>
          </article>
        ))}
      </div>
      <p className="vision-postscript">
        Your vision is allowed to change. This space grows with you.
      </p>
    </>
  );
}
