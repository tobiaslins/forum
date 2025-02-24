"use client";

import { JazzAccount } from "@/schema";
import { JazzProvider, DemoAuthBasicUI } from "jazz-react";

export function JazzAndAuth({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JazzProvider
        sync={{
          peer: "wss://cloud.jazz.tools/?key=forum@tobi.sh",
          when: "signedUp",
        }}
        AccountSchema={JazzAccount}
      >
        {children}
        {/* <DemoAuthBasicUI appName="Forum" /> */}
      </JazzProvider>
    </>
  );
}
