import { Heart, Moon, Sun } from "lucide-react";
import newtzLogo from "../newtz-logo.png";

export default function Header({ savedCount, showSaved, onToggleSaved, onToggleTheme }) {
  return (
    <header className="site-header">
      <div className="brand">
        <img src={newtzLogo} alt="" className="brand-logo" />
        <span className="brand-name">Newtz Chef</span>
      </div>

      <nav className="header-actions">
        <button
          className={`ghost-btn ${showSaved ? "is-active" : ""}`}
          onClick={onToggleSaved}
          aria-pressed={showSaved}
        >
          <Heart size={16} aria-hidden="true" />
          Saved{savedCount > 0 && <span className="count">{savedCount}</span>}
        </button>

        {/* Both icons are rendered; CSS shows the moon in light mode and the sun in dark mode. */}
        <button className="icon-btn" onClick={onToggleTheme} aria-label="Switch light or dark mode">
          <Moon size={16} className="icon-moon" aria-hidden="true" />
          <Sun size={16} className="icon-sun" aria-hidden="true" />
        </button>
      </nav>
    </header>
  );
}
