import { GripVertical, X } from 'lucide-react';

interface ImageReorderProps {
  images: File[];
  onReorder: (images: File[]) => void;
  onRemove: (index: number) => void;
}

export default function ImageReorder({ images, onReorder, onRemove }: ImageReorderProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Images ({images.length})</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <div key={index} className="relative group">
            <div className="aspect-square rounded-lg border-2 border-border bg-muted overflow-hidden">
              <img
                src={URL.createObjectURL(image)}
                alt={image.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute top-2 left-2 bg-background/90 rounded px-2 py-1 text-xs font-medium">
              {index + 1}
            </div>
            <button
              onClick={() => onRemove(index)}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute bottom-2 left-2 right-2 bg-background/90 rounded px-2 py-1 text-xs truncate">
              {image.name}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        Images will be added to the PDF in the order shown above
      </p>
    </div>
  );
}
