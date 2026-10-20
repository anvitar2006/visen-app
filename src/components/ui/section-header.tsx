import type { ReactNode } from "react";
/** Editorial heading pattern shared by planning and future review surfaces. */
export default function SectionHeader({
  title,
  eyebrow,
  accessory,
  className = "",
}: {
  title: ReactNode;
  eyebrow?: string;
  accessory?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`section-header ${className}`.trim()}>
      {eyebrow ? (
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      ) : (
        <h2>{title}</h2>
      )}
      {accessory}
    </div>
  );
}
