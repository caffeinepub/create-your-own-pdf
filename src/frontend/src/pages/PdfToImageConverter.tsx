import { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import { Download, Loader2, FileImage } from 'lucide-react';

declare global {
  interface Window {
    pdfjsLib: any;
    JSZip: any;
  }
}

export default function PdfToImageConverter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [images, setImages] = useState<string[]>([]);
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

        // Load JSZip
        if (!window.JSZip) {
          const jszipScript = document.createElement('script');
          jszipScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
          jszipScript.async = true;
          document.head.appendChild(jszipScript);
          
          await new Promise((resolve, reject) => {
            jszipScript.onload = resolve;
            jszipScript.onerror = reject;
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

  const handleFileSelect = (file: File) => {
    setPdfFile(file);
    setImages([]);
  };

  const handleConvert = async () => {
    if (!pdfFile || !librariesLoaded) return;

    setConverting(true);
    setImages([]);

    try {
      const pdfjsLib = window.pdfjsLib;
      const arrayBuffer = await pdfFile.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;

      const imageUrls: string[] = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 2.0 });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          await page.render({
            canvasContext: context,
            viewport: viewport,
          }).promise;

          const imageUrl = canvas.toDataURL('image/png');
          imageUrls.push(imageUrl);
        }
      }

      setImages(imageUrls);
    } catch (error) {
      console.error('Error converting PDF to images:', error);
      alert('Failed to convert PDF to images. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  const handleDownloadSingle = (imageUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `page-${index + 1}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = async () => {
    if (images.length === 0 || !window.JSZip) return;

    try {
      const JSZip = window.JSZip;
      const zip = new JSZip();

      for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        zip.file(`page-${i + 1}.png`, blob);
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pdfFile?.name.replace('.pdf', '')}-images.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating zip file:', error);
      alert('Failed to create zip file. Please try again.');
    }
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/icon-pdf-to-image.dim_64x64.png"
              alt="PDF to Image"
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF to Image Converter</h1>
          <p className="text-lg text-muted-foreground">
            Convert PDF pages into high-quality images
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            maxSize={50 * 1024 * 1024}
            label="Upload PDF File"
          />

          {pdfFile && (
            <div className="flex justify-center">
              <button
                onClick={handleConvert}
                disabled={converting || !librariesLoaded}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {converting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <FileImage className="h-5 w-5" />
                    Convert to Images
                  </>
                )}
              </button>
            </div>
          )}

          {images.length > 0 && (
            <div className="space-y-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Converted Images ({images.length} pages)
                </h3>
                <button
                  onClick={handleDownloadAll}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download All as ZIP
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {images.map((imageUrl, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4 space-y-3"
                  >
                    <img
                      src={imageUrl}
                      alt={`Page ${index + 1}`}
                      className="w-full h-auto border border-border rounded"
                    />
                    <button
                      onClick={() => handleDownloadSingle(imageUrl, index)}
                      className="w-full py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Page {index + 1}
                    </button>
                  </div>
                ))}
              </div>
            </div>
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
              <span>Click "Convert to Images" to process all pages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Download individual pages or all images as a ZIP file</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
