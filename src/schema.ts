"use client";

import {
  CoMap,
  CoList,
  co,
  Profile,
  Account,
  CoFeed,
  ImageDefinition,
  CoStream,
} from "jazz-tools";

export const ReactionTypes = ["love", "haha", null] as const;
export type ReactionType = (typeof ReactionTypes)[number];
export class Reactions extends CoFeed.Of(co.json<ReactionType>()) {}

export class Comment extends CoMap {
  content = co.string;
  createdAt = co.number;
  likes = co.number;
  reactions = co.ref(Reactions);
  parentComment = co.ref(Comment, { optional: true });
  images = co.ref(ListOfImages, {
    optional: true,
  });
}

export class ListOfComments extends CoList.Of(co.ref(Comment)) {}
export class ListOfImages extends CoList.Of(co.ref(ImageDefinition)) {}

export class Topic extends CoMap {
  title = co.string;
  body = co.string;
  postCount = co.number;
  comments = co.ref(ListOfComments);
  createdAt = co.number;

  images = co.ref(ListOfImages, {
    optional: true,
  });

  forum = co.ref(Forum);
}

export class CursorLocation extends CoFeed.Of(
  co.json<{
    x: number;
    y: number;
    innerHeight: number;
    innerWidth: number;
  }>()
) {}

export class ListOfTopics extends CoList.Of(co.ref(Topic)) {}

export class Forum extends CoMap {
  name = co.string;
  topics = co.ref(ListOfTopics);
  cursorLocations = co.ref(CursorLocation, {
    optional: true,
  });
}

export class JazzProfile extends Profile {}

export class JazzRoot extends CoMap {
  forums = co.ref(ListOfForums);
}
export class ListOfForums extends CoList.Of(co.ref(Forum)) {}

export class JazzAccount extends Account {
  profile = co.ref(JazzProfile);
  root = co.ref(JazzRoot);

  /** The account migration is run on account creation and on every log-in.
   *  You can use it to set up the account root and any other initial CoValues you need.
   */
  migrate(this: JazzAccount, creationProps?: { name: string }) {
    super.migrate(creationProps);

    if (!this._refs.root) {
      this.root = JazzRoot.create(
        { forums: ListOfForums.create([], { owner: this }) },
        { owner: this }
      );
      console.log("created root", this.root);
    }
  }
}
