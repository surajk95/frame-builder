'use client'
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Image } from "./dashboard/types";

interface SortableImageProps {
  image: Image;
}

export function SortableImage({ image }: SortableImageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ 
    id: image.id,
    data: {
      type: 'image',
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
      {...attributes}
      {...listeners}
      className="relative aspect-square cursor-move border border-primary rounded-md overflow-hidden hover:opacity-80 transition-opacity"
    >
      <img
        src={image.url}
        alt="Draggable image"
        className="w-full h-full object-cover"
      />
    </div>
  );
} 