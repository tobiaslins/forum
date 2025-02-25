"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { Forum } from "@/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { co } from "jazz-tools";
interface MobileNavProps {
  forums?: co<Forum | null>[];
  selectedForumId?: string;
}

export function MobileNav({ forums, selectedForumId }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="h-[100dvh] max-w-[80vw] rounded-none p-0 left-0 top-0 translate-x-0 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left">
          <div className="flex h-14 items-center border-b px-4 justify-between">
            <div className="font-semibold">Navigation</div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="no-scrollbar overflow-y-auto">
            <div className="flex-1 w-full">
              <Sidebar forums={forums} selectedForumId={selectedForumId} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
