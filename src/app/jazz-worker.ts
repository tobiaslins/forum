import { startWorker } from "jazz-tools/node";
import { JazzAccount } from "@/schema";

let jazzWorker: JazzAccount;

export const getJazzWorker = async () => {
  if (jazzWorker) return jazzWorker;
  console.log("Starting jazz worker");
  const res = await startWorker({
    AccountSchema: JazzAccount,
    accountID: process.env.JAZZ_WORKER_ACCOUNT,
    accountSecret: process.env.JAZZ_WORKER_SECRET,
  });

  jazzWorker = res.worker;

  return res.worker;
};
