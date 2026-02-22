import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import { FileDown } from 'lucide-react';

export default function DocToPdfConverter() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setPdfGenerated(false);
  };

  const handleConvert = async () => {
    if (!uploadedFile) return;

    setConverting(true);
    // Placeholder for document to PDF conversion
    setTimeout(() => {
      setConverting(false);
      setPdfGenerated(true);
    }, 2000);
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/icon-doc-to-pdf.dim_64x64.png"
              alt="Document to PDF"
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-4xl font-bold">Document to PDF Converter</h1>
          <p className="text-lg text-muted-foreground">
            Convert DOCX, TXT, and RTF files to PDF format
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".docx,.txt,.rtf"
            onFileSelect={handleFileUpload}
            maxSize={20 * 1024 * 1024}
            label="Upload Document"
          />

          {uploadedFile && !pdfGenerated && (
            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={converting}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {converting ? 'Converting...' : 'Convert to PDF'}
              </button>
            </div>
          )}

          {pdfGenerated && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-primary/10 rounded-lg">
                <FileDown className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="text-lg font-medium">PDF Created Successfully!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {uploadedFile?.name.replace(/\.[^/.]+$/, '.pdf')}
                </p>
              </div>
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
