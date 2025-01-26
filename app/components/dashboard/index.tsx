'use client'
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Frame } from './types';
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function Dashboard() {
  const [frames, setFrames] = useState<Frame[]>(() => [{
    id: crypto.randomUUID(),
    orderId: 0,
    caption: '',
    images: [],
  }]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragEnd = (event: DragEndEvent) => {
    const {active, over} = event;
    
    if (!over) return;

    // Handle frame reordering
    if (!over.id.toString().includes('droppable-')) {
      setFrames((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
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
    
    if (frame) {
      setFrames(frames.map(f => {
        if (f.id === frameId) {
          return {
            ...f,
            images: [...f.images, {
              id: active.id.toString(),
              url: (active.data.current as any)?.url || '',
              orderId: f.images.length
            }]
          };
        }
        return f;
      }));
    }
  };

  return (
    <div className="min-h-screen w-full p-4">
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
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
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

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
  );
}
