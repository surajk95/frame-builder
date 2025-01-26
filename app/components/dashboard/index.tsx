'use client'
import { useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Images } from '@/app/components/images';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
    <div className="min-h-screen w-full p-4 flex">
      <div className={`transition-[width] duration-300 ease-in-out ${isSidebarOpen ? 'w-[calc(100%-384px)]' : 'w-full'}`}>
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

      {/* Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className={`fixed bottom-4  z-20 bg-background shadow-md rounded-l-full rounded-r-none border transition-all duration-300 ${
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
          <Images />
        </div>
      </div>
    </div>
  );
}
