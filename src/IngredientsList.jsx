export default function IngredientsList({
  ingredients,
  setIngredients,
  getRecipe,
  loading,
  region,
  setRegion,
}) {
  return (
    <section>
      <h2>Ingredients on hand:</h2>
      <ul className="ingredients-list" aria-live="polite">
        {ingredients.map((ingredient) => (
          <li key={ingredient} className="ingredient-item">
            <button
              onClick={() =>
                setIngredients(ingredients.filter((i) => i !== ingredient))
              }
              className="delete-btn"
              aria-label={`Delete ${ingredient}`}
            >
              ✕
            </button>
            <span className="ingredient-text">{ingredient}</span>
          </li>
        ))}
      </ul>

      {ingredients.length > 3 && (
        <div className="get-recipe-container">
          <div>
            <h3>Ready for a recipe?</h3>
            <p>Generate a recipe from your list of ingredients.</p>
          </div>

          <div className="recipe-action" style={{ marginTop: "1rem" }}>
            <label htmlFor="region">Select Region: </label>
            <select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{ marginRight: "10px" }}
            >
              <option value="Nigeria">Nigeria</option>
              <option value="Africa">Africa</option>
              <option value="Europe/UK">Europe / UK</option>
            </select>

            {loading ? (
              "Loading..."
            ) : (
              <button onClick={getRecipe}>Get a recipe</button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
