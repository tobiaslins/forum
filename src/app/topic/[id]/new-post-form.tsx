"use client";

import { useState } from "react";
import { Topic, Comment } from "@/schema";
import { useAccount } from "@/app/jazz";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NewPostForm({ topic }: { topic: Topic }) {
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("topic", content, topic);

    topic.comments?.push(
      Comment.create(
        {
          content,
          createdAt: Date.now(),
          likes: 0,
        },
        { owner: topic._owner }
      )
    );

    // topic.postCount += 1;
    setContent("");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-border">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="w-full min-h-[100px] mb-3"
      />
      <div className="flex justify-end">
        <Button type="submit">Post Comment</Button>
      </div>
    </form>
  );
}
