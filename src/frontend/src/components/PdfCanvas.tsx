import { useEffect, useRef, useState } from 'react';
import type { EditorTool } from '../pages/PdfEditor';

interface PdfCanvasProps {
  file: File;
  activeTool: EditorTool;
}

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export default function PdfCanvas({ file, activeTool }: PdfCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [libraryLoaded, setLibraryLoaded] = useState(false);

  useEffect(() => {
    const loadPdfJs = async () => {
      if (!window.pdfjsLib) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });

        if (window.pdfjsLib) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        }
      }
      setLibraryLoaded(true);
    };

    loadPdfJs();
  }, []);

  useEffect(() => {
    if (!libraryLoaded || !file) return;

    const loadPdf = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setPdfDoc(pdf);
        setTotalPages(pdf.numPages);
      } catch (error) {
        console.error('Error loading PDF:', error);
      }
    };

    loadPdf();
  }, [file, libraryLoaded]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    const renderPage = async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        const viewport = page.getViewport({ scale: 1.5 });
        
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;
      } catch (error) {
        console.error('Error rendering page:', error);
      }
    };

    renderPage();
  }, [pdfDoc, currentPage]);

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
          className="border border-border shadow-lg bg-white"
        />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Active Tool: <span className="font-medium capitalize">{activeTool}</span>
      </div>
    </div>
  );
}
