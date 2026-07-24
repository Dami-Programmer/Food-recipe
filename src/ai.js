import { InferenceClient } from "@huggingface/inference";

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page.
`;

const token = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const client = token ? new InferenceClient(token) : null;

export async function getRecipeFromMistral(ingredientsArr, region) {
  const ingredientsString = ingredientsArr.join(", ");

  if (!client) {
    return "Please add a Hugging Face API token to continue generating recipes.";
  }

  try {
    const response = await client.chatCompletion({
      model: "deepseek-ai/DeepSeek-R1-0528:fastest",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make that is commonly made in ${region}.`,
        },
      ],
      max_tokens: 1024,
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error(err instanceof Error ? err.message : err);
    return "I couldn't generate a recipe right now. Please try again in a moment.";
  }
}
