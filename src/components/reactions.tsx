"use client";

import { Reactions, ReactionTypes } from "@/schema";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ReactionOverview({ reactions }: { reactions: Reactions }) {
  const all = Object.values(reactions).filter((entry) => entry.value !== null);
  //   reactions.
  const reactionsByType = all.reduce((acc, entry) => {
    acc[entry.value] = (acc[entry.value] || 0) + 1;
    return acc;
  }, {});

  const ownReaction = reactions.byMe?.value;

  return (
    <div>
      <div className="flex flex-col gap-1">
        <ReactionsBar
          onReact={(key) => {
            if (ownReaction === key) {
              reactions.push(null);
            } else {
              reactions.push(key as any);
            }
          }}
          reactions={reactionsByType}
          userReactions={[ownReaction!]}
        />
      </div>
    </div>
  );
}

interface ReactionsProps {
  onReact: (emoji: string) => void;
  reactions: Record<string, number>;
  userReactions: string[];
}

const AVAILABLE_REACTIONS = {
  thumbs_up: { emoji: "👍", label: "Thumbs up" },
  thumbs_down: { emoji: "👎", label: "Thumbs down" },
  smile: { emoji: "😄", label: "Smile" },
  party: { emoji: "🎉", label: "Party" },
  confused: { emoji: "😕", label: "Confused" },
  love: { emoji: "❤️", label: "Love" },
  rocket: { emoji: "🚀", label: "Rocket" },
  eyes: { emoji: "👀", label: "Eyes" },
} as const;

export function ReactionsBar({
  onReact,
  reactions = {},
  userReactions = [],
}: ReactionsProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {Object.entries(reactions).map(
          ([emoji, count]) =>
            count > 0 && (
              <TooltipProvider key={emoji}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onReact(emoji)}
                      className={`
                  inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm transition-colors
                  ${
                    userReactions.includes(emoji)
                      ? "bg-primary/20 text-primary hover:bg-primary/30"
                      : "bg-muted hover:bg-muted/80 text-muted-foreground"
                  }
                `}
                    >
                      <span>
                        {
                          AVAILABLE_REACTIONS[
                            emoji as keyof typeof AVAILABLE_REACTIONS
                          ]?.emoji
                        }
                      </span>
                      <span>{count}</span>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {userReactions.includes(emoji)
                        ? "Remove reaction"
                        : "Add reaction"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ),
        )}
        <TooltipProvider>
          <Tooltip open={showPicker}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setShowPicker(!showPicker)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground transition-colors"
              >
                +
              </button>
            </TooltipTrigger>
            <TooltipContent
              className="bg-popover/95 backdrop-blur-sm rounded-lg p-2 flex gap-1 shadow-lg border border-border"
              side="top"
            >
              <div>
                <TooltipProvider>
                  {Object.entries(AVAILABLE_REACTIONS).map(([key, value]) => (
                    <button
                      key={`${key}-${value.emoji}`}
                      onClick={() => {
                        onReact(key);
                        setShowPicker(false);
                      }}
                      className="p-1.5 hover:bg-muted rounded-md transition-colors"
                    >
                      {value.emoji}
                    </button>
                  ))}
                </TooltipProvider>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
