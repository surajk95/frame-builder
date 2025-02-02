'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

interface ImagePreviewProps {
  imageUrl: string
  onClose: () => void
}

export function ImagePreview({ imageUrl, onClose }: ImagePreviewProps) {
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 z-50"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </Button>
        <img
          src={imageUrl}
          alt="Preview"
          className="max-h-[90vh] max-w-[90vw] object-contain"
        />
      </div>
    </div>
  )
} 