import type { CSSProperties } from "react";
import { type Book, spineStyle } from "../lib/books";
import { textOn } from "../lib/spine";

interface Props {
  book: Book;
  /** Turned cover-out, about to open (or open) */
  open: boolean;
  onPick: (el: HTMLElement) => void;
  onFocus: () => void;
}

/** Height-to-width of a typical paperback cover */
const COVER_RATIO = 0.66;

/**
 * A real CSS box: spine to the front, cover on the right face, page block on top. Hover or focus
 * slides it out and turns it to show the cover; `open` turns it cover-out.
 */
export function Book3D({ book, open, onPick, onFocus }: Props) {
  const size = spineStyle(book.title);
  const w = size.widthRem;
  const h = size.heightRem;
  const c = h * COVER_RATIO;
  const bg = book.spine?.bg ?? size.colour;
  const fg = book.spine?.fg ?? textOn(bg);
  const accent = book.spine?.accent ?? "#fcd34d";
  const back = `translateZ(${-c / 2}rem)`;

  const pose = {
    "--rest": back,
    "--pull": `translateY(-0.5rem) translateZ(${-c / 2 + 2.5}rem) rotateY(-30deg)`,
    "--open": `translateY(-0.75rem) translateZ(${-c / 2 + 5}rem) rotateY(-90deg)`,
    width: `${w}rem`,
    height: `${h}rem`,
  } as CSSProperties;
  const face = "absolute top-0 [backface-visibility:hidden]";
  const light =
    "linear-gradient(90deg, rgba(0,0,0,0.35), rgba(255,255,255,0.18) 22%, rgba(255,255,255,0) 45%, rgba(0,0,0,0.12) 75%, rgba(0,0,0,0.4))";

  return (
    <li
      className={`relative shrink-0 [perspective:70rem] ${open ? "z-20" : "hover:z-10 focus-within:z-10"}`}
      style={{ width: `${w}rem`, height: `${h}rem` }}
    >
      <button
        type="button"
        onClick={(e) => onPick(e.currentTarget)}
        onMouseEnter={onFocus}
        onFocus={onFocus}
        aria-label={`${book.title}${book.author ? ` by ${book.author}` : ""}. Open details`}
        data-open={open}
        style={pose}
        className="group/book relative block cursor-pointer [transform-style:preserve-3d] [transform:var(--rest)] transition-transform duration-500 ease-[cubic-bezier(0.2,0.7,0.2,1)] hover:[transform:var(--pull)] focus-visible:outline-none focus-visible:[transform:var(--pull)] data-[open=true]:[transform:var(--open)] motion-reduce:transition-none"
      >
        {/* Spine */}
        <span
          aria-hidden="true"
          className={`${face} left-0 flex h-full w-full flex-col items-center justify-between rounded-[2px] py-2 group-focus-visible/book:outline-3 group-focus-visible/book:outline-offset-2 group-focus-visible/book:outline-amber-400`}
          style={{
            transform: `translateZ(${c / 2}rem)`,
            backgroundColor: bg,
            backgroundImage: light,
            color: fg,
          }}
        >
          <span className="h-1 w-full" style={{ backgroundColor: accent }} />
          <span className="max-h-[70%] truncate px-0.5 text-[0.7rem] font-bold leading-tight tracking-wide [writing-mode:vertical-rl] rotate-180">
            {book.title}
          </span>
          <span className="flex w-full flex-col items-center gap-1">
            {book.author && (
              <span className="max-h-12 truncate text-[0.55rem] opacity-90 [writing-mode:vertical-rl] rotate-180">
                {book.author.split(",")[0]?.split(" ").at(-1)}
              </span>
            )}
            <span className="h-1 w-full" style={{ backgroundColor: accent }} />
          </span>
        </span>

        {/* Front cover, on the right face */}
        <span
          aria-hidden="true"
          className={`${face} overflow-hidden rounded-r-[3px]`}
          style={{
            left: `${(w - c) / 2}rem`,
            width: `${c}rem`,
            height: `${h}rem`,
            transform: `rotateY(90deg) translateZ(${w / 2}rem)`,
            backgroundColor: bg,
          }}
        >
          {book.coverUrl ? (
            <img src={book.coverUrl} alt="" loading="lazy" className="size-full object-cover" />
          ) : (
            <span
              className="grid size-full place-items-center p-2 text-center text-xs font-bold"
              style={{ color: fg }}
            >
              {book.title}
            </span>
          )}
          <span
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(0,0,0,0.45), rgba(255,255,255,0.25) 3%, rgba(0,0,0,0.15) 6%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 85%, rgba(0,0,0,0.2))",
            }}
          />
        </span>

        {/* Back cover, on the left face */}
        <span
          aria-hidden="true"
          className={face}
          style={{
            left: `${(w - c) / 2}rem`,
            width: `${c}rem`,
            height: `${h}rem`,
            transform: `rotateY(-90deg) translateZ(${w / 2}rem)`,
            backgroundColor: bg,
            backgroundImage: "linear-gradient(90deg, rgba(0,0,0,0.35), rgba(0,0,0,0.1))",
          }}
        />

        {/* Page block, seen from above */}
        <span
          aria-hidden="true"
          className={face}
          style={{
            left: 0,
            top: `${(h - c) / 2}rem`,
            width: `${w}rem`,
            height: `${c}rem`,
            transform: `rotateX(90deg) translateZ(${h / 2}rem)`,
            backgroundColor: "#f5f0e1",
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(120,100,60,0.18) 0 1px, transparent 1px 3px), linear-gradient(90deg, " +
              `${bg} 0 6%, transparent 6% 94%, ${bg} 94%)`,
          }}
        />
      </button>
    </li>
  );
}
