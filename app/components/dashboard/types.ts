export interface Image {
  id: string;
  url: string;
  orderId: number;
}

export interface Frame {
  id: string;
  orderId: number;
  caption: string;
  images: Image[];
} 