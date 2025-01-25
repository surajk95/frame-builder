import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grip, X } from "lucide-react";
import { Frame, Image } from "./types";
import { useDroppable } from "@dnd-kit/core";

interface SortableFrameProps {
  frame: Frame;
  onRemove: (id: string) => void;
}

export function SortableFrame({ frame, onRemove }: SortableFrameProps) {
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
          className="min-h-[100px] border-2 border-gray-300 border-gray-200 rounded-md p-4"
        >
          {frame.orderId + 1}.
          <div className="grid grid-cols-6 gap-2">
            {/* {frame.images.map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt="Frame image"
                className="w-full aspect-square object-cover rounded-md"
              />
            ))} */}
          </div>
        </div>
    </div>
  );
} 