'use client'
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image } from './dashboard/types';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableImage } from './SortableImage';
import { ChevronDown, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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

export function Images({ usedImageIds = new Set(), images, setImages }: ImagesProps) {
  const [imageUrls, setImageUrls] = useState<string>('');
  const [isUsedOpen, setIsUsedOpen] = useState(false);
  const { toast } = useToast();

  const handleUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    // Auto-process URLs
      const urls = newValue
        .split(/[\n,]/) // Split by newline or comma
        .map(url => url.trim())
        .filter(url => url && url.startsWith('http')); // Basic URL validation
      if(urls.length === 0) {
        toast({
          description: `No URLs found.`,
        });
        return;
      }
      if (urls.length > 0) {
        // Filter out existing URLs
        const existingUrls = new Set(images.map(img => img.url));
        const newUrls = urls.filter(url => !existingUrls.has(url));
        
        // Check if any URLs were filtered out as duplicates
        const duplicateCount = urls.length - newUrls.length;
        if (duplicateCount > 0) {
          toast({
            description: `${duplicateCount} image${duplicateCount > 1 ? 's were' : ' was'} already added, skipping ${duplicateCount > 1 ? 'them' : 'it'}.`,
          });
        }

        if (newUrls.length > 0) {
          const newImages: Image[] = newUrls.map((url, index) => ({
            id: crypto.randomUUID(),
            url,
            orderId: images.length + index,
          }));

          setImages([...images, ...newImages]);
        }
        setImageUrls('');
      }
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