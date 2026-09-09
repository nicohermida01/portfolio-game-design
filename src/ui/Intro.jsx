import { useEffect, useState } from "react";
import { useGameStore } from "../store.js";

// One-line welcome the first time you enter 3D mode. Clears on first movement,
// any key, a click, or after a few seconds — and never comes back (persisted).
const KEY = "pgd:intro-dismissed";

function alreadyDismissed() {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export default function Intro() {
  const moving = useGameStore((s) => s.moving);
  const [visible, setVisible] = useState(() => !alreadyDismissed());

  useEffect(() => {
    if (!visible) return;

    const done = () => {
      setVisible(false);
      try {
        localStorage.setItem(KEY, "1");
      } catch {
        /* fine */
      }
    };

    if (moving) {
      done();
      return;
    }

    const timer = setTimeout(done, 8000);
    window.addEventListener("keydown", done);
    window.addEventListener("pointerdown", done);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", done);
      window.removeEventListener("pointerdown", done);
    };
  }, [visible, moving]);

  if (!visible) return null;

  return (
    <div className="intro-card" role="status">
      Walk up to a signpost to read that section — bridges link the islands.
    </div>
  );
}
