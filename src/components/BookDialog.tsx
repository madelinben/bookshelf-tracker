import { Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Book, Shelf } from "../lib/books";
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

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="book-title"
      className="m-auto w-[min(32rem,calc(100vw-2rem))] rounded-2xl bg-white p-0 text-stone-900 shadow-2xl backdrop:bg-stone-900/50"
    >
      <div className="flex gap-4 p-4">
        <Cover title={book.title} url={book.coverUrl} className="h-40 w-26 shrink-0 rounded-md" />
        <div className="min-w-0 flex-1">
          <h2 id="book-title" className="text-xl font-extrabold">
            {book.title}
          </h2>
          {book.author && <p className="text-stone-700">{book.author}</p>}
          {book.isbn && <p className="text-xs tabular-nums text-stone-600">ISBN {book.isbn}</p>}
          <Stars
            value={book.rating}
            label="Your rating"
            onChange={(rating) => onChange({ ...book, rating })}
          />
        </div>
        <button
          type="button"
          onClick={() => ref.current?.close()}
          aria-label="Close"
          className="grid size-11 shrink-0 place-items-center rounded-xl hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-amber-800"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <div className="flex flex-col gap-3 border-t border-stone-200 p-4">
        <label className="flex flex-col gap-1 text-sm font-semibold">
          Your review
          <textarea
            value={book.review}
            onChange={(e) => onChange({ ...book, review: e.target.value.slice(0, 2000) })}
            rows={4}
            placeholder="What stayed with you?"
            className={`${field} py-2`}
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
      </div>
    </dialog>
  );
}
