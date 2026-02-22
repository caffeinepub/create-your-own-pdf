import { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import ImageReorder from '../components/ImageReorder';
import { FileDown, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Type definitions for dynamically loaded library
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load pdf-lib from CDN
    const loadLibrary = async () => {
      try {
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
      } catch (err) {
        console.error('Failed to load PDF library:', err);
        setError('Failed to load required library. Please refresh the page.');
      }
    };

    loadLibrary();
  }, []);

  const handleFileUpload = (file: File) => {
    setImages((prev) => [...prev, file]);
    setPdfUrl(null);
    setError(null);
  };

  const handleReorder = (reorderedImages: File[]) => {
    setImages(reorderedImages);
  };

  const handleRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (images.length === 0 || !libraryLoaded) return;

    setConverting(true);
    setPdfUrl(null);
    setError(null);

    try {
      const { PDFDocument } = window.PDFLib;

      // Create a new PDF document
      const pdfDoc = await PDFDocument.create();

      // Process each image
      for (const imageFile of images) {
        const imageBytes = await imageFile.arrayBuffer();
        const uint8Array = new Uint8Array(imageBytes);

        // Embed the image based on its type
        let image;
        const fileType = imageFile.type.toLowerCase();

        if (fileType.includes('png')) {
          image = await pdfDoc.embedPng(uint8Array);
        } else if (fileType.includes('jpg') || fileType.includes('jpeg')) {
          image = await pdfDoc.embedJpg(uint8Array);
        } else {
          // Try to embed as JPEG by default for other image types
          try {
            image = await pdfDoc.embedJpg(uint8Array);
          } catch {
            // If that fails, try PNG
            image = await pdfDoc.embedPng(uint8Array);
          }
        }

        // Get image dimensions
        const imageDims = image.scale(1);

        // Calculate page size to fit the image
        // Use A4 size as maximum, scale image to fit if needed
        const maxWidth = 595; // A4 width in points
        const maxHeight = 842; // A4 height in points

        let pageWidth = imageDims.width;
        let pageHeight = imageDims.height;
        let imageWidth = imageDims.width;
        let imageHeight = imageDims.height;

        // Scale down if image is larger than A4
        if (imageWidth > maxWidth || imageHeight > maxHeight) {
          const widthRatio = maxWidth / imageWidth;
          const heightRatio = maxHeight / imageHeight;
          const scale = Math.min(widthRatio, heightRatio);

          imageWidth = imageWidth * scale;
          imageHeight = imageHeight * scale;
          pageWidth = imageWidth;
          pageHeight = imageHeight;
        }

        // Add a page with the calculated dimensions
        const page = pdfDoc.addPage([pageWidth, pageHeight]);

        // Draw the image on the page
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: imageWidth,
          height: imageHeight,
        });
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save();

      // Create a blob URL for download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      setPdfUrl(url);
      setConverting(false);
    } catch (err) {
      console.error('Error converting images to PDF:', err);
      setError('Failed to convert images to PDF. Please try again.');
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    link.download = `combined-images-${timestamp}.pdf`;
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
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-4xl font-bold">Image to PDF Converter</h1>
          <p className="text-lg text-muted-foreground">
            Combine multiple images into a single PDF document
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!libraryLoaded && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Loading PDF library...</AlertDescription>
          </Alert>
        )}

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

              {!pdfUrl && (
                <div className="flex justify-center">
                  <button
                    onClick={handleConvert}
                    disabled={converting || !libraryLoaded}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                  >
                    {converting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Creating PDF...
                      </>
                    ) : (
                      'Create PDF'
                    )}
                  </button>
                </div>
              )}

              {pdfUrl && (
                <div className="text-center space-y-4">
                  <div className="p-6 bg-primary/10 rounded-lg">
                    <FileDown className="h-12 w-12 text-primary mx-auto mb-3" />
                    <p className="text-lg font-medium">PDF Created Successfully!</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your {images.length} image{images.length > 1 ? 's have' : ' has'} been combined into a PDF
                    </p>
                  </div>
                  <button
                    onClick={handleDownload}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <FileDown className="h-5 w-5" />
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
