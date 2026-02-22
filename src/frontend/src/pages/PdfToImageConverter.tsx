import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import { Download, Image as ImageIcon } from 'lucide-react';

export default function PdfToImageConverter() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setImages([]);
  };

  const handleConvert = async () => {
    if (!uploadedFile) return;

    setConverting(true);
    // Placeholder for PDF to image conversion
    // In a real implementation, use pdf.js or similar library
    setTimeout(() => {
      setConverting(false);
      // Simulated result
      setImages(['/assets/generated/icon-pdf-to-image.dim_64x64.png']);
    }, 2000);
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/icon-pdf-to-image.dim_64x64.png"
              alt="PDF to Image"
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF to Image Converter</h1>
          <p className="text-lg text-muted-foreground">
            Convert each page of your PDF into high-quality images
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".pdf"
            onFileSelect={handleFileUpload}
            maxSize={50 * 1024 * 1024}
            label="Upload PDF File"
          />

          {uploadedFile && !images.length && (
            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={converting}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {converting ? 'Converting...' : 'Convert to Images'}
              </button>
            </div>
          )}

          {images.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Converted Images ({images.length})
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img}
                      alt={`Page ${idx + 1}`}
                      className="w-full h-auto rounded-lg border border-border"
                    />
                    <button className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Download className="h-6 w-6 text-white" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                Download All as ZIP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
