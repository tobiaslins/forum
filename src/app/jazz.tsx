"use client";

import { JazzAccount } from "@/schema";
import { JazzProvider } from "jazz-react";

export function JazzAndAuth({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JazzProvider
        sync={{
          peer: "wss://cloud.jazz.tools/?key=forum@tobi.sh",
          when: "always",
        }}
        AccountSchema={JazzAccount}
      >
        {children}
      </JazzProvider>
    </>
  );
}
