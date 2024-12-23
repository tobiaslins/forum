import { useCoState } from "@/app/jazz";
import { CursorLocation, Forum } from "@/schema";
import { useCallback, useEffect, useRef, useState } from "react";

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
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
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
      {allCursors.map((cursor) => {
        if (cursor.by.isMe) return null;
        if (cursor.madeAt.getTime() < Date.now() - 1000 * 60 * 5) return null;

        return (
          <div
            key={cursor.id}
            className="w-4 h-4 bg-red-500 rounded-full absolute transition-all duration-100"
            style={{
              top: cursor.value.y,
              left: cursor.value.x,
            }}
          />
        );
      })}
    </div>
  );
}
