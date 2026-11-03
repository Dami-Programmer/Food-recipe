# Newtz Chef: Food Recipe

An AI cooking assistant built with React. Tell it what's in your kitchen, or just describe the meal you want, and it writes a short, step-by-step recipe in the style of the region you pick (Nigeria, West Africa, East Africa, or Europe/UK).

**Live demo:** [newtz-chef.netlify.app](https://newtz-chef.netlify.app)

![A Chicken Plantain Stew recipe card in Newtz Chef](screenshot.png)

## Features

- **Cook from what you have:** add 4 or more ingredients (or tap the quick-add chips) and get the meal that best matches them, with a match % and a list of anything missing.
- **Describe a meal:** type something like "jollof rice" and get the ingredients and steps.
- **Regional recipes:** choose Nigeria, West Africa, East Africa, or Europe/UK.
- **Recipe card:** tick off steps as you cook, copy or share the recipe, ask for another idea, or watch cooking videos on YouTube.
- **Saved recipes:** heart a recipe to keep it (stored in your browser).
- **Light and dark mode**, and a layout that works on phones.
- **Your API key stays private:** the AI request runs in a Netlify Function, so the key never reaches the browser.

## Tech stack

- [React 19](https://react.dev/) + [Vite](https://vite.dev/)
- [Groq](https://console.groq.com) (free tier) running OpenAI gpt-oss-120b
- [Netlify Functions](https://docs.netlify.com/functions/overview/) for the server-side API route
- [Lucide](https://lucide.dev/) icons

## How it works

```
Browser (React)  ──POST /api/recipe──▶  Netlify Function  ──▶  Groq (gpt-oss-120b)
                 ◀──── recipe text ────  (holds the API key)
```

- `src/`: the React app
- `netlify/functions/recipe.mjs`: the server route that builds the prompt and calls the AI
- `vite.config.js`: runs that same function during local development

## Run it locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and add your free [Groq API key](https://console.groq.com/keys):
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

## Deploy to Netlify

1. Push the repo to GitHub and import it in Netlify. The build settings come from `netlify.toml`.
2. In **Site configuration → Environment variables**, add `GROQ_API_KEY`.
3. Deploy.

## What I learned

This was my first React project. It covers components and props, `useState`, forms, rendering lists, calling an AI API, and keeping secrets off the front end.
