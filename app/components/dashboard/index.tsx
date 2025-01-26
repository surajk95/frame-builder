'use client'
import { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Images } from '@/app/components/images';
import { Frame, Image } from './types';
import { SortableFrame } from './SortableFrame';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface DragData {
  type: 'image';
  url: string;
}

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [frames, setFrames] = useState<Frame[]>(() => [{
    id: crypto.randomUUID(),
    orderId: 0,
    caption: '',
    images: [],
  }]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedImage, setDraggedImage] = useState<Image | null>(null);
  const [libraryImages, setLibraryImages] = useState<Image[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const usedImageIds = useMemo(() => {
    return new Set(frames.flatMap(frame => frame.images.map(img => img.id)));
  }, [frames]);

  const updateCaption = (frameId: string, caption: string) => {
    setFrames(frames.map(frame => 
      frame.id === frameId 
        ? { ...frame, caption } 
        : frame
    ));
  };

  const addFrame = () => {
    const newFrame: Frame = {
      id: crypto.randomUUID(),
      orderId: frames.length,
      caption: '',
      images: [],
    };

    setFrames([...frames, newFrame]);
  };

  const removeFrame = (frameId: string) => {
    setFrames(frames.filter(frame => frame.id !== frameId));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id.toString());
    
    if (active.data.current?.type === 'image') {
      setDraggedImage({
        id: active.id.toString(),
        url: active.data.current.url,
        orderId: 0
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    console.log('DragEndEvent', event);
    setActiveId(null);
    setDraggedImage(null);
    
    const {active, over} = event;
    
    if (!over) return;

    // Handle frame reordering - only if active item is a frame
    if (active.data.current?.type !== 'image' && !over.id.toString().includes('droppable-')) {
      setFrames((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) return items;
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({
          ...item,
          orderId: index
        }));
      });
      return;
    }

    // Handle image dropping into frames
    const frameId = over.id.toString().replace('droppable-', '');
    const frame = frames.find(f => f.id === frameId);
    const dragData = active.data.current as DragData | undefined;
    console.log('dragData', frame, dragData);
    if (frame && dragData?.type === 'image') {
      setFrames(frames.map(f => {
        if (f.id === frameId) {
          // Check if image already exists in this frame
          if (f.images.some(img => img.id === active.id)) {
            return f;
          }
          
          // Add new image with next orderId
          const nextOrderId = Math.max(-1, ...f.images.map(img => img.orderId)) + 1;
          
          return {
            ...f,
            images: [...f.images, {
              id: active.id.toString(),
              url: dragData.url,
              orderId: nextOrderId
            }]
          };
        }
        return f;
      }));
    }
  };

  const removeImageFromFrame = (frameId: string, imageId: string) => {
    setFrames(frames.map(frame => 
      frame.id === frameId 
        ? { ...frame, images: frame.images.filter(img => img.id !== imageId) }
        : frame
    ));
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen w-full p-4 flex">
        <div className={`transition-[width] duration-300 ease-in-out ${isSidebarOpen ? 'w-[calc(100%-384px)]' : 'w-full'}`}>
          <SortableContext 
            items={frames}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {frames.map((frame) => (
                <SortableFrame
                  key={frame.id}
                  frame={frame}
                  onRemove={removeFrame}
                  onCaptionChange={updateCaption}
                  onRemoveImage={(imageId) => removeImageFromFrame(frame.id, imageId)}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {draggedImage && (
              <div className="relative aspect-square w-24 h-24 rounded-md overflow-hidden shadow-lg opacity-80">
                <img
                  src={draggedImage.url}
                  alt="Dragging preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </DragOverlay>

          <Card className="mt-5 cursor-pointer hover:bg-accent transition-colors" onClick={addFrame}>
            <CardContent className="p-6">
              <Button 
                variant="ghost" 
                className="w-full h-full flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Frame
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          className={`fixed bottom-4 z-20 bg-background shadow-md rounded-l-full rounded-r-none border transition-all duration-300 ${
            isSidebarOpen 
              ? 'right-[384px]' 
              : 'right-0'
          }`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        {/* Sidebar */}
        <div 
          className={`fixed right-0 top-0 h-screen w-96 bg-background border-l transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <div className="p-4 h-full overflow-y-auto">
            <Images 
              usedImageIds={usedImageIds} 
              images={libraryImages}
              setImages={setLibraryImages}
            />
          </div>
        </div>
      </div>
    </DndContext>
  );
}
