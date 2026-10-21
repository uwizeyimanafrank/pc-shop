import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

const traces = [
  "M10 50 H70 V30 H112",
  "M10 90 H86 V70 H112",
  "M10 130 H60 V110 H112",
  "M250 50 H190 V30 H148",
  "M250 90 H174 V70 H148",
  "M250 130 H200 V110 H148",
];

/** Opening moment: traces draw onto a board, the chip lights up, then the screen lifts like a hood. */
export default function BootLoader({ name, onDone }) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return onDone();
    const t = setTimeout(onDone, 2100);
    return () => clearTimeout(t);
  }, [reduce, onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-50 grid cursor-pointer place-items-center bg-board text-paper"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.65, ease: [0.76, 0, 0.24, 1] }}
      onClick={onDone}
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-6 px-6">
        <svg viewBox="0 0 260 160" className="w-72 max-w-full" fill="none">
          {traces.map((d, i) => (
            <motion.path
              key={d}
              d={d}
              stroke="#D9B44A"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 0.1 + i * 0.12, ease: "easeOut" }}
            />
          ))}
          <motion.rect
            x="112" y="22" width="36" height="116" rx="5"
            stroke="#F6F8F4" strokeWidth="2.5"
            initial={{ fill: "rgba(165,86,31,0)" }}
            animate={{ fill: "rgba(165,86,31,1)" }}
            transition={{ delay: 1.1, duration: 0.5 }}
          />
        </svg>
        <motion.h1
          className="text-center text-3xl font-bold tracking-tight"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.5 }}
        >
          {name}
        </motion.h1>
      </div>
    </motion.div>
  );
}
