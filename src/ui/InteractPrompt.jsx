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
    <button type="button" className="interact-prompt" onClick={interact}>
      <kbd className="interact-key">E</kbd>
      <span>
        Read <strong>{title}</strong>
      </span>
    </button>
  );
}
