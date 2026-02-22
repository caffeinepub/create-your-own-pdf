import { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import { Download, Loader2, FileText } from 'lucide-react';

declare global {
  interface Window {
    PDFLib: any;
    mammoth: any;
  }
}

export default function DocToPdfConverter() {
  const [docFile, setDocFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);

  useEffect(() => {
    const loadLibraries = async () => {
      try {
        // Load pdf-lib
        if (!window.PDFLib) {
          const pdflibScript = document.createElement('script');
          pdflibScript.src = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
          pdflibScript.async = true;
          document.head.appendChild(pdflibScript);
          
          await new Promise((resolve, reject) => {
            pdflibScript.onload = resolve;
            pdflibScript.onerror = reject;
          });
        }

        // Load mammoth for DOCX parsing
        if (!window.mammoth) {
          const mammothScript = document.createElement('script');
          mammothScript.src = 'https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js';
          mammothScript.async = true;
          document.head.appendChild(mammothScript);
          
          await new Promise((resolve, reject) => {
            mammothScript.onload = resolve;
            mammothScript.onerror = reject;
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
    setDocFile(file);
    setPdfUrl(null);
  };

  const extractTextFromTxt = async (file: File): Promise<string> => {
    return await file.text();
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleConvert = async () => {
    if (!docFile || !librariesLoaded) return;

    setConverting(true);
    try {
      const { PDFDocument, rgb, StandardFonts } = window.PDFLib;
      
      let text = '';
      
      // Extract text based on file type
      if (docFile.type === 'text/plain' || docFile.name.endsWith('.txt')) {
        text = await extractTextFromTxt(docFile);
      } else if (
        docFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        docFile.name.endsWith('.docx')
      ) {
        text = await extractTextFromDocx(docFile);
      } else if (docFile.name.endsWith('.rtf')) {
        // For RTF, treat as plain text (basic support)
        text = await extractTextFromTxt(docFile);
      } else {
        throw new Error('Unsupported file format');
      }

      // Create PDF
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      const fontSize = 12;
      const margin = 50;
      const lineHeight = fontSize * 1.5;
      
      let page = pdfDoc.addPage([595.28, 841.89]); // A4 size
      let { width, height } = page.getSize();
      let yPosition = height - margin;
      const maxWidth = width - 2 * margin;
      
      // Split text into lines and wrap
      const paragraphs = text.split('\n');
      
      for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
          yPosition -= lineHeight;
          if (yPosition < margin) {
            page = pdfDoc.addPage([595.28, 841.89]);
            yPosition = page.getSize().height - margin;
          }
          continue;
        }
        
        const words = paragraph.split(' ');
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (textWidth > maxWidth && currentLine) {
            // Draw current line
            page.drawText(currentLine, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
            
            yPosition -= lineHeight;
            if (yPosition < margin) {
              page = pdfDoc.addPage([595.28, 841.89]);
              yPosition = page.getSize().height - margin;
            }
            
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        // Draw remaining text
        if (currentLine) {
          page.drawText(currentLine, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          
          yPosition -= lineHeight;
          if (yPosition < margin) {
            page = pdfDoc.addPage([595.28, 841.89]);
            yPosition = page.getSize().height - margin;
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error converting document to PDF:', error);
      alert('Failed to convert document to PDF. Please try again.');
    } finally {
      setConverting(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl || !docFile) return;

    const link = document.createElement('a');
    link.href = pdfUrl;
    const originalName = docFile.name.replace(/\.(docx?|txt|rtf)$/i, '');
    link.download = `${originalName}.pdf`;
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
              src="/assets/generated/icon-doc-to-pdf.dim_64x64.png"
              alt="Document to PDF"
              className="w-16 h-16"
            />
          </div>
          <h1 className="text-4xl font-bold">Document to PDF Converter</h1>
          <p className="text-lg text-muted-foreground">
            Convert DOCX, TXT, and RTF documents to PDF format
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".docx,.txt,.rtf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onFileSelect={handleFileSelect}
            maxSize={10 * 1024 * 1024}
            label="Upload Document"
          />

          {docFile && (
            <div className="space-y-4">
              <div className="text-center text-sm text-muted-foreground">
                Selected: {docFile.name}
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
                      Convert to PDF
                    </>
                  )}
                </button>
              </div>

              {pdfUrl && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Conversion Complete!</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Your document has been converted to PDF
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
            </div>
          )}
        </div>

        <div className="bg-muted/30 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg">Supported Formats</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>DOCX:</strong> Microsoft Word documents with text extraction</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>TXT:</strong> Plain text files</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span><strong>RTF:</strong> Rich Text Format documents</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
