import { Star } from "lucide-react";

/** Read-only rating; pass onChange for an accessible 1-5 radio group */
export function Stars({
  value,
  onChange,
  label,
}: {
  value: number;
  label: string;
  onChange?: (n: number) => void;
}) {
  if (!onChange) {
    return (
      <span
        className="inline-flex"
        role="img"
        aria-label={value ? `${value} out of 5 stars` : "Not rated"}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={16}
            aria-hidden="true"
            className={n <= value ? "fill-amber-400 text-amber-600" : "text-stone-300"}
          />
        ))}
      </span>
    );
  }
  return (
    <fieldset className="flex items-center">
      <legend className="sr-only">{label}</legend>
      {[1, 2, 3, 4, 5].map((n) => (
        <label key={n} className="grid size-11 cursor-pointer place-items-center">
          <input
            type="radio"
            name={label}
            checked={value === n}
            onChange={() => onChange(n)}
            className="peer sr-only"
          />
          <Star
            size={26}
            aria-hidden="true"
            className={`rounded peer-focus-visible:outline-2 peer-focus-visible:outline-amber-800 ${n <= value ? "fill-amber-400 text-amber-600" : "text-stone-300"}`}
          />
          <span className="sr-only">{n} out of 5</span>
        </label>
      ))}
    </fieldset>
  );
}
