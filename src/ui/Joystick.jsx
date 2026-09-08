import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store.js";

const MAX = 46; // px the knob can travel from centre

// A thumbstick. Pointer events -> a normalized {x, z} vector in the store.
// CSS only shows it on touch devices (see .joystick in styles.css).
export default function Joystick() {
  const baseRef = useRef(null);
  const activePointer = useRef(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const setInput = useGameStore((s) => s.setInput);

  useEffect(() => {
    const base = baseRef.current;
    if (!base) return;

    const centre = () => {
      const r = base.getBoundingClientRect();
      return { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    };

    const apply = (e) => {
      if (activePointer.current !== e.pointerId) return;
      const { cx, cy } = centre();
      let dx = e.clientX - cx;
      let dy = e.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > MAX) {
        dx = (dx / dist) * MAX;
        dy = (dy / dist) * MAX;
      }
      setKnob({ x: dx, y: dy });
      // screen down (+dy) = walk "backward" (+z), matching the keyboard.
      setInput(dx / MAX, dy / MAX);
    };

    const start = (e) => {
      activePointer.current = e.pointerId;
      base.setPointerCapture(e.pointerId);
      apply(e);
    };

    const end = (e) => {
      if (activePointer.current !== e.pointerId) return;
      activePointer.current = null;
      setKnob({ x: 0, y: 0 });
      setInput(0, 0);
    };

    base.addEventListener("pointerdown", start);
    base.addEventListener("pointermove", apply);
    base.addEventListener("pointerup", end);
    base.addEventListener("pointercancel", end);
    return () => {
      base.removeEventListener("pointerdown", start);
      base.removeEventListener("pointermove", apply);
      base.removeEventListener("pointerup", end);
      base.removeEventListener("pointercancel", end);
    };
  }, [setInput]);

  return (
    <div className="joystick" ref={baseRef}>
      <div
        className="joystick-knob"
        style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }}
      />
    </div>
  );
}
