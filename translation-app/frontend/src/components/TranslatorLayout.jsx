export default function TranslatorLayout({
  status,
  languageSelector,
  tools,
  leftPanel,
  rightPanel,
  historyPanel,
  footer,
}) {
  return (
    <div className="app-shell">
      <div className="pointer-events-none absolute -top-28 left-[-10%] h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl animate-float" />
      <div className="pointer-events-none absolute top-24 right-[-8%] h-80 w-80 rounded-full bg-amber-400/20 blur-3xl animate-float" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-6 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              T5 Lab
            </p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Translation Studio
            </h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Fine-tuned T5 with a multilingual twist, tuned for depth and
              clarity.
            </p>
          </div>
          <div className="flex items-center gap-3">{status}</div>
        </header>

        <div className="flex flex-col gap-4 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex-1">{languageSelector}</div>
          <div className="flex-1 lg:flex lg:justify-end">{tools}</div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="glass-panel rounded-2xl p-5">{leftPanel}</div>
          <div className="glass-panel rounded-2xl p-5">{rightPanel}</div>
        </div>

        <div className="mt-8">{historyPanel}</div>
        {footer ? <div className="mt-6">{footer}</div> : null}
      </div>
    </div>
  );
}
