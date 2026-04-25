import { useEffect, useState, type ReactNode } from "react";

export function JpLayout({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    const enabled = stored === null ? true : stored === "enabled";
    setDark(enabled);
    document.body.classList.toggle("dark", enabled);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.body.classList.toggle("dark", next);
    localStorage.setItem("darkMode", next ? "enabled" : "disabled");
  };

  return (
    <div className="jp-container">
      <header className="jp-header">
        <div className="jp-flag-row">
          <span className="jp-flag">🇯🇵</span>
          <h1 className="jp-title">Japanese Language Learning</h1>
          <span className="jp-flag">🇯🇵</span>
        </div>
        <p className="jp-subtitle">เรียนรู้ภาษาญี่ปุ่น (ฮิรางานะ) แบบ step-by-step</p>
        <button className="jp-dark-toggle" onClick={toggle} aria-label="toggle theme">
          {dark ? "☀️" : "🌙"}
        </button>
      </header>
      {children}
      <footer className="jp-footer">
        <p>&copy; {new Date().getFullYear()} Japanese Language Learning App</p>
      </footer>
    </div>
  );
}
