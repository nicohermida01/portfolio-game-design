import { useState } from "react";
import { useGameStore } from "../store.js";
import { getDict } from "../i18n/index.js";
import LocaleSwitch from "./LocaleSwitch.jsx";
import "./page.css";

// The page-mode portfolio — a faithful build of the published "Index" design.
// Desktop and mobile are the same DOM; page.css switches layout at 900px.
// All copy comes from the active locale dictionary (src/i18n).
export default function PagePortfolio() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const locale = useGameStore((s) => s.locale);
  const t = getDict(locale);
  const { profile, hero, stats, projects, experience, stackGroups, contact } = t;
  const { sections, ui } = t;

  return (
    <main className="pp">
      <div className="pp-frame" aria-hidden="true" />

      <div className="pp-wrap" id="top">
        <header className="pp-header">
          <a href="#top" className="pp-brand pp-m">
            <img className="pp-brand-logo" src="/apple-touch-icon.png" alt="" />
            {profile.name}
          </a>
          <span className="pp-brand-short pp-m">
            <img className="pp-brand-logo" src="/apple-touch-icon.png" alt="" />
            NH
          </span>

          <nav className="pp-nav pp-m" aria-label={ui.sectionsAria}>
            <a href="#work">{sections.work}</a>
            <a href="#log">{sections.log}</a>
            <a href="#stack">{sections.stack}</a>
            <a href="#contact">{sections.contact}</a>
          </nav>

          {profile.available && (
            <span className="pp-status pp-m">
              <i />
              {ui.available}
              <span className="pp-status-rest">{ui.availableRest}</span>
            </span>
          )}

          <LocaleSwitch />

          <button
            type="button"
            className="pp-menu-btn"
            aria-label={ui.openMenu}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </header>

        <nav className={`pp-menu pp-m${menuOpen ? " is-open" : ""}`} aria-label={ui.sectionsAria}>
          <a href="#work" onClick={closeMenu}>{sections.work}</a>
          <a href="#log" onClick={closeMenu}>{sections.log}</a>
          <a href="#stack" onClick={closeMenu}>{sections.stack}</a>
          <a href="#contact" onClick={closeMenu}>{sections.contact}</a>
        </nav>

        {/* ---------- HERO ---------- */}
        <section className="pp-sec pp-hero">
          <SectionTag n="00" name={sections.index} />
          <div className="pp-sec-body">
            <div className="pp-eyebrow pp-m">
              {profile.role}&nbsp;&nbsp;//&nbsp;&nbsp;{profile.location}
            </div>
            <h1 className="pp-headline">
              {hero.headline}
              <span className="pp-caret pp-m">_</span>
            </h1>
            <p className="pp-lede">{hero.body}</p>
            <div className="pp-cta">
              <a className="pp-btn pp-btn-primary" href="#work">
                <span>{ui.viewWork}</span>
                <IconArrowRight />
              </a>
              <a
                className="pp-btn pp-btn-ghost"
                href={profile.cvUrl}
                target="_blank"
                rel="noreferrer"
              >
                <span>{ui.downloadCv}</span>
                <IconDownload />
              </a>
            </div>
          </div>
        </section>

        {/* ---------- STATS ---------- */}
        <section className="pp-stats">
          {stats.map((s) => (
            <div className="pp-stat" key={s.label}>
              <span className="pp-stat-num">{s.value}</span>
              <span className="pp-stat-label pp-m">{s.label}</span>
            </div>
          ))}
        </section>

        {/* ---------- WORK ---------- */}
        <section className="pp-sec" id="work">
          <SectionTag n="01" name={sections.work} />
          <div className="pp-sec-body">
            <h2 className="pp-h2">{ui.selectedProjects}</h2>
            <p className="pp-sub pp-m">{ui.workSub}</p>
            <div className="pp-rows">
              {projects.map((p, i) => (
                <a
                  className="pp-row"
                  key={p.id}
                  href={p.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="pp-row-num pp-m">[{num(i)}]</span>
                  <Media src={p.image} alt={`${p.name} — ${ui.screenshot}`} />
                  <div className="pp-row-body">
                    <div className="pp-row-head">
                      <span className="pp-row-num-inline pp-m">[{num(i)}]</span>
                      <span className="pp-badge pp-m">{p.badge}</span>
                      <h3 className="pp-row-title">{p.name}</h3>
                    </div>
                    <p className="pp-row-desc">{p.description}</p>
                    <ul className="pp-tags">
                      {p.stack.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <span className="pp-row-go pp-m">
                    {p.hrefLabel}
                    <IconUpRight />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- LOG ---------- */}
        <section className="pp-sec" id="log">
          <SectionTag n="02" name={sections.log} />
          <div className="pp-sec-body">
            <h2 className="pp-h2">{ui.workExperience}</h2>
            <div className="pp-log">
              {experience.map((x) => (
                <article className="pp-entry" key={x.id}>
                  <div className="pp-entry-date pp-m">
                    <span>{x.period[0]}</span>
                    {x.period[1] && (
                      <>
                        <span className="pp-entry-sep" aria-hidden="true" />
                        <span>{x.period[1]}</span>
                      </>
                    )}
                  </div>
                  <div className="pp-entry-body">
                    <div>
                      <div className="pp-entry-role">{x.role}</div>
                      <a
                        className="pp-entry-company pp-m"
                        href={x.companyUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {x.company}
                      </a>
                    </div>
                    <p className="pp-entry-desc">{x.description}</p>
                    <p className="pp-entry-ach">{x.achievement}</p>
                    <ul className="pp-tags">
                      {x.stack.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </div>
                  <Media src={x.image} alt={x.company} entry />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- STACK ---------- */}
        <section className="pp-sec" id="stack">
          <SectionTag n="03" name={sections.stack} />
          <div className="pp-sec-body pp-stack">
            {stackGroups.map((g) => (
              <div className="pp-stack-group" key={g.title}>
                <div className="pp-stack-title">{g.title}</div>
                <div className="pp-stack-items">{g.items.join("  ·  ")}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- CONTACT ---------- */}
        <section className="pp-sec" id="contact">
          <SectionTag n="04" name={sections.contact} />
          <div className="pp-sec-body">
            <h2 className="pp-contact-h">{contact.heading}</h2>
            <p className="pp-contact-body">{contact.body}</p>
            <div className="pp-contact-rows">
              {profile.links.map((l) => (
                <a
                  className="pp-contact-row"
                  key={l.label}
                  href={l.href}
                  {...(l.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                >
                  <span className="pp-contact-ico">{linkIcon(l.label)}</span>
                  <span className="pp-contact-handle">{l.handle}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <footer className="pp-footer">
          <span>{profile.name} — {profile.role}</span>
          <span>{ui.footerTagline}</span>
        </footer>
      </div>
    </main>
  );
}

/* ---------------- helpers ---------------- */

const num = (i) => String(i + 1).padStart(2, "0");

function SectionTag({ n, name }) {
  return (
    <div className="pp-sec-tag pp-m">
      <span>{n}</span>
      <span>{name.toUpperCase()}</span>
    </div>
  );
}

function Media({ src, alt, entry = false }) {
  const cls = `pp-media${entry ? " pp-media--entry" : ""}`;
  if (!src) return <div className={`${cls} pp-media--empty`} aria-hidden="true" />;
  return (
    <div className={cls}>
      <img src={src} alt={alt} loading="lazy" />
    </div>
  );
}

function linkIcon(label) {
  const key = label.toLowerCase();
  if (key.includes("github")) return <IconGithub />;
  if (key.includes("linkedin")) return <IconLinkedin />;
  return <IconMail />;
}

/* ---------------- icons ---------------- */

function IconArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <path d="M5 12h13M12 5l7 7-7 7" />
    </svg>
  );
}
function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <path d="M12 4v13M6 12l6 6 6-6M5 21h14" />
    </svg>
  );
}
function IconUpRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="square">
      <path d="M7 17L17 7M8 7h9v9" />
    </svg>
  );
}
function IconMail() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <path d="M3 6l9 7 9-7M3 6v12h18V6M3 6h18" />
    </svg>
  );
}
function IconGithub() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
function IconLinkedin() {
  return (
    <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
