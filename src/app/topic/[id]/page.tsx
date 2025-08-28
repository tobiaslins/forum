import { Topic } from "@/schema";
import { RenderTopicPage } from "./components";
import { getJazzWorker } from "@/app/jazz-worker";
import { exportCoValue } from "jazz-tools";

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ forum?: string }>;
}) {
  const { id } = await params;
  const { forum } = await searchParams;
  const forumId = forum || "";

  const worker = await getJazzWorker();
  const topic = await Topic.load(id, {
    loadAs: worker,
    resolve: { forum: true, comments: { $each: true } },
  });

  console.log(`Server Rendering`, topic?.title);

  return (
    <RenderTopicPage id={id} forumId={forumId} preloaded={topic?.toJSON()} />
  );
}
