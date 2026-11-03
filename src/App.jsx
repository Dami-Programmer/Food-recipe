import { useEffect, useState } from "react";
import Header from "./Header";
import MainPage from "./MainPage";
import useLocalStorage from "./useLocalStorage";

export default function App() {
  // "system" follows the device setting; "light" / "dark" are the user's choice.
  const [theme, setTheme] = useLocalStorage("newtz-theme", "system");
  const [savedRecipes, setSavedRecipes] = useLocalStorage("newtz-saved", []);
  const [showSaved, setShowSaved] = useState(false);

  // The CSS reads data-theme on <html> to pick light or dark colours.
  useEffect(() => {
    if (theme === "system") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [theme]);

  function toggleTheme() {
    const systemIsDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentlyDark = theme === "dark" || (theme === "system" && systemIsDark);
    setTheme(currentlyDark ? "light" : "dark");
  }

  return (
    <>
      <Header
        savedCount={savedRecipes.length}
        showSaved={showSaved}
        onToggleSaved={() => setShowSaved((open) => !open)}
        onToggleTheme={toggleTheme}
      />
      <MainPage
        savedRecipes={savedRecipes}
        setSavedRecipes={setSavedRecipes}
        showSaved={showSaved}
        setShowSaved={setShowSaved}
      />
    </>
  );
}
