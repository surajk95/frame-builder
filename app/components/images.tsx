'use client'
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image } from './dashboard/types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableImage } from './SortableImage';

export function Images() {
  const [imageUrls, setImageUrls] = useState<string>('');
  const [images, setImages] = useState<Image[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleUrlsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setImageUrls(newValue);

    // Auto-process URLs when they contain commas or newlines
    if (newValue.includes(',') || newValue.includes('\n')) {
      const urls = newValue
        .split(/[\n,]/) // Split by newline or comma
        .map(url => url.trim())
        .filter(url => url && url.startsWith('http')); // Basic URL validation

      if (urls.length > 0) {
        const newImages: Image[] = urls.map((url, index) => ({
          id: crypto.randomUUID(),
          url,
          orderId: images.length + index,
        }));

        setImages([...images, ...newImages]);
        setImageUrls('');
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (over && active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({
          ...item,
          orderId: index
        }));
      });
    }
  };

  return (
    <div className="w-full h-full p-4 space-y-4">
      <h2 className="text-xl font-bold">Image Library</h2>
      
      <div className="w-full">
        <textarea
          className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder="Paste image URLs (separated by commas or newlines)..."
          value={imageUrls}
          onChange={handleUrlsChange}
          rows={5}
        />
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={images}
          strategy={horizontalListSortingStrategy}
        >
          <div className="grid grid-cols-3 gap-4">
            {images.map((image) => (
              <SortableImage
                key={image.id}
                image={image}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}