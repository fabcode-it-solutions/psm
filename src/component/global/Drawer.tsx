import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import IconClose from "@/assets/icons/IconClose";

type DrawerSide = "left" | "right" | "bottom";

interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: DrawerSide;
  width?: number; // for left/right in px
  height?: number; // for bottom in px
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

function useScrollLock(locked: boolean) {
  React.useEffect(() => {
    const original = document.body.style.overflow;
    if (locked) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [locked]);
}

function useEscape(onEscape: () => void) {
  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onEscape();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onEscape]);
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

function getPanelVariants(side: DrawerSide) {
  if (side === "left")
    return {
      hidden: { x: "-100%" },
      visible: { x: 0 },
      exit: { x: "-100%" },
    } as const;
  if (side === "right")
    return {
      hidden: { x: "100%" },
      visible: { x: 0 },
      exit: { x: "100%" },
    } as const;
  return {
    hidden: { y: "100%" },
    visible: { y: 0 },
    exit: { y: "100%" },
  } as const;
}

export function Drawer({
  open,
  onOpenChange,
  side = "right",
  width = 380,
  height = 360,
  title = "Drawer",
  className,
  children,
}: DrawerProps) {
  useScrollLock(open);
  useEscape(() => open && onOpenChange(false));

  const panelRef = React.useRef<HTMLDivElement | null>(null);

  // simple focus on open
  React.useEffect(() => {
    if (open && panelRef.current) {
      const focusable = panelRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusable?.focus();
    }
  }, [open]);

  const isHorizontal = side === "left" || side === "right";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="drawer-root"
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 z-50"
          aria-live="polite"
        >
          <motion.button
            aria-label="Close drawer"
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            variants={backdropVariants}
            onClick={() => onOpenChange(false)}
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            ref={panelRef}
            tabIndex={-1}
            className={[
              "absolute bg-dark-100 border border-gray-5/20 shadow-xl rounded-t-2xl md:rounded-none",
              "flex flex-col max-h-full",
              className ?? "",
            ].join(" ")}
            style={
              isHorizontal
                ? { width, top: 0, bottom: 0, [side]: 0 }
                : { height, left: 0, right: 0, bottom: 0 }
            }
            variants={getPanelVariants(side)}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            drag={isHorizontal ? "x" : "y"}
            dragElastic={0.04}
            dragConstraints={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
            onDragEnd={(_, info) => {
              const offset = isHorizontal ? info.offset.x : info.offset.y;
              const velocity = isHorizontal ? info.velocity.x : info.velocity.y;
              const threshold = (isHorizontal ? width : height) * 0.33;
              // if swiped toward the outside beyond threshold or with strong velocity, close
              const swipedOut =
                (side === "right" && (offset > threshold || velocity > 800)) ||
                (side === "left" && (offset < -threshold || velocity < -800)) ||
                (side === "bottom" && (offset > threshold || velocity > 800));
              if (swipedOut) onOpenChange(false);
            }}
          >
            <div className="sticky top-0 flex items-center justify-between gap-2 p-4 border-b border-gray-5/20">
              <h2 className="text-lg font-semibold font-audiowide text-light-100">
                {title}
              </h2>
              <button
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center justify-center"
              >
                <IconClose className="fill-accent-100" />
              </button>
            </div>

            <div className="p-4 overflow-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
