"use client"

import { useState, useRef } from "react"
import { User, Upload, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAccount } from "jazz-tools/react"
import Image from "next/image"

interface ProfileSettingsModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileSettingsModal({ isOpen, onOpenChange }: ProfileSettingsModalProps) {
  const { me } = useAccount()
  const [username, setUsername] = useState(me?.profile?.name || "")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setProfileImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      // Update username in profile
      if (me?.profile && username !== me.profile.name) {
        me.profile.name = username
      }

      // In a real implementation, you would handle uploading the profile image here
      // For example, using a storage service and updating the profile image URL

      onOpenChange(false)
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setUsername(me?.profile?.name || "")
    setProfileImage(null)
    setPreviewUrl(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>
            Update your profile information and avatar
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-2 border-border overflow-hidden bg-secondary relative">
                {previewUrl ? (
                  <Image 
                    src={previewUrl} 
                    alt="Profile preview" 
                    fill 
                    className="object-cover"
                  />
                ) : (
                  <Image 
                    src={`https://avatar.vercel.sh/${username || "user"}`} 
                    alt={username || "User"} 
                    fill 
                    className="object-cover"
                  />
                )}
              </div>
              
              <Button 
                variant="secondary" 
                size="icon" 
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-md"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
              </Button>
              
              {previewUrl && (
                <Button 
                  variant="destructive" 
                  size="icon" 
                  className="absolute top-0 right-0 h-6 w-6 rounded-full"
                  onClick={() => {
                    setProfileImage(null)
                    setPreviewUrl(null)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleProfileImageChange}
              />
            </div>
            
            <div className="w-full space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSave} 
            disabled={isLoading || (!username && !profileImage)}
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}