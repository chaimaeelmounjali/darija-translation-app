export default function TextInput({
  value,
  onChange,
  onTranslate,
  onClear,
  maxChars,
  loading,
}) {
  const isEmpty = value.length === 0;
  const remaining = maxChars - value.length;

  const handleKeyDown = (event) => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      onTranslate();
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative flex-1">
        {isEmpty ? (
          <div className="placeholder-overlay">
            Drop your source text here... try a paragraph or a short story.
          </div>
        ) : null}
        <textarea
          className="h-64 w-full resize-none rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-white outline-none transition focus:border-emerald-400/50"
          placeholder=""
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={maxChars}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
        <div className="text-muted">
          {value.length} / {maxChars} chars
          <span className="ml-2 text-xs text-muted">({remaining} left)</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClear}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wider text-white transition hover:border-rose-300/60 hover:text-rose-200"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onTranslate}
            disabled={loading || isEmpty}
            className="rounded-full bg-emerald-400/90 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-200"
          >
            {loading ? "Translating..." : "Translate"}
          </button>
        </div>
      </div>
    </div>
  );
}
