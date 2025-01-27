'use client'
import { useState } from 'react';
import { Image } from './dashboard/types';
import { useDraggable } from '@dnd-kit/core';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { extractSizeFromUrl } from '@/lib/utils';

interface ImagesProps {
  usedImageIds?: Set<string>;
  images: Image[];
  setImages: (images: Image[]) => void;
}

interface DraggableImageProps {
  id: string;
  url: string;
}

function DraggableImage({ id, url, onRemove }: DraggableImageProps & { onRemove: (id: string) => void }) {
  const {attributes, listeners, setNodeRef, transform} = useDraggable({
    id: id,
    data: {
      type: 'image',
      url: url,
    },
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="group relative aspect-square w-24 h-24 rounded-md overflow-hidden cursor-move hover:ring-2 hover:ring-primary"
    >
      <img src={url} alt="" className="w-full h-full object-cover" />
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        className="absolute top-1 right-1 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
      >
        <X className="h-4 w-4 text-white" />
      </button>
    </div>
  );
}

function groupImagesByBaseId(urls: string[]): Map<string, Record<string, string>> {
  const groups = new Map<string, Record<string, string>>();
  
  urls.forEach(url => {
    const sizeInfo = extractSizeFromUrl(url);
    if (!sizeInfo) return;
    
    const { baseId, size } = sizeInfo;
    if (!groups.has(baseId)) {
      groups.set(baseId, {});
    }
    
    const sizeMap = groups.get(baseId)!;
    sizeMap[size] = url;
  });
  
  return groups;
}

export function Images({ usedImageIds = new Set(), images, setImages }: ImagesProps) {
  const [imageUrls, setImageUrls] = useState<string>('');
  const [isUsedOpen, setIsUsedOpen] = useState(false);
  const { toast } = useToast();

  const handleUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // Split and clean URLs
    const urls = newValue
      .split(/[\n,]/)
      .map(url => url.trim())
      .filter(url => url && url.startsWith('http'));

    if (urls.length === 0) {
      toast({
        description: `No URLs found.`,
      });
      return;
    }

    // Group URLs by base image ID and collect size variants
    const imageGroups = groupImagesByBaseId(urls);
    
    // For each group, select the smallest size variant as the main URL
    const newImages: Image[] = [];
    let duplicateCount = 0;

    imageGroups.forEach((sizeMap, baseId) => {
      // Check if this base image already exists
      const existingImage = images.find(img => {
        const existingSizeInfo = extractSizeFromUrl(img.url);
        return existingSizeInfo?.baseId === baseId;
      });

      if (existingImage) {
        // Update sizes for existing image
        existingImage.sizes = { ...(existingImage.sizes || {}), ...sizeMap };
        duplicateCount++;
      } else {
        // Find smallest size URL to use as main URL
        const sizes = Object.keys(sizeMap).map(Number);
        const smallestSize = Math.min(...sizes).toString();
        
        newImages.push({
          id: crypto.randomUUID(),
          url: sizeMap[smallestSize],
          orderId: images.length + newImages.length,
          sizes: sizeMap
        });
      }
    });

    if (duplicateCount > 0) {
      toast({
        description: `${duplicateCount} image${duplicateCount > 1 ? 's were' : ' was'} already added, updating size variants.`,
      });
    }

    if (newImages.length > 0) {
      setImages([...images, ...newImages]);
    }
    setImageUrls('');
  };

  const handleRemoveImage = (id: string) => {
    setImages(images.filter(img => img.id !== id));
    toast({
      description: "Image removed successfully.",
    });
  };

  const unusedImages = images.filter(img => !usedImageIds.has(img.id));
  const usedImages = images.filter(img => usedImageIds.has(img.id));

  return (
    <div className="space-y-6">
      {/* Image URL Input */}
      <div className="space-y-2">
        <h3 className="font-medium">Add Images</h3>
        <Textarea
          className="min-h-[100px] resize-none"
          placeholder="Paste image URLs (separated by commas or newlines)..."
          value={imageUrls}
          onChange={handleUrlsChange}
        />
      </div>

      {/* Available Images Section */}
      {unusedImages.length > 0 && (
        <div>
          <h3 className="font-medium mb-3">Available Images</h3>
          <div className="grid grid-cols-3 gap-2">
            {unusedImages.map((image) => (
              <DraggableImage 
                key={image.id} 
                {...image} 
                onRemove={handleRemoveImage}
              />
            ))}
          </div>
        </div>
      )}

      {/* Used Images Section */}
      {usedImages.length > 0 && (
        <Collapsible
          open={isUsedOpen}
          onOpenChange={setIsUsedOpen}
          className="space-y-2"
        >
          <CollapsibleTrigger className="flex items-center gap-2 w-full">
            {isUsedOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">Being Used ({usedImages.length})</span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid grid-cols-3 gap-2 pt-2">
              {usedImages.map((image) => (
                <img 
                  key={image.id} 
                  src={image.url} 
                  alt="Used image" 
                  className="w-full aspect-square object-cover rounded-md select-none pointer-events-none opacity-75" 
                  draggable={false}
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}