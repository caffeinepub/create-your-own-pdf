import { useState } from 'react';
import FileUploader from '../components/FileUploader';
import { Lock, Unlock, FileDown } from 'lucide-react';

export default function PdfUnlock() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setUnlocked(false);
    setError('');
    setPassword('');
  };

  const handleUnlock = async () => {
    if (!uploadedFile || !password) return;

    setUnlocking(true);
    setError('');

    // Placeholder for PDF unlocking
    setTimeout(() => {
      setUnlocking(false);
      // Simulate success/failure
      if (password.length > 0) {
        setUnlocked(true);
      } else {
        setError('Incorrect password. Please try again.');
      }
    }, 2000);
  };

  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/icon-unlock-pdf.dim_64x64.png"
              alt="Unlock PDF"
              className="w-20 h-20"
            />
          </div>
          <h1 className="text-4xl font-bold">PDF Unlock</h1>
          <p className="text-lg text-muted-foreground">
            Remove password protection from encrypted PDFs
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 space-y-6">
          <FileUploader
            accept=".pdf"
            onFileSelect={handleFileUpload}
            maxSize={50 * 1024 * 1024}
            label="Upload Password-Protected PDF"
          />

          {uploadedFile && !unlocked && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Enter PDF Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-center">
                <button
                  onClick={handleUnlock}
                  disabled={unlocking || !password}
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {unlocking ? 'Unlocking...' : 'Unlock PDF'}
                </button>
              </div>
            </div>
          )}

          {unlocked && (
            <div className="text-center space-y-4">
              <div className="p-6 bg-primary/10 rounded-lg">
                <Unlock className="h-12 w-12 text-primary mx-auto mb-3" />
                <p className="text-lg font-medium">PDF Unlocked Successfully!</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Password protection has been removed
                </p>
              </div>
              <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                <FileDown className="h-5 w-5 inline mr-2" />
                Download Unlocked PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
