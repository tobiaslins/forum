"use client"

import React, { useState } from "react"
import { Lightbox } from "@/components/ui/lightbox"

interface LightboxImageProps {
  src: string
  alt?: string
  className?: string
  width?: number
  height?: number
}

export function LightboxImage({ 
  src, 
  alt = "Image", 
  className = "", 
  width, 
  height 
}: LightboxImageProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={`cursor-pointer transition-transform hover:scale-[1.02] ${className}`}
        onClick={() => setIsOpen(true)}
      />
      <Lightbox
        src={src}
        alt={alt}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}