import { useEffect } from "react";
import { useGameStore } from "../store.js";
import { resolveMarker } from "../sections.js";

// Signposts no longer open their panel just because you walked up — this prompt
// appears instead, and E (desktop) or a tap (mobile) opens the content. Keeps
// the world walkable without dodging panels, which matters most on a phone.
export default function InteractPrompt() {
  const nearby = useGameStore((s) => s.nearbyMarker);
  const openId = useGameStore((s) => s.activeMarker?.id ?? null);
  const interact = useGameStore((s) => s.interactWithNearby);

  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat || e.code !== "KeyE") return;
      if (useGameStore.getState().nearbyMarker) {
        e.preventDefault();
        useGameStore.getState().interactWithNearby();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Gone once its panel is open — the panel owns its own × / Esc.
  if (!nearby || nearby.id === openId) return null;

  const title = nearby.label ?? resolveMarker(nearby.id).title;

  return (
    <button
      type="button"
      className="interact-prompt"
      onClick={interact}
      aria-label={`Read ${title}`}
    >
      <kbd className="interact-key">E</kbd>
      <span className="interact-label">
        Read <strong>{title}</strong>
      </span>
      {/* Shown only on touch, where the prompt becomes a round action button
          next to the joystick. */}
      <svg
        className="interact-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6c-1.7-1.3-3.9-2-6.2-2H3v13.5h2.8c2.3 0 4.5.7 6.2 2 1.7-1.3 3.9-2 6.2-2H21V4h-2.8c-2.3 0-4.5.7-6.2 2Z" />
        <path d="M12 6v13.5" />
      </svg>
    </button>
  );
}
