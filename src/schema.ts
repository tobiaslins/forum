"use client";

import { CoMap, CoList, co, Profile, Account, CoFeed } from "jazz-tools";

// export class UserProfile extends CoMap {
//   name = co.string;

//   // Add other profile fields as needed
// }

export const ReactionTypes = ["love", "haha", null] as const;
export type ReactionType = (typeof ReactionTypes)[number];
export class Reactions extends CoFeed.Of(co.json<ReactionType>()) {}

export class Comment extends CoMap {
  content = co.string;
  createdAt = co.number;
  likes = co.number;
  reactions = co.ref(Reactions);
}

export class ListOfComments extends CoList.Of(co.ref(Comment)) {}

export class Topic extends CoMap {
  title = co.string;
  body = co.string;
  postCount = co.number;
  comments = co.ref(ListOfComments);
  createdAt = co.number;
}

export class ListOfTopics extends CoList.Of(co.ref(Topic)) {}

export class Forum extends CoMap {
  name = co.string;
  topics = co.ref(ListOfTopics);
}

export class JazzProfile extends Profile {}

export class JazzAccount extends Account {
  profile = co.ref(JazzProfile);

  /** The account migration is run on account creation and on every log-in.
   *  You can use it to set up the account root and any other initial CoValues you need.
   */
  migrate(this: JazzAccount, creationProps?: { name: string }) {
    super.migrate(creationProps);
  }
}
