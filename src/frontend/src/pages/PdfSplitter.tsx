import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import PageSelector from '../components/PageSelector';
import { FileDown } from 'lucide-react';

export default function PdfSplitter() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedPages, setSelectedPages] = useState<number[]>([]);
  const [splitting, setSplitting] = useState(false);
  const [splitComplete, setSplitComplete] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setSplitComplete(false);
    // Simulate getting page count
    setTotalPages(10);
  };

  const handleSplit = async () => {
    if (!uploadedFile || selectedPages.length === 0) return;

    setSplitting(true);
    // Placeholder for PDF splitting
    setTimeout(() => {
      setSplitting(false);
      setSplitComplete(true);
    }, 2000);
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/icon-split-pdf.dim_64x64.png"
              alt="Split PDF"
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF Splitter</h1>
          <p className="text-lg text-muted-foreground">
            Split your PDF into multiple files by page ranges
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".pdf"
            onFileSelect={handleFileUpload}
            maxSize={50 * 1024 * 1024}
            label="Upload PDF File"
          />

          {uploadedFile && totalPages > 0 && !splitComplete && (
            <>
              <PageSelector
                totalPages={totalPages}
                selectedPages={selectedPages}
                onSelectionChange={setSelectedPages}
              />

              {selectedPages.length > 0 && (
                <div className="flex justify-center">
                  <button
                    onClick={handleSplit}
                    disabled={splitting}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {splitting ? 'Splitting...' : `Split PDF (${selectedPages.length} pages)`}
                  </button>
                </div>
              )}
            </>
          )}

          {splitComplete && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-primary/10 rounded-lg">
                <FileDown className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="text-lg font-medium">PDF Split Successfully!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedPages.length} page(s) extracted
                </p>
              </div>
              <div className="flex gap-4 justify-center">
                <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  Download Split PDFs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
