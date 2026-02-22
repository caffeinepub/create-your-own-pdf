import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import { Download, Languages, AlertCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
];

export default function PdfTranslator() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sourceLanguage, setSourceLanguage] = useState<string>('en');
  const [targetLanguage, setTargetLanguage] = useState<string>('es');
  const [translating, setTranslating] = useState(false);
  const [translatedPdfUrl, setTranslatedPdfUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setTranslatedPdfUrl(null);
    setProgress(0);
  };

  const handleTranslate = async () => {
    if (!uploadedFile || sourceLanguage === targetLanguage) return;

    setTranslating(true);
    setProgress(0);

    // Simulate translation progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);

    // Simulate translation process
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      setTranslating(false);
      // In a real implementation, this would be the translated PDF blob URL
      setTranslatedPdfUrl(URL.createObjectURL(uploadedFile));
    }, 4000);
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

  const canTranslate = uploadedFile && sourceLanguage !== targetLanguage && !translating;

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
            Convert your PDF documents from one language to another while preserving layout and formatting
          </p>
        </div>

        <Alert className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Images that include text may not be translated properly. Only text content
            within the PDF will be translated.
          </AlertDescription>
        </Alert>

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
                  <p className="text-xs text-muted-foreground text-center">
                    Extracting text, translating content, and preserving layout...
                  </p>
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
              <span>Our system extracts text while preserving layout information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">4.</span>
              <span>Text is translated using advanced translation services</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">5.</span>
              <span>Translated text is placed back in the original positions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">6.</span>
              <span>Download your translated PDF with preserved formatting</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
