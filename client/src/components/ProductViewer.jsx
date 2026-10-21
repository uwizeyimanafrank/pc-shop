import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { assetUrl } from "../lib/api";
import { SIDE_ORDER } from "../lib/format";

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

/** Drag the image to rotate through preloaded 360° frames. */
function SpinViewer({ frames, name }) {
  const reduce = useReducedMotion();
  const [loaded, setLoaded] = useState(0);
  const [i, setI] = useState(0);
  const [intro, setIntro] = useState(true);
  const drag = useRef(null);
  const n = frames.length;
  const ready = loaded >= n;

  useEffect(() => {
    setLoaded(0);
    let alive = true;
    frames.forEach((f) => {
      const img = new Image();
      const done = () => alive && setLoaded((c) => c + 1);
      img.onload = done;
      img.onerror = done;
      img.src = assetUrl(f.url);
    });
    return () => { alive = false; };
  }, [frames]);

  // One slow turn to show the PC can rotate, stops as soon as the person touches it.
  useEffect(() => {
    if (!ready || !intro || reduce) return;
    let step = 0;
    const t = setInterval(() => {
      step += 1;
      setI(step % n);
      if (step >= n) { clearInterval(t); setIntro(false); }
    }, 45);
    return () => clearInterval(t);
  }, [ready, intro, n, reduce]);

  const down = (e) => {
    setIntro(false);
    drag.current = { x: e.clientX, i };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drag.current) return;
    const delta = Math.round((e.clientX - drag.current.x) / 10);
    setI((((drag.current.i - delta) % n) + n) % n);
  };
  const up = () => (drag.current = null);
  const key = (e) => {
    if (e.key === "ArrowLeft") setI((v) => (v - 1 + n) % n);
    if (e.key === "ArrowRight") setI((v) => (v + 1) % n);
  };

  if (!ready) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-solder/40 p-6">
        <div className="w-full max-w-xs text-center text-sm">
          <p className="mb-2">Loading 360° view</p>
          <div className="h-2 overflow-hidden rounded-full bg-solder">
            <div className="h-full bg-copper transition-all" style={{ width: `${(loaded / n) * 100}%` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <img
        src={assetUrl(frames[i].url)}
        alt={`${name}, ${Math.round((i / n) * 360)} degrees`}
        draggable={false}
        tabIndex={0}
        onKeyDown={key}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        style={{ touchAction: "pan-y" }}
        className="aspect-[4/3] w-full cursor-grab select-none rounded-2xl bg-solder/40 object-contain active:cursor-grabbing"
      />
      <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-board/90 px-3 py-1 text-xs font-semibold text-paper">
        {Math.round((i / n) * 360)}° • drag to rotate
      </div>
    </div>
  );
}

/** Swipe or tap through the labeled side photos. */
function SideViewer({ sides, name }) {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const safe = Math.min(index, sides.length - 1);
  const go = (to) => {
    const next = (to + sides.length) % sides.length;
    setDir(to > safe ? 1 : -1);
    setIndex(next);
  };
  const current = sides[safe];

  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-solder/40">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.img
            key={current.url}
            src={assetUrl(current.url)}
            alt={`${name}, ${current.label} view`}
            custom={dir}
            variants={{
              enter: (d) => ({ x: d * 70, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d) => ({ x: d * -70, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.25}
            onDragEnd={(_, info) => {
              if (info.offset.x < -50) go(safe + 1);
              else if (info.offset.x > 50) go(safe - 1);
            }}
            draggable={false}
            className="aspect-[4/3] w-full cursor-grab select-none object-contain"
          />
        </AnimatePresence>
        {sides.length > 1 && (
          <>
            <button aria-label="Previous side" onClick={() => go(safe - 1)} className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-lg hover:bg-paper">‹</button>
            <button aria-label="Next side" onClick={() => go(safe + 1)} className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-paper/90 text-lg hover:bg-paper">›</button>
          </>
        )}
        <span className="absolute left-3 top-3 tag bg-board text-paper">{cap(current.label)}</span>
      </div>

      <div className="mt-3 grid grid-cols-6 gap-2">
        {sides.map((s, k) => (
          <button
            key={s.url}
            onClick={() => go(k)}
            aria-label={`Show ${s.label} view`}
            className={`overflow-hidden rounded-lg border-2 ${k === safe ? "border-copper" : "border-transparent"} bg-solder/40`}
          >
            <img src={assetUrl(s.url)} alt="" loading="lazy" className="aspect-square w-full object-cover" />
            <span className="block py-0.5 text-[11px] font-medium">{cap(s.label)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProductViewer({ media = [], name }) {
  const [state, setState] = useState("closed");
  const [mode, setMode] = useState("sides");

  const hasOpen = media.some((m) => m.state === "open");
  const sides = useMemo(
    () =>
      SIDE_ORDER.map((l) => media.find((m) => m.type === "side" && m.state === state && m.label === l)).filter(Boolean),
    [media, state]
  );
  const spin = useMemo(
    () => media.filter((m) => m.type === "spin" && m.state === state).sort((a, b) => a.order - b.order),
    [media, state]
  );

  const effectiveMode = mode === "spin" && spin.length ? "spin" : sides.length ? "sides" : spin.length ? "spin" : "none";

  if (!media.length) {
    return <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-solder/40 text-sm text-ink/60">Photos coming soon</div>;
  }

  const pill = (active) =>
    `rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${active ? "bg-board text-paper" : "bg-paper text-ink hover:bg-solder/60"}`;

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-full border border-solder bg-paper p-1">
          <button className={pill(effectiveMode === "sides")} onClick={() => setMode("sides")} disabled={!sides.length}>Sides</button>
          <button className={pill(effectiveMode === "spin")} onClick={() => setMode("spin")} disabled={!spin.length}>360°</button>
        </div>
        {hasOpen && (
          <div className="flex gap-1 rounded-full border border-solder bg-paper p-1">
            <button className={pill(state === "closed")} onClick={() => setState("closed")}>Closed</button>
            <button className={pill(state === "open")} onClick={() => setState("open")}>Open</button>
          </div>
        )}
      </div>

      {effectiveMode === "sides" && <SideViewer key={`s-${state}`} sides={sides} name={name} />}
      {effectiveMode === "spin" && <SpinViewer key={`p-${state}`} frames={spin} name={name} />}
      {effectiveMode === "none" && (
        <div className="grid aspect-[4/3] place-items-center rounded-2xl bg-solder/40 text-sm text-ink/60">
          No photos for the {state} view yet
        </div>
      )}
    </div>
  );
}
