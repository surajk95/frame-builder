'use client'
import { useState } from 'react';
import { X } from 'lucide-react'; // Import X icon from lucide-react

// Define the Frame type
type Frame = {
  id: string;
  orderId: number;
  caption: string;
  images: string[];
};

export default function Dashboard() {
  const [frames, setFrames] = useState<Frame[]>([]);

  const addFrame = () => {
    const newFrame: Frame = {
      id: crypto.randomUUID(), // Generate a unique ID
      orderId: frames.length, // Use the current length as orderId
      caption: '', // Initialize with empty caption
      images: [], // Initialize with empty images array
    };

    setFrames([...frames, newFrame]);
  };

  const removeFrame = (frameId: string) => {
    setFrames(frames.filter(frame => frame.id !== frameId));
  };

  return (
    <div className="min-h-screen w-full p-4">
      {/* Display frames */}
      <div className="space-y-4">
        {frames.map((frame, index) => (
          <div
            key={frame.id}
            className="w-full h-[100px] border border-gray-300 rounded-lg p-4 relative"
          >
            {/* Add close button */}
            <button
              onClick={() => removeFrame(frame.id)}
              className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 
                         transition-colors"
              aria-label="Remove frame"
            >
              <X className="h-4 w-4 text-gray-500 hover:text-gray-700" />
            </button>
            
            {index + 1}.
            <div>Caption: {frame.caption}</div>
          </div>
        ))}
      </div>

      {/* Add Frame button */}
      <button
        onClick={addFrame}
        className="w-full
                 bg-blue-500 text-white px-6 mt-5 py-2 rounded-lg 
                 hover:bg-blue-600 transition-colors"
      >
        Add Frame
      </button>
    </div>
  );
}
