'use client';

import { useRef, useState } from 'react';
import { Topic, Comment, Reactions, ListOfImages } from '@/schema';
import { useAccount } from '@/app/jazz';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Group, ImageDefinition } from 'jazz-tools';
import { createImage } from 'jazz-browser-media-images';

export function NewPostForm({ topic }: { topic: Topic }) {
  const [content, setContent] = useState('');
  const [attachedImages, setAttachedImages] = useState<File[]>([]);
  const { me } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) return;

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
          reactions: Reactions.create([], { owner: reactionsGroup }),
          images: ListOfImages.create(imgs, { owner: group }),
        },
        { owner: group }
      )
    );

    topic.postCount += 1;
    setContent('');
  };

  const handleDrop = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();

    // Get the dropped files
    const files = e.dataTransfer.files;

    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const file = files[0];
      setAttachedImages([...attachedImages, file]); // Store the raw File object
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-b border-border">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className="w-full min-h-[100px] mb-3"
        onDrop={handleDrop}
      />
      <div className="flex flex-wrap gap-2">
        {attachedImages.map((image) => (
          <div key={image.name}>
            <img
              className="w-12"
              src={URL.createObjectURL(image)}
              alt={image.name}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button type="submit">Post Comment</Button>
      </div>
    </form>
  );
}
