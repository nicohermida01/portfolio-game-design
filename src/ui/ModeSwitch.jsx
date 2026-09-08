import { useGameStore } from "../store.js";

// Toggles between the page portfolio and the 3D experience.
// Circular floating button: it shows the icon of the mode you'd switch TO
// (joystick = 3D game, page = portfolio page).
export default function ModeSwitch() {
  const mode = useGameStore((s) => s.mode);
  const setMode = useGameStore((s) => s.setMode);
  const target = mode === "page" ? "3d" : "page";
  const label = target === "3d" ? "Switch to 3D game mode" : "Switch to page mode";

  return (
    <button
      type="button"
      className="mode-switch"
      onClick={() => setMode(target)}
      aria-label={label}
      title={label}
    >
      {target === "3d" ? <JoystickIcon /> : <PageIcon />}
    </button>
  );
}

function JoystickIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="18" rx="7.5" ry="3.2" />
        <path d="M12 15V8" />
        <circle cx="12" cy="6" r="2.6" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

function PageIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 3h8l4 4v14H6z" />
        <path d="M14 3v4h4" />
        <path d="M9 12h6M9 15.5h6M9 8.5h2" />
      </g>
    </svg>
  );
}
