import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractSizeFromUrl(url: string): { size: string; baseId: string } | null {
  const match = url.match(/\/([^/]+)-(\d+)_([^/.]+)\./);
  if (!match) return null;
  return {
    baseId: match[1],
    size: match[2]
  };
} 
