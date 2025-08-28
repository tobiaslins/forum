"use client";

import Link from "next/link";
import {
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  CalendarDays,
  User,
} from "lucide-react";
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
import { ProgressiveImg, useAccount, useCoState } from "jazz-tools/react";
import { Textarea } from "@/components/ui/textarea";
import { Group, ImageDefinition } from "jazz-tools";
import { createImage } from "jazz-tools/browser-media-images";
import { LightboxImage } from "@/components/lightbox-image";

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
  const subscribedTopic = useCoState(Topic, id as any, {
    resolve: { comments: { $each: true } },
  });

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
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <div className="rounded-lg bg-secondary border border-border shadow-sm overflow-hidden card-hover-effect">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl font-semibold text-foreground">
              {topic ? topic.title : <Skeleton className="w-48 h-7" />}
            </h1>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <CalendarDays className="h-3 w-3" />
              <span>
                {formatDistanceToNow(topic?.createdAt ?? new Date())} ago
              </span>
            </div>
          </div>

          <div className="prose prose-sm dark:prose-invert max-w-none mb-6">
            <ReactMarkdown>{topic?.body}</ReactMarkdown>
          </div>

          {topic?.images && topic.images.length > 0 && (
            <div className="flex flex-wrap gap-3 mb-6">
              {topic.images.map((image) => (
                <ProgressiveImg key={image?.id} image={image}>
                  {({ src }) => (
                    <LightboxImage
                      src={src ?? ""}
                      className="max-w-[200px] max-h-[200px] object-cover rounded-md border"
                    />
                  )}
                </ProgressiveImg>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Avatar size="sm" src="/placeholder.svg" alt="Anonymous" />
              <span className="text-muted-foreground">Posted by Anonymous</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild className="text-xs">
                <Link href={forumId ? `/?forum=${forumId}` : "/"}>
                  Back to Forum
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {topic && (
          <div className="border-t border-border bg-secondary/50 p-6">
            <NewPostForm topic={topic} />
          </div>
        )}
      </div>

      {topic?.comments && topic.comments.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Comments</h2>
          {renderComments(organizeComments(topic.comments))}
        </div>
      )}
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
    <div className="p-4 bg-secondary rounded-lg border border-border mb-2">
      <div className="flex gap-3">
        <Avatar
          size="sm"
          src="/placeholder.svg"
          alt={comment._edits?.content?.by?.profile?.name ?? "Anonymous"}
        />
        <div className="flex-1 space-y-3 group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground text-sm">
                {comment._edits?.content?.by?.profile?.name || "Anonymous"}
              </h3>
              <span className="text-muted-foreground text-xs flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatDistanceToNow(comment.createdAt)} ago
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
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

          <p className="text-foreground text-sm">{comment.content}</p>

          {comment.images && comment.images?.length > 0 && (
            <div className="flex flex-wrap gap-2 my-3">
              {comment.images.map((image, idx) => (
                <ProgressiveImg key={idx} image={image}>
                  {({ src }) => (
                    <LightboxImage
                      src={src ?? ""}
                      className="max-w-[150px] max-h-[120px] rounded border object-cover"
                    />
                  )}
                </ProgressiveImg>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            {comment.reactions && (
              <ReactionOverview reactions={comment.reactions} />
            )}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => setIsReplyOpen((s) => !s)}
            >
              <MessageCircle className="h-3 w-3" />
              <span>Reply</span>
            </Button>
          </div>

          {isReplyOpen && (
            <div className="bg-background rounded-md border border-border p-3 mt-3">
              <h4 className="text-xs font-medium mb-2">
                Reply to this comment
              </h4>
              <Textarea
                placeholder="Write your reply..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[80px] w-full bg-primary/5 text-primary placeholder:text-primary/50 text-sm mb-3"
              />

              {attachedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {attachedImages.map((image) => (
                    <div key={image.name} className="relative">
                      <LightboxImage
                        src={URL.createObjectURL(image)}
                        alt={image.name}
                        className="h-12 w-12 rounded border object-cover"
                      />
                      <Button
                        className="absolute -top-1 -right-1 bg-red-500 w-4 h-4 p-0 text-white rounded-full text-xs flex items-center justify-center"
                        onClick={() => {
                          setAttachedImages(
                            attachedImages.filter((i) => i !== image),
                          );
                        }}
                      >
                        x
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files) {
                      setAttachedImages([
                        ...attachedImages,
                        ...Array.from(e.target.files),
                      ]);
                    }
                  }}
                  className="text-xs text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary"
                />

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsReplyOpen(false);
                      setContent("");
                      setAttachedImages([]);
                    }}
                    className="h-8 text-xs"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSubmit}
                    className="h-8 text-xs"
                  >
                    Post Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
