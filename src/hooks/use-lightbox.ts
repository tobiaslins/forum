"use client"

import { useState } from "react"

interface UseLightboxReturn {
  isOpen: boolean
  imageSrc: string
  imageAlt: string
  openLightbox: (src: string, alt?: string) => void
  closeLightbox: () => void
}

export function useLightbox(): UseLightboxReturn {
  const [isOpen, setIsOpen] = useState(false)
  const [imageSrc, setImageSrc] = useState("")
  const [imageAlt, setImageAlt] = useState("Image")

  const openLightbox = (src: string, alt = "Image") => {
    setImageSrc(src)
    setImageAlt(alt)
    setIsOpen(true)
  }

  const closeLightbox = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    imageSrc,
    imageAlt,
    openLightbox,
    closeLightbox,
  }
}