import { useCallback, useRef, useState } from "react";

const DEFAULT_API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TRANSLATE_PATH = "/api/translate";

export function useTranslation(baseUrl = DEFAULT_API_URL) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState("");
  const [processingTimeMs, setProcessingTimeMs] = useState(null);
  const abortRef = useRef(null);

  const clear = useCallback(() => {
    setResult("");
    setError(null);
    setProcessingTimeMs(null);
  }, []);

  const setOutput = useCallback((text) => {
    setResult(text || "");
    setError(null);
    setProcessingTimeMs(null);
  }, []);

  const translate = useCallback(
    async ({ text, sourceLang, targetLang }) => {
      const trimmed = (text || "").trim();
      if (!trimmed) {
        setError("Text is empty.");
        return null;
      }

      if (abortRef.current) {
        abortRef.current.abort();
      }
      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);
      setError(null);
      setProcessingTimeMs(null);

      try {
        const response = await fetch(`${baseUrl}${TRANSLATE_PATH}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: trimmed,
            source_lang: sourceLang,
            target_lang: targetLang,
          }),
          signal: controller.signal,
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const detail = data.detail || "Translation failed.";
          throw new Error(detail);
        }

        setResult(data.translated_text || "");
        setProcessingTimeMs(
          Number.isFinite(data.processing_time_ms) ? data.processing_time_ms : null
        );
        return data;
      } catch (err) {
        if (err && err.name === "AbortError") {
          return null;
        }
        setError(err?.message || "Translation failed.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [baseUrl]
  );

  return {
    translate,
    loading,
    error,
    result,
    processingTimeMs,
    clear,
    setOutput,
    apiBaseUrl: baseUrl,
  };
}
