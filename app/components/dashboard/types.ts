export interface Image {
  id: string;
  url: string;
  orderId: number;
  sizes?: Record<string, string>; // Map of size -> URL
}

export interface Frame {
  id: string;
  orderId: number;
  caption: string;
  images: Image[];
} 