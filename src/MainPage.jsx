import React, { useState } from "react";
import IngredientsList from "./IngredientsList";
import ClaudeRecipe from "./ClaudeRecipe";
import { getRecipeFromMistral } from "./ai";

export default function MainPage() {
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState("");
  const [loading, setLoading] = useState(false);
  const [region, setRegion] = useState("Nigeria");

  async function getRecipe() {
    setLoading(true);
    const recipeMarkdown = await getRecipeFromMistral(ingredients, region);
    if (recipeMarkdown) setRecipe(recipeMarkdown);
    setLoading(false);
  }

  function addIngredient(e) {
    e.preventDefault(); // prevent form submission reload
    const formData = new FormData(e.target);
    const newIngredient = formData.get("ingredient");
    if (newIngredient && newIngredient.trim() !== "") {
      setIngredients((prev) => [...prev, newIngredient.trim()]);
      e.target.reset(); // clear input
    }
  }

  return (
    <main>
      <form onSubmit={addIngredient} className="add-ingredient-form">
        <input
          type="text"
          placeholder="e.g. oregano"
          aria-label="Add ingredient"
          name="ingredient"
        />
        <button type="submit">Add ingredient</button>
      </form>

      {ingredients.length > 0 && (
        <IngredientsList
          ingredients={ingredients}
          setIngredients={setIngredients}
          getRecipe={getRecipe}
          loading={loading}
          region={region}
          setRegion={setRegion}
        />
      )}

      {recipe && <ClaudeRecipe recipe={recipe} />}
    </main>
  );
}
