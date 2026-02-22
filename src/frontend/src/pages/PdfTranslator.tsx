import { useState, useEffect } from 'react';
import FileUploader from '../components/FileUploader';
import { Download, Languages, AlertCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { translateTextInChunks } from '../utils/aiTranslator';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese (Simplified)' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
];

// Type definitions for dynamically loaded libraries
declare global {
  interface Window {
    pdfjsLib: any;
    PDFLib: any;
  }
}

export default function PdfTranslator() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string>('en');
  const [targetLanguage, setTargetLanguage] = useState<string>('es');
  const [translating, setTranslating] = useState(false);
  const [translatedPdfUrl, setTranslatedPdfUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [librariesLoaded, setLibrariesLoaded] = useState(false);

  useEffect(() => {
    // Load PDF.js and pdf-lib from CDN
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

          // Configure worker
          if (window.pdfjsLib) {
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = 
              'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          }
        }

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

        setLibrariesLoaded(true);
      } catch (err) {
        console.error('Failed to load PDF libraries:', err);
        setError('Failed to load required libraries. Please refresh the page.');
      }
    };

    loadLibraries();
  }, []);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setTranslatedPdfUrl(null);
    setProgress(0);
    setProgressMessage('');
    setError(null);
  };

  const handleTranslate = async () => {
    if (!uploadedFile || sourceLanguage === targetLanguage || !librariesLoaded) return;

    setTranslating(true);
    setProgress(0);
    setProgressMessage('Initializing translation...');
    setError(null);

    try {
      const pdfjsLib = window.pdfjsLib;
      const { PDFDocument, rgb, StandardFonts } = window.PDFLib;

      // Step 1: Read PDF file
      setProgress(5);
      setProgressMessage('Reading PDF file...');
      const arrayBuffer = await uploadedFile.arrayBuffer();
      
      // Step 2: Extract text from PDF
      setProgress(10);
      setProgressMessage('Extracting text from PDF...');
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      
      const textPages: string[] = [];
      const totalPages = pdfDoc.numPages;
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        const page = await pdfDoc.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .filter((str: string) => str.trim().length > 0)
          .join(' ');
        
        textPages.push(pageText);
        setProgress(10 + (pageNum / totalPages) * 20);
        setProgressMessage(`Extracting text from page ${pageNum} of ${totalPages}...`);
      }

      // Check if we extracted any text
      const totalText = textPages.join(' ').trim();
      if (!totalText) {
        throw new Error('No text content found in the PDF. The PDF might contain only images or be empty.');
      }

      // Step 3: Translate text using AI
      setProgress(30);
      setProgressMessage('Translating content with AI...');
      const translatedPages: string[] = [];
      
      for (let i = 0; i < textPages.length; i++) {
        const pageText = textPages[i];
        
        if (pageText.trim()) {
          try {
            setProgressMessage(`Translating page ${i + 1} of ${totalPages}...`);
            
            const translated = await translateTextInChunks(
              pageText,
              sourceLanguage,
              targetLanguage,
              500,
              (chunkProgress) => {
                const pageProgress = 30 + ((i + chunkProgress) / textPages.length) * 50;
                setProgress(Math.round(pageProgress));
              }
            );
            
            translatedPages.push(translated);
          } catch (err) {
            console.error(`Failed to translate page ${i + 1}:`, err);
            throw new Error(`Translation failed on page ${i + 1}. Please try again or check your internet connection.`);
          }
        } else {
          translatedPages.push('');
        }
      }

      // Step 4: Create new PDF with translated text
      setProgress(80);
      setProgressMessage('Creating translated PDF...');
      const newPdfDoc = await PDFDocument.create();
      const font = await newPdfDoc.embedFont(StandardFonts.Helvetica);
      
      for (let i = 0; i < translatedPages.length; i++) {
        const page = newPdfDoc.addPage([595, 842]); // A4 size
        const { width, height } = page.getSize();
        const fontSize = 12;
        const margin = 50;
        const maxWidth = width - 2 * margin;
        const lineHeight = fontSize * 1.5;
        
        // Wrap text to fit page width
        const words = translatedPages[i].split(' ');
        const lines: string[] = [];
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const textWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (textWidth > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        if (currentLine) {
          lines.push(currentLine);
        }
        
        // Draw text on page
        let yPosition = height - margin;
        for (const line of lines) {
          if (yPosition < margin) {
            // If we run out of space, add a new page
            const newPage = newPdfDoc.addPage([595, 842]);
            yPosition = newPage.getSize().height - margin;
          }
          
          page.drawText(line, {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: font,
            color: rgb(0, 0, 0),
          });
          
          yPosition -= lineHeight;
        }
        
        setProgress(80 + ((i + 1) / translatedPages.length) * 15);
        setProgressMessage(`Formatting page ${i + 1} of ${totalPages}...`);
      }

      // Step 5: Save PDF
      setProgress(95);
      setProgressMessage('Finalizing PDF...');
      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      setTranslatedPdfUrl(url);
      setProgress(100);
      setProgressMessage('Translation complete!');
      setTranslating(false);
    } catch (err) {
      console.error('Translation error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to translate PDF. Please try again.';
      setError(errorMessage);
      setTranslating(false);
      setProgress(0);
      setProgressMessage('');
    }
  };

  const handleDownload = () => {
    if (!translatedPdfUrl || !uploadedFile) return;

    const link = document.createElement('a');
    link.href = translatedPdfUrl;
    const originalName = uploadedFile.name.replace('.pdf', '');
    const targetLangName = LANGUAGES.find((l) => l.code === targetLanguage)?.name || targetLanguage;
    link.download = `${originalName}_${targetLangName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const canTranslate = uploadedFile && sourceLanguage !== targetLanguage && !translating && librariesLoaded;

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/translate-icon.dim_128x128.png"
              alt="PDF Translator"
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF Translator</h1>
          <p className="text-lg text-muted-foreground">
            Convert your PDF documents from one language to another using AI-powered translation
          </p>
        </div>

        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> This translator uses AI-powered translation for accurate results. 
            Images with text will not be translated - only the text content within the PDF.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!librariesLoaded && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>Loading PDF libraries...</AlertDescription>
          </Alert>
        )}

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".pdf,application/pdf"
            onFileSelect={handleFileUpload}
            maxSize={50 * 1024 * 1024}
            label="Upload PDF File"
          />

          {uploadedFile && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Source Language</label>
                  <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select source language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target Language</label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select target language" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {sourceLanguage === targetLanguage && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Source and target languages must be different
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-center">
                <button
                  onClick={handleTranslate}
                  disabled={!canTranslate}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  {translating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    <>
                      <Languages className="h-5 w-5" />
                      Translate PDF
                    </>
                  )}
                </button>
              </div>

              {translating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Translation Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  {progressMessage && (
                    <p className="text-xs text-muted-foreground text-center">
                      {progressMessage}
                    </p>
                  )}
                </div>
              )}

              {translatedPdfUrl && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Languages className="h-5 w-5 text-primary" />
                        Translation Complete
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Your PDF has been translated from{' '}
                        {LANGUAGES.find((l) => l.code === sourceLanguage)?.name} to{' '}
                        {LANGUAGES.find((l) => l.code === targetLanguage)?.name}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownload}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="h-5 w-5" />
                    Download Translated PDF
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
              <span>Upload your PDF document in the source language</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>Select the source and target languages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>Our AI extracts all text content from your PDF</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Text is translated using advanced AI translation technology</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">5.</span>
              <span>A new PDF is generated with the translated content</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">6.</span>
              <span>Download your translated PDF instantly</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
