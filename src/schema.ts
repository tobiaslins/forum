import { co, Profile, Account, CoFeed, ImageDefinition, z } from "jazz-tools";

export const ReactionTypes = ["love", "haha", null] as const;
export type ReactionType = (typeof ReactionTypes)[number];
export const ListOfImages = co.list(ImageDefinition);
export const Reactions = co.feed(z.json());

export const Comment = co.map({
  content: z.string(),
  createdAt: z.number(),
  likes: z.number(),
  reactions: Reactions,
  get parentComment() {
    return Comment;
  },
  images: co.optional(ListOfImages),
});
export type Comment = co.loaded<typeof Comment>;

export const ListOfComments = co.list(Comment);

export const CursorLocation = co.feed(z.json());

export const JazzProfile = co.profile({
  name: z.string(),
});

export const Topic = co.map({
  title: z.string(),
  body: z.string(),
  postCount: z.number(),
  comments: co.optional(ListOfComments),
  createdAt: z.number(),
  images: co.optional(ListOfImages),
  get forum() {
    return Forum;
  },
});
export type Topic = co.loaded<typeof Topic>;
export const ListOfTopics = co.list(Topic);
export type ListOfTopics = co.loaded<typeof ListOfTopics>;

export const Forum = co.map({
  name: z.string(),
  topics: ListOfTopics,
  cursorLocations: co.optional(CursorLocation),
});
export type Forum = co.loaded<typeof Forum>;
export const ListOfForums = co.list(Forum);
export type ListOfForums = co.loaded<typeof ListOfForums>;
export const JazzRoot = co.map({
  forums: ListOfForums,
});

export const JazzAccount = co
  .account({
    profile: JazzProfile,
    root: JazzRoot,
  })
  .withMigration((account) => {
    if (account.root === undefined) {
      account.$jazz.set(
        "root",
        JazzRoot.create({ forums: ListOfForums.create([]) }),
      );
    }
  });
