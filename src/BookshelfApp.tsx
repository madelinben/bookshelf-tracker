import { Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AddBook } from "./components/AddBook";
import { BookDialog } from "./components/BookDialog";
import { DataBackup } from "./components/DataBackup";
import { ShelfRow } from "./components/ShelfRow";
import { field, ghost } from "./components/ui";
import { type BookshelfData, EMPTY, parseBookshelf } from "./lib/books";
import { spineFromCover } from "./lib/spine";
import { type BeforeExport, load, save } from "./lib/storage";

const KEY = "bookshelf-tracker";

export function BookshelfApp({ beforeExport }: { beforeExport?: BeforeExport }) {
  const [data, setData] = useState<BookshelfData>(EMPTY);
  const [ready, setReady] = useState(false);
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [shelfName, setShelfName] = useState("");

  // Load after mount: localStorage is unavailable during SSR and would cause a hydration mismatch.
  useEffect(() => {
    const stored = parseBookshelf(load<unknown>(KEY, null)) ?? EMPTY;
    setData(stored);
    setAdding(stored.books.length === 0);
    setReady(true);
  }, []);

  const update = (next: BookshelfData) => {
    setData(next);
    save(KEY, next);
  };
  const open = data.books.find((b) => b.id === openId) ?? null;

  // Spine colours come from the cover images (an external, async read): one book at a time,
  // each result saved so it's never read twice.
  const unread = data.books.find((b) => b.coverUrl && b.spine === undefined);
  const unreadId = unread?.id;
  const unreadUrl = unread?.coverUrl;
  useEffect(() => {
    if (!unreadId || !unreadUrl) return;
    let live = true;
    spineFromCover(unreadUrl).then((spine) => {
      if (!live) return;
      setData((d) => {
        const next = {
          ...d,
          books: d.books.map((b) => (b.id === unreadId ? { ...b, spine } : b)),
        };
        save(KEY, next);
        return next;
      });
    });
    return () => {
      live = false;
    };
  }, [unreadId, unreadUrl]);

  function addShelf(e: React.FormEvent) {
    e.preventDefault();
    const name = shelfName.trim().slice(0, 40);
    if (!name) return;
    update({ ...data, shelves: [...data.shelves, { id: crypto.randomUUID(), name }] });
    setShelfName("");
  }

  function removeShelf(id: string) {
    const fallback = data.shelves.find((s) => s.id !== id);
    if (!fallback || !confirm(`Delete this shelf? Its books move to ${fallback.name}.`)) return;
    update({
      ...data,
      shelves: data.shelves.filter((s) => s.id !== id),
      books: data.books.map((b) => (b.shelfId === id ? { ...b, shelfId: fallback.id } : b)),
    });
  }

  if (!ready) return <div className="h-full animate-pulse bg-stone-100" />;

  return (
    <div className="h-full overflow-y-auto bg-stone-50 text-stone-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm tabular-nums text-stone-700">
            {data.books.length} books · {data.books.filter((b) => b.rating).length} rated
          </p>
          <button
            type="button"
            onClick={() => setAdding(!adding)}
            aria-expanded={adding}
            className={ghost}
          >
            {adding ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            {adding ? "Done adding" : "Add a book"}
          </button>
        </div>

        {adding && (
          <AddBook
            shelves={data.shelves}
            onAdd={(draft, shelfId) =>
              update({
                ...data,
                books: [
                  ...data.books,
                  {
                    ...draft,
                    id: crypto.randomUUID(),
                    shelfId,
                    rating: 0,
                    review: "",
                    addedAt: new Date().toISOString(),
                  },
                ],
              })
            }
          />
        )}

        {data.shelves.map((s) => (
          <div key={s.id} className="group relative">
            <ShelfRow
              shelf={s}
              books={data.books.filter((b) => b.shelfId === s.id)}
              openId={openId}
              onOpen={(b) => setOpenId(b.id)}
            />
            {data.shelves.length > 1 && (
              <button
                type="button"
                onClick={() => removeShelf(s.id)}
                aria-label={`Delete shelf ${s.name}`}
                className="absolute right-0 top-0 grid size-11 place-items-center rounded-xl text-stone-600 hover:bg-rose-50 hover:text-rose-700 focus-visible:outline-2 focus-visible:outline-rose-700"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            )}
          </div>
        ))}

        <form onSubmit={addShelf} className="flex gap-2">
          <label htmlFor="new-shelf" className="sr-only">
            New shelf name
          </label>
          <input
            id="new-shelf"
            value={shelfName}
            onChange={(e) => setShelfName(e.target.value)}
            placeholder="New shelf: Holiday reads, Sci-fi…"
            className={`${field} flex-1`}
          />
          <button type="submit" className={ghost}>
            <Plus size={16} aria-hidden="true" />
            Add shelf
          </button>
        </form>

        <DataBackup
          filename="bookshelf-tracker.json"
          data={data}
          parse={parseBookshelf}
          onRestore={update}
          beforeExport={beforeExport}
        />
      </div>

      {open && (
        <BookDialog
          key={open.id}
          book={open}
          shelves={data.shelves}
          onChange={(b) =>
            update({ ...data, books: data.books.map((x) => (x.id === b.id ? b : x)) })
          }
          onDelete={() => {
            update({ ...data, books: data.books.filter((x) => x.id !== open.id) });
            setOpenId(null);
          }}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  );
}
