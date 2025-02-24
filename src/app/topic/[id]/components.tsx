"use client";

import Link from "next/link";
import { MoreHorizontal, ThumbsUp, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { NewPostForm } from "./new-post-form";
import { Button } from "@/components/ui/button";
import { Topic, Comment, Reactions, ListOfImages, Forum } from "@/schema";
import { formatDistanceToNow } from "date-fns";
import ReactMarkdown from "react-markdown";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { use, useState } from "react";
import { ReactionOverview } from "@/components/reactions";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressiveImg, useAccount, useCoState } from "jazz-react";
import { Textarea } from "@/components/ui/textarea";
import { Group, ImageDefinition } from "jazz-tools";
import { createImage } from "jazz-browser-media-images";
import { CursorSync } from "@/components/cursor-sync";

type CommentNode = {
  comment: Comment;
  children: CommentNode[];
};
export function RenderTopicPage({
  forumId,
  id,
}: {
  forumId: string;
  id: string;
}) {
  const subscribedTopic = useCoState(Topic, id as any, { comments: [{}] });

  const topic = subscribedTopic;
  const organizeComments = (comments: Comment[]): CommentNode[] => {
    const commentMap = new Map<string, CommentNode>();
    const roots: CommentNode[] = [];

    comments.forEach((comment) => {
      if (!comment) return;

      const node: CommentNode = {
        comment,
        children: [],
      };

      if (comment.id) {
        commentMap.set(comment.id, node);
      }
    });

    comments.forEach((comment) => {
      if (!comment || !comment.id) return;

      const node = commentMap.get(comment.id);
      if (!node) return;

      if (comment.parentComment && comment.parentComment.id) {
        const parent = commentMap.get(comment.parentComment.id);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  const renderComments = (nodes: CommentNode[]): React.ReactNode => {
    return nodes.map((node) => {
      if (!node.comment || !node.comment.id) return null;

      return (
        <div key={node.comment.id}>
          <CommentComponent comment={node.comment} topic={topic!} />
          {node.children.length > 0 && (
            <div className="ml-6 relative">
              <div className="absolute left-0 top-0 bottom-0 border-l border-border -translate-x-[2px]" />
              <div className="py-1">{renderComments(node.children)}</div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-xl mx-auto space-y-2">
      {/* {forum && <CursorSync forum={forum} />} */}

      <div className="rounded-xl bg-secondary p-4 relative">
        <Link
          href={topic?.forum?.id ? `/?forum=${topic?.forum?.id}` : "/"}
          className="text-primary/80 text-xs hover:text-primary/90 fixed left-4 top-4"
        >
          Back
        </Link>
        <div className="flex items-start justify-between mt-1">
          <h1 className="text-lg font-semibold text-card-foreground">
            {topic ? topic.title : <Skeleton className="w-24 h-6" />}
          </h1>
          <div className="text-xs text-muted-foreground">
            {formatDistanceToNow(topic?.createdAt ?? new Date())} ago
          </div>
        </div>

        <div className="py-3">
          <ReactMarkdown className="prose prose-sm dark:prose-invert max-w-none">
            {topic?.body}
          </ReactMarkdown>
          {topic?.images && (
            <div className="flex flex-wrap gap-2 mt-3">
              {topic.images.map((image) => (
                <ProgressiveImg key={image?.id} image={image}>
                  {({ src }) => (
                    <img src={src} className="w-20 rounded border" />
                  )}
                </ProgressiveImg>
              ))}
            </div>
          )}
        </div>

        {topic && <NewPostForm topic={topic} />}

        <div className="space-y-2">
          {topic?.comments && renderComments(organizeComments(topic.comments))}
        </div>
      </div>
    </div>
  );
}

function CommentComponent({
  comment,
  topic,
}: {
  comment: Comment;
  topic: Topic;
}) {
  const [content, setContent] = useState("");
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const { me } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const group = Group.create({ owner: me });
    group.addMember("everyone", "reader");

    const imgs: ImageDefinition[] = [];
    for (const image of attachedImages) {
      const uploaded = await createImage(image, {
        owner: group,
      });
      imgs.push(uploaded);
    }

    const reactionsGroup = Group.create({ owner: me });
    reactionsGroup.addMember("everyone", "writer");

    topic.comments?.push(
      Comment.create(
        {
          content,
          createdAt: Date.now(),
          likes: 0,
          parentComment: comment,
          reactions: Reactions.create([], { owner: reactionsGroup }),
          images: ListOfImages.create(imgs, { owner: group }),
        },
        { owner: group },
      ),
    );

    topic.postCount += 1;
    setAttachedImages([]);
    setIsReplyOpen(false);
    setContent("");
  };

  return (
    <div className="p-2">
      <div className="flex gap-2">
        <Avatar
          size="sm"
          src="/placeholder.svg"
          alt={comment._edits?.content?.by?.profile?.name ?? ""}
          status="online"
        />
        <div className="flex-1 space-y-2 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <h3 className="font-medium text-card-foreground text-sm">
                {comment._edits?.content?.by?.profile?.name ?? (
                  <Skeleton className="w-20 h-5" />
                )}
              </h3>
              <span className="text-muted-foreground text-xs">
                • {formatDistanceToNow(comment.createdAt)} ago
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-3 w-3" />
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

          <p className="text-card-foreground text-sm">{comment.content}</p>

          {comment.images && comment.images?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {comment.images.map((image, idx) => (
                <ProgressiveImg key={idx} image={image}>
                  {({ src }) => (
                    <img className="w-16 max-w-full rounded border" src={src} />
                  )}
                </ProgressiveImg>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            {comment.reactions && (
              <ReactionOverview reactions={comment.reactions} />
            )}
            <Button
              variant="primary"
              size="sm"
              className="flex group-hover:opacity-100 opacity-0 duration-200 transition-opacity py-0 h-6 gap-1"
              onClick={() => setIsReplyOpen((s) => !s)}
            >
              <MessageCircle className="h-3 w-3" />
              <span className="text-xs">Reply</span>
            </Button>
          </div>

          {isReplyOpen && (
            <div className="space-y-2 mt-2">
              <Textarea
                placeholder="Write a reply..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px] w-full bg-primary/5 text-primary placeholder:text-primary/50 text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsReplyOpen(false);
                    setContent("");
                  }}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
                <Button variant="primary" size="sm" onClick={handleSubmit} className="h-7 text-xs">
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
