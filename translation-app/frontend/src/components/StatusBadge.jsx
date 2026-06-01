export default function StatusBadge({
  checking,
  online,
  modelLoaded,
  lastChecked,
}) {
  let label = "Checking";
  let tone = "bg-slate-500";

  if (!checking) {
    if (online && modelLoaded) {
      label = "API Online";
      tone = "bg-emerald-400";
    } else if (online && !modelLoaded) {
      label = "Model loading";
      tone = "bg-amber-400";
    } else {
      label = "API Offline";
      tone = "bg-rose-400";
    }
  }

  return (
    <div className="glass-panel flex items-center gap-2 rounded-full px-4 py-2 text-xs text-white">
      <span className={`h-2 w-2 rounded-full ${tone}`} />
      <span>{label}</span>
      {lastChecked ? (
        <span className="text-[10px] text-muted">
          {new Date(lastChecked).toLocaleTimeString()}
        </span>
      ) : null}
    </div>
  );
}
