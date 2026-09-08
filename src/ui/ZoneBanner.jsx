import { useEffect, useState } from "react";
import { useGameStore } from "../store.js";

// Cube World-style region title: fades in near the top when you cross into a
// zone, holds a beat, fades out. Leaving a zone (activeZone -> null) doesn't
// re-trigger it.
const HOLD_MS = 2600;
const FADE_MS = 500;

export default function ZoneBanner() {
  const zone = useGameStore((s) => s.activeZone);
  const [shown, setShown] = useState(null); // zone kept mounted through fade-out
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!zone) return;
    setShown(zone);
    setVisible(true);

    const hide = setTimeout(() => setVisible(false), HOLD_MS);
    const unmount = setTimeout(() => setShown(null), HOLD_MS + FADE_MS);
    return () => {
      clearTimeout(hide);
      clearTimeout(unmount);
    };
  }, [zone]);

  if (!shown) return null;

  return (
    <div className={`zone-banner${visible ? " is-visible" : ""}`}>
      <span className="zone-banner-kicker">Entering</span>
      <span className="zone-banner-title">{shown.title}</span>
    </div>
  );
}
