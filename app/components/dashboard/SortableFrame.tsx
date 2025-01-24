import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X } from "lucide-react";
import { Frame } from "./types";

interface Props {
  frame: Frame;
  onRemove: (id: string) => void;
}

export function SortableFrame({ frame, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: frame.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="w-full h-[100px] border border-gray-300 rounded-lg p-4 relative bg-background cursor-grab active:cursor-grabbing"
    >
      <button
        onClick={() => onRemove(frame.id)}
        className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 
                   transition-colors"
        aria-label="Remove frame"
      >
        <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
      </button>
      
      {frame.orderId + 1}.
      <div>Caption: {frame.caption}</div>
    </div>
  );
} 