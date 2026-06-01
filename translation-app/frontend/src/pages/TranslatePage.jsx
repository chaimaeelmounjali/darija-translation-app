import { useCallback, useEffect, useMemo, useState } from "react";
import HistoryPanel from "../components/HistoryPanel.jsx";
import LanguageSelector from "../components/LanguageSelector.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import TextInput from "../components/TextInput.jsx";
import TranslationOutput from "../components/TranslationOutput.jsx";
import TranslatorLayout from "../components/TranslatorLayout.jsx";
import { useTranslation } from "../hooks/useTranslation.js";

const LANGUAGES = [
  { code: "darija_arabic", name: "Darija Arabic", flag: "🇲🇦" },
  { code: "darija_arabizi", name: "Darija Arabizi", flag: "🇲🇦" },
  { code: "en", name: "English", flag: "🇬🇧" },
];

const ALLOWED_PAIRS = {
  en: ["darija_arabic", "darija_arabizi"],
  darija_arabic: ["en"],
  darija_arabizi: ["en"],
};

const HISTORY_KEY = "translation_history_v1";
const MAX_HISTORY = 8;
const AUTO_DEBOUNCE_MS = 500;
const MAX_CHARS = 2000;

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    return [];
  }
};

export default function TranslatePage() {
  const [sourceText, setSourceText] = useState("");
  const [sourceLang, setSourceLang] = useState("darija_arabic");
  const [targetLang, setTargetLang] = useState("en");
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [history, setHistory] = useState(loadHistory);
  const [health, setHealth] = useState({
    checking: true,
    online: false,
    modelLoaded: false,
    lastChecked: null,
  });

  const {
    translate,
    loading,
    error,
    result,
    processingTimeMs,
    clear,
    setOutput,
    apiBaseUrl,
  } = useTranslation();

  const languageByCode = useMemo(() => {
    const map = new Map();
    LANGUAGES.forEach((lang) => map.set(lang.code, lang));
    return map;
  }, []);

  const allowedTargets = useMemo(
    () => ALLOWED_PAIRS[sourceLang] || null,
    [sourceLang]
  );

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (err) {
      // ignore storage errors
    }
  }, [history]);

  const pushHistory = useCallback(
    (input, output) => {
      const sourceInfo = languageByCode.get(sourceLang);
      const targetInfo = languageByCode.get(targetLang);
      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        input,
        output,
        sourceLang,
        targetLang,
        sourceName: sourceInfo?.name || sourceLang,
        targetName: targetInfo?.name || targetLang,
        createdAt: new Date().toISOString(),
      };
      setHistory((prev) => {
        const deduped = prev.filter(
          (item) =>
            !(
              item.input === entry.input &&
              item.output === entry.output &&
              item.sourceLang === entry.sourceLang &&
              item.targetLang === entry.targetLang
            )
        );
        return [entry, ...deduped].slice(0, MAX_HISTORY);
      });
    },
    [languageByCode, sourceLang, targetLang]
  );

  const handleTranslate = useCallback(async () => {
    const trimmed = sourceText.trim();
    if (!trimmed || loading) {
      return;
    }
    const response = await translate({
      text: trimmed,
      sourceLang,
      targetLang,
    });
    if (response?.translated_text) {
      pushHistory(trimmed, response.translated_text);
    }
  }, [loading, pushHistory, sourceLang, sourceText, targetLang, translate]);

  const handleClear = useCallback(() => {
    setSourceText("");
    clear();
  }, [clear]);

  const handleSwap = useCallback(() => {
    const nextSource = targetLang;
    const nextTarget = sourceLang;
    const allowed = ALLOWED_PAIRS[nextSource];
    setSourceLang(nextSource);
    if (!allowed || allowed.includes(nextTarget)) {
      setTargetLang(nextTarget);
      return;
    }
    setTargetLang(allowed[0]);
  }, [sourceLang, targetLang]);

  const handleHistorySelect = useCallback(
    (item) => {
      setSourceText(item.input);
      setSourceLang(item.sourceLang);
      setTargetLang(item.targetLang);
      setOutput(item.output);
    },
    [setOutput]
  );

  const handleHistoryClear = useCallback(() => {
    setHistory([]);
  }, []);

  useEffect(() => {
    if (!autoTranslate) {
      return undefined;
    }
    if (!sourceText.trim()) {
      return undefined;
    }
    const id = setTimeout(() => {
      handleTranslate();
    }, AUTO_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [autoTranslate, handleTranslate, sourceText, sourceLang, targetLang]);

  useEffect(() => {
    if (!allowedTargets || allowedTargets.includes(targetLang)) {
      return;
    }
    setTargetLang(allowedTargets[0]);
  }, [allowedTargets, targetLang]);

  useEffect(() => {
    let active = true;
    const checkHealth = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(`${apiBaseUrl}/health`, {
          signal: controller.signal,
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error("Health check failed.");
        }
        if (active) {
          setHealth({
            checking: false,
            online: true,
            modelLoaded: Boolean(data.model_loaded),
            lastChecked: new Date().toISOString(),
          });
        }
      } catch (err) {
        if (active) {
          setHealth({
            checking: false,
            online: false,
            modelLoaded: false,
            lastChecked: new Date().toISOString(),
          });
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [apiBaseUrl]);

  const status = (
    <StatusBadge
      checking={health.checking}
      online={health.online}
      modelLoaded={health.modelLoaded}
      lastChecked={health.lastChecked}
    />
  );

  const languageSelector = (
    <LanguageSelector
      languages={LANGUAGES}
      targetAllowed={allowedTargets}
      sourceLang={sourceLang}
      targetLang={targetLang}
      onSourceChange={setSourceLang}
      onTargetChange={setTargetLang}
      onSwap={handleSwap}
    />
  );

  const tools = (
    <div className="flex flex-wrap items-center justify-start gap-3 text-sm text-muted">
      <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
        <input
          type="checkbox"
          className="h-4 w-4 accent-emerald-400"
          checked={autoTranslate}
          onChange={(event) => setAutoTranslate(event.target.checked)}
        />
        <span>Auto translate</span>
        <span className="text-xs text-muted">{AUTO_DEBOUNCE_MS}ms</span>
      </label>
      <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs">
        Ctrl+Enter
      </div>
    </div>
  );

  const footer = error ? (
    <div className="glass-panel rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
      {error}
    </div>
  ) : null;

  return (
    <TranslatorLayout
      status={status}
      languageSelector={languageSelector}
      tools={tools}
      leftPanel={
        <TextInput
          value={sourceText}
          onChange={setSourceText}
          onTranslate={handleTranslate}
          onClear={handleClear}
          maxChars={MAX_CHARS}
          loading={loading}
        />
      }
      rightPanel={
        <TranslationOutput
          text={result}
          loading={loading}
          processingTimeMs={processingTimeMs}
        />
      }
      historyPanel={
        <HistoryPanel
          items={history}
          onSelect={handleHistorySelect}
          onClear={handleHistoryClear}
        />
      }
      footer={footer}
    />
  );
}
