'use client';

import Link from 'next/link';
import { MoreHorizontal, ThumbsUp, MessageCircle } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { NewPostForm } from './new-post-form';
import { Button } from '@/components/ui/button';
import { Topic, Comment, Reactions, ListOfImages, Forum } from '@/schema';
import { useAccount, useCoState } from '@/app/jazz';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { use, useState } from 'react';
import { ReactionOverview } from '@/components/reactions';
import { Skeleton } from '@/components/ui/skeleton';
import { ProgressiveImg } from 'jazz-react';
import { Textarea } from '@/components/ui/textarea';
import { Group, ImageDefinition } from 'jazz-tools';
import { createImage } from 'jazz-browser-media-images';
import { CursorSync } from '@/components/cursor-sync';

type CommentNode = {
  comment: Comment;
  children: CommentNode[];
};

export default function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = use(params)?.id;
  const topic = useCoState(Topic, id as any, { comments: [{}] });
  const forum = useCoState(Forum, topic?.forum?.id as any);

  if (!topic) {
    return <div>Loading...</div>;
  }

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
        <div key={node.comment.id} className="divide-y">
          <CommentComponent comment={node.comment} topic={topic} />
          {node.children.length > 0 && (
            <div className="ml-8 relative">
              <div className="absolute left-0 top-4 bottom-4 border-l -translate-x-[2px]" />
              <div className="pt-4 pb-4">{renderComments(node.children)}</div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {forum && <CursorSync forum={forum} />}
      <div className="flex items-center justify-between">
        <Link
          href={topic?.forum?.id ? `/?forum=${topic?.forum?.id}` : '/'}
          className="text-primary hover:text-primary/90"
        >
          ← Back
        </Link>
        <div className="flex gap-2">
          <Button variant="outline">Latest</Button>
          <Button variant="outline">Popular</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-semibold text-card-foreground">
            {topic ? topic.title : <Skeleton className="w-24 h-7" />}
          </h1>
          <div className="mt-2 text-sm text-muted-foreground">
            Posted {formatDistanceToNow(topic?.createdAt ?? new Date())} ago
          </div>
        </div>

        <div className="p-4 border-b border-border">
          <ReactMarkdown className="prose dark:prose-invert max-w-none">
            {topic?.body}
          </ReactMarkdown>
          {topic?.images && (
            <div className="flex flex-wrap gap-2">
              {topic.images.map((image) => (
                <ProgressiveImg key={image?.id} image={image}>
                  {({ src }) => <img src={src} className="w-24" />}
                </ProgressiveImg>
              ))}
            </div>
          )}
        </div>

        {topic && <NewPostForm topic={topic} />}

        <div className="divide-y divide-border">
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
  const [content, setContent] = useState('');
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const { me } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const group = Group.create({ owner: me });
    group.addMember('everyone', 'reader');

    const imgs: ImageDefinition[] = [];
    for (const image of attachedImages) {
      const uploaded = await createImage(image, {
        owner: group,
      });
      imgs.push(uploaded);
    }

    const reactionsGroup = Group.create({ owner: me });
    reactionsGroup.addMember('everyone', 'writer');

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
        { owner: group }
      )
    );

    topic.postCount += 1;
    setAttachedImages([]);
    setIsReplyOpen(false);
    setContent('');
  };

  return (
    <div className={'p-4'}>
      <div className="flex gap-4">
        <Avatar
          src="/placeholder.svg"
          alt={comment._edits?.content?.by?.profile?.name ?? ''}
          status="online"
        />
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-card-foreground">
                {comment._edits?.content?.by?.profile?.name ?? (
                  <Skeleton className="w-24 h-7" />
                )}
              </h3>
              <span className="text-muted-foreground">
                • {formatDistanceToNow(comment.createdAt)} ago
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
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
            {comment.images && (
              <div className="flex flex-wrap gap-2">
                {comment.images.map((image, idx) => (
                  <ProgressiveImg key={idx} image={image}>
                    {({ src }) => (
                      <img
                        className="w-24 max-w-full rounded border"
                        src={src}
                      />
                    )}
                  </ProgressiveImg>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {comment.reactions && (
              <ReactionOverview petReactions={comment.reactions} />
            )}
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsReplyOpen(true)}
            >
              <MessageCircle className="h-4 w-4" />
              Reply
            </Button>
          </div>

          {isReplyOpen && (
            <div className="space-y-2">
              <Textarea
                placeholder="Write a reply..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] w-full"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsReplyOpen(false);
                    setContent('');
                  }}
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSubmit}>
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
