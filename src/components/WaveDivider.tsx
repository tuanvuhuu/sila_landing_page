/** Dải sóng SVG ngăn giữa các section (mềm mại, hợp tông trẻ em). */
export default function WaveDivider({ color = "#eef4de", flip = false }: { color?: string; flip?: boolean }) {
  return (
    <div className={`wave-divider${flip ? " wave-flip" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 1440 70" preserveAspectRatio="none">
        <path
          d="M0,35 C240,75 480,5 720,30 C960,55 1200,80 1440,35 L1440,70 L0,70 Z"
          fill={color}
        />
      </svg>
    </div>
  );
}
