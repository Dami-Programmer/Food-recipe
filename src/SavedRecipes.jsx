import { Trash2, X } from "lucide-react";

export default function SavedRecipes({ recipes, onOpen, onRemove, onClose }) {
  return (
    <section className="card saved-panel" aria-label="Saved recipes">
      <div className="saved-header">
        <h2>Saved recipes</h2>
        <button className="icon-btn" onClick={onClose} aria-label="Close saved recipes">
          <X size={16} />
        </button>
      </div>

      {recipes.length === 0 ? (
        <p className="muted">Tap the heart on any recipe to keep it here.</p>
      ) : (
        <ul className="saved-list">
          {recipes.map((saved) => (
            <li key={saved.id}>
              <button className="saved-open" onClick={() => onOpen(saved)}>
                <strong>{saved.recipe.title}</strong>
                <span className="muted">{saved.region}</span>
              </button>
              <button
                className="icon-btn"
                onClick={() => onRemove(saved.id)}
                aria-label={`Remove ${saved.recipe.title}`}
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
