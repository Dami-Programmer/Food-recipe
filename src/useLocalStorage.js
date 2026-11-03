import { useEffect, useState } from "react";

// Like useState, but the value is remembered in the browser between visits.
// localStorage can be blocked (private mode, strict settings), so every
// read and write is wrapped in try/catch and the app still works without it.
export default function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage unavailable: keep the value in memory only.
    }
  }, [key, value]);

  return [value, setValue];
}
