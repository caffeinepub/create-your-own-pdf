import { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import { Download, Loader2, FileText } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

declare global {
  interface Window {
    pdfjsLib: any;
    docx: any;
  }
}

export default function PdfToDocConverter() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [format, setFormat] = useState<'txt' | 'docx'>('txt');
  const [converting, setConverting] = useState(false);
  const [docUrl, setDocUrl] = useState<string | null>(null);
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

        // Load docx library
        if (!window.docx) {
          const docxScript = document.createElement('script');
          docxScript.src = 'https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.js';
          docxScript.async = true;
          document.head.appendChild(docxScript);
          
          await new Promise((resolve, reject) => {
            docxScript.onload = resolve;
            docxScript.onerror = reject;
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
    setDocUrl(null);
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const pdfjsLib = window.pdfjsLib;
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }

    return fullText;
  };

  const handleConvert = async () => {
    if (!pdfFile || !librariesLoaded) return;

    setConverting(true);
    try {
      const text = await extractTextFromPdf(pdfFile);

      if (format === 'txt') {
        // Create TXT file
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        setDocUrl(url);
      } else {
        // Create DOCX file
        const { Document, Packer, Paragraph, TextRun } = window.docx;
        
        const paragraphs = text.split('\n').map(line => 
          new Paragraph({
            children: [new TextRun(line)],
          })
        );

        const doc = new Document({
          sections: [{
            properties: {},
            children: paragraphs,
          }],
        });

        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        setDocUrl(url);
      }
    } catch (error) {
      console.error('Error converting PDF to document:', error);
      alert('Failed to convert PDF to document. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!docUrl || !pdfFile) return;

    const link = document.createElement('a');
    link.href = docUrl;
    const originalName = pdfFile.name.replace('.pdf', '');
    link.download = `${originalName}.${format}`;
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
              src="/assets/generated/icon-pdf-to-doc.dim_64x64.png"
              alt="PDF to Document"
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF to Document Converter</h1>
          <p className="text-lg text-muted-foreground">
            Convert PDF files to editable document formats
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
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Output Format</label>
                <Select value={format} onValueChange={(value: 'txt' | 'docx') => setFormat(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="txt">TXT (Plain Text)</SelectItem>
                    <SelectItem value="docx">DOCX (Microsoft Word)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                      <FileText className="h-5 w-5" />
                      Convert to {format.toUpperCase()}
                    </>
                  )}
                </button>
              </div>

              {docUrl && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Conversion Complete!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your PDF has been converted to {format.toUpperCase()}
                    </p>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Download {format.toUpperCase()}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-muted/30 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">Output Formats</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>TXT:</strong> Plain text format, compatible with all text editors</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>DOCX:</strong> Microsoft Word format, editable in Word and compatible applications</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
