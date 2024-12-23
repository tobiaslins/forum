import { CursorLocation, Forum } from "@/schema";
import { useCallback, useEffect, useRef } from "react";

export function CursorSync({ forum }: { forum: Forum }) {
  const lastCallRef = useRef(0);

  useEffect(() => {
    console.log("CursorSync mounted");
    if (!forum._refs.cursorLocations) {
      forum.cursorLocations = CursorLocation.create([], {
        owner: forum._owner,
      });
    }
  }, []);
  // Custom throttle function
  const throttle = useCallback(
    (callback: (e: MouseEvent) => void, delay: number) => {
      return (...args: any) => {
        const now = Date.now();

        if (now - lastCallRef.current >= delay) {
          // @ts-ignore
          callback(...args);
          lastCallRef.current = now;
        }
      };
    },
    []
  );

  // Throttled mouse position update
  const updateMousePosition = useCallback(
    throttle((e) => {
      forum.cursorLocations?.push({
        x: e.clientX,
        y: e.clientY,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
      });
    }, 50),
    []
  );

  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, [updateMousePosition]);

  const allCursors = Object.values(forum.cursorLocations ?? {});
  return (
    <div>
      {allCursors.map((cursor: CursorLocation["inCurrentSession"]) => {
        if (cursor?.by?.isMe) return null;
        if (cursor && cursor?.madeAt.getTime() < Date.now() - 1000 * 20)
          return null;

        if (!cursor) return null;

        const otherWidth = cursor.value.innerWidth;
        const cursorX = cursor.value.x / otherWidth;
        const cursorY = cursor.value.y;

        return (
          <div
            key={cursor.tx.txIndex}
            className="w-4 h-4 backdrop-filter backdrop-invert rounded-full absolute transition-all duration-100"
            style={{
              top: cursorY,
              left: cursorX * 100 + "%",
            }}
          />
        );
      })}
    </div>
  );
}
