import { FileText, X } from 'lucide-react';

interface PdfReorderProps {
  files: File[];
  onReorder: (files: File[]) => void;
  onRemove: (index: number) => void;
}

export default function PdfReorder({ files, onReorder, onRemove }: PdfReorderProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">PDF Files ({files.length})</h3>
      <div className="space-y-3">
        {files.map((pdf, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary font-semibold">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                <span className="font-medium truncate">{pdf.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {(pdf.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <button
              onClick={() => onRemove(index)}
              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ))}
      </div>
      <p className="text-sm text-muted-foreground">
        PDFs will be merged in the order shown above
      </p>
    </div>
  );
}
