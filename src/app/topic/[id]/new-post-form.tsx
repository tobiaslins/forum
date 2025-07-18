"use client";

import { useRef, useState } from "react";
import { Topic, Comment, Reactions, ListOfImages } from "@/schema";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Group, ImageDefinition } from "jazz-tools";
import { createImage } from "jazz-tools/browser-media-images";
import { useAccount } from "jazz-tools/react";
import { LightboxImage } from "@/components/lightbox-image";

export function NewPostForm({ topic }: { topic: Topic }) {
  const [content, setContent] = useState("");
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const { me } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

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
          reactions: Reactions.create([], { owner: reactionsGroup }),
          images: ListOfImages.create(imgs, { owner: group }),
        },
        { owner: group },
      ),
    );

    topic.postCount += 1;
    setContent("");
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();

    // Get the dropped files
    const files = e.dataTransfer.files;

    if (files.length > 0 && files[0].type.startsWith("image/")) {
      const file = files[0];
      setAttachedImages([...attachedImages, file]); // Store the raw File object
    }
  };

  return (
    <form onSubmit={handleSubmit} className="py-3">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="w-full min-h-[80px] mb-2 bg-primary/5 text-primary placeholder:text-primary/50 text-sm"
        onDrop={handleDrop}
      />
      <div className="flex flex-wrap gap-2 mb-2">
        {attachedImages.map((image) => (
          <div key={image.name} className="relative">
            <LightboxImage
              className="w-16 rounded border"
              src={URL.createObjectURL(image)}
              alt={image.name}
            />
            <Button
              className="absolute -top-2 -right-2 bg-red-500 w-4 p-0 text-white rounded-full h-4 text-xs flex items-center justify-center"
              onClick={() => {
                setAttachedImages(attachedImages.filter((i) => i !== image));
              }}
            >
              x
            </Button>
          </div>
        ))}
      </div>
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
          className="text-xs text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary"
        />
        <Button
          size="sm"
          type="submit"
          variant="primary"
          className="h-7 text-xs"
        >
          Post
        </Button>
      </div>
    </form>
  );
}
