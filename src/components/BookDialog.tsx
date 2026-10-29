import { Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { type Book, type Shelf, spineStyle } from "../lib/books";
import { Cover } from "./Cover";
import { Stars } from "./Stars";
import { field } from "./ui";

interface Props {
  book: Book;
  shelves: Shelf[];
  onChange: (book: Book) => void;
  onDelete: () => void;
  onClose: () => void;
}

/** Native modal dialog: focus trap, Escape and backdrop come from the browser */
export function BookDialog({ book, shelves, onChange, onDelete, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  // showModal() is the only way to open a dialog modally; it runs once on mount.
  useEffect(() => ref.current?.showModal(), []);

  const bg = book.spine?.bg ?? spineStyle(book.title).colour;
  const page = "bg-[#fbf7ee] bg-[linear-gradient(90deg,rgba(0,0,0,0.08),transparent_8%)]";
  const coverArt = (
    <Cover title={book.title} url={book.coverUrl} className="h-full w-full rounded-sm" />
  );

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="book-title"
      className="m-auto w-[min(48rem,calc(100vw-2rem))] overflow-visible bg-transparent p-0 text-stone-900 backdrop:bg-stone-950/70"
    >
      <div className="grid [perspective:2400px] sm:grid-cols-2">
        {/* Left page: where the cover lands once it swings open */}
        <div
          aria-hidden="true"
          className="hidden rounded-l-lg shadow-2xl sm:block"
          style={{ backgroundColor: bg }}
        />

        {/* Right page: the details */}
        <div
          className={`relative flex min-h-[28rem] flex-col gap-3 rounded-lg p-5 shadow-2xl sm:rounded-l-none ${page}`}
        >
          <div className="flex items-start gap-3">
            <Cover
              title={book.title}
              url={book.coverUrl}
              className="h-24 w-16 shrink-0 rounded-sm sm:hidden"
            />
            <div className="min-w-0 flex-1">
              <h2 id="book-title" className="font-serif text-2xl font-bold leading-tight">
                {book.title}
              </h2>
              {book.author && <p className="text-stone-700">{book.author}</p>}
              {book.isbn && <p className="text-xs tabular-nums text-stone-600">ISBN {book.isbn}</p>}
            </div>
            <button
              type="button"
              onClick={() => ref.current?.close()}
              aria-label="Close"
              className="grid size-11 shrink-0 place-items-center rounded-xl hover:bg-stone-200/60 focus-visible:outline-2 focus-visible:outline-amber-800"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>
          <Stars
            value={book.rating}
            label="Your rating"
            onChange={(rating) => onChange({ ...book, rating })}
          />
          <label className="flex flex-1 flex-col gap-1 text-sm font-semibold">
            Your review
            <textarea
              value={book.review}
              onChange={(e) => onChange({ ...book, review: e.target.value.slice(0, 2000) })}
              rows={5}
              placeholder="What stayed with you?"
              className={`${field} flex-1 bg-white/70 py-2 font-serif text-base font-normal`}
            />
          </label>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Shelf
              <select
                value={book.shelfId}
                onChange={(e) => onChange({ ...book, shelfId: e.target.value })}
                className={field}
              >
                {shelves.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => {
                if (confirm(`Remove ${book.title}?`)) onDelete();
              }}
              className="inline-flex min-h-11 items-center gap-1 rounded-xl px-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-700"
            >
              <Trash2 size={16} aria-hidden="true" />
              Remove book
            </button>
          </div>

          {/* The cover: starts closed over this page, swings open on its left hinge */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 origin-left [transform-style:preserve-3d] [transform:rotateY(-180deg)] transition-transform delay-150 duration-[1100ms] ease-[cubic-bezier(0.35,0.1,0.2,1)] starting:[transform:rotateY(0deg)] motion-reduce:transition-none"
          >
            <div
              className="absolute inset-0 overflow-hidden rounded-r-lg shadow-xl [backface-visibility:hidden]"
              style={{ backgroundColor: bg }}
            >
              {coverArt}
            </div>
            {/* Inside of the cover: the art again, framed on paper, so the open spread shows it */}
            <div
              className={`absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-l-lg p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] ${page}`}
            >
              <div className="aspect-[2/3] h-[80%] max-w-full overflow-hidden rounded-sm shadow-lg">
                {coverArt}
              </div>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
