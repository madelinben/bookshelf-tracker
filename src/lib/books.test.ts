import assert from "node:assert/strict";
import { test } from "node:test";
import { normaliseIsbn, spineStyle, toDraft } from "./books.ts";
import { contrast, pickSpine, textOn } from "./spine.ts";

test("normaliseIsbn validates check digits", () => {
  assert.equal(normaliseIsbn("978-0-14-143951-8"), "9780141439518");
  assert.equal(normaliseIsbn("9780141439519"), null);
  assert.equal(normaliseIsbn("0-306-40615-2"), "0306406152");
  assert.equal(normaliseIsbn("080442957X"), "080442957X");
  assert.equal(normaliseIsbn("pride and prejudice"), null);
});

test("spineStyle is stable per title", () => {
  assert.deepEqual(spineStyle("Dune"), spineStyle("Dune"));
  const s = spineStyle("Middlemarch");
  assert.ok(s.heightRem >= 9 && s.heightRem <= 12);
});

test("toDraft prefers the cover id, then the ISBN cover", () => {
  assert.equal(
    toDraft({ title: "A", cover_i: 42 }).coverUrl,
    "https://covers.openlibrary.org/b/id/42-M.jpg"
  );
  assert.equal(
    toDraft({ title: "B", isbn: ["0306406152", "9780306406157"] }).isbn,
    "9780306406157"
  );
  assert.equal(toDraft({ title: "C" }).coverUrl, null);
});

test("pickSpine: most common colour, text always passes AA, most different band", () => {
  const s = pickSpine([
    { hex: "#f4e9d0", population: 40 },
    { hex: "#1f3a5f", population: 120 },
    { hex: "#2a4a70", population: 10 },
  ]);
  assert.equal(s?.bg, "#1f3a5f");
  assert.equal(s?.fg, "#ffffff");
  assert.equal(s?.accent, "#f4e9d0");
  assert.equal(textOn("#f4e9d0"), "#000000");
  for (const bg of ["#777777", "#ff0000", "#00aa00", "#ffff00"])
    assert.ok(contrast(bg, textOn(bg)) >= 4.5, bg);
  assert.equal(pickSpine([]), null);
});
