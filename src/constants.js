// Keep REGIONS in sync with the list in netlify/functions/recipe.mjs.
export const REGIONS = [
  { value: "Nigeria", label: "Nigeria" },
  { value: "West Africa", label: "West Africa" },
  { value: "East Africa", label: "East Africa" },
  { value: "Europe/UK", label: "Europe / UK" },
];

// One-tap chips under the ingredient input.
export const QUICK_ADD = [
  "Palm oil",
  "Plantain",
  "Yam",
  "Egusi",
  "Crayfish",
  "Beans",
  "Chicken",
  "Spinach",
];

// How many ingredients we need before asking the AI for a recipe.
export const MIN_INGREDIENTS = 4;

// Shown one after another while the AI is working.
export const LOADING_MESSAGES = [
  "Washing the rice…",
  "Blending the pepper…",
  "Heating the oil…",
  "Tasting for salt…",
  "Plating up…",
];
