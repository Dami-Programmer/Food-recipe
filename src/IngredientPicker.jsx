import { Plus, X } from "lucide-react";
import { MIN_INGREDIENTS, QUICK_ADD } from "./constants";

export default function IngredientPicker({ ingredients, onAdd, onRemove }) {
  const has = (name) => ingredients.some((item) => item.toLowerCase() === name.toLowerCase());
  const suggestions = QUICK_ADD.filter((name) => !has(name));

  const progress = Math.min(ingredients.length / MIN_INGREDIENTS, 1);
  const remaining = MIN_INGREDIENTS - ingredients.length;

  return (
    <div className="ingredient-picker">
      {ingredients.length > 0 && (
        <ul className="chip-row" aria-label="Your ingredients" aria-live="polite">
          {ingredients.map((name) => (
            <li key={name}>
              <button className="chip chip-selected" onClick={() => onRemove(name)}>
                {name}
                <X size={14} aria-label={`Remove ${name}`} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {suggestions.length > 0 && (
        <>
          <p className="small-label">Quick add</p>
          <div className="chip-row">
            {suggestions.map((name) => (
              <button key={name} className="chip" onClick={() => onAdd(name)}>
                <Plus size={14} aria-hidden="true" />
                {name}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Shows how close you are to unlocking "Find my recipe" */}
      <div
        className="progress"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={MIN_INGREDIENTS}
        aria-valuenow={Math.min(ingredients.length, MIN_INGREDIENTS)}
      >
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>
      <p className="hint">
        {remaining > 0
          ? `Add ${remaining} more ingredient${remaining === 1 ? "" : "s"} to find a recipe`
          : "Ready. Add more for a closer match."}
      </p>
    </div>
  );
}
