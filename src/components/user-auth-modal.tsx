"use client"

import { useState } from "react"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePasskeyAuth, useIsAuthenticated } from "jazz-react"

interface UserAuthModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function UserAuthModal({ isOpen, onOpenChange }: UserAuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const isAuthenticated = useIsAuthenticated()
  
  const auth = usePasskeyAuth({
    appName: "Forum App",
  })

  const handleViewChange = () => {
    setIsSignUp(!isSignUp)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isSignUp) {
        await auth.signUp(username)
      } else {
        await auth.logIn()
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Authentication error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isSignUp ? "Create Account" : "Sign In"}</DialogTitle>
          <DialogDescription>
            {isSignUp 
              ? "Create a new account to join the conversation." 
              : "Sign in with your passkey to continue."}
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
          
          <p className="text-xs text-muted-foreground pt-2">
            {isSignUp 
              ? "This will create a new account using WebAuthn/passkeys. No password required!" 
              : "Sign in with the passkey you created previously."}
          </p>
        
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleViewChange}
            >
              {isSignUp ? "Already have an account?" : "Need an account?"}
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || (isSignUp && !username)}
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
  )
}