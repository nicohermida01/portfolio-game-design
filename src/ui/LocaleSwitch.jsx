import { useGameStore } from "../store.js";
import { LOCALES, getDict } from "../i18n/index.js";

// EN / ES segmented toggle. Lives only in the page-mode topbar — 3D mode reads
// the same `locale` from the store but shows no switch.
export default function LocaleSwitch() {
  const locale = useGameStore((s) => s.locale);
  const setLocale = useGameStore((s) => s.setLocale);
  const label = getDict(locale).ui.localeSwitchAria;

  return (
    <div className="pp-locale" role="group" aria-label={label}>
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={`pp-locale-opt${code === locale ? " is-active" : ""}`}
          aria-pressed={code === locale}
          onClick={() => setLocale(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
