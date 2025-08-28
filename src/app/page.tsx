"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import {
  Forum,
  ListOfTopics,
  Topic,
  ListOfImages,
  JazzAccount,
} from "../schema";
import { Group, ImageDefinition } from "jazz-tools";
import { MessageCircle, PlusCircle, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createImage } from "jazz-tools/media";
import { useCoState, useAccount, Image as JazzImage } from "jazz-tools/react";
import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";
import { LightboxImage } from "@/components/lightbox-image";
import { formatDistanceToNow } from "date-fns";
import { useBetterSearchParams } from "@/hooks/use-better-searchparams";

export default function Home() {
  const { me: meState } = useAccount(JazzAccount, {
    resolve: { root: { forums: true } },
  });
  const { me } = useAccount();
  const router = useRouter();
  const searchParams = useBetterSearchParams();
  const [forumID, setForumID] = useState<string>(
    (searchParams.get("forum") as string) ||
      ("co_zF5AYiGV3P3NFhAicXpqqcjP5KR" as string),
  );
  const forum = useCoState(Forum, forumID, {
    resolve: { topics: { $each: true } },
  });

  const [newTopicImages, setNewTopicImages] = useState<File[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicBody, setNewTopicBody] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const hasAdded = useRef(false);

  const createForum = (name: string) => {
    if (!me) return;
    const group = Group.create({ owner: me });
    group.addMember("everyone", "writer");

    const newForum = Forum.create(
      {
        name: name,
        topics: ListOfTopics.create([], { owner: group }),
        // not initialized here in 0.18
        cursorLocations: undefined as never,
      },
      { owner: group },
    );
    meState?.root?.forums.$jazz?.push(newForum);
    setForumID(newForum.$jazz.id);
    router.push(`/?forum=${newForum.$jazz.id}`);
  };

  const newForum = searchParams.get("new-forum");
  const joinForum = searchParams.get("join");

  useEffect(() => {
    if (newForum && me) {
      createForum(newForum);
    }
  }, [newForum, me]);

  useEffect(() => {
    if (joinForum && !hasAdded.current) {
      meState?.root?.forums.$jazz?.push(joinForum as any);
      hasAdded.current = true;
    }
  }, [joinForum, meState]);

  const createTopic = async () => {
    if (!forum || !newTopicTitle.trim() || !newTopicBody.trim() || !me) return;

    const topicGroup = Group.create({ owner: me });
    topicGroup.addMember("everyone", "reader");

    const imgs: ImageDefinition[] = [];
    for (const image of newTopicImages) {
      const uploaded = await createImage(image, {
        owner: topicGroup,
      });
      imgs.push(uploaded);
    }

    const topic = Topic.create(
      {
        title: newTopicTitle.trim(),
        body: newTopicBody.trim(),
        postCount: 1,
        createdAt: Date.now(),
        forum,
      },
      { owner: topicGroup },
    );

    topic.$jazz.set("comments", []);
    topic.$jazz.set("images", ListOfImages.create(imgs, { owner: topicGroup }));

    forum.topics.$jazz?.push(topic);
    setNewTopicTitle("");
    setNewTopicBody("");
    setIsDialogOpen(false);
  };

  if (!forum && !forumID) {
    const firstForum = meState?.root?.forums?.[0];

    // choose a first forum
    if (firstForum) {
      // setForumID(firstForum.id);
      router.push(`/?forum=${firstForum.$jazz.id}`);
      return;
    }

    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Button onClick={() => createForum("Forum")} variant="default">
          Create Forum
        </Button>
      </div>
    );
  }

  const alreadyJoined = meState?.root?.forums?.some(
    (s) => s?.$jazz.id === forum?.$jazz.id,
  );

  const uniqueForums =
    meState?.root?.forums?.filter(
      (f, i, self) => i === self.findIndex((t) => t?.$jazz.id === f?.$jazz.id),
    ) ?? [];

  return (
    <div className="flex">
      {/* Sidebar for larger screens */}
      <Sidebar forums={uniqueForums} selectedForumId={forumID as string} />

      {/* Content area */}
      <div className="flex-1 min-h-[calc(100vh-3.5rem)]">
        <div className="container mx-auto p-4 md:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <MobileNav
                forums={uniqueForums}
                selectedForumId={forumID as string}
              />
              <h1 className="text-2xl font-semibold text-foreground">
                {forum?.name}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {!alreadyJoined && (
                <Button
                  onClick={() => {
                    if (alreadyJoined) return;
                    meState?.root?.forums.$jazz?.push(forum!);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Join Forum
                </Button>
              )}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="primary" size="sm" className="gap-1.5">
                    <PlusCircle className="h-4 w-4" />
                    <span>New Topic</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Create New Topic</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid items-center gap-4">
                      <Input
                        id="topic-title"
                        placeholder="Topic Title"
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                      />
                    </div>
                    <div className="grid items-center gap-4">
                      <Textarea
                        id="topic-body"
                        placeholder="Write your post here..."
                        value={newTopicBody}
                        onChange={(e) => setNewTopicBody(e.target.value)}
                        className="bg-primary/5 text-primary placeholder:text-primary/50 min-h-[120px]"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {newTopicImages.map((image) => (
                          <div className="relative" key={image.name}>
                            <LightboxImage
                              src={URL.createObjectURL(image)}
                              alt={image.name}
                              className="w-24 rounded border"
                            />
                            <Button
                              className="absolute -top-2 -right-2 bg-red-500 w-5 h-5 p-0 text-white rounded-full text-xs flex items-center justify-center"
                              onClick={() => {
                                setNewTopicImages(
                                  newTopicImages.filter((i) => i !== image),
                                );
                              }}
                            >
                              x
                            </Button>
                          </div>
                        ))}
                      </div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(img) => {
                          if (img.target.files) {
                            setNewTopicImages([
                              ...newTopicImages,
                              ...Array.from(img.target.files),
                            ]);
                          }
                        }}
                        className="text-xs text-muted-foreground file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary"
                      />
                    </div>
                  </div>
                  <Button variant="primary" onClick={createTopic}>
                    Create Topic
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid gap-3 max-w-3xl mx-auto">
            {forum?.topics.map((topic) => (
              <Link
                key={topic.$jazz.id}
                href={`/topic/${topic.$jazz.id}?forum=${forumID}`}
                className="flex flex-col p-4 hover:bg-secondary/50 bg-secondary rounded-lg border border-border shadow-sm card-hover-effect"
              >
                <div className="flex justify-between mb-2">
                  <h2 className="text-base font-medium text-foreground">
                    {topic.title}
                  </h2>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="text-xs">
                      {topic.comments?.length || 0}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {topic.body?.substring(0, 150)}
                  {topic.body?.length > 150 ? "..." : ""}
                </p>

                {topic.images && topic.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {topic.images.slice(0, 3).map((image, idx) => (
                      <div
                        key={idx}
                        className="h-12 w-12 rounded-md border border-border overflow-hidden relative"
                      >
                        {image?.id ? (
                          <JazzImage
                            imageId={image.$jazz.id}
                            width={48}
                            height={48}
                            alt=""
                            style={{
                              objectFit: "cover",
                              width: "100%",
                              height: "100%",
                            }}
                          />
                        ) : null}
                      </div>
                    ))}
                    {topic.images.length > 3 && (
                      <div className="h-12 w-12 rounded-md bg-secondary border border-border flex items-center justify-center text-xs text-muted-foreground">
                        +{topic.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center mt-auto text-xs text-muted-foreground">
                  <span>Posted by Anonymous</span>
                  <div className="flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" />
                    <span>
                      {formatDistanceToNow(topic.createdAt || Date.now())} ago
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            {forum?.topics.length === 0 && (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-secondary/50 rounded-lg border border-border shimmer">
                <MessageCircle className="h-12 w-12 text-primary/60 mb-3" />
                <h3 className="text-lg font-medium mb-2">No topics yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a discussion in this forum.
                </p>
                <Button
                  variant="primary"
                  onClick={() => setIsDialogOpen(true)}
                  className="gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Topic</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
