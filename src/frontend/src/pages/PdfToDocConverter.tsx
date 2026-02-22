import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import { FileDown } from 'lucide-react';

export default function PdfToDocConverter() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [docGenerated, setDocGenerated] = useState(false);
  const [outputFormat, setOutputFormat] = useState<'docx' | 'txt'>('txt');

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setDocGenerated(false);
  };

  const handleConvert = async () => {
    if (!uploadedFile) return;

    setConverting(true);
    // Placeholder for PDF to document conversion
    setTimeout(() => {
      setConverting(false);
      setDocGenerated(true);
    }, 2000);
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/icon-pdf-to-doc.dim_64x64.png"
              alt="PDF to Document"
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF to Document Converter</h1>
          <p className="text-lg text-muted-foreground">
            Extract text from PDF and convert to editable formats
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".pdf"
            onFileSelect={handleFileUpload}
            maxSize={50 * 1024 * 1024}
            label="Upload PDF File"
          />

          {uploadedFile && !docGenerated && (
            <>
              <div className="space-y-3">
                <label className="text-sm font-medium">Output Format</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setOutputFormat('txt')}
                    className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                      outputFormat === 'txt'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    Text (.txt)
                  </button>
                  <button
                    onClick={() => setOutputFormat('docx')}
                    className={`flex-1 py-3 rounded-lg border-2 font-medium transition-colors ${
                      outputFormat === 'docx'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    Word (.docx)
                  </button>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleConvert}
                  disabled={converting}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {converting ? 'Converting...' : 'Convert to Document'}
                </button>
              </div>
            </>
          )}

          {docGenerated && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-primary/10 rounded-lg">
                <FileDown className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="text-lg font-medium">Document Created Successfully!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {uploadedFile?.name.replace('.pdf', `.${outputFormat}`)}
                </p>
              </div>
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Download Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
