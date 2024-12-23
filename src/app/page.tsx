"use client";

import { useState, useEffect } from "react";
import {
  Forum,
  ListOfTopics,
  Topic,
  ListOfComments,
  ListOfImages,
} from "../schema";
import { useAccount, useCoState } from "./jazz";
import { Group, ID, ImageDefinition } from "jazz-tools";
import { MessageCircle } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { createImage } from "jazz-browser-media-images";

export default function Home() {
  const { me } = useAccount();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [forumID, setForumID] = useState<ID<Forum>>(
    (searchParams.get("forum") as ID<Forum>) ||
      ("co_zF5AYiGV3P3NFhAicXpqqcjP5KR" as ID<Forum>)
  );
  const [newTopicImages, setNewTopicImages] = useState<File[]>([]);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicBody, setNewTopicBody] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const id = searchParams.get("forum");
    if (id) {
      setForumID(id as ID<Forum>);
    }
  }, []);

  const forum = useCoState(Forum, forumID, { topics: [{}] });

  const createForum = (name: string) => {
    const group = Group.create({ owner: me });
    group.addMember("everyone", "writer");

    const newForum = Forum.create(
      {
        name: name,
        topics: ListOfTopics.create([], { owner: group }),
      },
      { owner: group }
    );
    setForumID(newForum.id);
    router.push(`/?forum=${newForum.id}`);
  };

  const newForum = searchParams.get("new-forum");

  useEffect(() => {
    if (newForum) {
      createForum(newForum);
    }
  }, [newForum]);

  const createTopic = async () => {
    if (!forum || !newTopicTitle.trim() || !newTopicBody.trim()) return;

    const topicGroup = Group.create({ owner: me });
    topicGroup.addMember("everyone", "reader");

    const imgs: ImageDefinition[] = [];
    for (const image of newTopicImages) {
      const uploaded = await createImage(image, {
        owner: topicGroup,
      });
      imgs.push(uploaded);
    }

    forum.topics.push(
      Topic.create(
        {
          title: newTopicTitle.trim(),
          body: newTopicBody.trim(),
          postCount: 1,
          createdAt: Date.now(),
          comments: ListOfComments.create([], { owner: forum._owner }),
          images: ListOfImages.create(imgs, { owner: forum._owner }),
          forum,
        },
        { owner: topicGroup }
      )
    );
    setNewTopicTitle("");
    setNewTopicBody("");
    setIsDialogOpen(false);
  };

  if (!forum) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Button onClick={() => createForum("Forum")} variant="default">
          Create Forum
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-card-foreground">
            {forum.name}
          </h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default">New Topic</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Input
                    id="topic-title"
                    placeholder="Topic"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="col-span-4"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Textarea
                    id="topic-body"
                    value={newTopicBody}
                    onChange={(e) => setNewTopicBody(e.target.value)}
                    className="col-span-4"
                    rows={5}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    {newTopicImages.map((image) => (
                      <div className="relative" key={image.name}>
                        <img
                          key={image.name}
                          src={URL.createObjectURL(image)}
                          alt={image.name}
                          className="w-12"
                        />
                        <Button
                          className="absolute -top-2 -right-2 bg-red-500 w-6 p-2 text-block text-white rounded-full w-2 h-2 text-xs flex items-center justify-center"
                          onClick={() => {
                            setNewTopicImages(
                              newTopicImages.filter((i) => i !== image)
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
                    onChange={(img) => {
                      if (img.target.files) {
                        setNewTopicImages([
                          ...newTopicImages,
                          ...Array.from(img.target.files),
                        ]);
                      }
                    }}
                  />
                </div>
              </div>
              <Button onClick={createTopic}>Create Topic</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="divide-y divide-border border rounded-lg">
          {forum.topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topic/${topic.id}`}
              className="flex items-center justify-between p-4 hover:bg-muted/50 text-card-foreground"
            >
              <h2 className="text-primary font-medium">{topic.title}</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm">{topic.postCount}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
