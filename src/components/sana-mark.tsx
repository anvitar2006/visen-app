export default function SanaMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`sana-mark ${small ? "small" : ""}`} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}
