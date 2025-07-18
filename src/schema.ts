import {
  co,
  Profile,
  Account,
  CoFeed,
  ImageDefinition,
  z,
  CoMapSchema,
} from "jazz-tools";

export const ReactionTypes = ["love", "haha", null] as const;
export type ReactionType = (typeof ReactionTypes)[number];
export const ListOfImages = co.list(ImageDefinition);
export const Reactions = co.feed(z.json());

export const Comment = co.map({
  content: z.string(),
  createdAt: z.number(),
  likes: z.number(),
  reactions: Reactions,
  get parentComment(): CoMapSchema<typeof Comment> {
    return Comment;
  },
  images: z.optional(ListOfImages),
});

export const ListOfComments = co.list(Comment);

export const CursorLocation = co.feed(z.json());

export const JazzProfile = co.profile({
  name: z.string(),
});

export const Topic = co.map({
  title: z.string(),
  body: z.string(),
  postCount: z.number(),
  comments: ListOfComments,
  createdAt: z.number(),
  images: z.optional(ListOfImages),
  get forum(): CoMapSchema<typeof Forum> {
    return Forum;
  },
});
export const ListOfTopics = co.list(Topic);

export const Forum = co.map({
  name: z.string(),
  topics: ListOfTopics,
  cursorLocations: z.optional(CursorLocation),
});

export const ListOfForums = co.list(Forum);
export const JazzRoot = co.map({
  forums: ListOfForums,
});

export const JazzAccount = co
  .account({
    profile: JazzProfile,
    root: JazzRoot,
  })
  .withMigration((account) => {
    if (!account.root) {
      account.root = JazzRoot.create({ forums: ListOfForums.create([]) });
    }
  });
