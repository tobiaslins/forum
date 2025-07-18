"use client";

import { JazzAccount } from "@/schema";
import { JazzReactProvider } from "jazz-tools/react";

export function JazzAndAuth({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JazzReactProvider
        enableSSR
        sync={{
          peer: "wss://cloud.jazz.tools/?key=forum@tobi.sh",
          when: "always",
        }}
        AccountSchema={JazzAccount}
      >
        {children}
      </JazzReactProvider>
    </>
  );
}
