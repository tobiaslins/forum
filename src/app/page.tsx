"use client";

import { useState, useEffect } from "react";
import { Forum, ListOfTopics, Topic, ListOfComments } from "../schema";
import { useAccount, useCoState } from "./jazz";
import { Group, ID } from "jazz-tools";
import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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

export default function Home() {
  const { me } = useAccount();
  const router = useRouter();
  const [forumID, setForumID] = useState<ID<Forum>>(
    "co_zgjL11bZ9ee8Z6DefHBAtYASgYs" as ID<Forum>
  );
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

  const createForum = () => {
    const group = Group.create({ owner: me });
    group.addMember("everyone", "writer");

    const newForum = Forum.create(
      {
        name: "Community Forum",
        topics: ListOfTopics.create([], { owner: group }),
      },
      { owner: group }
    );
    setForumID(newForum.id);
    router.push(`/?forum=${newForum.id}`);
  };

  const createTopic = () => {
    if (!forum || !newTopicTitle.trim() || !newTopicBody.trim()) return;

    const topicGroup = Group.create({ owner: me });
    topicGroup.addMember("everyone", "reader");

    forum.topics.push(
      Topic.create(
        {
          title: newTopicTitle.trim(),
          body: newTopicBody.trim(),
          postCount: 1,
          comments: ListOfComments.create([], { owner: forum._owner }),
          createdAt: Date.now(),
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
        <Button onClick={createForum} variant="default">
          Create Forum
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-card rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
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
                  <Label htmlFor="topic-title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="topic-title"
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="topic-body" className="text-right">
                    Body
                  </Label>
                  <Textarea
                    id="topic-body"
                    value={newTopicBody}
                    onChange={(e) => setNewTopicBody(e.target.value)}
                    className="col-span-3"
                    rows={5}
                  />
                </div>
              </div>
              <Button onClick={createTopic}>Create Topic</Button>
            </DialogContent>
          </Dialog>
        </div>
        <div className="divide-y divide-border">
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
