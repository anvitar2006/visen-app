/** An open, hand-drawn S: a quiet signature rather than an AI avatar. */
export default function SanaMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`sana-mark ${small ? "small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 48 56" fill="none">
        <path d="M35 9C29 3 15 7 14 17C13 25 34 26 33 36C32 47 16 51 9 43" />
        <path d="M36 5C42 18 34 27 24 29C14 31 8 39 12 51" />
      </svg>
    </span>
  );
}
