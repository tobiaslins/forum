import { Topic } from "@/schema";
import { RenderTopicPage } from "./components";
import { getJazzWorker } from "@/app/jazz-worker";

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: { forum?: string };
}) {
  const { id } = await params;
  const forumId = searchParams.forum || "";

  return <RenderTopicPage id={id} forumId={forumId} />;
}
