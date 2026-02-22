import { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import PdfReorder from '../components/PdfReorder';
import { Download, Loader2, Combine } from 'lucide-react';

declare global {
  interface Window {
    PDFLib: any;
  }
}

export default function PdfMerge() {
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [libraryLoaded, setLibraryLoaded] = useState(false);

  useEffect(() => {
    const loadPdfLib = async () => {
      if (!window.PDFLib) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
      setLibraryLoaded(true);
    };

    loadPdfLib();
  }, []);

  const handleFileSelect = (file: File) => {
    setPdfFiles((prev) => [...prev, file]);
    setMergedPdfUrl(null);
  };

  const handleReorder = (newOrder: File[]) => {
    setPdfFiles(newOrder);
    setMergedPdfUrl(null);
  };

  const handleRemove = (index: number) => {
    setPdfFiles((prev) => prev.filter((_, i) => i !== index));
    setMergedPdfUrl(null);
  };

  const handleMerge = async () => {
    if (pdfFiles.length < 2 || !libraryLoaded) return;

    setMerging(true);
    try {
      const { PDFDocument } = window.PDFLib;
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Failed to merge PDFs. Please try again.');
    } finally {
      setMerging(false);
    }
  };

  const handleDownload = () => {
    if (!mergedPdfUrl) return;

    const link = document.createElement('a');
    link.href = mergedPdfUrl;
    link.download = `merged-pdf-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/icon-merge-pdf.dim_64x64.png"
              alt="Merge PDF"
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF Merge</h1>
          <p className="text-lg text-muted-foreground">
            Combine multiple PDF documents into a single file
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            maxSize={50 * 1024 * 1024}
            label="Upload PDF Files"
          />

          {pdfFiles.length > 0 && (
            <>
              <PdfReorder
                files={pdfFiles}
                onReorder={handleReorder}
                onRemove={handleRemove}
              />

              {pdfFiles.length >= 2 && (
                <div className="flex justify-center">
                  <button
                    onClick={handleMerge}
                    disabled={merging || !libraryLoaded}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {merging ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Merging...
                      </>
                    ) : (
                      <>
                        <Combine className="h-5 w-5" />
                        Merge PDFs
                      </>
                    )}
                  </button>
                </div>
              )}

              {mergedPdfUrl && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">PDFs Merged Successfully!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your {pdfFiles.length} PDF files have been combined into one document
                    </p>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Download Merged PDF
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="bg-muted/30 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">How It Works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Upload two or more PDF documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Reorder files by dragging them to your preferred sequence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Click "Merge PDFs" to combine all documents</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Download your merged PDF file</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
