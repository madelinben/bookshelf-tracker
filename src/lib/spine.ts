/** Spine colours taken from the cover: background, title text and an accent band */
export interface Spine {
  bg: string;
  fg: string;
  accent: string;
}

interface SwatchLike {
  hex: string;
  population: number;
}

function luminance(hex: string): number {
  const [r = 0, g = 0, b = 0] = (hex.replace("#", "").match(/../g) ?? []).map((c) => {
    const v = Number.parseInt(c, 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

/** White or black, whichever reads better: one of them always passes WCAG AA (4.5:1) */
export const textOn = (bg: string) =>
  contrast(bg, "#ffffff") >= contrast(bg, "#000000") ? "#ffffff" : "#000000";

/** Most common cover colour for the spine; the most different other swatch for the band */
export function pickSpine(swatches: readonly SwatchLike[]): Spine | null {
  const [main, ...rest] = [...swatches].sort((a, b) => b.population - a.population);
  if (!main) return null;
  const accent = rest.sort((a, b) => contrast(b.hex, main.hex) - contrast(a.hex, main.hex))[0];
  return { bg: main.hex, fg: textOn(main.hex), accent: accent?.hex ?? textOn(main.hex) };
}

/** Reads the cover image in the browser; null when it can't be loaded (no cover, blocked) */
export async function spineFromCover(url: string): Promise<Spine | null> {
  try {
    const { Vibrant } = await import("node-vibrant/browser");
    const palette = await Vibrant.from(url).getPalette();
    return pickSpine(Object.values(palette).flatMap((s) => (s ? [s] : [])));
  } catch {
    return null;
  }
}
