import { REGIONS } from "./constants";

// Chips instead of a dropdown: there are only a few choices, so show them all.
export default function RegionPicker({ region, setRegion }) {
  return (
    <div className="region-picker" role="radiogroup" aria-label="Cuisine region">
      {REGIONS.map(({ value, label }) => (
        <button
          key={value}
          role="radio"
          aria-checked={region === value}
          className={`chip ${region === value ? "chip-selected" : ""}`}
          onClick={() => setRegion(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
