// Netlify Function that talks to Hugging Face on the server.
// The API key only exists here (as an environment variable), so it never
// ends up in the JavaScript that the browser downloads.
// Netlify serves this file at /api/recipe (see `config` at the bottom).
import { InferenceClient } from "@huggingface/inference";

const MODEL = "deepseek-ai/DeepSeek-R1-0528:fastest";

// Only these regions are accepted, so the endpoint can't be used for anything else.
// Keep this list in sync with REGIONS in src/constants.js.
const REGIONS = ["Nigeria", "West Africa", "East Africa", "Europe/UK"];
const MAX_INGREDIENTS = 30;
const MAX_TEXT_LENGTH = 200;

// The AI answers in JSON so the app can lay the recipe out as a card
// (title, match %, what you have vs. need, steps) instead of one block of text.
const SYSTEM_PROMPT = `
You are a helpful cooking assistant.

Your tasks:

1. If the user provides a list of ingredients:
   - Pick the meal that best matches the available ingredients (aim for at least 70% match).
   - If several meals fit, choose the closest and simplest one.
   - If no meal reaches 70%, still suggest the closest one and give its real match percentage.

2. If the user asks how to cook a specific dish:
   - List all the ingredients it needs and the cooking steps.

Reply with ONLY a JSON object, no Markdown and no extra text, in exactly this shape:

{
  "title": "Dish name",
  "summary": "One short sentence describing the dish.",
  "timeMinutes": 45,
  "serves": 4,
  "difficulty": "Easy" | "Medium" | "Hard",
  "matchPercent": 85,
  "have": ["ingredients from the user's list that this recipe uses"],
  "need": ["ingredients the user still needs, with rough quantities"],
  "steps": ["Short, clear step.", "Another step."]
}

Rules:
- For a specific dish request: "matchPercent" is null, "have" is [], and "need" lists every ingredient.
- Keep each step to one or two short sentences, and use 4 to 8 steps.
- No history, stories, or tips unless asked.`;

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// DeepSeek-R1 "thinks out loud" inside <think>...</think> before answering.
// Remove that part so only the answer is left.
function cleanReasoningOutput(text) {
  if (typeof text !== "string") return null;

  const cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Opening tag with no closing tag = response got cut off mid-reasoning
  if (/<think>/i.test(cleaned)) return null;

  return cleaned || null;
}

const toStringList = (value) =>
  Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim()).map((item) => item.trim())
    : [];

const toNumberOrNull = (value) =>
  Number.isFinite(Number(value)) && value !== null ? Math.round(Number(value)) : null;

// Pulls the JSON object out of the AI's reply and makes sure every field
// has the right type, so the React card never has to guess.
function parseRecipe(text) {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return null;

  let raw;
  try {
    raw = JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }

  const steps = toStringList(raw.steps);
  if (typeof raw.title !== "string" || !raw.title.trim() || steps.length === 0) return null;

  const match = toNumberOrNull(raw.matchPercent);

  return {
    title: raw.title.trim(),
    summary: typeof raw.summary === "string" ? raw.summary.trim() : "",
    timeMinutes: toNumberOrNull(raw.timeMinutes),
    serves: toNumberOrNull(raw.serves),
    difficulty: ["Easy", "Medium", "Hard"].includes(raw.difficulty) ? raw.difficulty : null,
    matchPercent: match === null ? null : Math.min(100, Math.max(0, match)),
    have: toStringList(raw.have),
    need: toStringList(raw.need),
    steps,
  };
}

// Turns the request body into the message we send to the AI.
// Returns null if the body isn't valid.
function buildUserMessage({ mode, ingredients, prompt, region, exclude }) {
  if (!REGIONS.includes(region)) return null;

  // "Another idea" sends the last dish so the AI suggests something different.
  const avoid =
    typeof exclude === "string" && exclude.trim() && exclude.length <= MAX_TEXT_LENGTH
      ? ` Suggest something other than ${exclude.trim()}.`
      : "";

  if (mode === "ingredients") {
    const valid =
      Array.isArray(ingredients) &&
      ingredients.length > 0 &&
      ingredients.length <= MAX_INGREDIENTS &&
      ingredients.every(
        (item) => typeof item === "string" && item.trim() && item.length <= MAX_TEXT_LENGTH
      );
    if (!valid) return null;

    return `I have ${ingredients.join(", ")}. Recommend a meal commonly made in ${region}.${avoid}`;
  }

  if (mode === "dish") {
    const trimmed = typeof prompt === "string" ? prompt.trim() : "";
    if (!trimmed || trimmed.length > MAX_TEXT_LENGTH) return null;

    return `I want to cook ${trimmed}, the way it's commonly made in ${region}.${avoid}`;
  }

  return null;
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return json({ error: "Method not allowed." }, 405);
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    return json({ error: "The recipe service isn't set up yet (missing API key)." }, 500);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const userMessage = buildUserMessage(body ?? {});
  if (!userMessage) {
    return json({ error: "Check your ingredients or dish name and try again." }, 400);
  }

  try {
    const client = new InferenceClient(apiKey);
    const response = await client.chatCompletion({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      // R1 spends part of its budget "thinking", so 1024 often cut recipes off.
      max_tokens: 4096,
    });

    const answer = cleanReasoningOutput(response.choices[0]?.message?.content);
    const recipe = answer && parseRecipe(answer);
    if (!recipe) {
      return json({ error: "The recipe came back incomplete. Try again." }, 502);
    }

    return json({ recipe });
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return json({ error: "Couldn't reach the recipe service. Try again in a moment." }, 502);
  }
}

export const config = { path: "/api/recipe" };
