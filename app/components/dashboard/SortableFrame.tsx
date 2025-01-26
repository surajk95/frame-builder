import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grip, X } from "lucide-react";
import { Frame, Image } from "./types";
import { useDroppable } from "@dnd-kit/core";
import { Textarea } from "@/components/ui/textarea";

interface SortableFrameProps {
  frame: Frame;
  onRemove: (id: string) => void;
  onCaptionChange: (id: string, caption: string) => void;
}

export function SortableFrame({ frame, onRemove, onCaptionChange }: SortableFrameProps) {
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
        className="min-h-[200px] border-2 border-solid border-gray-800 rounded-md p-4"
      >
        <div className="text-sm text-muted-foreground mb-4">
          <span className="font-bold ml-[-40px]">{frame.orderId + 1}.</span>
        </div>
        <div className="grid grid-cols-6 gap-2 min-h-[100px]">
          {frame.images.length === 0 ? (
            <div className="col-span-6 flex items-center justify-center h-full">
              <p className="text-muted-foreground text-sm">Drop images here</p>
            </div>
          ) : (
            frame.images.map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt="Frame image"
                className="w-full aspect-square object-cover rounded-md"
              />
            ))
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