export interface Shelf {
  id: string;
  name: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string | null;
  /** Remote cover URL, or a small data URL for an uploaded photo */
  coverUrl: string | null;
  shelfId: string;
  /** 0 = not rated, else 1..5 */
  rating: number;
  review: string;
  addedAt: string;
}

export interface BookshelfData {
  version: 1;
  shelves: Shelf[];
  books: Book[];
}

export const EMPTY: BookshelfData = {
  version: 1,
  shelves: [
    { id: "reading", name: "Reading now" },
    { id: "read", name: "Read" },
    { id: "want", name: "Want to read" },
  ],
  books: [],
};

/** A search or barcode result, before it is put on a shelf */
export type BookDraft = Pick<Book, "title" | "author" | "isbn" | "coverUrl">;

// Deep spine colours: white title text passes WCAG AA contrast on every one
const SPINES = ["#7f1d1d", "#9a3412", "#854d0e", "#3f6212", "#14532d", "#115e59", "#164e63", "#1e3a8a", "#3730a3", "#581c87", "#831843", "#44403c"];

function hash(text: string): number {
  let h = 0;
  for (const c of text) h = (h * 31 + (c.codePointAt(0) ?? 0)) | 0;
  return Math.abs(h);
}

/** Same book, same spine on every device */
export function spineStyle(title: string): { colour: string; heightRem: number; widthRem: number } {
  const h = hash(title);
  return {
    colour: SPINES[h % SPINES.length] ?? "#44403c",
    heightRem: 9 + (h % 4),
    widthRem: 2.25 + ((h >> 3) % 3) * 0.375,
  };
}

/** ISBN-10 or ISBN-13 with a valid check digit; hyphens and spaces ignored */
export function normaliseIsbn(text: string): string | null {
  const s = text.replace(/[\s-]/g, "").toUpperCase();
  if (/^\d{13}$/.test(s)) {
    const sum = [...s].reduce((n, d, i) => n + Number(d) * (i % 2 ? 3 : 1), 0);
    return sum % 10 === 0 ? s : null;
  }
  if (/^\d{9}[\dX]$/.test(s)) {
    const sum = [...s].reduce((n, d, i) => n + (d === "X" ? 10 : Number(d)) * (10 - i), 0);
    return sum % 11 === 0 ? s : null;
  }
  return null;
}

interface OpenLibraryDoc {
  title?: string;
  author_name?: string[];
  isbn?: string[];
  cover_i?: number;
}

const FIELDS = "title,author_name,isbn,cover_i";

export function toDraft(d: OpenLibraryDoc, isbn?: string): BookDraft {
  const id = isbn ?? d.isbn?.find((i) => i.length === 13) ?? d.isbn?.[0] ?? null;
  return {
    title: d.title ?? "Untitled",
    author: d.author_name?.slice(0, 2).join(", ") ?? "",
    isbn: id,
    coverUrl: d.cover_i
      ? `https://covers.openlibrary.org/b/id/${d.cover_i}-M.jpg`
      : id
        ? `https://covers.openlibrary.org/b/isbn/${id}-M.jpg`
        : null,
  };
}

/** Open Library (free, no key). Title, author or ISBN. */
export async function searchBooks(query: string, signal?: AbortSignal): Promise<BookDraft[]> {
  const isbn = normaliseIsbn(query);
  const params = isbn ? `isbn=${isbn}` : `q=${encodeURIComponent(query)}`;
  const res = await fetch(`https://openlibrary.org/search.json?${params}&limit=12&fields=${FIELDS}`, { signal });
  if (!res.ok) throw new Error(`Open Library ${res.status}`);
  const body: { docs?: OpenLibraryDoc[] } = await res.json();
  return (body.docs ?? []).map((d) => toDraft(d, isbn ?? undefined));
}

/** Shrink a photo to a ~200px wide JPEG data URL so it fits in localStorage */
export async function coverFromFile(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 200 / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.7);
}

export function parseBookshelf(raw: unknown): BookshelfData | null {
  if (typeof raw !== "object" || raw === null) return null;
  const d = raw as Partial<BookshelfData>;
  return d.version === 1 && Array.isArray(d.shelves) && d.shelves.length > 0 && Array.isArray(d.books)
    ? { version: 1, shelves: d.shelves, books: d.books }
    : null;
}
