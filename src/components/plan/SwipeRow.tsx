import { ReactNode } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Check } from "lucide-react";

/**
 * Swipe-to-Check Row.
 * - Nach rechts swipen (>60px) → toggelt erledigt.
 * - Tap auf die Row → toggelt ebenfalls (kein Doppelfeuer dank framer onTap).
 * - Bei `done` wird der Inhalt gedämpft und ein Gold-Haken eingeblendet.
 */
export function SwipeRow({
  done,
  onToggle,
  children,
  className = "",
}: {
  done: boolean;
  onToggle: () => void;
  children: ReactNode;
  className?: string;
}) {
  const x = useMotionValue(0);
  const bg = useTransform(
    x,
    [0, 90],
    ["hsl(var(--primary) / 0)", "hsl(var(--primary) / 0.22)"],
  );
  const iconOpacity = useTransform(x, [0, 60], [0, 1]);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Reveal-Layer */}
      <motion.div
        style={{ background: bg }}
        className="pointer-events-none absolute inset-0 flex items-center pl-5"
      >
        <motion.div
          style={{ opacity: iconOpacity }}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-primary"
        >
          <Check className="h-4 w-4 text-primary-foreground" strokeWidth={3} />
        </motion.div>
      </motion.div>

      {/* Foreground / draggable */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 110 }}
        dragElastic={0.15}
        dragMomentum={false}
        style={{ x }}
        whileTap={{ scale: 0.995 }}
        onTap={() => onToggle()}
        onDragEnd={(_, info) => {
          if (info.offset.x > 60) onToggle();
          animate(x, 0, { type: "spring", stiffness: 420, damping: 36 });
        }}
        className={`relative cursor-pointer select-none touch-pan-y transition-opacity ${
          done ? "opacity-55" : "opacity-100"
        } ${className}`}
      >
        {children}
      </motion.div>
    </div>
  );
}
