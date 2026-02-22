import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import ImageReorder from '../components/ImageReorder';
import { FileDown } from 'lucide-react';

export default function ImageToPdfConverter() {
  const [images, setImages] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [pdfGenerated, setPdfGenerated] = useState(false);

  const handleFileUpload = (file: File) => {
    setImages((prev) => [...prev, file]);
    setPdfGenerated(false);
  };

  const handleReorder = (reorderedImages: File[]) => {
    setImages(reorderedImages);
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (images.length === 0) return;

    setConverting(true);
    // Placeholder for image to PDF conversion
    // In a real implementation, use jsPDF or pdf-lib
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
              src="/assets/generated/icon-image-to-pdf.dim_64x64.png"
              alt="Image to PDF"
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-4xl font-bold">Image to PDF Converter</h1>
          <p className="text-lg text-muted-foreground">
            Combine multiple images into a single PDF document
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept="image/*"
            onFileSelect={handleFileUpload}
            maxSize={10 * 1024 * 1024}
            label="Upload Images"
            multiple
          />

          {images.length > 0 && (
            <>
              <ImageReorder images={images} onReorder={handleReorder} onRemove={handleRemove} />

              {!pdfGenerated && (
                <div className="flex justify-center">
                  <button
                    onClick={handleConvert}
                    disabled={converting}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {converting ? 'Creating PDF...' : 'Create PDF'}
                  </button>
                </div>
              )}

              {pdfGenerated && (
                <div className="text-center space-y-4">
                  <div className="p-6 bg-primary/10 rounded-lg">
                    <FileDown className="h-12 w-12 text-primary mx-auto mb-3" />
                    <p className="text-lg font-medium">PDF Created Successfully!</p>
                  </div>
                  <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Download PDF
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
