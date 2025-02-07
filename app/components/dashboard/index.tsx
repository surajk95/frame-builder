'use client'
import { useState, useMemo } from 'react';
import { Plus, ChevronLeft, ChevronRight, Download, Save, RotateCcw, Trash2 } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Images } from '@/app/components/images';
import { Frame, Image } from './types';
import { SortableFrame } from './sortable-frame';
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
import { useToast } from "@/hooks/use-toast";
import { ImagePreview } from './image-preview'

interface DragData {
  type: 'image';
  url: string;
}

interface StoredState {
  frames: Frame[];
  libraryImages: Image[];
  isSidebarOpen: boolean;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('dashboardState');
    if (!stored) return true;
    const parsed = JSON.parse(stored) as StoredState;
    return parsed.isSidebarOpen;
  });

  const [frames, setFrames] = useState<Frame[]>(() => {
    if (typeof window === 'undefined') return [{
      id: crypto.randomUUID(),
      orderId: 0,
      caption: '',
      images: [],
    }];
    
    const stored = localStorage.getItem('dashboardState');
    if (!stored) return [{
      id: crypto.randomUUID(),
      orderId: 0,
      caption: '',
      images: [],
    }];
    
    const parsed = JSON.parse(stored) as StoredState;
    return parsed.frames;
  });

  const [draggedImage, setDraggedImage] = useState<Image | null>(null);
  const [libraryImages, setLibraryImages] = useState<Image[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem('dashboardState');
    if (!stored) return [];
    const parsed = JSON.parse(stored) as StoredState;
    return parsed.libraryImages;
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Only start dragging after moving 8px
      },
    }),
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
    
    if (active.data.current?.type === 'image' || active.data.current?.type === 'frameImage') {
      setDraggedImage({
        id: active.id.toString(),
        url: active.data.current.url,
        orderId: 0
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggedImage(null);
    
    const {active, over} = event;
    if (!over) return;

    // Handle frame reordering
    if (active.data.current?.type !== 'image' && 
        active.data.current?.type !== 'frameImage' && 
        !over.id.toString().includes('droppable-')) {
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

    const dragData = active.data.current as (DragData | { type: 'frameImage', frameId: string, url: string }) | undefined;
    if (!dragData) return;

    // Get frame ID either from droppable area or from the image being dropped on
    let targetFrameId = over.id.toString().replace('droppable-', '');
    const overFrame = frames.find(f => f.id === targetFrameId);
    
    // If we're dropping on an image, find its frame
    if (!overFrame) {
      const frameWithOverImage = frames.find(f => 
        f.images.some(img => img.id === over.id.toString())
      );
      if (frameWithOverImage) {
        targetFrameId = frameWithOverImage.id;
      }
    }

    const targetFrame = frames.find(f => f.id === targetFrameId);
    if (!targetFrame) return;

    setFrames(frames.map(f => {
      // Remove image from source frame if it's a frame-to-frame move
      if (dragData.type === 'frameImage' && f.id === dragData.frameId
        && dragData.frameId !== targetFrameId
      ) {
        return {
          ...f,
          images: f.images.filter(img => img.id !== active.id)
        };
      }

      // Add/reorder image in target frame
      if (f.id === targetFrameId) {
        let newImages = [...f.images];
        const draggedImage = {
          id: active.id.toString(),
          url: dragData.url,
          orderId: 0
        };

        // Find the current index of the dragged image (if it exists in this frame)
        const currentIndex = newImages.findIndex(img => img.id === draggedImage.id);
        
        // Find where we want to insert the image
        const overImageIndex = newImages.findIndex(img => img.id === over.id.toString());
        
        // Remove the dragged image if it already exists in this frame
        if (currentIndex !== -1) {
          newImages.splice(currentIndex, 1);
          if (overImageIndex !== -1) {
            newImages.splice(overImageIndex, 0, draggedImage);
          } else {
            newImages.push(draggedImage);
          }
        } else {
          // If the image wasn't in this frame before, just insert it at the target position
          if (overImageIndex !== -1) {
            newImages.splice(overImageIndex, 0, draggedImage);
          } else {
            newImages.push(draggedImage);
          }
        }

        // Update orderIds
        newImages = newImages.map((img, index) => ({
          ...img,
          orderId: index
        }));

        return {
          ...f,
          images: newImages
        };
      }
      return f;
    }));
  };

  const removeImageFromFrame = (frameId: string, imageId: string) => {
    setFrames(frames.map(frame => 
      frame.id === frameId 
        ? { ...frame, images: frame.images.filter(img => img.id !== imageId) }
        : frame
    ));
  };

  const exportData = () => {
    // Sort frames by orderId and process data
    const processedData = frames
      .sort((a, b) => a.orderId - b.orderId)
      .map(({ caption, images }) => ({
        caption,
        images: images
          .sort((a, b) => a.orderId - b.orderId)
          .map(({ url }) => {
            const image = libraryImages.find(img => img.url === url);
            if (!image) return { url };
            const { sizes } = image;
            
            // Convert sizes object to include both URL and size number
            const sizeEntries = sizes ? Object.entries(sizes).map(([size, sizeUrl]) => ({
              size: parseInt(size),
              url: sizeUrl
            })) : [];
            
            return {
              url,
              sizes: sizeEntries.length > 0 ? Object.fromEntries(
                sizeEntries.map(({ size, url }) => [size, url])
              ) : undefined
            };
          })
      }));

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(processedData, null, 2))
      .then(() => {
        toast({
          variant: "default",
          description: <span className="font-bold text-green-500">Copied data</span>,
          duration: 2000,
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          description: "Failed to copy data",
          duration: 2000,
        });
      });
  };

  const saveState = () => {
    const state: StoredState = {
      frames,
      libraryImages,
      isSidebarOpen
    };
    
    localStorage.setItem('dashboardState', JSON.stringify(state));
    toast({
      variant: "default",
      description: <span className="font-bold text-green-500">Saved state to browser storage</span>,
      duration: 2000,
    });
  };

  const retrieveState = () => {
    const stored = localStorage.getItem('dashboardState');
    if (!stored) {
      toast({
        variant: "destructive",
        description: "No saved state found",
        duration: 2000,
      });
      return;
    }

    try {
      const parsed = JSON.parse(stored) as StoredState;
      setFrames(parsed.frames);
      setLibraryImages(parsed.libraryImages);
      setIsSidebarOpen(parsed.isSidebarOpen);
      
      toast({
        variant: "default",
        description: <span className="font-bold text-green-500">Retrieved saved state</span>,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error retrieving saved state:', error);
      toast({
        variant: "destructive",
        description: "Failed to load saved state",
        duration: 2000,
      });
    }


  };

  const resetState = () => {
    const initialFrame = {
      id: crypto.randomUUID(),
      orderId: 0,
      caption: '',
      images: [],
    };

    setFrames([initialFrame]);
    setLibraryImages([]);
    localStorage.removeItem('dashboardState');
    
    toast({
      variant: "default",
      description: <span className="font-bold text-orange-500">Reset to initial state</span>,
      duration: 2000,
    });
  };

  const handleImageClick = (imageUrl: string) => {
    if (!draggedImage) { // Only show preview if not dragging
      setPreviewImage(imageUrl)
    }
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {previewImage && (
        <ImagePreview
          imageUrl={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
      
      <div className="min-h-screen w-full p-4 flex">
        <div className={`transition-[width] duration-300 ease-in-out ${isSidebarOpen ? 'w-[calc(100%-384px)]' : 'w-full'}`}>
          <div className="mb-4 flex justify-end gap-2">
            <Button
              onClick={saveState}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Save State
            </Button>
            <Button
              onClick={retrieveState}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Retrieve State
            </Button>
            <Button
              onClick={resetState}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Reset
            </Button>
            <Button
              onClick={exportData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export (JSON)
            </Button>
          </div>

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
                  onImageClick={handleImageClick}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>
            {draggedImage && (
              <div className="relative w-24 h-24 rounded-md overflow-hidden shadow-lg opacity-80">
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
