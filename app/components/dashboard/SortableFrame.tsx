import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grip, X } from "lucide-react";
import { Frame, Image } from "./types";
import { useDroppable } from "@dnd-kit/core";
import { Textarea } from "@/components/ui/textarea";
import { useDraggable } from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';

interface SortableFrameProps {
  frame: Frame;
  onRemove: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
  onRemoveImage: (imageId: string) => void;
  onSortImages: (frameId: string, images: Image[]) => void;
}

export function SortableFrame({ 
  frame, 
  onRemove, 
  onCaptionChange, 
  onRemoveImage,
  onSortImages 
}: SortableFrameProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: frame.id });

  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `droppable-${frame.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative"
    >
      <div
        className="absolute top-3 left-3 cursor-move"
        {...attributes}
        {...listeners}
      >
        <Grip className="h-4 w-4" />
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={() => onRemove(frame.id)}
      >
        <X className="h-4 w-4" />
      </Button>
      <div
        ref={setDroppableRef}
        className="h-[250px] border-2 border-solid border-gray-800 rounded-md p-4 pt-10"
      >
        <div className="absolute top-[10px] left-[-20px] font-bold">{frame.orderId + 1}.</div>
        <div className="grid grid-cols-4 gap-2 h-[120px]">
          {frame.images.length === 0 ? (
            <div className="col-span-4 flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">Drop images here</p>
            </div>
          ) : (
            <SortableContext 
              items={frame.images}
              strategy={horizontalListSortingStrategy}
            >
              {frame.images.map((image) => (
                <DraggableImage 
                  key={image.id} 
                  image={image} 
                  frameId={frame.id}
                  onRemove={onRemoveImage}
                />
              ))}
            </SortableContext>
          )}
        </div>
        <Textarea
          placeholder="Add a caption..."
          className="mt-4 resize-none"
          rows={1}
          value={frame.caption}
          onChange={(e) => onCaptionChange(frame.id, e.target.value)}
        />
      </div>
    </div>
  );
}

interface DraggableImageProps {
  image: Image;
  frameId: string;
  onRemove: (imageId: string) => void;
}

function DraggableImage({ image, frameId, onRemove }: DraggableImageProps) {
  const { attributes, listeners, setNodeRef, isDragging, transform, transition } = useSortable({
    id: image.id,
    data: {
      type: 'frameImage',
      frameId,
      url: image.url
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`relative group h-[120px] ${isDragging ? 'opacity-50' : ''}`}
    >
      <img
        src={image.url}
        alt="Frame image"
        className="w-full h-full aspect-square object-cover rounded-md"
      />
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(image.id);
        }}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
} 