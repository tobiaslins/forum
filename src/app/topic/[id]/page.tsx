"use client";

import Link from "next/link";
import { MoreHorizontal, ThumbsUp, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { NewPostForm } from "./new-post-form";
import { Button } from "@/components/ui/button";
import { Topic } from "@/schema";
import { useCoState } from "@/app/jazz";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { use } from "react";

export default function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = use(params)?.id;
  const topic = useCoState(Topic, id as any, { comments: [{}] });

  if (!topic) {
    return <div>Loading...</div>;
  }

  console.log("topic", topic);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-primary hover:text-primary/90">
          ← Back to Topics
        </Link>
        <div className="flex gap-2">
          <Button variant="outline">Latest</Button>
          <Button variant="outline">Popular</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg shadow-sm">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold text-card-foreground">
            {topic.title}
          </h1>
          <div className="mt-2 text-sm text-muted-foreground">
            Posted {formatDistanceToNow(topic.createdAt ?? new Date())} ago
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <ReactMarkdown className="prose dark:prose-invert max-w-none">
            {topic.body}
          </ReactMarkdown>
        </div>

        <NewPostForm topic={topic} />

        <div className="divide-y divide-border">
          {topic.comments.map((comment) => (
            <div key={comment.id} className="p-4">
              <div className="flex gap-4">
                <Avatar
                  src="/placeholder.svg"
                  alt={comment?._edits?.content?.by?.profile?.name ?? ""}
                  status="online"
                />
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-card-foreground">
                        {comment?._edits?.content?.by?.profile?.name}
                      </h3>
                      <span className="text-muted-foreground">
                        • {formatDistanceToNow(comment.createdAt ?? new Date())}{" "}
                        ago
                      </span>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <p className="text-card-foreground">{comment.content}</p>
                  <div className="flex items-center gap-4">
                    <button
                      className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground"
                      onClick={() => {
                        comment.likes += 1;
                      }}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="text-sm">{comment.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
