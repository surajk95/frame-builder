'use client'
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function Dashboard() {
  const [frames, setFrames] = useState<Frame[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
    
    if (over && active.id !== over.id) {
      setFrames((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        // Update orderIds after moving
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({
          ...item,
          orderId: index
        }));
      });
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
