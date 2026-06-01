import { useEffect, useState } from "react";

export default function TranslationOutput({
  text,
  loading,
  processingTimeMs,
}) {
  const [displayText, setDisplayText] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [text]);

  useEffect(() => {
    if (!text) {
      setDisplayText("");
      return;
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduceMotion) {
      setDisplayText(text);
      return;
    }

    let index = 0;
    const duration = Math.min(1800, Math.max(400, text.length * 16));
    const intervalMs = 20;
    const step = Math.max(1, Math.ceil(text.length / (duration / intervalMs)));

    setDisplayText("");
    const id = setInterval(() => {
      index = Math.min(text.length, index + step);
      setDisplayText(text.slice(0, index));
      if (index >= text.length) {
        clearInterval(id);
      }
    }, intervalMs);

    return () => clearInterval(id);
  }, [text]);

  const handleCopy = async () => {
    if (!text) {
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm uppercase tracking-[0.25em] text-muted">
          Output
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-wider text-white transition hover:border-emerald-400/60 hover:text-emerald-200"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <div className="relative flex-1 rounded-xl border border-white/10 bg-slate-950/60 p-4 text-sm text-white">
        {loading ? (
          <div className="flex h-full flex-col gap-3">
            <div className="h-4 w-5/6 rounded-full shimmer-line" />
            <div className="h-4 w-4/6 rounded-full shimmer-line" />
            <div className="h-4 w-3/4 rounded-full shimmer-line" />
            <div className="h-4 w-2/3 rounded-full shimmer-line" />
          </div>
        ) : text ? (
          <p className="whitespace-pre-wrap leading-relaxed">
            {displayText}
            {displayText.length < text.length ? (
              <span className="ml-1 animate-caret text-emerald-300">|</span>
            ) : null}
          </p>
        ) : (
          <p className="text-muted">
            Translation will appear here with a streaming effect.
          </p>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted">
        <span>
          {processingTimeMs ? `Processed in ${processingTimeMs} ms` : ""}
        </span>
        <span className="font-mono text-[11px]">T5 fine-tuned</span>
      </div>
    </div>
  );
}
