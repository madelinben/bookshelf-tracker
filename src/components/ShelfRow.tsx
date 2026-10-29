import { useState } from "react";
import { type Book, type Shelf, spineStyle } from "../lib/books";
import { Cover } from "./Cover";
import { Stars } from "./Stars";

interface Props {
  shelf: Shelf;
  books: Book[];
  onOpen: (book: Book) => void;
}

/** One wooden shelf of spines. Hover or focus pulls a book out and shows its cover on the right. */
export function ShelfRow({ shelf, books, onOpen }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = books.find((b) => b.id === activeId) ?? books[0] ?? null;
  const headingId = `shelf-${shelf.id}`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2 id={headingId} className="flex items-baseline gap-2 text-lg font-extrabold text-stone-900">
        {shelf.name}
        <span className="text-sm font-normal tabular-nums text-stone-600">{books.length}</span>
      </h2>
      <div className="grid gap-3 sm:grid-cols-[1fr_13rem]">
        <div className="rounded-b-md border-b-[14px] border-amber-900 bg-gradient-to-b from-amber-50 to-amber-100/70 shadow-[inset_0_-6px_8px_-6px_rgba(0,0,0,0.25)]">
          {books.length === 0 ? (
            <p className="flex h-48 items-end p-4 text-sm text-stone-600">Nothing here yet.</p>
          ) : (
            <ul className="flex h-56 items-end gap-1 overflow-x-auto px-3 pt-6">
              {books.map((b) => {
                const s = spineStyle(b.title);
                const isActive = active?.id === b.id;
                return (
                  <li key={b.id} className="shrink-0">
                    <button
                      type="button"
                      onMouseEnter={() => setActiveId(b.id)}
                      onFocus={() => setActiveId(b.id)}
                      onClick={() => onOpen(b)}
                      aria-label={`${b.title}${b.author ? ` by ${b.author}` : ""}. Open details`}
                      style={{ backgroundColor: s.colour, height: `${s.heightRem}rem`, width: `${s.widthRem}rem` }}
                      className={`relative flex items-center justify-center overflow-hidden rounded-t-sm border-x border-black/20 text-white shadow-[inset_3px_0_4px_rgba(255,255,255,0.15),inset_-3px_0_4px_rgba(0,0,0,0.25)] transition-transform duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-800 motion-reduce:transition-none ${
                        isActive ? "-translate-y-5 rotate-[-2deg]" : "hover:-translate-y-3"
                      }`}
                    >
                      <span className="absolute inset-x-0 top-2 h-0.5 bg-amber-300/70" aria-hidden="true" />
                      <span className="max-h-[85%] truncate text-xs font-bold tracking-wide [writing-mode:vertical-rl] rotate-180">
                        {b.title}
                      </span>
                      <span className="absolute inset-x-0 bottom-2 h-0.5 bg-amber-300/70" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {active && (
          <aside aria-live="polite" aria-label={`Selected on ${shelf.name}`} className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-200 sm:flex-col">
            <Cover key={active.id} title={active.title} url={active.coverUrl} className="h-36 w-24 shrink-0 rounded-md transition duration-300 ease-out starting:-translate-x-4 starting:opacity-0 motion-reduce:transition-none sm:mx-auto" />
            <div className="min-w-0">
              <p className="line-clamp-2 font-bold text-stone-900">{active.title}</p>
              {active.author && <p className="text-sm text-stone-700">{active.author}</p>}
              <div className="mt-1">
                <Stars value={active.rating} label={`${active.title} rating`} />
              </div>
              {active.review && <p className="mt-1 line-clamp-3 text-sm italic text-stone-700">“{active.review}”</p>}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
