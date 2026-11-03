import { useEffect, useState } from "react";
import { LOADING_MESSAGES } from "./constants";

// Grey placeholder shaped like the recipe card, shown while the AI works.
export default function RecipeSkeleton() {
  const [index, setIndex] = useState(0);

  // Swap to the next cooking message every 1.8 seconds.
  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % LOADING_MESSAGES.length),
      1800
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="card recipe-card" aria-busy="true">
      <p className="loading-message" aria-live="polite">
        {LOADING_MESSAGES[index]}
      </p>
      <div className="skeleton" style={{ width: "60%", height: 28 }} />
      <div className="skeleton" style={{ width: "40%", height: 14 }} />
      <div className="skeleton-grid">
        <div className="skeleton" style={{ height: 70 }} />
        <div className="skeleton" style={{ height: 70 }} />
      </div>
      {[90, 80, 85, 70].map((width) => (
        <div key={width} className="skeleton" style={{ width: `${width}%`, height: 14 }} />
      ))}
    </section>
  );
}
