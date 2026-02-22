import { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import { Download, Loader2, Unlock, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

declare global {
  interface Window {
    PDFLib: any;
  }
}

export default function PdfUnlock() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [unlockedPdfUrl, setUnlockedPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    setPdfFile(file);
    setPassword('');
    setUnlockedPdfUrl(null);
    setError(null);
  };

  const handleUnlock = async () => {
    if (!pdfFile || !libraryLoaded) return;

    setUnlocking(true);
    setError(null);

    try {
      const { PDFDocument } = window.PDFLib;
      const arrayBuffer = await pdfFile.arrayBuffer();
      
      // Try to load the PDF (with password if provided)
      let pdfDoc;
      try {
        pdfDoc = await PDFDocument.load(arrayBuffer, { 
          ignoreEncryption: false,
          password: password || undefined 
        });
      } catch (err) {
        throw new Error('Invalid password or the PDF is corrupted. Please check your password and try again.');
      }

      // Save the PDF without encryption
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setUnlockedPdfUrl(url);
    } catch (error) {
      console.error('Error unlocking PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to unlock PDF. Please try again.';
      setError(errorMessage);
    } finally {
      setUnlocking(false);
    }
  };

  const handleDownload = () => {
    if (!unlockedPdfUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = unlockedPdfUrl;
    const originalName = pdfFile.name.replace('.pdf', '');
    link.download = `${originalName}_unlocked.pdf`;
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
              src="/assets/generated/icon-unlock-pdf.dim_64x64.png"
              alt="Unlock PDF"
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF Unlock</h1>
          <p className="text-lg text-muted-foreground">
            Remove password protection from your PDF documents
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".pdf,application/pdf"
            onFileSelect={handleFileSelect}
            maxSize={50 * 1024 * 1024}
            label="Upload Protected PDF"
          />

          {pdfFile && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Password (if required)</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter PDF password"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank if the PDF is not password-protected
                </p>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleUnlock}
                  disabled={unlocking || !libraryLoaded}
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {unlocking ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Unlocking...
                    </>
                  ) : (
                    <>
                      <Unlock className="h-5 w-5" />
                      Unlock PDF
                    </>
                  )}
                </button>
              </div>

              {unlockedPdfUrl && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">PDF Unlocked Successfully!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your PDF is now unlocked and ready to download
                    </p>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Download Unlocked PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-muted/30 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">How It Works</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>Upload your password-protected PDF</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Enter the password if the PDF requires one</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Click "Unlock PDF" to remove the protection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Download your unlocked PDF file</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
