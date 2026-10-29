import { Camera, ImagePlus, PenLine, Plus, Search } from "lucide-react";
import { useState } from "react";
import { type BookDraft, coverFromFile, searchBooks, type Shelf } from "../lib/books";
import { Cover } from "./Cover";
import { canScan, Scanner } from "./Scanner";
import { field, ghost, primary } from "./ui";

type Mode = "search" | "scan" | "manual";

interface Props {
  shelves: Shelf[];
  onAdd: (draft: BookDraft, shelfId: string) => void;
}

export function AddBook({ shelves, onAdd }: Props) {
  const [mode, setMode] = useState<Mode>("search");
  const [shelfId, setShelfId] = useState(shelves[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<BookDraft[]>([]);
  const [status, setStatus] = useState("");
  const [manual, setManual] = useState<BookDraft>({ title: "", author: "", isbn: null, coverUrl: null });

  async function search(q: string) {
    if (!q.trim()) return;
    setStatus("Searching…");
    try {
      const found = await searchBooks(q.trim());
      setResults(found);
      setStatus(found.length ? `${found.length} results` : "No matches. Try another spelling or add it yourself.");
    } catch {
      setStatus("Search is unavailable right now. Add the book yourself instead.");
    }
  }

  function add(draft: BookDraft) {
    onAdd(draft, shelfId);
    setStatus(`Added ${draft.title}.`);
  }

  const modes = [
    { id: "search", label: "Search", Icon: Search },
    ...(canScan() ? [{ id: "scan", label: "Scan barcode", Icon: Camera } as const] : []),
    { id: "manual", label: "Add your own", Icon: PenLine },
  ] as const;

  return (
    <section aria-labelledby="add-h" className="flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-stone-200">
      <h2 id="add-h" className="text-lg font-extrabold">
        Add a book
      </h2>
      <div className="flex flex-wrap gap-2">
        {modes.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={mode === id}
            onClick={() => setMode(id)}
            className={`${ghost} aria-pressed:bg-amber-800 aria-pressed:text-white aria-pressed:ring-amber-800`}
          >
            <Icon size={16} aria-hidden="true" />
            {label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-2 text-sm font-semibold">
          Shelf
          <select value={shelfId} onChange={(e) => setShelfId(e.target.value)} className={field}>
            {shelves.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {mode === "search" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            search(query);
          }}
          className="flex gap-2"
        >
          <label htmlFor="book-q" className="sr-only">
            Title, author or ISBN
          </label>
          <input id="book-q" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Title, author or ISBN" className={`${field} flex-1`} />
          <button type="submit" className={primary}>
            <Search size={16} aria-hidden="true" />
            Search
          </button>
        </form>
      )}

      {mode === "scan" && (
        <Scanner
          onIsbn={(isbn) => {
            setMode("search");
            setQuery(isbn);
            search(isbn);
          }}
        />
      )}

      {mode === "manual" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!manual.title.trim()) return;
            add({ ...manual, title: manual.title.trim().slice(0, 120), author: manual.author.trim().slice(0, 80) });
            setManual({ title: "", author: "", isbn: null, coverUrl: null });
          }}
          className="grid gap-3 sm:grid-cols-[6rem_1fr]"
        >
          <label className="flex cursor-pointer flex-col items-center gap-1 text-xs font-semibold text-stone-700 has-focus-visible:outline-2 has-focus-visible:outline-amber-800">
            {manual.coverUrl ? (
              <img src={manual.coverUrl} alt="Chosen cover" className="h-36 w-24 rounded-md object-cover" />
            ) : (
              <span className="grid h-36 w-24 place-items-center rounded-md border-2 border-dashed border-stone-300">
                <ImagePlus size={22} aria-hidden="true" />
              </span>
            )}
            Cover photo
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) setManual({ ...manual, coverUrl: await coverFromFile(file) });
              }}
            />
          </label>
          <div className="flex flex-col gap-2">
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Title
              <input value={manual.title} onChange={(e) => setManual({ ...manual, title: e.target.value })} className={field} required />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold">
              Author
              <input value={manual.author} onChange={(e) => setManual({ ...manual, author: e.target.value })} className={field} />
            </label>
            <button type="submit" className={primary}>
              <Plus size={16} aria-hidden="true" />
              Add to shelf
            </button>
          </div>
        </form>
      )}

      <p role="status" className="text-sm text-stone-700">
        {status}
      </p>
      {mode === "search" && results.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {results.map((r) => (
            <li key={`${r.title}-${r.isbn}`} className="flex flex-col gap-2 rounded-xl p-2 ring-1 ring-stone-200">
              <Cover title={r.title} url={r.coverUrl} className="mx-auto h-32 w-20 rounded" />
              <p className="line-clamp-2 text-sm font-bold">{r.title}</p>
              <p className="line-clamp-1 text-xs text-stone-700">{r.author}</p>
              <button type="button" onClick={() => add(r)} className={`${ghost} mt-auto`} aria-label={`Add ${r.title}`}>
                <Plus size={14} aria-hidden="true" />
                Add
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-stone-600">
        Book data and covers from{" "}
        <a href="https://openlibrary.org" target="_blank" rel="noopener noreferrer" className="underline">
          Open Library<span className="sr-only"> (opens in a new tab)</span>
        </a>
        .
      </p>
    </section>
  );
}
