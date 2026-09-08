import { HOUSES } from "../sections.js";
import Cabin from "./Cabin.jsx";

// All the cabins. Lives inside <Physics> so each one is a solid obstacle.
export default function Buildings() {
  return (
    <>
      {HOUSES.map((h) => (
        <Cabin key={h.id} position={h.position} scale={h.scale} />
      ))}
    </>
  );
}
