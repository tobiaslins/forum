"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MessageSquare, Sun, Moon, ChevronLeft, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface HeaderProps {
  isDarkMode: boolean
  toggleDarkMode: () => void
}

export function Header({ isDarkMode, toggleDarkMode }: HeaderProps) {
  const pathname = usePathname()
  const isTopicPage = pathname.includes("/topic/")
  const forumId = pathname.includes("?forum=") 
    ? pathname.split("?forum=")[1] 
    : ""

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full">
      <div className="container mx-auto px-4 flex h-14 items-center justify-between">
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
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleDarkMode}
                  className="h-8 w-8"
                >
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle theme</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  )
}