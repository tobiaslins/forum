import { startWorker } from "jazz-tools/worker";
import type { InstanceOfSchema } from "jazz-tools";
import { JazzAccount } from "@/schema";

let jazzWorker: InstanceOfSchema<typeof JazzAccount>;

let worker: Awaited<ReturnType<typeof startWorker>>;

export const getJazzWorker = async () => {
  if (jazzWorker) {
    await worker.waitForConnection();
    return jazzWorker;
  }
  console.log("Starting jazz worker");
  const res = await startWorker({
    AccountSchema: JazzAccount,
    accountID: process.env.JAZZ_WORKER_ACCOUNT,
    accountSecret: process.env.JAZZ_WORKER_SECRET,
  });

  jazzWorker = res.worker;
  worker = res;

  return res.worker;
};
