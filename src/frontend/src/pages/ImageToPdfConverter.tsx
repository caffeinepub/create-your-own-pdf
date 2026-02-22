import { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import ImageReorder from '../components/ImageReorder';
import { Download, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    PDFLib: any;
  }
}

export default function ImageToPdfConverter() {
  const [images, setImages] = useState<File[]>([]);
  const [converting, setConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
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
    setImages((prev) => [...prev, file]);
    setPdfUrl(null);
  };

  const handleReorder = (newOrder: File[]) => {
    setImages(newOrder);
    setPdfUrl(null);
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPdfUrl(null);
  };

  const handleConvert = async () => {
    if (images.length === 0 || !libraryLoaded) return;

    setConverting(true);
    try {
      const { PDFDocument } = window.PDFLib;
      const pdfDoc = await PDFDocument.create();

      for (const imageFile of images) {
        const imageBytes = await imageFile.arrayBuffer();
        let image;

        if (imageFile.type === 'image/png') {
          image = await pdfDoc.embedPng(imageBytes);
        } else if (imageFile.type === 'image/jpeg' || imageFile.type === 'image/jpg') {
          image = await pdfDoc.embedJpg(imageBytes);
        } else {
          console.warn(`Unsupported image type: ${imageFile.type}`);
          continue;
        }

        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
        const { width: pageWidth, height: pageHeight } = page.getSize();
        const { width: imgWidth, height: imgHeight } = image.scale(1);

        // Calculate scaling to fit image on page while maintaining aspect ratio
        const scale = Math.min(
          (pageWidth - 40) / imgWidth,
          (pageHeight - 40) / imgHeight
        );

        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        // Center the image on the page
        const x = (pageWidth - scaledWidth) / 2;
        const y = (pageHeight - scaledHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: scaledWidth,
          height: scaledHeight,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error converting images to PDF:', error);
      alert('Failed to convert images to PDF. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = `images-to-pdf-${Date.now()}.pdf`;
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
              src="/assets/generated/icon-image-to-pdf.dim_64x64.png"
              alt="Image to PDF"
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold">Image to PDF Converter</h1>
          <p className="text-lg text-muted-foreground">
            Convert multiple images into a single PDF document
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept="image/png,image/jpeg,image/jpg"
            onFileSelect={handleFileSelect}
            maxSize={10 * 1024 * 1024}
            label="Upload Images"
          />

          {images.length > 0 && (
            <>
              <ImageReorder
                images={images}
                onReorder={handleReorder}
                onRemove={handleRemove}
              />

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleConvert}
                  disabled={converting || !libraryLoaded}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {converting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Convert to PDF'
                  )}
                </button>
              </div>

              {pdfUrl && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">PDF Ready!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your images have been converted to a PDF document
                    </p>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Download PDF
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
              <span>Upload one or more images (PNG, JPEG, JPG)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Reorder images by dragging them to your preferred sequence</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Click "Convert to PDF" to create your document</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Download your PDF with all images in the correct order</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
