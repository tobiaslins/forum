"use client";

import { useState } from "react";
import { Topic, Comment, Reactions } from "@/schema";
import { useAccount } from "@/app/jazz";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Group } from "jazz-tools";

export function NewPostForm({ topic }: { topic: Topic }) {
  const [content, setContent] = useState("");
  const { me } = useAccount();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const group = Group.create({ owner: me });
    group.addMember("everyone", "reader");

    const reactionsGroup = Group.create({ owner: me });
    reactionsGroup.addMember("everyone", "writer");

    topic.comments?.push(
      Comment.create(
        {
          content,
          createdAt: Date.now(),
          likes: 0,
          reactions: Reactions.create([], { owner: reactionsGroup }),
        },
        { owner: group }
      )
    );

    topic.postCount += 1;
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
