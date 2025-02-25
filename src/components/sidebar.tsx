"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Globe, File, Plus, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Forum } from "@/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { co } from "jazz-tools";

interface SidebarProps {
  forums?: co<Forum | null>[];
  selectedForumId?: string;
}

export function Sidebar({ forums, selectedForumId }: SidebarProps) {
  const searchParams = useSearchParams();
  const currentForumId = searchParams.get("forum") || selectedForumId || "";

  return (
    <aside className="w-64 border-r border-border h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto shrink-0 hidden md:block">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-sm text-muted-foreground">
            FORUMS
          </h2>
          <Button size="icon" variant="outline" className="h-6 w-6">
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-1">
          <Button
            variant={!currentForumId ? "secondary" : "ghost"}
            size="sm"
            className="w-full justify-start"
            asChild
          >
            <Link href="/">
              <Globe className="h-4 w-4 mr-2" />
              All Forums
            </Link>
          </Button>

          {forums ? (
            forums.map((forum, i) => (
              <Button
                key={(forum?.id ?? "") + i}
                variant={currentForumId === forum?.id ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start"
                asChild
              >
                <Link href={`/?forum=${forum?.id}`}>
                  <Hash className="h-4 w-4 mr-2" />
                  {forum?.name}
                </Link>
              </Button>
            ))
          ) : (
            <>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </>
          )}
        </div>

        {/* <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-sm text-muted-foreground">POPULAR TOPICS</h2>
          </div>
          
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <File className="h-4 w-4 mr-2" />
              Getting Started
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <File className="h-4 w-4 mr-2" />
              Announcements
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start"
            >
              <File className="h-4 w-4 mr-2" />
              Help & Support
            </Button>
          </div>
        </div> */}
      </div>
    </aside>
  );
}
