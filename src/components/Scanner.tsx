import { useEffect, useRef, useState } from "react";
import { normaliseIsbn } from "../lib/books";

interface Detector {
  detect(source: HTMLVideoElement): Promise<{ rawValue: string }[]>;
}
declare global {
  interface Window {
    BarcodeDetector?: new (options: { formats: string[] }) => Detector;
  }
}

export const canScan = () =>
  typeof window !== "undefined" && !!window.BarcodeDetector && !!navigator.mediaDevices;

/** Camera barcode reader using the browser's native BarcodeDetector. Calls onIsbn once. */
export function Scanner({ onIsbn }: { onIsbn: (isbn: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  // latest callback without restarting the camera when the parent re-renders
  const found = useRef(onIsbn);
  found.current = onIsbn;

  // The camera is an external resource: start on mount, release on unmount.
  useEffect(() => {
    let stopped = false;
    let stream: MediaStream | null = null;
    (async () => {
      const Ctor = window.BarcodeDetector;
      const el = video.current;
      if (!Ctor || !el) return;
      stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      el.srcObject = stream;
      await el.play();
      const detector = new Ctor({ formats: ["ean_13"] });
      while (!stopped) {
        const codes = await detector.detect(el).catch(() => []);
        const isbn = codes.map((c) => normaliseIsbn(c.rawValue)).find(Boolean);
        if (isbn) return found.current(isbn);
        await new Promise((r) => requestAnimationFrame(r));
      }
    })().catch(() => setError("Camera unavailable. Type the ISBN from the back cover instead."));
    return () => {
      stopped = true;
      for (const t of stream?.getTracks() ?? []) t.stop();
    };
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <video
        ref={video}
        muted
        playsInline
        className="aspect-video w-full rounded-xl bg-stone-900 object-cover"
      />
      <p role="status" className="text-sm text-stone-700">
        {error || "Point the camera at the barcode on the back cover."}
      </p>
    </div>
  );
}
