export default function LanguageSelector({
  languages,
  targetAllowed,
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
}) {
  const isTargetAllowed = (code) =>
    !targetAllowed || targetAllowed.includes(code);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="glass-panel flex flex-1 items-center gap-2 rounded-full px-4 py-2">
        <select
          className="language-select w-full appearance-none bg-transparent text-sm font-medium text-white outline-none"
          value={sourceLang}
          onChange={(event) => onSourceChange(event.target.value)}
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onSwap}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400/60 hover:text-emerald-200"
        aria-label="Swap languages"
      >
        Swap
      </button>

      <div className="glass-panel flex flex-1 items-center gap-2 rounded-full px-4 py-2">
        <select
          className="language-select w-full appearance-none bg-transparent text-sm font-medium text-white outline-none"
          value={targetLang}
          onChange={(event) => onTargetChange(event.target.value)}
        >
          {languages.map((lang) => (
            <option
              key={lang.code}
              value={lang.code}
              disabled={!isTargetAllowed(lang.code)}
            >
              {lang.flag} {lang.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
