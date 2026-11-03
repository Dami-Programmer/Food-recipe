import { useState } from "react";
import { Check, Clock, Copy, Gauge, Heart, RefreshCw, Share2, Users } from "lucide-react";

// Plain-text version of the recipe, used by Copy and Share.
function recipeToText(recipe) {
  const lines = [recipe.title, ""];
  if (recipe.have.length) lines.push("You have:", ...recipe.have.map((i) => `- ${i}`), "");
  if (recipe.need.length) {
    lines.push(recipe.have.length ? "You'll need:" : "Ingredients:");
    lines.push(...recipe.need.map((i) => `- ${i}`), "");
  }
  lines.push("Steps:", ...recipe.steps.map((s, i) => `${i + 1}. ${s}`));
  return lines.join("\n");
}

export default function RecipeCard({ recipe, region, isSaved, onToggleSave, onAnotherIdea, busy }) {
  // Which steps have been ticked off. The parent gives each recipe its own
  // `key`, so this resets automatically when a new recipe arrives.
  const [doneSteps, setDoneSteps] = useState([]);
  const [copied, setCopied] = useState(false);

  function toggleStep(index) {
    setDoneSteps((done) =>
      done.includes(index) ? done.filter((i) => i !== index) : [...done, index]
    );
  }

  async function copyRecipe() {
    try {
      await navigator.clipboard.writeText(recipeToText(recipe));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard blocked: nothing to do.
    }
  }

  async function shareRecipe() {
    const text = recipeToText(recipe);
    // Phones get the native share sheet; desktops fall back to copying.
    if (navigator.share) {
      try {
        await navigator.share({ title: recipe.title, text });
      } catch {
        // User closed the share sheet.
      }
    } else {
      copyRecipe();
    }
  }

  const hasMatch = recipe.matchPercent !== null;

  return (
    <section className="card recipe-card">
      <div className="recipe-top">
        <div>
          <p className="small-label">Recommended for you · {region}</p>
          <h2 className="recipe-title">{recipe.title}</h2>
          {recipe.summary && <p className="recipe-summary">{recipe.summary}</p>}
          <div className="recipe-meta">
            {recipe.timeMinutes && (
              <span><Clock size={14} aria-hidden="true" /> {recipe.timeMinutes} min</span>
            )}
            {recipe.serves && (
              <span><Users size={14} aria-hidden="true" /> Serves {recipe.serves}</span>
            )}
            {recipe.difficulty && (
              <span><Gauge size={14} aria-hidden="true" /> {recipe.difficulty}</span>
            )}
          </div>
        </div>

        {hasMatch && (
          <div className="match-badge">
            <strong>{recipe.matchPercent}%</strong>
            <span>match</span>
          </div>
        )}
      </div>

      <div className={`ingredient-columns ${recipe.have.length ? "" : "single"}`}>
        {recipe.have.length > 0 && (
          <div>
            <h3>You have</h3>
            <ul className="chip-row">
              {recipe.have.map((item) => (
                <li key={item} className="chip chip-have">{item}</li>
              ))}
            </ul>
          </div>
        )}
        {recipe.need.length > 0 && (
          <div>
            <h3>{recipe.have.length ? "You'll need" : "Ingredients"}</h3>
            <ul className="chip-row">
              {recipe.need.map((item) => (
                <li key={item} className="chip chip-need">{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <h3>
        Steps <span className="muted">· tap to tick off</span>
      </h3>
      <ol className="steps">
        {recipe.steps.map((step, index) => (
          <li key={index}>
            <button
              className={`step ${doneSteps.includes(index) ? "done" : ""}`}
              onClick={() => toggleStep(index)}
              aria-pressed={doneSteps.includes(index)}
            >
              <span className="step-number">
                {doneSteps.includes(index) ? <Check size={14} /> : index + 1}
              </span>
              <span>{step}</span>
            </button>
          </li>
        ))}
      </ol>

      <div className="card-actions">
        <button className={`ghost-btn ${isSaved ? "is-active" : ""}`} onClick={onToggleSave}>
          <Heart size={16} aria-hidden="true" fill={isSaved ? "currentColor" : "none"} />
          {isSaved ? "Saved" : "Save"}
        </button>
        <button className="ghost-btn" onClick={copyRecipe}>
          {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <button className="ghost-btn" onClick={shareRecipe}>
          <Share2 size={16} aria-hidden="true" /> Share
        </button>
        <button className="ghost-btn" onClick={onAnotherIdea} disabled={busy}>
          <RefreshCw size={16} aria-hidden="true" /> Another idea
        </button>
      </div>
    </section>
  );
}
