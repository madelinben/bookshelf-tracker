import assert from "node:assert/strict";
import { test } from "node:test";
import { normaliseIsbn, spineStyle, toDraft } from "./books.ts";

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
