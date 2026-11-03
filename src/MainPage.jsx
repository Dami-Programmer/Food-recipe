import { useEffect, useRef, useState } from "react";
import { Flame, Plus, Search, ShoppingBasket } from "lucide-react";
import IngredientPicker from "./IngredientPicker";
import RegionPicker from "./RegionPicker";
import RecipeCard from "./RecipeCard";
import RecipeSkeleton from "./RecipeSkeleton";
import SavedRecipes from "./SavedRecipes";
import { getRecipeFromDish, getRecipeFromIngredients } from "./ai";
import { MIN_INGREDIENTS } from "./constants";

export default function MainPage({ savedRecipes, setSavedRecipes, showSaved, setShowSaved }) {
  // "ingredients" = cook from what you have, "dish" = describe a meal
  const [mode, setMode] = useState("ingredients");
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [region, setRegion] = useState("Nigeria");

  // The recipe on screen, plus the region and request that produced it
  // (needed for the Save button and "Another idea").
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const resultRef = useRef(null);

  // Scroll the recipe (or loading card) into view so people on phones see it.
  useEffect(() => {
    if (loading || result || error) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, result, error]);

  function switchMode(nextMode) {
    setMode(nextMode);
    setInputValue("");
    setInputError("");
  }

  function addIngredient(name) {
    const trimmed = name.trim();
    if (!trimmed) {
      setInputError("Type an ingredient first");
      return false;
    }
    // Skip duplicates ("Rice" and "rice" count as the same), since React
    // uses the ingredient name as the list key.
    if (ingredients.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      setInputError(`${trimmed} is already on your list`);
      return false;
    }
    setIngredients((prev) => [...prev, trimmed[0].toUpperCase() + trimmed.slice(1)]);
    return true;
  }

  // Runs one AI request. `request` remembers what was asked so
  // "Another idea" can ask again for a different dish.
  async function cook(request, exclude) {
    if (loading) return;
    setLoading(true);
    setError("");

    const { recipe, error: requestError } =
      request.mode === "ingredients"
        ? await getRecipeFromIngredients(request.ingredients, request.region, exclude)
        : await getRecipeFromDish(request.dish, request.region, exclude);

    if (recipe) {
      setResult({ recipe, request, id: Date.now() });
    } else {
      setError(requestError);
    }
    setLoading(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (mode === "ingredients") {
      if (addIngredient(inputValue)) setInputValue("");
      return;
    }
    if (!inputValue.trim()) {
      setInputError("Type a dish first");
      return;
    }
    cook({ mode: "dish", dish: inputValue.trim(), region });
  }

  function findRecipe() {
    const remaining = MIN_INGREDIENTS - ingredients.length;
    if (remaining > 0) {
      setInputError(`Add ${remaining} more ingredient${remaining === 1 ? "" : "s"} first`);
      return;
    }
    cook({ mode: "ingredients", ingredients, region });
  }

  // A recipe counts as saved if one with the same title and region is in the list.
  const savedMatch =
    result &&
    savedRecipes.find(
      (saved) =>
        saved.recipe.title === result.recipe.title && saved.region === result.request.region
    );

  function toggleSave() {
    if (savedMatch) {
      setSavedRecipes((list) => list.filter((saved) => saved.id !== savedMatch.id));
    } else {
      setSavedRecipes((list) => [
        { id: Date.now(), recipe: result.recipe, region: result.request.region },
        ...list,
      ]);
    }
  }

  function openSaved(saved) {
    setResult({
      recipe: saved.recipe,
      request: { mode: "dish", dish: saved.recipe.title, region: saved.region },
      id: Date.now(),
    });
    setError("");
    setShowSaved(false);
  }

  const isIngredientsMode = mode === "ingredients";

  return (
    <main className="page">
      {showSaved && (
        <SavedRecipes
          recipes={savedRecipes}
          onOpen={openSaved}
          onRemove={(id) => setSavedRecipes((list) => list.filter((saved) => saved.id !== id))}
          onClose={() => setShowSaved(false)}
        />
      )}

      <section className="hero">
        <h1>What are we cooking today?</h1>
        <p className="muted">Tell us what's in your kitchen, or name a dish.</p>

        <div
          className="mode-switch"
          role="tablist"
          aria-label="How do you want to cook?"
          data-mode={mode}
        >
          {/* The white pill behind the active option. It slides left/right
              (see .mode-indicator in index.css) instead of jumping. */}
          <span className="mode-indicator" aria-hidden="true" />
          <button
            role="tab"
            aria-selected={isIngredientsMode}
            className={isIngredientsMode ? "is-active" : ""}
            onClick={() => switchMode("ingredients")}
          >
            <ShoppingBasket size={16} aria-hidden="true" /> Use my ingredients
          </button>
          <button
            role="tab"
            aria-selected={!isIngredientsMode}
            className={!isIngredientsMode ? "is-active" : ""}
            onClick={() => switchMode("dish")}
          >
            <Search size={16} aria-hidden="true" /> Describe a meal
          </button>
        </div>
      </section>

      <section className="composer">
        <form onSubmit={handleSubmit} className="input-row">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setInputError("");
            }}
            placeholder={isIngredientsMode ? "Add an ingredient" : "Name a dish, like egusi soup"}
            aria-label={isIngredientsMode ? "Add an ingredient" : "Name a dish"}
            aria-invalid={Boolean(inputError)}
            aria-describedby="input-error"
            maxLength={200}
          />
          <button type="submit" className={isIngredientsMode ? "secondary-btn" : "primary-btn"} disabled={loading}>
            {isIngredientsMode ? (
              <><Plus size={16} aria-hidden="true" /> Add</>
            ) : (
              <><Flame size={16} aria-hidden="true" /> {loading ? "Cooking…" : "Cook"}</>
            )}
          </button>
        </form>
        <p id="input-error" className="input-error" role="alert">{inputError}</p>

        {isIngredientsMode && (
          <IngredientPicker
            ingredients={ingredients}
            onAdd={(name) => {
              setInputError("");
              addIngredient(name);
            }}
            onRemove={(name) => setIngredients((list) => list.filter((item) => item !== name))}
          />
        )}

        <RegionPicker region={region} setRegion={setRegion} />

        {/* On phones this bar sticks to the bottom of the screen, within thumb reach. */}
        {isIngredientsMode && (
          <div className="cook-bar">
            <button className="primary-btn" onClick={findRecipe} disabled={loading}>
              <Flame size={16} aria-hidden="true" /> {loading ? "Cooking…" : "Find my recipe"}
            </button>
          </div>
        )}
      </section>

      <div ref={resultRef} className="result-area">
        {loading && <RecipeSkeleton />}

        {!loading && error && (
          <section className="card error-card" role="alert">
            <p>{error}</p>
            {result && (
              <button className="ghost-btn" onClick={() => setError("")}>
                Back to last recipe
              </button>
            )}
          </section>
        )}

        {!loading && !error && result && (
          <RecipeCard
            key={result.id}
            recipe={result.recipe}
            region={result.request.region}
            isSaved={Boolean(savedMatch)}
            onToggleSave={toggleSave}
            onAnotherIdea={() => cook(result.request, result.recipe.title)}
            busy={loading}
          />
        )}
      </div>
    </main>
  );
}
