export function DesktopOnlyNotice() {
  return (
    <main
      className="desktop-only-notice"
      aria-labelledby="desktop-only-title"
      tabIndex={0}
    >
      <div className="desktop-only-notice__card">
        <p className="desktop-only-notice__eyebrow">AI Grounds</p>
        <svg
          className="desktop-only-notice__icon"
          viewBox="0 0 64 64"
          aria-hidden="true"
        >
          <rect x="7" y="10" width="50" height="36" rx="4" />
          <path d="M24 55h16M32 46v9" />
        </svg>
        <h1 id="desktop-only-title">Open AI Grounds on a desktop</h1>
        <p>
          These interactive lessons need a larger screen. Please continue on a
          desktop or laptop computer.
        </p>
      </div>
    </main>
  );
}
