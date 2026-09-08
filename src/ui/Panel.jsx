import { useGameStore } from "../store.js";
import { resolveMarker } from "../sections.js";

// Pure DOM. No Three.js here. This is the content layer: crawlable,
// selectable, styled with normal CSS. Content comes from content.js via
// resolveMarker(), so game mode and page mode never drift apart.
export default function Panel() {
  const marker = useGameStore((s) => s.activeMarker);
  if (!marker) return null;

  const c = resolveMarker(marker.id);

  return (
    <aside className="panel">
      <span className="tag">{c.tag}</span>
      <h2>{c.title}</h2>

      {c.subtitle && <p className="panel-sub">{c.subtitle}</p>}
      {c.meta && <span className="panel-meta">{c.meta}</span>}

      <p>{c.body}</p>

      {c.stack && (
        <ul className="panel-stack">
          {c.stack.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}

      {c.links && (
        <ul className="panel-links">
          {c.links.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}

      {c.href && (
        <a
          className="panel-link"
          href={c.href}
          target="_blank"
          rel="noreferrer"
        >
          {c.hrefLabel} ↗
        </a>
      )}
    </aside>
  );
}
