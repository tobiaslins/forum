"use client";

import { useState } from "react";
import { User, LogOut, Settings, UserCircle, LogIn } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAuthModal } from "@/components/user-auth-modal";
import { ProfileSettingsModal } from "@/components/profile-settings-modal";
import { useAccount, useIsAuthenticated } from "jazz-tools/react";

export function UserMenu() {
  const { me } = useAccount();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const isAuthenticated = useIsAuthenticated();

  const username = me?.profile?.name || "User";

  const handleSignOut = async () => {
    // Implement sign out logic if needed
    // For example: auth.signOut()
    window.location.reload();
  };

  return (
    <>
      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar
                src={`https://avatar.vercel.sh/${username}`}
                alt={username}
                size="sm"
                status="online"
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{username}</p>
                <p className="text-xs text-muted-foreground truncate">
                  Signed in with Passphrase
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setProfileModalOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => setAuthModalOpen(true)}
        >
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </Button>
      )}

      <ProfileSettingsModal
        isOpen={profileModalOpen}
        onOpenChange={setProfileModalOpen}
      />
    </>
  );
}
