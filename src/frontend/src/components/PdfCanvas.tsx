import { useEffect, useRef, useState } from 'react';
import type { EditorTool } from '../pages/PdfEditor';

interface PdfCanvasProps {
  file: File;
  activeTool: EditorTool;
}

export default function PdfCanvas({ file, activeTool }: PdfCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(5); // Simulated

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simulate PDF rendering
    ctx.fillStyle = 'oklch(0.97 0 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'oklch(0.556 0 0)';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`PDF Page ${currentPage} - ${file.name}`, canvas.width / 2, canvas.height / 2);
    ctx.fillText(`Active Tool: ${activeTool}`, canvas.width / 2, canvas.height / 2 + 30);
  }, [file, currentPage, activeTool]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Previous
        </button>
        <span className="text-sm font-medium">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
        </button>
      </div>

      <div className="flex justify-center p-8 bg-muted/30">
        <canvas
          ref={canvasRef}
          width={800}
          height={1000}
          className="border border-border shadow-lg bg-white"
        />
      </div>
    </div>
  );
}
