"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import Image from "next/image"

interface LightboxProps {
  src: string
  alt?: string
  isOpen: boolean
  onClose: () => void
}

export function Lightbox({ src, alt = "Image", isOpen, onClose }: LightboxProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-screen-lg p-1 bg-transparent border-none">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 rounded-full bg-black/70 p-2 text-white hover:bg-black/90"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="relative h-[80vh] w-full">
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}