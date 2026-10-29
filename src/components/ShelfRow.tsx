import { useState } from "react";
import { flushSync } from "react-dom";
import type { Book, Shelf } from "../lib/books";
import { Book3D } from "./Book3D";
import { Cover } from "./Cover";
import { Stars } from "./Stars";

interface Props {
  shelf: Shelf;
  books: Book[];
  /** The book whose dialog is open: stays turned cover-out until it closes */
  openId: string | null;
  onOpen: (book: Book) => void;
}

/** One wooden shelf of spines. Hover or focus pulls a book out and shows its cover on the right. */
export function ShelfRow({ shelf, books, openId, onOpen }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [turning, setTurning] = useState<string | null>(null);

  // Turn the book cover-out, wait for the turn to finish, then open its dialog.
  async function pick(book: Book, el: HTMLElement) {
    flushSync(() => setTurning(book.id));
    await Promise.allSettled(el.getAnimations().map((a) => a.finished));
    onOpen(book);
    setTurning(null);
  }

  const active = books.find((b) => b.id === activeId) ?? books[0] ?? null;
  const headingId = `shelf-${shelf.id}`;

  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-2">
      <h2
        id={headingId}
        className="flex items-baseline gap-2 text-lg font-extrabold text-stone-900"
      >
        {shelf.name}
        <span className="text-sm font-normal tabular-nums text-stone-600">{books.length}</span>
      </h2>
      <div className={`grid gap-3 ${active ? "sm:grid-cols-[1fr_13rem]" : ""}`}>
        <div className="relative overflow-hidden rounded-md bg-[linear-gradient(180deg,#3b2414,#5a3720_70%,#4a2c18)] shadow-[inset_0_10px_24px_rgba(0,0,0,0.55)]">
          {books.length === 0 ? (
            <p className="flex h-52 items-end p-4 text-sm text-amber-50">Nothing here yet.</p>
          ) : (
            <ul className="flex h-60 items-end gap-0.5 overflow-x-auto px-4 pt-10 [scrollbar-width:thin]">
              {books.map((b) => (
                <Book3D
                  key={b.id}
                  book={b}
                  open={turning === b.id || openId === b.id}
                  onPick={(el) => pick(b, el)}
                  onFocus={() => setActiveId(b.id)}
                />
              ))}
            </ul>
          )}
          {/* Shelf board: top face and front lip */}
          <div
            aria-hidden="true"
            className="h-3 bg-[linear-gradient(180deg,#a0703f,#7a4f2a)] shadow-[0_-6px_10px_rgba(0,0,0,0.35)]"
          />
          <div aria-hidden="true" className="h-3 bg-[linear-gradient(180deg,#6b4423,#3f2614)]" />
        </div>
        {active && (
          <aside
            aria-live="polite"
            aria-label={`Selected on ${shelf.name}`}
            className="flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-200 sm:flex-col"
          >
            <Cover
              key={active.id}
              title={active.title}
              url={active.coverUrl}
              className="h-36 w-24 shrink-0 rounded-md transition duration-300 ease-out starting:-translate-x-4 starting:opacity-0 motion-reduce:transition-none sm:mx-auto"
            />
            <div className="min-w-0">
              <p className="line-clamp-2 font-bold text-stone-900">{active.title}</p>
              {active.author && <p className="text-sm text-stone-700">{active.author}</p>}
              <div className="mt-1">
                <Stars value={active.rating} label={`${active.title} rating`} />
              </div>
              {active.review && (
                <p className="mt-1 line-clamp-3 text-sm italic text-stone-700">“{active.review}”</p>
              )}
            </div>
          </aside>
        )}
      </div>
    </section>
  );
}
