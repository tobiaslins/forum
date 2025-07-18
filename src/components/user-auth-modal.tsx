"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsAuthenticated, usePassphraseAuth } from "jazz-tools/react";
import { wordlists } from "bip39";

interface UserAuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserAuthModal({ isOpen, onOpenChange }: UserAuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [passphrase, setPassphrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = useIsAuthenticated();

  const auth = usePassphraseAuth({
    wordlist: wordlists.english,
  });

  const handleViewChange = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          throw new Error("Username is required");
        }
        if (!passphrase.trim() || passphrase.length < 4) {
          throw new Error("Passphrase must be at least 4 characters");
        }
        await auth.signUp(username);
      } else {
        await auth.logIn(passphrase);
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error("Authentication error:", error);
      setError(error.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create Account" : "Sign In"}</DialogTitle>
          <DialogDescription>
            {isSignUp
              ? "Create a new account to join the conversation."
              : "Sign in with your passphrase to continue."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="passphrase">Passphrase</Label>
            <Input
              id="passphrase"
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter your passphrase"
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <p className="text-xs text-muted-foreground pt-2">
            {isSignUp
              ? "Choose a secure passphrase that you can remember. This will be used to access your account."
              : "Enter the passphrase you created previously."}
          </p>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleViewChange}>
              {isSignUp ? "Already have an account?" : "Need an account?"}
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                (isSignUp && (!username || !passphrase)) ||
                (!isSignUp && !passphrase)
              }
            >
              {isLoading
                ? "Processing..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
