import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import PdfReorder from '../components/PdfReorder';
import { FileDown } from 'lucide-react';

export default function PdfMerge() {
  const [pdfs, setPdfs] = useState<File[]>([]);
  const [merging, setMerging] = useState(false);
  const [mergeComplete, setMergeComplete] = useState(false);

  const handleFileUpload = (file: File) => {
    setPdfs((prev) => [...prev, file]);
    setMergeComplete(false);
  };

  const handleReorder = (reorderedPdfs: File[]) => {
    setPdfs(reorderedPdfs);
  };

  const handleRemove = (index: number) => {
    setPdfs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMerge = async () => {
    if (pdfs.length < 2) return;

    setMerging(true);
    // Placeholder for PDF merging
    setTimeout(() => {
      setMerging(false);
      setMergeComplete(true);
    }, 2000);
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/icon-merge-pdf.dim_64x64.png"
              alt="Merge PDF"
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF Merge</h1>
          <p className="text-lg text-muted-foreground">
            Combine multiple PDF files into a single document
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".pdf"
            onFileSelect={handleFileUpload}
            maxSize={50 * 1024 * 1024}
            label="Upload PDF Files"
            multiple
          />

          {pdfs.length > 0 && (
            <>
              <PdfReorder pdfs={pdfs} onReorder={handleReorder} onRemove={handleRemove} />

              {!mergeComplete && pdfs.length >= 2 && (
                <div className="flex justify-center">
                  <button
                    onClick={handleMerge}
                    disabled={merging}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {merging ? 'Merging...' : `Merge ${pdfs.length} PDFs`}
                  </button>
                </div>
              )}

              {mergeComplete && (
                <div className="text-center space-y-4">
                  <div className="p-6 bg-primary/10 rounded-lg">
                    <FileDown className="h-12 w-12 text-primary mx-auto mb-3" />
                    <p className="text-lg font-medium">PDFs Merged Successfully!</p>
                  </div>
                  <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Download Merged PDF
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
