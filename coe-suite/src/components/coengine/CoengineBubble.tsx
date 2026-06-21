import { useRef, useState, useCallback, useEffect } from "react";
import { useCoengineStore } from "./CoengineStore";

const BUBBLE_SIZE = 56;
const SNAP_MARGIN = 20;
const PROXIMITY = 150;
const HIDE_DELAY = 3000;

function getDefaultPos(): { x: number; y: number } {
  return {
    x: window.innerWidth - BUBBLE_SIZE - SNAP_MARGIN,
    y: window.innerHeight - BUBBLE_SIZE - SNAP_MARGIN,
  };
}

const DRAG_THRESHOLD = 5;

export function CoengineBubble() {
  const { isOpen, unreadCount, toggleOpen } = useCoengineStore();
  const [pos, setPos] = useState(getDefaultPos);
  const [dragging, setDragging] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const dragRef = useRef<{ startX: number; startY: number; elX: number; elY: number; moved: boolean }>({
    startX: 0,
    startY: 0,
    elX: 0,
    elY: 0,
    moved: false,
  });
  const bubbleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const inProximity =
        e.clientX >= window.innerWidth - PROXIMITY &&
        e.clientY >= window.innerHeight - PROXIMITY;

      if (inProximity || isOpen) {
        setVisible(true);
        if (hideTimerRef.current) {
          clearTimeout(hideTimerRef.current);
          hideTimerRef.current = undefined;
        }
      } else if (!hideTimerRef.current && !hovering && !dragging) {
        hideTimerRef.current = setTimeout(() => {
          setVisible(false);
          hideTimerRef.current = undefined;
        }, HIDE_DELAY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isOpen, hovering, dragging]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    const el = bubbleRef.current;
    if (!el) return;
    el.setPointerCapture(e.pointerId);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      elX: pos.x,
      elY: pos.y,
      moved: false,
    };
    setDragging(true);
  }, [pos]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD) {
      dragRef.current.moved = true;
    }
    setPos({
      x: dragRef.current.elX + dx,
      y: dragRef.current.elY + dy,
    });
  }, [dragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLButtonElement>) => {
    setDragging(false);
    const el = bubbleRef.current;
    if (el) el.releasePointerCapture(e.pointerId);

    if (!dragRef.current.moved) {
      toggleOpen();
      return;
    }

    const br = el?.getBoundingClientRect();
    if (!br) return;

    const maxX = window.innerWidth - br.width - SNAP_MARGIN;
    const maxY = window.innerHeight - br.height - SNAP_MARGIN;

    setPos({
      x: Math.max(SNAP_MARGIN, Math.min(maxX, pos.x)),
      y: Math.max(SNAP_MARGIN, Math.min(maxY, pos.y)),
    });
  }, [toggleOpen, pos]);

  const show = visible || isOpen;
  const x = pos.x;
  const y = pos.y;

  return (
    <button
      ref={bubbleRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      style={{ left: x, top: y, touchAction: "none" }}
      className={`
        fixed z-[9999]
        ${dragging ? "cursor-grabbing" : "cursor-grab"}
        w-14 h-14
        rounded-corner-full
        flex items-center justify-center
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${show ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"}
        ${isOpen
          ? "shadow-card shadow-black/15 ring-2 ring-white/30"
          : "shadow-card hover:shadow-2xl hover:shadow-black/15"
        }
        bg-[var(--color-verde-100)]
        hover:bg-[var(--color-verde-100)]/90
      `}
      aria-label="Abrir COENGINE"
    >
      <img src={`${import.meta.env.BASE_URL}Logo_coengine.svg`} alt="COE" className="w-10 h-10 pointer-events-none select-none block object-contain brightness-0 invert animate-rotate-45" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-corner-full bg-[var(--color-ind-rojo)] text-white text-[10px] font-bold flex items-center justify-center shadow-sm shadow-[var(--color-ind-rojo)]/30">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </button>
  );
}
