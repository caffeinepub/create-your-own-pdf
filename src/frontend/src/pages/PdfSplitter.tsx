import { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import PageSelector from '../components/PageSelector';
import { Download, Loader2, Scissors } from 'lucide-react';

declare global {
  interface Window {
    pdfjsLib: any;
    PDFLib: any;
  }
}

export default function PdfSplitter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [splitting, setSplitting] = useState(false);
  const [splitPdfUrl, setSplitPdfUrl] = useState<string | null>(null);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);

  useEffect(() => {
    const loadLibraries = async () => {
      try {
        // Load PDF.js
        if (!window.pdfjsLib) {
          const pdfjsScript = document.createElement('script');
          pdfjsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
          pdfjsScript.async = true;
          document.head.appendChild(pdfjsScript);
          
          await new Promise((resolve, reject) => {
            pdfjsScript.onload = resolve;
            pdfjsScript.onerror = reject;
          });

          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }
        }

        // Load pdf-lib
        if (!window.PDFLib) {
          const pdflibScript = document.createElement('script');
          pdflibScript.src = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
          pdflibScript.async = true;
          document.head.appendChild(pdflibScript);
          
          await new Promise((resolve, reject) => {
            pdflibScript.onload = resolve;
            pdflibScript.onerror = reject;
          });
        }

        setLibrariesLoaded(true);
      } catch (err) {
        console.error('Failed to load libraries:', err);
        alert('Failed to load required libraries. Please refresh the page.');
      }
    };

    loadLibraries();
  }, []);

  useEffect(() => {
    if (!pdfFile || !librariesLoaded) return;

    const loadPdfInfo = async () => {
      try {
        const arrayBuffer = await pdfFile.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages);
      } catch (error) {
        console.error('Error loading PDF info:', error);
      }
    };

    loadPdfInfo();
  }, [pdfFile, librariesLoaded]);

  const handleFileSelect = (file: File) => {
    setPdfFile(file);
    setSelectedPages([]);
    setSplitPdfUrl(null);
    setTotalPages(0);
  };

  const handlePageSelection = (pages: number[]) => {
    setSelectedPages(pages);
    setSplitPdfUrl(null);
  };

  const handleSplit = async () => {
    if (!pdfFile || selectedPages.length === 0 || !librariesLoaded) return;

    setSplitting(true);
    try {
      const { PDFDocument } = window.PDFLib;
      const arrayBuffer = await pdfFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const newPdf = await PDFDocument.create();

      // Sort selected pages to maintain order
      const sortedPages = [...selectedPages].sort((a, b) => a - b);

      // Copy selected pages to new PDF (pages are 0-indexed in pdf-lib)
      const copiedPages = await newPdf.copyPages(
        sourcePdf,
        sortedPages.map(p => p - 1)
      );

      copiedPages.forEach(page => newPdf.addPage(page));

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setSplitPdfUrl(url);
    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Failed to split PDF. Please try again.');
    } finally {
      setSplitting(false);
    }
  };

  const handleDownload = () => {
    if (!splitPdfUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = splitPdfUrl;
    const originalName = pdfFile.name.replace('.pdf', '');
    const pageRange = selectedPages.length === 1 
      ? `page-${selectedPages[0]}`
      : `pages-${Math.min(...selectedPages)}-${Math.max(...selectedPages)}`;
    link.download = `${originalName}_${pageRange}.pdf`;
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
              src="/assets/generated/icon-split-pdf.dim_64x64.png"
              alt="Split PDF"
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF Splitter</h1>
          <p className="text-lg text-muted-foreground">
            Extract specific pages from your PDF document
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            maxSize={50 * 1024 * 1024}
            label="Upload PDF File"
          />

          {pdfFile && totalPages > 0 && (
            <>
              <PageSelector
                totalPages={totalPages}
                selectedPages={selectedPages}
                onSelectionChange={handlePageSelection}
              />

              {selectedPages.length > 0 && (
                <div className="space-y-4">
                  <div className="text-center text-sm text-muted-foreground">
                    Selected {selectedPages.length} page{selectedPages.length !== 1 ? 's' : ''}
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={handleSplit}
                      disabled={splitting || !librariesLoaded}
                      className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                      {splitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Splitting...
                        </>
                      ) : (
                        <>
                          <Scissors className="h-5 w-5" />
                          Split PDF
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {splitPdfUrl && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">PDF Split Complete!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your selected pages have been extracted
                    </p>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Download Split PDF
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
              <span>Upload your PDF document</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Select the pages you want to extract</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Click "Split PDF" to create a new document with selected pages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Download your split PDF</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
