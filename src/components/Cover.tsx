import { BookOpen } from "lucide-react";
import { useState } from "react";
import { spineStyle } from "../lib/books";

/** Book cover, or a coloured placeholder when there is none or it fails to load */
export function Cover({
  title,
  url,
  className = "",
}: {
  title: string;
  url: string | null;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        className={`object-cover shadow-md ${className}`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`grid place-items-center p-2 text-center text-xs font-bold text-white shadow-md ${className}`}
      style={{ backgroundColor: spineStyle(title).colour }}
    >
      <BookOpen size={20} />
    </div>
  );
}
