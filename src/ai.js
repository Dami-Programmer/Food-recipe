// The browser never talks to Hugging Face directly.
// It asks our own server route (/api/recipe), which holds the API key.
// See netlify/functions/recipe.mjs for the server side.

const GENERIC_ERROR = "Couldn't reach the recipe service. Try again in a moment.";

// Always resolves to { recipe } on success or { error } on failure,
// so the UI only has to check which one it got.
async function requestRecipe(payload) {
  try {
    const response = await fetch("/api/recipe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data.recipe) return { error: data.error || GENERIC_ERROR };

    return { recipe: data.recipe };
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return { error: GENERIC_ERROR };
  }
}

export function getRecipeFromIngredients(ingredients, region, exclude) {
  return requestRecipe({ mode: "ingredients", ingredients, region, exclude });
}

export function getRecipeFromDish(dish, region, exclude) {
  return requestRecipe({ mode: "dish", prompt: dish, region, exclude });
}
