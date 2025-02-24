import { Topic } from "@/schema";

import { RenderTopicPage } from "./components";
import { getJazzWorker } from "@/app/jazz-worker";

export default async function TopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // const worker = await getJazzWorker();

  // const topic = await Topic.load(id as any, worker, { comments: [] });

  // const asJson = JSON.stringify(topic);

  // const test = JSON.parse(asJson);

  return <RenderTopicPage id={id} />;
}
