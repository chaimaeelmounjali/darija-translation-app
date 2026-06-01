export default function HistoryPanel({ items, onSelect, onClear }) {
  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">Recent translations</h2>
          <p className="text-xs text-muted">Stored locally in your browser.</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={items.length === 0}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wider text-white transition hover:border-rose-300/60 hover:text-rose-200 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Clear history
        </button>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 p-6 text-sm text-muted">
          No translations yet. Run your first request to build a history.
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="rounded-xl border border-white/10 bg-slate-950/50 p-4 text-left transition hover:border-emerald-400/40 hover:bg-slate-900/70"
            >
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  {item.sourceName} &rarr; {item.targetName}
                </span>
                <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-white">
                {item.input}
              </p>
              <p className="mt-2 line-clamp-2 text-xs text-muted">
                {item.output}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
