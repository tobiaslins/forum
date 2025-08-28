"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageSquare, Sun, Moon, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserMenu } from "@/components/user-menu";

export function Header() {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  useEffect(() => {
    // initialize from SSR-applied class or storage
    const isDark = document.documentElement.classList.contains("dark");
    setIsDarkMode(isDark);
  }, []);
  const toggleDarkMode = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    const cl = document.documentElement.classList;
    if (next) cl.add("dark"); else cl.remove("dark");
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
      document.cookie = `theme=${next ? "dark" : "light"}; Path=/; Max-Age=31536000; SameSite=Lax`;
    } catch {}
  };
  const pathname = usePathname();
  const isTopicPage = pathname.includes("/topic/");
  const forumId = pathname.includes("?forum=")
    ? pathname.split("?forum=")[1]
    : "";

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full">
      <div className=" mx-auto px-4 flex h-14 items-center justify-between">
        <div className="flex items-center gap-2">
          {isTopicPage && (
            <Button variant="ghost" size="icon" asChild className="mr-2">
              <Link href={forumId ? `/?forum=${forumId}` : "/"}>
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
          )}
          <Link href="/" className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <span className="font-semibold text-lg">Forum</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="h-8 w-8"
                >
                  {isDarkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <UserMenu />
        </div>
      </div>
    </header>
  );
}
